import { Injectable, Logger } from '@nestjs/common';
import emailjs from '@emailjs/nodejs';
import { type EmailResponse } from 'mentara-commons';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private isInitialized = false;

  // EmailJS configuration
  private readonly config = {
    serviceId: process.env.EMAILJS_SERVICE_ID ?? '',
    templateId: process.env.EMAILJS_TEMPLATE_ID ?? '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY ?? '',
    privateKey: process.env.EMAILJS_PRIVATE_KEY ?? '',
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
      const otp = otpCode ?? this.generateOtp(6);
      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #436B00; text-align: center; margin-bottom: 30px;">Mentara - Email Verification</h1>
        <h2 style="color: #1F2937; text-align: center;">Your verification code is:</h2>
        <div style="background-color: #436B00; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 4px;">${otp}</div>
        <p style="color: #4B5563; text-align: center; margin: 20px 0;">This code will expire in ${expiresIn}.</p>
        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">If you didn't request this verification, please ignore this email.</p>
      </div>
    </div>`;

      const templateParams = {
        email,
        name,
        subject,
        html,
        otp,
        expiresIn,
        appUrl: process.env.APP_URL ?? 'https://mentara.com',
      };

      await emailjs.send(
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
      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #10B981; text-align: center; margin-bottom: 30px;">Welcome to Mentara!</h1>
        <p style="color: #1F2937; font-size: 16px;">Thank you, ${name}, for registering as a therapist with Mentara.</p>
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

      const templateParams = {
        email,
        name,
        subject,
        html,
      };

      await emailjs.send(
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
      const appUrl = process.env.APP_URL ?? 'https://mentara.com';
      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #10B981; text-align: center; margin-bottom: 30px;">🎉 Congratulations! You're Approved!</h1>
        <p style="color: #1F2937; font-size: 16px;">Great news, ${name}! Your therapist application has been approved.</p>
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
          <a href="${appUrl}/therapist/dashboard" style="background-color: #436B00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Go to Dashboard</a>
        </div>
        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">Welcome to the Mentara therapist community!</p>
      </div>
    </div>`;

      const templateParams = {
        email,
        name,
        subject,
        html,
      };

      await emailjs.send(
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
      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #EF4444; text-align: center; margin-bottom: 30px;">Application Update</h1>
        <p style="color: #1F2937; font-size: 16px;">Dear ${name}, thank you for your interest in becoming a therapist with Mentara.</p>
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

      const templateParams = {
        email,
        name,
        subject,
        html,
      };

      await emailjs.send(
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

    try {
      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #436B00; text-align: center; margin-bottom: 30px;">Reset Your Password</h1>
        <p style="color: #1F2937; font-size: 16px;">Hello ${name}, we received a request to reset your password for your Mentara account.</p>
        <p style="color: #4B5563;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #436B00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        <p style="color: #6B7280; font-size: 14px;">For security reasons, this link will expire in 1 hour.</p>
      </div>
    </div>`;

      const templateParams = {
        email,
        name,
        subject,
        html,
      };

      await emailjs.send(
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

    try {
      const appUrl = process.env.APP_URL || 'https://mentara.com';
      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #10B981; text-align: center; margin-bottom: 30px;">✅ Password Reset Successful</h1>
        <p style="color: #1F2937; font-size: 16px;">Hello ${name}, your password has been successfully reset.</p>
        <p style="color: #4B5563;">You can now log in to your Mentara account using your new password.</p>
        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0;">
          <p style="color: #065F46; margin: 0; font-weight: 500;">Security Tip:</p>
          <p style="color: #065F46; margin: 10px 0 0 0;">Make sure to use a strong, unique password and keep it secure.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/auth/login" style="background-color: #436B00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Login to Your Account</a>
        </div>
        <p style="color: #6B7280; font-size: 14px; text-align: center;">If you didn't make this change, please contact our support team immediately.</p>
      </div>
    </div>`;

      const templateParams = {
        email,
        name,
        subject,
        html,
      };

      await emailjs.send(
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
   * Send meeting booking confirmation email
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param meetingDetails - Meeting information
   * @returns Promise with operation result
   */
  async sendMeetingBookingConfirmation(
    email: string,
    name: string,
    meetingDetails: {
      meetingId: string;
      title: string;
      startTime: Date;
      duration: number;
      therapistName: string;
      clientName: string;
      meetingUrl?: string;
      amount?: number;
      currency?: string;
    },
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const startTimeFormatted = meetingDetails.startTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });

      const appUrl = process.env.APP_URL || 'https://mentara.com';
      const meetingUrl = meetingDetails.meetingUrl || `${appUrl}/meeting/${meetingDetails.meetingId}`;

      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #436B00; text-align: center; margin-bottom: 30px;">🎉 Meeting Confirmed!</h1>
        <p style="color: #1F2937; font-size: 16px;">Hello ${name}, your therapy session has been successfully booked.</p>
        
        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 6px;">
          <h3 style="color: #065F46; margin: 0 0 15px 0;">Meeting Details:</h3>
          <p style="color: #065F46; margin: 5px 0;"><strong>Session:</strong> ${meetingDetails.title}</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Date & Time:</strong> ${startTimeFormatted}</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Duration:</strong> ${meetingDetails.duration} minutes</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Therapist:</strong> ${meetingDetails.therapistName}</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Client:</strong> ${meetingDetails.clientName}</p>
          ${meetingDetails.amount ? `<p style="color: #065F46; margin: 5px 0;"><strong>Payment:</strong> ${meetingDetails.currency || 'USD'} $${meetingDetails.amount}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingUrl}" style="background-color: #436B00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Join Meeting</a>
        </div>

        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0;">
          <p style="color: #92400E; margin: 0; font-weight: 500;">📅 Add to Calendar:</p>
          <p style="color: #92400E; margin: 10px 0 0 0;">Save this meeting to your calendar so you don't miss it!</p>
        </div>

        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
          We'll send you a reminder 24 hours before your session. If you need to reschedule, please do so at least 24 hours in advance.
        </p>
      </div>
    </div>`;

      const subject = `Meeting Confirmed - ${meetingDetails.title} on ${startTimeFormatted}`;

      const templateParams = {
        email,
        name,
        subject,
        html,
        meetingId: meetingDetails.meetingId,
        meetingUrl,
      };

      await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Meeting booking confirmation email sent:', {
        email,
        meetingId: meetingDetails.meetingId,
      });

      return {
        status: 'success',
        message: 'Meeting booking confirmation email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send meeting booking confirmation email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send meeting booking confirmation email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send upcoming meeting reminder email
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param meetingDetails - Meeting information
   * @param reminderType - Type of reminder (24h, 1h, etc.)
   * @returns Promise with operation result
   */
  async sendMeetingReminder(
    email: string,
    name: string,
    meetingDetails: {
      meetingId: string;
      title: string;
      startTime: Date;
      duration: number;
      therapistName: string;
      clientName: string;
      meetingUrl?: string;
    },
    reminderType: '24h' | '1h' | '15m' = '24h',
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const startTimeFormatted = meetingDetails.startTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });

      const reminderText = {
        '24h': 'tomorrow',
        '1h': 'in 1 hour',
        '15m': 'in 15 minutes',
      }[reminderType];

      const urgencyColor = {
        '24h': '#436B00',
        '1h': '#F59E0B',
        '15m': '#EF4444',
      }[reminderType];

      const appUrl = process.env.APP_URL || 'https://mentara.com';
      const meetingUrl = meetingDetails.meetingUrl || `${appUrl}/meeting/${meetingDetails.meetingId}`;

      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: ${urgencyColor}; text-align: center; margin-bottom: 30px;">⏰ Meeting Reminder</h1>
        <p style="color: #1F2937; font-size: 16px;">Hello ${name}, this is a friendly reminder that your therapy session is ${reminderText}.</p>
        
        <div style="background-color: #F0FDF4; border-left: 4px solid: ${urgencyColor}; padding: 20px; margin: 20px 0; border-radius: 6px;">
          <h3 style="color: #065F46; margin: 0 0 15px 0;">Upcoming Session:</h3>
          <p style="color: #065F46; margin: 5px 0;"><strong>Session:</strong> ${meetingDetails.title}</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Date & Time:</strong> ${startTimeFormatted}</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Duration:</strong> ${meetingDetails.duration} minutes</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Therapist:</strong> ${meetingDetails.therapistName}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingUrl}" style="background-color: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Join Meeting</a>
        </div>

        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0;">
          <p style="color: #92400E; margin: 0; font-weight: 500;">💡 Preparation Tips:</p>
          <ul style="color: #92400E; margin: 10px 0;">
            <li>Ensure you have a stable internet connection</li>
            <li>Find a quiet, private space for your session</li>
            <li>Test your camera and microphone beforehand</li>
            <li>Have any questions or topics ready to discuss</li>
          </ul>
        </div>

        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
          Looking forward to seeing you in the session. If you need to reschedule, please contact us as soon as possible.
        </p>
      </div>
    </div>`;

      const subject = `Reminder: ${meetingDetails.title} - ${reminderText}`;

      const templateParams = {
        email,
        name,
        subject,
        html,
        meetingId: meetingDetails.meetingId,
        meetingUrl,
        reminderType,
      };

      await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Meeting reminder email sent:', {
        email,
        meetingId: meetingDetails.meetingId,
        reminderType,
      });

      return {
        status: 'success',
        message: 'Meeting reminder email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send meeting reminder email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send meeting reminder email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send meeting cancellation notification email
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param meetingDetails - Meeting information
   * @param cancellationReason - Reason for cancellation
   * @param cancelledBy - Who cancelled the meeting (client/therapist)
   * @returns Promise with operation result
   */
  async sendMeetingCancellation(
    email: string,
    name: string,
    meetingDetails: {
      meetingId: string;
      title: string;
      startTime: Date;
      therapistName: string;
      clientName: string;
    },
    cancellationReason: string,
    cancelledBy: 'client' | 'therapist',
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const startTimeFormatted = meetingDetails.startTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });

      const appUrl = process.env.APP_URL || 'https://mentara.com';

      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #EF4444; text-align: center; margin-bottom: 30px;">❌ Meeting Cancelled</h1>
        <p style="color: #1F2937; font-size: 16px;">Hello ${name}, we're writing to inform you that your upcoming therapy session has been cancelled.</p>
        
        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 20px 0; border-radius: 6px;">
          <h3 style="color: #991B1B; margin: 0 0 15px 0;">Cancelled Session:</h3>
          <p style="color: #991B1B; margin: 5px 0;"><strong>Session:</strong> ${meetingDetails.title}</p>
          <p style="color: #991B1B; margin: 5px 0;"><strong>Date & Time:</strong> ${startTimeFormatted}</p>
          <p style="color: #991B1B; margin: 5px 0;"><strong>Therapist:</strong> ${meetingDetails.therapistName}</p>
          <p style="color: #991B1B; margin: 5px 0;"><strong>Cancelled by:</strong> ${cancelledBy === 'client' ? 'Client' : 'Therapist'}</p>
          <p style="color: #991B1B; margin: 5px 0;"><strong>Reason:</strong> ${cancellationReason}</p>
        </div>

        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0;">
          <p style="color: #065F46; margin: 0; font-weight: 500;">📅 Rescheduling:</p>
          <p style="color: #065F46; margin: 10px 0 0 0;">You can book a new session at your convenience through your dashboard.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/dashboard" style="background-color: #436B00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Book New Session</a>
        </div>

        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
          If you were charged for this session, any applicable refunds will be processed within 3-5 business days.
        </p>
      </div>
    </div>`;

      const subject = `Meeting Cancelled - ${meetingDetails.title} on ${startTimeFormatted}`;

      const templateParams = {
        email,
        name,
        subject,
        html,
        meetingId: meetingDetails.meetingId,
        cancellationReason,
        cancelledBy,
      };

      await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Meeting cancellation email sent:', {
        email,
        meetingId: meetingDetails.meetingId,
        cancelledBy,
      });

      return {
        status: 'success',
        message: 'Meeting cancellation email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send meeting cancellation email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send meeting cancellation email: ${errorMessage}`,
      };
    }
  }

  /**
   * Send payment confirmation email
   * @param email - Recipient email address
   * @param name - Recipient name
   * @param paymentDetails - Payment information
   * @returns Promise with operation result
   */
  async sendPaymentConfirmation(
    email: string,
    name: string,
    paymentDetails: {
      paymentId: string;
      amount: number;
      currency: string;
      therapistName: string;
      meetingTitle?: string;
      meetingDate?: Date;
      paymentMethod: string;
    },
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const meetingDateFormatted = paymentDetails.meetingDate?.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #10B981; text-align: center; margin-bottom: 30px;">✅ Payment Confirmed</h1>
        <p style="color: #1F2937; font-size: 16px;">Hello ${name}, your payment has been successfully processed.</p>
        
        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 6px;">
          <h3 style="color: #065F46; margin: 0 0 15px 0;">Payment Details:</h3>
          <p style="color: #065F46; margin: 5px 0;"><strong>Amount:</strong> ${paymentDetails.currency} $${paymentDetails.amount}</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Therapist:</strong> ${paymentDetails.therapistName}</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
          <p style="color: #065F46; margin: 5px 0;"><strong>Transaction ID:</strong> ${paymentDetails.paymentId}</p>
          ${paymentDetails.meetingTitle ? `<p style="color: #065F46; margin: 5px 0;"><strong>Session:</strong> ${paymentDetails.meetingTitle}</p>` : ''}
          ${meetingDateFormatted ? `<p style="color: #065F46; margin: 5px 0;"><strong>Session Date:</strong> ${meetingDateFormatted}</p>` : ''}
        </div>

        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0;">
          <p style="color: #92400E; margin: 0; font-weight: 500;">📄 Receipt:</p>
          <p style="color: #92400E; margin: 10px 0 0 0;">Keep this email as your payment receipt for your records.</p>
        </div>

        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
          Thank you for choosing Mentara for your mental health care. If you have any questions about this payment, please contact our support team.
        </p>
      </div>
    </div>`;

      const subject = `Payment Confirmation - ${paymentDetails.currency} $${paymentDetails.amount} to ${paymentDetails.therapistName}`;

      const templateParams = {
        email,
        name,
        subject,
        html,
        paymentId: paymentDetails.paymentId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
      };

      await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log('✅ Payment confirmation email sent:', {
        email,
        paymentId: paymentDetails.paymentId,
        amount: paymentDetails.amount,
      });

      return {
        status: 'success',
        message: 'Payment confirmation email sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        '❌ Failed to send payment confirmation email:',
        errorMessage,
      );

      return {
        status: 'error',
        message: `Failed to send payment confirmation email: ${errorMessage}`,
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
