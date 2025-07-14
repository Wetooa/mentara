import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PrismaService } from '../database/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

interface SubscribeRequest {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userId?: string;
}

interface TestNotificationRequest {
  title?: string;
  body?: string;
}

@Controller('push-notifications')
@UseGuards(AuthGuard)
export class PushNotificationController {
  private readonly logger = new Logger(PushNotificationController.name);

  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Subscribe user to push notifications
   */
  @Post('subscribe')
  async subscribe(
    @Body() subscribeRequest: SubscribeRequest,
    @CurrentUser() user: any,
  ) {
    try {
      const userId = subscribeRequest.userId || user.id;
      const { subscription } = subscribeRequest;

      // Validate subscription data
      if (!this.pushNotificationService.validateSubscription(subscription)) {
        throw new HttpException(
          'Invalid subscription data',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if subscription already exists
      const existingSubscription = await this.prisma.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: subscription.endpoint,
        },
      });

      if (existingSubscription) {
        // Update existing subscription
        await this.prisma.pushSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            p256dhKey: subscription.keys.p256dh,
            authKey: subscription.keys.auth,
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Updated push subscription for user ${userId}`);
      } else {
        // Create new subscription
        await this.prisma.pushSubscription.create({
          data: {
            userId,
            endpoint: subscription.endpoint,
            p256dhKey: subscription.keys.p256dh,
            authKey: subscription.keys.auth,
          },
        });

        this.logger.log(`Created new push subscription for user ${userId}`);
      }

      // Test the subscription by sending a welcome notification
      try {
        await this.pushNotificationService.sendPushNotification(
          subscription.endpoint,
          subscription.keys.p256dh,
          subscription.keys.auth,
          {
            title: 'Push Notifications Enabled',
            body: 'You will now receive notifications from Mentara',
            icon: '/icon-192x192.png',
            data: {
              type: 'welcome',
              timestamp: new Date().toISOString(),
            },
          },
        );
      } catch (error) {
        this.logger.warn('Failed to send welcome notification:', error);
      }

      return {
        success: true,
        message: 'Successfully subscribed to push notifications',
      };
    } catch (error) {
      this.logger.error('Failed to subscribe to push notifications:', error);
      throw new HttpException(
        'Failed to subscribe to push notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Unsubscribe user from push notifications
   */
  @Post('unsubscribe')
  async unsubscribe(
    @Body() body: { userId?: string; endpoint?: string },
    @CurrentUser() user: any,
  ) {
    try {
      const userId = body.userId || user.id;

      if (body.endpoint) {
        // Remove specific subscription
        await this.prisma.pushSubscription.deleteMany({
          where: {
            userId,
            endpoint: body.endpoint,
          },
        });
      } else {
        // Remove all subscriptions for user
        await this.prisma.pushSubscription.deleteMany({
          where: { userId },
        });
      }

      this.logger.log(`Removed push subscriptions for user ${userId}`);

      return {
        success: true,
        message: 'Successfully unsubscribed from push notifications',
      };
    } catch (error) {
      this.logger.error('Failed to unsubscribe from push notifications:', error);
      throw new HttpException(
        'Failed to unsubscribe from push notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user's push subscriptions
   */
  @Get('subscriptions')
  async getSubscriptions(@CurrentUser() user: any) {
    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          endpoint: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        subscriptions,
        count: subscriptions.length,
      };
    } catch (error) {
      this.logger.error('Failed to get push subscriptions:', error);
      throw new HttpException(
        'Failed to get push subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Test push notification for current user
   */
  @Post('test')
  async testNotification(
    @Body() testRequest: TestNotificationRequest,
    @CurrentUser() user: any,
  ) {
    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId: user.id },
      });

      if (subscriptions.length === 0) {
        throw new HttpException(
          'No push subscriptions found for user',
          HttpStatus.NOT_FOUND,
        );
      }

      const payload = {
        title: testRequest.title || 'Test Notification',
        body: testRequest.body || 'This is a test notification from Mentara',
        icon: '/icon-192x192.png',
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
        },
      };

      let successCount = 0;
      let failedCount = 0;

      for (const subscription of subscriptions) {
        try {
          await this.pushNotificationService.sendPushNotification(
            subscription.endpoint,
            subscription.p256dhKey,
            subscription.authKey,
            payload,
          );
          successCount++;
        } catch (error) {
          failedCount++;
          this.logger.error(
            `Failed to send test notification to ${subscription.endpoint}:`,
            error,
          );

          // Remove invalid subscriptions
          if (error.message?.includes('invalid') || error.message?.includes('expired')) {
            await this.prisma.pushSubscription.delete({
              where: { id: subscription.id },
            });
            this.logger.log(`Removed invalid subscription: ${subscription.id}`);
          }
        }
      }

      return {
        success: true,
        message: 'Test notifications sent',
        results: {
          total: subscriptions.length,
          successful: successCount,
          failed: failedCount,
        },
      };
    } catch (error) {
      this.logger.error('Failed to send test notification:', error);
      throw new HttpException(
        'Failed to send test notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get push notification service status
   */
  @Get('status')
  async getStatus() {
    try {
      const status = this.pushNotificationService.getStatus();
      
      return {
        success: true,
        status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get service status:', error);
      throw new HttpException(
        'Failed to get service status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Clean up invalid subscriptions
   */
  @Delete('cleanup')
  async cleanupInvalidSubscriptions(@CurrentUser() user: any) {
    try {
      // This endpoint allows manual cleanup of subscriptions
      // In production, this should be run as a scheduled job
      
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId: user.id },
      });

      let removedCount = 0;

      for (const subscription of subscriptions) {
        try {
          // Test each subscription with a minimal payload
          const isValid = await this.pushNotificationService.testPushNotification(
            subscription.endpoint,
            subscription.p256dhKey,
            subscription.authKey,
          );

          if (!isValid) {
            await this.prisma.pushSubscription.delete({
              where: { id: subscription.id },
            });
            removedCount++;
          }
        } catch (error) {
          // Remove subscription if test fails
          await this.prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
          removedCount++;
        }
      }

      this.logger.log(`Cleaned up ${removedCount} invalid subscriptions for user ${user.id}`);

      return {
        success: true,
        message: `Removed ${removedCount} invalid subscriptions`,
        removedCount,
        totalTested: subscriptions.length,
      };
    } catch (error) {
      this.logger.error('Failed to cleanup subscriptions:', error);
      throw new HttpException(
        'Failed to cleanup subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}