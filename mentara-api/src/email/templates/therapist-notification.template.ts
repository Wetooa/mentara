import { BaseEmailTemplate, EmailTemplate, BaseEmailData } from './base.template';

export interface TherapistNotificationData extends BaseEmailData {
  applicationId: string;
  submissionDate: string;
}

export class TherapistNotificationTemplate extends BaseEmailTemplate<TherapistNotificationData> {
  generate(data: TherapistNotificationData): EmailTemplate {
    const { to_name, applicationId, submissionDate } = data;

    const content = `
        <div class="header">
            <div class="logo">Mentara</div>
            <div class="tagline">Your Mental Health Companion</div>
            <div class="header-icon">📋</div>
            <div class="header-title">Application Received</div>
            <div class="header-subtitle">Thank you for applying to join our therapist network</div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${to_name},</div>
            
            <div class="description">
                Thank you for submitting your application to become a therapist with Mentara. 
                We have successfully received your application and our team will review it carefully.
            </div>
            
            <div style="background: linear-gradient(135deg, ${this.BRAND_COLORS.light} 0%, #F3F4F6 100%); 
                        border: 2px solid ${this.BRAND_COLORS.success}; 
                        border-radius: 16px; 
                        padding: 24px; 
                        margin: 32px 0;">
                <div style="font-size: 16px; 
                           color: ${this.BRAND_COLORS.success}; 
                           font-weight: 600; 
                           margin-bottom: 16px;">
                    ✅ Application Details
                </div>
                <div style="font-size: 14px; color: #6B7280; margin-bottom: 8px;">
                    <strong>Application ID:</strong> ${applicationId}
                </div>
                <div style="font-size: 14px; color: #6B7280;">
                    <strong>Submitted:</strong> ${submissionDate}
                </div>
            </div>
            
            <div style="margin: 32px 0;">
                <div style="font-size: 16px; 
                           font-weight: 600; 
                           color: ${this.BRAND_COLORS.dark}; 
                           margin-bottom: 16px;">
                    What happens next?
                </div>
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <div style="background: ${this.BRAND_COLORS.primary}; 
                                   color: ${this.BRAND_COLORS.white}; 
                                   border-radius: 50%; 
                                   width: 24px; 
                                   height: 24px; 
                                   display: flex; 
                                   align-items: center; 
                                   justify-content: center; 
                                   font-size: 12px; 
                                   font-weight: 600; 
                                   margin-right: 12px; 
                                   flex-shrink: 0;">1</div>
                        <div>
                            <div style="font-weight: 600; margin-bottom: 4px;">Document Review</div>
                            <div style="font-size: 14px; color: #6B7280;">
                                Our team will verify your credentials and documentation
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <div style="background: ${this.BRAND_COLORS.primary}; 
                                   color: ${this.BRAND_COLORS.white}; 
                                   border-radius: 50%; 
                                   width: 24px; 
                                   height: 24px; 
                                   display: flex; 
                                   align-items: center; 
                                   justify-content: center; 
                                   font-size: 12px; 
                                   font-weight: 600; 
                                   margin-right: 12px; 
                                   flex-shrink: 0;">2</div>
                        <div>
                            <div style="font-weight: 600; margin-bottom: 4px;">Background Check</div>
                            <div style="font-size: 14px; color: #6B7280;">
                                Standard background verification process
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: flex-start;">
                        <div style="background: ${this.BRAND_COLORS.primary}; 
                                   color: ${this.BRAND_COLORS.white}; 
                                   border-radius: 50%; 
                                   width: 24px; 
                                   height: 24px; 
                                   display: flex; 
                                   align-items: center; 
                                   justify-content: center; 
                                   font-size: 12px; 
                                   font-weight: 600; 
                                   margin-right: 12px; 
                                   flex-shrink: 0;">3</div>
                        <div>
                            <div style="font-weight: 600; margin-bottom: 4px;">Final Decision</div>
                            <div style="font-size: 14px; color: #6B7280;">
                                You'll receive notification of our decision within 5-7 business days
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background-color: #EFF6FF; 
                        border-left: 4px solid ${this.BRAND_COLORS.accent}; 
                        padding: 16px; 
                        border-radius: 8px; 
                        margin: 24px 0;">
                <div style="font-size: 14px; 
                           color: #1E40AF; 
                           font-weight: 600; 
                           margin-bottom: 8px;">
                    💡 Need to update your application?
                </div>
                <div style="font-size: 14px; color: #1E40AF;">
                    If you need to provide additional information or make changes to your application, 
                    please contact us with your application ID.
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
                <div style="font-size: 14px; color: #6B7280; margin-bottom: 16px;">
                    Questions about your application?
                </div>
                <a href="mailto:therapist-support@mentara.com" 
                   style="color: ${this.BRAND_COLORS.primary}; 
                          text-decoration: none; 
                          font-weight: 600;">
                    Contact Therapist Support
                </a>
            </div>
        </div>`;

    const html = this.generateBaseHtml(content);

    const text = `
Application Received - Mentara Therapist Network

Hello ${to_name},

Thank you for submitting your application to become a therapist with Mentara. We have successfully received your application and our team will review it carefully.

Application Details:
- Application ID: ${applicationId}
- Submitted: ${submissionDate}

What happens next?

1. Document Review
   Our team will verify your credentials and documentation

2. Background Check  
   Standard background verification process

3. Final Decision
   You'll receive notification of our decision within 5-7 business days

Need to update your application? If you need to provide additional information or make changes to your application, please contact us with your application ID.

Questions about your application? Contact our therapist support team at therapist-support@mentara.com

Best regards,
The Mentara Team
    `.trim();

    return {
      subject: 'Application Received - Mentara Therapist Network',
      html,
      text,
    };
  }
}