import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);
  private isInitialized = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.isInitialized = false;
    this.logger.log('Push notification service initialized in stub mode');
  }

  async registerDeviceToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceInfo?: {
      model?: string;
      os?: string;
      appVersion?: string;
      pushEnabled?: boolean;
    },
  ): Promise<void> {
    try {
      // Convert lowercase platform to uppercase for Prisma enum
      const prismaPlatform = platform.toUpperCase() as 'IOS' | 'ANDROID' | 'WEB';
      
      // Check if token already exists
      const existingToken = await this.prisma.deviceToken.findFirst({
        where: { token },
      });

      if (existingToken) {
        // Update existing token
        await this.prisma.deviceToken.update({
          where: { id: existingToken.id },
          data: {
            userId,
            platform: prismaPlatform,
            isActive: true,
            lastUsedAt: new Date(),
            deviceInfo,
          },
        });
      } else {
        // Create new token
        await this.prisma.deviceToken.create({
          data: {
            userId,
            token,
            platform: prismaPlatform,
            isActive: true,
            lastUsedAt: new Date(),
            deviceInfo,
          },
        });
      }

      this.logger.log(
        `Device token registered for user ${userId} on ${platform}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to register device token: ${errorMessage}`);
      throw error;
    }
  }

  async unregisterDeviceToken(token: string): Promise<void> {
    try {
      await this.prisma.deviceToken.updateMany({
        where: { token },
        data: { isActive: false },
      });

      this.logger.log(`Device token unregistered: ${token}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to unregister device token: ${errorMessage}`);
      throw error;
    }
  }

  async sendPushNotification(payload: PushNotificationPayload): Promise<void> {
    this.logger.log(`Stub: Would send push notification to user ${payload.userId}: ${payload.title}`);
  }

  async sendPushNotificationToMultipleUsers(
    userIds: string[],
    payload: Omit<PushNotificationPayload, 'userId'>,
  ): Promise<void> {
    this.logger.log(`Stub: Would send push notification to ${userIds.length} users: ${payload.title}`);
  }

  async sendTestNotification(
    userId: string,
    message: string,
  ): Promise<void> {
    this.logger.log(`Stub: Would send test notification to user ${userId}: ${message}`);
  }

  async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    try {
      const tokens = await this.prisma.deviceToken.findMany({
        where: {
          userId,
          isActive: true,
        },
        orderBy: { lastUsedAt: 'desc' },
      });

      return tokens.map(token => ({
        id: token.id,
        userId: token.userId,
        token: token.token,
        platform: token.platform.toLowerCase() as 'ios' | 'android' | 'web',
        isActive: token.isActive,
        lastUsedAt: token.lastUsedAt,
        deviceInfo: token.deviceInfo as any,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get user device tokens: ${errorMessage}`);
      return [];
    }
  }

  async cleanupInactiveTokens(daysInactive = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

      const result = await this.prisma.deviceToken.deleteMany({
        where: {
          OR: [
            {
              lastUsedAt: {
                lt: cutoffDate,
              },
            },
            {
              isActive: false,
            },
          ],
        },
      });

      this.logger.log(
        `Cleaned up ${result.count} inactive device tokens older than ${daysInactive} days`,
      );

      return result.count;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to cleanup inactive tokens: ${errorMessage}`);
      return 0;
    }
  }

  async getStatistics(userId?: string) {
    // Stub implementation
    return {
      totalTokens: 0,
      activeTokens: 0,
      platforms: { ios: 0, android: 0, web: 0 },
      recentActivity: [],
    };
  }

  async processScheduledNotifications() {
    // Stub implementation
    this.logger.log('Stub: Would process scheduled notifications');
    return { processed: 0, failed: 0 };
  }
}