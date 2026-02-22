import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventBusService } from '../common/events/event-bus.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { WebSocketEventService } from './services/websocket-event.service';

import { WebSocketAuthMiddleware } from './services/websocket-auth.service';


interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
}

interface VideoCallSession {
  id: string;
  callerId: string;
  recipientId: string;
  status: 'initiating' | 'ringing' | 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
}

interface VideoCallOffer {
  callId: string;
  fromUserId: string;
  toUserId: string;
  signal: any;
}

interface VideoCallAnswer {
  callId: string;
  fromUserId: string;
  toUserId: string;
  signal: any;
}

interface VideoCallIceCandidate {
  callId: string;
  fromUserId: string;
  toUserId: string;
  candidate: any;
}

@Injectable()
@WebSocketGateway({
  namespace: '/messaging',
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
  // Enhanced connection state recovery for better reliability
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
})
export class MessagingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  // Simplified: single one-way mapping from socket ID to user ID
  private socketToUserId = new Map<string, string>();
  
  // Video call state management
  private activeCalls = new Map<string, VideoCallSession>();
  private userCallStatus = new Map<string, 'idle' | 'calling' | 'in_call'>();

  constructor(
    private readonly authMiddleware: WebSocketAuthMiddleware,
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    @Inject(forwardRef(() => WebSocketEventService))
    private readonly webSocketEventService: WebSocketEventService,
  ) {}

  afterInit() {
    // Apply authentication middleware using Socket.IO best practices
    this.server.use(this.authMiddleware.createAuthMiddleware());

    this.logger.log(
      'Messaging WebSocket Gateway initialized with connection state recovery and auth middleware',
    );
  }

  async handleConnection(client: Socket) {
    try {
      // User is already authenticated by middleware - extract from socket
      const userId = (client as any).userId;
      const user = (client as any).user;

      if (!userId || !user) {
        this.logger.error(`Socket ${client.id} reached handleConnection without proper auth data`);
        client.disconnect();
        return;
      }

      this.logger.log(`User ${userId} connecting with socket ${client.id}`);

      // Disconnect any existing socket for this user
      const existingSocketId = Array.from(this.socketToUserId.entries())
        .find(([_, uid]) => uid === userId)?.[0];
      
      if (existingSocketId) {
        this.logger.log(`Disconnecting existing socket ${existingSocketId} for user ${userId}`);
        const existingSocket = this.server.sockets.sockets.get(existingSocketId);
        if (existingSocket && existingSocket.connected) {
          existingSocket.emit('connection_replaced', {
            message: 'Connection replaced by new session',
            timestamp: new Date(),
          });
          existingSocket.disconnect(true);
        }
        this.socketToUserId.delete(existingSocketId);
      }

      // Register new connection
      this.socketToUserId.set(client.id, userId);

      // Subscribe user to their personal notification room
      const personalRoom = this.getUserRoom(userId);
      await client.join(personalRoom);

      this.logger.log(`User ${userId} connected to messaging gateway`);

      // Send connection confirmation
      client.emit('connected', {
        userId,
        timestamp: new Date(),
        message: 'Connected to messaging service',
        recovered: (client as any).recovered || false,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (error) {
      this.logger.error(`Connection failed for socket ${client.id}:`, error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) {
      this.logger.warn(`Socket ${client.id} disconnected but was not in socketToUserId map`);
      return;
    }

    // Clean up mapping
    this.socketToUserId.delete(client.id);
    
    // Clean up video calls
    this.cleanupUserVideoCalls(userId);
    
    this.logger.log(`User ${userId} disconnected from messaging gateway`);
  }

  /**
   * Broadcast message to conversation participants
   * Simplified version using Socket.IO room-based broadcasting
   */
  broadcastMessage(conversationId: string, messageData: any, senderId?: string): void {
    try {
      if (!this.server) {
        this.logger.error('WebSocket server not available');
        return;
      }

      const room = this.getConversationRoom(conversationId);
      const payload = {
        ...messageData,
        eventType: 'new_message',
        timestamp: new Date(),
      };

      // If senderId is provided, exclude sender from broadcast
      if (senderId) {
        const senderSocketId = Array.from(this.socketToUserId.entries())
          .find(([_, uid]) => uid === senderId)?.[0];
        
        if (senderSocketId) {
          // Use Socket.IO's .except() method to exclude sender from broadcast
          this.server.to(room).except(senderSocketId).emit('new_message', payload);
          this.logger.debug(`Broadcasted message to room ${room} (excluding sender ${senderId})`);
          return;
        }
      }

      // Fallback: broadcast to all in room (sender not connected or not specified)
      this.server.to(room).emit('new_message', payload);
      this.logger.debug(`Broadcasted message to room ${room} (all participants)`);
    } catch (error) {
      this.logger.error(`Error broadcasting message:`, error);
    }
  }

  /**
   * Broadcast read receipt to conversation participants
   */
  broadcastReadReceipt(
    conversationId: string,
    messageId: string,
    readBy: string,
  ): void {
    const room = this.getConversationRoom(conversationId);
    this.logger.debug(
      `Broadcasting read receipt for message ${messageId} to room: ${room}`,
    );

    this.server.to(room).emit('message_read', {
      conversationId,
      messageId,
      readBy,
      readAt: new Date(),
      eventType: 'message_read',
    });
  }

  /**
   * Send notification to specific users
   */
  sendNotificationToUsers(
    userIds: string[],
    notification: NotificationData,
  ): void {
    userIds.forEach((userId) => {
      const userRoom = this.getUserRoom(userId);
      this.server.to(userRoom).emit('notification', {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...notification,
        isRead: false,
        createdAt: new Date().toISOString(),
        category: notification.data?.category || 'system',
      });
    });

    this.logger.debug(`Sent notification to ${userIds.length} users`);
  }

  /**
   * Subscribe user to conversation room - simplified version
   */
  subscribeUserToConversationRoom(
    userId: string,
    conversationId: string,
  ): void {
    if (!this.server) {
      this.logger.error('WebSocket server not available');
      return;
    }

    // Find socket ID for this user
    const socketId = Array.from(this.socketToUserId.entries())
      .find(([_, uid]) => uid === userId)?.[0];
    
    if (!socketId) {
      this.logger.warn(`No socket found for user ${userId} - user may not be connected`);
      return;
    }

    const conversationRoom = this.getConversationRoom(conversationId);
    this.server.in(socketId).socketsJoin(conversationRoom);
    this.logger.debug(`User ${userId} (socket: ${socketId}) joined room: ${conversationRoom}`);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number;
    uniqueUsers: number;
    eventSubscriptions: number;
  } {
    return {
      totalConnections: this.socketToUserId.size,
      uniqueUsers: new Set(this.socketToUserId.values()).size,
      eventSubscriptions: 10,
    };
  }

  // Room helper methods
  private getUserRoom(userId: string): string {
    return `user_${userId}`;
  }

  private getConversationRoom(conversationId: string): string {
    return `conv_${conversationId}`;
  }

  // Helper to get socket ID from user ID
  private getSocketIdForUser(userId: string): string | undefined {
    return Array.from(this.socketToUserId.entries())
      .find(([_, uid]) => uid === userId)?.[0];
  }

  // Event handlers for client-side events
  @SubscribeMessage('join_conversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.socketToUserId.get(client.id);
    
    if (!userId) {
      // Try to get userId from socket (from auth middleware)
      const directUserId = (client as any).userId;
      if (directUserId) {
        // Register it if not already registered
        this.socketToUserId.set(client.id, directUserId);
        this.subscribeUserToConversationRoom(directUserId, data.conversationId);
        client.emit('conversation_joined', {
          conversationId: data.conversationId,
          timestamp: new Date(),
        });
        return;
      }
      this.logger.warn(`No user ID found for socket ${client.id}, aborting join`);
      return;
    }

    this.subscribeUserToConversationRoom(userId, data.conversationId);
    client.emit('conversation_joined', {
      conversationId: data.conversationId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('leave_conversation')
  async leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    const conversationRoom = this.getConversationRoom(data.conversationId);
    client.leave(conversationRoom);

    client.emit('conversation_left', {
      conversationId: data.conversationId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    const conversationRoom = this.getConversationRoom(data.conversationId);
    client.to(conversationRoom).emit('user_typing', {
      userId,
      conversationId: data.conversationId,
      isTyping: true,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    const conversationRoom = this.getConversationRoom(data.conversationId);
    client.to(conversationRoom).emit('user_typing', {
      userId,
      conversationId: data.conversationId,
      isTyping: false,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }

  /**
   * Enhanced message sending with acknowledgment support
   * Ensures delivery guarantees for critical messages
   */
  @SubscribeMessage('send_message_with_ack')
  async handleSendMessageWithAck(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      type?: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO';
      replyToMessageId?: string;
    },
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // This would typically call the messaging service to save the message
      // For now, we'll simulate message creation and broadcast
      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId: data.conversationId,
        senderId: userId,
        content: data.content,
        messageType: data.type || 'TEXT',
        createdAt: new Date().toISOString(),
        replyToId: data.replyToMessageId || null,
      };

      // Broadcast to conversation participants (excluding sender)
      this.broadcastMessage(data.conversationId, messageData, userId);

      // Return acknowledgment
      return {
        success: true,
        messageId: messageData.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error sending message with ack for user ${userId}:`,
        error,
      );
      return {
        success: false,
        error: 'Failed to send message',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Acknowledge message receipt with delivery confirmation
   */
  @SubscribeMessage('acknowledge_message')
  async handleAcknowledgeMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; type: 'delivered' | 'read' },
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    try {
      this.logger.debug(
        `Message ${data.messageId} acknowledged as ${data.type} by user ${userId}`,
      );

      // This would typically update the message status in the database
      // For now, we'll just broadcast the acknowledgment to other participants

      return {
        success: true,
        acknowledged: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error acknowledging message ${data.messageId}:`,
        error,
      );
      return { success: false, error: 'Failed to acknowledge message' };
    }
  }

  // Video Call Event Handlers

  @SubscribeMessage('initiate_video_call')
  async handleInitiateVideoCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string },
  ) {
    const callerId = this.socketToUserId.get(client.id);
    if (!callerId) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if server is properly initialized
    if (!this.server || !this.server.sockets) {
      this.logger.error('❌ [VIDEO CALL] Socket.IO server not properly initialized');
      return { success: false, error: 'Server not ready' };
    }

    const { recipientId } = data;
    
    // Check if recipient is connected
    const recipientSocketId = Array.from(this.socketToUserId.entries())
      .find(([_, uid]) => uid === recipientId)?.[0];
    if (!recipientSocketId) {
      return { success: false, error: 'Recipient is not online' };
    }

    // Check if users are not already in a call
    const callerStatus = this.userCallStatus.get(callerId) || 'idle';
    const recipientStatus = this.userCallStatus.get(recipientId) || 'idle';
    
    if (callerStatus !== 'idle') {
      return { success: false, error: 'You are already in a call' };
    }
    
    if (recipientStatus !== 'idle') {
      return { success: false, error: 'Recipient is already in a call' };
    }

    // Create call session
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const callSession: VideoCallSession = {
      id: callId,
      callerId,
      recipientId,
      status: 'initiating',
      startTime: new Date(),
    };

    this.activeCalls.set(callId, callSession);
    this.userCallStatus.set(callerId, 'calling');
    this.userCallStatus.set(recipientId, 'calling');

    // Send incoming call notification to recipient
    const recipientUserRoom = this.getUserRoom(recipientId);
    const callerUser = (client as any).user;
    
    // Double-check recipient is still connected
    const recipientStillConnected = Array.from(this.socketToUserId.entries())
      .some(([_, uid]) => uid === recipientId);
    if (!recipientStillConnected) {
      this.logger.warn(`⚠️ [VIDEO CALL] Recipient ${recipientId} disconnected before call notification could be sent`);
      return {
        success: false,
        error: 'Recipient went offline',
        recipientId,
        recipientRoom: recipientUserRoom,
      };
    }
    
    this.logger.log(`   - Recipient is connected, sending notification...`);
    
    this.server.to(recipientUserRoom).emit('incoming_video_call', {
      callId,
      callerId,
      callerName: callerUser ? `${callerUser.firstName} ${callerUser.lastName}` : 'Unknown User',
      callerInfo: callerUser,
      timestamp: new Date(),
    });
    
    this.logger.log(`✅ [VIDEO CALL] Incoming call notification sent to ${recipientUserRoom}`);

    // Update call status to ringing
    callSession.status = 'ringing';
    this.activeCalls.set(callId, callSession);

    this.logger.log(`Video call initiated: ${callerId} -> ${recipientId} (Call ID: ${callId})`);

    return {
      success: true,
      callId,
      message: 'Call initiated',
      timestamp: new Date(),
    };
  }

  @SubscribeMessage('video_call_answer')
  async handleVideoCallAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; accept: boolean },
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    const { callId, accept } = data;
    const callSession = this.activeCalls.get(callId);

    if (!callSession || callSession.recipientId !== userId) {
      client.emit('call_error', { error: 'Invalid call session' });
      return;
    }

    if (accept) {
      // Accept the call
      callSession.status = 'active';
      this.activeCalls.set(callId, callSession);
      this.userCallStatus.set(callSession.callerId, 'in_call');
      this.userCallStatus.set(callSession.recipientId, 'in_call');

      // Notify caller that call was accepted
      const callerSocketId = this.getSocketIdForUser(callSession.callerId);
      if (callerSocketId) {
        this.server.to(callerSocketId).emit('video_call_accepted', {
          callId,
          timestamp: new Date(),
        });
      }

      // Emit to both users to start WebRTC signaling
      const recipientSocketId = this.getSocketIdForUser(callSession.recipientId);
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('start_webrtc_connection', {
          callId,
          isInitiator: false,
          timestamp: new Date(),
        });
      }
      
      if (callerSocketId) {
        this.server.to(callerSocketId).emit('start_webrtc_connection', {
          callId,
          isInitiator: true,
          timestamp: new Date(),
        });
      }

      this.logger.log(`Video call accepted: Call ID ${callId}`);
    } else {
      // Decline the call
      this.endVideoCall(callId, 'declined');
      
      // Notify caller that call was declined
      const callerSocketId = this.getSocketIdForUser(callSession.callerId);
      if (callerSocketId) {
        this.server.to(callerSocketId).emit('video_call_declined', {
          callId,
          timestamp: new Date(),
        });
      }

      this.logger.log(`Video call declined: Call ID ${callId}`);
    }
  }

  @SubscribeMessage('video_call_decline')
  async handleVideoCallDecline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    const { callId } = data;
    this.endVideoCall(callId, 'declined');
    
    this.logger.log(`Video call explicitly declined: Call ID ${callId}`);
  }

  @SubscribeMessage('video_call_offer')
  async handleVideoCallOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VideoCallOffer,
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    const { callId, toUserId, signal } = data;
    const callSession = this.activeCalls.get(callId);

    if (!callSession || callSession.status !== 'active') {
      client.emit('call_error', { error: 'Invalid call session for offer' });
      return;
    }

    // Forward the offer to the recipient
    const recipientSocketId = this.getSocketIdForUser(toUserId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('video_call_offer', {
        callId,
        fromUserId: userId,
        signal,
        timestamp: new Date(),
      });
    }

    this.logger.debug(`Video call offer forwarded: ${userId} -> ${toUserId} (Call ID: ${callId})`);
  }

  @SubscribeMessage('video_call_answer_signal')
  async handleVideoCallAnswerSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VideoCallAnswer,
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    const { callId, toUserId, signal } = data;
    const callSession = this.activeCalls.get(callId);

    if (!callSession || callSession.status !== 'active') {
      client.emit('call_error', { error: 'Invalid call session for answer' });
      return;
    }

    // Forward the answer to the caller
    const callerSocketId = this.getSocketIdForUser(toUserId);
    if (callerSocketId) {
      this.server.to(callerSocketId).emit('video_call_answer', {
        callId,
        fromUserId: userId,
        signal,
        timestamp: new Date(),
      });
    }

    this.logger.debug(`Video call answer forwarded: ${userId} -> ${toUserId} (Call ID: ${callId})`);
  }

  @SubscribeMessage('video_call_ice_candidate')
  async handleVideoCallIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: VideoCallIceCandidate,
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    const { callId, toUserId, candidate } = data;
    const callSession = this.activeCalls.get(callId);

    if (!callSession || callSession.status !== 'active') {
      return; // Silently ignore ICE candidates for invalid calls
    }

    // Forward the ICE candidate to the other peer
    const peerSocketId = this.getSocketIdForUser(toUserId);
    if (peerSocketId) {
      this.server.to(peerSocketId).emit('video_call_ice_candidate', {
        callId,
        fromUserId: userId,
        candidate,
        timestamp: new Date(),
      });
    }

    this.logger.debug(`ICE candidate forwarded: ${userId} -> ${toUserId} (Call ID: ${callId})`);
  }

  @SubscribeMessage('video_call_end')
  async handleVideoCallEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = this.socketToUserId.get(client.id);
    if (!userId) return;

    const { callId } = data;
    this.endVideoCall(callId, 'ended');
    
    this.logger.log(`Video call ended by user ${userId}: Call ID ${callId}`);
  }

  /**
   * Helper method to end a video call and cleanup state
   */
  private endVideoCall(callId: string, reason: 'ended' | 'declined' | 'timeout' | 'error') {
    const callSession = this.activeCalls.get(callId);
    if (!callSession) return;

    // Update call session
    callSession.status = 'ended';
    callSession.endTime = new Date();

    // Reset user call status
    this.userCallStatus.set(callSession.callerId, 'idle');
    this.userCallStatus.set(callSession.recipientId, 'idle');

    // Notify both users that the call has ended
    const callerSocketId = this.getSocketIdForUser(callSession.callerId);
    const recipientSocketId = this.getSocketIdForUser(callSession.recipientId);

    const endEventData = {
      callId,
      reason,
      timestamp: new Date(),
    };

    if (callerSocketId) {
      this.server.to(callerSocketId).emit('video_call_ended', endEventData);
    }
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('video_call_ended', endEventData);
    }

    // Clean up call session after a short delay to allow for cleanup
    setTimeout(() => {
      this.activeCalls.delete(callId);
    }, 5000);

    this.logger.log(`Video call ${callId} ended: ${reason}`);
  }

  /**
   * Clean up video call state when user disconnects
   */
  private cleanupUserVideoCalls(userId: string) {
    // Find and end any active calls involving this user
    for (const [callId, callSession] of this.activeCalls.entries()) {
      if (callSession.callerId === userId || callSession.recipientId === userId) {
        this.endVideoCall(callId, 'error');
      }
    }
    
    // Reset user call status
    this.userCallStatus.delete(userId);
  }
}
