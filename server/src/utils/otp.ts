import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyOtpHash(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Valid Indian mobile: 10 digits starting 6-9, optional +91/0 prefix stripped before check. */
export function normalizeMobile(input: string): string {
  return input.replace(/[\s-]/g, '').replace(/^\+91/, '').replace(/^0/, '');
}

export function isValidIndianMobile(input: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizeMobile(input));
}
