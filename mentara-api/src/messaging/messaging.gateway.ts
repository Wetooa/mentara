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
  JoinConversationDto,
  LeaveConversationDto,
  TypingIndicatorDto,
} from './dto/messaging.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
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

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from auth header or query
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify token with Clerk (you'll need to import and use your clerk client)
      // For now, we'll extract userId from token payload (implement proper verification)
      const userId = await this.verifyTokenAndGetUserId(token);

      if (!userId) {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        client.disconnect();
        return;
      }

      client.userId = userId;

      // Add socket to user's socket set
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user to their conversation rooms
      await this.joinUserConversations(client, userId);

      // Emit user online status to their contacts
      await this.broadcastUserStatus(userId, 'online');

      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.disconnect();
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
  private async verifyTokenAndGetUserId(token: string): Promise<string | null> {
    try {
      // TODO: Implement proper Clerk token verification
      // For now, return a mock user ID (replace with actual verification)
      // const verifiedToken = await clerkClient.verifyJwt(token);
      // return verifiedToken.sub;

      // Temporary mock implementation - replace with real Clerk verification
      return 'user_mock_id';
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      return null;
    }
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
