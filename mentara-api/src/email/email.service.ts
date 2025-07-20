import { Injectable, Logger } from '@nestjs/common';
import emailjs from '@emailjs/nodejs';
import { type EmailResponse } from 'mentara-commons';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private isInitialized = false;

  // EmailJS configuration
  private readonly config = {
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
    privateKey: process.env.EMAILJS_PRIVATE_KEY || '',
  };

  // HTML templates for different email types (constant per function)
  private readonly OTP_HTML_TEMPLATE = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #8B5CF6; text-align: center; margin-bottom: 30px;">Mentara - Email Verification</h1>
        <h2 style="color: #1F2937; text-align: center;">Your verification code is:</h2>
        <div style="background-color: #8B5CF6; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 4px;">{{otp_code}}</div>
        <p style="color: #4B5563; text-align: center; margin: 20px 0;">This code will expire in {{expires_in}}.</p>
        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">If you didn't request this verification, please ignore this email.</p>
      </div>
    </div>`;

  private readonly THERAPIST_REGISTRATION_SUCCESS_HTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #10B981; text-align: center; margin-bottom: 30px;">Welcome to Mentara!</h1>
        <p style="color: #1F2937; font-size: 16px;">Thank you for registering as a therapist with Mentara.</p>
        <p style="color: #4B5563;">Your application has been received and is currently under review. We will notify you once the review process is complete.</p>
        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0;">
          <p style="color: #065F46; margin: 0; font-weight: 500;">Next Steps:</p>
          <ul style="color: #065F46; margin: 10px 0;">
            <li>Complete your profile if you haven't already</li>
            <li>Upload required documents</li>
            <li>Wait for admin approval</li>
          </ul>
        </div>
        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">Thank you for joining our mental health community.</p>
      </div>
    </div>`;

  private readonly THERAPIST_APPROVED_HTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #10B981; text-align: center; margin-bottom: 30px;">🎉 Congratulations! You're Approved!</h1>
        <p style="color: #1F2937; font-size: 16px;">Great news! Your therapist application has been approved.</p>
        <p style="color: #4B5563;">You can now start accepting clients and providing mental health services through the Mentara platform.</p>
        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0;">
          <p style="color: #065F46; margin: 0; font-weight: 500;">You can now:</p>
          <ul style="color: #065F46; margin: 10px 0;">
            <li>Complete your therapist profile</li>
            <li>Set your availability</li>
            <li>Start accepting client bookings</li>
            <li>Access the therapist dashboard</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{app_url}}/therapist/dashboard" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Go to Dashboard</a>
        </div>
        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">Welcome to the Mentara therapist community!</p>
      </div>
    </div>`;

  private readonly THERAPIST_DENIED_HTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #EF4444; text-align: center; margin-bottom: 30px;">Application Update</h1>
        <p style="color: #1F2937; font-size: 16px;">Thank you for your interest in becoming a therapist with Mentara.</p>
        <p style="color: #4B5563;">After careful review, we regret to inform you that your application has not been approved at this time.</p>
        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0;">
          <p style="color: #991B1B; margin: 0; font-weight: 500;">Common reasons for denial:</p>
          <ul style="color: #991B1B; margin: 10px 0;">
            <li>Incomplete documentation</li>
            <li>Licensing requirements not met</li>
            <li>Application did not meet our current criteria</li>
          </ul>
        </div>
        <p style="color: #4B5563;">You're welcome to reapply in the future once any issues have been addressed.</p>
        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">Thank you for your understanding.</p>
      </div>
    </div>`;

  constructor() {
    this.initializeEmailJS();
  }

  private initializeEmailJS() {
    try {
      if (this.config.publicKey) {
        const initConfig: any = {
          publicKey: this.config.publicKey,
        };

        // Add private key if available for enhanced security
        if (this.config.privateKey) {
          initConfig.privateKey = this.config.privateKey;
          this.logger.log(
            'EmailJS initializing with private key for enhanced security',
          );
        }

        emailjs.init(initConfig);
        this.isInitialized = true;
        this.logger.log('EmailJS initialized successfully');
      } else {
        this.logger.warn(
          'EmailJS public key not found in environment variables',
        );
      }
    } catch (error) {
      this.logger.error('Failed to initialize EmailJS:', error);
    }
  }

  /**
   * Send OTP email for registration or verification
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param subject - Email subject line
   * @param otpCode - OTP code (optional, will generate if not provided)
   * @param expiresIn - Expiry time (optional, defaults to "10 minutes")
   * @returns Promise with operation result
   */
  async sendOTP(
    email: string,
    name: string,
    subject: string,
    otpCode?: string,
    expiresIn: string = '10 minutes',
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const otp = otpCode || this.generateOtp(6);

      const templateParams = {
        email,
        name,
        subject,
        html: this.OTP_HTML_TEMPLATE,
        otp_code: otp,
        expires_in: expiresIn,
        app_url: process.env.APP_URL || 'https://mentara.com',
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ OTP email sent successfully:', { email, subject });

      return {
        status: 'success',
        message: 'OTP email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('❌ Failed to send OTP email:', errorMessage);

      return {
        status: 'error',
        message: `Failed to send OTP email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send therapist registration success email
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param subject - Email subject line
   * @returns Promise with operation result
   */
  async sendTherapistRegistrationSuccess(
    email: string,
    name: string,
    subject: string,
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const templateParams = {
        email,
        name,
        subject,
        html: this.THERAPIST_REGISTRATION_SUCCESS_HTML,
        app_url: process.env.APP_URL || 'https://mentara.com',
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Therapist registration success email sent:', {
        email,
        subject,
      });

      return {
        status: 'success',
        message: 'Therapist registration success email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send therapist registration success email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send therapist registration success email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send therapist approved email
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param subject - Email subject line
   * @returns Promise with operation result
   */
  async sendTherapistApproved(
    email: string,
    name: string,
    subject: string,
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const templateParams = {
        email,
        name,
        subject,
        html: this.THERAPIST_APPROVED_HTML,
        app_url: process.env.APP_URL || 'https://mentara.com',
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Therapist approved email sent:', { email, subject });

      return {
        status: 'success',
        message: 'Therapist approved email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send therapist approved email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send therapist approved email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send therapist denied email
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param subject - Email subject line
   * @returns Promise with operation result
   */
  async sendTherapistDenied(
    email: string,
    name: string,
    subject: string,
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const templateParams = {
        email,
        name,
        subject,
        html: this.THERAPIST_DENIED_HTML,
        app_url: process.env.APP_URL || 'https://mentara.com',
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Therapist denied email sent:', { email, subject });

      return {
        status: 'success',
        message: 'Therapist denied email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send therapist denied email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send therapist denied email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send password reset email
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param subject - Email subject line
   * @param resetLink - Password reset link
   * @returns Promise with operation result
   */
  async sendPasswordReset(
    email: string,
    name: string,
    subject: string,
    resetLink: string,
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    const PASSWORD_RESET_HTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #8B5CF6; text-align: center; margin-bottom: 30px;">Reset Your Password</h1>
          <p style="color: #1F2937; font-size: 16px;">We received a request to reset your password for your Mentara account.</p>
          <p style="color: #4B5563;">Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <p style="color: #6B7280; font-size: 14px;">For security reasons, this link will expire in 1 hour.</p>
        </div>
      </div>`;

    try {
      const templateParams = {
        email,
        name,
        subject,
        html: PASSWORD_RESET_HTML,
        reset_link: resetLink,
        app_url: process.env.APP_URL || 'https://mentara.com',
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Password reset email sent:', { email, subject });

      return {
        status: 'success',
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send password reset email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send password reset email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send password reset success confirmation email
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param subject - Email subject line
   * @returns Promise with operation result
   */
  async sendPasswordResetSuccess(
    email: string,
    name: string,
    subject: string,
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    const PASSWORD_RESET_SUCCESS_HTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #10B981; text-align: center; margin-bottom: 30px;">✅ Password Reset Successful</h1>
          <p style="color: #1F2937; font-size: 16px;">Your password has been successfully reset.</p>
          <p style="color: #4B5563;">You can now log in to your Mentara account using your new password.</p>
          <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0;">
            <p style="color: #065F46; margin: 0; font-weight: 500;">Security Tip:</p>
            <p style="color: #065F46; margin: 10px 0 0 0;">Make sure to use a strong, unique password and keep it secure.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{app_url}}/auth/login" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Login to Your Account</a>
          </div>
          <p style="color: #6B7280; font-size: 14px; text-align: center;">If you didn't make this change, please contact our support team immediately.</p>
        </div>
      </div>`;

    try {
      const templateParams = {
        email,
        name,
        subject,
        html: PASSWORD_RESET_SUCCESS_HTML,
        app_url: process.env.APP_URL || 'https://mentara.com',
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Password reset success email sent:', {
        email,
        subject,
      });

      return {
        status: 'success',
        message: 'Password reset success email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send password reset success email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send password reset success email: ${errorMessage}`,
      };
    }
  }

  /**
   * Generate OTP code
   */
  generateOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Format expiry time for email display
   */
  formatExpiryTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let timeString = `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (remainingMinutes > 0) {
      timeString += ` and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
    return timeString;
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus(): {
    isInitialized: boolean;
    hasServiceId: boolean;
    hasTemplateId: boolean;
    hasPublicKey: boolean;
    hasPrivateKey: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      hasServiceId: !!this.config.serviceId,
      hasTemplateId: !!this.config.templateId,
      hasPublicKey: !!this.config.publicKey,
      hasPrivateKey: !!this.config.privateKey,
    };
  }
}
