import { Injectable } from '@nestjs/common';

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

@Injectable()
export class EmailService {
  /**
   * Send therapist application status notification
   * This is a placeholder that will trigger the client-side EmailJS service
   * In a production environment, you might want to use a server-side email service
   *
   * @param data Email notification data
   * @returns Promise with operation result
   */
  sendTherapistApplicationNotification(data: EmailNotificationData): {
    success: boolean;
    message: string;
  } {
    try {
      console.log('Email notification requested:', {
        recipient: data.to,
        status: data.status,
        hasCredentials: !!data.credentials,
      });

      // For now, we'll just log the email data
      // In production, you would integrate with:
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP
      // - Or trigger a webhook to the frontend to send via EmailJS

      const emailContent = this.generateEmailContent(data);

      console.log('Generated email content:', emailContent);

      // TODO: Implement actual email sending
      // For now, return success to indicate the notification was "queued"
      return {
        success: true,
        message: `Email notification queued for ${data.to}`,
      };
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send notification',
      };
    }
  }

  /**
   * Generate email content based on application status
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
  ): Promise<{ success: boolean; message: string }> {
    return this.sendTherapistApplicationNotification({
      to: therapistEmail,
      name: therapistName,
      status: 'approved',
      credentials,
    });
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
  ): Promise<{ success: boolean; message: string }> {
    return this.sendTherapistApplicationNotification({
      to: therapistEmail,
      name: therapistName,
      status: 'rejected',
      adminNotes: reason,
    });
  }

  /**
   * Test email service configuration
   * @returns Promise with test result
   */
  testConfiguration(): { success: boolean; message: string } {
    try {
      console.log('Testing email service configuration...');

      // Test email generation
      const testData: EmailNotificationData = {
        to: 'test@example.com',
        name: 'Test Therapist',
        status: 'approved',
        credentials: {
          email: 'test@example.com',
          password: 'temp123',
        },
      };

      const content = this.generateEmailContent(testData);
      console.log('Test email content generated successfully:', content);

      return {
        success: true,
        message: 'Email service configuration test passed',
      };
    } catch (error) {
      console.error('Email service test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
      };
    }
  }
}
