import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';
import {
  MeetingConfirmedEvent,
  MeetingStartedEvent,
  MeetingCompletedEvent,
  MeetingCancelledEvent,
  MeetingEmergencyTerminatedEvent,
} from '../common/events/booking-events';
import type {
  CreateVideoRoomDto,
  JoinVideoRoomDto,
  EndVideoCallDto,
  VideoRoomResponse,
  VideoCallStatus,
  UpdateMeetingStatusDto,
  SaveMeetingSessionDto,
} from './types';

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
    private readonly jwtService: JwtService,
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
    this.logger.log(`Getting upcoming meetings for user ${userId} with limit ${limit}`);

    // First validate that user exists as either client or therapist
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: { select: { userId: true } },
        therapist: { select: { userId: true } },
      },
    });

    if (!userExists) {
      this.logger.warn(`User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }

    if (!userExists.client && !userExists.therapist) {
      this.logger.warn(`User ${userId} is not a client or therapist`);
      throw new NotFoundException('User must be a client or therapist to access meetings');
    }

    this.logger.log(`User ${userId} validated - Client: ${!!userExists.client}, Therapist: ${!!userExists.therapist}`);

    // Check for any meetings first (for debugging)
    const totalMeetingsCount = await this.prisma.meeting.count({
      where: {
        OR: [{ clientId: userId }, { therapistId: userId }],
      },
    });

    this.logger.log(`Total meetings for user ${userId}: ${totalMeetingsCount}`);

    // Check for meetings with different statuses (for debugging)
    const allMeetings = await this.prisma.meeting.findMany({
      where: {
        OR: [{ clientId: userId }, { therapistId: userId }],
      },
      select: {
        id: true,
        status: true,
        startTime: true,
      },
    });

    this.logger.log(`All meetings for user ${userId}:`, allMeetings.map(m => ({
      id: m.id.substring(0, 8),
      status: m.status,
      startTime: m.startTime,
      isPast: m.startTime < new Date()
    })));

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

    this.logger.log(`Found ${meetings.length} upcoming meetings for user ${userId} (filtered by status: SCHEDULED/CONFIRMED and future dates)`);

    // If no upcoming meetings but user has meetings, log details about existing meetings
    if (meetings.length === 0 && totalMeetingsCount > 0) {
      const pastMeetingsCount = await this.prisma.meeting.count({
        where: {
          OR: [{ clientId: userId }, { therapistId: userId }],
          startTime: { lt: new Date() },
        },
      });

      const completedMeetingsCount = await this.prisma.meeting.count({
        where: {
          OR: [{ clientId: userId }, { therapistId: userId }],
          status: 'COMPLETED',
        },
      });

      this.logger.log(`Debug info for user ${userId}: ${pastMeetingsCount} past meetings, ${completedMeetingsCount} completed meetings`);
    }

    return {
      meetings,
      total: meetings.length,
    };
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
    const roomToken = this.generateRoomToken(meetingId, userId, 'host');

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
        meetingNotes: true,
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
   * Generate secure room access token using JWT
   */
  private generateRoomToken(
    meetingId: string,
    userId: string,
    role?: string,
  ): string {
    const payload = {
      sub: userId,
      meetingId,
      role: role || 'participant',
      type: 'meeting_access',
      iat: Math.floor(Date.now() / 1000),
    };

    // Generate JWT with 24-hour expiration for meeting tokens
    return this.jwtService.sign(payload, {
      expiresIn: '24h',
      issuer: 'mentara-meetings',
      subject: userId,
    });
  }

  /**
   * Validate and decode room access token
   */
  private validateRoomToken(
    token: string,
  ): { userId: string; meetingId: string; role: string } | null {
    try {
      const decoded = this.jwtService.verify(token, {
        issuer: 'mentara-meetings',
      });

      if (decoded.type !== 'meeting_access') {
        return null;
      }

      return {
        userId: decoded.sub,
        meetingId: decoded.meetingId,
        role: decoded.role,
      };
    } catch (error) {
      this.logger.warn(
        `Invalid room token: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
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
      throw new BadRequestException(
        'Meeting must be scheduled or confirmed to create video room',
      );
    }

    // Update meeting status to IN_PROGRESS
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'IN_PROGRESS' },
    });

    // Generate video room data (in production, integrate with actual video service like Twilio/Zoom)
    const roomId = `room_${meetingId}_${Date.now()}`;
    const accessToken = this.generateRoomToken(meetingId, userId, 'host');
    const participantToken = this.generateRoomToken(
      meetingId,
      userId,
      'participant',
    );

    const videoRoomResponse: VideoRoomResponse = {
      roomId,
      meetingId,
      joinUrl: `https://video.mentara.app/room/${roomId}`,
      roomUrl: `https://video.mentara.app/room/${roomId}`, // Replace with actual video service URL
      accessToken,
      participantToken,
      roomConfig: {
        maxParticipants: createRoomDto.maxParticipants,
        enableRecording: createRoomDto.enableRecording,
        enableChat: createRoomDto.enableChat,
        recordingActive: false,
      },
      participants: [],
      roomSettings: {
        maxParticipants: createRoomDto.maxParticipants || 2,
        recordingEnabled: createRoomDto.recordingEnabled || false,
        screenShareEnabled: createRoomDto.screenShareEnabled || true,
        chatEnabled: createRoomDto.chatEnabled || true,
        waitingRoomEnabled: createRoomDto.waitingRoomEnabled || false,
      },
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
      participantCount: 1,
      status: 'waiting',
      createdAt: new Date().toISOString(),
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
      throw new BadRequestException(
        'Meeting must be in progress to join video room',
      );
    }

    // Generate participant credentials
    const roomId = `room_${meetingId}_${Date.now()}`;
    const accessToken = this.generateRoomToken(
      meetingId,
      userId,
      joinRoomDto.role,
    );
    const participantToken = this.generateRoomToken(
      meetingId,
      userId,
      joinRoomDto.role,
    );

    const videoRoomResponse: VideoRoomResponse = {
      roomId,
      meetingId,
      joinUrl: `https://video.mentara.app/room/${roomId}`,
      roomUrl: `https://video.mentara.app/room/${roomId}`,
      accessToken,
      participantToken,
      roomConfig: {
        maxParticipants: 2,
        enableRecording: false,
        enableChat: true,
        recordingActive: false,
      },
      participants: [],
      roomSettings: {
        maxParticipants: 2,
        recordingEnabled: false,
        screenShareEnabled: true,
        chatEnabled: true,
        waitingRoomEnabled: false,
      },
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      participantCount: 2,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.logger.log(
      `User ${userId} joined video room for meeting ${meetingId}`,
    );
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
      isActive: meeting.status === 'IN_PROGRESS',
      participantCount: 2, // Client + Therapist
      status: meeting.status === 'IN_PROGRESS' ? 'active' : 'waiting',
      participants: [
        {
          userId: meeting.clientId,
          id: meeting.clientId,
          name: 'Client', // In production, fetch actual user names
          role: 'client',
          joinedAt: meeting.startTime.toISOString(),
          isHost: false,
          audioEnabled: true,
          videoEnabled: true,
          connectionStatus: 'connected',
        },
        {
          userId: meeting.therapistId,
          id: meeting.therapistId,
          name: 'Therapist',
          role: 'therapist',
          joinedAt: meeting.startTime.toISOString(),
          isHost: true,
          audioEnabled: true,
          videoEnabled: true,
          connectionStatus: 'connected',
        },
      ],
      startedAt: meeting.startTime.toISOString(),
      endedAt:
        meeting.status === 'COMPLETED'
          ? new Date(
              meeting.startTime.getTime() + meeting.duration * 60000,
            ).toISOString()
          : undefined,
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
    if (endCallDto.duration || endCallDto.reason || endCallDto.participantFeedback) {
      await this.prisma.meetingNotes.create({
        data: {
          id: `notes_${meetingId}_${Date.now()}`,
          meetingId,
          notes: JSON.stringify({
            sessionType: 'REGULAR_THERAPY',
            duration: endCallDto.duration,
            endReason: endCallDto.reason,
            audioQuality: endCallDto.participantFeedback?.audioQuality,
            videoQuality: endCallDto.participantFeedback?.videoQuality,
            overallExperience: endCallDto.participantFeedback?.overallExperience,
            issues: endCallDto.participantFeedback?.issues,
            platform: 'video',
            endTime: new Date().toISOString(),
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
        actualDuration: endCallDto.duration || meeting.duration,
        scheduledDuration: meeting.duration,
      }),
    );

    this.logger.log(
      `Video call ended for meeting ${meetingId}: ${endCallDto.reason}`,
    );
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

    this.logger.log(
      `Meeting ${meetingId} status updated to ${updateStatusDto.status}`,
    );
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

    const session = await this.prisma.meetingNotes.create({
      data: {
        id: `session_${meetingId}_${Date.now()}`,
        meetingId,
        notes: JSON.stringify({
          sessionType: 'REGULAR_THERAPY',
          startTime: sessionData.sessionData?.startedAt ? new Date(sessionData.sessionData.startedAt).toISOString() : new Date().toISOString(),
          endTime: sessionData.sessionData?.endedAt ? new Date(sessionData.sessionData.endedAt).toISOString() : new Date().toISOString(),
          duration: sessionData.sessionData?.duration || sessionData.duration,
          status: 'COMPLETED',
          platform: 'video',
          sessionNotes: sessionData.sessionNotes,
          clientProgress: sessionData.clientProgress,
          followUpActions: sessionData.followUpActions,
          quality: sessionData.sessionData?.quality,
          issues: sessionData.sessionData?.issues || [],
        }),
      },
    });

    this.logger.log(`Session data saved for meeting ${meetingId}`);
    return session;
  }

  /**
   * Get user's completed meetings
   */
  async getCompletedMeetings(userId: string, limit = 10) {
    const userExists = await this.validateUserExists(userId);
    
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [{ clientId: userId }, { therapistId: userId }],
        status: 'COMPLETED',
      },
      include: this.getMeetingIncludeOptions(),
      orderBy: { startTime: 'desc' },
      take: limit,
    });

    return this.transformMeetings(meetings);
  }

  /**
   * Get user's cancelled meetings
   */
  async getCancelledMeetings(userId: string, limit = 10) {
    const userExists = await this.validateUserExists(userId);
    
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [{ clientId: userId }, { therapistId: userId }],
        status: { in: ['CANCELLED', 'NO_SHOW'] },
      },
      include: this.getMeetingIncludeOptions(),
      orderBy: { startTime: 'desc' },
      take: limit,
    });

    return this.transformMeetings(meetings);
  }

  /**
   * Get user's in-progress meetings
   */
  async getInProgressMeetings(userId: string, limit = 10) {
    const userExists = await this.validateUserExists(userId);
    
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [{ clientId: userId }, { therapistId: userId }],
        status: 'IN_PROGRESS',
      },
      include: this.getMeetingIncludeOptions(),
      orderBy: { startTime: 'desc' },
      take: limit,
    });

    return this.transformMeetings(meetings);
  }

  /**
   * Get all meetings with filtering options
   */
  async getAllMeetings(userId: string, queryOptions: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const userExists = await this.validateUserExists(userId);
    
    const whereClause: any = {
      OR: [{ clientId: userId }, { therapistId: userId }],
    };

    // Add status filter
    if (queryOptions.status) {
      whereClause.status = queryOptions.status.toUpperCase();
    }

    // Add date range filter
    if (queryOptions.dateFrom || queryOptions.dateTo) {
      whereClause.startTime = {};
      if (queryOptions.dateFrom) {
        whereClause.startTime.gte = new Date(queryOptions.dateFrom);
      }
      if (queryOptions.dateTo) {
        whereClause.startTime.lte = new Date(queryOptions.dateTo);
      }
    }

    const meetings = await this.prisma.meeting.findMany({
      where: whereClause,
      include: this.getMeetingIncludeOptions(),
      orderBy: { startTime: 'desc' },
      take: queryOptions.limit || 20,
      skip: queryOptions.offset || 0,
    });

    return this.transformMeetings(meetings);
  }

  /**
   * Helper method to validate user exists and has proper role
   */
  private async validateUserExists(userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: { select: { userId: true } },
        therapist: { select: { userId: true } },
      },
    });

    if (!userExists) {
      this.logger.warn(`User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }

    if (!userExists.client && !userExists.therapist) {
      this.logger.warn(`User ${userId} is not a client or therapist`);
      throw new NotFoundException('User must be a client or therapist to access meetings');
    }

    return userExists;
  }

  /**
   * Helper method to get consistent meeting include options
   */
  private getMeetingIncludeOptions() {
    return {
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
    };
  }

  /**
   * Helper method to transform meetings data
   */
  private transformMeetings(meetings: any[]) {
    return meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      status: meeting.status,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      duration: meeting.duration,
      meetingType: meeting.meetingType,
      meetingUrl: meeting.meetingUrl,
      client: meeting.client,
      therapist: meeting.therapist,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt,
    }));
  }
}
