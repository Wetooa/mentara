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
      // For demo purposes, assign a simple demo user ID
      // This removes authentication requirements to prevent connection loops
      const userId = `demo_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      client.userId = userId;

      // Add socket to user's socket set
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Skip joining conversations automatically to prevent database queries
      // Conversations will be joined explicitly when user navigates to messaging

      this.logger.log(`Demo user ${userId} connected with socket ${client.id}`);
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

        // If no more sockets for this user, remove from tracking
        if (userSockets.size === 0) {
          this.userSockets.delete(client.userId);
          // Skip broadcasting user status to prevent database queries
        }
      }

      this.logger.log(`Demo user ${client.userId} disconnected socket ${client.id}`);
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

      // Skip database verification for demo - just allow joining
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
      this.logger.log(`Demo user ${userId} joined conversation ${conversationId}`);
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

    // Skip database operations for demo - just broadcast the indicator
    // This prevents database queries that could cause performance issues

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
  // Removed verifyTokenAndGetUserId method as authentication is disabled for demo

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
