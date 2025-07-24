import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventBusService } from '../common/events/event-bus.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { WebSocketAuthService } from './services/websocket-auth.service';
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

@Injectable()
@WebSocketGateway({
  namespace: '/messaging',
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000', // Explicit fallback
      'http://127.0.0.1:3000', // Alternative localhost
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['authorization', 'content-type'],
  },
  // Enable connection state recovery for better reliability
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
})
export class MessagingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>();
  private userToSocket = new Map<string, string>();
  private socketToUser = new Map<string, string>();

  constructor(
    private readonly websocketAuth: WebSocketAuthService,
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    @Inject(forwardRef(() => WebSocketEventService))
    private readonly webSocketEventService: WebSocketEventService,
  ) { }

  afterInit() {
    this.logger.log(
      'Messaging WebSocket Gateway initialized with connection state recovery',
    );
  }

  async handleConnection(client: Socket) {
    try {
      // Log connection recovery status
      if ((client as any).recovered) {
        this.logger.log(
          `User ${(client as any).handshake?.auth?.userId || 'unknown'} connected with state recovery`,
        );
      }

      const user = await this.websocketAuth.authenticateSocket(client);
      if (!user) {
        this.logger.warn(`Authentication failed for socket ${client.id}`);
        client.disconnect();
        return;
      }

      // Remove any existing connection for this user
      const existingSocketId = this.userToSocket.get(user.userId);
      if (existingSocketId) {
        const existingSocket =
          this.server.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          this.logger.log(
            `Disconnecting existing socket for user ${user.userId}`,
          );
          existingSocket.disconnect();
        }
        this.cleanupUserConnection(user.userId);
      }

      // Set up new connection
      const connectedUser: ConnectedUser = {
        userId: user.userId,
        socketId: client.id,
        connectedAt: new Date(),
        rooms: new Set(),
      };

      this.connectedUsers.set(user.userId, connectedUser);
      this.userToSocket.set(user.userId, client.id);
      this.socketToUser.set(client.id, user.userId);

      // Subscribe user to their personal notification room
      const personalRoom = this.getUserRoom(user.userId);
      await client.join(personalRoom);
      connectedUser.rooms.add(personalRoom);

      this.logger.log(`User ${user.userId} connected to messaging gateway`);

      // Send connection confirmation
      client.emit('connected', {
        userId: user.userId,
        timestamp: new Date(),
        message: 'Connected to messaging service',
        recovered: (client as any).recovered || false,
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

  private cleanupUserConnection(userId: string) {
    try {
      const connectedUser = this.connectedUsers.get(userId);
      if (connectedUser) {
        // Leave all rooms - add safety check for server state
        if (this.server?.sockets?.sockets) {
          const socket = this.server.sockets.sockets.get(connectedUser.socketId);
          if (socket) {
            connectedUser.rooms.forEach(room => {
              try {
                socket.leave(room);
              } catch (error) {
                this.logger.warn(`Failed to leave room ${room} for user ${userId}:`, error);
              }
            });
          }
        }
        
        this.connectedUsers.delete(userId);
      }

      const socketId = this.userToSocket.get(userId);
      if (socketId) {
        this.userToSocket.delete(userId);
        this.socketToUser.delete(socketId);
      }
    } catch (error) {
      this.logger.error(`Error during cleanup for user ${userId}:`, error);
      // Ensure we still clean up the tracking maps even if socket operations fail
      this.connectedUsers.delete(userId);
      const socketId = this.userToSocket.get(userId);
      if (socketId) {
        this.userToSocket.delete(userId);
        this.socketToUser.delete(socketId);
      }
    }
  }

  /**
   * Broadcast message to conversation participants
   */
  broadcastMessage(conversationId: string, messageData: any): void {
    const room = this.getConversationRoom(conversationId);
    this.logger.debug(`Broadcasting message to conversation room: ${room}`);
    
    this.server.to(room).emit('message_sent', {
      ...messageData,
      eventType: 'message_sent',
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast read receipt to conversation participants
   */
  broadcastReadReceipt(conversationId: string, messageId: string, readBy: string): void {
    const room = this.getConversationRoom(conversationId);
    this.logger.debug(`Broadcasting read receipt for message ${messageId} to room: ${room}`);
    
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
  sendNotificationToUsers(userIds: string[], notification: NotificationData): void {
    userIds.forEach(userId => {
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
   * Update unread count for specific users
   */
  updateUnreadCount(userIds: string[], count: number): void {
    userIds.forEach(userId => {
      const userRoom = this.getUserRoom(userId);
      this.server.to(userRoom).emit('unreadCount', { count });
    });

    this.logger.debug(`Updated unread count to ${count} for ${userIds.length} users`);
  }

  /**
   * Broadcast system announcement to all connected users
   */
  broadcastSystemAnnouncement(message: string, priority: 'low' | 'medium' | 'high' = 'medium'): void {
    this.server.emit('system_announcement', {
      message,
      priority,
      eventType: 'system_announcement',
      timestamp: new Date(),
    });

    this.logger.log(`Broadcasted system announcement: ${message} (priority: ${priority})`);
  }

  /**
   * Send targeted notification to specific users
   */
  sendTargetedNotification(userIds: string[], notification: any): void {
    userIds.forEach(userId => {
      const userRoom = this.getUserRoom(userId);
      this.server.to(userRoom).emit('targeted_notification', {
        ...notification,
        eventType: 'targeted_notification',
        timestamp: new Date(),
      });
    });

    this.logger.debug(`Sent targeted notification to ${userIds.length} users`);
  }

  /**
   * Subscribe user to personal notification room
   */
  subscribeUserToPersonalRoom(userId: string, socketId: string): void {
    const userRoom = this.getUserRoom(userId);
    this.server.in(socketId).socketsJoin(userRoom);
    
    const connectedUser = this.connectedUsers.get(userId);
    if (connectedUser) {
      connectedUser.rooms.add(userRoom);
    }

    this.logger.debug(`User ${userId} subscribed to personal room: ${userRoom}`);
  }

  /**
   * Unsubscribe user from personal notification room
   */
  unsubscribeUserFromPersonalRoom(userId: string, socketId: string): void {
    const userRoom = this.getUserRoom(userId);
    this.server.in(socketId).socketsLeave(userRoom);
    
    const connectedUser = this.connectedUsers.get(userId);
    if (connectedUser) {
      connectedUser.rooms.delete(userRoom);
    }

    this.logger.debug(`User ${userId} unsubscribed from personal room: ${userRoom}`);
  }

  /**
   * Subscribe user to community room
   */
  subscribeUserToCommunityRoom(userId: string, communityId: string, socketId: string): void {
    const communityRoom = this.getCommunityRoom(communityId);
    this.server.in(socketId).socketsJoin(communityRoom);
    
    const connectedUser = this.connectedUsers.get(userId);
    if (connectedUser) {
      connectedUser.rooms.add(communityRoom);
    }

    this.logger.debug(`User ${userId} subscribed to community room: ${communityRoom}`);
  }

  /**
   * Subscribe user to post room
   */
  subscribeUserToPostRoom(userId: string, postId: string, socketId: string): void {
    const postRoom = this.getPostRoom(postId);
    this.server.in(socketId).socketsJoin(postRoom);
    
    const connectedUser = this.connectedUsers.get(userId);
    if (connectedUser) {
      connectedUser.rooms.add(postRoom);
    }

    this.logger.debug(`User ${userId} subscribed to post room: ${postRoom}`);
  }

  /**
   * Subscribe user to conversation room
   */
  subscribeUserToConversationRoom(userId: string, conversationId: string): void {
    const socketId = this.userToSocket.get(userId);
    if (!socketId) {
      this.logger.warn(`No socket found for user ${userId}`);
      return;
    }

    const conversationRoom = this.getConversationRoom(conversationId);
    this.server.in(socketId).socketsJoin(conversationRoom);
    
    const connectedUser = this.connectedUsers.get(userId);
    if (connectedUser) {
      connectedUser.rooms.add(conversationRoom);
    }

    this.logger.debug(`User ${userId} subscribed to conversation room: ${conversationRoom}`);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number;
    eventSubscriptions: number;
  } {
    return {
      totalConnections: this.server.sockets.sockets.size,
      eventSubscriptions: 10, // This should match the number of event subscriptions in WebSocketEventService
    };
  }

  // Room helper methods
  private getUserRoom(userId: string): string {
    return `user_${userId}`;
  }

  private getConversationRoom(conversationId: string): string {
    return `conv_${conversationId}`;
  }

  private getCommunityRoom(communityId: string): string {
    return `community_${communityId}`;
  }

  private getPostRoom(postId: string): string {
    return `post_${postId}`;
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
}
