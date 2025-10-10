import emailjs from '@emailjs/browser';

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface DemoFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
  email: string;
  contactNumber: string;
  companySize?: string;
  message?: string;
}

let isInitialized = false;

export function initEmailJS(publicKey: string): void {
  if (!isInitialized) {
    emailjs.init({
      publicKey,
    });
    isInitialized = true;
  }
}

export async function sendDemoRequest(
  formData: DemoFormData,
  config: EmailConfig
): Promise<{ success: boolean; message: string }> {
  try {
    if (!isInitialized) {
      initEmailJS(config.publicKey);
    }

    const templateParams = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      companyName: formData.companyName,
      jobTitle: formData.jobTitle,
      email: formData.email,
      contactNumber: formData.contactNumber,
      companySize: formData.companySize || 'Not specified',
      message: formData.message || 'No additional message',
      submittedAt: new Date().toLocaleString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #436B00; text-align: center; margin-bottom: 30px;">📋 New Demo Request - Mentara</h1>
            
            <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 6px;">
              <h3 style="color: #065F46; margin: 0 0 15px 0;">Contact Information:</h3>
              <p style="color: #065F46; margin: 5px 0;"><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
              <p style="color: #065F46; margin: 5px 0;"><strong>Email:</strong> ${formData.email}</p>
              <p style="color: #065F46; margin: 5px 0;"><strong>Phone:</strong> ${formData.contactNumber}</p>
            </div>

            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 6px;">
              <h3 style="color: #92400E; margin: 0 0 15px 0;">Company Information:</h3>
              <p style="color: #92400E; margin: 5px 0;"><strong>Company:</strong> ${formData.companyName}</p>
              <p style="color: #92400E; margin: 5px 0;"><strong>Job Title:</strong> ${formData.jobTitle}</p>
              <p style="color: #92400E; margin: 5px 0;"><strong>Company Size:</strong> ${formData.companySize || 'Not specified'}</p>
            </div>

            ${formData.message ? `
            <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0; border-radius: 6px;">
              <h3 style="color: #1E40AF; margin: 0 0 15px 0;">Additional Message:</h3>
              <p style="color: #1E40AF; margin: 5px 0; white-space: pre-wrap;">${formData.message}</p>
            </div>
            ` : ''}

            <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
              Submitted at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };

    await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams
    );

    return {
      success: true,
      message: 'Demo request sent successfully! We will contact you soon.',
    };
  } catch (error) {
    console.error('Failed to send demo request:', error);
    return {
      success: false,
      message: 'Failed to send demo request. Please try again later.',
    };
  }
}

