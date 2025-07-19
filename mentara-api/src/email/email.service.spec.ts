/*
 * Ultra-Comprehensive Test Suite for EmailService
 * 
 * This test suite provides extensive coverage for the EmailService class, which handles:
 * - Therapist application status notifications (approval/rejection)
 * - Email content generation with dynamic templates
 * - Generic email sending functionality
 * - Email delivery simulation and error handling
 * - Service configuration testing
 * - Welcome and rejection email workflows
 * 
 * Test Coverage Areas:
 * 1. Core Email Notification Methods (sendTherapistApplicationNotification)
 * 2. Email Content Generation (generateEmailContent) - approval/rejection scenarios
 * 3. Email Delivery Simulation (sendEmail) - success/failure scenarios
 * 4. Specialized Email Methods (welcome, rejection emails)
 * 5. Generic Email Functionality (sendGenericEmail)
 * 6. Service Configuration Testing (testConfiguration)
 * 7. Error Handling and Edge Cases
 * 8. Email Template Validation
 * 9. Performance and Memory Management
 * 10. Integration Workflows and Real-world Scenarios
 * 
 * Testing Approach:
 * - Comprehensive method coverage with multiple scenarios per method
 * - Detailed validation of email content generation
 * - Error simulation and recovery testing
 * - Performance testing with batch operations
 * - Memory leak prevention testing
 * - Edge case handling (invalid inputs, network failures, etc.)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EmailService, EmailNotificationData } from './email.service';

describe('EmailService - Ultra-Comprehensive Test Suite', () => {
  let service: EmailService;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
    
    // Setup console spies to capture logs
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock Math.random for predictable test outcomes
    mathRandomSpy = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Core Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of EmailService', () => {
      expect(service).toBeInstanceOf(EmailService);
    });

    it('should have all required methods', () => {
      expect(typeof service.sendTherapistApplicationNotification).toBe('function');
      expect(typeof service.sendTherapistWelcomeEmail).toBe('function');
      expect(typeof service.sendTherapistRejectionEmail).toBe('function');
      expect(typeof service.testConfiguration).toBe('function');
      expect(typeof service.sendGenericEmail).toBe('function');
    });
  });

  describe('sendTherapistApplicationNotification - Comprehensive Testing', () => {
    describe('Successful Approval Notifications', () => {
      beforeEach(() => {
        // Mock successful email delivery (> 0.1 for success)
        mathRandomSpy.mockReturnValue(0.2);
      });

      it('should send successful approval notification with credentials', () => {
        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. John Smith',
          status: 'approved',
          credentials: {
            email: 'therapist@example.com',
            password: 'tempPassword123'
          }
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Email notification sent to therapist@example.com');
        expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
          recipient: 'therapist@example.com',
          status: 'approved',
          hasCredentials: true,
        });
        expect(consoleSpy).toHaveBeenCalledWith('✅ Email sent successfully to therapist@example.com');
      });

      it('should send successful approval notification without credentials', () => {
        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. Jane Doe',
          status: 'approved'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Email notification sent to therapist@example.com');
        expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
          recipient: 'therapist@example.com',
          status: 'approved',
          hasCredentials: false,
        });
      });

      it('should send approval notification with admin notes', () => {
        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. Sarah Wilson',
          status: 'approved',
          adminNotes: 'Excellent credentials and experience. Welcome to the team!'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Email notification sent to therapist@example.com');
      });

      it('should send approval notification with both credentials and admin notes', () => {
        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. Michael Brown',
          status: 'approved',
          credentials: {
            email: 'therapist@example.com',
            password: 'secure123'
          },
          adminNotes: 'Welcome! Please complete your profile setup within 7 days.'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Email notification sent to therapist@example.com');
      });
    });

    describe('Successful Rejection Notifications', () => {
      beforeEach(() => {
        mathRandomSpy.mockReturnValue(0.2);
      });

      it('should send successful rejection notification', () => {
        const emailData: EmailNotificationData = {
          to: 'applicant@example.com',
          name: 'Dr. Alice Johnson',
          status: 'rejected'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Email notification sent to applicant@example.com');
        expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
          recipient: 'applicant@example.com',
          status: 'rejected',
          hasCredentials: false,
        });
      });

      it('should send rejection notification with admin notes', () => {
        const emailData: EmailNotificationData = {
          to: 'applicant@example.com',
          name: 'Dr. Robert Taylor',
          status: 'rejected',
          adminNotes: 'Please provide additional documentation for your license verification.'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Email notification sent to applicant@example.com');
      });
    });

    describe('Email Delivery Failures', () => {
      it('should handle email service unavailable (5% failure rate)', () => {
        mathRandomSpy.mockReturnValue(0.03); // Less than 0.05

        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. Test',
          status: 'approved'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to send email: Email service temporarily unavailable');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Failed to send email to therapist@example.com: Email service temporarily unavailable'
        );
      });

      it('should handle invalid email address (5% invalid email simulation)', () => {
        mathRandomSpy.mockReturnValue(0.08); // Between 0.05 and 0.1

        const emailData: EmailNotificationData = {
          to: 'invalid-email',
          name: 'Dr. Test',
          status: 'approved'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to send email: Invalid email address format');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Failed to send email to invalid-email: Invalid email address format'
        );
      });
    });

    describe('Error Handling and Edge Cases', () => {
      it('should handle exceptions during email sending', () => {
        // Mock an exception in the private sendEmail method by causing Math.random to throw
        mathRandomSpy.mockImplementation(() => {
          throw new Error('Random generator failed');
        });

        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. Test',
          status: 'approved'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Random generator failed');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to send email notification:',
          expect.any(Error)
        );
      });

      it('should handle non-Error exceptions', () => {
        mathRandomSpy.mockImplementation(() => {
          throw 'String error';
        });

        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. Test',
          status: 'approved'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to send notification');
      });

      it('should handle empty email address', () => {
        mathRandomSpy.mockReturnValue(0.2);

        const emailData: EmailNotificationData = {
          to: '',
          name: 'Dr. Test',
          status: 'approved'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(true); // Service doesn't validate email format
        expect(result.message).toBe('Email notification sent to ');
      });

      it('should handle empty name', () => {
        mathRandomSpy.mockReturnValue(0.2);

        const emailData: EmailNotificationData = {
          to: 'test@example.com',
          name: '',
          status: 'approved'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Email notification sent to test@example.com');
      });

      it('should handle special characters in name and email', () => {
        mathRandomSpy.mockReturnValue(0.2);

        const emailData: EmailNotificationData = {
          to: 'test+tag@example.co.uk',
          name: 'Dr. María José Ñoño-Smith',
          status: 'approved'
        };

        const result = service.sendTherapistApplicationNotification(emailData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Email notification sent to test+tag@example.co.uk');
      });
    });
  });

  describe('Email Content Generation - Comprehensive Testing', () => {
    describe('Approval Email Content', () => {
      it('should generate correct approval email content with credentials', () => {
        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. John Smith',
          status: 'approved',
          credentials: {
            email: 'therapist@example.com',
            password: 'tempPassword123'
          }
        };

        // Access private method through service instance
        const content = (service as any).generateEmailContent(emailData);

        expect(content.subject).toBe('Mentara Therapist Application Approved');
        expect(content.greeting).toBe('Dear Dr. John Smith,');
        expect(content.companySignature).toBe('Best regards,\nThe Mentara Team\nsupport@mentara.com');
        expect(content.body).toContain('Congratulations! Your therapist application has been approved.');
        expect(content.body).toContain('Your account credentials:');
        expect(content.body).toContain('Email: therapist@example.com');
        expect(content.body).toContain('Temporary Password: tempPassword123');
        expect(content.body).toContain('Please log in and change your password immediately.');
        expect(content.body).toContain('You can access your therapist dashboard at: https://mentara.com/therapist');
        expect(content.body).toContain('Welcome to the Mentara therapist network!');
      });

      it('should generate correct approval email content without credentials', () => {
        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. Jane Doe',
          status: 'approved'
        };

        const content = (service as any).generateEmailContent(emailData);

        expect(content.subject).toBe('Mentara Therapist Application Approved');
        expect(content.greeting).toBe('Dear Dr. Jane Doe,');
        expect(content.body).toContain('Congratulations! Your therapist application has been approved.');
        expect(content.body).not.toContain('Your account credentials:');
        expect(content.body).not.toContain('Email:');
        expect(content.body).not.toContain('Temporary Password:');
        expect(content.body).toContain('Welcome to the Mentara therapist network!');
      });

      it('should generate approval email content with admin notes', () => {
        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. Sarah Wilson',
          status: 'approved',
          adminNotes: 'Excellent credentials and experience. Welcome to the team!'
        };

        const content = (service as any).generateEmailContent(emailData);

        expect(content.body).toContain('Additional notes from our team:');
        expect(content.body).toContain('Excellent credentials and experience. Welcome to the team!');
      });

      it('should generate approval email content with both credentials and admin notes', () => {
        const emailData: EmailNotificationData = {
          to: 'therapist@example.com',
          name: 'Dr. Michael Brown',
          status: 'approved',
          credentials: {
            email: 'therapist@example.com',
            password: 'secure123'
          },
          adminNotes: 'Welcome! Please complete your profile setup within 7 days.'
        };

        const content = (service as any).generateEmailContent(emailData);

        expect(content.body).toContain('Your account credentials:');
        expect(content.body).toContain('Email: therapist@example.com');
        expect(content.body).toContain('Temporary Password: secure123');
        expect(content.body).toContain('Additional notes from our team:');
        expect(content.body).toContain('Welcome! Please complete your profile setup within 7 days.');
      });
    });

    describe('Rejection Email Content', () => {
      it('should generate correct rejection email content without admin notes', () => {
        const emailData: EmailNotificationData = {
          to: 'applicant@example.com',
          name: 'Dr. Alice Johnson',
          status: 'rejected'
        };

        const content = (service as any).generateEmailContent(emailData);

        expect(content.subject).toBe('Mentara Therapist Application Update');
        expect(content.greeting).toBe('Dear Dr. Alice Johnson,');
        expect(content.companySignature).toBe('Best regards,\nThe Mentara Team\nsupport@mentara.com');
        expect(content.body).toContain('Thank you for your interest in joining the Mentara therapist network.');
        expect(content.body).toContain('After careful review, we have decided not to approve your application at this time.');
        expect(content.body).toContain('We encourage you to address any concerns mentioned above and reapply in the future.');
        expect(content.body).toContain("If you have any questions, please don't hesitate to contact our support team.");
        expect(content.body).not.toContain('Feedback from our review team:');
      });

      it('should generate rejection email content with admin notes', () => {
        const emailData: EmailNotificationData = {
          to: 'applicant@example.com',
          name: 'Dr. Robert Taylor',
          status: 'rejected',
          adminNotes: 'Please provide additional documentation for your license verification.'
        };

        const content = (service as any).generateEmailContent(emailData);

        expect(content.body).toContain('Feedback from our review team:');
        expect(content.body).toContain('Please provide additional documentation for your license verification.');
      });

      it('should generate rejection email content with long admin notes', () => {
        const longNotes = 'We appreciate your application. However, we need the following items: 1) Updated license documentation, 2) Three professional references, 3) Proof of malpractice insurance, 4) Completed background check form. Please resubmit when you have all required documents.';
        
        const emailData: EmailNotificationData = {
          to: 'applicant@example.com',
          name: 'Dr. Test User',
          status: 'rejected',
          adminNotes: longNotes
        };

        const content = (service as any).generateEmailContent(emailData);

        expect(content.body).toContain('Feedback from our review team:');
        expect(content.body).toContain(longNotes);
      });
    });

    describe('Email Content Edge Cases', () => {
      it('should handle special characters in name', () => {
        const emailData: EmailNotificationData = {
          to: 'test@example.com',
          name: 'Dr. María José Ñoño-Smith',
          status: 'approved'
        };

        const content = (service as any).generateEmailContent(emailData);

        expect(content.greeting).toBe('Dear Dr. María José Ñoño-Smith,');
      });

      it('should handle empty admin notes', () => {
        const emailData: EmailNotificationData = {
          to: 'test@example.com',
          name: 'Dr. Test',
          status: 'approved',
          adminNotes: ''
        };

        const content = (service as any).generateEmailContent(emailData);

        expect(content.body).not.toContain('Additional notes from our team:');
      });

      it('should handle undefined credentials properties', () => {
        const emailData: EmailNotificationData = {
          to: 'test@example.com',
          name: 'Dr. Test',
          status: 'approved',
          credentials: {
            email: '',
            password: ''
          }
        };

        const content = (service as any).generateEmailContent(emailData);

        expect(content.body).toContain('Your account credentials:');
        expect(content.body).toContain('Email: ');
        expect(content.body).toContain('Temporary Password: ');
      });
    });
  });

  describe('sendTherapistWelcomeEmail - Comprehensive Testing', () => {
    beforeEach(() => {
      mathRandomSpy.mockReturnValue(0.2); // Ensure success
    });

    it('should send welcome email successfully', async () => {
      const credentials = {
        email: 'therapist@example.com',
        password: 'tempPassword123'
      };

      const result = await service.sendTherapistWelcomeEmail(
        'therapist@example.com',
        'Dr. John Smith',
        credentials
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email notification sent to therapist@example.com');
    });

    it('should handle welcome email delivery failure', async () => {
      mathRandomSpy.mockReturnValue(0.03); // Trigger failure

      const credentials = {
        email: 'therapist@example.com',
        password: 'tempPassword123'
      };

      const result = await service.sendTherapistWelcomeEmail(
        'therapist@example.com',
        'Dr. Jane Doe',
        credentials
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to send email: Email service temporarily unavailable');
    });

    it('should handle special characters in therapist name and email', async () => {
      const credentials = {
        email: 'test+tag@example.co.uk',
        password: 'secure123'
      };

      const result = await service.sendTherapistWelcomeEmail(
        'test+tag@example.co.uk',
        'Dr. José María Rodríguez',
        credentials
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email notification sent to test+tag@example.co.uk');
    });

    it('should handle empty password in credentials', async () => {
      const credentials = {
        email: 'therapist@example.com',
        password: ''
      };

      const result = await service.sendTherapistWelcomeEmail(
        'therapist@example.com',
        'Dr. Test',
        credentials
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email notification sent to therapist@example.com');
    });
  });

  describe('sendTherapistRejectionEmail - Comprehensive Testing', () => {
    beforeEach(() => {
      mathRandomSpy.mockReturnValue(0.2); // Ensure success
    });

    it('should send rejection email successfully without reason', async () => {
      const result = await service.sendTherapistRejectionEmail(
        'applicant@example.com',
        'Dr. Alice Johnson'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email notification sent to applicant@example.com');
    });

    it('should send rejection email successfully with reason', async () => {
      const reason = 'Please provide additional documentation for your license verification.';

      const result = await service.sendTherapistRejectionEmail(
        'applicant@example.com',
        'Dr. Robert Taylor',
        reason
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email notification sent to applicant@example.com');
    });

    it('should handle rejection email delivery failure', async () => {
      mathRandomSpy.mockReturnValue(0.08); // Trigger invalid email failure

      const result = await service.sendTherapistRejectionEmail(
        'invalid-email',
        'Dr. Test'
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to send email: Invalid email address format');
    });

    it('should handle empty reason parameter', async () => {
      const result = await service.sendTherapistRejectionEmail(
        'applicant@example.com',
        'Dr. Test',
        ''
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email notification sent to applicant@example.com');
    });

    it('should handle very long rejection reason', async () => {
      const longReason = 'We have carefully reviewed your application and found several areas that need attention: ' +
        '1. Your license documentation appears to be expired, ' +
        '2. We need three professional references from licensed practitioners, ' +
        '3. Your malpractice insurance certificate is missing, ' +
        '4. The background check form needs to be completed and notarized, ' +
        '5. Additional continuing education credits are required. ' +
        'Please address all these items and resubmit your application. ' +
        'We encourage you to contact our support team if you have any questions about these requirements.';

      const result = await service.sendTherapistRejectionEmail(
        'applicant@example.com',
        'Dr. Complex Case',
        longReason
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email notification sent to applicant@example.com');
    });
  });

  describe('sendGenericEmail - Comprehensive Testing', () => {
    beforeEach(() => {
      mathRandomSpy.mockReturnValue(0.2); // Ensure success
    });

    it('should send generic email successfully', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Welcome to Mentara',
        template: 'welcome',
        data: {
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      await expect(service.sendGenericEmail(emailData)).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith('Sending email:', {
        to: 'user@example.com',
        subject: 'Welcome to Mentara',
        template: 'welcome',
      });
    });

    it('should handle generic email delivery failure', async () => {
      mathRandomSpy.mockReturnValue(0.03); // Trigger failure

      const emailData = {
        to: 'user@example.com',
        subject: 'Test Email',
        template: 'test',
        data: {}
      };

      await expect(service.sendGenericEmail(emailData)).rejects.toThrow('Email service temporarily unavailable');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send email:',
        expect.any(Error)
      );
    });

    it('should handle complex email data', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Complex Email Test',
        template: 'complex',
        data: {
          user: {
            firstName: 'Jane',
            lastName: 'Smith',
            preferences: {
              language: 'en',
              timezone: 'UTC'
            }
          },
          content: {
            title: 'Welcome Message',
            body: 'This is a complex email with nested data structures.',
            links: [
              { text: 'Dashboard', url: 'https://mentara.com/dashboard' },
              { text: 'Profile', url: 'https://mentara.com/profile' }
            ]
          }
        }
      };

      await expect(service.sendGenericEmail(emailData)).resolves.toBeUndefined();
    });

    it('should handle empty email data', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Empty Data Test',
        template: 'empty',
        data: {}
      };

      await expect(service.sendGenericEmail(emailData)).resolves.toBeUndefined();
    });

    it('should handle email delivery error from sendEmail method', async () => {
      mathRandomSpy.mockImplementation(() => {
        throw new Error('Network connection failed');
      });

      const emailData = {
        to: 'user@example.com',
        subject: 'Error Test',
        template: 'error',
        data: {}
      };

      await expect(service.sendGenericEmail(emailData)).rejects.toThrow('Network connection failed');
    });
  });

  describe('testConfiguration - Comprehensive Testing', () => {
    it('should test configuration successfully', () => {
      const result = service.testConfiguration();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email service configuration test passed');
      expect(consoleSpy).toHaveBeenCalledWith('Testing email service configuration...');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Test email content generated successfully:',
        expect.any(Object)
      );
    });

    it('should handle configuration test failure', () => {
      // Mock an error in the generateEmailContent method by overriding the private method
      const originalGenerateEmailContent = (service as any).generateEmailContent;
      (service as any).generateEmailContent = jest.fn().mockImplementation(() => {
        throw new Error('Email template not found');
      });

      const result = service.testConfiguration();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email template not found');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Email service test failed:',
        expect.any(Error)
      );

      // Restore original method
      (service as any).generateEmailContent = originalGenerateEmailContent;
    });

    it('should handle non-Error exceptions in configuration test', () => {
      const originalGenerateEmailContent = (service as any).generateEmailContent;
      (service as any).generateEmailContent = jest.fn().mockImplementation(() => {
        throw 'String error';
      });

      const result = service.testConfiguration();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Test failed');

      // Restore original method
      (service as any).generateEmailContent = originalGenerateEmailContent;
    });

    it('should verify test email data structure', () => {
      const result = service.testConfiguration();

      expect(result.success).toBe(true);
      // Verify that the test was called with expected data structure
      expect(consoleSpy).toHaveBeenCalledWith(
        'Test email content generated successfully:',
        expect.objectContaining({
          subject: expect.stringContaining('Mentara Therapist Application'),
          greeting: 'Dear Test Therapist,',
          body: expect.stringContaining('Congratulations!'),
          companySignature: 'Best regards,\nThe Mentara Team\nsupport@mentara.com'
        })
      );
    });
  });

  describe('Performance and Memory Management', () => {
    beforeEach(() => {
      mathRandomSpy.mockReturnValue(0.2); // Ensure success
    });

    it('should handle batch email operations efficiently', async () => {
      const startTime = Date.now();
      const batchSize = 50;
      const promises: Promise<any>[] = [];

      for (let i = 0; i < batchSize; i++) {
        const promise = service.sendTherapistWelcomeEmail(
          `therapist${i}@example.com`,
          `Dr. Test ${i}`,
          { email: `therapist${i}@example.com`, password: 'temp123' }
        );
        promises.push(promise);
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(batchSize);
      expect(results.every(result => result.success)).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent email operations', async () => {
      const concurrentOperations = [
        service.sendTherapistWelcomeEmail('user1@example.com', 'Dr. User 1', { email: 'user1@example.com', password: 'pass1' }),
        service.sendTherapistRejectionEmail('user2@example.com', 'Dr. User 2', 'Reason 2'),
        service.sendGenericEmail({ to: 'user3@example.com', subject: 'Test', template: 'test', data: {} }),
        service.testConfiguration()
      ];

      const results = await Promise.all(concurrentOperations);

      expect(results[0].success).toBe(true); // welcome email
      expect(results[1].success).toBe(true); // rejection email
      expect(results[3].success).toBe(true); // test configuration
      // sendGenericEmail resolves to undefined on success
    });

    it('should not have memory leaks with repeated operations', async () => {
      const iterations = 100;
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        await service.sendTherapistWelcomeEmail(
          `test${i}@example.com`,
          `Dr. Test ${i}`,
          { email: `test${i}@example.com`, password: 'temp' }
        );
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB for 100 operations)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Integration Workflows and Real-world Scenarios', () => {
    beforeEach(() => {
      mathRandomSpy.mockReturnValue(0.2);
    });

    describe('Therapist Approval Workflow', () => {
      it('should handle complete therapist approval workflow', async () => {
        // Simulate therapist application approval process
        const therapistData = {
          email: 'newtherapist@example.com',
          name: 'Dr. Sarah Johnson',
          credentials: {
            email: 'newtherapist@example.com',
            password: 'initialPassword123'
          },
          adminNotes: 'Excellent credentials. Welcome to the team!'
        };

        // Step 1: Send approval notification
        const approvalResult = service.sendTherapistApplicationNotification({
          to: therapistData.email,
          name: therapistData.name,
          status: 'approved',
          credentials: therapistData.credentials,
          adminNotes: therapistData.adminNotes
        });

        expect(approvalResult.success).toBe(true);

        // Step 2: Send welcome email
        const welcomeResult = await service.sendTherapistWelcomeEmail(
          therapistData.email,
          therapistData.name,
          therapistData.credentials
        );

        expect(welcomeResult.success).toBe(true);

        // Verify console logs show both operations
        expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
          recipient: therapistData.email,
          status: 'approved',
          hasCredentials: true,
        });
      });
    });

    describe('Therapist Rejection Workflow', () => {
      it('should handle complete therapist rejection workflow', async () => {
        const applicantData = {
          email: 'applicant@example.com',
          name: 'Dr. John Applicant',
          rejectionReason: 'Please provide updated license documentation and three professional references.'
        };

        // Step 1: Send rejection notification
        const rejectionResult = service.sendTherapistApplicationNotification({
          to: applicantData.email,
          name: applicantData.name,
          status: 'rejected',
          adminNotes: applicantData.rejectionReason
        });

        expect(rejectionResult.success).toBe(true);

        // Step 2: Send formal rejection email
        const formalRejectionResult = await service.sendTherapistRejectionEmail(
          applicantData.email,
          applicantData.name,
          applicantData.rejectionReason
        );

        expect(formalRejectionResult.success).toBe(true);
      });
    });

    describe('Bulk Email Operations', () => {
      it('should handle bulk approval notifications', async () => {
        const approvedTherapists = [
          { email: 'therapist1@example.com', name: 'Dr. Alice Smith' },
          { email: 'therapist2@example.com', name: 'Dr. Bob Johnson' },
          { email: 'therapist3@example.com', name: 'Dr. Carol Wilson' }
        ];

        const results = [];
        for (const therapist of approvedTherapists) {
          const result = await service.sendTherapistWelcomeEmail(
            therapist.email,
            therapist.name,
            { email: therapist.email, password: 'temp123' }
          );
          results.push(result);
        }

        expect(results).toHaveLength(3);
        expect(results.every(result => result.success)).toBe(true);
      });

      it('should handle bulk rejection notifications', async () => {
        const rejectedApplicants = [
          { email: 'rejected1@example.com', name: 'Dr. John Doe', reason: 'License verification required' },
          { email: 'rejected2@example.com', name: 'Dr. Jane Smith', reason: 'Additional experience needed' },
          { email: 'rejected3@example.com', name: 'Dr. Mike Brown', reason: 'Incomplete application' }
        ];

        const results = [];
        for (const applicant of rejectedApplicants) {
          const result = await service.sendTherapistRejectionEmail(
            applicant.email,
            applicant.name,
            applicant.reason
          );
          results.push(result);
        }

        expect(results).toHaveLength(3);
        expect(results.every(result => result.success)).toBe(true);
      });
    });

    describe('Error Recovery Scenarios', () => {
      it('should handle mixed success/failure scenarios in batch operations', async () => {
        // Setup alternating success/failure pattern
        let callCount = 0;
        mathRandomSpy.mockImplementation(() => {
          callCount++;
          return callCount % 2 === 0 ? 0.03 : 0.2; // Alternate between failure and success
        });

        const therapists = [
          { email: 'therapist1@example.com', name: 'Dr. Test 1' },
          { email: 'therapist2@example.com', name: 'Dr. Test 2' },
          { email: 'therapist3@example.com', name: 'Dr. Test 3' },
          { email: 'therapist4@example.com', name: 'Dr. Test 4' }
        ];

        const results = [];
        for (const therapist of therapists) {
          const result = await service.sendTherapistWelcomeEmail(
            therapist.email,
            therapist.name,
            { email: therapist.email, password: 'temp' }
          );
          results.push(result);
        }

        // Should have alternating success/failure
        expect(results[0].success).toBe(true);  // First call (callCount=1, return 0.2)
        expect(results[1].success).toBe(false); // Second call (callCount=2, return 0.03)
        expect(results[2].success).toBe(true);  // Third call (callCount=3, return 0.2)
        expect(results[3].success).toBe(false); // Fourth call (callCount=4, return 0.03)
      });

      it('should handle service configuration failure during email operations', () => {
        // Mock configuration test failure
        const originalTestConfig = service.testConfiguration;
        service.testConfiguration = jest.fn().mockReturnValue({
          success: false,
          message: 'Email service misconfigured'
        });

        const configResult = service.testConfiguration();
        expect(configResult.success).toBe(false);

        // Email operations should still work independently
        mathRandomSpy.mockReturnValue(0.2);
        const emailResult = service.sendTherapistApplicationNotification({
          to: 'test@example.com',
          name: 'Dr. Test',
          status: 'approved'
        });

        expect(emailResult.success).toBe(true);

        // Restore original method
        service.testConfiguration = originalTestConfig;
      });
    });
  });

  describe('Email Content Security and Validation', () => {
    beforeEach(() => {
      mathRandomSpy.mockReturnValue(0.2);
    });

    it('should handle HTML injection attempts in email content', () => {
      const maliciousData: EmailNotificationData = {
        to: 'test@example.com',
        name: 'Dr. <script>alert("xss")</script>Test',
        status: 'approved',
        adminNotes: '<img src="x" onerror="alert(1)">'
      };

      const content = (service as any).generateEmailContent(maliciousData);

      // Content should contain the raw text (service doesn't sanitize, assumes template engine will)
      expect(content.greeting).toContain('<script>');
      expect(content.body).toContain('<img src=');
      // In production, template engine should handle HTML escaping
    });

    it('should handle extremely long email content', () => {
      const longName = 'Dr. ' + 'A'.repeat(1000);
      const longNotes = 'B'.repeat(5000);

      const emailData: EmailNotificationData = {
        to: 'test@example.com',
        name: longName,
        status: 'approved',
        adminNotes: longNotes
      };

      const result = service.sendTherapistApplicationNotification(emailData);
      expect(result.success).toBe(true);

      const content = (service as any).generateEmailContent(emailData);
      expect(content.greeting).toContain(longName);
      expect(content.body).toContain(longNotes);
    });

    it('should handle unicode and emoji characters in email content', () => {
      const emailData: EmailNotificationData = {
        to: 'test@example.com',
        name: 'Dr. 🎯 José María Ñiño-García 🎓',
        status: 'approved',
        adminNotes: '🎉 Welcome! Your application was excellent. 👏 We look forward to working with you! 🚀'
      };

      const result = service.sendTherapistApplicationNotification(emailData);
      expect(result.success).toBe(true);

      const content = (service as any).generateEmailContent(emailData);
      expect(content.greeting).toContain('🎯 José María Ñiño-García 🎓');
      expect(content.body).toContain('🎉 Welcome!');
      expect(content.body).toContain('👏 We look forward');
      expect(content.body).toContain('🚀');
    });
  });
});