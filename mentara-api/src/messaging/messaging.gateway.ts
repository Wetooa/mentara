import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { WebSocketAuthService } from './services/websocket-auth.service';
import type {
  JoinConversationDto,
  LeaveConversationDto,
  TypingIndicatorDto,
} from './types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  isAuthenticated?: boolean;
}

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',  // Explicit fallback
      'http://127.0.0.1:3000',  // Alternative localhost
      'https://localhost:3000', // HTTPS fallback (for dev SSL)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'authorization', 
      'content-type', 
      'accept',
      'origin',
      'x-requested-with',
      'access-control-allow-origin',
      'access-control-allow-headers',
      'access-control-allow-methods',
      'access-control-allow-credentials'
    ],
    optionsSuccessStatus: 200,
  },
  namespace: '/messaging',
  transports: ['websocket', 'polling'],
  allowEIO3: true, // Allow Engine.IO v3 clients (compatibility)
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socket IDs
  private conversationParticipants = new Map<string, Set<string>>(); // conversationId -> Set of user IDs
  
  // Connection limits
  private readonly MAX_CONNECTIONS_PER_USER = 3; // Limit to 3 concurrent connections per user

  constructor(
    private readonly prisma: PrismaService,
    private readonly webSocketAuth: WebSocketAuthService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`🔗 New WebSocket connection: ${client.id} from ${client.handshake.address}`);
      
      // Log connection details for debugging
      this.logger.debug(`🔍 Connection details for ${client.id}:`, {
        origin: client.handshake.headers.origin,
        userAgent: client.handshake.headers['user-agent'],
        transport: client.conn.transport.name,
        protocol: client.conn.protocol,
        hasAuth: !!client.handshake.auth?.token,
        hasAuthHeader: !!client.handshake.headers.authorization,
        query: client.handshake.query,
      });

      // Authenticate the socket connection using the new auth service
      const authResult = await this.webSocketAuth.authenticateSocket(client);

      if (!authResult) {
        this.logger.warn(`❌ Authentication failed for client ${client.id}`);
        
        // Provide more detailed error information
        const errorDetails = {
          message: 'Authentication failed. Please sign in again.',
          code: 'AUTH_FAILED',
          timestamp: new Date().toISOString(),
          debug: {
            socketId: client.id,
            hasToken: !!client.handshake.auth?.token,
            hasAuthHeader: !!client.handshake.headers.authorization,
            origin: client.handshake.headers.origin,
          }
        };
        
        client.emit('auth_error', errorDetails);
        this.logger.debug(`🔍 Auth error details sent to client ${client.id}:`, errorDetails);
        client.disconnect(true);
        return;
      }

      this.logger.log(`✅ Socket ${client.id} authenticated as user ${authResult.userId} (${authResult.role})`);

      // Attach authenticated user info to socket
      client.userId = authResult.userId;
      client.userRole = authResult.role;
      client.isAuthenticated = true;

      // Verify user exists in database and is active
      const user = await this.prisma.user.findUnique({
        where: {
          id: authResult.userId,
          isActive: true, // Only allow active users
        },
        select: { id: true, role: true, isActive: true, email: true },
      });

      if (!user) {
        this.logger.warn(`❌ User ${authResult.userId} not found or inactive in database`);
        client.emit('auth_error', {
          message: 'User account not found or inactive',
          code: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
        client.disconnect(true);
        return;
      }

      this.logger.log(`👤 User ${user.id} (${user.email}) verified in database`);

      // Handle connection limits and deduplication
      await this.handleConnectionLimits(client, authResult.userId);

      // Add socket to user's socket set
      if (!this.userSockets.has(authResult.userId)) {
        this.userSockets.set(authResult.userId, new Set());
      }
      this.userSockets.get(authResult.userId)!.add(client.id);

      // Join user to their conversation rooms
      await this.joinUserConversations(client, authResult.userId);

      // Subscribe user to their personal notification room
      await this.subscribeUserToPersonalRoom(client, authResult.userId);

      // Notify successful connection
      const successResponse = {
        userId: authResult.userId,
        role: user.role,
        message: 'Successfully authenticated and connected',
        timestamp: new Date().toISOString(),
        connectionInfo: {
          socketId: client.id,
          transport: client.conn.transport.name,
          totalConnections: this.userSockets.get(authResult.userId)?.size || 1,
        }
      };
      
      client.emit('authenticated', successResponse);
      this.logger.log(`🎉 Socket ${client.id} connection completed successfully for user ${authResult.userId}`);

      // Emit user online status to their contacts
      await this.broadcastUserStatus(authResult.userId, 'online');
    } catch (error) {
      this.logger.error(`💥 Connection error for client ${client.id}:`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        socketId: client.id,
        origin: client.handshake.headers.origin,
        transport: client.conn.transport.name,
      });
      
      client.emit('connection_error', {
        message: 'Internal server error during connection',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        socketId: client.id,
      });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    try {
      if (client.userId) {
        await this.cleanupUserConnection(client.userId, client.id);
      }

      // Clean up authentication tracking
      this.webSocketAuth.cleanupConnection(client.id);
    } catch (error) {
      this.logger.error(`Error during disconnect cleanup for socket ${client.id}:`, error);
      
      // Force cleanup even if there are errors
      try {
        if (client.userId) {
          const userSockets = this.userSockets.get(client.userId);
          if (userSockets) {
            userSockets.delete(client.id);
            if (userSockets.size === 0) {
              this.userSockets.delete(client.userId);
            }
          }
        }
        this.webSocketAuth.cleanupConnection(client.id);
      } catch (forceError) {
        this.logger.error(`Force cleanup failed for socket ${client.id}:`, forceError);
      }
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinConversationDto,
  ) {
    // Authentication guard
    if (!this.isAuthenticated(client)) {
      return;
    }

    try {
      const { conversationId } = data;
      const userId = client.userId!;

      // Verify user is a participant in this conversation
      const participation = await this.prisma.conversationParticipant.findFirst(
        {
          where: {
            conversationId,
            userId,
            isActive: true,
          },
        },
      );

      if (!participation) {
        client.emit('error', { message: 'Access denied to this conversation' });
        return;
      }

      // Join socket to conversation room
      void client.join(conversationId);

      // Add user to conversation participants tracking
      if (!this.conversationParticipants.has(conversationId)) {
        this.conversationParticipants.set(conversationId, new Set());
      }
      this.conversationParticipants.get(conversationId)!.add(userId);

      // Notify other participants that user joined
      client.to(conversationId).emit('user_joined_conversation', {
        conversationId,
        userId,
      });

      client.emit('conversation_joined', { conversationId });
      this.logger.log(`User ${userId} joined conversation ${conversationId}`);
    } catch (error) {
      this.handleSubscriptionError(client, error, 'join_conversation');
    }
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: LeaveConversationDto,
  ) {
    // Authentication guard
    if (!this.isAuthenticated(client)) {
      return;
    }

    try {
      const { conversationId } = data;
      const userId = client.userId!;

      void client.leave(conversationId);

      // Remove user from conversation participants tracking
      const participants = this.conversationParticipants.get(conversationId);
      if (participants) {
        participants.delete(userId);
        if (participants.size === 0) {
          this.conversationParticipants.delete(conversationId);
        }
      }

      // Notify other participants that user left
      client.to(conversationId).emit('user_left_conversation', {
        conversationId,
        userId,
      });

      client.emit('conversation_left', { conversationId });
      this.logger.log(`User ${userId} left conversation ${conversationId}`);
    } catch (error) {
      this.handleSubscriptionError(client, error, 'leave_conversation');
    }
  }

  @SubscribeMessage('typing_indicator')
  async handleTypingIndicator(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingIndicatorDto,
  ) {
    // Authentication guard
    if (!this.isAuthenticated(client)) {
      return;
    }

    try {
      const { conversationId, isTyping = true } = data;
      const userId = client.userId!;

      // Update typing indicator in database for persistence
      if (isTyping) {
        await this.prisma.typingIndicator.upsert({
          where: {
            conversationId_userId: {
              conversationId,
              userId,
            },
          },
          create: {
            conversationId,
            userId,
            lastTypingAt: new Date(),
          },
          update: {
            lastTypingAt: new Date(),
          },
        });
      } else {
        // Remove typing indicator when user stops typing
        await this.prisma.typingIndicator.deleteMany({
          where: {
            conversationId,
            userId,
          },
        });
      }

      // Broadcast typing indicator to other participants in the conversation
      client.to(conversationId).emit('typing_indicator', {
        conversationId,
        userId,
        isTyping,
      });
    } catch (error) {
      this.handleSubscriptionError(client, error, 'typing_indicator');
    }
  }

  // Broadcast new message to conversation participants
  broadcastMessage(conversationId: string, message: any) {
    console.log('🚨 [GATEWAY] broadcastMessage CALLED');
    console.log('🚨 [GATEWAY] conversationId:', conversationId);
    console.log('🚨 [GATEWAY] message object:', message);
    
    // Check how many sockets are in the conversation room
    const conversationRoom = this.server.sockets.adapter.rooms.get(conversationId);
    const socketsInRoom = conversationRoom ? conversationRoom.size : 0;
    console.log('🚨 [GATEWAY] socketsInRoom:', socketsInRoom);
    
    // Just emit to the room
    console.log('🚨 [GATEWAY] Emitting new_message to room:', conversationId);
    this.server.to(conversationId).emit('new_message', message);
    console.log('🚨 [GATEWAY] Emit completed');

    // Don't call push notifications to avoid the error for now
    // this.sendPushNotifications(conversationId, message);
  }

  // Broadcast message update (edit/delete)
  broadcastMessageUpdate(
    conversationId: string,
    messageId: string,
    update: any,
  ) {
    this.server.to(conversationId).emit('message_updated', {
      messageId,
      ...update,
    });
  }

  // Broadcast read receipt
  broadcastReadReceipt(
    conversationId: string,
    messageId: string,
    userId: string,
  ) {
    this.server.to(conversationId).emit('message_read', {
      messageId,
      userId,
      readAt: new Date(),
    });
  }

  // Broadcast message reaction
  broadcastReaction(conversationId: string, messageId: string, reaction: any) {
    this.server.to(conversationId).emit('message_reaction', {
      messageId,
      reaction,
    });
  }

  // Private helper methods
  // Authentication guard for message handlers
  private isAuthenticated(client: AuthenticatedSocket): boolean {
    if (!client.isAuthenticated || !client.userId) {
      this.logger.warn(
        `Unauthenticated client ${client.id} attempted to perform action`,
      );
      client.emit('auth_error', {
        message: 'Authentication required for this action',
        code: 'AUTH_REQUIRED',
      });
      return false;
    }
    return true;
  }

  private async joinUserConversations(
    client: AuthenticatedSocket,
    userId: string,
  ) {
    try {
      console.log('🏠 [ROOM MANAGEMENT] joinUserConversations called');
      console.log('👤 [USER]', userId);
      console.log('🔌 [SOCKET]', client.id);
      
      // Get all active conversations for the user
      console.log('🔍 [DATABASE] Querying user conversations...');
      const conversations = await this.prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId,
              isActive: true,
            },
          },
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      console.log('📋 [CONVERSATIONS FOUND]', {
        count: conversations.length,
        conversationIds: conversations.map(c => c.id),
      });

      // Join all conversation rooms
      for (const conversation of conversations) {
        console.log(`🚪 [JOINING] Socket ${client.id} joining conversation room: ${conversation.id}`);
        
        // Join the room
        await client.join(conversation.id);
        
        // Verify the join was successful
        const isInRoom = client.rooms.has(conversation.id);
        console.log(`✅ [ROOM JOIN] Socket ${client.id} ${isInRoom ? 'successfully joined' : 'FAILED to join'} room ${conversation.id}`);

        // Add to tracking
        if (!this.conversationParticipants.has(conversation.id)) {
          this.conversationParticipants.set(conversation.id, new Set());
        }
        this.conversationParticipants.get(conversation.id)!.add(userId);
        
        console.log(`👥 [TRACKING] Added user ${userId} to conversation ${conversation.id} tracking`);
      }

      // Log final room state for this socket
      console.log('🏠 [FINAL ROOM STATE]', {
        socketId: client.id,
        userId,
        roomsJoined: Array.from(client.rooms),
        conversationsJoined: conversations.length,
      });

      this.logger.log(
        `User ${userId} joined ${conversations.length} conversation rooms`,
      );
    } catch (error) {
      console.error('❌ [ROOM MANAGEMENT] Error joining user conversations:', error);
      this.logger.error('Error joining user conversations:', error);
    }
  }

  private async broadcastUserStatus(
    userId: string,
    status: 'online' | 'offline',
  ) {
    // Get all conversations this user participates in
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
      },
    });

    // Broadcast status to all conversation rooms
    for (const conversation of conversations) {
      this.server.to(conversation.id).emit('user_status_changed', {
        userId,
        status,
        timestamp: new Date(),
      });
    }
  }

  private async sendPushNotifications(conversationId: string, message: any) {
    try {
      // Get all participants in the conversation except the sender
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!conversation) {
        this.logger.warn(
          `Conversation ${conversationId} not found for push notifications`,
        );
        return;
      }

      // Extract message data from event structure first
      const messageData = message.message || message; // Handle both structures
      
      // Filter participants who should receive push notifications
      const eligibleParticipants = conversation.participants.filter(
        (participant) => {
          // Don't send to message sender
          if (participant.userId === messageData.senderId) {
            return false;
          }

          // Use default notification settings since notificationSettings model doesn't exist
          // Default to true for push notifications for new messages
          const defaultPushNewMessages = true;
          if (!defaultPushNewMessages) {
            return false;
          }

          // Note: No device token filtering available (no DeviceToken model)
          // All participants are considered eligible for alternative notifications
          return true;
        },
      );

      if (eligibleParticipants.length === 0) {
        this.logger.log(
          `No eligible participants for push notifications in conversation ${conversationId}`,
        );
        return;
      }

      // Prepare notification payload
      const messageContent = messageData.content || '';
      
      const notificationPayload = {
        title: 'New Message',
        body:
          messageContent.length > 50
            ? `${messageContent.substring(0, 50)}...`
            : messageContent,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          conversationId: conversationId,
          messageId: messageData.id,
          senderId: messageData.senderId,
          url: `/user/messages?conversation=${conversationId}`,
        },
      };

      // Alternative notification approach (no device tokens available)
      const pushPromises = eligibleParticipants.map(async (participant) => {
        try {
          // Log notification attempt (alternative to push notifications)
          this.logger.log(
            `Would send push notification to user ${participant.userId} for message ${messageData.id} (no DeviceToken model available)`,
          );
          
          // Here you could implement WebSocket-based real-time notifications
          // or other alternative notification methods
          
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to process notification for user ${participant.userId}: ${errorMessage}`,
          );
        }
      });

      await Promise.allSettled(pushPromises);

      this.logger.log(
        `Push notification processing completed for conversation ${conversationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send push notifications for conversation ${conversationId}:`,
        error,
      );
    }
  }

  // Clean up old typing indicators (call this periodically)
  async cleanupTypingIndicators() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    await this.prisma.typingIndicator.deleteMany({
      where: {
        lastTypingAt: {
          lt: fiveMinutesAgo,
        },
      },
    });
  }

  // Personal room subscription methods for real-time notifications
  async subscribeUserToPersonalRoom(
    client: AuthenticatedSocket,
    userId: string,
  ) {
    const userRoom = `user:${userId}`;
    
    console.log('👤 [PERSONAL ROOM] Subscribing user to personal room');
    console.log('🔌 [SOCKET]', client.id);
    console.log('👤 [USER]', userId);
    console.log('🏠 [ROOM]', userRoom);
    
    await client.join(userRoom);
    
    // Verify the join was successful
    const isInPersonalRoom = client.rooms.has(userRoom);
    console.log(`✅ [PERSONAL ROOM] Socket ${client.id} ${isInPersonalRoom ? 'successfully joined' : 'FAILED to join'} personal room ${userRoom}`);
    
    this.logger.debug(
      `User ${userId} subscribed to personal room: ${userRoom}`,
    );
  }

  async unsubscribeUserFromPersonalRoom(
    client: AuthenticatedSocket,
    userId: string,
  ) {
    const userRoom = `user:${userId}`;
    await client.leave(userRoom);
    this.logger.debug(
      `User ${userId} unsubscribed from personal room: ${userRoom}`,
    );
  }

  // Community and post room subscriptions for social features
  @SubscribeMessage('join_community')
  async handleJoinCommunity(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { communityId: string },
  ) {
    if (!this.isAuthenticated(client)) {
      return;
    }

    const { communityId } = data;
    const userId = client.userId!;

    try {
      // Verify user is a member of this community
      const membership = await this.prisma.membership.findFirst({
        where: {
          communityId,
          userId,
        },
      });

      if (!membership) {
        client.emit('error', { message: 'Access denied to this community' });
        return;
      }

      const communityRoom = `community_${communityId}`;
      await client.join(communityRoom);

      client.emit('community_joined', { communityId });
      this.logger.log(`User ${userId} joined community room ${communityId}`);
    } catch (error) {
      this.handleSubscriptionError(client, error, 'join_community');
    }
  }

  @SubscribeMessage('leave_community')
  async handleLeaveCommunity(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { communityId: string },
  ) {
    if (!this.isAuthenticated(client)) {
      return;
    }

    try {
      const { communityId } = data;
      const userId = client.userId!;

      const communityRoom = `community_${communityId}`;
      await client.leave(communityRoom);

      client.emit('community_left', { communityId });
      this.logger.log(`User ${userId} left community room ${communityId}`);
    } catch (error) {
      this.handleSubscriptionError(client, error, 'leave_community');
    }
  }

  @SubscribeMessage('join_post')
  async handleJoinPost(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { postId: string },
  ) {
    if (!this.isAuthenticated(client)) {
      return;
    }

    const { postId } = data;
    const userId = client.userId!;

    try {
      // Verify post exists and user has access
      const post = await this.prisma.post.findFirst({
        where: {
          id: postId,
          room: {
            roomGroup: {
              community: {
                memberships: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
        },
      });

      if (!post) {
        client.emit('error', { message: 'Access denied to this post' });
        return;
      }

      const postRoom = `post_${postId}`;
      await client.join(postRoom);

      client.emit('post_joined', { postId });
      this.logger.log(`User ${userId} joined post room ${postId}`);
    } catch (error) {
      this.handleSubscriptionError(client, error, 'join_post');
    }
  }

  @SubscribeMessage('leave_post')
  async handleLeavePost(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { postId: string },
  ) {
    if (!this.isAuthenticated(client)) {
      return;
    }

    try {
      const { postId } = data;
      const userId = client.userId!;

      const postRoom = `post_${postId}`;
      await client.leave(postRoom);

      client.emit('post_left', { postId });
      this.logger.log(`User ${userId} left post room ${postId}`);
    } catch (error) {
      this.handleSubscriptionError(client, error, 'leave_post');
    }
  }

  // Utility method to get server instance for event broadcasting
  getServer(): Server {
    return this.server;
  }

  // Private helper method for connection limits and deduplication
  private async handleConnectionLimits(client: AuthenticatedSocket, userId: string) {
    const userSocketSet = this.userSockets.get(userId);
    
    if (userSocketSet && userSocketSet.size >= this.MAX_CONNECTIONS_PER_USER) {
      this.logger.warn(`User ${userId} exceeded connection limit (${this.MAX_CONNECTIONS_PER_USER})`);
      
      // Close oldest connections to make room for new one
      const socketsToClose = Array.from(userSocketSet).slice(0, userSocketSet.size - this.MAX_CONNECTIONS_PER_USER + 1);
      
      for (const socketId of socketsToClose) {
        const socketToClose = this.server.sockets.sockets.get(socketId);
        if (socketToClose) {
          socketToClose.emit('connection_limit_exceeded', {
            message: 'Connection closed due to too many concurrent connections',
            maxConnections: this.MAX_CONNECTIONS_PER_USER,
          });
          socketToClose.disconnect(true);
        }
        userSocketSet.delete(socketId);
      }
    }
  }

  // Private helper method for user connection cleanup
  private async cleanupUserConnection(userId: string, socketId: string) {
    try {
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.delete(socketId);

        // If no more sockets for this user, remove from tracking
        if (userSockets.size === 0) {
          this.userSockets.delete(userId);

          // Clean up conversation participants tracking
          for (const [conversationId, participants] of this.conversationParticipants.entries()) {
            participants.delete(userId);
            // Remove empty conversation sets
            if (participants.size === 0) {
              this.conversationParticipants.delete(conversationId);
            }
          }

          // Broadcast user offline status to their contacts
          await this.broadcastUserStatus(userId, 'offline');
        }
      }
    } catch (error) {
      this.logger.error(`Error in cleanupUserConnection for user ${userId}:`, error);
      throw error; // Re-throw to let handleDisconnect handle it
    }
  }

  // Enhanced error handling for message subscriptions
  private handleSubscriptionError(client: AuthenticatedSocket, error: any, action: string) {
    this.logger.error(`${action} error for client ${client.id}:`, error);
    
    // Send structured error response to client
    client.emit('subscription_error', {
      action,
      error: error.message || 'Unknown error',
      code: error.code || 'SUBSCRIPTION_ERROR',
      timestamp: new Date().toISOString(),
    });
    
    // If it's a critical error, disconnect the client
    if (error.name === 'DatabaseError' || error.code === 'ECONNRESET') {
      this.logger.warn(`Critical error detected, disconnecting client ${client.id}`);
      client.disconnect(true);
    }
  }
}
