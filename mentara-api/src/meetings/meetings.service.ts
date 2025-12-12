import {
  Injectable,
  Logger,
  NotFoundException,
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
    this.logger.debug(
      `getMeetingById called with meetingId: ${meetingId}, userId: ${userId}`,
    );
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
        meetingNotes: {
          orderBy: {
            createdAt: 'desc'
          }
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found or access denied');
    }

    return this.transformSingleMeeting(meeting);
  }

  /**
   * Transform a single meeting to match frontend interface expectations
   */
  private transformSingleMeeting(meeting: any) {
    // Get the latest meeting notes
    const latestNotes = meeting.meetingNotes?.[0];
    let notes = null;
    let feedback = null;

    // Parse notes if they exist
    if (latestNotes?.notes) {
      try {
        const parsedNotes = JSON.parse(latestNotes.notes);
        notes = parsedNotes.sessionNotes || parsedNotes.notes || latestNotes.notes;
        feedback = parsedNotes.feedback || parsedNotes.clientProgress;
      } catch {
        // If parsing fails, use raw notes
        notes = latestNotes.notes;
      }
    }

    // Compute therapist name
    const therapistName = meeting.therapist?.user ? 
      `${meeting.therapist.user.firstName} ${meeting.therapist.user.lastName}`.trim() : 
      undefined;

    return {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      dateTime: meeting.startTime, // Alias for startTime
      duration: meeting.duration,
      status: meeting.status,
      meetingType: meeting.meetingType,
      type: meeting.meetingType, // Alias for meetingType
      meetingUrl: meeting.meetingUrl,
      clientId: meeting.clientId,
      therapistId: meeting.therapistId,
      notes,
      feedback,
      client: meeting.client ? {
        userId: meeting.client.userId,
        user: meeting.client.user
      } : null,
      therapist: meeting.therapist ? {
        userId: meeting.therapist.userId,
        name: therapistName,
        specialization: meeting.therapist.specialization,
        experience: meeting.therapist.experience,
        user: meeting.therapist.user
      } : null,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt,
    };
  }

  /**
   * Get user's upcoming meetings
   */
  async getUpcomingMeetings(userId: string, limit = 10) {
    this.logger.debug(
      `getUpcomingMeetings called for userId: ${userId}, limit: ${limit}`,
    );

    // First validate that user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: { select: { userId: true } },
        therapist: { select: { userId: true } },
      },
    });

    if (!userExists) {
      this.logger.warn(`getUpcomingMeetings: User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }

    // If user exists but is not a client or therapist, return empty meetings
    // This follows REST API best practices: return 200 with empty array rather than 404
    if (!userExists.client && !userExists.therapist) {
      this.logger.log(
        `getUpcomingMeetings: User ${userId} is not a client or therapist, returning empty meetings`,
      );
      return {
        meetings: [],
        total: 0,
      };
    }

    this.logger.debug(
      `getUpcomingMeetings: User ${userId} is valid client/therapist, fetching meetings`,
    );

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

    this.logger.log(
      `Found ${meetings.length} upcoming meetings for user ${userId}`,
    );

    return {
      meetings,
      total: meetings.length,
    };
  }

  /**
   * Generate meeting room URL/token (for WebRTC integration)
   */
  async generateMeetingRoom(meetingId: string, userId: string) {
    await this.getMeetingById(meetingId, userId);

    const roomUrl = this.generateMeetingUrl(meetingId);
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
   * Generate WebRTC meeting URL
   */
  private generateMeetingUrl(meetingId: string): string {
    const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
    return `${frontendUrl}/meeting/${meetingId}`;
  }

  /**
   * Automatically generate and store meeting URL if not already set
   */
  async ensureMeetingUrl(meetingId: string): Promise<string> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { meetingUrl: true },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // If meeting URL already exists, return it
    if (meeting.meetingUrl) {
      return meeting.meetingUrl;
    }

    // Generate and store new meeting URL
    const meetingUrl = this.generateMeetingUrl(meetingId);
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { meetingUrl },
    });

    this.logger.log(`Generated meeting URL for meeting ${meetingId}`);
    return meetingUrl;
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

    // Ensure meeting URL is generated
    const meetingUrl = await this.ensureMeetingUrl(meetingId);

    // Update meeting status to IN_PROGRESS
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'IN_PROGRESS' },
    });

    // Generate video room data for WebRTC
    const roomId = `room_${meetingId}`;
    const accessToken = this.generateRoomToken(meetingId, userId, 'host');
    const participantToken = this.generateRoomToken(
      meetingId,
      userId,
      'participant',
    );

    const videoRoomResponse: VideoRoomResponse = {
      roomId,
      meetingId,
      joinUrl: meetingUrl,
      roomUrl: meetingUrl,
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
    if (
      endCallDto.duration ||
      endCallDto.reason ||
      endCallDto.participantFeedback
    ) {
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
            overallExperience:
              endCallDto.participantFeedback?.overallExperience,
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

    const status = updateStatusDto.status.toUpperCase() as any;
    
    // Automatically generate meeting URL when status changes to CONFIRMED or IN_PROGRESS
    const shouldGenerateUrl = (status === 'CONFIRMED' || status === 'IN_PROGRESS') && 
                              !meeting.meetingUrl;

    const updateData: any = {
      status,
    };

    if (shouldGenerateUrl) {
      updateData.meetingUrl = this.generateMeetingUrl(meetingId);
      this.logger.log(`Auto-generated meeting URL for meeting ${meetingId} on status change to ${status}`);
    }

    const updatedMeeting = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: updateData,
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
    await this.getMeetingById(meetingId, userId);

    const session = await this.prisma.meetingNotes.create({
      data: {
        id: `session_${meetingId}_${Date.now()}`,
        meetingId,
        notes: JSON.stringify({
          sessionType: 'REGULAR_THERAPY',
          startTime: sessionData.sessionData?.startedAt
            ? new Date(sessionData.sessionData.startedAt).toISOString()
            : new Date().toISOString(),
          endTime: sessionData.sessionData?.endedAt
            ? new Date(sessionData.sessionData.endedAt).toISOString()
            : new Date().toISOString(),
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
    // First validate that user exists
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

    // If user exists but is not a client or therapist, return empty meetings
    if (!userExists.client && !userExists.therapist) {
      this.logger.log(
        `User ${userId} is not a client or therapist, returning empty meetings`,
      );
      return [];
    }

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
    this.logger.debug(
      `getCancelledMeetings called for userId: ${userId}, limit: ${limit}`,
    );

    // First validate that user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: { select: { userId: true } },
        therapist: { select: { userId: true } },
      },
    });

    if (!userExists) {
      this.logger.warn(`getCancelledMeetings: User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }

    // If user exists but is not a client or therapist, return empty meetings
    if (!userExists.client && !userExists.therapist) {
      this.logger.log(
        `getCancelledMeetings: User ${userId} is not a client or therapist, returning empty meetings`,
      );
      return [];
    }

    this.logger.debug(
      `getCancelledMeetings: User ${userId} is valid client/therapist, fetching meetings`,
    );

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
    // First validate that user exists
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

    // If user exists but is not a client or therapist, return empty meetings
    if (!userExists.client && !userExists.therapist) {
      this.logger.log(
        `User ${userId} is not a client or therapist, returning empty meetings`,
      );
      return [];
    }

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
  async getAllMeetings(
    userId: string,
    queryOptions: {
      status?: string;
      type?: string;
      limit?: number;
      offset?: number;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    // First validate that user exists
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

    // If user exists but is not a client or therapist, return empty meetings
    if (!userExists.client && !userExists.therapist) {
      this.logger.log(
        `User ${userId} is not a client or therapist, returning empty meetings`,
      );
      return [];
    }

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
   * Get booking requests for therapist (SCHEDULED meetings awaiting approval)
   */
  async getBookingRequests(therapistId: string, limit = 10) {
    this.logger.debug(
      `getBookingRequests called for therapistId: ${therapistId}, limit: ${limit}`,
    );

    // Validate therapist exists
    const therapistExists = await this.prisma.user.findUnique({
      where: { id: therapistId },
      include: {
        therapist: { select: { userId: true } },
      },
    });

    if (!therapistExists?.therapist) {
      this.logger.warn(`Therapist not found: ${therapistId}`);
      throw new NotFoundException('Therapist not found');
    }

    const meetings = await this.prisma.meeting.findMany({
      where: {
        therapistId,
        status: 'SCHEDULED', // Booking requests are SCHEDULED meetings awaiting approval
        startTime: { gte: new Date() }, // Only future meetings
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
        payments: {
          include: {
            paymentMethod: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
    });

    this.logger.log(
      `Found ${meetings.length} booking requests for therapist ${therapistId}`,
    );

    return meetings.map(meeting => this.transformSingleMeeting(meeting));
  }

  /**
   * Accept a booking request with conflict validation
   */
  async acceptBookingRequest(meetingId: string, therapistId: string) {
    this.logger.debug(
      `acceptBookingRequest called for meetingId: ${meetingId}, therapistId: ${therapistId}`,
    );

    // Get the meeting to validate
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        id: meetingId,
        therapistId,
        status: 'SCHEDULED',
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Booking request not found or already processed');
    }

    // Check for scheduling conflicts
    const hasConflict = await this.checkSchedulingConflict(
      therapistId,
      new Date(meeting.startTime),
      meeting.duration,
      meetingId,
    );

    if (hasConflict) {
      throw new BadRequestException(
        'Cannot accept booking: time slot conflicts with existing confirmed meeting',
      );
    }

    // Generate meeting URL if not already set
    const meetingUrl = meeting.meetingUrl || this.generateMeetingUrl(meetingId);

    // Update meeting status to CONFIRMED
    const updatedMeeting = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'CONFIRMED',
        meetingUrl,
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
      },
    });

    // Emit meeting confirmed event
    void this.eventBus.emit(
      new MeetingConfirmedEvent({
        meetingId,
        clientId: meeting.clientId,
        therapistId,
        confirmedAt: new Date(),
        startTime: meeting.startTime,
        duration: meeting.duration,
      }),
    );

    this.logger.log(`Booking request ${meetingId} accepted by therapist ${therapistId}`);
    return this.transformSingleMeeting(updatedMeeting);
  }

  /**
   * Deny a booking request
   */
  async denyBookingRequest(meetingId: string, therapistId: string, reason?: string) {
    this.logger.debug(
      `denyBookingRequest called for meetingId: ${meetingId}, therapistId: ${therapistId}`,
    );

    // Get the meeting to validate
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        id: meetingId,
        therapistId,
        status: 'SCHEDULED',
      },
    });

    if (!meeting) {
      throw new NotFoundException('Booking request not found or already processed');
    }

    // Update meeting status to CANCELLED
    const updatedMeeting = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'CANCELLED',
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
      },
    });

    // Add denial reason to meeting notes if provided
    if (reason) {
      await this.prisma.meetingNotes.create({
        data: {
          id: `denial_${meetingId}_${Date.now()}`,
          meetingId,
          notes: `Booking request denied by therapist. Reason: ${reason}`,
        },
      });
    }

    // Emit meeting cancelled event
    void this.eventBus.emit(
      new MeetingCancelledEvent({
        meetingId,
        clientId: meeting.clientId,
        therapistId,
        cancelledBy: therapistId,
        cancelledAt: new Date(),
        cancellationReason: reason || 'Booking request denied by therapist',
        originalStartTime: meeting.startTime,
      }),
    );

    this.logger.log(`Booking request ${meetingId} denied by therapist ${therapistId}`);
    return this.transformSingleMeeting(updatedMeeting);
  }

  /**
   * Check for scheduling conflicts
   */
  private async checkSchedulingConflict(
    therapistId: string,
    startTime: Date,
    duration: number,
    excludeMeetingId?: string,
  ): Promise<boolean> {
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const conflictingMeetings = await this.prisma.meeting.findMany({
      where: {
        therapistId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        id: excludeMeetingId ? { not: excludeMeetingId } : undefined,
        OR: [
          // Meeting starts during the new meeting
          {
            startTime: {
              gte: startTime,
              lt: endTime,
            },
          },
          // Meeting ends during the new meeting
          {
            startTime: {
              lt: startTime,
            },
            // Calculate end time based on start time + duration
            AND: [
              {
                startTime: {
                  gte: new Date(startTime.getTime() - 4 * 60 * 60 * 1000), // 4 hours buffer for query optimization
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        startTime: true,
        duration: true,
      },
    });

    // Additional check for meetings that might overlap
    const hasConflict = conflictingMeetings.some(meeting => {
      const meetingEndTime = new Date(meeting.startTime.getTime() + meeting.duration * 60000);
      return (
        // New meeting starts during existing meeting
        (startTime >= meeting.startTime && startTime < meetingEndTime) ||
        // New meeting ends during existing meeting
        (endTime > meeting.startTime && endTime <= meetingEndTime) ||
        // New meeting completely encompasses existing meeting
        (startTime <= meeting.startTime && endTime >= meetingEndTime)
      );
    });

    this.logger.debug(
      `Conflict check for therapist ${therapistId} at ${startTime.toISOString()}: ${hasConflict ? 'CONFLICT' : 'OK'}`,
    );

    return hasConflict;
  }

  /**
   * Helper method to transform meetings data
   */
  private transformMeetings(meetings: any[]) {
    return meetings.map((meeting) => ({
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
