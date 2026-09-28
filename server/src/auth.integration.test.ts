/**
 * API integration tests for the risky auth logic:
 * OTP expiry, wrong-attempt limits, password storage and login rules.
 *
 * Needs an isolated database (never the dev one):
 *
 *   docker exec padosipro-postgres createdb -U padosi padosipro_test
 *   TEST_DATABASE_URL="postgresql://padosi:padosi@localhost:5432/padosipro_test?schema=public" \
 *     npx prisma migrate deploy
 *   TEST_DATABASE_URL="postgresql://padosi:padosi@localhost:5432/padosipro_test?schema=public" \
 *     npm run test:integration
 *
 * Without TEST_DATABASE_URL the file exits green with zero tests.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import type { AddressInfo } from 'node:net';

if (!process.env.TEST_DATABASE_URL) {
  console.warn('SKIP auth integration tests: set TEST_DATABASE_URL (see file header).');
  process.exit(0);
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

// Loaded lazily so DATABASE_URL is set first (and to keep CJS-friendly, no top-level await).
let buildApp: any;
let prisma: any;

const RUN = Date.now().toString(36);
let base = '';
let mobileSeq = 900000000;
const nextMobile = () => `9${String(mobileSeq++).padStart(9, '0')}`;
const email = (tag: string) => `itest-${RUN}-${tag}@example.com`;

async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  return { status: res.status, body: (await res.json().catch(() => ({}))) as any };
}

let server: any;

before(async () => {
  ({ buildApp } = await import('./app.js'));
  ({ prisma } = await import('./lib/prisma.js'));
  const app = buildApp();
  server = await new Promise<any>((resolve, reject) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
    s.on('error', reject);
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: `itest-${RUN}-` } } });
  await prisma.$disconnect();
  await new Promise<void>((resolve, reject) => server!.close((e: Error | undefined) => (e ? reject(e) : resolve())));
});

async function registerUnverified(tag: string, password = 'password-123') {
  const em = email(tag);
  const r = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: em, mobile: nextMobile(), password }),
  });
  assert.equal(r.status, 200, `register failed: ${JSON.stringify(r.body)}`);
  assert.match(r.body.devOtp, /^\d{6}$/);
  return { email: em, devOtp: r.body.devOtp as string };
}

describe('auth integration', () => {
  it('rejects bad register input', async () => {
    const badEmail = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'nope', mobile: '9876543210', password: 'password-123' }),
    });
    assert.equal(badEmail.status, 400);
    const shortPw = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: email('x'), mobile: nextMobile(), password: 'short' }),
    });
    assert.equal(shortPw.status, 400);
  });

  it('verifies a correct OTP and issues a token', async () => {
    const { email: em, devOtp } = await registerUnverified('happy');
    const v = await api('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email: em, code: devOtp }) });
    assert.equal(v.status, 200);
    assert.ok(v.body.token);
  });

  it('enforces the wrong-attempt limit', async () => {
    const { email: em } = await registerUnverified('attempts');
    for (let i = 0; i < 5; i++) {
      const w = await api('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email: em, code: '000000' }) });
      assert.equal(w.status, 400);
    }
    const blocked = await api('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: em, code: '000000' }),
    });
    assert.equal(blocked.status, 429);
  });

  it('rejects an expired OTP', async () => {
    const { email: em, devOtp } = await registerUnverified('expired');
    const user = await prisma.user.findUniqueOrThrow({ where: { email: em } });
    await prisma.otpCode.updateMany({
      where: { userId: user.id, used: false },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
    const v = await api('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email: em, code: devOtp }) });
    assert.equal(v.status, 400);
    assert.match(v.body.error, /expired/);
  });

  it('stores only a bcrypt hash of the password', async () => {
    const { email: em } = await registerUnverified('hashcheck', 's3cret-pw-99');
    const row = await prisma.user.findUniqueOrThrow({ where: { email: em } });
    assert.ok(row.passwordHash);
    assert.ok(!row.passwordHash.includes('s3cret-pw-99'));
    assert.equal(await bcrypt.compare('s3cret-pw-99', row.passwordHash), true);
  });

  it('applies login rules: verified ok, unverified 403, wrong password 401', async () => {
    const { email: em } = await registerUnverified('loginrules', 'right-pw-123');
    const unverified = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: em, password: 'right-pw-123' }),
    });
    assert.equal(unverified.status, 403);
    assert.equal(unverified.body.needsVerification, true);

    const wrongPw = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: em, password: 'wrong-pw' }),
    });
    assert.equal(wrongPw.status, 401);

    const freshUser = await prisma.user.findUniqueOrThrow({ where: { email: em } });
    await prisma.otpCode.updateMany({ where: { userId: freshUser.id }, data: { used: true } });
    const fresh = await api('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email: em }) });
    const v = await api('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: em, code: fresh.body.devOtp }),
    });
    assert.equal(v.status, 200);

    const ok = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: em, password: 'right-pw-123' }),
    });
    assert.equal(ok.status, 200);
    assert.ok(ok.body.token);
  });
});
