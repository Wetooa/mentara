import { Test, TestingModule } from '@nestjs/testing';
import { EmailService, EmailNotificationData } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  // Mock console methods to avoid cluttering test output
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Mock console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendTherapistApplicationNotification', () => {
    const baseEmailData: EmailNotificationData = {
      to: 'therapist@example.com',
      name: 'Dr. John Doe',
      status: 'approved',
    };

    it('should send approved notification successfully', async () => {
      const emailData: EmailNotificationData = {
        ...baseEmailData,
        status: 'approved',
        credentials: {
          email: 'therapist@example.com',
          password: 'temp123456',
        },
      };

      const result = await service.sendTherapistApplicationNotification(emailData);

      expect(result).toEqual({
        success: true,
        message: 'Email notification queued for therapist@example.com',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
        recipient: 'therapist@example.com',
        status: 'approved',
        hasCredentials: true,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          subject: 'Mentara Therapist Application Approved',
          greeting: 'Dear Dr. John Doe,',
          body: expect.stringContaining('Congratulations! Your therapist application has been approved.'),
        }),
      );
    });

    it('should send rejected notification successfully', async () => {
      const emailData: EmailNotificationData = {
        ...baseEmailData,
        status: 'rejected',
        adminNotes: 'Insufficient experience in required specializations.',
      };

      const result = await service.sendTherapistApplicationNotification(emailData);

      expect(result).toEqual({
        success: true,
        message: 'Email notification queued for therapist@example.com',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
        recipient: 'therapist@example.com',
        status: 'rejected',
        hasCredentials: false,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          subject: 'Mentara Therapist Application Update',
          greeting: 'Dear Dr. John Doe,',
          body: expect.stringContaining('we have decided not to approve your application'),
        }),
      );
    });

    it('should handle approved notification without credentials', async () => {
      const emailData: EmailNotificationData = {
        ...baseEmailData,
        status: 'approved',
      };

      const result = await service.sendTherapistApplicationNotification(emailData);

      expect(result).toEqual({
        success: true,
        message: 'Email notification queued for therapist@example.com',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
        recipient: 'therapist@example.com',
        status: 'approved',
        hasCredentials: false,
      });
    });

    it('should handle approved notification with admin notes', async () => {
      const emailData: EmailNotificationData = {
        ...baseEmailData,
        status: 'approved',
        adminNotes: 'Welcome to our premium therapist network!',
        credentials: {
          email: 'therapist@example.com',
          password: 'temp123456',
        },
      };

      const result = await service.sendTherapistApplicationNotification(emailData);

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          body: expect.stringContaining('Welcome to our premium therapist network!'),
        }),
      );
    });

    it('should handle rejected notification without admin notes', async () => {
      const emailData: EmailNotificationData = {
        ...baseEmailData,
        status: 'rejected',
      };

      const result = await service.sendTherapistApplicationNotification(emailData);

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          body: expect.not.stringContaining('Feedback from our review team:'),
        }),
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock generateEmailContent to throw an error
      const originalGenerateEmailContent = service['generateEmailContent'];
      service['generateEmailContent'] = jest.fn().mockImplementation(() => {
        throw new Error('Email template generation failed');
      });

      const result = await service.sendTherapistApplicationNotification(baseEmailData);

      expect(result).toEqual({
        success: false,
        message: 'Email template generation failed',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send email notification:',
        expect.any(Error),
      );

      // Restore original method
      service['generateEmailContent'] = originalGenerateEmailContent;
    });

    it('should handle non-Error exceptions', async () => {
      // Mock generateEmailContent to throw a non-Error
      const originalGenerateEmailContent = service['generateEmailContent'];
      service['generateEmailContent'] = jest.fn().mockImplementation(() => {
        throw 'Non-error exception';
      });

      const result = await service.sendTherapistApplicationNotification(baseEmailData);

      expect(result).toEqual({
        success: false,
        message: 'Failed to send notification',
      });

      // Restore original method
      service['generateEmailContent'] = originalGenerateEmailContent;
    });

    it('should handle empty email data', async () => {
      const emptyEmailData: EmailNotificationData = {
        to: '',
        name: '',
        status: 'approved',
      };

      const result = await service.sendTherapistApplicationNotification(emptyEmailData);

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
        recipient: '',
        status: 'approved',
        hasCredentials: false,
      });
    });

    it('should handle special characters in name and email', async () => {
      const specialCharEmailData: EmailNotificationData = {
        to: 'therapist+test@example.com',
        name: 'Dr. José María García-López',
        status: 'approved',
      };

      const result = await service.sendTherapistApplicationNotification(specialCharEmailData);

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          greeting: 'Dear Dr. José María García-López,',
        }),
      );
    });

    it('should handle very long admin notes', async () => {
      const longNotes = 'A'.repeat(5000);
      const emailData: EmailNotificationData = {
        ...baseEmailData,
        status: 'rejected',
        adminNotes: longNotes,
      };

      const result = await service.sendTherapistApplicationNotification(emailData);

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          body: expect.stringContaining(longNotes),
        }),
      );
    });

    it('should handle null and undefined values gracefully', async () => {
      const emailDataWithNulls: EmailNotificationData = {
        to: 'therapist@example.com',
        name: 'Dr. John Doe',
        status: 'approved' as const,
        adminNotes: undefined,
        credentials: undefined,
      };

      const result = await service.sendTherapistApplicationNotification(emailDataWithNulls);

      expect(result.success).toBe(true);
    });

    it('should handle both approved and rejected status in same session', async () => {
      const approvedData: EmailNotificationData = {
        ...baseEmailData,
        status: 'approved',
      };

      const rejectedData: EmailNotificationData = {
        ...baseEmailData,
        status: 'rejected',
      };

      const approvedResult = await service.sendTherapistApplicationNotification(approvedData);
      const rejectedResult = await service.sendTherapistApplicationNotification(rejectedData);

      expect(approvedResult.success).toBe(true);
      expect(rejectedResult.success).toBe(true);

      expect(consoleSpy).toHaveBeenCalledTimes(4); // 2 calls for each notification
    });
  });

  describe('generateEmailContent', () => {
    it('should generate approved email content with credentials', () => {
      const emailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: 'Dr. Sarah Wilson',
        status: 'approved',
        credentials: {
          email: 'therapist@example.com',
          password: 'temp987654',
        },
      };

      const content = service['generateEmailContent'](emailData);

      expect(content).toEqual({
        subject: 'Mentara Therapist Application Approved',
        greeting: 'Dear Dr. Sarah Wilson,',
        companySignature: 'Best regards,\nThe Mentara Team\nsupport@mentara.com',
        body: expect.stringContaining('Congratulations! Your therapist application has been approved.'),
      });

      expect(content.body).toContain('Your account credentials:');
      expect(content.body).toContain('Email: therapist@example.com');
      expect(content.body).toContain('Temporary Password: temp987654');
      expect(content.body).toContain('Please log in and change your password immediately.');
      expect(content.body).toContain('https://mentara.com/therapist');
      expect(content.body).toContain('Welcome to the Mentara therapist network!');
    });

    it('should generate approved email content without credentials', () => {
      const emailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: 'Dr. Michael Johnson',
        status: 'approved',
      };

      const content = service['generateEmailContent'](emailData);

      expect(content.body).not.toContain('Your account credentials:');
      expect(content.body).not.toContain('Temporary Password:');
      expect(content.body).toContain('Congratulations! Your therapist application has been approved.');
      expect(content.body).toContain('Welcome to the Mentara therapist network!');
    });

    it('should generate approved email content with admin notes', () => {
      const emailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: 'Dr. Emma Brown',
        status: 'approved',
        adminNotes: 'We are particularly excited about your expertise in CBT.',
      };

      const content = service['generateEmailContent'](emailData);

      expect(content.body).toContain('Additional notes from our team:');
      expect(content.body).toContain('We are particularly excited about your expertise in CBT.');
    });

    it('should generate rejected email content with admin notes', () => {
      const emailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: 'Dr. Alex Taylor',
        status: 'rejected',
        adminNotes: 'Please obtain additional certification in trauma therapy and reapply.',
      };

      const content = service['generateEmailContent'](emailData);

      expect(content).toEqual({
        subject: 'Mentara Therapist Application Update',
        greeting: 'Dear Dr. Alex Taylor,',
        companySignature: 'Best regards,\nThe Mentara Team\nsupport@mentara.com',
        body: expect.stringContaining('we have decided not to approve your application at this time'),
      });

      expect(content.body).toContain('Feedback from our review team:');
      expect(content.body).toContain('Please obtain additional certification in trauma therapy and reapply.');
      expect(content.body).toContain('We encourage you to address any concerns mentioned above');
      expect(content.body).toContain("If you have any questions, please don't hesitate to contact our support team.");
    });

    it('should generate rejected email content without admin notes', () => {
      const emailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: 'Dr. Chris Lee',
        status: 'rejected',
      };

      const content = service['generateEmailContent'](emailData);

      expect(content.body).not.toContain('Feedback from our review team:');
      expect(content.body).toContain('Thank you for your interest in joining the Mentara therapist network.');
      expect(content.body).toContain('we have decided not to approve your application at this time');
      expect(content.body).toContain('We encourage you to address any concerns mentioned above');
    });

    it('should handle empty name gracefully', () => {
      const emailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: '',
        status: 'approved',
      };

      const content = service['generateEmailContent'](emailData);

      expect(content.greeting).toBe('Dear ,');
      expect(content.body).toContain('Congratulations! Your therapist application has been approved.');
    });

    it('should handle whitespace-only name', () => {
      const emailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: '   ',
        status: 'approved',
      };

      const content = service['generateEmailContent'](emailData);

      expect(content.greeting).toBe('Dear    ,');
    });

    it('should handle multiline admin notes', () => {
      const emailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: 'Dr. Jordan Smith',
        status: 'rejected',
        adminNotes: 'Line 1\nLine 2\nLine 3',
      };

      const content = service['generateEmailContent'](emailData);

      expect(content.body).toContain('Line 1\nLine 2\nLine 3');
    });

    it('should handle credentials with special characters', () => {
      const emailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: 'Dr. Riley Parker',
        status: 'approved',
        credentials: {
          email: 'therapist+test@example.com',
          password: 'P@ssw0rd!2024',
        },
      };

      const content = service['generateEmailContent'](emailData);

      expect(content.body).toContain('Email: therapist+test@example.com');
      expect(content.body).toContain('Temporary Password: P@ssw0rd!2024');
    });

    it('should maintain consistent email structure', () => {
      const approvedData: EmailNotificationData = {
        to: 'therapist1@example.com',
        name: 'Dr. One',
        status: 'approved',
      };

      const rejectedData: EmailNotificationData = {
        to: 'therapist2@example.com',
        name: 'Dr. Two',
        status: 'rejected',
      };

      const approvedContent = service['generateEmailContent'](approvedData);
      const rejectedContent = service['generateEmailContent'](rejectedData);

      // Both should have consistent structure
      expect(approvedContent).toHaveProperty('subject');
      expect(approvedContent).toHaveProperty('greeting');
      expect(approvedContent).toHaveProperty('body');
      expect(approvedContent).toHaveProperty('companySignature');

      expect(rejectedContent).toHaveProperty('subject');
      expect(rejectedContent).toHaveProperty('greeting');
      expect(rejectedContent).toHaveProperty('body');
      expect(rejectedContent).toHaveProperty('companySignature');

      // Company signature should be the same
      expect(approvedContent.companySignature).toBe(rejectedContent.companySignature);
    });
  });

  describe('sendTherapistWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const credentials = {
        email: 'newtherapist@example.com',
        password: 'welcome123',
      };

      const result = await service.sendTherapistWelcomeEmail(
        'newtherapist@example.com',
        'Dr. Welcome User',
        credentials,
      );

      expect(result).toEqual({
        success: true,
        message: 'Email notification queued for newtherapist@example.com',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
        recipient: 'newtherapist@example.com',
        status: 'approved',
        hasCredentials: true,
      });
    });

    it('should handle empty credentials', async () => {
      const credentials = {
        email: '',
        password: '',
      };

      const result = await service.sendTherapistWelcomeEmail(
        'therapist@example.com',
        'Dr. Test',
        credentials,
      );

      expect(result.success).toBe(true);
    });

    it('should handle special characters in therapist name', async () => {
      const credentials = {
        email: 'therapist@example.com',
        password: 'temp123',
      };

      const result = await service.sendTherapistWelcomeEmail(
        'therapist@example.com',
        'Dr. François O\'Connor-Smith',
        credentials,
      );

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          greeting: 'Dear Dr. François O\'Connor-Smith,',
        }),
      );
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'very.long.therapist.email.address.that.is.extremely.long@example.com';
      const credentials = {
        email: longEmail,
        password: 'temp123',
      };

      const result = await service.sendTherapistWelcomeEmail(
        longEmail,
        'Dr. Long Email',
        credentials,
      );

      expect(result.success).toBe(true);
    });

    it('should handle invalid email format gracefully', async () => {
      const invalidEmail = 'not-an-email';
      const credentials = {
        email: invalidEmail,
        password: 'temp123',
      };

      const result = await service.sendTherapistWelcomeEmail(
        invalidEmail,
        'Dr. Invalid Email',
        credentials,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('sendTherapistRejectionEmail', () => {
    it('should send rejection email with reason', async () => {
      const reason = 'Insufficient experience in required therapy modalities.';

      const result = await service.sendTherapistRejectionEmail(
        'rejected@example.com',
        'Dr. Rejected User',
        reason,
      );

      expect(result).toEqual({
        success: true,
        message: 'Email notification queued for rejected@example.com',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Email notification requested:', {
        recipient: 'rejected@example.com',
        status: 'rejected',
        hasCredentials: false,
      });
    });

    it('should send rejection email without reason', async () => {
      const result = await service.sendTherapistRejectionEmail(
        'rejected@example.com',
        'Dr. Rejected User',
      );

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          body: expect.not.stringContaining('Feedback from our review team:'),
        }),
      );
    });

    it('should handle empty reason', async () => {
      const result = await service.sendTherapistRejectionEmail(
        'rejected@example.com',
        'Dr. Rejected User',
        '',
      );

      expect(result.success).toBe(true);
    });

    it('should handle undefined reason', async () => {
      const result = await service.sendTherapistRejectionEmail(
        'rejected@example.com',
        'Dr. Rejected User',
        undefined,
      );

      expect(result.success).toBe(true);
    });

    it('should handle very long rejection reason', async () => {
      const longReason = 'Unfortunately, '.repeat(100) + 'we cannot approve your application at this time.';

      const result = await service.sendTherapistRejectionEmail(
        'rejected@example.com',
        'Dr. Long Reason',
        longReason,
      );

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          body: expect.stringContaining(longReason),
        }),
      );
    });

    it('should handle rejection reason with HTML characters', async () => {
      const reasonWithHtml = 'Missing certifications: <strong>CBT</strong> & <em>EMDR</em>';

      const result = await service.sendTherapistRejectionEmail(
        'rejected@example.com',
        'Dr. HTML Test',
        reasonWithHtml,
      );

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          body: expect.stringContaining(reasonWithHtml),
        }),
      );
    });

    it('should handle rejection reason with newlines and special characters', async () => {
      const reasonWithSpecialChars = 'Reasons:\n1. License not verified\n2. Missing references\n3. Application incomplete';

      const result = await service.sendTherapistRejectionEmail(
        'rejected@example.com',
        'Dr. Special Chars',
        reasonWithSpecialChars,
      );

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Generated email content:',
        expect.objectContaining({
          body: expect.stringContaining(reasonWithSpecialChars),
        }),
      );
    });
  });

  describe('testConfiguration', () => {
    it('should pass configuration test', async () => {
      const result = await service.testConfiguration();

      expect(result).toEqual({
        success: true,
        message: 'Email service configuration test passed',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Testing email service configuration...');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Test email content generated successfully:',
        expect.objectContaining({
          subject: 'Mentara Therapist Application Approved',
          greeting: 'Dear Test Therapist,',
          body: expect.stringContaining('Congratulations! Your therapist application has been approved.'),
        }),
      );
    });

    it('should handle test failure gracefully', async () => {
      // Mock generateEmailContent to throw an error during test
      const originalGenerateEmailContent = service['generateEmailContent'];
      service['generateEmailContent'] = jest.fn().mockImplementation(() => {
        throw new Error('Test configuration failed');
      });

      const result = await service.testConfiguration();

      expect(result).toEqual({
        success: false,
        message: 'Test configuration failed',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Email service test failed:',
        expect.any(Error),
      );

      // Restore original method
      service['generateEmailContent'] = originalGenerateEmailContent;
    });

    it('should handle non-Error exceptions in test', async () => {
      // Mock generateEmailContent to throw a non-Error during test
      const originalGenerateEmailContent = service['generateEmailContent'];
      service['generateEmailContent'] = jest.fn().mockImplementation(() => {
        throw 'Non-error test failure';
      });

      const result = await service.testConfiguration();

      expect(result).toEqual({
        success: false,
        message: 'Test failed',
      });

      // Restore original method
      service['generateEmailContent'] = originalGenerateEmailContent;
    });

    it('should use predefined test data', async () => {
      await service.testConfiguration();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Test email content generated successfully:',
        expect.objectContaining({
          greeting: 'Dear Test Therapist,',
          body: expect.stringMatching(/Email: test@example\.com.*Temporary Password: temp123/s),
        }),
      );
    });

    it('should test both email generation and logging', async () => {
      const result = await service.testConfiguration();

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Testing email service configuration...');
      expect(consoleSpy).toHaveBeenNthCalledWith(
        2,
        'Test email content generated successfully:',
        expect.any(Object),
      );
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle concurrent email operations', async () => {
      const operations = [
        service.sendTherapistWelcomeEmail('user1@example.com', 'User 1', { email: 'user1@example.com', password: 'pass1' }),
        service.sendTherapistRejectionEmail('user2@example.com', 'User 2', 'Reason 2'),
        service.testConfiguration(),
        service.sendTherapistApplicationNotification({
          to: 'user3@example.com',
          name: 'User 3',
          status: 'approved',
        }),
      ];

      const results = await Promise.all(operations);

      expect(results.every(result => result.success)).toBe(true);
    });

    it('should handle memory-intensive operations', async () => {
      const largeEmailData: EmailNotificationData = {
        to: 'therapist@example.com',
        name: 'Dr. Large Data',
        status: 'approved',
        adminNotes: 'A'.repeat(100000), // 100KB of text
        credentials: {
          email: 'therapist@example.com',
          password: 'temp123',
        },
      };

      const result = await service.sendTherapistApplicationNotification(largeEmailData);

      expect(result.success).toBe(true);
    });

    it('should handle rapid successive operations', async () => {
      const rapidOperations = Array(20).fill(null).map((_, i) =>
        service.sendTherapistApplicationNotification({
          to: `therapist${i}@example.com`,
          name: `Dr. Test ${i}`,
          status: i % 2 === 0 ? 'approved' : 'rejected',
        })
      );

      const results = await Promise.all(rapidOperations);

      expect(results.every(result => result.success)).toBe(true);
      expect(results).toHaveLength(20);
    });

    it('should handle Unicode characters in all fields', async () => {
      const unicodeEmailData: EmailNotificationData = {
        to: 'tëst@ëxämplë.cöm',
        name: 'Dr. José María García-López 中文 русский العربية',
        status: 'approved',
        adminNotes: 'Notes with Unicode: 中文测试 русский тест اختبار عربي',
        credentials: {
          email: 'tëst@ëxämplë.cöm',
          password: 'pässwörd123',
        },
      };

      const result = await service.sendTherapistApplicationNotification(unicodeEmailData);

      expect(result.success).toBe(true);
    });

    it('should handle extremely long input data', async () => {
      const longEmailData: EmailNotificationData = {
        to: 'a'.repeat(320) + '@example.com', // Very long email
        name: 'Dr. ' + 'X'.repeat(1000), // Very long name
        status: 'rejected',
        adminNotes: 'B'.repeat(50000), // Very long admin notes
      };

      const result = await service.sendTherapistApplicationNotification(longEmailData);

      expect(result.success).toBe(true);
    });

    it('should maintain performance with complex data structures', async () => {
      const complexEmailData: EmailNotificationData = {
        to: 'complex@example.com',
        name: 'Dr. Complex Data',
        status: 'approved',
        adminNotes: JSON.stringify({
          reviewedBy: 'Admin Team',
          scores: { technical: 9, experience: 8, communication: 10 },
          recommendations: ['Excellent candidate', 'Strong background'],
          metadata: { timestamp: new Date().toISOString(), version: '1.0' },
        }),
        credentials: {
          email: 'complex@example.com',
          password: 'complex_p@ssw0rd_2024',
        },
      };

      const startTime = Date.now();
      const result = await service.sendTherapistApplicationNotification(complexEmailData);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle null prototype objects', async () => {
      const nullProtoData = Object.create(null);
      nullProtoData.to = 'test@example.com';
      nullProtoData.name = 'Dr. Test';
      nullProtoData.status = 'approved';

      const result = await service.sendTherapistApplicationNotification(nullProtoData);

      expect(result.success).toBe(true);
    });

    it('should handle frozen objects', async () => {
      const frozenData: EmailNotificationData = Object.freeze({
        to: 'frozen@example.com',
        name: 'Dr. Frozen',
        status: 'approved',
      });

      const result = await service.sendTherapistApplicationNotification(frozenData);

      expect(result.success).toBe(true);
    });

    it('should maintain consistent behavior across different execution contexts', async () => {
      // Test in setTimeout to simulate different execution context
      const asyncResult = await new Promise<{ success: boolean; message: string }>((resolve) => {
        setTimeout(async () => {
          const result = await service.sendTherapistApplicationNotification({
            to: 'async@example.com',
            name: 'Dr. Async',
            status: 'approved',
          });
          resolve(result);
        }, 0);
      });

      expect(asyncResult.success).toBe(true);
    });
  });
});