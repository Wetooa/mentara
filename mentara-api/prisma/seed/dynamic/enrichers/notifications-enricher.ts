/**
 * Notifications Enricher
 * Ensures users receive relevant notifications
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class NotificationsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Notification');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Create notifications for users with recent activity
    const users = await this.prisma.user.findMany({
      where: { role: { in: ['client', 'therapist'] } },
      take: 20,
    });

    for (const user of users) {
      try {
        added += await this.ensureUserHasNotifications(user.id, 2);
      } catch (error) {
        errors++;
      }
    }

    return { table: this.tableName, itemsAdded: added, itemsUpdated: 0, errors };
  }

  async ensureUserHasNotifications(userId: string, minNotifications: number): Promise<number> {
    const existing = await this.prisma.notification.count({
      where: { userId },
    });

    const missing = minNotifications - existing;
    if (missing <= 0) return 0;

    const templates = this.getNotificationTemplates();
    const random = this.getRandom(userId, 'notifications');

    for (let i = 0; i < missing; i++) {
      const template = templates[i % templates.length];

      await this.prisma.notification.create({
        data: {
          userId,
          title: template.title,
          message: template.message,
          type: template.type,
          isRead: random.next() > 0.5, // 50% read
          createdAt: this.randomPastDate(7),
        },
      });
    }

    return missing;
  }

  private getNotificationTemplates() {
    return [
      {
        title: 'New comment on your post',
        message: 'Someone commented on your recent post',
        type: 'comment',
      },
      {
        title: 'Upcoming session reminder',
        message: 'You have a therapy session tomorrow',
        type: 'appointment',
      },
      {
        title: 'New message received',
        message: 'You have a new message in your inbox',
        type: 'message',
      },
      {
        title: 'Worksheet assigned',
        message: 'Your therapist assigned you a new worksheet',
        type: 'worksheet',
      },
      {
        title: 'Community activity',
        message: 'New posts in communities you follow',
        type: 'community',
      },
    ];
  }
}

