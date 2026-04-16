import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { NotificationPriority, NotificationType } from '@prisma/client';

export interface NotificationPreferences {
  userId: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
  quietHoursTimezone: string;
  deliveryPreferences: {
    [key in NotificationType]?: {
      realTime: boolean;
      email: boolean;
      push: boolean;
      quietHours: boolean; // Allow during quiet hours
    };
  };
  groupingEnabled: boolean;
  groupByType: boolean;
  groupByTimeWindow: number; // minutes
}

@Injectable()
export class SmartNotificationsService {
  private readonly logger = new Logger(SmartNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    // Get from database or use defaults
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Default preferences
    const defaultPreferences: NotificationPreferences = {
      userId,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      quietHoursTimezone: 'UTC',
      deliveryPreferences: {},
      groupingEnabled: true,
      groupByType: true,
      groupByTimeWindow: 5, // 5 minutes
    };

    return defaultPreferences;
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    const current = await this.getPreferences(userId);
    const updated = { ...current, ...preferences, userId };

    this.logger.log(`Updated notification preferences for user ${userId}`);
    return updated;
  }

  /**
   * Check if notification should be delivered based on quiet hours
   */
  async shouldDeliverNow(
    userId: string,
    notificationType: NotificationType,
    priority: NotificationPriority,
  ): Promise<boolean> {
    const preferences = await this.getPreferences(userId);

    // Always deliver urgent notifications
    if (priority === NotificationPriority.URGENT) {
      return true;
    }

    // Check type-specific quiet hours setting
    const typePrefs = preferences.deliveryPreferences[notificationType];
    if (typePrefs?.quietHours === false) {
      return true; // Type allows delivery during quiet hours
    }

    // Check global quiet hours
    if (!preferences.quietHoursEnabled) {
      return true; // Quiet hours not enabled
    }

    const now = new Date();
    const userTimezone = preferences.quietHoursTimezone || 'UTC';
    
    // Simple time check (can be enhanced with timezone library)
    const currentHour = now.getUTCHours();
    const startHour = parseInt(preferences.quietHoursStart.split(':')[0]);
    const endHour = parseInt(preferences.quietHoursEnd.split(':')[0]);

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startHour > endHour) {
      // Overnight: quiet hours span midnight
      return currentHour < endHour || currentHour >= startHour;
    } else {
      // Same day: quiet hours don't span midnight
      return currentHour < startHour || currentHour >= endHour;
    }
  }

  /**
   * Group notifications for batch delivery
   */
  async groupNotifications(
    notifications: Array<{
      id: string;
      type: NotificationType;
      priority: NotificationPriority;
      createdAt: Date;
    }>,
    preferences: NotificationPreferences,
  ): Promise<Array<Array<string>>> {
    if (!preferences.groupingEnabled) {
      // Return each notification as its own group
      return notifications.map((n) => [n.id]);
    }

    const groups: Array<Array<string>> = [];
    let currentGroup: string[] = [];
    let lastNotification: typeof notifications[0] | null = null;

    for (const notification of notifications) {
      // Urgent notifications are never grouped
      if (notification.priority === NotificationPriority.URGENT) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        groups.push([notification.id]);
        lastNotification = null;
        continue;
      }

      // Start new group if no current group
      if (currentGroup.length === 0) {
        currentGroup.push(notification.id);
        lastNotification = notification;
        continue;
      }

      // Check if should group with previous notification
      const timeDiff = notification.createdAt.getTime() - lastNotification!.createdAt.getTime();
      const timeWindowMs = preferences.groupByTimeWindow * 60 * 1000;

      const shouldGroup =
        timeDiff <= timeWindowMs &&
        (!preferences.groupByType || notification.type === lastNotification!.type);

      if (shouldGroup) {
        currentGroup.push(notification.id);
      } else {
        groups.push(currentGroup);
        currentGroup = [notification.id];
      }

      lastNotification = notification;
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Get priority-based delivery order
   */
  getDeliveryOrder(notifications: Array<{ priority: NotificationPriority }>): Array<number> {
    const priorityOrder = {
      [NotificationPriority.URGENT]: 0,
      [NotificationPriority.HIGH]: 1,
      [NotificationPriority.NORMAL]: 2,
      [NotificationPriority.LOW]: 3,
    };

    return notifications
      .map((n, index) => ({ index, priority: priorityOrder[n.priority] }))
      .sort((a, b) => a.priority - b.priority)
      .map((item) => item.index);
  }
}

