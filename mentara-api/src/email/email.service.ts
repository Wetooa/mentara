import { Injectable, Logger } from '@nestjs/common';
import emailjs from '@emailjs/nodejs';
import { 
  type OtpEmailData, 
  type EmailResponse,
  type OtpType 
} from 'mentara-commons';

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

// OtpEmailData is now imported from mentara-commons

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private isInitialized = false;

  // EmailJS configuration
  private readonly config = {
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
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
        emailjs.init({
          publicKey: this.config.publicKey,
          // Note: Some options are only available in browser version
        });
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
    const { to_name, otp_code, expires_in, type } = data;

    const typeConfig = {
      registration: {
        title: 'Welcome to Mentara!',
        subtitle: 'Verify your email address to complete registration',
        icon: '🎉',
        description:
          'Thank you for joining Mentara. Please use the verification code below to confirm your email address and complete your account setup.',
      },
      password_reset: {
        title: 'Password Reset Request',
        subtitle: 'Verify your identity to reset your password',
        icon: '🔒',
        description:
          'You requested to reset your password. Please use the verification code below to proceed with resetting your password.',
      },
      login_verification: {
        title: 'Login Verification',
        subtitle: 'Secure your account with two-factor authentication',
        icon: '🛡️',
        description:
          'Please use the verification code below to complete your login and secure your account.',
      },
    };

    const config = typeConfig[type];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: ${this.BRAND_COLORS.dark};
            background-color: ${this.BRAND_COLORS.light};
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${this.BRAND_COLORS.white};
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, ${this.BRAND_COLORS.primary} 0%, ${this.BRAND_COLORS.secondary} 100%);
            padding: 40px 30px;
            text-align: center;
            color: ${this.BRAND_COLORS.white};
        }
        
        .logo {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .header-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .header-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: ${this.BRAND_COLORS.dark};
        }
        
        .description {
            font-size: 16px;
            color: #6B7280;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        .otp-container {
            background: linear-gradient(135deg, ${this.BRAND_COLORS.light} 0%, #E5E7EB 100%);
            border: 2px dashed ${this.BRAND_COLORS.primary};
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 32px 0;
        }
        
        .otp-label {
            font-size: 14px;
            font-weight: 600;
            color: ${this.BRAND_COLORS.primary};
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            color: ${this.BRAND_COLORS.dark};
            letter-spacing: 8px;
            margin-bottom: 12px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .otp-expires {
            font-size: 14px;
            color: #9CA3AF;
            font-weight: 500;
        }
        
        .warning-box {
            background-color: #FEF3C7;
            border: 1px solid #F59E0B;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
        }
        
        .warning-title {
            font-size: 14px;
            font-weight: 600;
            color: #92400E;
            margin-bottom: 4px;
        }
        
        .warning-text {
            font-size: 14px;
            color: #92400E;
            line-height: 1.5;
        }
        
        .features {
            margin: 32px 0;
        }
        
        .features-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: ${this.BRAND_COLORS.dark};
        }
        
        .feature-list {
            list-style: none;
            padding: 0;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;
            color: #6B7280;
        }
        
        .feature-icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, ${this.BRAND_COLORS.primary} 0%, ${this.BRAND_COLORS.secondary} 100%);
            border-radius: 50%;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${this.BRAND_COLORS.white};
            font-size: 12px;
            font-weight: 600;
        }
        
        .footer {
            background-color: #F9FAFB;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
        }
        
        .footer-links {
            margin-bottom: 20px;
        }
        
        .footer-link {
            color: ${this.BRAND_COLORS.primary};
            text-decoration: none;
            font-size: 14px;
            margin: 0 15px;
            font-weight: 500;
        }
        
        .footer-link:hover {
            text-decoration: underline;
        }
        
        .footer-text {
            font-size: 12px;
            color: #9CA3AF;
            line-height: 1.5;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-link {
            display: inline-block;
            width: 36px;
            height: 36px;
            margin: 0 8px;
            background: linear-gradient(135deg, ${this.BRAND_COLORS.primary} 0%, ${this.BRAND_COLORS.secondary} 100%);
            border-radius: 50%;
            color: ${this.BRAND_COLORS.white};
            text-decoration: none;
            line-height: 36px;
            font-weight: 600;
        }
        
        /* Responsive design */
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
            
            .header-title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">Mentara</div>
                <div class="tagline">Your Mental Health Journey</div>
                <div class="header-icon">${config.icon}</div>
                <div class="header-title">${config.title}</div>
                <div class="header-subtitle">${config.subtitle}</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <div class="greeting">Hello ${to_name}!</div>
                
                <div class="description">
                    ${config.description}
                </div>
                
                <!-- OTP Code -->
                <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp_code}</div>
                    <div class="otp-expires">Expires in ${expires_in}</div>
                </div>
                
                <!-- Security Warning -->
                <div class="warning-box">
                    <div class="warning-title">🔐 Security Notice</div>
                    <div class="warning-text">
                        Never share this code with anyone. Mentara staff will never ask for your verification codes.
                        If you didn't request this code, please ignore this email.
                    </div>
                </div>
                
                ${
                  type === 'registration'
                    ? `
                <!-- Welcome Features -->
                <div class="features">
                    <div class="features-title">What you'll get with Mentara:</div>
                    <ul class="feature-list">
                        <li class="feature-item">
                            <div class="feature-icon">✓</div>
                            <span>Access to licensed mental health professionals</span>
                        </li>
                        <li class="feature-item">
                            <div class="feature-icon">✓</div>
                            <span>Supportive community forums and groups</span>
                        </li>
                        <li class="feature-item">
                            <div class="feature-icon">✓</div>
                            <span>Personalized mental health assessments</span>
                        </li>
                        <li class="feature-item">
                            <div class="feature-icon">✓</div>
                            <span>Interactive worksheets and progress tracking</span>
                        </li>
                        <li class="feature-item">
                            <div class="feature-icon">✓</div>
                            <span>24/7 crisis support and resources</span>
                        </li>
                    </ul>
                </div>
                `
                    : ''
                }
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-links">
                    <a href="https://mentara.com/help" class="footer-link">Help Center</a>
                    <a href="https://mentara.com/privacy" class="footer-link">Privacy Policy</a>
                    <a href="https://mentara.com/terms" class="footer-link">Terms of Service</a>
                </div>
                
                <div class="social-links">
                    <a href="https://twitter.com/mentara" class="social-link">X</a>
                    <a href="https://linkedin.com/company/mentara" class="social-link">in</a>
                    <a href="https://instagram.com/mentara" class="social-link">ig</a>
                </div>
                
                <div class="footer-text">
                    © 2024 Mentara. All rights reserved.<br>
                    Making mental health care accessible to everyone.
                    <br><br>
                    If you have questions, contact us at <a href="mailto:support@mentara.com" style="color: ${this.BRAND_COLORS.primary};">support@mentara.com</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    const text = `
${config.title}

Hello ${to_name}!

${config.description}

Your verification code: ${otp_code}
This code expires in ${expires_in}.

Security Notice:
Never share this code with anyone. Mentara staff will never ask for your verification codes.
If you didn't request this code, please ignore this email.

${
  type === 'registration'
    ? `
