import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

/**
 * Email abstraction.
 * - SMTP configured (SMTP_HOST set — local Mailpit via docker compose, or any
 *   real provider in production) → send a real email.
 * - Otherwise → log the OTP to the console (take-home development fallback).
 */
export interface EmailService {
  sendOtp(email: string, code: string): Promise<void>;
}

export class DevelopmentEmailService implements EmailService {
  async sendOtp(email: string, code: string): Promise<void> {
    console.log(`[DEV EMAIL] OTP for ${email}: ${code} (expires in ${config.otpExpiryMinutes} min)`);
  }
}

export class SmtpEmailService implements EmailService {
  private transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass } : undefined,
  });

  async sendOtp(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: config.smtpFrom,
      to: email,
      subject: `Your PadosiPro code is ${code}`,
      text: `Your PadosiPro verification code is ${code}. It expires in ${config.otpExpiryMinutes} minutes.`,
    });
    // Console echo stays so local runs are debuggable even with Mailpit up.
    if (!config.isProd) {
      console.log(`[DEV EMAIL] OTP for ${email}: ${code} (also sent via SMTP)`);
    }
  }
}

export function getEmailService(): EmailService {
  return config.smtpHost ? new SmtpEmailService() : new DevelopmentEmailService();
}
