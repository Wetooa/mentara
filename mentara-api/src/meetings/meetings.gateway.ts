import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { WebSocketAuthService } from '../messaging/services/websocket-auth.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';

interface MeetingRoom {
  meetingId: string;
  participants: Map<string, ParticipantInfo>;
  startTime: Date;
  status: 'waiting' | 'active' | 'ended';
  hostId?: string;
}

interface ParticipantInfo {
  userId: string;
  socketId: string;
  role: 'therapist' | 'client';
  joinedAt: Date;
  isReady: boolean;
  mediaStatus: {
    video: boolean;
    audio: boolean;
    screen: boolean;
  };
}

interface JoinMeetingData {
  meetingId: string;
  mediaPreferences?: {
    video: boolean;
    audio: boolean;
  };
}

interface MediaToggleData {
  meetingId: string;
  mediaType: 'video' | 'audio' | 'screen';
  enabled: boolean;
}

interface ChatMessageData {
  meetingId: string;
  message: string;
  timestamp: Date;
}

interface MeetingControlData {
  meetingId: string;
  action: 'start' | 'end' | 'pause' | 'record';
}

@Injectable()
@WebSocketGateway({
  namespace: '/meetings',
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',  // Explicit fallback
      'http://127.0.0.1:3000',  // Alternative localhost
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['authorization', 'content-type'],
  },
})
export class MeetingsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MeetingsGateway.name);
  private meetings = new Map<string, MeetingRoom>();
  private userToSocket = new Map<string, string>();
  private socketToUser = new Map<string, string>();

  constructor(
    private readonly websocketAuth: WebSocketAuthService,
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  afterInit() {
    this.logger.log('Meetings WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.websocketAuth.authenticateSocket(client);
      if (!user) {
        client.disconnect();
        return;
      }

      this.userToSocket.set(user.userId, client.id);
      this.socketToUser.set(client.id, user.userId);

      this.logger.log(`User ${user.userId} connected to meetings gateway`);

      // Send user their active meetings
      await this.sendActiveMeetings(client, user.userId);
    } catch (error) {
      this.logger.error('Connection failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    // Remove user from all meetings
    for (const [meetingId, meeting] of this.meetings.entries()) {
      if (meeting.participants.has(userId)) {
        await this.leaveMeeting(client, { meetingId });
      }
    }

    this.userToSocket.delete(userId);
    this.socketToUser.delete(client.id);

    this.logger.log(`User ${userId} disconnected from meetings gateway`);
  }

  @SubscribeMessage('join-meeting')
  async joinMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinMeetingData,
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    try {
      // Validate meeting exists and user has access
      const meeting = await this.prisma.meeting.findFirst({
        where: {
          id: data.meetingId,
          OR: [{ clientId: userId }, { therapistId: userId }],
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        },
        include: {
          client: {
            include: { user: true },
          },
          therapist: {
            include: { user: true },
          },
        },
      });

      if (!meeting) {
        client.emit('meeting-error', {
          error: 'Meeting not found or access denied',
        });
        return;
      }

      // Determine user role
      const role = meeting.therapistId === userId ? 'therapist' : 'client';

      // Create or get meeting room
      let meetingRoom = this.meetings.get(data.meetingId);
      if (!meetingRoom) {
        meetingRoom = {
          meetingId: data.meetingId,
          participants: new Map(),
          startTime: new Date(),
          status: 'waiting',
          hostId: meeting.therapistId, // Therapist is typically the host
        };
        this.meetings.set(data.meetingId, meetingRoom);
      }

      // Add participant
      const participant: ParticipantInfo = {
        userId,
        socketId: client.id,
        role,
        joinedAt: new Date(),
        isReady: false,
        mediaStatus: {
          video: data.mediaPreferences?.video ?? false,
          audio: data.mediaPreferences?.audio ?? true,
          screen: false,
        },
      };

      meetingRoom.participants.set(userId, participant);

      // Join socket room
      void client.join(data.meetingId);

      // Notify other participants
      void client.to(data.meetingId).emit('participant-joined', {
        participant: {
          userId,
          role,
          mediaStatus: participant.mediaStatus,
        },
      });

      // Send current meeting state to joining user
      client.emit('meeting-joined', {
        meetingId: data.meetingId,
        meeting: {
          id: meeting.id,
          title: meeting.title,
          startTime: meeting.startTime,
          duration: meeting.duration,
          status: meetingRoom.status,
        },
        participants: Array.from(meetingRoom.participants.values()).map(
          (p) => ({
            userId: p.userId,
            role: p.role,
            mediaStatus: p.mediaStatus,
            isReady: p.isReady,
          }),
        ),
        isHost: userId === meetingRoom.hostId,
      });

      // Update meeting status if first participant
      if (meetingRoom.participants.size === 1) {
        await this.prisma.meeting.update({
          where: { id: data.meetingId },
          data: { status: 'IN_PROGRESS' },
        });
      }

      this.logger.log(`User ${userId} joined meeting ${data.meetingId}`);
    } catch (error) {
      this.logger.error('Failed to join meeting:', error);
      client.emit('meeting-error', {
        error: 'Failed to join meeting',
      });
    }
  }

  @SubscribeMessage('leave-meeting')
  async leaveMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { meetingId: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const meetingRoom = this.meetings.get(data.meetingId);
    if (!meetingRoom) return;

    // Remove participant
    meetingRoom.participants.delete(userId);
    void client.leave(data.meetingId);

    // Notify other participants
    void client.to(data.meetingId).emit('participant-left', {
      userId,
    });

    // If no participants left, end meeting
    if (meetingRoom.participants.size === 0) {
      await this.endMeeting(data.meetingId);
    }

    this.logger.log(`User ${userId} left meeting ${data.meetingId}`);
  }

  @SubscribeMessage('toggle-media')
  async toggleMedia(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MediaToggleData,
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const meetingRoom = this.meetings.get(data.meetingId);
    if (!meetingRoom) return;

    const participant = meetingRoom.participants.get(userId);
    if (!participant) return;

    // Update media status
    participant.mediaStatus[data.mediaType] = data.enabled;

    // Notify other participants
    client.to(data.meetingId).emit('participant-media-changed', {
      userId,
      mediaType: data.mediaType,
      enabled: data.enabled,
    });

    this.logger.log(
      `User ${userId} toggled ${data.mediaType} to ${data.enabled} in meeting ${data.meetingId}`,
    );
  }

  @SubscribeMessage('participant-ready')
  async participantReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { meetingId: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const meetingRoom = this.meetings.get(data.meetingId);
    if (!meetingRoom) return;

    const participant = meetingRoom.participants.get(userId);
    if (!participant) return;

    participant.isReady = true;

    // Notify other participants
    client.to(data.meetingId).emit('participant-ready', {
      userId,
    });

    // Check if all participants are ready
    const allReady = Array.from(meetingRoom.participants.values()).every(
      (p) => p.isReady,
    );

    if (allReady && meetingRoom.status === 'waiting') {
      meetingRoom.status = 'active';
      this.server.to(data.meetingId).emit('meeting-started', {
        meetingId: data.meetingId,
      });
    }
  }

  @SubscribeMessage('chat-message')
  async sendChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatMessageData,
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const meetingRoom = this.meetings.get(data.meetingId);
    if (!meetingRoom || !meetingRoom.participants.has(userId)) return;

    const participant = meetingRoom.participants.get(userId);
    if (!participant) return;

    // Broadcast message to all participants
    this.server.to(data.meetingId).emit('chat-message', {
      senderId: userId,
      senderRole: participant.role,
      message: data.message,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('meeting-control')
  async meetingControl(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MeetingControlData,
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const meetingRoom = this.meetings.get(data.meetingId);
    if (!meetingRoom) return;

    // Only host can control meeting
    if (userId !== meetingRoom.hostId) {
      client.emit('meeting-error', {
        error: 'Only the host can control the meeting',
      });
      return;
    }

    switch (data.action) {
      case 'start':
        meetingRoom.status = 'active';
        this.server.to(data.meetingId).emit('meeting-started', {
          meetingId: data.meetingId,
        });
        break;

      case 'end':
        await this.endMeeting(data.meetingId);
        break;

      case 'record':
        // Recording functionality would be implemented here
        this.server.to(data.meetingId).emit('recording-started', {
          meetingId: data.meetingId,
        });
        break;
    }
  }

  @SubscribeMessage('webrtc-signal')
  async handleWebRTCSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      meetingId: string;
      targetUserId: string;
      signal: any;
      type: 'offer' | 'answer' | 'ice-candidate';
    },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const targetSocketId = this.userToSocket.get(data.targetUserId);
    if (!targetSocketId) return;

    // Forward WebRTC signal to target user
    this.server.to(targetSocketId).emit('webrtc-signal', {
      fromUserId: userId,
      signal: data.signal,
      type: data.type,
    });
  }

  private async endMeeting(meetingId: string) {
    const meetingRoom = this.meetings.get(meetingId);
    if (!meetingRoom) return;

    meetingRoom.status = 'ended';

    // Notify all participants
    this.server.to(meetingId).emit('meeting-ended', {
      meetingId,
      endTime: new Date(),
    });

    // Update database
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'COMPLETED',
        // Add end time or actual duration if needed
      },
    });

    // Remove all participants from room
    for (const participant of meetingRoom.participants.values()) {
      const socket = this.server.sockets.sockets.get(participant.socketId);
      void socket?.leave(meetingId);
    }

    // Clean up meeting room
    this.meetings.delete(meetingId);

    this.logger.log(`Meeting ${meetingId} ended`);
  }

  private async sendActiveMeetings(client: Socket, userId: string) {
    try {
      const activeMeetings = await this.prisma.meeting.findMany({
        where: {
          OR: [{ clientId: userId }, { therapistId: userId }],
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
          startTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            lte: new Date(Date.now() + 60 * 60 * 1000), // Next 1 hour
          },
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

      client.emit('active-meetings', {
        meetings: activeMeetings.map((meeting) => ({
          id: meeting.id,
          title: meeting.title,
          startTime: meeting.startTime,
          duration: meeting.duration,
          status: meeting.status,
          isActive: this.meetings.has(meeting.id),
          participantCount:
            this.meetings.get(meeting.id)?.participants.size || 0,
        })),
      });
    } catch (error) {
      this.logger.error('Failed to send active meetings:', error);
    }
  }
}
