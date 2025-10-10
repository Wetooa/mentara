import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import emailjs from '@emailjs/nodejs';
import { env } from '$env/dynamic/private';

// Environment variables for EmailJS configuration
// These should be set in .env file
const EMAILJS_SERVICE_ID = env.EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = env.EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = env.EMAILJS_PUBLIC_KEY || '';
const EMAILJS_PRIVATE_KEY = env.EMAILJS_PRIVATE_KEY || '';
const IS_DEBUG = env.NODE_ENV === 'development';

interface DemoFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
  email: string;
  contactNumber: string;
  companySize?: string;
  message?: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse request body
    const formData: DemoFormData = await request.json();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.companyName) {
      return json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Check if EmailJS is configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      const missingVars = [];
      if (!EMAILJS_SERVICE_ID) missingVars.push('EMAILJS_SERVICE_ID');
      if (!EMAILJS_TEMPLATE_ID) missingVars.push('EMAILJS_TEMPLATE_ID');
      if (!EMAILJS_PUBLIC_KEY) missingVars.push('EMAILJS_PUBLIC_KEY');
      
      console.error('EmailJS not configured. Missing environment variables:', missingVars.join(', '));
      
      if (IS_DEBUG) {
        return json(
          {
            success: false,
            message: `Debug: Missing environment variables: ${missingVars.join(', ')}. Check your .env file.`,
          },
          { status: 500 }
        );
      }
      
      return json(
        {
          success: false,
          message: 'Email service is not configured. Please contact support.',
        },
        { status: 500 }
      );
    }
    
    if (IS_DEBUG) {
      console.log('📧 Debug Mode - EmailJS Config Status:', {
        hasServiceId: !!EMAILJS_SERVICE_ID,
        hasTemplateId: !!EMAILJS_TEMPLATE_ID,
        hasPublicKey: !!EMAILJS_PUBLIC_KEY,
        hasPrivateKey: !!EMAILJS_PRIVATE_KEY,
        serviceId: EMAILJS_SERVICE_ID.substring(0, 10) + '...',
      });
    }

    // Initialize EmailJS for Node.js (server-side)
    const initConfig: any = {
      publicKey: EMAILJS_PUBLIC_KEY,
    };
    
    // Add private key if available for enhanced security
    if (EMAILJS_PRIVATE_KEY) {
      initConfig.privateKey = EMAILJS_PRIVATE_KEY;
    }
    
    emailjs.init(initConfig);

    // Prepare email template parameters
    const templateParams = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      companyName: formData.companyName,
      jobTitle: formData.jobTitle,
      email: formData.email,
      contactNumber: formData.contactNumber,
      companySize: formData.companySize || 'Not specified',
      message: formData.message || 'No additional message',
      submittedAt: new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
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

    // Send email using EmailJS
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Demo request email sent successfully:', {
      email: formData.email,
      company: formData.companyName,
    });

    return json({
      success: true,
      message: 'Demo request sent successfully! We will contact you soon.',
    });
  } catch (error) {
    console.error('❌ Failed to send demo request email:', error);
    
    return json(
      {
        success: false,
        message: 'Failed to send demo request. Please try again later or contact us directly.',
      },
      { status: 500 }
    );
  }
};

