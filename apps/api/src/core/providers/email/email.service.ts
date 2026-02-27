import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as emailjs from '@emailjs/nodejs';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const publicKey = this.configService.get<string>('EMAILJS_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('EMAILJS_PRIVATE_KEY');

    if (publicKey && privateKey) {
      emailjs.init({
        publicKey,
        privateKey,
      });
    } else {
      this.logger.warn(
        'EmailJS credentials are not fully configured. Email sending might fail.',
      );
    }
  }

  /**
   * Generates a numeric OTP code
   */
  generateOtp(length: number): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[crypto.randomInt(0, 10)];
    }
    return otp;
  }

  /**
   * Sends an email using EmailJS
   */
  async sendEmail(
    templateParams: Record<string, unknown>,
    serviceId?: string,
    templateId?: string,
  ) {
    const sId =
      serviceId || this.configService.get<string>('EMAILJS_SERVICE_ID');
    const tId =
      templateId || this.configService.get<string>('EMAILJS_TEMPLATE_ID');

    if (!sId || !tId) {
      this.logger.error('Service ID or Template ID is missing');
      throw new Error(
        'EmailJS configuration error: missing Service ID or Template ID',
      );
    }

    try {
      const response = await emailjs.send(sId, tId, templateParams);
      this.logger.log(
        `Email sent successfully: ${response.status} ${response.text}`,
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to send email via EmailJS', error);
      throw error;
    }
  }

  /**
   * Helper to send OTP email
   */
  async sendOTP(
    email: string,
    firstName: string,
    subject: string,
    otpCode: string,
    expiry: string,
  ) {
    return this.sendEmail({
      to_email: email,
      to_name: firstName,
      subject,
      otp_code: otpCode,
      expiry_time: expiry,
    });
  }

  /**
   * Helper to send password reset email
   */
  async sendPasswordReset(
    email: string,
    firstName: string,
    subject: string,
    resetUrl: string,
  ) {
    return this.sendEmail({
      to_email: email,
      to_name: firstName,
      subject,
      reset_url: resetUrl,
    });
  }

  /**
   * Helper to send password reset success email
   */
  async sendPasswordResetSuccess(
    email: string,
    firstName: string,
    subject: string,
  ) {
    return this.sendEmail({
      to_email: email,
      to_name: firstName,
      subject,
    });
  }
}
