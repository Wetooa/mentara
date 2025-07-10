import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';

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
                profileImageUrl: true,
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
                profileImageUrl: true,
              },
            },
          },
        },
        durationConfig: true,
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
        ...(status === 'IN_PROGRESS' && { actualStartTime: new Date() }),
        ...(status === 'COMPLETED' && { actualEndTime: new Date() }),
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
        void this.eventBus.emit('meeting.confirmed', {
          meetingId,
          meeting: updatedMeeting,
        });
        break;
      case 'IN_PROGRESS':
        void this.eventBus.emit('meeting.started', {
          meetingId,
          meeting: updatedMeeting,
        });
        break;
      case 'COMPLETED':
        void this.eventBus.emit('meeting.completed', {
          meetingId,
          meeting: updatedMeeting,
        });
        break;
      case 'CANCELLED':
        void this.eventBus.emit('meeting.cancelled', {
          meetingId,
          meeting: updatedMeeting,
          cancelledBy: userId,
        });
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
      // This could be stored in a separate session tracking table
      // For now, we'll update the meeting record with session info

      const session = await this.prisma.session.create({
        data: {
          meetingId: sessionData.meetingId,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          actualDuration: sessionData.duration,
          participantCount: sessionData.participantCount,
          recordingUrl: sessionData.recordingUrl,
          sessionNotes: JSON.stringify({
            chatMessages: sessionData.chatMessages,
            techIssues: sessionData.techIssues,
            quality: sessionData.quality,
          }),
          sessionType: 'video_call',
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
                profileImageUrl: true,
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
                profileImageUrl: true,
              },
            },
          },
        },
        durationConfig: true,
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
        session: true,
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
        notes: `Emergency termination: ${reason}. Terminated by: ${terminatedBy}`,
      },
    });

    void this.eventBus.emit('meeting.emergency_terminated', {
      meetingId,
      reason,
      terminatedBy,
      meeting,
    });

    this.logger.warn(
      `Emergency termination of meeting ${meetingId}: ${reason}`,
    );
    return meeting;
  }
}
