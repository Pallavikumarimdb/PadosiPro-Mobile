import { config } from '../config/index.js';

/** Email abstraction: dev logs OTP to console; production throws until wired. */
export interface EmailService {
  sendOtp(email: string, code: string): Promise<void>;
}

export class DevelopmentEmailService implements EmailService {
  async sendOtp(email: string, code: string): Promise<void> {
    console.log(`[DEV EMAIL] OTP for ${email}: ${code} (expires in ${config.otpExpiryMinutes} min)`);
  }
}

export class ProductionEmailService implements EmailService {
  async sendOtp(_email: string, _code: string): Promise<void> {
    throw new Error('ProductionEmailService not configured. Wire an SMTP/provider here.');
  }
}

export function getEmailService(): EmailService {
  return config.isProd ? new ProductionEmailService() : new DevelopmentEmailService();
}
