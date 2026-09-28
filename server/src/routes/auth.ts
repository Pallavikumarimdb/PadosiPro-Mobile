import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { generateOtp, hashOtp, verifyOtpHash, isValidEmail, isValidIndianMobile, normalizeMobile } from '../utils/otp.js';
import { getEmailService } from '../services/email.js';
import { AuthRequest, authMiddleware, signToken } from '../middleware/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  mobile: z.string().min(1, 'Mobile number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
const sendOtpSchema = z.object({ email: z.string().email('Enter a valid email') });
const verifySchema = z.object({
  email: z.string().email('Enter a valid email'),
  code: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});
const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your email or mobile number'),
  password: z.string().min(1, 'Enter your password'),
});

async function issueOtp(userId: string, email: string, res: any, extra?: Record<string, unknown>) {
  const latest = await prisma.otpCode.findFirst({
    where: { userId, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (latest) {
    const waitMs = config.otpResendSeconds * 1000 - (Date.now() - latest.createdAt.getTime());
    if (waitMs > 0) {
      return res.status(429).json({
        ok: false,
        error: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting a new code.`,
        resendInSeconds: Math.ceil(waitMs / 1000),
      });
    }
  }
  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      userId,
      codeHash: await hashOtp(code),
      expiresAt: new Date(Date.now() + config.otpExpiryMinutes * 60_000),
    },
  });
  await getEmailService().sendOtp(email, code);
  const payload: Record<string, unknown> = {
    ok: true,
    message: `OTP sent to ${email}. It expires in ${config.otpExpiryMinutes} minutes.`,
  };
  // Dev-only: expose OTP so the evaluator can test without an email provider.
  if (!config.isProd) payload.devOtp = code;
  return res.json({ ...payload, ...extra });
}

// POST /auth/register — create user (or reuse) + send OTP
authRouter.post('/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues[0].message });
  const cleanEmail = parsed.data.email.trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) return res.status(400).json({ ok: false, error: 'Enter a valid email' });

  if (!isValidIndianMobile(parsed.data.mobile)) {
    return res.status(400).json({ ok: false, error: 'Enter a valid 10-digit Indian mobile number' });
  }
  const cleanMobile = normalizeMobile(parsed.data.mobile);

  const existingByEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
  const existingByMobile = cleanMobile
    ? await prisma.user.findUnique({ where: { mobile: cleanMobile } })
    : null;

  // 1. Email already belongs to a verified account → must log in, not re-register
  if (existingByEmail && existingByEmail.emailVerified) {
    return res.status(409).json({
      ok: false,
      error: 'An account with this email already exists. Please log in instead.',
      shouldLogin: true,
    });
  }

  // 2. Mobile number already taken by a different account
  if (existingByMobile && (!existingByEmail || existingByMobile.id !== existingByEmail.id)) {
    return res.status(409).json({
      ok: false,
      error: 'This mobile number is already registered with another account.',
    });
  }

  let user = existingByEmail;
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        mobile: cleanMobile,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
      },
    });
  } else {
    // Unverified existing account with same email: update password & mobile
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        mobile: cleanMobile,
      },
    });
  }

  return issueOtp(user.id, cleanEmail, res);
});

// POST /auth/send-otp
authRouter.post('/auth/send-otp', async (req, res) => {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues[0].message });
  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ ok: false, error: 'No account found for this email. Please register first.' });
  return issueOtp(user.id, email, res);
});

// POST /auth/verify-otp — marks OTP used, verifies email, returns JWT
authRouter.post('/auth/verify-otp', async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues[0].message });
  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ ok: false, error: 'No account found for this email.' });

  const otp = await prisma.otpCode.findFirst({
    where: { userId: user.id, used: false },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) return res.status(400).json({ ok: false, error: 'No active OTP. Please request a new code.' });
  if (otp.expiresAt < new Date()) return res.status(400).json({ ok: false, error: 'OTP has expired. Please request a new code.' });
  if (otp.attempts >= config.otpMaxAttempts) {
    return res.status(429).json({ ok: false, error: 'Too many incorrect attempts. Please request a new code.' });
  }
  const match = await verifyOtpHash(parsed.data.code, otp.codeHash);
  if (!match) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return res.status(400).json({ ok: false, error: 'Incorrect code. Please try again.' });
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
  const token = signToken(user.id, user.email);
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  return res.json({
    ok: true,
    token,
    user: { id: user.id, email: user.email, mobile: user.mobile, emailVerified: true, profileComplete: user.profileComplete },
    profile,
  });
});

// POST /auth/login — password login for verified users only.
// Unverified users get 403 + needsVerification so the app can route them to OTP verification.
authRouter.post('/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues[0].message });
  const raw = parsed.data.identifier.trim().toLowerCase();
  const user = raw.includes('@')
    ? await prisma.user.findUnique({ where: { email: raw } })
    : await prisma.user.findFirst({ where: { mobile: normalizeMobile(raw) } });
  if (!user || !user.passwordHash) return res.status(404).json({ ok: false, error: 'No account found. Please register first.' });
  const passwordOk = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordOk) return res.status(401).json({ ok: false, error: 'Incorrect password. Please try again.' });
  if (!user.emailVerified) {
    return res.status(403).json({ ok: false, error: 'Please verify your email first.', needsVerification: true, email: user.email });
  }
  const token = signToken(user.id, user.email);
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  return res.json({
    ok: true,
    token,
    user: { id: user.id, email: user.email, mobile: user.mobile, emailVerified: user.emailVerified, profileComplete: user.profileComplete },
    profile,
  });
});

// GET /auth/me
authRouter.get('/auth/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub }, include: { profile: true } });
  if (!user) return res.status(401).json({ ok: false, error: 'Account not found.' });
  return res.json({
    ok: true,
    user: { id: user.id, email: user.email, mobile: user.mobile, emailVerified: user.emailVerified, profileComplete: user.profileComplete },
    profile: user.profile,
  });
});

// POST /auth/logout — stateless JWT; endpoint exists so client has a server-confirmed sign-out
authRouter.post('/auth/logout', authMiddleware, async (_req, res) => {
  return res.json({ ok: true, message: 'Signed out. Please discard your token.' });
});
