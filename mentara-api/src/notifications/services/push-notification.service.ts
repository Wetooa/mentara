import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { NotificationType, NotificationPriority } from '@prisma/client';

interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  data?: { [key: string]: string };
  actionUrl?: string;
  imageUrl?: string;
  sound?: string;
  badge?: number;
}

interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  isActive: boolean;
  lastUsedAt: Date;
  deviceInfo?: {
    model?: string;
    os?: string;
    appVersion?: string;
    pushEnabled?: boolean;
  };
}

interface BatchPushResult {
  successful: number;
  failed: number;
  invalidTokens: string[];
  results: {
    token: string;
    success: boolean;
    error?: string;
  }[];
}

interface PushNotificationTemplate {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  sound?: string;
  category?: string;
  data?: { [key: string]: string };
}

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);
  private fcmApp: admin.app.App | null = null;
  private isInitialized = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    await this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private async initializeFirebase(): Promise<void> {
    try {
      const serviceAccountPath = this.configService.get<string>('FCM_SERVICE_ACCOUNT_PATH');
      const serviceAccountKey = this.configService.get<string>('FCM_SERVICE_ACCOUNT_KEY');
      
      if (!serviceAccountPath && !serviceAccountKey) {
        this.logger.warn('Firebase service account not configured. Push notifications will be disabled.');
        return;
      }

      let serviceAccount: admin.ServiceAccount;

      if (serviceAccountPath) {
        serviceAccount = require(serviceAccountPath);
      } else if (serviceAccountKey) {
        serviceAccount = JSON.parse(serviceAccountKey);
      } else {
        throw new Error('No valid Firebase service account configuration found');
      }

      // Initialize Firebase Admin if not already initialized
      if (!admin.apps.length) {
        this.fcmApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
      } else {
        this.fcmApp = admin.app();
      }

      this.isInitialized = true;
      this.logger.log('Firebase Admin SDK initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceInfo?: {
      model?: string;
      os?: string;
      appVersion?: string;
      pushEnabled?: boolean;
    }
  ): Promise<void> {
    try {
      // Check if token already exists
      const existingToken = await this.prisma.deviceToken.findFirst({
        where: { token }
      });

      if (existingToken) {
        // Update existing token
        await this.prisma.deviceToken.update({
          where: { id: existingToken.id },
          data: {
            userId,
            platform,
            isActive: true,
            lastUsedAt: new Date(),
            deviceInfo
          }
        });
      } else {
        // Create new token
        await this.prisma.deviceToken.create({
          data: {
            userId,
            token,
            platform,
            isActive: true,
            lastUsedAt: new Date(),
            deviceInfo
          }
        });
      }

      this.logger.log(`Device token registered for user ${userId} on ${platform}`);

    } catch (error) {
      this.logger.error(`Error registering device token:`, error);
      throw error;
    }
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(token: string): Promise<void> {
    try {
      await this.prisma.deviceToken.updateMany({
        where: { token },
        data: { isActive: false }
      });

      this.logger.log(`Device token unregistered: ${token.substring(0, 20)}...`);

    } catch (error) {
      this.logger.error(`Error unregistering device token:`, error);
      throw error;
    }
  }

  /**
   * Send push notification to a single user
   */
  async sendToUser(userId: string, payload: Omit<PushNotificationPayload, 'userId'>): Promise<void> {
    if (!this.isInitialized || !this.fcmApp) {
      this.logger.warn('Firebase not initialized. Push notification not sent.');
      return;
    }

    try {
      // Get user's active device tokens
      const deviceTokens = await this.prisma.deviceToken.findMany({
        where: {
          userId,
          isActive: true
        }
      });

      if (deviceTokens.length === 0) {
        this.logger.log(`No active device tokens found for user ${userId}`);
        return;
      }

      // Send to all user's devices
      const results = await this.sendToTokens(
        deviceTokens.map(dt => dt.token),
        { ...payload, userId }
      );

      // Clean up invalid tokens
      if (results.invalidTokens.length > 0) {
        await this.cleanupInvalidTokens(results.invalidTokens);
      }

      this.logger.log(`Push notification sent to user ${userId}: ${results.successful} successful, ${results.failed} failed`);

    } catch (error) {
      this.logger.error(`Error sending push notification to user ${userId}:`, error);
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: Omit<PushNotificationPayload, 'userId'>): Promise<void> {
    if (!this.isInitialized || !this.fcmApp) {
      this.logger.warn('Firebase not initialized. Push notifications not sent.');
      return;
    }

    try {
      const batchSize = 500; // FCM batch limit
      const userBatches = this.chunkArray(userIds, batchSize);

      for (const userBatch of userBatches) {
        // Get all device tokens for this batch of users
        const deviceTokens = await this.prisma.deviceToken.findMany({
          where: {
            userId: { in: userBatch },
            isActive: true
          }
        });

        if (deviceTokens.length === 0) continue;

        // Send to all tokens in this batch
        const results = await this.sendToTokens(
          deviceTokens.map(dt => dt.token),
          { ...payload, userId: userBatch[0] } // Use first user for logging
        );

        // Clean up invalid tokens
        if (results.invalidTokens.length > 0) {
          await this.cleanupInvalidTokens(results.invalidTokens);
        }

        this.logger.log(`Push notifications sent to ${userBatch.length} users: ${results.successful} successful, ${results.failed} failed`);
      }

    } catch (error) {
      this.logger.error(`Error sending push notifications to multiple users:`, error);
    }
  }

  /**
   * Send push notification to specific device tokens
   */
  private async sendToTokens(tokens: string[], payload: PushNotificationPayload): Promise<BatchPushResult> {
    if (!this.fcmApp || tokens.length === 0) {
      return { successful: 0, failed: 0, invalidTokens: [], results: [] };
    }

    try {
      const messaging = admin.messaging(this.fcmApp);
      
      // Build FCM message
      const message = this.buildFCMMessage(payload);

      // Send to multiple tokens
      const response = await messaging.sendEachForMulticast({
        tokens,
        ...message
      });

      // Process results
      const results: BatchPushResult['results'] = [];
      const invalidTokens: string[] = [];

      response.responses.forEach((result, index) => {
        const token = tokens[index];
        
        if (result.success) {
          results.push({ token, success: true });
        } else {
          const error = result.error?.code || 'Unknown error';
          results.push({ token, success: false, error });

          // Check if token is invalid
          if (this.isTokenInvalid(result.error)) {
            invalidTokens.push(token);
          }
        }
      });

      return {
        successful: response.successCount,
        failed: response.failureCount,
        invalidTokens,
        results
      };

    } catch (error) {
      this.logger.error('Error sending FCM messages:', error);
      return { successful: 0, failed: tokens.length, invalidTokens: [], results: [] };
    }
  }

  /**
   * Build FCM message from payload
   */
  private buildFCMMessage(payload: PushNotificationPayload): admin.messaging.MulticastMessage {
    const data: { [key: string]: string } = {
      type: payload.type,
      priority: payload.priority,
      userId: payload.userId,
      ...(payload.data || {})
    };

    if (payload.actionUrl) {
      data.actionUrl = payload.actionUrl;
    }

    // Build notification object
    const notification: admin.messaging.Notification = {
      title: payload.title,
      body: payload.body
    };

    if (payload.imageUrl) {
      notification.imageUrl = payload.imageUrl;
    }

    // Build Android-specific config
    const android: admin.messaging.AndroidConfig = {
      priority: payload.priority === NotificationPriority.HIGH ? 'high' : 'normal',
      notification: {
        channelId: this.getAndroidChannelId(payload.type),
        priority: payload.priority === NotificationPriority.HIGH ? 'high' : 'default',
        sound: payload.sound || 'default',
        clickAction: payload.actionUrl ? 'FLUTTER_NOTIFICATION_CLICK' : undefined
      }
    };

    // Build iOS-specific config
    const apns: admin.messaging.ApnsConfig = {
      payload: {
        aps: {
          alert: {
            title: payload.title,
            body: payload.body
          },
          sound: payload.sound || 'default',
          badge: payload.badge,
          category: this.getIOSCategory(payload.type),
          'content-available': 1
        }
      }
    };

    return {
      notification,
      data,
      android,
      apns,
      tokens: [] // Will be set by caller
    };
  }

  /**
   * Get Android notification channel ID based on type
   */
  private getAndroidChannelId(type: NotificationType): string {
    const channelMap: { [key: string]: string } = {
      [NotificationType.MESSAGE_RECEIVED]: 'messages',
      [NotificationType.APPOINTMENT_REMINDER]: 'appointments',
      [NotificationType.COMMUNITY_POST]: 'community',
      [NotificationType.SYSTEM_UPDATE]: 'system',
      [NotificationType.THERAPIST_APPROVED]: 'important',
      [NotificationType.THERAPIST_REJECTED]: 'important',
      [NotificationType.COMMUNITY_RECOMMENDATION]: 'recommendations',
      [NotificationType.COMMUNITY_JOINED]: 'community',
      [NotificationType.COMMUNITY_WELCOME]: 'community'
    };

    return channelMap[type] || 'default';
  }

  /**
   * Get iOS notification category based on type
   */
  private getIOSCategory(type: NotificationType): string {
    const categoryMap: { [key: string]: string } = {
      [NotificationType.MESSAGE_RECEIVED]: 'MESSAGE_CATEGORY',
      [NotificationType.APPOINTMENT_REMINDER]: 'APPOINTMENT_CATEGORY',
      [NotificationType.COMMUNITY_POST]: 'COMMUNITY_CATEGORY',
      [NotificationType.COMMUNITY_RECOMMENDATION]: 'RECOMMENDATION_CATEGORY'
    };

    return categoryMap[type] || 'DEFAULT_CATEGORY';
  }

  /**
   * Check if FCM error indicates invalid token
   */
  private isTokenInvalid(error: admin.messaging.MessagingError | undefined): boolean {
    if (!error) return false;

    const invalidCodes = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
      'messaging/invalid-package-name'
    ];

    return invalidCodes.includes(error.code);
  }

  /**
   * Clean up invalid device tokens
   */
  private async cleanupInvalidTokens(tokens: string[]): Promise<void> {
    try {
      await this.prisma.deviceToken.updateMany({
        where: { token: { in: tokens } },
        data: { isActive: false }
      });

      this.logger.log(`Cleaned up ${tokens.length} invalid device tokens`);

    } catch (error) {
      this.logger.error('Error cleaning up invalid tokens:', error);
    }
  }

  /**
   * Get push notification statistics
   */
  async getStatistics(userId?: string): Promise<{
    totalTokens: number;
    activeTokens: number;
    platformBreakdown: { platform: string; count: number }[];
    recentActivity: number;
  }> {
    try {
      const whereClause = userId ? { userId } : {};
      const recentDate = new Date();
      recentDate.setDays(recentDate.getDate() - 7);

      const [
        totalTokens,
        activeTokens,
        platformBreakdown,
        recentActivity
      ] = await Promise.all([
        this.prisma.deviceToken.count({ where: whereClause }),
        this.prisma.deviceToken.count({ where: { ...whereClause, isActive: true } }),
        this.prisma.deviceToken.groupBy({
          by: ['platform'],
          where: { ...whereClause, isActive: true },
          _count: { _all: true }
        }),
        this.prisma.deviceToken.count({
          where: {
            ...whereClause,
            isActive: true,
            lastUsedAt: { gte: recentDate }
          }
        })
      ]);

      return {
        totalTokens,
        activeTokens,
        platformBreakdown: platformBreakdown.map(p => ({
          platform: p.platform,
          count: p._count._all
        })),
        recentActivity
      };

    } catch (error) {
      this.logger.error('Error getting push notification statistics:', error);
      throw error;
    }
  }

  /**
   * Test push notification for development
   */
  async sendTestNotification(userId: string, message: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Push notification service not initialized');
    }

    await this.sendToUser(userId, {
      title: 'Test Notification',
      body: message,
      type: NotificationType.SYSTEM_UPDATE,
      priority: NotificationPriority.LOW,
      data: { test: 'true' }
    });
  }

  /**
   * Utility method to chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Schedule push notification for later delivery
   */
  async scheduleNotification(
    userId: string,
    payload: Omit<PushNotificationPayload, 'userId'>,
    scheduleTime: Date
  ): Promise<void> {
    try {
      // Store scheduled notification in database
      await this.prisma.scheduledNotification.create({
        data: {
          userId,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          priority: payload.priority,
          data: payload.data,
          actionUrl: payload.actionUrl,
          scheduledFor: scheduleTime,
          notificationChannel: 'push'
        }
      });

      this.logger.log(`Push notification scheduled for user ${userId} at ${scheduleTime}`);

    } catch (error) {
      this.logger.error(`Error scheduling push notification:`, error);
      throw error;
    }
  }

  /**
   * Process scheduled push notifications
   */
  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();
      const scheduledNotifications = await this.prisma.scheduledNotification.findMany({
        where: {
          scheduledFor: { lte: now },
          sentAt: null,
          notificationChannel: 'push'
        },
        take: 100 // Process in batches
      });

      for (const notification of scheduledNotifications) {
        await this.sendToUser(notification.userId, {
          title: notification.title,
          body: notification.body,
          type: notification.type as NotificationType,
          priority: notification.priority as NotificationPriority,
          data: notification.data as { [key: string]: string },
          actionUrl: notification.actionUrl || undefined
        });

        // Mark as sent
        await this.prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: { sentAt: now }
        });
      }

      if (scheduledNotifications.length > 0) {
        this.logger.log(`Processed ${scheduledNotifications.length} scheduled push notifications`);
      }

    } catch (error) {
      this.logger.error('Error processing scheduled push notifications:', error);
    }
  }
}