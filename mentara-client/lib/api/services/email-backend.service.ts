/**
 * Backend Email Service
 * 
 * This service replaces the direct EmailJS calls with backend API calls.
 * Use this instead of the frontend EmailJS service for better security.
 */

import { apiClient } from '../client';
import { 
  type OtpEmailData,
  type AutoOtpEmailRequest,
  type EmailResponse,
  type EmailStatusResponse,
  type OtpType 
} from 'mentara-commons';

// OtpEmailData and AutoOtpEmailRequest are now imported from mentara-commons
export interface OtpEmailRequest extends OtpEmailData {}
export interface AutoOtpEmailRequestLocal extends AutoOtpEmailRequest {}

export interface TherapistNotificationRequest {
  to: string;
  name: string;
  status: 'approved' | 'rejected';
  adminNotes?: string;
  credentials?: {
    email: string;
    password: string;
  };
}

export interface TherapistWelcomeRequest {
  therapistEmail: string;
  therapistName: string;
  credentials: {
    email: string;
    password: string;
  };
  adminNotes?: string;
}

export interface TherapistRejectionRequest {
  therapistEmail: string;
  therapistName: string;
  reason?: string;
}

export interface GenericEmailRequest {
  to: string;
  subject: string;
  template: string;
  data: any;
}

// EmailResponse and EmailStatusResponse are now imported from mentara-commons

export class BackendEmailService {
  /**
   * Send OTP email with provided code
   */
  async sendOtpEmail(request: OtpEmailRequest): Promise<EmailResponse> {
    const response = await apiClient.post('/email/send-otp', request);
    return response.data;
  }

  /**
   * Send OTP email with auto-generated code
   * This is the recommended method for OTP emails
   */
  async sendOtpEmailAuto(request: AutoOtpEmailRequestLocal): Promise<EmailResponse> {
    const response = await apiClient.post('/email/send-otp-auto', request);
    return response.data;
  }

  /**
   * Send therapist application notification
   */
  async sendTherapistNotification(request: TherapistNotificationRequest): Promise<EmailResponse> {
    const response = await apiClient.post('/email/send-therapist-notification', request);
    return response.data;
  }

  /**
   * Send therapist welcome email (approved application)
   */
  async sendTherapistWelcome(request: TherapistWelcomeRequest): Promise<EmailResponse> {
    const response = await apiClient.post('/email/send-therapist-welcome', request);
    return response.data;
  }

  /**
   * Send therapist rejection email
   */
  async sendTherapistRejection(request: TherapistRejectionRequest): Promise<EmailResponse> {
    const response = await apiClient.post('/email/send-therapist-rejection', request);
    return response.data;
  }

  /**
   * Send generic email
   */
  async sendGenericEmail(request: GenericEmailRequest): Promise<EmailResponse> {
    const response = await apiClient.post('/email/send-generic', request);
    return response.data;
  }

  /**
   * Test email service configuration
   */
  async testConfiguration(): Promise<EmailResponse> {
    const response = await apiClient.get('/email/test');
    return response.data;
  }

  /**
   * Get email service status
   */
  async getStatus(): Promise<EmailStatusResponse> {
    const response = await apiClient.get('/email/status');
    return response.data;
  }

  /**
   * Generate OTP for development/testing
   * Only works in development environment
   */
  async generateOtp(): Promise<{ status: string; otp_code: string; expires_in: string; message: string }> {
    const response = await apiClient.get('/email/generate-otp');
    return response.data;
  }
}

// Create singleton instance
export const backendEmailService = new BackendEmailService();

// Export individual methods for convenience
export const {
  sendOtpEmail,
  sendOtpEmailAuto,
  sendTherapistNotification,
  sendTherapistWelcome,
  sendTherapistRejection,
  sendGenericEmail,
  testConfiguration,
  getStatus,
  generateOtp,
} = backendEmailService;

/**
 * Migration helper functions to replace frontend EmailJS calls
 */

/**
 * Replaces generateOtp() from frontend emailjs.ts
 */
export function generateOtpCode(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
}

/**
 * Replaces formatExpiryTime() from frontend emailjs.ts
 */
export function formatExpiryTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

/**
 * Replaces sendOtpEmail() from frontend emailjs.ts
 * This version calls the backend instead of EmailJS directly
 */
export async function sendOtpEmailLegacy(data: {
  to_email: string;
  to_name: string;
  otp_code: string;
  expires_in: string;
  type: 'registration' | 'password_reset' | 'login_verification';
}): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendOtpEmail(data);
    return {
      success: result.status === 'success',
      message: result.message,
    };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return {
      success: false,
      message: 'Failed to send verification code. Please try again.',
    };
  }
}

// Default export
export default backendEmailService;