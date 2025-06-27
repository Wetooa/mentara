import emailjs from '@emailjs/browser';

// EmailJS configuration interface
interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

// Email template parameters for therapist application notifications
interface TherapistApplicationEmailParams {
  to_email: string;
  to_name: string;
  application_status: 'approved' | 'rejected';
  admin_notes?: string;
  credentials?: {
    email: string;
    password: string;
  };
}

export class EmailService {
  private static instance: EmailService;
  private isInitialized = false;

  private config: EmailJSConfig = {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
  };

  private constructor() {
    this.initializeEmailJS();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initializeEmailJS() {
    try {
      if (this.config.publicKey) {
        emailjs.init(this.config.publicKey);
        this.isInitialized = true;
        console.log('EmailJS initialized successfully');
      } else {
        console.warn('EmailJS public key not found in environment variables');
      }
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }
  }

  /**
   * Send therapist application status notification email
   * @param params Email parameters including recipient info and application status
   * @returns Promise with success/failure result
   */
  public async sendTherapistApplicationNotification(
    params: TherapistApplicationEmailParams
  ): Promise<{ success: boolean; message: string; emailId?: string }> {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'EmailJS not properly initialized. Check environment variables.',
      };
    }

    if (!this.config.serviceId || !this.config.templateId) {
      return {
        success: false,
        message: 'EmailJS service ID or template ID not configured.',
      };
    }

    try {
      // Prepare email template parameters
      const templateParams = {
        to_email: params.to_email,
        to_name: params.to_name,
        application_status: params.application_status,
        status_message: this.getStatusMessage(params.application_status),
        admin_notes: params.admin_notes || '',
        // Include credentials for approved applications
        ...(params.application_status === 'approved' && params.credentials && {
          login_email: params.credentials.email,
          temporary_password: params.credentials.password,
          login_instructions: 'Please use these credentials to log in to your therapist account. You will be prompted to change your password on first login.',
        }),
        // Additional template variables
        company_name: 'Mentara',
        support_email: 'support@mentara.com',
        website_url: process.env.NEXT_PUBLIC_APP_URL || 'https://mentara.com',
        current_year: new Date().getFullYear(),
      };

      console.log('Sending email notification for therapist application:', {
        to: params.to_email,
        status: params.application_status,
      });

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams
      );

      console.log('Email sent successfully:', response);

      return {
        success: true,
        message: 'Notification email sent successfully',
        emailId: response.text,
      };
    } catch (error) {
      console.error('Failed to send email notification:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email notification',
      };
    }
  }

  /**
   * Send general notification email
   * @param to Recipient email address
   * @param subject Email subject
   * @param message Email message content
   * @param recipientName Optional recipient name
   * @returns Promise with success/failure result
   */
  public async sendGeneralNotification(
    to: string,
    subject: string,
    message: string,
    recipientName?: string
  ): Promise<{ success: boolean; message: string; emailId?: string }> {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'EmailJS not properly initialized. Check environment variables.',
      };
    }

    try {
      const templateParams = {
        to_email: to,
        to_name: recipientName || 'User',
        subject: subject,
        message: message,
        company_name: 'Mentara',
        support_email: 'support@mentara.com',
        website_url: process.env.NEXT_PUBLIC_APP_URL || 'https://mentara.com',
        current_year: new Date().getFullYear(),
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams
      );

      return {
        success: true,
        message: 'Email sent successfully',
        emailId: response.text,
      };
    } catch (error) {
      console.error('Failed to send general notification:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  /**
   * Test EmailJS configuration
   * @returns Promise with test result
   */
  public async testConfiguration(): Promise<{ success: boolean; message: string }> {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'EmailJS not initialized',
      };
    }

    if (!this.config.serviceId || !this.config.templateId) {
      return {
        success: false,
        message: 'Missing EmailJS configuration (service ID or template ID)',
      };
    }

    try {
      // Send a test email to a test address (you can modify this)
      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        subject: 'EmailJS Configuration Test',
        message: 'This is a test email to verify EmailJS configuration.',
        company_name: 'Mentara',
        current_year: new Date().getFullYear(),
      };

      // Note: This won't actually send in production unless you have a test email
      console.log('EmailJS configuration test parameters:', testParams);

      return {
        success: true,
        message: 'EmailJS configuration appears valid',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Configuration test failed',
      };
    }
  }

  /**
   * Get appropriate status message for email template
   * @param status Application status
   * @returns Human-readable status message
   */
  private getStatusMessage(status: 'approved' | 'rejected'): string {
    switch (status) {
      case 'approved':
        return 'Congratulations! Your therapist application has been approved. You can now start providing therapy services through the Mentara platform.';
      case 'rejected':
        return 'Thank you for your interest in joining Mentara. Unfortunately, your application was not approved at this time. Please feel free to reapply in the future.';
      default:
        return 'Your application status has been updated.';
    }
  }

  /**
   * Get current configuration status
   * @returns Configuration status information
   */
  public getConfigurationStatus(): {
    isInitialized: boolean;
    hasServiceId: boolean;
    hasTemplateId: boolean;
    hasPublicKey: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      hasServiceId: !!this.config.serviceId,
      hasTemplateId: !!this.config.templateId,
      hasPublicKey: !!this.config.publicKey,
    };
  }
}