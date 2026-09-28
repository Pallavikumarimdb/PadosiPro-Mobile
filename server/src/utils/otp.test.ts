import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { generateOtp, hashOtp, isValidEmail, isValidIndianMobile, normalizeMobile, verifyOtpHash } from './otp.js';

describe('email validation', () => {
  it('accepts valid emails', () => {
    assert.equal(isValidEmail('you@example.com'), true);
  });
  it('rejects invalid emails', () => {
    assert.equal(isValidEmail('not-an-email'), false);
    assert.equal(isValidEmail(''), false);
  });
});

describe('indian mobile validation', () => {
  it('accepts 10-digit numbers starting 6-9', () => {
    assert.equal(isValidIndianMobile('9876543210'), true);
    assert.equal(isValidIndianMobile('+91 98765 43210'), true);
  });
  it('rejects bad numbers', () => {
    assert.equal(isValidIndianMobile('12345'), false);
    assert.equal(isValidIndianMobile('5876543210'), false);
    assert.equal(isValidIndianMobile(''), false);
  });
  it('normalizes +91 prefix', () => {
    assert.equal(normalizeMobile('+91 98765 43210'), '9876543210');
  });
});

describe('otp generation', () => {
  it('produces a 6-digit numeric code', () => {
    for (let i = 0; i < 50; i++) {
      assert.match(generateOtp(), /^\d{6}$/);
    }
  });
  it('does not repeat constantly', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateOtp()));
    assert.ok(codes.size > 1);
  });
});

describe('otp hashing', () => {
  it('verifies a correct code and rejects a wrong one', async () => {
    const hash = await hashOtp('482913');
    assert.equal(await verifyOtpHash('482913', hash), true);
    assert.equal(await verifyOtpHash('000000', hash), false);
  });
  it('never stores the code itself', async () => {
    const hash = await hashOtp('482913');
    assert.ok(!hash.includes('482913'));
  });
});

describe('password hashing', () => {
  it('stores bcrypt hashes, never plaintext', async () => {
    const hash = await bcrypt.hash('correct-horse-123', 10);
    assert.ok(!hash.includes('correct-horse-123'));
    assert.equal(await bcrypt.compare('correct-horse-123', hash), true);
    assert.equal(await bcrypt.compare('wrong-password', hash), false);
  });
});
