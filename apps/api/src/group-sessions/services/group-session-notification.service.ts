import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GroupSessionNotificationService {
  private readonly logger = new Logger(GroupSessionNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /**
   * Send invitation notifications to therapists
   */
  async sendInvitationNotifications(
    session: any,
    therapistIds: string[],
  ): Promise<void> {
    for (const therapistId of therapistIds) {
      await this.prisma.notification.create({
        data: {
          userId: therapistId,
          type: NotificationType.MESSAGE_RECEIVED,
          title: 'New Group Session Invitation',
          message: `You've been invited to facilitate "${session.title}" in ${session.community.name}`,
          isRead: false,
        },
      });
    }

    this.logger.log(
      `Sent invitation notifications to ${therapistIds.length} therapists`,
    );
  }

  /**
   * Notify moderator when therapist responds
   */
  async notifyModeratorOfResponse(
    session: any,
    therapistName: string,
    action: 'ACCEPTED' | 'DECLINED',
    message?: string,
  ): Promise<void> {
    const title =
      action === 'ACCEPTED'
        ? 'Therapist Accepted Invitation'
        : 'Therapist Declined Invitation';

    const notificationMessage =
      action === 'ACCEPTED'
        ? `${therapistName} accepted your invitation to "${session.title}"`
        : `${therapistName} declined your invitation to "${session.title}"${message ? `: ${message}` : ''}`;

    await this.prisma.notification.create({
      data: {
        userId: session.createdById,
        type: NotificationType.MESSAGE_RECEIVED,
        title,
        message: notificationMessage,
        isRead: false,
      },
    });

    this.logger.log(
      `Notified moderator ${session.createdById} of therapist ${action}`,
    );
  }

  /**
   * Notify community members that session is approved
   */
  async notifyCommunityMembersSessionApproved(session: any): Promise<void> {
    // Get all community members
    const members = await this.prisma.membership.findMany({
      where: {
        communityId: session.communityId,
      },
      select: {
        userId: true,
      },
    });

    // Don't notify the creator
    const membersToNotify = members
      .map((m) => m.userId)
      .filter((id) => id !== session.createdById);

    // Create notifications for all members
    const notifications = membersToNotify.map((userId) => ({
      userId,
      type: NotificationType.MESSAGE_RECEIVED,
      title: 'New Group Session Available',
      message: `A new group therapy session "${session.title}" is now open for registration in ${session.community.name}`,
      isRead: false,
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications,
      });

      this.logger.log(
        `Notified ${notifications.length} community members of approved session`,
      );
    }
  }

  /**
   * Notify user when they successfully join a session
   */
  async notifyUserJoinedSession(userId: string, session: any): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.MESSAGE_RECEIVED,
        title: 'Successfully Joined Group Session',
        message: `You're registered for "${session.title}" on ${new Date(session.scheduledAt).toLocaleDateString()}`,
        isRead: false,
      },
    });
  }

  /**
   * Send reminder notifications (can be called via cron job)
   */
  async sendSessionReminders(hoursBeforeSession: number = 24): Promise<void> {
    const reminderTime = new Date(
      Date.now() + hoursBeforeSession * 60 * 60 * 1000,
    );
    const reminderTimeEnd = new Date(reminderTime.getTime() + 60 * 60 * 1000); // 1 hour window

    // Get upcoming sessions
    const upcomingSessions = await this.prisma.groupTherapySession.findMany({
      where: {
        status: 'APPROVED',
        scheduledAt: {
          gte: reminderTime,
          lte: reminderTimeEnd,
        },
      },
      include: {
        participants: {
          where: {
            attendanceStatus: { not: 'CANCELLED' },
          },
          select: {
            userId: true,
          },
        },
        therapistInvitations: {
          where: {
            status: 'ACCEPTED',
          },
          select: {
            therapistId: true,
          },
        },
      },
    });

    for (const session of upcomingSessions) {
      // Notify all participants
      const allUserIds = [
        ...session.participants.map((p) => p.userId),
        ...session.therapistInvitations.map((i) => i.therapistId),
      ];

      const notifications = allUserIds.map((userId) => ({
        userId,
        type: NotificationType.APPOINTMENT_REMINDER,
        title: 'Group Session Reminder',
        message: `Your group session "${session.title}" starts in ${hoursBeforeSession} hours`,
        isRead: false,
      }));

      if (notifications.length > 0) {
        await this.prisma.notification.createMany({
          data: notifications,
        });
      }
    }

    this.logger.log(
      `Sent reminders for ${upcomingSessions.length} upcoming sessions`,
    );
  }

  /**
   * Notify when session is cancelled
   */
  async notifySessionCancelled(session: any): Promise<void> {
    // Get all participants and therapists
    const participants = await this.prisma.groupSessionParticipant.findMany({
      where: {
        sessionId: session.id,
        attendanceStatus: { not: 'CANCELLED' },
      },
      select: { userId: true },
    });

    const therapists =
      await this.prisma.groupSessionTherapistInvitation.findMany({
        where: {
          sessionId: session.id,
          status: 'ACCEPTED',
        },
        select: { therapistId: true },
      });

    const allUserIds = [
      ...participants.map((p) => p.userId),
      ...therapists.map((t) => t.therapistId),
    ];

    const notifications = allUserIds.map((userId) => ({
      userId,
      type: NotificationType.APPOINTMENT_CANCELLED,
      title: 'Group Session Cancelled',
      message: `The group session "${session.title}" has been cancelled${session.cancellationReason ? `: ${session.cancellationReason}` : ''}`,
      isRead: false,
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications,
      });

      this.logger.log(
        `Notified ${notifications.length} users of session cancellation`,
      );
    }
  }
}
