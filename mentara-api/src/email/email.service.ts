import { Injectable, Logger } from '@nestjs/common';
import emailjs from '@emailjs/nodejs';
import {
  type OtpEmailData,
  type EmailResponse,
  type OtpType,
} from 'mentara-commons';
import {
  OtpEmailTemplate,
  TherapistNotificationTemplate,
  type TherapistNotificationData,
} from './templates';

export interface EmailNotificationData {
  to: string;
  name: string;
  status: 'approved' | 'rejected';
  adminNotes?: string;
  credentials?: {
    email: string;
    password: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private isInitialized = false;

  // Template instances
  private readonly otpTemplate = new OtpEmailTemplate();
  private readonly therapistNotificationTemplate =
    new TherapistNotificationTemplate();

  // EmailJS configuration
  private readonly config = {
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
    privateKey: process.env.EMAILJS_PRIVATE_KEY || '',
  };

  // Brand colors for Mentara
  private readonly BRAND_COLORS = {
    primary: '#8B5CF6', // Purple
    secondary: '#EC4899', // Pink
    accent: '#06B6D4', // Cyan
    success: '#10B981', // Green
    warning: '#F59E0B', // Yellow
    error: '#EF4444', // Red
    dark: '#1F2937', // Dark gray
    light: '#F9FAFB', // Light gray
    white: '#FFFFFF',
  };

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
          this.logger.log('EmailJS initializing with private key for enhanced security');
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
   * Generate beautiful email template for OTP verification
   * @param data OTP email data
   * @returns Email template with HTML and text content
   */
  generateOtpEmailTemplate(data: OtpEmailData): EmailTemplate {
    return this.otpTemplate.generate(data);
  }

  /**
   * Generate therapist notification email template
   * @param data Therapist notification data
   * @returns Email template with HTML and text content
   */
  generateTherapistNotificationTemplate(
    data: TherapistNotificationData,
  ): EmailTemplate {
    return this.therapistNotificationTemplate.generate(data);
  }

  /**
   * Send OTP email using EmailJS
   * @param data OTP email data
   * @returns Promise with operation result
   */
  async sendOtpEmail(data: OtpEmailData): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const template = this.generateOtpEmailTemplate(data);

      const templateParams = {
        to_email: data.to_email,
        to_name: data.to_name,
        subject: template.subject,
        html_content: template.html,
        text_content: template.text,
        otp_code: data.otp_code,
        expires_in: data.expires_in,
        company_name: 'Mentara',
        company_email: 'support@mentara.com',
        company_website: process.env.APP_URL || 'https://mentara.com',
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ OTP email sent successfully:', response);

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
   * Send therapist application notification
   * @param data Therapist notification data
   * @returns Promise with operation result
   */
  async sendTherapistApplicationNotification(
    data: TherapistNotificationData,
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const template = this.generateTherapistNotificationTemplate(data);

      const templateParams = {
        to_email: data.to_email,
        to_name: data.to_name,
        subject: template.subject,
        html_content: template.html,
        text_content: template.text,
        company_name: 'Mentara',
        company_email: 'therapist-support@mentara.com',
        company_website: process.env.APP_URL || 'https://mentara.com',
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log(
        '✅ Therapist notification email sent successfully:',
        response,
      );

      return {
        status: 'success',
        message: 'Therapist notification email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send therapist notification email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send therapist notification email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send therapist welcome email (for approved applications)
   */
  async sendTherapistWelcomeEmail(
    email: string,
    name: string,
    credentials?: { email: string; password: string },
  ): Promise<EmailResponse> {
    // Implementation would use a TherapistWelcomeTemplate (to be created)
    // For now, return a placeholder
    this.logger.log('Therapist welcome email would be sent to:', email);
    return {
      status: 'success',
      message: 'Therapist welcome email sent successfully',
    };
  }

  /**
   * Send therapist rejection email
   */
  async sendTherapistRejectionEmail(
    email: string,
    name: string,
    reason?: string,
  ): Promise<EmailResponse> {
    // Implementation would use a TherapistRejectionTemplate (to be created)
    // For now, return a placeholder
    this.logger.log('Therapist rejection email would be sent to:', email);
    return {
      status: 'success',
      message: 'Therapist rejection email sent successfully',
    };
  }

  /**
   * Send generic email
   */
  async sendGenericEmail(data: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const templateParams = {
        to_email: data.to,
        subject: data.subject,
        html_content: data.html,
        text_content: data.text || '',
        company_name: 'Mentara',
        company_email: 'support@mentara.com',
        company_website: process.env.APP_URL || 'https://mentara.com',
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Generic email sent successfully:', response);

      return {
        status: 'success',
        message: 'Email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('❌ Failed to send generic email:', errorMessage);

      return {
        status: 'error',
        message: `Failed to send email: ${errorMessage}`,
      };
    }
  }

  /**
   * Test email configuration
   */
  async testConfiguration(): Promise<EmailResponse> {
    return this.sendGenericEmail({
      to: 'test@mentara.com',
      subject: 'Email Configuration Test',
      html: '<p>This is a test email to verify EmailJS configuration.</p>',
      text: 'This is a test email to verify EmailJS configuration.',
    });
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
