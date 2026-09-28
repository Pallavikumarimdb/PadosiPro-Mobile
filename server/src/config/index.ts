import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable must be set in production');
    }
    return secret ?? 'dev-only-change-me-min-32-chars';
  })(),
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES ?? 10),
  otpResendSeconds: Number(process.env.OTP_RESEND_SECONDS ?? 30),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 1025),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? 'PadosiPro <otp@padosipro.local>',
};
