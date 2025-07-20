import { BaseEmailTemplate, EmailTemplate, BaseEmailData } from './base.template';
import { type OtpType } from 'mentara-commons';

export interface OtpEmailData extends BaseEmailData {
  otp_code: string;
  expires_in: string;
  type: OtpType;
}

export class OtpEmailTemplate extends BaseEmailTemplate<OtpEmailData> {
  generate(data: OtpEmailData): EmailTemplate {
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

    const content = `
        <div class="header">
            <div class="logo">Mentara</div>
            <div class="tagline">Your Mental Health Companion</div>
            <div class="header-icon">${config.icon}</div>
            <div class="header-title">${config.title}</div>
            <div class="header-subtitle">${config.subtitle}</div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${to_name},</div>
            
            <div class="description">
                ${config.description}
            </div>
            
            <div style="background: linear-gradient(135deg, ${this.BRAND_COLORS.light} 0%, #F3F4F6 100%); 
                        border: 2px solid ${this.BRAND_COLORS.primary}; 
                        border-radius: 16px; 
                        padding: 32px; 
                        text-align: center; 
                        margin: 32px 0;">
                <div style="font-size: 14px; 
                           color: ${this.BRAND_COLORS.primary}; 
                           font-weight: 600; 
                           text-transform: uppercase; 
                           letter-spacing: 1px; 
                           margin-bottom: 16px;">
                    Your Verification Code
                </div>
                <div style="font-size: 48px; 
                           font-weight: 800; 
                           color: ${this.BRAND_COLORS.dark}; 
                           letter-spacing: 8px; 
                           font-family: 'Courier New', monospace; 
                           background: ${this.BRAND_COLORS.white}; 
                           padding: 20px; 
                           border-radius: 12px; 
                           border: 2px dashed ${this.BRAND_COLORS.primary}; 
                           margin: 16px 0;">
                    ${otp_code}
                </div>
                <div style="font-size: 14px; 
                           color: #6B7280; 
                           margin-top: 16px;">
                    This code expires in <strong>${expires_in}</strong>
                </div>
            </div>
            
            <div style="background-color: #FEF3C7; 
                        border-left: 4px solid ${this.BRAND_COLORS.warning}; 
                        padding: 16px; 
                        border-radius: 8px; 
                        margin: 24px 0;">
                <div style="font-size: 14px; 
                           color: #92400E; 
                           font-weight: 600; 
                           margin-bottom: 8px;">
                    🔐 Security Notice
                </div>
                <div style="font-size: 14px; color: #92400E;">
                    Never share this code with anyone. Mentara staff will never ask for your verification code.
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
                <div style="font-size: 14px; color: #6B7280; margin-bottom: 16px;">
                    Having trouble? We're here to help!
                </div>
                <a href="mailto:support@mentara.com" 
                   style="color: ${this.BRAND_COLORS.primary}; 
                          text-decoration: none; 
                          font-weight: 600;">
                    Contact Support
                </a>
            </div>
        </div>`;

    const html = this.generateBaseHtml(content);

    const text = `
${config.title}

Hello ${to_name},

${config.description}

Your verification code is: ${otp_code}

This code expires in ${expires_in}.

Important: Never share this code with anyone. Mentara staff will never ask for your verification code.

Having trouble? Contact our support team at support@mentara.com

Best regards,
The Mentara Team
    `.trim();

    return {
      subject: config.title,
      html,
      text,
    };
  }
}