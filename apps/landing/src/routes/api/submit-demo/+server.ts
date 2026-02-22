import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import emailjs from "@emailjs/nodejs";
import { env } from "$env/dynamic/private";

// Environment variables for EmailJS configuration
// These should be set in .env file
const EMAILJS_SERVICE_ID = env.EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = env.EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = env.EMAILJS_PUBLIC_KEY || "";
const EMAILJS_PRIVATE_KEY = env.EMAILJS_PRIVATE_KEY || "";
const IS_DEBUG = env.NODE_ENV === "development";

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
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.companyName
    ) {
      return json(
        {
          success: false,
          message: "Missing required fields",
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
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Check if EmailJS is configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      const missingVars = [];
      if (!EMAILJS_SERVICE_ID) missingVars.push("EMAILJS_SERVICE_ID");
      if (!EMAILJS_TEMPLATE_ID) missingVars.push("EMAILJS_TEMPLATE_ID");
      if (!EMAILJS_PUBLIC_KEY) missingVars.push("EMAILJS_PUBLIC_KEY");

      console.error(
        "EmailJS not configured. Missing environment variables:",
        missingVars.join(", ")
      );

      if (IS_DEBUG) {
        return json(
          {
            success: false,
            message: `Debug: Missing environment variables: ${missingVars.join(
              ", "
            )}. Check your .env file.`,
          },
          { status: 500 }
        );
      }

      return json(
        {
          success: false,
          message: "Email service is not configured. Please contact support.",
        },
        { status: 500 }
      );
    }

    if (IS_DEBUG) {
      console.log("📧 Debug Mode - EmailJS Config Status:", {
        hasServiceId: !!EMAILJS_SERVICE_ID,
        hasTemplateId: !!EMAILJS_TEMPLATE_ID,
        hasPublicKey: !!EMAILJS_PUBLIC_KEY,
        hasPrivateKey: !!EMAILJS_PRIVATE_KEY,
        serviceId: EMAILJS_SERVICE_ID.substring(0, 10) + "...",
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

    // Prepare professional subject line
    const subject = `🎯 New Demo Request from ${formData.firstName} ${formData.lastName} at ${formData.companyName}`;

    // Prepare email template parameters with beautiful HTML
    const templateParams = {
      subject,
      to_name: "Mentara Team",
      from_name: `${formData.firstName} ${formData.lastName}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      companyName: formData.companyName,
      jobTitle: formData.jobTitle,
      email: formData.email,
      contactNumber: formData.contactNumber,
      companySize: formData.companySize || "Not specified",
      message: formData.message || "No additional message provided",
      submittedAt: new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Demo Request - Mentara</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header with Mentara Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #6B9900 0%, #4A6B00 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">
                📋 New Demo Request
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Someone wants to learn more about Mentara!
              </p>
            </td>
          </tr>

          <!-- Priority Banner -->
          <tr>
            <td style="background-color: #FEF3C7; padding: 16px 30px; border-bottom: 3px solid #F59E0B;">
              <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600; text-align: center;">
                ⚡ High Priority - New Lead
              </p>
            </td>
          </tr>

          <!-- Contact Information -->
          <tr>
            <td style="padding: 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px 0; color: #6B9900; font-size: 20px; font-weight: bold; border-bottom: 2px solid #6B9900; padding-bottom: 10px;">
                      👤 Contact Information
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; background-color: #F0FDF4; border-left: 4px solid #10B981; border-radius: 8px; margin-bottom: 12px;">
                    <p style="margin: 0 0 8px 0; color: #065F46; font-size: 15px;">
                      <strong style="display: inline-block; width: 100px;">Name:</strong>
                      <span style="font-size: 16px; font-weight: 600;">${
                        formData.firstName
                      } ${formData.lastName}</span>
                    </p>
                    <p style="margin: 8px 0; color: #065F46; font-size: 15px;">
                      <strong style="display: inline-block; width: 100px;">Email:</strong>
                      <a href="mailto:${
                        formData.email
                      }" style="color: #6B9900; text-decoration: none; font-weight: 500;">${
        formData.email
      }</a>
                    </p>
                    <p style="margin: 8px 0 0 0; color: #065F46; font-size: 15px;">
                      <strong style="display: inline-block; width: 100px;">Phone:</strong>
                      <a href="tel:${
                        formData.contactNumber
                      }" style="color: #6B9900; text-decoration: none; font-weight: 500;">${
        formData.contactNumber
      }</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Company Information -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px 0; color: #6B9900; font-size: 20px; font-weight: bold; border-bottom: 2px solid #6B9900; padding-bottom: 10px;">
                      🏢 Company Information
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; background-color: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; color: #78350F; font-size: 15px;">
                      <strong style="display: inline-block; width: 130px;">Company:</strong>
                      <span style="font-size: 16px; font-weight: 600;">${
                        formData.companyName
                      }</span>
                    </p>
                    <p style="margin: 8px 0; color: #78350F; font-size: 15px;">
                      <strong style="display: inline-block; width: 130px;">Job Title:</strong>
                      ${formData.jobTitle}
                    </p>
                    <p style="margin: 8px 0 0 0; color: #78350F; font-size: 15px;">
                      <strong style="display: inline-block; width: 130px;">Company Size:</strong>
                      ${formData.companySize || "Not specified"}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            formData.message
              ? `
          <!-- Additional Message -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px 0; color: #6B9900; font-size: 20px; font-weight: bold; border-bottom: 2px solid #6B9900; padding-bottom: 10px;">
                      💬 Additional Message
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; background-color: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 8px;">
                    <p style="margin: 0; color: #1E3A8A; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${formData.message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Action Button -->
          <tr>
            <td style="padding: 20px 30px 30px 30px; text-align: center;">
              <a href="mailto:${
                formData.email
              }" style="display: inline-block; background: linear-gradient(135deg, #6B9900 0%, #4A6B00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(107, 153, 0, 0.3);">
                📧 Reply to ${formData.firstName}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 13px;">
                      <strong style="color: #6B9900;">⏰ Submitted:</strong> ${new Date().toLocaleString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          timeZoneName: "short",
                        }
                      )}
                    </p>
                    <p style="margin: 8px 0 0 0; color: #9CA3AF; font-size: 12px;">
                      This is an automated notification from the Mentara Landing Page
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Branding Footer -->
          <tr>
            <td style="padding: 20px; background: linear-gradient(135deg, #6B9900 0%, #4A6B00 100%); text-align: center;">
              <p style="margin: 0; color: white; font-size: 18px; font-weight: bold;">
                Mentara
              </p>
              <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">
                Empowering Minds, Transforming Lives
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    // Send email using EmailJS
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

    console.log("✅ Demo request email sent successfully:", {
      email: formData.email,
      company: formData.companyName,
    });

    return json({
      success: true,
      message: "Demo request sent successfully! We will contact you soon.",
    });
  } catch (error) {
    console.error("❌ Failed to send demo request email:", error);

    return json(
      {
        success: false,
        message:
          "Failed to send demo request. Please try again later or contact us directly.",
      },
      { status: 500 }
    );
  }
};
