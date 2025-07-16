import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
import {
  CreateVideoRoomDto,
  JoinVideoRoomDto,
  EndVideoCallDto,
  VideoRoomResponse,
  VideoCallStatus,
  UpdateMeetingStatusDto,
  SaveMeetingSessionDto,
} from 'mentara-commons';

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

  // ===== VIDEO CALL INTEGRATION METHODS =====

  /**
   * Create a video room for a meeting
   */
  async createVideoRoom(
    meetingId: string,
    userId: string,
    createRoomDto: CreateVideoRoomDto,
  ): Promise<VideoRoomResponse> {
    // Validate meeting access
    const meeting = await this.getMeetingById(meetingId, userId);
    
    if (meeting.status !== 'SCHEDULED' && meeting.status !== 'CONFIRMED') {
      throw new BadRequestException('Meeting must be scheduled or confirmed to create video room');
    }

    // Update meeting status to IN_PROGRESS
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'IN_PROGRESS' },
    });

    // Generate video room data (in production, integrate with actual video service like Twilio/Zoom)
    const roomId = `room_${meetingId}_${Date.now()}`;
    const accessToken = this.generateRoomToken(meetingId, userId);
    const participantToken = this.generateRoomToken(meetingId, `${userId}_participant`);

    const videoRoomResponse: VideoRoomResponse = {
      roomId,
      roomUrl: `https://video.mentara.app/room/${roomId}`, // Replace with actual video service URL
      accessToken,
      participantToken,
      roomConfig: {
        maxParticipants: createRoomDto.maxParticipants,
        enableRecording: createRoomDto.enableRecording,
        enableChat: createRoomDto.enableChat,
        recordingActive: false,
      },
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
      participantCount: 1,
      status: 'waiting',
    };

    // Emit meeting started event
    void this.eventBus.emit(
      new MeetingStartedEvent({
        meetingId,
        clientId: meeting.clientId,
        therapistId: meeting.therapistId,
        startedAt: new Date(),
        actualStartTime: new Date(),
        scheduledStartTime: meeting.startTime,
      }),
    );

    this.logger.log(`Video room created for meeting ${meetingId}`);
    return videoRoomResponse;
  }

  /**
   * Join an existing video room
   */
  async joinVideoRoom(
    meetingId: string,
    userId: string,
    joinRoomDto: JoinVideoRoomDto,
  ): Promise<VideoRoomResponse> {
    // Validate meeting access
    const meeting = await this.getMeetingById(meetingId, userId);
    
    if (meeting.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Meeting must be in progress to join video room');
    }

    // Generate participant credentials
    const roomId = `room_${meetingId}_${Date.now()}`;
    const accessToken = this.generateRoomToken(meetingId, userId);
    const participantToken = this.generateRoomToken(meetingId, `${userId}_${joinRoomDto.role}`);

    const videoRoomResponse: VideoRoomResponse = {
      roomId,
      roomUrl: `https://video.mentara.app/room/${roomId}`,
      accessToken,
      participantToken,
      roomConfig: {
        maxParticipants: 2,
        enableRecording: false,
        enableChat: true,
        recordingActive: false,
      },
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      participantCount: 2,
      status: 'active',
    };

    this.logger.log(`User ${userId} joined video room for meeting ${meetingId}`);
    return videoRoomResponse;
  }

  /**
   * Get video call status
   */
  async getVideoCallStatus(
    meetingId: string,
    userId: string,
  ): Promise<VideoCallStatus> {
    // Validate meeting access
    const meeting = await this.getMeetingById(meetingId, userId);

    // Mock video call status (in production, fetch from actual video service)
    const videoCallStatus: VideoCallStatus = {
      meetingId,
      roomId: `room_${meetingId}`,
      status: meeting.status === 'IN_PROGRESS' ? 'active' : 'waiting',
      participants: [
        {
          id: meeting.clientId,
          name: 'Client', // In production, fetch actual user names
          role: 'client',
          joinedAt: meeting.startTime.toISOString(),
          connectionStatus: 'connected',
        },
        {
          id: meeting.therapistId,
          name: 'Therapist',
          role: 'therapist',
          joinedAt: meeting.startTime.toISOString(),
          connectionStatus: 'connected',
        },
      ],
      startedAt: meeting.startTime.toISOString(),
      endedAt: meeting.status === 'COMPLETED' ? new Date(meeting.startTime.getTime() + meeting.duration * 60000).toISOString() : undefined,
      duration: meeting.status === 'COMPLETED' ? meeting.duration : undefined,
    };

    return videoCallStatus;
  }

  /**
   * End video call
   */
  async endVideoCall(
    meetingId: string,
    userId: string,
    endCallDto: EndVideoCallDto,
  ): Promise<void> {
    // Validate meeting access
    const meeting = await this.getMeetingById(meetingId, userId);

    // Update meeting status to completed
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { 
        status: 'COMPLETED',
      },
    });

    // Save session summary if provided
    if (endCallDto.sessionSummary) {
      await this.prisma.sessionLog.create({
        data: {
          meetingId,
          clientId: meeting.clientId,
          therapistId: meeting.therapistId,
          sessionType: 'REGULAR_THERAPY',
          startTime: meeting.startTime,
          endTime: new Date(),
          duration: endCallDto.sessionSummary.duration,
          status: 'COMPLETED',
          platform: 'video',
          notes: JSON.stringify({
            endReason: endCallDto.endReason,
            connectionQuality: endCallDto.sessionSummary.connectionQuality,
            technicalIssues: endCallDto.sessionSummary.technicalIssues,
            nextSteps: endCallDto.nextSteps,
          }),
        },
      });
    }

    // Emit meeting completed event
    void this.eventBus.emit(
      new MeetingCompletedEvent({
        meetingId,
        clientId: meeting.clientId,
        therapistId: meeting.therapistId,
        completedAt: new Date(),
        actualDuration: endCallDto.sessionSummary?.duration || meeting.duration,
        scheduledDuration: meeting.duration,
      }),
    );

    this.logger.log(`Video call ended for meeting ${meetingId}: ${endCallDto.endReason}`);
  }

  /**
   * Updated method to use new DTOs
   */
  async updateMeetingStatus(
    meetingId: string,
    userId: string,
    updateStatusDto: UpdateMeetingStatusDto,
  ) {
    const meeting = await this.getMeetingById(meetingId, userId);

    const updatedMeeting = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: updateStatusDto.status.toUpperCase() as any,
      },
    });

    // Emit appropriate events based on status
    switch (updateStatusDto.status) {
      case 'confirmed':
        void this.eventBus.emit(
          new MeetingConfirmedEvent({
            meetingId,
            clientId: meeting.clientId,
            therapistId: meeting.therapistId,
            confirmedAt: new Date(),
            startTime: meeting.startTime,
            duration: meeting.duration,
          }),
        );
        break;
      case 'cancelled':
        void this.eventBus.emit(
          new MeetingCancelledEvent({
            meetingId,
            clientId: meeting.clientId,
            therapistId: meeting.therapistId,
            cancelledBy: userId,
            cancelledAt: new Date(),
            cancellationReason: updateStatusDto.reason,
            originalStartTime: meeting.startTime,
          }),
        );
        break;
    }

    this.logger.log(`Meeting ${meetingId} status updated to ${updateStatusDto.status}`);
    return updatedMeeting;
  }

  /**
   * Updated method to use new DTOs
   */
  async saveMeetingSession(
    meetingId: string,
    userId: string,
    sessionData: SaveMeetingSessionDto,
  ) {
    // Validate meeting access
    const meeting = await this.getMeetingById(meetingId, userId);

    const session = await this.prisma.sessionLog.create({
      data: {
        meetingId,
        clientId: meeting.clientId,
        therapistId: meeting.therapistId,
        sessionType: 'REGULAR_THERAPY',
        startTime: new Date(sessionData.sessionData.startedAt),
        endTime: new Date(sessionData.sessionData.endedAt),
        duration: sessionData.sessionData.duration,
        status: 'COMPLETED',
        platform: 'video',
        notes: JSON.stringify({
          sessionNotes: sessionData.sessionNotes,
          clientProgress: sessionData.clientProgress,
          followUpActions: sessionData.followUpActions,
          quality: sessionData.sessionData.quality,
          issues: sessionData.sessionData.issues,
        }),
      },
    });

    this.logger.log(`Session data saved for meeting ${meetingId}`);
    return session;
  }
}
