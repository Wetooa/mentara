/**
 * Comprehensive Test Suite for NotificationsController
 * Tests notification management, settings, and specialized notification creation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { NotificationType, NotificationPriority } from '@prisma/client';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: NotificationsService;
  let module: TestingModule;

  // Mock NotificationsService
  const mockNotificationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getUnreadCount: jest.fn(),
    getNotificationSettings: jest.fn(),
    updateNotificationSettings: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
    createAppointmentReminder: jest.fn(),
    createMessageNotification: jest.fn(),
    createWorksheetAssignedNotification: jest.fn(),
    createTherapistApplicationNotification: jest.fn(),
    createReviewRequestNotification: jest.fn(),
    createCommunityPostNotification: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockNotification = {
    id: 'notification_123456789',
    title: 'Test Notification',
    message: 'This is a test notification',
    type: NotificationType.APPOINTMENT_REMINDER,
    priority: NotificationPriority.MEDIUM,
    userId: TEST_USER_IDS.CLIENT,
    isRead: false,
    data: { appointmentId: 'appointment_123' },
    actionUrl: '/appointments/appointment_123',
    createdAt: new Date(),
    updatedAt: new Date(),
    scheduledFor: null,
    sentAt: null,
  };

  const mockNotificationsList = [
    mockNotification,
    {
      ...mockNotification,
      id: 'notification_987654321',
      title: 'Another Notification',
      type: NotificationType.MESSAGE,
      isRead: true,
    },
  ];

  const mockNotificationSettings = {
    id: 'settings_123456789',
    userId: TEST_USER_IDS.CLIENT,
    emailAppointmentReminders: true,
    emailNewMessages: true,
    emailWorksheetUpdates: true,
    emailSystemUpdates: false,
    emailMarketing: false,
    pushAppointmentReminders: true,
    pushNewMessages: true,
    pushWorksheetUpdates: true,
    pushSystemUpdates: true,
    inAppMessages: true,
    inAppUpdates: true,
    quietHoursEnabled: false,
    quietHoursStart: null,
    quietHoursEnd: null,
    quietHoursTimezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have notificationsService injected', () => {
      expect(notificationsService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', NotificationsController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', NotificationsController);
      expect(controllerMetadata).toBe('notifications');
    });
  });

  describe('POST /notifications', () => {
    const createNotificationDto = {
      title: 'Test Notification',
      message: 'This is a test notification',
      type: NotificationType.APPOINTMENT_REMINDER,
      priority: NotificationPriority.HIGH,
      data: { key: 'value' },
      actionUrl: '/test',
      scheduledFor: '2024-02-15T10:00:00Z',
    };

    it('should create notification successfully', async () => {
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      const result = await controller.create(createNotificationDto, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockNotification);
      expect(notificationsService.create).toHaveBeenCalledWith({
        ...createNotificationDto,
        userId: TEST_USER_IDS.CLIENT,
        scheduledFor: new Date('2024-02-15T10:00:00Z'),
      });
    });

    it('should create notification without optional fields', async () => {
      const minimalDto = {
        title: 'Minimal Notification',
        message: 'Minimal message',
        type: NotificationType.SYSTEM,
      };
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      const result = await controller.create(minimalDto, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockNotification);
      expect(notificationsService.create).toHaveBeenCalledWith({
        ...minimalDto,
        userId: TEST_USER_IDS.CLIENT,
        scheduledFor: undefined,
      });
    });

    it('should handle invalid scheduledFor date', async () => {
      const invalidDto = {
        ...createNotificationDto,
        scheduledFor: 'invalid-date',
      };

      await expect(controller.create(invalidDto, TEST_USER_IDS.CLIENT)).rejects.toThrow();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockNotificationsService.create.mockRejectedValue(serviceError);

      await expect(controller.create(createNotificationDto, TEST_USER_IDS.CLIENT)).rejects.toThrow(serviceError);
    });

    it('should handle all notification types', async () => {
      const notificationTypes = Object.values(NotificationType);
      
      for (const type of notificationTypes) {
        const dto = { ...createNotificationDto, type };
        mockNotificationsService.create.mockResolvedValue({ ...mockNotification, type });

        const result = await controller.create(dto, TEST_USER_IDS.CLIENT);

        expect(result.type).toBe(type);
      }
    });

    it('should handle all priority levels', async () => {
      const priorityLevels = Object.values(NotificationPriority);
      
      for (const priority of priorityLevels) {
        const dto = { ...createNotificationDto, priority };
        mockNotificationsService.create.mockResolvedValue({ ...mockNotification, priority });

        const result = await controller.create(dto, TEST_USER_IDS.CLIENT);

        expect(result.priority).toBe(priority);
      }
    });
  });

  describe('GET /notifications', () => {
    const mockQuery = {
      isRead: false,
      type: NotificationType.APPOINTMENT_REMINDER,
      priority: NotificationPriority.HIGH,
    };

    it('should get all notifications with filters', async () => {
      mockNotificationsService.findAll.mockResolvedValue(mockNotificationsList);

      const result = await controller.findAll(TEST_USER_IDS.CLIENT, mockQuery);

      expect(result).toEqual(mockNotificationsList);
      expect(notificationsService.findAll).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        mockQuery.isRead,
        mockQuery.type,
        mockQuery.priority,
      );
    });

    it('should get all notifications without filters', async () => {
      const emptyQuery = {};
      mockNotificationsService.findAll.mockResolvedValue(mockNotificationsList);

      const result = await controller.findAll(TEST_USER_IDS.CLIENT, emptyQuery);

      expect(result).toEqual(mockNotificationsList);
      expect(notificationsService.findAll).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should handle empty results', async () => {
      mockNotificationsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(TEST_USER_IDS.CLIENT, mockQuery);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockNotificationsService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll(TEST_USER_IDS.CLIENT, mockQuery)).rejects.toThrow(serviceError);
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('should get unread count successfully', async () => {
      const unreadCount = { count: 5 };
      mockNotificationsService.getUnreadCount.mockResolvedValue(unreadCount);

      const result = await controller.getUnreadCount(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(unreadCount);
      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle zero unread count', async () => {
      const unreadCount = { count: 0 };
      mockNotificationsService.getUnreadCount.mockResolvedValue(unreadCount);

      const result = await controller.getUnreadCount(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(unreadCount);
      expect(result.count).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockNotificationsService.getUnreadCount.mockRejectedValue(serviceError);

      await expect(controller.getUnreadCount(TEST_USER_IDS.CLIENT)).rejects.toThrow(serviceError);
    });
  });

  describe('GET /notifications/settings', () => {
    it('should get notification settings successfully', async () => {
      mockNotificationsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);

      const result = await controller.getNotificationSettings(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockNotificationSettings);
      expect(notificationsService.getNotificationSettings).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle user with no settings', async () => {
      mockNotificationsService.getNotificationSettings.mockResolvedValue(null);

      const result = await controller.getNotificationSettings(TEST_USER_IDS.CLIENT);

      expect(result).toBeNull();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockNotificationsService.getNotificationSettings.mockRejectedValue(serviceError);

      await expect(controller.getNotificationSettings(TEST_USER_IDS.CLIENT)).rejects.toThrow(serviceError);
    });
  });

  describe('PATCH /notifications/settings', () => {
    const settingsUpdateDto = {
      emailAppointmentReminders: false,
      emailNewMessages: true,
      pushAppointmentReminders: true,
      inAppMessages: false,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      quietHoursTimezone: 'America/New_York',
    };

    it('should update notification settings successfully', async () => {
      const updatedSettings = { ...mockNotificationSettings, ...settingsUpdateDto };
      mockNotificationsService.updateNotificationSettings.mockResolvedValue(updatedSettings);

      const result = await controller.updateNotificationSettings(settingsUpdateDto, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(updatedSettings);
      expect(notificationsService.updateNotificationSettings).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        settingsUpdateDto,
      );
    });

    it('should update partial settings', async () => {
      const partialDto = { emailAppointmentReminders: false };
      const updatedSettings = { ...mockNotificationSettings, ...partialDto };
      mockNotificationsService.updateNotificationSettings.mockResolvedValue(updatedSettings);

      const result = await controller.updateNotificationSettings(partialDto, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(updatedSettings);
      expect(notificationsService.updateNotificationSettings).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        partialDto,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Settings update failed');
      mockNotificationsService.updateNotificationSettings.mockRejectedValue(serviceError);

      await expect(
        controller.updateNotificationSettings(settingsUpdateDto, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /notifications/:id', () => {
    const notificationId = 'notification_123456789';

    it('should get notification by id successfully', async () => {
      mockNotificationsService.findOne.mockResolvedValue(mockNotification);

      const result = await controller.findOne(notificationId);

      expect(result).toEqual(mockNotification);
      expect(notificationsService.findOne).toHaveBeenCalledWith(notificationId);
    });

    it('should handle notification not found', async () => {
      mockNotificationsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockNotificationsService.findOne.mockRejectedValue(serviceError);

      await expect(controller.findOne(notificationId)).rejects.toThrow(serviceError);
    });
  });

  describe('PATCH /notifications/:id/read', () => {
    const notificationId = 'notification_123456789';

    it('should mark notification as read successfully', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationsService.markAsRead.mockResolvedValue(readNotification);

      const result = await controller.markAsRead(notificationId);

      expect(result).toEqual(readNotification);
      expect(notificationsService.markAsRead).toHaveBeenCalledWith(notificationId);
    });

    it('should handle notification not found', async () => {
      const notFoundError = new NotFoundException('Notification not found');
      mockNotificationsService.markAsRead.mockRejectedValue(notFoundError);

      await expect(controller.markAsRead('non-existent-id')).rejects.toThrow(notFoundError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockNotificationsService.markAsRead.mockRejectedValue(serviceError);

      await expect(controller.markAsRead(notificationId)).rejects.toThrow(serviceError);
    });
  });

  describe('PATCH /notifications/mark-all-read', () => {
    it('should mark all notifications as read successfully', async () => {
      const result = { count: 5 };
      mockNotificationsService.markAllAsRead.mockResolvedValue(result);

      const response = await controller.markAllAsRead(TEST_USER_IDS.CLIENT);

      expect(response).toEqual(result);
      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle no notifications to mark', async () => {
      const result = { count: 0 };
      mockNotificationsService.markAllAsRead.mockResolvedValue(result);

      const response = await controller.markAllAsRead(TEST_USER_IDS.CLIENT);

      expect(response).toEqual(result);
      expect(response.count).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockNotificationsService.markAllAsRead.mockRejectedValue(serviceError);

      await expect(controller.markAllAsRead(TEST_USER_IDS.CLIENT)).rejects.toThrow(serviceError);
    });
  });

  describe('DELETE /notifications/:id', () => {
    const notificationId = 'notification_123456789';

    it('should delete notification successfully', async () => {
      mockNotificationsService.delete.mockResolvedValue(mockNotification);

      const result = await controller.remove(notificationId);

      expect(result).toEqual(mockNotification);
      expect(notificationsService.delete).toHaveBeenCalledWith(notificationId);
    });

    it('should handle notification not found', async () => {
      const notFoundError = new NotFoundException('Notification not found');
      mockNotificationsService.delete.mockRejectedValue(notFoundError);

      await expect(controller.remove('non-existent-id')).rejects.toThrow(notFoundError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockNotificationsService.delete.mockRejectedValue(serviceError);

      await expect(controller.remove(notificationId)).rejects.toThrow(serviceError);
    });
  });

  describe('POST /notifications/appointment-reminder', () => {
    const appointmentReminderDto = {
      appointmentId: 'appointment_123456789',
      appointmentTime: '2024-02-15T10:00:00Z',
      therapistName: 'Dr. Sarah Smith',
    };

    it('should create appointment reminder successfully', async () => {
      const reminderNotification = {
        ...mockNotification,
        type: NotificationType.APPOINTMENT_REMINDER,
        data: { appointmentId: appointmentReminderDto.appointmentId },
      };
      mockNotificationsService.createAppointmentReminder.mockResolvedValue(reminderNotification);

      const result = await controller.createAppointmentReminder(appointmentReminderDto, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(reminderNotification);
      expect(notificationsService.createAppointmentReminder).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        appointmentReminderDto.appointmentId,
        new Date(appointmentReminderDto.appointmentTime),
        appointmentReminderDto.therapistName,
      );
    });

    it('should handle invalid appointment time', async () => {
      const invalidDto = { ...appointmentReminderDto, appointmentTime: 'invalid-date' };

      await expect(
        controller.createAppointmentReminder(invalidDto, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to create reminder');
      mockNotificationsService.createAppointmentReminder.mockRejectedValue(serviceError);

      await expect(
        controller.createAppointmentReminder(appointmentReminderDto, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /notifications/message-notification', () => {
    const messageNotificationDto = {
      senderId: TEST_USER_IDS.THERAPIST,
      senderName: 'Dr. John Doe',
      conversationId: 'conversation_123456789',
    };

    it('should create message notification successfully', async () => {
      const messageNotification = {
        ...mockNotification,
        type: NotificationType.MESSAGE,
        data: { conversationId: messageNotificationDto.conversationId },
      };
      mockNotificationsService.createMessageNotification.mockResolvedValue(messageNotification);

      const result = await controller.createMessageNotification(messageNotificationDto, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(messageNotification);
      expect(notificationsService.createMessageNotification).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        messageNotificationDto.senderId,
        messageNotificationDto.senderName,
        messageNotificationDto.conversationId,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to create message notification');
      mockNotificationsService.createMessageNotification.mockRejectedValue(serviceError);

      await expect(
        controller.createMessageNotification(messageNotificationDto, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /notifications/worksheet-assigned', () => {
    const worksheetNotificationDto = {
      worksheetId: 'worksheet_123456789',
      worksheetTitle: 'Anxiety Management Worksheet',
      therapistName: 'Dr. Sarah Smith',
    };

    it('should create worksheet assigned notification successfully', async () => {
      const worksheetNotification = {
        ...mockNotification,
        type: NotificationType.WORKSHEET_ASSIGNED,
        data: { worksheetId: worksheetNotificationDto.worksheetId },
      };
      mockNotificationsService.createWorksheetAssignedNotification.mockResolvedValue(worksheetNotification);

      const result = await controller.createWorksheetAssignedNotification(
        worksheetNotificationDto,
        TEST_USER_IDS.CLIENT
      );

      expect(result).toEqual(worksheetNotification);
      expect(notificationsService.createWorksheetAssignedNotification).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        worksheetNotificationDto.worksheetId,
        worksheetNotificationDto.worksheetTitle,
        worksheetNotificationDto.therapistName,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to create worksheet notification');
      mockNotificationsService.createWorksheetAssignedNotification.mockRejectedValue(serviceError);

      await expect(
        controller.createWorksheetAssignedNotification(worksheetNotificationDto, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /notifications/therapist-application', () => {
    it('should create therapist application approved notification', async () => {
      const approvedDto = { status: 'approved' as const };
      const applicationNotification = {
        ...mockNotification,
        type: NotificationType.THERAPIST_APPLICATION,
        title: 'Application Approved',
      };
      mockNotificationsService.createTherapistApplicationNotification.mockResolvedValue(applicationNotification);

      const result = await controller.createTherapistApplicationNotification(approvedDto, TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(applicationNotification);
      expect(notificationsService.createTherapistApplicationNotification).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        'approved',
      );
    });

    it('should create therapist application rejected notification', async () => {
      const rejectedDto = { status: 'rejected' as const };
      const applicationNotification = {
        ...mockNotification,
        type: NotificationType.THERAPIST_APPLICATION,
        title: 'Application Rejected',
      };
      mockNotificationsService.createTherapistApplicationNotification.mockResolvedValue(applicationNotification);

      const result = await controller.createTherapistApplicationNotification(rejectedDto, TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(applicationNotification);
      expect(notificationsService.createTherapistApplicationNotification).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        'rejected',
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to create application notification');
      mockNotificationsService.createTherapistApplicationNotification.mockRejectedValue(serviceError);

      await expect(
        controller.createTherapistApplicationNotification({ status: 'approved' }, TEST_USER_IDS.THERAPIST)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /notifications/review-request', () => {
    const reviewRequestDto = {
      therapistId: TEST_USER_IDS.THERAPIST,
      therapistName: 'Dr. John Doe',
      sessionId: 'session_123456789',
    };

    it('should create review request notification successfully', async () => {
      const reviewNotification = {
        ...mockNotification,
        type: NotificationType.REVIEW_REQUEST,
        data: { sessionId: reviewRequestDto.sessionId },
      };
      mockNotificationsService.createReviewRequestNotification.mockResolvedValue(reviewNotification);

      const result = await controller.createReviewRequestNotification(reviewRequestDto, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(reviewNotification);
      expect(notificationsService.createReviewRequestNotification).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        reviewRequestDto.therapistId,
        reviewRequestDto.therapistName,
        reviewRequestDto.sessionId,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to create review request');
      mockNotificationsService.createReviewRequestNotification.mockRejectedValue(serviceError);

      await expect(
        controller.createReviewRequestNotification(reviewRequestDto, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /notifications/community-post', () => {
    const communityPostDto = {
      postId: 'post_123456789',
      communityName: 'Anxiety Support',
      authorName: 'Anonymous User',
    };

    it('should create community post notification successfully', async () => {
      const communityNotification = {
        ...mockNotification,
        type: NotificationType.COMMUNITY_POST,
        data: { postId: communityPostDto.postId },
      };
      mockNotificationsService.createCommunityPostNotification.mockResolvedValue(communityNotification);

      const result = await controller.createCommunityPostNotification(communityPostDto, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(communityNotification);
      expect(notificationsService.createCommunityPostNotification).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        communityPostDto.postId,
        communityPostDto.communityName,
        communityPostDto.authorName,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to create community post notification');
      mockNotificationsService.createCommunityPostNotification.mockRejectedValue(serviceError);

      await expect(
        controller.createCommunityPostNotification(communityPostDto, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockNotificationsService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll(TEST_USER_IDS.CLIENT, {})).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockNotificationsService.getUnreadCount.mockRejectedValue(dbError);

      await expect(controller.getUnreadCount(TEST_USER_IDS.CLIENT)).rejects.toThrow(dbError);
    });

    it('should handle validation errors', async () => {
      const validationError = new BadRequestException('Invalid notification data');
      mockNotificationsService.create.mockRejectedValue(validationError);

      await expect(
        controller.create(
          {
            title: '',
            message: '',
            type: NotificationType.SYSTEM,
          },
          TEST_USER_IDS.CLIENT
        )
      ).rejects.toThrow(validationError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted notification response', async () => {
      mockNotificationsService.findOne.mockResolvedValue(mockNotification);

      const result = await controller.findOne('notification_123');

      TestAssertions.expectValidEntity(result, ['id', 'title', 'message', 'type', 'userId']);
      expect(result.id).toBe(mockNotification.id);
      expect(result.type).toBe(NotificationType.APPOINTMENT_REMINDER);
      expect(result.priority).toBe(NotificationPriority.MEDIUM);
      expect(typeof result.isRead).toBe('boolean');
    });

    it('should return properly formatted notifications list response', async () => {
      mockNotificationsService.findAll.mockResolvedValue(mockNotificationsList);

      const result = await controller.findAll(TEST_USER_IDS.CLIENT, {});

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      result.forEach((notification) => {
        TestAssertions.expectValidEntity(notification, ['id', 'title', 'message', 'type', 'userId']);
        expect(typeof notification.isRead).toBe('boolean');
      });
    });

    it('should return properly formatted settings response', async () => {
      mockNotificationsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);

      const result = await controller.getNotificationSettings(TEST_USER_IDS.CLIENT);

      TestAssertions.expectValidEntity(result, ['id', 'userId']);
      expect(typeof result.emailAppointmentReminders).toBe('boolean');
      expect(typeof result.pushNewMessages).toBe('boolean');
      expect(typeof result.inAppMessages).toBe('boolean');
      expect(typeof result.quietHoursEnabled).toBe('boolean');
    });

    it('should return properly formatted unread count response', async () => {
      const unreadCount = { count: 3 };
      mockNotificationsService.getUnreadCount.mockResolvedValue(unreadCount);

      const result = await controller.getUnreadCount(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('count');
      expect(typeof result.count).toBe('number');
      expect(result.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete notification workflow', async () => {
      // Create notification
      mockNotificationsService.create.mockResolvedValue(mockNotification);
      const createResult = await controller.create(
        {
          title: 'Test Notification',
          message: 'Test message',
          type: NotificationType.SYSTEM,
        },
        TEST_USER_IDS.CLIENT
      );
      expect(createResult).toBeDefined();

      // Get notification
      mockNotificationsService.findOne.mockResolvedValue(createResult);
      const getResult = await controller.findOne(createResult.id);
      expect(getResult).toEqual(createResult);

      // Mark as read
      const readNotification = { ...createResult, isRead: true };
      mockNotificationsService.markAsRead.mockResolvedValue(readNotification);
      const markReadResult = await controller.markAsRead(createResult.id);
      expect(markReadResult.isRead).toBe(true);

      // Delete notification
      mockNotificationsService.delete.mockResolvedValue(readNotification);
      const deleteResult = await controller.remove(createResult.id);
      expect(deleteResult).toEqual(readNotification);
    });

    it('should handle settings management workflow', async () => {
      // Get current settings
      mockNotificationsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
      const currentSettings = await controller.getNotificationSettings(TEST_USER_IDS.CLIENT);
      expect(currentSettings).toBeDefined();

      // Update settings
      const updateData = { emailAppointmentReminders: false, pushNewMessages: true };
      const updatedSettings = { ...currentSettings, ...updateData };
      mockNotificationsService.updateNotificationSettings.mockResolvedValue(updatedSettings);
      const updateResult = await controller.updateNotificationSettings(updateData, TEST_USER_IDS.CLIENT);
      expect(updateResult.emailAppointmentReminders).toBe(false);
      expect(updateResult.pushNewMessages).toBe(true);
    });
  });
});