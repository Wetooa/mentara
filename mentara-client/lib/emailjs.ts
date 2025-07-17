"use client";

import emailjs from '@emailjs/browser';

// EmailJS configuration - these should be in environment variables
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_mentara';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_otp_verification';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface OtpEmailData {
  to_email: string;
  to_name: string;
  otp_code: string;
  expires_in: string;
  type: 'registration' | 'password_reset' | 'login_verification';
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Brand colors for Mentara
const BRAND_COLORS = {
  primary: '#8B5CF6', // Purple
  secondary: '#EC4899', // Pink
  accent: '#06B6D4', // Cyan
  success: '#10B981', // Green
  warning: '#F59E0B', // Yellow
  error: '#EF4444', // Red
  dark: '#1F2937', // Dark gray
  light: '#F9FAFB', // Light gray
  white: '#FFFFFF'
};

// Generate beautiful email template
export function generateOtpEmailTemplate(data: OtpEmailData): EmailTemplate {
  const { to_name, otp_code, expires_in, type } = data;
  
  const typeConfig = {
    registration: {
      title: 'Welcome to Mentara!',
      subtitle: 'Verify your email address to complete registration',
      icon: '🎉',
      description: 'Thank you for joining Mentara. Please use the verification code below to confirm your email address and complete your account setup.'
    },
    password_reset: {
      title: 'Password Reset Request',
      subtitle: 'Verify your identity to reset your password',
      icon: '🔒',
      description: 'You requested to reset your password. Please use the verification code below to proceed with resetting your password.'
    },
    login_verification: {
      title: 'Login Verification',
      subtitle: 'Secure your account with two-factor authentication',
      icon: '🛡️',
      description: 'Please use the verification code below to complete your login and secure your account.'
    }
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
            color: ${BRAND_COLORS.dark};
            background-color: ${BRAND_COLORS.light};
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${BRAND_COLORS.white};
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%);
            padding: 40px 30px;
            text-align: center;
            color: ${BRAND_COLORS.white};
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
            color: ${BRAND_COLORS.dark};
        }
        
        .description {
            font-size: 16px;
            color: #6B7280;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        .otp-container {
            background: linear-gradient(135deg, ${BRAND_COLORS.light} 0%, #E5E7EB 100%);
            border: 2px dashed ${BRAND_COLORS.primary};
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 32px 0;
        }
        
        .otp-label {
            font-size: 14px;
            font-weight: 600;
            color: ${BRAND_COLORS.primary};
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            color: ${BRAND_COLORS.dark};
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
            color: ${BRAND_COLORS.dark};
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
            background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%);
            border-radius: 50%;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${BRAND_COLORS.white};
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
            color: ${BRAND_COLORS.primary};
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
            background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%);
            border-radius: 50%;
            color: ${BRAND_COLORS.white};
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
                
                ${type === 'registration' ? `
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
                ` : ''}
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
                    If you have questions, contact us at <a href="mailto:support@mentara.com" style="color: ${BRAND_COLORS.primary};">support@mentara.com</a>
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

${type === 'registration' ? `
Welcome to Mentara! Here's what you'll get:
• Access to licensed mental health professionals
• Supportive community forums and groups
• Personalized mental health assessments
• Interactive worksheets and progress tracking
• 24/7 crisis support and resources
` : ''}

Need help? Contact us at support@mentara.com

© 2024 Mentara. All rights reserved.
Making mental health care accessible to everyone.
`;

  return {
    subject: config.title,
    html,
    text
  };
}

export async function sendOtpEmail(data: OtpEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const template = generateOtpEmailTemplate(data);
    
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
      company_website: 'https://mentara.com'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ OTP email sent successfully:', response);
    
    return {
      success: true,
      message: 'Verification code sent successfully!'
    };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    
    return {
      success: false,
      message: 'Failed to send verification code. Please try again.'
    };
  }
}

// Utility function to generate random OTP
export function generateOtp(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
}

// Utility function to format expiry time
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