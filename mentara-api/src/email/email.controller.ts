import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Logger,
} from '@nestjs/common';
import { IsEmail, IsString, IsIn, IsOptional, IsObject } from 'class-validator';
import { EmailService, EmailNotificationData } from './email.service';
import { 
  type OtpEmailData,
  type EmailResponse,
  type AutoOtpEmailRequest,
  type OtpType 
} from 'mentara-commons';

// DTOs for request validation
export class SendOtpEmailDto {
  @IsEmail()
  to_email!: string;

  @IsString()
  to_name!: string;

  @IsString()
  otp_code!: string;

  @IsString()
  expires_in!: string;

  @IsIn(['registration', 'password_reset', 'login_verification'])
  type!: OtpType;
}

export class SendTherapistNotificationDto {
  @IsEmail()
  to!: string;

  @IsString()
  name!: string;

  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsObject()
  credentials?: {
    email: string;
    password: string;
  };
}

export class SendGenericEmailDto {
  @IsEmail()
  to!: string;

  @IsString()
  subject!: string;

  @IsString()
  html!: string;

  @IsOptional()
  @IsString()
  text?: string;
}

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Send OTP verification email
   * POST /email/send-otp
   */
  @Post('send-otp')
  async sendOtpEmail(@Body() dto: SendOtpEmailDto) {
    try {
      this.logger.log('OTP email request received:', {
        to: dto.to_email,
        type: dto.type,
      });

      const result = await this.emailService.sendOtpEmail(dto);

      if (result.status === 'error') {
        throw new HttpException(
          {
            status: 'error',
            message: result.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        status: 'success',
        message: result.message,
        emailId: result.emailId,
      };
    } catch (error) {
      this.logger.error('Failed to send OTP email:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send verification email',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send OTP email with auto-generated code
   * POST /email/send-otp-auto
   */
  @Post('send-otp-auto')
  async sendOtpEmailAuto(
    @Body()
    dto: {
      to_email: string;
      to_name: string;
      type: 'registration' | 'password_reset' | 'login_verification';
      expires_in_minutes?: number;
    },
  ) {
    try {
      this.logger.log('Auto-OTP email request received:', {
        to: dto.to_email,
        type: dto.type,
      });

      // Generate OTP and format expiry time
      const otp_code = this.emailService.generateOtp(6);
      const expires_in_minutes = dto.expires_in_minutes || 10;
      const expires_in = this.emailService.formatExpiryTime(expires_in_minutes);

      const otpData: OtpEmailData = {
        to_email: dto.to_email,
        to_name: dto.to_name,
        otp_code,
        expires_in,
        type: dto.type,
      };

      const result = await this.emailService.sendOtpEmail(otpData);

      if (result.status === 'error') {
        throw new HttpException(
          {
            status: 'error',
            message: result.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        status: 'success',
        message: result.message,
        emailId: result.emailId,
        // In development, return the OTP for testing purposes
        ...(process.env.NODE_ENV === 'development' && { otp_code }),
      };
    } catch (error) {
      this.logger.error('Failed to send auto-OTP email:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send verification email',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send therapist application notification
   * POST /email/send-therapist-notification
   */
  @Post('send-therapist-notification')
  async sendTherapistNotification(@Body() dto: SendTherapistNotificationDto) {
    try {
      this.logger.log('Therapist notification email request received:', {
        to: dto.to,
        status: dto.status,
      });

      // Transform DTO to match TherapistNotificationData interface
      const therapistNotificationData = {
        to_name: dto.name,
        to_email: dto.to,
        applicationId: 'TEMP_' + Date.now(), // Generate temporary ID
        submissionDate: new Date().toLocaleDateString(),
      };

      const result = await this.emailService.sendTherapistApplicationNotification(therapistNotificationData);

      if (result.status === 'error') {
        throw new HttpException(
          {
            status: 'error',
            message: result.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        status: 'success',
        message: result.message,
        emailId: result.emailId,
      };
    } catch (error) {
      this.logger.error('Failed to send therapist notification:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send notification email',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send therapist welcome email (approved status)
   * POST /email/send-therapist-welcome
   */
  @Post('send-therapist-welcome')
  async sendTherapistWelcome(
    @Body()
    dto: {
      therapistEmail: string;
      therapistName: string;
      credentials: { email: string; password: string };
      adminNotes?: string;
    },
  ) {
    try {
      this.logger.log('Therapist welcome email request received:', {
        to: dto.therapistEmail,
      });

      const result = await this.emailService.sendTherapistWelcomeEmail(
        dto.therapistEmail,
        dto.therapistName,
        dto.credentials,
      );

      if (result.status === 'error') {
        throw new HttpException(
          {
            status: 'error',
            message: result.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        status: 'success',
        message: result.message,
      };
    } catch (error) {
      this.logger.error('Failed to send therapist welcome email:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send welcome email',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send therapist rejection email
   * POST /email/send-therapist-rejection
   */
  @Post('send-therapist-rejection')
  async sendTherapistRejection(
    @Body()
    dto: {
      therapistEmail: string;
      therapistName: string;
      reason?: string;
    },
  ) {
    try {
      this.logger.log('Therapist rejection email request received:', {
        to: dto.therapistEmail,
      });

      const result = await this.emailService.sendTherapistRejectionEmail(
        dto.therapistEmail,
        dto.therapistName,
        dto.reason,
      );

      if (result.status === 'error') {
        throw new HttpException(
          {
            status: 'error',
            message: result.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        status: 'success',
        message: result.message,
      };
    } catch (error) {
      this.logger.error('Failed to send therapist rejection email:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send rejection email',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send generic email
   * POST /email/send-generic
   */
  @Post('send-generic')
  async sendGenericEmail(@Body() dto: SendGenericEmailDto) {
    try {
      this.logger.log('Generic email request received:', {
        to: dto.to,
        subject: dto.subject,
      });

      await this.emailService.sendGenericEmail(dto);

      return {
        status: 'success',
        message: 'Email sent successfully',
      };
    } catch (error) {
      this.logger.error('Failed to send generic email:', error);

      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send email',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Test email service configuration
   * GET /email/test
   */
  @Get('test')
  async testEmailConfiguration() {
    try {
      this.logger.log('Email configuration test requested');

      const result = await this.emailService.testConfiguration();
      const configStatus = this.emailService.getConfigurationStatus();

      return {
        status: result.status,
        message: result.message,
        configuration: configStatus,
      };
    } catch (error) {
      this.logger.error('Email configuration test failed:', error);

      throw new HttpException(
        {
          status: 'error',
          message: 'Configuration test failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get email service configuration status
   * GET /email/status
   */
  @Get('status')
  async getEmailServiceStatus() {
    try {
      const configStatus = this.emailService.getConfigurationStatus();

      return {
        status: 'success',
        configuration: configStatus,
        ready: configStatus.isInitialized && configStatus.hasServiceId && configStatus.hasTemplateId && configStatus.hasPublicKey,
      };
    } catch (error) {
      this.logger.error('Failed to get email service status:', error);

      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get service status',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate OTP utility endpoint (for development/testing)
   * GET /email/generate-otp
   */
  @Get('generate-otp')
  generateOtp() {
    if (process.env.NODE_ENV === 'production') {
      throw new HttpException(
        {
          status: 'error',
          message: 'OTP generation endpoint not available in production',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const otp = this.emailService.generateOtp(6);
    const expiryTime = this.emailService.formatExpiryTime(10);

    return {
      status: 'success',
      otp_code: otp,
      expires_in: expiryTime,
      message: 'OTP generated for development/testing purposes',
    };
  }
}