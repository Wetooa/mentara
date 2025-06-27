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
import { Logger, UseGuards } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  WebSocketAuthService,
  AuthenticatedUser,
} from './services/websocket-auth.service';
import {
  JoinConversationDto,
  LeaveConversationDto,
  TypingIndicatorDto,
} from './dto/messaging.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  isAuthenticated?: boolean;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messaging',
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socket IDs
  private conversationParticipants = new Map<string, Set<string>>(); // conversationId -> Set of user IDs

  constructor(
    private readonly prisma: PrismaService,
    private readonly webSocketAuth: WebSocketAuthService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`New WebSocket connection attempt: ${client.id}`);

      // Authenticate the socket connection using the new auth service
      const authResult = await this.webSocketAuth.authenticateSocket(client);

      if (!authResult) {
        this.logger.warn(`Client ${client.id} authentication failed`);
        client.emit('auth_error', {
          message: 'Authentication failed. Please provide a valid token.',
          code: 'AUTH_FAILED',
        });
        client.disconnect(true);
        return;
      }

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
        select: { id: true, role: true, isActive: true },
      });

      if (!user) {
        this.logger.warn(`User ${authResult.userId} not found or inactive`);
        client.emit('auth_error', {
          message: 'User account not found or inactive',
          code: 'USER_NOT_FOUND',
        });
        client.disconnect(true);
        return;
      }

      // Add socket to user's socket set
      if (!this.userSockets.has(authResult.userId)) {
        this.userSockets.set(authResult.userId, new Set());
      }
      this.userSockets.get(authResult.userId)!.add(client.id);

      // Join user to their conversation rooms
      await this.joinUserConversations(client, authResult.userId);

      // Notify successful connection
      client.emit('authenticated', {
        userId: authResult.userId,
        role: user.role,
        message: 'Successfully authenticated and connected',
        timestamp: new Date().toISOString(),
      });

      // Emit user online status to their contacts
      await this.broadcastUserStatus(authResult.userId, 'online');

      this.logger.log(
        `User ${authResult.userId} successfully authenticated and connected with socket ${client.id}`,
      );
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.emit('connection_error', {
        message: 'Internal server error during connection',
        code: 'INTERNAL_ERROR',
      });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.userSockets.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);

        // If no more sockets for this user, mark them as offline
        if (userSockets.size === 0) {
          this.userSockets.delete(client.userId);
          await this.broadcastUserStatus(client.userId, 'offline');
        }
      }

      this.logger.log(`User ${client.userId} disconnected socket ${client.id}`);
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

      // Verify user is participant in conversation
      const participant = await this.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant || !participant.isActive) {
        client.emit('error', {
          message: 'Not authorized to join this conversation',
        });
        return;
      }

      // Join socket to conversation room
      client.join(conversationId);

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
      this.logger.error('Error joining conversation:', error);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: LeaveConversationDto,
  ) {
    // Authentication guard
    if (!this.isAuthenticated(client)) {
      return;
    }

    const { conversationId } = data;
    const userId = client.userId!;

    client.leave(conversationId);

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

    const { conversationId, isTyping = true } = data;
    const userId = client.userId!;

    // Update typing indicator in database (with short TTL)
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
          isTyping: true,
        },
        update: {
          isTyping: true,
          lastTypingAt: new Date(),
        },
      });
    } else {
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
  }

  // Broadcast new message to conversation participants
  async broadcastMessage(
    conversationId: string,
    message: any,
    senderId: string,
  ) {
    this.server.to(conversationId).emit('new_message', message);

    // Send push notification to offline users (implement as needed)
    await this.sendPushNotifications(conversationId, message, senderId);
  }

  // Broadcast message update (edit/delete)
  async broadcastMessageUpdate(
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
  async broadcastReadReceipt(
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
  async broadcastReaction(
    conversationId: string,
    messageId: string,
    reaction: any,
  ) {
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
      // Get all active conversations for the user
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

      // Join all conversation rooms
      for (const conversation of conversations) {
        client.join(conversation.id);

        // Add to tracking
        if (!this.conversationParticipants.has(conversation.id)) {
          this.conversationParticipants.set(conversation.id, new Set());
        }
        this.conversationParticipants.get(conversation.id)!.add(userId);
      }

      this.logger.log(
        `User ${userId} joined ${conversations.length} conversation rooms`,
      );
    } catch (error) {
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

  private async sendPushNotifications(
    conversationId: string,
    message: any,
    senderId: string,
  ) {
    // TODO: Implement push notifications for offline users
    // This could integrate with FCM, APNS, or other push notification services
    this.logger.log(
      `TODO: Send push notification for message ${message.id} in conversation ${conversationId}`,
    );
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
}
