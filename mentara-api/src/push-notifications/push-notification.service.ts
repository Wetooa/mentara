import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface PushSubscriptionInfo {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private vapidInitialized = false;

  constructor() {
    this.initializeVapid();
  }

  /**
   * Initialize VAPID keys for web push
   */
  private initializeVapid(): void {
    try {
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@mentara.com';

      if (!vapidPublicKey || !vapidPrivateKey) {
        this.logger.warn('VAPID keys not configured. Push notifications will be disabled.');
        return;
      }

      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
      this.vapidInitialized = true;
      this.logger.log('VAPID keys initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize VAPID keys:', error);
    }
  }

  /**
   * Send push notification to a specific subscription
   */
  async sendPushNotification(
    endpoint: string,
    p256dhKey: string,
    authKey: string,
    payload: PushNotificationPayload
  ): Promise<void> {
    if (!this.vapidInitialized) {
      throw new Error('VAPID keys not initialized');
    }

    try {
      const subscription = {
        endpoint,
        keys: {
          p256dh: p256dhKey,
          auth: authKey,
        },
      };

      const notificationPayload = JSON.stringify(payload);

      const options = {
        TTL: 60 * 60 * 24, // 24 hours
        urgency: 'normal' as const,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await webpush.sendNotification(subscription, notificationPayload, options);
      
      this.logger.log(`Push notification sent successfully to ${endpoint}`);
    } catch (error) {
      this.logger.error(`Failed to send push notification to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Send push notification to multiple subscriptions
   */
  async sendPushNotificationToMultiple(
    subscriptions: PushSubscriptionInfo[],
    payload: PushNotificationPayload
  ): Promise<{ success: number; failed: number }> {
    if (!this.vapidInitialized) {
      throw new Error('VAPID keys not initialized');
    }

    let successCount = 0;
    let failedCount = 0;

    const promises = subscriptions.map(async (subscription) => {
      try {
        await this.sendPushNotification(
          subscription.endpoint,
          subscription.p256dhKey,
          subscription.authKey,
          payload
        );
        successCount++;
      } catch (error) {
        failedCount++;
        this.logger.error(`Failed to send to ${subscription.endpoint}:`, error);
      }
    });

    await Promise.allSettled(promises);

    this.logger.log(`Push notification batch complete: ${successCount} success, ${failedCount} failed`);
    
    return { success: successCount, failed: failedCount };
  }

  /**
   * Validate push subscription
   */
  validateSubscription(subscription: any): boolean {
    return !!(
      subscription &&
      subscription.endpoint &&
      subscription.keys &&
      subscription.keys.p256dh &&
      subscription.keys.auth
    );
  }

  /**
   * Generate VAPID keys (utility method for setup)
   */
  static generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
  }

  /**
   * Test push notification
   */
  async testPushNotification(
    endpoint: string,
    p256dhKey: string,
    authKey: string
  ): Promise<boolean> {
    try {
      const testPayload: PushNotificationPayload = {
        title: 'Mentara Test Notification',
        body: 'Push notifications are working correctly!',
        icon: '/icon-192x192.png',
        data: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      };

      await this.sendPushNotification(endpoint, p256dhKey, authKey, testPayload);
      return true;
    } catch (error) {
      this.logger.error('Test push notification failed:', error);
      return false;
    }
  }

  /**
   * Create message notification payload
   */
  createMessageNotificationPayload(
    senderName: string,
    messageContent: string,
    conversationId: string,
    messageId: string
  ): PushNotificationPayload {
    const truncatedContent = messageContent.length > 100 
      ? `${messageContent.substring(0, 100)}...` 
      : messageContent;

    return {
      title: `New message from ${senderName}`,
      body: truncatedContent,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'message',
        conversationId,
        messageId,
        url: `/user/messages?conversation=${conversationId}`,
        timestamp: new Date().toISOString(),
      },
      actions: [
        {
          action: 'open',
          title: 'Open Message',
        },
        {
          action: 'close',
          title: 'Dismiss',
        },
      ],
    };
  }

  /**
   * Create appointment reminder notification payload
   */
  createAppointmentReminderPayload(
    therapistName: string,
    appointmentTime: Date,
    meetingId: string
  ): PushNotificationPayload {
    const timeString = appointmentTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      title: 'Upcoming Therapy Session',
      body: `Your session with ${therapistName} starts at ${timeString}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'appointment',
        meetingId,
        therapistName,
        appointmentTime: appointmentTime.toISOString(),
        url: `/meeting/${meetingId}`,
      },
      actions: [
        {
          action: 'join',
          title: 'Join Session',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };
  }

  /**
   * Create worksheet notification payload
   */
  createWorksheetNotificationPayload(
    worksheetTitle: string,
    worksheetId: string,
    isAssignment: boolean = true
  ): PushNotificationPayload {
    const title = isAssignment ? 'New Worksheet Assignment' : 'Worksheet Update';
    const body = isAssignment 
      ? `You have a new worksheet: ${worksheetTitle}`
      : `Your worksheet "${worksheetTitle}" has been updated`;

    return {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'worksheet',
        worksheetId,
        worksheetTitle,
        isAssignment,
        url: `/user/worksheets/${worksheetId}`,
      },
      actions: [
        {
          action: 'open',
          title: 'View Worksheet',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };
  }

  /**
   * Check if push notifications are properly configured
   */
  isConfigured(): boolean {
    return this.vapidInitialized;
  }

  /**
   * Get service status
   */
  getStatus(): {
    configured: boolean;
    vapidInitialized: boolean;
    environment: string;
  } {
    return {
      configured: this.isConfigured(),
      vapidInitialized: this.vapidInitialized,
      environment: process.env.NODE_ENV || 'unknown',
    };
  }
}