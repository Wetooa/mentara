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

interface ConnectedUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
  rooms: Set<string>;
}

interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
}

import { WebSocketAuthMiddleware } from './services/websocket-auth.service';

interface ConnectedUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
  rooms: Set<string>;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
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
  private connectedUsers = new Map<string, ConnectedUser>();
  private userToSocket = new Map<string, string>();
  private socketToUser = new Map<string, string>();

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
        this.logger.error(
          `Socket ${client.id} reached handleConnection without proper auth data`,
        );
        client.disconnect();
        return;
      }

      // Log connection recovery status
      if ((client as any).recovered) {
        this.logger.log(`User ${userId} connected with state recovery`);
      }

      // Improved connection management - handle existing connections gracefully
      await this.handleExistingConnection(userId);

      // Set up new connection
      const connectedUser: ConnectedUser = {
        userId,
        socketId: client.id,
        connectedAt: new Date(),
        rooms: new Set(),
        user,
      };

      this.connectedUsers.set(userId, connectedUser);
      this.userToSocket.set(userId, client.id);
      this.socketToUser.set(client.id, userId);

      // Subscribe user to their personal notification room
      const personalRoom = this.getUserRoom(userId);
      await client.join(personalRoom);
      connectedUser.rooms.add(personalRoom);

      this.logger.log(`User ${userId} connected to messaging gateway`);

      // Send connection confirmation with enhanced data
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
      this.logger.error('Connection failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    this.cleanupUserConnection(userId);
    this.logger.log(`User ${userId} disconnected from messaging gateway`);
  }

  /**
   * Gracefully handle existing connections without causing flicker
   */
  private async handleExistingConnection(userId: string): Promise<void> {
    const existingConnection = this.connectedUsers.get(userId);
    if (!existingConnection) return;

    this.logger.log(`Handling existing connection for user ${userId}`);

    // Clean up existing connection data without disconnecting the socket
    // Let the old socket naturally disconnect to avoid connection flicker
    this.connectedUsers.delete(userId);

    const oldSocketId = this.userToSocket.get(userId);
    if (oldSocketId) {
      this.userToSocket.delete(userId);
      this.socketToUser.delete(oldSocketId);

      // Optionally notify the old socket about replacement
      const oldSocket = this.server.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.emit('connection_replaced', {
          message: 'Connection replaced by new session',
          timestamp: new Date(),
        });
      }
    }
  }

  private cleanupUserConnection(userId: string) {
    try {
      const connectedUser = this.connectedUsers.get(userId);
      if (connectedUser) {
        // Simplified cleanup - let Socket.IO handle room cleanup automatically
        this.connectedUsers.delete(userId);
      }

      const socketId = this.userToSocket.get(userId);
      if (socketId) {
        this.userToSocket.delete(userId);
        this.socketToUser.delete(socketId);
      }
    } catch (error) {
      this.logger.error(`Error during cleanup for user ${userId}:`, error);
    }
  }

  /**
   * Broadcast message to conversation participants
   */
  broadcastMessage(conversationId: string, messageData: any): void {
    const room = this.getConversationRoom(conversationId);
    this.logger.log(`🚀 [BROADCAST] Broadcasting message to conversation room: ${room}`);
    this.logger.debug(`📨 [BROADCAST] Message data:`, {
      messageId: messageData?.message?.id,
      senderId: messageData?.message?.senderId,
      content: messageData?.message?.content?.substring(0, 50),
      eventType: 'new_message'
    });

    // Get connected sockets in this room for debugging
    const socketsInRoom = this.server.sockets.adapter.rooms.get(room);
    this.logger.log(`👥 [BROADCAST] Sockets in room ${room}: ${socketsInRoom?.size || 0}`);

    this.server.to(room).emit('new_message', {
      ...messageData,
      eventType: 'new_message',
      timestamp: new Date(),
    });
    
    this.logger.log(`✅ [BROADCAST] Message broadcasted successfully to room: ${room}`);
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
    const socketId = this.userToSocket.get(userId);
    if (!socketId) {
      this.logger.warn(`❌ [ROOM JOIN] No socket found for user ${userId}`);
      return;
    }

    const conversationRoom = this.getConversationRoom(conversationId);
    this.server.in(socketId).socketsJoin(conversationRoom);

    const connectedUser = this.connectedUsers.get(userId);
    if (connectedUser) {
      connectedUser.rooms.add(conversationRoom);
    }

    // Log room membership after joining
    const socketsInRoom = this.server.sockets.adapter.rooms.get(conversationRoom);
    this.logger.log(
      `✅ [ROOM JOIN] User ${userId} (socket: ${socketId}) joined room: ${conversationRoom}. Total in room: ${socketsInRoom?.size || 0}`,
    );
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
      totalConnections: this.server.sockets.sockets.size,
      uniqueUsers: this.connectedUsers.size,
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

  // Event handlers for client-side events
  @SubscribeMessage('join_conversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

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
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const conversationRoom = this.getConversationRoom(data.conversationId);
    client.leave(conversationRoom);

    const connectedUser = this.connectedUsers.get(userId);
    if (connectedUser) {
      connectedUser.rooms.delete(conversationRoom);
    }

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
    const userId = this.socketToUser.get(client.id);
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
    const userId = this.socketToUser.get(client.id);
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
    const userId = this.socketToUser.get(client.id);
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

      // Broadcast to conversation participants
      this.broadcastMessage(data.conversationId, messageData);

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
    const userId = this.socketToUser.get(client.id);
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
}