Welcome to Mentara! Here's what you'll get:
• Access to licensed mental health professionals
• Supportive community forums and groups
• Personalized mental health assessments
• Interactive worksheets and progress tracking
• 24/7 crisis support and resources
`
    : ''
}

Need help? Contact us at support@mentara.com

© 2024 Mentara. All rights reserved.
Making mental health care accessible to everyone.
`;

    return {
      subject: config.title,
      html,
      text,
    };
  }

  /**
   * Send OTP email using EmailJS
   * @param data OTP email data
   * @returns Promise with operation result
   */
  async sendOtpEmail(
    data: OtpEmailData,
  ): Promise<EmailResponse> {
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
        message: 'Verification code sent successfully!',
        emailId: response.text,
      };
    } catch (error) {
      this.logger.error('❌ Failed to send OTP email:', error);

      return {
        status: 'error',
        message: 'Failed to send verification code. Please try again.',
      };
    }
  }

  /**
   * Send therapist application status notification using EmailJS
   * @param data Email notification data
   * @returns Promise with operation result
   */
  async sendTherapistApplicationNotification(
    data: EmailNotificationData,
  ): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message:
          'EmailJS not properly initialized. Check environment variables.',
      };
    }

    if (!this.config.serviceId || !this.config.templateId) {
      return {
        status: 'error',
        message: 'EmailJS service ID or template ID not configured.',
      };
    }

    try {
      this.logger.log('Sending therapist application notification:', {
        recipient: data.to,
        status: data.status,
        hasCredentials: !!data.credentials,
      });

      const templateParams = {
        to_email: data.to,
        to_name: data.name,
        application_status: data.status,
        status_message: this.getStatusMessage(data.status),
        admin_notes: data.adminNotes || '',
        // Include credentials for approved applications
        ...(data.status === 'approved' &&
          data.credentials && {
            login_email: data.credentials.email,
            temporary_password: data.credentials.password,
            login_instructions:
              'Please use these credentials to log in to your therapist account. You will be prompted to change your password on first login.',
          }),
        // Additional template variables
        company_name: 'Mentara',
        support_email: 'support@mentara.com',
        website_url: process.env.APP_URL || 'https://mentara.com',
        current_year: new Date().getFullYear(),
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
      );

      this.logger.log(
        'Therapist notification email sent successfully:',
        response,
      );

      return {
        status: 'success',
        message: 'Notification email sent successfully',
        emailId: response.text,
      };
    } catch (error) {
      this.logger.error('Failed to send therapist notification email:', error);

      return {
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send email notification',
      };
    }
  }

  /**
   * Generate status message for therapist application emails
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
   * Generate email content based on application status (Legacy method for compatibility)
   * @param data Email notification data
   * @returns Formatted email content
   */
  private generateEmailContent(data: EmailNotificationData) {
    const { name, status, adminNotes, credentials } = data;

    const baseContent = {
      subject: `Mentara Therapist Application ${status === 'approved' ? 'Approved' : 'Update'}`,
      greeting: `Dear ${name},`,
      companySignature: 'Best regards,\nThe Mentara Team\nsupport@mentara.com',
    };

    if (status === 'approved') {
      return {
        ...baseContent,
        body: [
          'Congratulations! Your therapist application has been approved.',
          '',
          'You can now start providing therapy services through the Mentara platform.',
          '',
          ...(credentials
            ? [
                'Your account credentials:',
                `Email: ${credentials.email}`,
                `Temporary Password: ${credentials.password}`,
                '',
                'Please log in and change your password immediately.',
                'You can access your therapist dashboard at: https://mentara.com/therapist',
                '',
              ]
            : []),
          ...(adminNotes
            ? ['Additional notes from our team:', adminNotes, '']
            : []),
          'Welcome to the Mentara therapist network!',
        ].join('\n'),
      };
    } else {
      return {
        ...baseContent,
        body: [
          'Thank you for your interest in joining the Mentara therapist network.',
          '',
          'After careful review, we have decided not to approve your application at this time.',
          '',
          ...(adminNotes
            ? ['Feedback from our review team:', adminNotes, '']
            : []),
          'We encourage you to address any concerns mentioned above and reapply in the future.',
          '',
          "If you have any questions, please don't hesitate to contact our support team.",
        ].join('\n'),
      };
    }
  }

  /**
   * Send email using configured email service (Legacy method for compatibility)
   * @param emailContent Generated email content
   * @param recipient Email recipient
   * @returns Send result
   */
  private sendEmail(
    emailContent: any,
    recipient: string,
  ): { success: boolean; error?: string } {
    try {
      // Simulate email sending for development
      // In production, replace with actual email service integration:
      // - Nodemailer with SMTP
      // - SendGrid API
      // - AWS SES
      // - Postmark
      // - Or webhook to frontend EmailJS

      this.logger.log(`📧 Sending email to: ${recipient}`);
      this.logger.log(`📧 Subject: ${emailContent.subject}`);
      this.logger.log(
        `📧 Content preview: ${emailContent.body?.substring(0, 100) || 'No content'}...`,
      );

      // Simulate network delay and potential failures
      const random = Math.random();

      if (random < 0.05) {
        // 5% failure rate for testing
        return {
          success: false,
          error: 'Email service temporarily unavailable',
        };
      }

      if (random < 0.1) {
        // 5% invalid email simulation
        return {
          success: false,
          error: 'Invalid email address format',
        };
      }

      // Simulate successful email delivery
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
      };
    }
  }

  /**
   * Send welcome email to new therapists
   * @param therapistEmail Therapist email address
   * @param therapistName Therapist name
   * @param credentials Login credentials
   * @returns Promise with operation result
   */
  async sendTherapistWelcomeEmail(
    therapistEmail: string,
    therapistName: string,
    credentials: { email: string; password: string },
  ): Promise<EmailResponse> {
    const result = await this.sendTherapistApplicationNotification({
      to: therapistEmail,
      name: therapistName,
      status: 'approved',
      credentials,
    });
    return {
      status: result.status,
      message: result.message,
      emailId: result.emailId,
    };
  }

  /**
   * Send rejection email to therapist applicants
   * @param therapistEmail Therapist email address
   * @param therapistName Therapist name
   * @param reason Optional rejection reason
   * @returns Promise with operation result
   */
  async sendTherapistRejectionEmail(
    therapistEmail: string,
    therapistName: string,
    reason?: string,
  ): Promise<EmailResponse> {
    const result = await this.sendTherapistApplicationNotification({
      to: therapistEmail,
      name: therapistName,
      status: 'rejected',
      adminNotes: reason,
    });
    return {
      status: result.status,
      message: result.message,
      emailId: result.emailId,
    };
  }

  /**
   * Test email service configuration
   * @returns Promise with test result
   */
  async testConfiguration(): Promise<EmailResponse> {
    if (!this.isInitialized) {
      return {
        status: 'error',
        message: 'EmailJS not initialized',
      };
    }

    if (!this.config.serviceId || !this.config.templateId) {
      return {
        status: 'error',
        message: 'Missing EmailJS configuration (service ID or template ID)',
      };
    }

    try {
      this.logger.log('Testing email service configuration...');

      // Test OTP email template generation
      const testOtpData: OtpEmailData = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        otp_code: '123456',
        expires_in: '10 minutes',
        type: 'registration',
      };

      const otpTemplate = this.generateOtpEmailTemplate(testOtpData);
      this.logger.log('OTP email template generated successfully');

      // Test therapist notification content generation
      const testTherapistData: EmailNotificationData = {
        to: 'test@example.com',
        name: 'Test Therapist',
        status: 'approved',
        credentials: {
          email: 'test@example.com',
          password: 'temp123',
        },
      };

      const therapistContent = this.generateEmailContent(testTherapistData);
      this.logger.log('Therapist email content generated successfully');

      return {
        status: 'success',
        message: 'Email service configuration test passed',
      };
    } catch (error) {
      this.logger.error('Email service test failed:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Test failed',
      };
    }
  }

  /**
   * Public method for sending generic emails
   */
  async sendGenericEmail(emailData: {
    to: string;
    subject: string;
    template: string;
    data: any;
  }): Promise<void> {
    try {
      this.logger.log('Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
      });

      // For now, this is a placeholder implementation
      // In production, integrate with actual email service like SendGrid, AWS SES, etc.
      const emailContent = {
        subject: emailData.subject,
        template: emailData.template,
        ...emailData.data,
      };
      const result = this.sendEmail(emailContent, emailData.to);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Generate OTP utility function
   * @param length OTP length (default: 6)
   * @returns Generated OTP string
   */
  generateOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }

    return otp;
  }

  /**
   * Format expiry time utility function
   * @param minutes Expiry time in minutes
   * @returns Formatted expiry time string
   */
  formatExpiryTime(minutes: number): string {
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
   * Get current configuration status
   * @returns Configuration status information
   */
  getConfigurationStatus(): {
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
