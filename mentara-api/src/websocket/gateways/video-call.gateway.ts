import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConnectionManagerService } from '../services/connection-manager.service';
import { WebSocketAuthMiddleware } from '../../messaging/services/websocket-auth.service';

interface VideoCallOffer {
  callId: string;
  fromUserId: string;
  toUserId: string;
  offer: RTCSessionDescriptionInit;
}

interface VideoCallAnswer {
  callId: string;
  fromUserId: string;
  toUserId: string;
  answer: RTCSessionDescriptionInit;
}

interface VideoCallIceCandidate {
  callId: string;
  fromUserId: string;
  toUserId: string;
  candidate: RTCIceCandidateInit;
}

interface VideoCallSession {
  id: string;
  callerId: string;
  recipientId: string;
  status: 'initiating' | 'ringing' | 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
}

@Injectable()
@WebSocketGateway({
  namespace: '/video-calls',
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['authorization', 'content-type'],
  },
})
export class VideoCallGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(VideoCallGateway.name);
  private activeCalls = new Map<string, VideoCallSession>();
  private userCallStatus = new Map<string, 'idle' | 'calling' | 'in_call'>();

  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly authMiddleware: WebSocketAuthMiddleware,
  ) {}

  afterInit(server: Server) {
    this.server.use(this.authMiddleware.createAuthMiddleware());
    this.connectionManager.initialize(server);
    this.logger.log('Video Call WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const userId = (client as any).userId;
      const user = (client as any).user;
      
      if (!userId || !user) {
        this.logger.warn(`Unauthenticated video call connection attempt: ${client.id}`);
        client.disconnect();
        return;
      }

      this.connectionManager.registerConnection(client, userId, {
        id: userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'client',
      });

      // Set user status to idle
      this.userCallStatus.set(userId, 'idle');

      this.logger.log(`User ${userId} connected to video call gateway`);
    } catch (error) {
      this.logger.error(`Error handling video call connection: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectionManager.getUserId(client.id);
    if (userId) {
      this.connectionManager.unregisterConnection(client.id);
      this.userCallStatus.delete(userId);
      this.logger.log(`User ${userId} disconnected from video call gateway`);
    }
  }

  /**
   * Handle incoming call offer (WebRTC offer)
   */
  @SubscribeMessage('video:offer')
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VideoCallOffer,
  ) {
    const userId = this.connectionManager.getUserId(client.id);
    if (!userId || userId !== data.fromUserId) {
      this.logger.warn(`Unauthorized call offer from ${client.id}`);
      return { error: 'Unauthorized' };
    }

    const recipientSocketId = this.connectionManager.getSocketId(data.toUserId);
    if (!recipientSocketId) {
      this.logger.warn(`Recipient ${data.toUserId} not connected`);
      return { error: 'Recipient not available' };
    }

    // Check if recipient is already in a call
    const recipientStatus = this.userCallStatus.get(data.toUserId);
    if (recipientStatus === 'in_call' || recipientStatus === 'calling') {
      return { error: 'Recipient is busy' };
    }

    // Create call session
    const callSession: VideoCallSession = {
      id: data.callId,
      callerId: data.fromUserId,
      recipientId: data.toUserId,
      status: 'ringing',
      startTime: new Date(),
    };

    this.activeCalls.set(data.callId, callSession);
    this.userCallStatus.set(data.fromUserId, 'calling');
    this.userCallStatus.set(data.toUserId, 'calling');

    // Send offer to recipient
    const recipientRoom = this.connectionManager.getUserRoom(data.toUserId);
    this.server.to(recipientRoom).emit('video:incoming-call', {
      callId: data.callId,
      fromUserId: data.fromUserId,
      offer: data.offer,
    });

    this.logger.log(`Call offer sent from ${data.fromUserId} to ${data.toUserId}`);

    return { success: true };
  }

  /**
   * Handle call answer (WebRTC answer)
   */
  @SubscribeMessage('video:answer')
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VideoCallAnswer,
  ) {
    const userId = this.connectionManager.getUserId(client.id);
    if (!userId || userId !== data.fromUserId) {
      return { error: 'Unauthorized' };
    }

    const callSession = this.activeCalls.get(data.callId);
    if (!callSession || callSession.recipientId !== data.fromUserId) {
      return { error: 'Invalid call session' };
    }

    // Update call status
    callSession.status = 'active';
    this.userCallStatus.set(data.fromUserId, 'in_call');
    this.userCallStatus.set(data.toUserId, 'in_call');

    // Send answer to caller
    const callerRoom = this.connectionManager.getUserRoom(data.toUserId);
    this.server.to(callerRoom).emit('video:answer-received', {
      callId: data.callId,
      fromUserId: data.fromUserId,
      answer: data.answer,
    });

    this.logger.log(`Call answered: ${data.callId}`);

    return { success: true };
  }

  /**
   * Handle ICE candidate exchange
   */
  @SubscribeMessage('video:ice-candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VideoCallIceCandidate,
  ) {
    const userId = this.connectionManager.getUserId(client.id);
    if (!userId || userId !== data.fromUserId) {
      return { error: 'Unauthorized' };
    }

    const callSession = this.activeCalls.get(data.callId);
    if (!callSession) {
      return { error: 'Invalid call session' };
    }

    // Forward ICE candidate to the other participant
    const otherUserId =
      callSession.callerId === data.fromUserId
        ? callSession.recipientId
        : callSession.callerId;

    const otherRoom = this.connectionManager.getUserRoom(otherUserId);
    this.server.to(otherRoom).emit('video:ice-candidate', {
      callId: data.callId,
      fromUserId: data.fromUserId,
      candidate: data.candidate,
    });

    return { success: true };
  }

  /**
   * Handle call end
   */
  @SubscribeMessage('video:end-call')
  async handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = this.connectionManager.getUserId(client.id);
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const callSession = this.activeCalls.get(data.callId);
    if (!callSession) {
      return { error: 'Invalid call session' };
    }

    // Verify user is part of the call
    if (
      callSession.callerId !== userId &&
      callSession.recipientId !== userId
    ) {
      return { error: 'Unauthorized' };
    }

    // Update call status
    callSession.status = 'ended';
    callSession.endTime = new Date();

    // Reset user statuses
    this.userCallStatus.set(callSession.callerId, 'idle');
    this.userCallStatus.set(callSession.recipientId, 'idle');

    // Notify both participants
    const callerRoom = this.connectionManager.getUserRoom(callSession.callerId);
    const recipientRoom = this.connectionManager.getUserRoom(
      callSession.recipientId,
    );

    this.server.to(callerRoom).emit('video:call-ended', { callId: data.callId });
    this.server.to(recipientRoom).emit('video:call-ended', { callId: data.callId });

    // Clean up after a delay
    setTimeout(() => {
      this.activeCalls.delete(data.callId);
    }, 5000);

    this.logger.log(`Call ended: ${data.callId}`);

    return { success: true };
  }

  /**
   * Handle call rejection
   */
  @SubscribeMessage('video:reject-call')
  async handleRejectCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = this.connectionManager.getUserId(client.id);
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const callSession = this.activeCalls.get(data.callId);
    if (!callSession || callSession.recipientId !== userId) {
      return { error: 'Invalid call session' };
    }

    // Update call status
    callSession.status = 'ended';
    callSession.endTime = new Date();

    // Reset user statuses
    this.userCallStatus.set(callSession.callerId, 'idle');
    this.userCallStatus.set(callSession.recipientId, 'idle');

    // Notify caller
    const callerRoom = this.connectionManager.getUserRoom(callSession.callerId);
    this.server.to(callerRoom).emit('video:call-rejected', { callId: data.callId });

    // Clean up
    this.activeCalls.delete(data.callId);

    this.logger.log(`Call rejected: ${data.callId}`);

    return { success: true };
  }

  /**
   * Get active call for user
   */
  getActiveCall(userId: string): VideoCallSession | null {
    for (const call of this.activeCalls.values()) {
      if (
        (call.callerId === userId || call.recipientId === userId) &&
        call.status !== 'ended'
      ) {
        return call;
      }
    }
    return null;
  }

  /**
   * Get call statistics
   */
  getCallStats(): {
    activeCalls: number;
    totalUsers: number;
  } {
    const activeCount = Array.from(this.activeCalls.values()).filter(
      (call) => call.status === 'active',
    ).length;

    return {
      activeCalls: activeCount,
      totalUsers: this.userCallStatus.size,
    };
  }
}

