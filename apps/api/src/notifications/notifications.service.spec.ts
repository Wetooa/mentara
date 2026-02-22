import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { NotificationType, NotificationPriority } from '@prisma/client';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();
    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  describe('create', () => {
    const mockNotificationData = {
      userId: TEST_USER_IDS.CLIENT,
      title: 'Test Notification',
      message: 'This is a test notification',
      type: NotificationType.MESSAGE_RECEIVED,
      priority: NotificationPriority.NORMAL,
      actionUrl: '/messages/123',
      data: { messageId: '123' },
    };

    const mockCreatedNotification = {
      id: 'notification-1',
      ...mockNotificationData,
      createdAt: new Date(),
      isRead: false,
      readAt: null,
      scheduledFor: null,
      sentAt: null,
      user: {
        id: TEST_USER_IDS.CLIENT,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    };

    beforeEach(() => {
      prismaService.notification.create.mockResolvedValue(mockCreatedNotification);
    });

    it('should create notification successfully', async () => {
      const result = await service.create(mockNotificationData);

      expect(result).toEqual(mockCreatedNotification);
      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          ...mockNotificationData,
          priority: NotificationPriority.NORMAL,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });

    it('should set default priority when not provided', async () => {
      const dataWithoutPriority = {
        ...mockNotificationData,
        priority: undefined,
      };

      await service.create(dataWithoutPriority);

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          ...dataWithoutPriority,
          priority: NotificationPriority.NORMAL,
        },
        include: expect.any(Object),
      });
    });

    it('should deliver notification immediately when not scheduled', async () => {
      const deliverSpy = jest.spyOn(service as any, 'deliverNotification');
      
      await service.create(mockNotificationData);

      expect(deliverSpy).toHaveBeenCalledWith(mockCreatedNotification, {
        email: false,
        push: false,
        scheduled: false,
      });
    });

    it('should not deliver notification when scheduled', async () => {
      const deliverSpy = jest.spyOn(service as any, 'deliverNotification');
      const scheduledData = {
        ...mockNotificationData,
        scheduledFor: new Date(Date.now() + 60000),
      };

      await service.create(scheduledData);

      expect(deliverSpy).not.toHaveBeenCalled();
    });

    it('should use custom delivery options', async () => {
      const deliverSpy = jest.spyOn(service as any, 'deliverNotification');
      const customOptions = {
        email: true,
        push: true,
        scheduled: false,
      };

      await service.create(mockNotificationData, customOptions);

      expect(deliverSpy).toHaveBeenCalledWith(mockCreatedNotification, customOptions);
    });
  });

  describe('findAll', () => {
    const mockNotifications = [
      {
        id: 'notification-1',
        userId: TEST_USER_IDS.CLIENT,
        title: 'Test Notification 1',
        message: 'Message 1',
        type: NotificationType.MESSAGE_RECEIVED,
        priority: NotificationPriority.HIGH,
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: 'notification-2',
        userId: TEST_USER_IDS.CLIENT,
        title: 'Test Notification 2',
        message: 'Message 2',
        type: NotificationType.APPOINTMENT_REMINDER,
        priority: NotificationPriority.NORMAL,
        isRead: true,
        createdAt: new Date(),
      },
    ];

    beforeEach(() => {
      prismaService.notification.findMany.mockResolvedValue(mockNotifications);
    });

    it('should return all notifications for user', async () => {
      const result = await service.findAll(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockNotifications);
      expect(prismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_IDS.CLIENT },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 50,
      });
    });

    it('should filter by read status', async () => {
      await service.findAll(TEST_USER_IDS.CLIENT, false);

      expect(prismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_IDS.CLIENT, isRead: false },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 50,
      });
    });

    it('should filter by type', async () => {
      await service.findAll(TEST_USER_IDS.CLIENT, undefined, NotificationType.MESSAGE_RECEIVED);

      expect(prismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_IDS.CLIENT, type: NotificationType.MESSAGE_RECEIVED },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 50,
      });
    });

    it('should filter by priority', async () => {
      await service.findAll(TEST_USER_IDS.CLIENT, undefined, undefined, NotificationPriority.HIGH);

      expect(prismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_IDS.CLIENT, priority: NotificationPriority.HIGH },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 50,
      });
    });

    it('should filter by multiple criteria', async () => {
      await service.findAll(TEST_USER_IDS.CLIENT, true, NotificationType.MESSAGE_RECEIVED, NotificationPriority.HIGH);

      expect(prismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_IDS.CLIENT,
          isRead: true,
          type: NotificationType.MESSAGE_RECEIVED,
          priority: NotificationPriority.HIGH,
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 50,
      });
    });
  });

  describe('findOne', () => {
    const mockNotification = {
      id: 'notification-1',
      userId: TEST_USER_IDS.CLIENT,
      title: 'Test Notification',
      message: 'Test message',
      type: NotificationType.MESSAGE_RECEIVED,
      priority: NotificationPriority.NORMAL,
      isRead: false,
      createdAt: new Date(),
      user: {
        id: TEST_USER_IDS.CLIENT,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    };

    it('should return notification by ID', async () => {
      prismaService.notification.findUnique.mockResolvedValue(mockNotification);

      const result = await service.findOne('notification-1');

      expect(result).toEqual(mockNotification);
      expect(prismaService.notification.findUnique).toHaveBeenCalledWith({
        where: { id: 'notification-1' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });

    it('should return null when notification not found', async () => {
      prismaService.notification.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    const mockNotification = {
      id: 'notification-1',
      userId: TEST_USER_IDS.CLIENT,
      isRead: false,
      createdAt: new Date(),
      user: {
        id: TEST_USER_IDS.CLIENT,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    };

    it('should mark notification as read', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockNotification);
      const updatedNotification = { ...mockNotification, isRead: true, readAt: new Date() };
      prismaService.notification.update.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead('notification-1');

      expect(result).toEqual(updatedNotification);
      expect(prismaService.notification.update).toHaveBeenCalledWith({
        where: { id: 'notification-1' },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.markAsRead('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      prismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(TEST_USER_IDS.CLIENT);

      expect(result).toEqual({ count: 5 });
      expect(prismaService.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_IDS.CLIENT,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
    });
  });

  describe('delete', () => {
    const mockNotification = {
      id: 'notification-1',
      userId: TEST_USER_IDS.CLIENT,
      isRead: false,
      createdAt: new Date(),
      user: {
        id: TEST_USER_IDS.CLIENT,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    };

    it('should delete notification', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockNotification);
      prismaService.notification.delete.mockResolvedValue(mockNotification);

      const result = await service.delete('notification-1');

      expect(result).toEqual(mockNotification);
      expect(prismaService.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notification-1' },
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      prismaService.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount(TEST_USER_IDS.CLIENT);

      expect(result).toBe(3);
      expect(prismaService.notification.count).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_IDS.CLIENT,
          isRead: false,
        },
      });
    });
  });

  describe('getNotificationSettings', () => {
    it('should return default notification settings', async () => {
      const result = await service.getNotificationSettings(TEST_USER_IDS.CLIENT);

      // Verify the structure contains expected default values
      expect(result).toMatchObject({
        id: `default-${TEST_USER_IDS.CLIENT}`,
        userId: TEST_USER_IDS.CLIENT,
        emailAppointmentReminders: true,
        emailNewMessages: true,
        emailWorksheetUpdates: true,
        emailSystemUpdates: false,
        emailMarketing: false,
        pushAppointmentReminders: true,
        pushNewMessages: true,
        pushWorksheetUpdates: true,
        pushSystemUpdates: false,
        inAppMessages: true,
        inAppUpdates: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        quietHoursTimezone: 'UTC',
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateNotificationSettings', () => {
    const updateData = {
      emailAppointmentReminders: false,
      pushNewMessages: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    };

    it('should update notification settings', async () => {
      const updatedSettings = { ...updateData, userId: TEST_USER_IDS.CLIENT };
      prismaService.notificationSettings.upsert.mockResolvedValue(updatedSettings);

      const result = await service.updateNotificationSettings(TEST_USER_IDS.CLIENT, updateData);

      expect(result).toEqual(updatedSettings);
      expect(prismaService.notificationSettings.upsert).toHaveBeenCalledWith({
        where: { userId: TEST_USER_IDS.CLIENT },
        update: updateData,
        create: {
          userId: TEST_USER_IDS.CLIENT,
          ...updateData,
        },
      });
    });
  });


  describe('Email and Push Notifications', () => {
    it('should log email notification queued', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const notification = { userId: TEST_USER_IDS.CLIENT, user: {} } as any;

      await service['deliverEmailNotification'](notification);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Email notification queued for user ${TEST_USER_IDS.CLIENT}`
      );
    });

    it('should log push notification queued', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const notification = { userId: TEST_USER_IDS.CLIENT, user: {} } as any;

      await service['deliverPushNotification'](notification);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Push notification queued for user ${TEST_USER_IDS.CLIENT}`
      );
    });
  });

  describe('Batch Operations', () => {
    it('should create batch notifications', async () => {
      const notifications = [
        {
          userId: TEST_USER_IDS.CLIENT,
          title: 'Notification 1',
          message: 'Message 1',
          type: NotificationType.MESSAGE_RECEIVED,
        },
        {
          userId: TEST_USER_IDS.THERAPIST,
          title: 'Notification 2',
          message: 'Message 2',
          type: NotificationType.APPOINTMENT_REMINDER,
        },
      ];

      jest.spyOn(service, 'create').mockResolvedValue({} as any);

      const result = await service.createBatch(notifications);

      expect(result).toHaveLength(2);
      expect(service.create).toHaveBeenCalledTimes(2);
      expect(service.create).toHaveBeenCalledWith(notifications[0], undefined);
      expect(service.create).toHaveBeenCalledWith(notifications[1], undefined);
    });

    it('should send notifications to community', async () => {
      const members = [
        { userId: TEST_USER_IDS.CLIENT },
        { userId: TEST_USER_IDS.THERAPIST },
      ];
      prismaService.membership.findMany.mockResolvedValue(members);
      jest.spyOn(service, 'createBatch').mockResolvedValue([]);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      const notification = {
        title: 'Community Notification',
        message: 'Community message',
        type: NotificationType.COMMUNITY_POST,
      };

      await service.sendToCommunity('community-1', notification);

      expect(prismaService.membership.findMany).toHaveBeenCalledWith({
        where: { communityId: 'community-1' },
        select: { userId: true },
      });
      expect(service.createBatch).toHaveBeenCalledWith([
        { ...notification, userId: TEST_USER_IDS.CLIENT },
        { ...notification, userId: TEST_USER_IDS.THERAPIST },
      ], undefined);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Sent notifications to 2 community members'
      );
    });

    it('should handle community notification errors', async () => {
      const error = new Error('Database error');
      prismaService.membership.findMany.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await service.sendToCommunity('community-1', {} as any);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error sending notifications to community community-1:',
        error
      );
    });
  });

  describe('Event Listeners', () => {
    beforeEach(() => {
      jest.spyOn(service, 'create').mockResolvedValue({} as any);
    });

    it('should handle recommendations generated event', async () => {
      const payload = {
        userId: TEST_USER_IDS.CLIENT,
        recommendationCount: 5,
        timestamp: new Date(),
      };
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.handleRecommendationsGenerated(payload);

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        title: 'New Community Recommendations',
        message: "We've found 5 new communities that might interest you based on your assessment results.",
        type: NotificationType.COMMUNITY_RECOMMENDATION,
        priority: NotificationPriority.NORMAL,
        actionUrl: '/communities/recommendations',
        data: {
          recommendationCount: 5,
          generatedAt: payload.timestamp,
        },
      }, {
        email: false,
        push: true,
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `Community recommendation notification sent to user ${TEST_USER_IDS.CLIENT}`
      );
    });

    it('should handle recommendation interaction event (accept)', async () => {
      const payload = {
        userId: TEST_USER_IDS.CLIENT,
        communityId: 'community-1',
        communityName: 'Test Community',
        action: 'accept' as const,
        compatibilityScore: 85,
        timestamp: new Date(),
      };
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.handleRecommendationInteraction(payload);

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        title: 'Welcome to Test Community!',
        message: "You've successfully joined Test Community. Start exploring and connecting with the community.",
        type: NotificationType.COMMUNITY_JOINED,
        priority: NotificationPriority.HIGH,
        actionUrl: '/communities/community-1',
        data: {
          communityId: 'community-1',
          communityName: 'Test Community',
          compatibilityScore: 85,
          joinMethod: 'recommendation_accepted',
        },
      }, {
        email: false,
        push: true,
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `Community join notification sent to user ${TEST_USER_IDS.CLIENT}`
      );
    });

    it('should not handle recommendation interaction event (reject)', async () => {
      const payload = {
        userId: TEST_USER_IDS.CLIENT,
        communityId: 'community-1',
        communityName: 'Test Community',
        action: 'reject' as const,
        compatibilityScore: 85,
        timestamp: new Date(),
      };

      await service.handleRecommendationInteraction(payload);

      expect(service.create).not.toHaveBeenCalled();
    });

    it('should handle member joined event', async () => {
      const payload = {
        userId: TEST_USER_IDS.CLIENT,
        communityId: 'community-1',
        joinMethod: 'direct',
        timestamp: new Date(),
      };
      const mockCommunity = {
        name: 'Test Community',
        _count: { memberships: 50 },
      };
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.handleMemberJoined(payload);

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        title: 'Welcome to Test Community!',
        message: "You're now part of a community with 50 members. Start exploring and connecting!",
        type: NotificationType.COMMUNITY_WELCOME,
        priority: NotificationPriority.HIGH,
        actionUrl: '/communities/community-1',
        data: {
          communityId: 'community-1',
          communityName: 'Test Community',
          memberCount: 50,
          joinMethod: 'direct',
        },
      }, {
        email: false,
        push: true,
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `Community welcome notification sent to user ${TEST_USER_IDS.CLIENT}`
      );
    });

    it('should handle recommendations refreshed event', async () => {
      const payload = {
        userId: TEST_USER_IDS.CLIENT,
        timestamp: new Date(),
      };
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.handleRecommendationsRefreshed(payload);

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        title: 'Community Recommendations Updated',
        message: 'Your community recommendations have been updated based on your latest assessment results.',
        type: NotificationType.RECOMMENDATIONS_UPDATED,
        priority: NotificationPriority.NORMAL,
        actionUrl: '/communities/recommendations',
        data: {
          refreshedAt: payload.timestamp,
          reason: 'assessment_change',
        },
      }, {
        email: false,
        push: false,
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `Recommendations refreshed notification sent to user ${TEST_USER_IDS.CLIENT}`
      );
    });

    it('should handle event errors gracefully', async () => {
      const error = new Error('Notification creation failed');
      jest.spyOn(service, 'create').mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await service.handleRecommendationsGenerated({
        userId: TEST_USER_IDS.CLIENT,
        recommendationCount: 5,
        timestamp: new Date(),
      });

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error handling recommendations generated event:',
        error
      );
    });
  });

  describe('Specialized Notification Methods', () => {
    beforeEach(() => {
      jest.spyOn(service, 'create').mockResolvedValue({} as any);
    });

    it('should create appointment reminder notification', async () => {
      const appointmentTime = new Date();
      
      await service.createAppointmentReminder(
        TEST_USER_IDS.CLIENT,
        'appointment-1',
        appointmentTime,
        'Dr. Smith'
      );

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        title: 'Upcoming Appointment',
        message: 'You have an appointment with Dr. Smith in 1 hour.',
        type: NotificationType.APPOINTMENT_REMINDER,
        priority: NotificationPriority.HIGH,
        actionUrl: '/appointments/appointment-1',
        data: { appointmentId: 'appointment-1', appointmentTime },
      });
    });

    it('should create message notification', async () => {
      await service.createMessageNotification(
        TEST_USER_IDS.CLIENT,
        TEST_USER_IDS.THERAPIST,
        'Dr. Smith',
        'conversation-1'
      );

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        title: 'New Message',
        message: 'You have a new message from Dr. Smith.',
        type: NotificationType.MESSAGE_RECEIVED,
        priority: NotificationPriority.NORMAL,
        actionUrl: '/messages/conversation-1',
        data: { senderId: TEST_USER_IDS.THERAPIST, conversationId: 'conversation-1' },
      });
    });

    it('should create worksheet assigned notification', async () => {
      await service.createWorksheetAssignedNotification(
        TEST_USER_IDS.CLIENT,
        'worksheet-1',
        'Anxiety Management',
        'Dr. Smith'
      );

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        title: 'New Worksheet Assigned',
        message: 'Dr. Smith has assigned you a new worksheet: "Anxiety Management".',
        type: NotificationType.WORKSHEET_ASSIGNED,
        priority: NotificationPriority.NORMAL,
        actionUrl: '/worksheets/worksheet-1',
        data: { worksheetId: 'worksheet-1' },
      });
    });

    it('should create therapist application approved notification', async () => {
      await service.createTherapistApplicationNotification(TEST_USER_IDS.THERAPIST, 'approved');

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.THERAPIST,
        title: 'Application Approved',
        message: 'Congratulations! Your therapist application has been approved.',
        type: NotificationType.THERAPIST_APPROVED,
        priority: NotificationPriority.HIGH,
        actionUrl: '/therapist/application',
        data: { status: 'approved' },
      });
    });

    it('should create therapist application rejected notification', async () => {
      await service.createTherapistApplicationNotification(TEST_USER_IDS.THERAPIST, 'rejected');

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.THERAPIST,
        title: 'Application Update',
        message: 'Your therapist application has been reviewed. Please check your application status.',
        type: NotificationType.THERAPIST_REJECTED,
        priority: NotificationPriority.HIGH,
        actionUrl: '/therapist/application',
        data: { status: 'rejected' },
      });
    });

    it('should create client request notification', async () => {
      await service.createClientRequestNotification(
        TEST_USER_IDS.THERAPIST,
        TEST_USER_IDS.CLIENT,
        'John Doe',
        'I need help with anxiety',
        'HIGH'
      );

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.THERAPIST,
        title: 'New Client Request (High)',
        message: 'John Doe has sent you a therapy request. "I need help with anxiety"',
        type: 'CLIENT_REQUEST_RECEIVED',
        priority: 'HIGH',
        actionUrl: '/therapist/requests',
        data: {
          clientId: TEST_USER_IDS.CLIENT,
          clientName: 'John Doe',
          requestType: 'therapy_request',
          priority: 'HIGH',
          hasMessage: true,
        },
      });
    });

    it('should create request accepted notification', async () => {
      await service.createRequestAcceptedNotification(
        TEST_USER_IDS.CLIENT,
        TEST_USER_IDS.THERAPIST,
        'Dr. Smith',
        'Looking forward to working with you'
      );

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        title: 'Therapist Request Accepted! 🎉',
        message: 'Great news! Dr. Smith has accepted your therapy request. "Looking forward to working with you"',
        type: 'THERAPIST_REQUEST_ACCEPTED',
        priority: 'HIGH',
        actionUrl: `/client/therapists/${TEST_USER_IDS.THERAPIST}`,
        data: {
          therapistId: TEST_USER_IDS.THERAPIST,
          therapistName: 'Dr. Smith',
          responseMessage: 'Looking forward to working with you',
          schedulingInfo: undefined,
          nextStep: 'schedule_session',
        },
      });
    });

    it('should create new recommendations notification', async () => {
      await service.createNewRecommendationsNotification(
        TEST_USER_IDS.CLIENT,
        3,
        'new_therapists'
      );

      expect(service.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        title: 'New Therapist Recommendations Available',
        message: "We've found 3 new therapist matches for you with newly approved therapists. Check them out!",
        type: 'NEW_RECOMMENDATIONS',
        priority: 'NORMAL',
        actionUrl: '/client/therapists/recommendations',
        data: {
          therapistCount: 3,
          updateReason: 'new_therapists',
          recommendationType: 'updated_matches',
        },
      });
    });
  });

  describe('Scheduled Notifications', () => {
    it('should send scheduled notifications', async () => {
      const now = new Date();
      const scheduledNotifications = [
        {
          id: 'notification-1',
          userId: TEST_USER_IDS.CLIENT,
          title: 'Scheduled Notification',
          message: 'This is a scheduled notification',
          scheduledFor: new Date(now.getTime() - 1000),
          sentAt: null,
        },
        {
          id: 'notification-2',
          userId: TEST_USER_IDS.CLIENT,
          title: 'Another Scheduled Notification',
          message: 'This is another scheduled notification',
          scheduledFor: new Date(now.getTime() - 2000),
          sentAt: null,
        },
      ];

      prismaService.notification.findMany.mockResolvedValue(scheduledNotifications);
      prismaService.notification.update.mockResolvedValue({} as any);

      const result = await service.sendScheduledNotifications();

      expect(result).toEqual({ sent: 2 });
      expect(prismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          scheduledFor: {
            lte: expect.any(Date),
          },
          sentAt: null,
        },
      });
      expect(prismaService.notification.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('Delivery Error Handling', () => {
    it('should handle delivery errors gracefully', async () => {
      const error = new Error('Delivery failed');
      jest.spyOn(service as any, 'deliverEmailNotification').mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      const notification = {
        id: 'notification-1',
        userId: TEST_USER_IDS.CLIENT,
        user: { id: TEST_USER_IDS.CLIENT },
      };

      await service['deliverNotification'](notification as any, { email: true });

      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete notification flow', async () => {
      const notificationData = {
        userId: TEST_USER_IDS.CLIENT,
        title: 'Integration Test',
        message: 'This is an integration test',
        type: NotificationType.MESSAGE_RECEIVED,
        priority: NotificationPriority.NORMAL,
      };

      const createdNotification = {
        id: 'notification-1',
        ...notificationData,
        createdAt: new Date(),
        isRead: false,
        user: {
          id: TEST_USER_IDS.CLIENT,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      };

      prismaService.notification.create.mockResolvedValue(createdNotification);

      const result = await service.create(notificationData);

      // Verify notification was created
      expect(result).toEqual(createdNotification);
      expect(prismaService.notification.create).toHaveBeenCalled();
    });

    it('should handle event-driven notifications', async () => {
      jest.spyOn(service, 'create').mockResolvedValue({} as any);
      
      const payload = {
        userId: TEST_USER_IDS.CLIENT,
        recommendationCount: 3,
        timestamp: new Date(),
      };

      await service.handleRecommendationsGenerated(payload);

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: TEST_USER_IDS.CLIENT,
          type: NotificationType.COMMUNITY_RECOMMENDATION,
        }),
        expect.objectContaining({
          push: true,
        })
      );
    });

    it('should handle batch community notifications', async () => {
      const members = [
        { userId: TEST_USER_IDS.CLIENT },
        { userId: TEST_USER_IDS.THERAPIST },
        { userId: TEST_USER_IDS.ADMIN },
      ];
      
      prismaService.membership.findMany.mockResolvedValue(members);
      jest.spyOn(service, 'create').mockResolvedValue({} as any);

      const notification = {
        title: 'Community Update',
        message: 'New community guidelines are available',
        type: NotificationType.COMMUNITY_POST,
      };

      await service.sendToCommunity('community-1', notification);

      expect(service.create).toHaveBeenCalledTimes(3);
      expect(service.create).toHaveBeenCalledWith(
        { ...notification, userId: TEST_USER_IDS.CLIENT },
        undefined
      );
      expect(service.create).toHaveBeenCalledWith(
        { ...notification, userId: TEST_USER_IDS.THERAPIST },
        undefined
      );
      expect(service.create).toHaveBeenCalledWith(
        { ...notification, userId: TEST_USER_IDS.ADMIN },
        undefined
      );
    });
  });
});