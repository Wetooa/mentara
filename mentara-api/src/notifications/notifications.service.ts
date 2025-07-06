import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    data?: any;
    actionUrl?: string;
    scheduledFor?: Date;
  }): Promise<Notification> {
    return this.prisma.notification.create({
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
    let settings = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      settings = await this.prisma.notificationSettings.create({
        data: { userId },
      });
    }

    return settings;
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
    return this.prisma.notificationSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
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

  async sendScheduledNotifications() {
    const now = new Date();

    const scheduledNotifications = await this.prisma.notification.findMany({
      where: {
        scheduledFor: {
          lte: now,
        },
        sentAt: null,
      },
    });

    for (const notification of scheduledNotifications) {
      // In a real implementation, you would send the notification
      // via email, push notification, etc. here

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { sentAt: now },
      });
    }

    return { sent: scheduledNotifications.length };
  }
}
