import {
  Injectable,
  NotFoundException,
  Logger,
  OnModuleInit,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Server } from 'socket.io';
import { MessagingGateway } from '../messaging/messaging.gateway';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from '@prisma/client';
import { MessageSentEvent } from '../common/events/messaging-events';
import {
  PostCreatedEvent,
  CommentAddedEvent,
} from '../common/events/social-events';

interface WebSocketServer {
  to(room: string): {
    emit(event: string, data: any): void;
  };
}

interface NotificationDeliveryOptions {
  realTime?: boolean;
  email?: boolean;
  push?: boolean;
  scheduled?: boolean;
  priority?: NotificationPriority;
}

interface NotificationTemplate {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  actionUrl?: string;
  data?: any;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private webSocketServer: WebSocketServer | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => MessagingGateway))
    private readonly messagingGateway: MessagingGateway,
  ) {}

  onModuleInit() {
    // Configure WebSocket server for real-time notifications
    // Use a slight delay to ensure MessagingGateway is fully initialized
    setTimeout(() => {
      this.setWebSocketServer(this.messagingGateway.server);
    }, 1000);

    this.logger.log(
      '🔔 [NOTIFICATIONS] NotificationsService initialized with real-time capabilities',
    );
  }

  /**
   * Set WebSocket server instance for real-time notifications
   */
  setWebSocketServer(server: WebSocketServer) {
    this.webSocketServer = server;
    this.logger.log('🔌 [NOTIFICATIONS] WebSocket server configured for real-time notifications');
    this.logger.log('🔌 [NOTIFICATIONS] Server instance type:', typeof server);
    this.logger.log('🔌 [NOTIFICATIONS] Server methods available:', Object.getOwnPropertyNames(server));
  }

  async create(
    data: {
      userId: string;
      title: string;
      message: string;
      type: NotificationType;
      priority?: NotificationPriority;
      data?: any;
      actionUrl?: string;
    },
    deliveryOptions?: NotificationDeliveryOptions,
  ): Promise<Notification> {
    this.logger.log('🚀 [NOTIFICATIONS] Creating new notification...');
    this.logger.log('🚀 [NOTIFICATIONS] Target user:', data.userId);
    this.logger.log('🚀 [NOTIFICATIONS] Type:', data.type);
    this.logger.log('🚀 [NOTIFICATIONS] Priority:', data.priority || NotificationPriority.NORMAL);
    this.logger.log('🚀 [NOTIFICATIONS] Title:', data.title);

    const notification = await this.prisma.notification.create({
      data: {
        ...data,
        priority: data.priority || NotificationPriority.NORMAL,
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

    this.logger.log('✅ [NOTIFICATIONS] Notification created successfully in database');
    this.logger.log('✅ [NOTIFICATIONS] Notification ID:', notification.id);

    // Default delivery options
    const options = {
      realTime: true,
      email: false,
      push: false,
      scheduled: false,
      ...deliveryOptions,
    };

    this.logger.log('📋 [NOTIFICATIONS] Final delivery options:', options);

    // Deliver notification immediately since scheduling is not supported
    this.logger.log('🎯 [NOTIFICATIONS] Starting delivery pipeline...');
    await this.deliverNotification(notification, options);

    this.logger.log('🎉 [NOTIFICATIONS] Notification creation and delivery process completed');
    return notification;
  }

  async findAll(
    userId: string,
    isRead?: boolean,
    type?: NotificationType,
    priority?: NotificationPriority,
  ): Promise<Notification[]> {
    const where: any = { userId };

    if (isRead !== undefined) where.isRead = isRead;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    return this.prisma.notification.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 50, // Limit to recent notifications
    });
  }

  async findOne(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
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
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  async delete(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async getNotificationSettings(userId: string) {
    // Return default notification settings since notificationSettings model doesn't exist
    // This provides a consistent interface while using in-memory defaults
    return {
      id: `default-${userId}`,
      userId,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateNotificationSettings(
    userId: string,
    data: {
      emailAppointmentReminders?: boolean;
      emailNewMessages?: boolean;
      emailWorksheetUpdates?: boolean;
      emailSystemUpdates?: boolean;
      emailMarketing?: boolean;
      pushAppointmentReminders?: boolean;
      pushNewMessages?: boolean;
      pushWorksheetUpdates?: boolean;
      pushSystemUpdates?: boolean;
      inAppMessages?: boolean;
      inAppUpdates?: boolean;
      quietHoursEnabled?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      quietHoursTimezone?: string;
    },
  ) {
    // Return updated default settings since notificationSettings model doesn't exist
    // This provides a consistent interface while using in-memory defaults
    const currentSettings = await this.getNotificationSettings(userId);

    return {
      ...currentSettings,
      ...data,
      updatedAt: new Date(),
    };
  }

  /**
   * Deliver notification through configured channels
   */
  private async deliverNotification(
    notification: Notification & { user: any },
    options: NotificationDeliveryOptions,
  ): Promise<void> {
    this.logger.log('🎯 [NOTIFICATIONS] Starting notification delivery pipeline...');
    this.logger.log('🎯 [NOTIFICATIONS] Notification ID:', notification.id);
    this.logger.log('🎯 [NOTIFICATIONS] Delivery options:', options);
    this.logger.log('🎯 [NOTIFICATIONS] User ID:', notification.userId);
    this.logger.log('🎯 [NOTIFICATIONS] Notification type:', notification.type);

    try {
      let deliveryAttempts = 0;
      let successfulDeliveries = 0;
      const errors: string[] = [];

      // Real-time WebSocket delivery with enhanced error handling
      if (options.realTime) {
        this.logger.log('🌐 [NOTIFICATIONS] Attempting real-time WebSocket delivery...');
        deliveryAttempts++;
        
        try {
          if (this.webSocketServer) {
            await this.deliverRealTimeNotification(notification);
            successfulDeliveries++;
            this.logger.log('✅ [NOTIFICATIONS] Real-time delivery completed successfully');
          } else {
            const errorMsg = 'WebSocket server not available';
            this.logger.warn(`⚠️ [NOTIFICATIONS] Real-time delivery failed: ${errorMsg}`);
            errors.push(`Real-time: ${errorMsg}`);
          }
        } catch (realTimeError) {
          const errorMsg = realTimeError instanceof Error ? realTimeError.message : 'Unknown real-time delivery error';
          this.logger.error(`❌ [NOTIFICATIONS] Real-time delivery failed: ${errorMsg}`);
          errors.push(`Real-time: ${errorMsg}`);
          
          // Continue with other delivery methods as fallback
        }
      } else {
        this.logger.log('⏭️ [NOTIFICATIONS] Real-time delivery disabled in options');
      }

      // Email delivery (if configured)
      if (options.email) {
        this.logger.log('📧 [NOTIFICATIONS] Attempting email delivery...');
        deliveryAttempts++;
        
        try {
          await this.deliverEmailNotification(notification);
          successfulDeliveries++;
          this.logger.log('✅ [NOTIFICATIONS] Email delivery completed');
        } catch (emailError) {
          const errorMsg = emailError instanceof Error ? emailError.message : 'Unknown email delivery error';
          this.logger.error(`❌ [NOTIFICATIONS] Email delivery failed: ${errorMsg}`);
          errors.push(`Email: ${errorMsg}`);
        }
      } else {
        this.logger.log('⏭️ [NOTIFICATIONS] Email delivery disabled in options');
      }

      // Push notification delivery (if configured)
      if (options.push) {
        this.logger.log('📱 [NOTIFICATIONS] Attempting push notification delivery...');
        deliveryAttempts++;
        
        try {
          await this.deliverPushNotification(notification);
          successfulDeliveries++;
          this.logger.log('✅ [NOTIFICATIONS] Push notification delivery completed');
        } catch (pushError) {
          const errorMsg = pushError instanceof Error ? pushError.message : 'Unknown push delivery error';
          this.logger.error(`❌ [NOTIFICATIONS] Push delivery failed: ${errorMsg}`);
          errors.push(`Push: ${errorMsg}`);
        }
      } else {
        this.logger.log('⏭️ [NOTIFICATIONS] Push notification delivery disabled in options');
      }

      this.logger.log('🏁 [NOTIFICATIONS] Delivery pipeline completed');
      this.logger.log('📊 [NOTIFICATIONS] Delivery summary:', {
        notificationId: notification.id,
        userId: notification.userId,
        deliveryAttempts,
        successfulDeliveries,
        failedDeliveries: deliveryAttempts - successfulDeliveries,
        deliveryRate: deliveryAttempts > 0 ? `${Math.round((successfulDeliveries / deliveryAttempts) * 100)}%` : '0%',
        errors: errors.length > 0 ? errors : 'none'
      });

      // Log warning if no deliveries succeeded but attempts were made
      if (deliveryAttempts > 0 && successfulDeliveries === 0) {
        this.logger.warn('⚠️ [NOTIFICATIONS] All delivery methods failed for notification', {
          notificationId: notification.id,
          userId: notification.userId,
          allErrors: errors
        });
      }

      // Log success if at least one delivery method worked
      if (successfulDeliveries > 0) {
        this.logger.log(`🎉 [NOTIFICATIONS] Notification delivered successfully via ${successfulDeliveries}/${deliveryAttempts} method(s)`);
      }

    } catch (error) {
      this.logger.error(
        `💥 [NOTIFICATIONS] Unexpected error in delivery pipeline for notification ${notification.id}:`,
        error,
      );
      this.logger.error('💥 [NOTIFICATIONS] Pipeline error details:', {
        notificationId: notification.id,
        userId: notification.userId,
        errorMessage: error.message,
        errorStack: error.stack,
        deliveryOptions: options,
      });

      // Don't re-throw the error to prevent notification creation from failing
      // The notification is already saved to the database and can be retrieved via REST API
    }
  }

  /**
   * Deliver real-time notification via WebSocket
   */
  private async deliverRealTimeNotification(
    notification: Notification & { user: any },
  ): Promise<void> {
    this.logger.log('📨 [NOTIFICATIONS] Starting real-time notification delivery...');
    this.logger.log('📨 [NOTIFICATIONS] Notification ID:', notification.id);
    this.logger.log('📨 [NOTIFICATIONS] Target User ID:', notification.userId);
    this.logger.log('📨 [NOTIFICATIONS] WebSocket server available:', !!this.webSocketServer);

    if (!this.webSocketServer) {
      this.logger.error(
        '❌ [NOTIFICATIONS] WebSocket server not configured for real-time notifications',
      );
      this.logger.error('❌ [NOTIFICATIONS] Real-time delivery FAILED - server unavailable');
      throw new Error('WebSocket server not available for real-time notification delivery');
    }

    try {
      // Use standardized room format from ConnectionManagerService
      const userRoom = `user_${notification.userId}`;
      this.logger.log('📍 [NOTIFICATIONS] Target room (corrected format):', userRoom);

      // Prepare notification payload
      const notificationPayload = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        actionUrl: notification.actionUrl,
        data: notification.data,
        createdAt: notification.createdAt,
        isRead: false,
      };

      this.logger.log('📦 [NOTIFICATIONS] Notification payload prepared:', {
        id: notificationPayload.id,
        title: notificationPayload.title,
        type: notificationPayload.type,
        priority: notificationPayload.priority,
      });

      // Check if server has the 'to' method before attempting to use it
      if (typeof this.webSocketServer.to !== 'function') {
        throw new Error('WebSocket server does not have the expected "to" method');
      }

      // Send to user's personal room
      this.logger.log('🚀 [NOTIFICATIONS] Emitting notification event to room:', userRoom);
      this.webSocketServer
        .to(userRoom)
        .emit('notification', notificationPayload);

      this.logger.log('✅ [NOTIFICATIONS] Notification event emitted successfully');

      // Send unread count update with enhanced error handling
      this.logger.log('🔢 [NOTIFICATIONS] Fetching unread count for user:', notification.userId);
      
      try {
        const unreadCount = await this.getUnreadCount(notification.userId);
        
        const unreadCountPayload = {
          count: unreadCount,
        };

        this.logger.log('🔢 [NOTIFICATIONS] Unread count:', unreadCount);
        this.logger.log('🚀 [NOTIFICATIONS] Emitting unreadCount event to room:', userRoom);
        
        this.webSocketServer
          .to(userRoom)
          .emit('unreadCount', unreadCountPayload);

        this.logger.log('✅ [NOTIFICATIONS] Unread count event emitted successfully');
      } catch (unreadCountError) {
        this.logger.error('⚠️ [NOTIFICATIONS] Failed to fetch/send unread count, but notification was sent:', unreadCountError);
        // Don't throw here as the main notification was sent successfully
      }

      this.logger.log(
        `🎉 [NOTIFICATIONS] Real-time notification delivered successfully to user ${notification.userId}`,
      );

      // Return success indicator
      return Promise.resolve();

    } catch (error) {
      this.logger.error('💥 [NOTIFICATIONS] Error delivering real-time notification:', error);
      this.logger.error('💥 [NOTIFICATIONS] Error details:', {
        message: error.message,
        stack: error.stack,
        notificationId: notification.id,
        userId: notification.userId,
        webSocketServerType: typeof this.webSocketServer,
        webSocketServerMethods: this.webSocketServer ? Object.getOwnPropertyNames(this.webSocketServer) : 'null',
      });

      // Re-throw the error so the delivery pipeline can handle fallbacks
      throw new Error(`Real-time notification delivery failed: ${error.message}`);
    }
  }

  /**
   * Deliver email notification (placeholder for email service integration)
   */
  private async deliverEmailNotification(
    notification: Notification & { user: any },
  ): Promise<void> {
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    this.logger.log(
      `Email notification queued for user ${notification.userId}`,
    );
  }

  /**
   * Deliver push notification (placeholder for push service integration)
   */
  private async deliverPushNotification(
    notification: Notification & { user: any },
  ): Promise<void> {
    // TODO: Integrate with push notification service (FCM, APNS, etc.)
    this.logger.log(`Push notification queued for user ${notification.userId}`);
  }

  /**
   * Batch create notifications with optimized delivery
   */
  async createBatch(
    notifications: Array<{
      userId: string;
      title: string;
      message: string;
      type: NotificationType;
      priority?: NotificationPriority;
      data?: any;
      actionUrl?: string;
    }>,
    deliveryOptions?: NotificationDeliveryOptions,
  ): Promise<Notification[]> {
    const createdNotifications: Notification[] = [];

    // Create notifications in batches for better performance
    for (const notificationData of notifications) {
      const notification = await this.create(notificationData, deliveryOptions);
      createdNotifications.push(notification);
    }

    return createdNotifications;
  }

  /**
   * Send notification to all users in a community
   */
  async sendToCommunity(
    communityId: string,
    notification: Omit<Parameters<typeof this.create>[0], 'userId'>,
    deliveryOptions?: NotificationDeliveryOptions,
  ): Promise<void> {
    try {
      // Get all community members
      const members = await this.prisma.membership.findMany({
        where: { communityId },
        select: { userId: true },
      });

      // Create notifications for all members (filter out null userIds)
      const notifications = members
        .filter((member) => member.userId !== null)
        .map((member) => ({
          ...notification,
          userId: member.userId!,
        }));

      await this.createBatch(notifications, deliveryOptions);

      this.logger.log(
        `Sent notifications to ${members.length} community members`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending notifications to community ${communityId}:`,
        error,
      );
    }
  }

  // ===== EVENT LISTENERS FOR COMMUNITY RECOMMENDATION SYSTEM =====

  /**
   * Handle community recommendation generated events
   */
  @OnEvent('community.recommendations.generated')
  async handleRecommendationsGenerated(payload: {
    userId: string;
    recommendationCount: number;
    timestamp: Date;
  }) {
    try {
      await this.create(
        {
          userId: payload.userId,
          title: 'New Community Recommendations',
          message: `We've found ${payload.recommendationCount} new communities that might interest you based on your assessment results.`,
          type: NotificationType.COMMUNITY_RECOMMENDATION,
          priority: NotificationPriority.NORMAL,
          actionUrl: '/communities/recommendations',
          data: {
            recommendationCount: payload.recommendationCount,
            generatedAt: payload.timestamp,
          },
        },
        {
          realTime: true,
          email: false,
          push: true,
        },
      );

      this.logger.log(
        `Community recommendation notification sent to user ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling recommendations generated event:`,
        error,
      );
    }
  }

  /**
   * Handle community recommendation interaction events
   */
  @OnEvent('community.recommendation.interaction')
  async handleRecommendationInteraction(payload: {
    userId: string;
    communityId: string;
    communityName: string;
    action: 'accept' | 'reject';
    compatibilityScore: number;
    timestamp: Date;
  }) {
    try {
      if (payload.action === 'accept') {
        await this.create(
          {
            userId: payload.userId,
            title: `Welcome to ${payload.communityName}!`,
            message: `You've successfully joined ${payload.communityName}. Start exploring and connecting with the community.`,
            type: NotificationType.COMMUNITY_JOINED,
            priority: NotificationPriority.HIGH,
            actionUrl: `/communities/${payload.communityId}`,
            data: {
              communityId: payload.communityId,
              communityName: payload.communityName,
              compatibilityScore: payload.compatibilityScore,
              joinMethod: 'recommendation_accepted',
            },
          },
          {
            realTime: true,
            email: false,
            push: true,
          },
        );

        this.logger.log(
          `Community join notification sent to user ${payload.userId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error handling recommendation interaction event:`,
        error,
      );
    }
  }

  /**
   * Handle community member joined events
   */
  @OnEvent('community.member.joined')
  async handleMemberJoined(payload: {
    userId: string;
    communityId: string;
    joinMethod: string;
    timestamp: Date;
  }) {
    try {
      // Get community details
      const community = await this.prisma.community.findUnique({
        where: { id: payload.communityId },
        select: { name: true, _count: { select: { memberships: true } } },
      });

      if (!community) return;

      // Send welcome notification to the new member
      await this.create(
        {
          userId: payload.userId,
          title: `Welcome to ${community.name}!`,
          message: `You're now part of a community with ${community._count.memberships} members. Start exploring and connecting!`,
          type: NotificationType.COMMUNITY_WELCOME,
          priority: NotificationPriority.HIGH,
          actionUrl: `/communities/${payload.communityId}`,
          data: {
            communityId: payload.communityId,
            communityName: community.name,
            memberCount: community._count.memberships,
            joinMethod: payload.joinMethod,
          },
        },
        {
          realTime: true,
          email: false,
          push: true,
        },
      );

      this.logger.log(
        `Community welcome notification sent to user ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error(`Error handling member joined event:`, error);
    }
  }

  /**
   * Handle recommendations refreshed events
   */
  @OnEvent('community.recommendations.refreshed')
  async handleRecommendationsRefreshed(payload: {
    userId: string;
    timestamp: Date;
  }) {
    try {
      await this.create(
        {
          userId: payload.userId,
          title: 'Community Recommendations Updated',
          message:
            'Your community recommendations have been updated based on your latest assessment results.',
          type: NotificationType.RECOMMENDATIONS_UPDATED,
          priority: NotificationPriority.NORMAL,
          actionUrl: '/communities/recommendations',
          data: {
            refreshedAt: payload.timestamp,
            reason: 'assessment_change',
          },
        },
        {
          realTime: true,
          email: false,
          push: false,
        },
      );

      this.logger.log(
        `Recommendations refreshed notification sent to user ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling recommendations refreshed event:`,
        error,
      );
    }
  }

  // ===== MESSAGING EVENT LISTENERS =====

  /**
   * Handle message sent events to create MESSAGE_RECEIVED notifications
   */
  @OnEvent('MessageSentEvent')
  async handleMessageSent(event: MessageSentEvent) {
    try {
      const { senderId, conversationId, content, recipientIds } =
        event.eventData;

      // Get sender details
      const sender = await this.prisma.user.findUnique({
        where: { id: senderId },
        select: { firstName: true, lastName: true },
      });

      if (!sender) {
        this.logger.warn(
          `Sender not found for message notification: ${senderId}`,
        );
        return;
      }

      const senderName = `${sender.firstName} ${sender.lastName}`;

      // Create notifications for each recipient
      for (const recipientId of recipientIds) {
        await this.create(
          {
            userId: recipientId,
            title: 'New Message',
            message: `You have a new message from ${senderName}.`,
            type: NotificationType.MESSAGE_RECEIVED,
            priority: NotificationPriority.NORMAL,
            actionUrl: `/messages/${conversationId}`,
            data: {
              senderId,
              conversationId,
              messagePreview:
                content.substring(0, 100) + (content.length > 100 ? '...' : ''),
              senderName,
            },
          },
          {
            realTime: true,
            email: false,
            push: true,
          },
        );
      }

      this.logger.log(
        `Message notifications sent to ${recipientIds.length} recipients for conversation ${conversationId}`,
      );
    } catch (error) {
      this.logger.error(`Error handling message sent event:`, error);
    }
  }

  /**
   * Handle post created events to create COMMUNITY_POST notifications for community members
   */
  @OnEvent('PostCreatedEvent')
  async handlePostCreated(event: PostCreatedEvent) {
    try {
      const { postId, authorId, communityId, title, content, isAnonymous } =
        event.eventData;

      // Skip notifications for anonymous posts or posts without community
      if (isAnonymous || !communityId) {
        return;
      }

      // Get post author details
      const author = await this.prisma.user.findUnique({
        where: { id: authorId },
        select: { firstName: true, lastName: true },
      });

      // Get community details and members
      const community = await this.prisma.community.findUnique({
        where: { id: communityId },
        select: {
          name: true,
          memberships: {
            where: {
              userId: { not: authorId }, // Don't notify the author
            },
            select: { userId: true },
          },
        },
      });

      if (!author || !community) {
        this.logger.warn(
          `Author or community not found for post notification: ${postId}`,
        );
        return;
      }

      const authorName = `${author.firstName} ${author.lastName}`;

      // Create notifications for community members
      const notifications = community.memberships
        .filter((member) => member.userId !== null)
        .map((member) => ({
          userId: member.userId!,
          title: `New Post in ${community.name}`,
          message: `${authorName} posted: "${title || content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          type: NotificationType.COMMUNITY_POST,
          priority: NotificationPriority.LOW,
          actionUrl: `/communities/posts/${postId}`,
          data: {
            postId,
            authorId,
            authorName,
            communityId,
            communityName: community.name,
            postTitle: title,
          },
        }));

      await this.createBatch(notifications, {
        realTime: true,
        email: false,
        push: false,
      });

      this.logger.log(
        `Post notification sent to ${notifications.length} community members for post ${postId}`,
      );
    } catch (error) {
      this.logger.error(`Error handling post created event:`, error);
    }
  }

  /**
   * Handle comment added events to create COMMUNITY_REPLY notifications for post author and parent comment author
   */
  @OnEvent('CommentAddedEvent')
  async handleCommentAdded(event: CommentAddedEvent) {
    try {
      const { commentId, postId, authorId, content, parentCommentId } =
        event.eventData;

      // Validate required event data
      if (!authorId) {
        this.logger.error(
          `Missing authorId in CommentAddedEvent for comment ${commentId}`,
          {
            commentId,
            postId,
            eventData: event.eventData,
          },
        );
        return;
      }

      if (!commentId || !postId || !content) {
        this.logger.error(`Missing required data in CommentAddedEvent`, {
          commentId,
          postId,
          authorId,
          hasContent: !!content,
          eventData: event.eventData,
        });
        return;
      }

      // Get comment author details
      const author = await this.prisma.user.findUnique({
        where: { id: authorId },
        select: { firstName: true, lastName: true },
      });

      // Get post details and author
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: {
          title: true,
          userId: true,
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      if (!author || !post) {
        this.logger.warn(
          `Author or post not found for comment notification: ${commentId}`,
          {
            authorFound: !!author,
            postFound: !!post,
            authorId,
            postId,
            commentId,
          },
        );
        return;
      }

      const authorName = `${author.firstName} ${author.lastName}`;
      const recipients = new Set<string>();

      // Notify post author (if not the commenter)
      if (post.userId !== authorId) {
        recipients.add(post.userId);
      }

      // If this is a reply to another comment, notify the parent comment author
      if (parentCommentId) {
        const parentComment = await this.prisma.comment.findUnique({
          where: { id: parentCommentId },
          select: { userId: true },
        });

        if (
          parentComment &&
          parentComment.userId !== authorId &&
          parentComment.userId !== post.userId
        ) {
          recipients.add(parentComment.userId);
        }
      }

      // Create notifications for all recipients
      const notifications = Array.from(recipients).map((recipientId) => ({
        userId: recipientId,
        title: parentCommentId
          ? 'New Reply to Your Comment'
          : 'New Comment on Your Post',
        message: `${authorName} ${parentCommentId ? 'replied to your comment' : 'commented on your post'}: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
        type: NotificationType.COMMUNITY_REPLY,
        priority: NotificationPriority.NORMAL,
        actionUrl: `/communities/posts/${postId}#comment-${commentId}`,
        data: {
          commentId,
          postId,
          authorId,
          authorName,
          parentCommentId,
          postTitle: post.title,
        },
      }));

      if (notifications.length > 0) {
        await this.createBatch(notifications, {
          realTime: true,
          email: false,
          push: true,
        });

        this.logger.log(
          `Comment notifications sent to ${notifications.length} users for comment ${commentId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error handling comment added event:`, error);
    }
  }

  // Helper methods for creating specific notification types

  async createAppointmentReminder(
    userId: string,
    appointmentId: string,
    appointmentTime: Date,
    therapistName: string,
  ) {
    return this.create({
      userId,
      title: 'Upcoming Appointment',
      message: `You have an appointment with ${therapistName} in 1 hour.`,
      type: NotificationType.APPOINTMENT_REMINDER,
      priority: NotificationPriority.HIGH,
      actionUrl: `/appointments/${appointmentId}`,
      data: { appointmentId, appointmentTime },
    });
  }

  async createMessageNotification(
    userId: string,
    senderId: string,
    senderName: string,
    conversationId: string,
  ) {
    return this.create({
      userId,
      title: 'New Message',
      message: `You have a new message from ${senderName}.`,
      type: NotificationType.MESSAGE_RECEIVED,
      priority: NotificationPriority.NORMAL,
      actionUrl: `/messages/${conversationId}`,
      data: { senderId, conversationId },
    });
  }

  async createWorksheetAssignedNotification(
    userId: string,
    worksheetId: string,
    worksheetTitle: string,
    therapistName: string,
  ) {
    return this.create({
      userId,
      title: 'New Worksheet Assigned',
      message: `${therapistName} has assigned you a new worksheet: "${worksheetTitle}".`,
      type: NotificationType.WORKSHEET_ASSIGNED,
      priority: NotificationPriority.NORMAL,
      actionUrl: `/worksheets/${worksheetId}`,
      data: { worksheetId },
    });
  }

  async createTherapistApplicationNotification(
    userId: string,
    status: 'approved' | 'rejected',
  ) {
    const title =
      status === 'approved' ? 'Application Approved' : 'Application Update';
    const message =
      status === 'approved'
        ? 'Congratulations! Your therapist application has been approved.'
        : 'Your therapist application has been reviewed. Please check your application status.';

    return this.create({
      userId,
      title,
      message,
      type:
        status === 'approved'
          ? NotificationType.THERAPIST_APPROVED
          : NotificationType.THERAPIST_REJECTED,
      priority: NotificationPriority.HIGH,
      actionUrl: '/therapist/application',
      data: { status },
    });
  }

  async createReviewRequestNotification(
    userId: string,
    therapistId: string,
    therapistName: string,
    sessionId: string,
  ) {
    return this.create({
      userId,
      title: 'Review Request',
      message: `Please leave a review for your session with ${therapistName}.`,
      type: NotificationType.REVIEW_REQUEST,
      priority: NotificationPriority.NORMAL,
      actionUrl: `/therapists/${therapistId}/review?session=${sessionId}`,
      data: { therapistId, sessionId },
    });
  }

  async createCommunityPostNotification(
    userId: string,
    postId: string,
    communityName: string,
    authorName: string,
  ) {
    return this.create({
      userId,
      title: 'New Community Post',
      message: `${authorName} posted in ${communityName}.`,
      type: NotificationType.COMMUNITY_POST,
      priority: NotificationPriority.LOW,
      actionUrl: `/communities/posts/${postId}`,
      data: { postId, communityName },
    });
  }

  // ===== THERAPIST MATCHING SYSTEM NOTIFICATIONS =====

  async createClientRequestNotification(
    therapistId: string,
    clientId: string,
    clientName: string,
    requestMessage?: string,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL',
  ) {
    const notificationPriority =
      priority === 'HIGH' || priority === 'URGENT' ? 'HIGH' : 'NORMAL';

    return this.create({
      userId: therapistId,
      title: `New Client Request ${priority === 'URGENT' ? '(Urgent)' : ''}`,
      message: `${clientName} has sent you a therapy request.${requestMessage ? ` "${requestMessage.substring(0, 100)}${requestMessage.length > 100 ? '...' : ''}"` : ''}`,
      type: 'CLIENT_REQUEST_RECEIVED',
      priority: notificationPriority,
      actionUrl: `/therapist/requests`,
      data: {
        clientId,
        clientName,
        requestType: 'therapy_request',
        priority,
        hasMessage: !!requestMessage,
      },
    });
  }

  async createRequestAcceptedNotification(
    clientId: string,
    therapistId: string,
    therapistName: string,
    responseMessage?: string,
    schedulingInfo?: string,
  ) {
    return this.create({
      userId: clientId,
      title: 'Therapist Request Accepted! 🎉',
      message: `Great news! ${therapistName} has accepted your therapy request.${responseMessage ? ` "${responseMessage}"` : ''}`,
      type: 'THERAPIST_REQUEST_ACCEPTED',
      priority: 'HIGH',
      actionUrl: `/client/therapists/${therapistId}`,
      data: {
        therapistId,
        therapistName,
        responseMessage,
        schedulingInfo,
        nextStep: 'schedule_session',
      },
    });
  }

  async createRequestDeclinedNotification(
    clientId: string,
    therapistId: string,
    therapistName: string,
    responseMessage?: string,
  ) {
    return this.create({
      userId: clientId,
      title: 'Therapist Request Update',
      message: `${therapistName} has responded to your therapy request.${responseMessage ? ` "${responseMessage}"` : ''} Don't worry - we can help you find other great matches!`,
      type: 'THERAPIST_REQUEST_DECLINED',
      priority: 'NORMAL',
      actionUrl: '/client/therapists/browse',
      data: {
        therapistId,
        therapistName,
        responseMessage,
        nextStep: 'browse_alternatives',
      },
    });
  }

  async createRequestCancelledNotification(
    therapistId: string,
    clientName: string,
    reason?: string,
  ) {
    return this.create({
      userId: therapistId,
      title: 'Client Request Cancelled',
      message: `${clientName} has cancelled their therapy request.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'CLIENT_REQUEST_CANCELLED',
      priority: 'NORMAL',
      actionUrl: '/therapist/requests',
      data: {
        clientName,
        reason,
        actionType: 'cancellation',
      },
    });
  }

  async createAdminTherapistApprovalNotification(
    therapistId: string,
    approvalMessage?: string,
  ) {
    return this.create({
      userId: therapistId,
      title: 'Application Approved! Welcome to Mentara 🎉',
      message: `Congratulations! Your therapist application has been approved. You can now start receiving client requests.${approvalMessage ? ` Message from our team: "${approvalMessage}"` : ''}`,
      type: 'THERAPIST_APPROVED',
      priority: 'HIGH',
      actionUrl: '/therapist/dashboard',
      data: {
        approvalMessage,
        nextSteps: [
          'complete_profile',
          'set_availability',
          'review_guidelines',
        ],
        welcomeFlow: true,
      },
    });
  }

  async createAdminTherapistRejectionNotification(
    therapistId: string,
    rejectionReason: string,
    rejectionMessage: string,
    allowReapplication: boolean,
  ) {
    return this.create({
      userId: therapistId,
      title: 'Application Status Update',
      message: `Your therapist application has been reviewed. ${rejectionMessage}`,
      type: 'THERAPIST_REJECTED',
      priority: 'HIGH',
      actionUrl: allowReapplication
        ? '/therapist/reapply'
        : '/therapist/application-status',
      data: {
        rejectionReason,
        rejectionMessage,
        allowReapplication,
        nextStep: allowReapplication ? 'reapply' : 'contact_support',
      },
    });
  }

  async createNewRecommendationsNotification(
    clientId: string,
    therapistCount: number,
    updateReason:
      | 'profile_update'
      | 'new_therapists'
      | 'algorithm_improvement' = 'new_therapists',
  ) {
    const reasonMessages = {
      profile_update: 'based on your updated preferences',
      new_therapists: 'with newly approved therapists',
      algorithm_improvement: 'with improved matching',
    };

    return this.create({
      userId: clientId,
      title: 'New Therapist Recommendations Available',
      message: `We've found ${therapistCount} new therapist matches for you ${reasonMessages[updateReason]}. Check them out!`,
      type: 'NEW_RECOMMENDATIONS',
      priority: 'NORMAL',
      actionUrl: '/client/therapists/recommendations',
      data: {
        therapistCount,
        updateReason,
        recommendationType: 'updated_matches',
      },
    });
  }

  async createMatchingSystemUpdateNotification(
    userId: string,
    updateType: 'algorithm_improvement' | 'feature_release' | 'maintenance',
    updateMessage: string,
  ) {
    const titles = {
      algorithm_improvement: 'Better Matching Available',
      feature_release: 'New Feature Available',
      maintenance: 'System Update Complete',
    };

    const priorities = {
      algorithm_improvement: 'NORMAL',
      feature_release: 'NORMAL',
      maintenance: 'LOW',
    } as const;

    return this.create({
      userId,
      title: titles[updateType],
      message: updateMessage,
      type: 'SYSTEM_UPDATE',
      priority: priorities[updateType],
      actionUrl: '/dashboard',
      data: {
        updateType,
        systemUpdate: true,
      },
    });
  }

  async createRelationshipEstablishedNotification(
    clientId: string,
    therapistId: string,
    therapistName: string,
  ) {
    return this.create({
      userId: clientId,
      title: 'Welcome to Your Therapy Journey! 🌟',
      message: `You're now connected with ${therapistName}. Your therapy relationship has officially begun. Take the first step by scheduling your initial session.`,
      type: 'RELATIONSHIP_ESTABLISHED',
      priority: 'HIGH',
      actionUrl: `/client/therapists/${therapistId}/schedule`,
      data: {
        therapistId,
        therapistName,
        relationshipStatus: 'active',
        nextStep: 'schedule_first_session',
      },
    });
  }

  async createTherapistRequestReminderNotification(
    therapistId: string,
    pendingRequestCount: number,
  ) {
    return this.create({
      userId: therapistId,
      title: `${pendingRequestCount} Pending Client Request${pendingRequestCount > 1 ? 's' : ''}`,
      message: `You have ${pendingRequestCount} client request${pendingRequestCount > 1 ? 's' : ''} waiting for your response. Clients appreciate timely responses!`,
      type: 'REQUEST_REMINDER',
      priority: pendingRequestCount > 3 ? 'HIGH' : 'NORMAL',
      actionUrl: '/therapist/requests/pending',
      data: {
        pendingRequestCount,
        reminderType: 'pending_requests',
        urgency: pendingRequestCount > 3 ? 'high' : 'normal',
      },
    });
  }

  async createProfileCompletionReminderNotification(
    userId: string,
    userType: 'client' | 'therapist',
    missingFields: string[],
  ) {
    const actionUrls = {
      client: '/client/profile',
      therapist: '/therapist/profile',
    };

    return this.create({
      userId,
      title: 'Complete Your Profile for Better Matches',
      message: `Complete your profile to get better therapist recommendations. Missing: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}`,
      type: 'PROFILE_COMPLETION',
      priority: 'LOW',
      actionUrl: actionUrls[userType],
      data: {
        missingFields,
        userType,
        profileCompleteness: Math.max(0, 100 - missingFields.length * 10),
      },
    });
  }

  async sendScheduledNotifications() {
    // Since scheduledFor and sentAt fields don't exist in the Notification model,
    // this method returns a stub response. In a real implementation with these fields,
    // this would process and send scheduled notifications.
    this.logger.log(
      'Scheduled notifications check completed (no scheduled fields available)',
    );

    return { sent: 0 };
  }

  // ===== BOOKING & APPOINTMENT EVENT LISTENERS =====

  /**
   * Handle appointment booked events
   */
  @OnEvent('AppointmentBookedEvent')
  async handleAppointmentBooked(event: any) {
    try {
      const { data } = event;

      // Get therapist and client details
      const [therapist, client] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: data.therapistId },
          select: { firstName: true, lastName: true },
        }),
        this.prisma.user.findUnique({
          where: { id: data.clientId },
          select: { firstName: true, lastName: true },
        }),
      ]);

      if (!therapist || !client) return;

      // Notify client about successful booking
      await this.create(
        {
          userId: data.clientId,
          title: 'Session Booked Successfully!',
          message: `Your ${data.meetingType} session with ${therapist.firstName} ${therapist.lastName} has been scheduled for ${new Date(data.startTime).toLocaleDateString()} at ${new Date(data.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: NotificationType.APPOINTMENT_CONFIRMED,
          priority: NotificationPriority.HIGH,
          actionUrl: `/client/meetings/${data.appointmentId}`,
          data: {
            appointmentId: data.appointmentId,
            therapistId: data.therapistId,
            startTime: data.startTime,
            duration: data.duration,
            meetingType: data.meetingType,
          },
        },
        {
          realTime: true,
          email: true,
          push: true,
        },
      );

      // Notify therapist about new booking
      await this.create(
        {
          userId: data.therapistId,
          title: 'New Session Booked',
          message: `${client.firstName} ${client.lastName} has booked a ${data.duration}-minute ${data.meetingType} session with you on ${new Date(data.startTime).toLocaleDateString()} at ${new Date(data.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: NotificationType.APPOINTMENT_CONFIRMED,
          priority: NotificationPriority.HIGH,
          actionUrl: `/therapist/meetings/${data.appointmentId}`,
          data: {
            appointmentId: data.appointmentId,
            clientId: data.clientId,
            startTime: data.startTime,
            duration: data.duration,
            meetingType: data.meetingType,
          },
        },
        {
          realTime: true,
          email: true,
          push: true,
        },
      );

      this.logger.log(
        `Appointment booked notifications sent for appointment ${data.appointmentId}`,
      );
    } catch (error) {
      this.logger.error(`Error handling appointment booked event:`, error);
    }
  }

  /**
   * Handle appointment cancelled events
   */
  @OnEvent('AppointmentCancelledEvent')
  async handleAppointmentCancelled(event: any) {
    try {
      const { data } = event;

      // Get therapist and client details
      const [therapist, client] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: data.therapistId },
          select: { firstName: true, lastName: true },
        }),
        this.prisma.user.findUnique({
          where: { id: data.clientId },
          select: { firstName: true, lastName: true },
        }),
      ]);

      if (!therapist || !client) return;

      const isCancelledByClient = data.cancelledBy === data.clientId;

      // Notify the other party about the cancellation
      const notifyUserId = isCancelledByClient
        ? data.therapistId
        : data.clientId;
      const cancellerName = isCancelledByClient
        ? `${client.firstName} ${client.lastName}`
        : `${therapist.firstName} ${therapist.lastName}`;

      await this.create(
        {
          userId: notifyUserId,
          title: 'Session Cancelled',
          message: `Your session scheduled for ${new Date(data.originalStartTime).toLocaleDateString()} at ${new Date(data.originalStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} has been cancelled by ${cancellerName}. ${data.cancellationReason}`,
          type: NotificationType.APPOINTMENT_CANCELLED,
          priority: NotificationPriority.HIGH,
          actionUrl: isCancelledByClient
            ? '/therapist/schedule'
            : '/client/booking',
          data: {
            appointmentId: data.appointmentId,
            cancelledBy: data.cancelledBy,
            cancellationReason: data.cancellationReason,
            originalStartTime: data.originalStartTime,
          },
        },
        {
          realTime: true,
          email: true,
          push: true,
        },
      );

      // Notify the canceller with confirmation
      await this.create(
        {
          userId: data.cancelledBy,
          title: 'Session Cancellation Confirmed',
          message: `Your session with ${isCancelledByClient ? therapist.firstName + ' ' + therapist.lastName : client.firstName + ' ' + client.lastName} scheduled for ${new Date(data.originalStartTime).toLocaleDateString()} has been successfully cancelled.`,
          type: NotificationType.APPOINTMENT_CANCELLED,
          priority: NotificationPriority.NORMAL,
          actionUrl: isCancelledByClient
            ? '/client/booking'
            : '/therapist/schedule',
          data: {
            appointmentId: data.appointmentId,
            originalStartTime: data.originalStartTime,
            refundProcessed: true,
          },
        },
        {
          realTime: true,
          email: false,
          push: false,
        },
      );

      this.logger.log(
        `Appointment cancellation notifications sent for appointment ${data.appointmentId}`,
      );
    } catch (error) {
      this.logger.error(`Error handling appointment cancelled event:`, error);
    }
  }

  /**
   * Handle appointment rescheduled events
   */
  @OnEvent('AppointmentRescheduledEvent')
  async handleAppointmentRescheduled(event: any) {
    try {
      const { data } = event;

      // Get therapist and client details
      const [therapist, client] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: data.therapistId },
          select: { firstName: true, lastName: true },
        }),
        this.prisma.user.findUnique({
          where: { id: data.clientId },
          select: { firstName: true, lastName: true },
        }),
      ]);

      if (!therapist || !client) return;

      const isRescheduledByClient = data.rescheduledBy === data.clientId;

      // Notify the other party about the reschedule
      const notifyUserId = isRescheduledByClient
        ? data.therapistId
        : data.clientId;
      const reschedulerName = isRescheduledByClient
        ? `${client.firstName} ${client.lastName}`
        : `${therapist.firstName} ${therapist.lastName}`;

      await this.create(
        {
          userId: notifyUserId,
          title: 'Session Rescheduled',
          message: `${reschedulerName} has rescheduled your session. New time: ${new Date(data.newStartTime).toLocaleDateString()} at ${new Date(data.newStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (previously ${new Date(data.originalStartTime).toLocaleDateString()} at ${new Date(data.originalStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`,
          type: NotificationType.APPOINTMENT_RESCHEDULED,
          priority: NotificationPriority.HIGH,
          actionUrl: `/client/meetings/${data.appointmentId}`,
          data: {
            appointmentId: data.appointmentId,
            rescheduledBy: data.rescheduledBy,
            originalStartTime: data.originalStartTime,
            newStartTime: data.newStartTime,
            rescheduleReason: data.rescheduleReason,
          },
        },
        {
          realTime: true,
          email: true,
          push: true,
        },
      );

      // Notify the rescheduler with confirmation
      await this.create(
        {
          userId: data.rescheduledBy,
          title: 'Session Reschedule Confirmed',
          message: `Your session has been successfully rescheduled to ${new Date(data.newStartTime).toLocaleDateString()} at ${new Date(data.newStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: NotificationType.APPOINTMENT_RESCHEDULED,
          priority: NotificationPriority.NORMAL,
          actionUrl: `/client/meetings/${data.appointmentId}`,
          data: {
            appointmentId: data.appointmentId,
            originalStartTime: data.originalStartTime,
            newStartTime: data.newStartTime,
          },
        },
        {
          realTime: true,
          email: false,
          push: false,
        },
      );

      this.logger.log(
        `Appointment rescheduled notifications sent for appointment ${data.appointmentId}`,
      );
    } catch (error) {
      this.logger.error(`Error handling appointment rescheduled event:`, error);
    }
  }

  /**
   * Handle appointment completed events
   */
  @OnEvent('AppointmentCompletedEvent')
  async handleAppointmentCompleted(event: any) {
    try {
      const { data } = event;

      // Get therapist and client details
      const [therapist, client] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: data.therapistId },
          select: { firstName: true, lastName: true },
        }),
        this.prisma.user.findUnique({
          where: { id: data.clientId },
          select: { firstName: true, lastName: true },
        }),
      ]);

      if (!therapist || !client) return;

      // Notify client about session completion and review request
      await this.create(
        {
          userId: data.clientId,
          title: 'Session Completed - Share Your Feedback',
          message: `Your session with ${therapist.firstName} ${therapist.lastName} has been completed. How was your experience? Your feedback helps us improve our services.`,
          type: NotificationType.REVIEW_REQUEST,
          priority: NotificationPriority.NORMAL,
          actionUrl: `/client/therapists/${data.therapistId}/review?session=${data.appointmentId}`,
          data: {
            appointmentId: data.appointmentId,
            therapistId: data.therapistId,
            completedAt: data.completedAt,
            duration: data.duration,
            attendanceStatus: data.attendanceStatus,
          },
        },
        {
          realTime: true,
          email: false,
          push: true,
        },
      );

      // Notify therapist about session completion
      await this.create(
        {
          userId: data.therapistId,
          title: 'Session Completed',
          message: `Your session with ${client.firstName} ${client.lastName} has been marked as completed. Duration: ${data.duration} minutes.`,
          type: NotificationType.APPOINTMENT_CONFIRMED,
          priority: NotificationPriority.NORMAL,
          actionUrl: `/therapist/sessions/${data.appointmentId}`,
          data: {
            appointmentId: data.appointmentId,
            clientId: data.clientId,
            completedAt: data.completedAt,
            duration: data.duration,
            attendanceStatus: data.attendanceStatus,
            sessionNotes: data.sessionNotes,
          },
        },
        {
          realTime: true,
          email: false,
          push: false,
        },
      );

      this.logger.log(
        `Appointment completed notifications sent for appointment ${data.appointmentId}`,
      );
    } catch (error) {
      this.logger.error(`Error handling appointment completed event:`, error);
    }
  }
}
