import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';
import {
  MeetingConfirmedEvent,
  MeetingStartedEvent,
  MeetingCompletedEvent,
  MeetingCancelledEvent,
  MeetingEmergencyTerminatedEvent,
} from '../common/events/booking-events';

export interface MeetingSessionData {
  meetingId: string;
  startTime: Date;
  endTime?: Date;
  participantCount: number;
  duration: number; // actual duration in minutes
  recordingUrl?: string;
  chatMessages?: any[];
  techIssues?: string[];
  quality?: {
    videoQuality: 'poor' | 'fair' | 'good' | 'excellent';
    audioQuality: 'poor' | 'fair' | 'good' | 'excellent';
    connectionStability: 'poor' | 'fair' | 'good' | 'excellent';
  };
}

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  /**
   * Get meeting details with access validation
   */
  async getMeetingById(meetingId: string, userId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        id: meetingId,
        OR: [{ clientId: userId }, { therapistId: userId }],
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found or access denied');
    }

    return meeting;
  }

  /**
   * Update meeting status
   */
  async updateMeetingStatus(
    meetingId: string,
    userId: string,
    status:
      | 'SCHEDULED'
      | 'CONFIRMED'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | 'CANCELLED',
  ) {
    // Verify user has access to this meeting
    const meeting = await this.getMeetingById(meetingId, userId);

    // Only therapist can confirm meetings, either participant can cancel
    if (status === 'CONFIRMED' && meeting.therapistId !== userId) {
      throw new ForbiddenException('Only the therapist can confirm meetings');
    }

    const updatedMeeting = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status,
      },
      include: {
        client: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        therapist: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    // Emit events for status changes
    switch (status) {
      case 'CONFIRMED':
        void this.eventBus.emit(
          new MeetingConfirmedEvent({
            meetingId,
            clientId: updatedMeeting.clientId,
            therapistId: updatedMeeting.therapistId,
            confirmedAt: new Date(),
            startTime: updatedMeeting.startTime,
            duration: updatedMeeting.duration,
          }),
        );
        break;
      case 'IN_PROGRESS':
        void this.eventBus.emit(
          new MeetingStartedEvent({
            meetingId,
            clientId: updatedMeeting.clientId,
            therapistId: updatedMeeting.therapistId,
            startedAt: new Date(),
            actualStartTime: new Date(),
            scheduledStartTime: updatedMeeting.startTime,
          }),
        );
        break;
      case 'COMPLETED':
        void this.eventBus.emit(
          new MeetingCompletedEvent({
            meetingId,
            clientId: updatedMeeting.clientId,
            therapistId: updatedMeeting.therapistId,
            completedAt: new Date(),
            actualDuration: updatedMeeting.duration,
            scheduledDuration: updatedMeeting.duration,
          }),
        );
        break;
      case 'CANCELLED':
        void this.eventBus.emit(
          new MeetingCancelledEvent({
            meetingId,
            clientId: updatedMeeting.clientId,
            therapistId: updatedMeeting.therapistId,
            cancelledBy: userId,
            cancelledAt: new Date(),
            originalStartTime: updatedMeeting.startTime,
          }),
        );
        break;
    }

    this.logger.log(
      `Meeting ${meetingId} status updated to ${status} by user ${userId}`,
    );
    return updatedMeeting;
  }

  /**
   * Save meeting session data (for analytics and quality tracking)
   */
  async saveMeetingSession(sessionData: MeetingSessionData) {
    try {
      // Get meeting data to extract clientId
      const meeting = await this.prisma.meeting.findUnique({
        where: { id: sessionData.meetingId },
        select: { clientId: true, therapistId: true },
      });

      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }

      const session = await this.prisma.sessionLog.create({
        data: {
          meetingId: sessionData.meetingId,
          clientId: meeting.clientId,
          therapistId: meeting.therapistId,
          sessionType: 'REGULAR_THERAPY',
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          duration: sessionData.duration,
          status: 'COMPLETED',
          platform: 'video',
          recordingUrl: sessionData.recordingUrl,
          notes: JSON.stringify({
            chatMessages: sessionData.chatMessages,
            techIssues: sessionData.techIssues,
            quality: sessionData.quality,
          }),
        },
      });

      this.logger.log(
        `Session data saved for meeting ${sessionData.meetingId}`,
      );
      return session;
    } catch (error) {
      this.logger.error('Failed to save meeting session data:', error);
      throw error;
    }
  }

  /**
   * Get user's upcoming meetings
   */
  async getUpcomingMeetings(userId: string, limit = 10) {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [{ clientId: userId }, { therapistId: userId }],
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        startTime: { gte: new Date() },
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
    });

    return meetings;
  }

  /**
   * Generate meeting room URL/token (for integration with video platforms)
   */
  async generateMeetingRoom(meetingId: string, userId: string) {
    await this.getMeetingById(meetingId, userId);

    // In a real implementation, this would integrate with video platforms like:
    // - Zoom SDK
    // - WebRTC/Jitsi
    // - Twilio Video
    // - Agora

    const roomUrl = `${process.env.FRONTEND_URL}/meeting/${meetingId}`;
    const roomToken = this.generateRoomToken(meetingId, userId);

    // Update meeting with room URL
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { meetingUrl: roomUrl },
    });

    return {
      roomUrl,
      roomToken,
      meetingId,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  /**
   * Validate meeting access for WebSocket connections
   */
  async validateMeetingAccess(
    meetingId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const meeting = await this.prisma.meeting.findFirst({
        where: {
          id: meetingId,
          OR: [{ clientId: userId }, { therapistId: userId }],
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        },
      });

      return !!meeting;
    } catch (error) {
      this.logger.error('Failed to validate meeting access:', error);
      return false;
    }
  }

  /**
   * Get meeting analytics for therapists
   */
  async getMeetingAnalytics(
    therapistId: string,
    dateRange?: { start: Date; end: Date },
  ) {
    const whereClause: any = {
      therapistId,
      status: 'COMPLETED',
    };

    if (dateRange) {
      whereClause.startTime = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    const meetings = await this.prisma.meeting.findMany({
      where: whereClause,
      include: {
        sessionLogs: true,
      },
    });

    const analytics = {
      totalMeetings: meetings.length,
      totalDuration: meetings.reduce((sum, m) => sum + m.duration, 0),
      averageDuration:
        meetings.length > 0
          ? meetings.reduce((sum, m) => sum + m.duration, 0) / meetings.length
          : 0,
      meetingsByType: {
        video: meetings.filter((m) => m.meetingType === 'video').length,
        audio: meetings.filter((m) => m.meetingType === 'audio').length,
        chat: meetings.filter((m) => m.meetingType === 'chat').length,
      },
      completionRate:
        (meetings.filter((m) => m.status === 'COMPLETED').length /
          meetings.length) *
        100,
    };

    return analytics;
  }

  /**
   * Generate a simple room token (in production, use proper JWT or similar)
   */
  private generateRoomToken(meetingId: string, userId: string): string {
    // This is a simplified token generation
    // In production, use proper JWT with expiration and signatures
    const tokenData = {
      meetingId,
      userId,
      timestamp: Date.now(),
    };

    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }

  /**
   * Handle emergency meeting termination
   */
  async emergencyTerminateMeeting(
    meetingId: string,
    reason: string,
    terminatedBy: string,
  ) {
    const meeting = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'CANCELLED',
      },
    });

    // Add emergency termination note
    await this.prisma.meetingNotes.create({
      data: {
        id: `note_${Date.now()}`,
        meetingId,
        notes: `Emergency termination: ${reason}. Terminated by: ${terminatedBy}`,
      },
    });

    void this.eventBus.emit(
      new MeetingEmergencyTerminatedEvent({
        meetingId,
        clientId: meeting.clientId,
        therapistId: meeting.therapistId,
        terminatedBy,
        terminatedAt: new Date(),
        reason,
      }),
    );

    this.logger.warn(
      `Emergency termination of meeting ${meetingId}: ${reason}`,
    );
    return meeting;
  }
}
