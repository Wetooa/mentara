import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import type {
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
} from './types';
import { ConversationType, MessageType, ParticipantRole } from '@prisma/client';
import { EventBusService } from '../common/events/event-bus.service';
import {
  MessageSentEvent,
  MessageReadEvent,
  ConversationCreatedEvent,
} from '../common/events/messaging-events';
// Note: Encryption functionality removed to match Prisma schema
// The schema doesn't include encryption fields (encryptionIv, encryptionAuthTag, encryptionKeyId, isEncrypted)

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  // Conversation Management
  private mapConversationType(type: string): ConversationType {
    switch (type) {
      case 'direct':
        return ConversationType.DIRECT;
      case 'group':
        return ConversationType.GROUP;
      case 'therapy_session':
      case 'session':
        return ConversationType.SESSION;
      case 'support':
        return ConversationType.SUPPORT;
      default:
        return ConversationType.DIRECT;
    }
  }

  private mapMessageType(type: string | MessageType): MessageType {
    if (typeof type === 'string') {
      switch (type.toLowerCase()) {
        case 'text':
          return MessageType.TEXT;
        case 'image':
          return MessageType.IMAGE;
        case 'audio':
          return MessageType.AUDIO;
        case 'video':
          return MessageType.VIDEO;
        case 'system':
          return MessageType.SYSTEM;
        default:
          return MessageType.TEXT;
      }
    }
    return type;
  }

  async createConversation(
    userId: string,
    createConversationDto: CreateConversationDto,
  ) {
    const {
      participantIds,
      type: rawType = 'direct',
      title,
    } = createConversationDto;

    console.log(createConversationDto);

    const type = this.mapConversationType(rawType);

    // Validate conversation type and participants
    if (type === ConversationType.DIRECT && participantIds.length !== 1) {
      throw new BadRequestException(
        'Direct conversations must have exactly one other participant',
      );
    }

    // Check if direct conversation already exists
    if (type === ConversationType.DIRECT) {
      const existingConversation = await this.findDirectConversation(
        userId,
        participantIds[0],
      );
      if (existingConversation) {
        return existingConversation;
      }
    }

    // Create conversation with participants
    const conversation = await this.prisma.conversation.create({
      data: {
        type,
        title,
        participants: {
          create: [
            { userId, role: ParticipantRole.ADMIN },
            ...participantIds.map((participantId) => ({
              userId: participantId,
              role: ParticipantRole.MEMBER,
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Publish conversation created event
    await this.eventBus.emit(
      new ConversationCreatedEvent({
        conversationId: conversation.id,
        createdBy: userId,
        participantIds: [userId, ...participantIds],
        conversationType: type.toLowerCase() as
          | 'direct'
          | 'group'
          | 'support'
          | 'therapy',
        title: title || undefined,
        isPrivate: type === ConversationType.DIRECT,
      }),
    );

    return conversation;
  }

  async getUserConversations(userId: string, page = 1, limit = 20) {
    console.log('🔍 [MESSAGING SERVICE] getUserConversations called');
    console.log('📊 [PARAMETERS]', { userId, page, limit });

    const skip = (page - 1) * limit;

    try {
      console.log('🗃️ [DATABASE] Executing conversation query...');
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
        include: {
          participants: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            where: { isDeleted: false },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  isDeleted: false,
                  readReceipts: {
                    none: { userId },
                  },
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      });

      console.log(
        '✅ [DATABASE RESULT] Found conversations:',
        conversations.length,
      );
      console.log('📝 [CONVERSATION DETAILS]:');
      conversations.forEach((conv, index) => {
        console.log(
          `   ${index + 1}. ${conv.type} - "${conv.title || 'Untitled'}" (ID: ${conv.id})`,
        );
        console.log(
          `      Participants: ${conv.participants.length}, Messages: ${conv.messages.length}`,
        );
        if (conv.participants.length > 0) {
          const otherParticipants = conv.participants.filter(
            (p) => p.userId !== userId,
          );
          console.log(
            `      Other participants: ${otherParticipants.map((p) => `${p.user.firstName} ${p.user.lastName} (${p.user.role})`).join(', ')}`,
          );
        }
      });

      // Transform conversations to match frontend expectations
      // Frontend expects lastMessage, but backend returns messages array
      const transformedConversations = conversations.map((conv) => {
        const { messages, _count, ...rest } = conv;
        return {
          ...rest,
          lastMessage: messages.length > 0 ? messages[0] : null,
          unreadCount: _count.messages,
        };
      });

      console.log('🔄 [TRANSFORMATION] Conversations transformed with lastMessage field');

      return transformedConversations;
    } catch (error) {
      console.error('❌ [DATABASE ERROR] getUserConversations failed:', error);
      throw error;
    }
  }

  /**
   * Get recent communications for dashboard
   * Returns a simplified format optimized for the dashboard recent communications widget
   */
  async getRecentCommunications(userId: string, limit = 5) {
    console.log('📧 [MESSAGING SERVICE] getRecentCommunications called');
    console.log('📊 [PARAMETERS]', { userId, limit });

    try {
      // Get user's recent conversations with detailed information
      const conversations = await this.prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId,
              isActive: true,
            },
          },
          isActive: true,
          lastMessageAt: { not: null }, // Only conversations with messages
        },
        include: {
          participants: {
            where: { 
              userId: { not: userId }, // Get other participants only
              isActive: true 
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            where: { isDeleted: false },
            select: {
              id: true,
              content: true,
              createdAt: true,
              messageType: true,
              senderId: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  isDeleted: false,
                  readReceipts: {
                    none: { userId },
                  },
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
      });

      console.log('✅ [DATABASE RESULT] Found recent communications:', conversations.length);

      // Transform conversations to recent communications format
      const recentCommunications = conversations.map((conversation) => {
        const otherParticipant = conversation.participants[0]; // Get the other participant
        const lastMessage = conversation.messages[0];
        const unreadCount = conversation._count.messages;

        if (!otherParticipant) {
          console.log('⚠️ [WARNING] Conversation has no other participants:', conversation.id);
          return null;
        }

        return {
          id: otherParticipant.user.id,
          conversationId: conversation.id,
          name: `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`,
          role: otherParticipant.user.role,
          avatar: otherParticipant.user.avatarUrl || null,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            time: lastMessage.createdAt.toISOString(),
            isFromUser: lastMessage.senderId === userId,
            messageType: lastMessage.messageType,
          } : null,
          unreadCount,
          status: 'offline', // Default status, could be enhanced with real-time presence
          conversationType: conversation.type,
        };
      }).filter(Boolean); // Remove null entries

      console.log('📱 [FORMATTED RESULT] Recent communications formatted:', recentCommunications.length);

      return recentCommunications;
    } catch (error) {
      console.error('❌ [DATABASE ERROR] getRecentCommunications failed:', error);
      throw error;
    }
  }

  /**
   * Get a specific conversation by ID with participant details
   * Used for video call functionality to get recipient information
   */
  async getConversationById(userId: string, conversationId: string) {
    console.log('🔍 [MESSAGING SERVICE] getConversationById called');
    console.log('📊 [PARAMETERS]', { userId, conversationId });

    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: {
              userId,
              isActive: true,
            },
          },
          isActive: true,
        },
        include: {
          participants: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              messageType: true,
            },
          },
        },
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      console.log('✅ [DATABASE SUCCESS] Conversation found:', {
        id: conversation.id,
        type: conversation.type,
        participantCount: conversation.participants.length,
      });

      // Transform the data to match frontend expectations
      const result = {
        id: conversation.id,
        type: conversation.type.toLowerCase(),
        title: conversation.title,
        description: null, // Not in schema, set to null
        avatarUrl: null, // Not in schema, set to null
        isArchived: false, // Not in schema, default to false
        isMuted: false, // Not at conversation level, default to false
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        participants: conversation.participants.map(p => ({
          id: p.id,
          conversationId: p.conversationId,
          userId: p.userId,
          role: p.role.toLowerCase(),
          joinedAt: p.joinedAt.toISOString(),
          leftAt: null, // Not in schema, set to null
          isMuted: p.isMuted,
          user: {
            id: p.user.id,
            firstName: p.user.firstName,
            lastName: p.user.lastName,
            email: p.user.email,
            avatarUrl: p.user.avatarUrl,
            role: p.user.role.toLowerCase(),
          },
        })),
        lastMessage: conversation.messages[0] ? {
          id: conversation.messages[0].id,
          content: conversation.messages[0].content,
          createdAt: conversation.messages[0].createdAt.toISOString(),
          messageType: conversation.messages[0].messageType.toLowerCase(),
        } : undefined,
      };

      return result;
    } catch (error) {
      console.error('❌ [DATABASE ERROR] getConversationById failed:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch conversation');
    }
  }

  // Message Management
  async sendMessage(
    userId: string,
    conversationId: string,
    sendMessageDto: SendMessageDto,
    attachmentUrls: string[] = [],
    attachmentNames: string[] = [],
    attachmentSizes: number[] = [],
  ) {
    this.logger.debug(`Sending message from ${userId} to conversation ${conversationId}`);
    
    // Verify user is participant in conversation
    await this.verifyParticipant(userId, conversationId);

    const {
      content,
      messageType: rawMessageType,
      replyToId,
      attachmentUrl,
      attachmentName,
      attachmentSize,
    } = sendMessageDto;

    const messageType = this.mapMessageType(rawMessageType || 'text');

    // Verify conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: { role: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Note: Message encryption functionality removed to match Prisma schema
    // Messages are stored as plaintext as the schema doesn't support encryption fields

    this.logger.debug('Saving message to database...');
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content, // Store content as-is (no encryption)
        messageType,
        replyToId,
        // Use multiple attachment fields (schema only supports these)
        attachmentUrls:
          attachmentUrls.length > 0
            ? attachmentUrls
            : attachmentUrl
              ? [attachmentUrl]
              : [],
        attachmentNames:
          attachmentNames.length > 0
            ? attachmentNames
            : attachmentName
              ? [attachmentName]
              : [],
        attachmentSizes:
          attachmentSizes.length > 0
            ? attachmentSizes
            : attachmentSize
              ? [attachmentSize]
              : [],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    
    this.logger.debug(`Message ${message.id} saved successfully to conversation ${message.conversationId}`);

    // Update conversation lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Note: No encryption - content is stored and transmitted as plaintext
    const eventContent = content;

    const recipientIds =
      conversation?.participants
        .map((p) => p.userId)
        .filter((id) => id !== userId) || [];

    this.logger.debug(`Broadcasting message to ${recipientIds.length} recipients`);

    // Publish message sent event
    const messageEvent = new MessageSentEvent({
      messageId: message.id,
      conversationId,
      senderId: userId,
      content: eventContent, // Content transmitted as-is
      messageType: message.messageType.toLowerCase() as
        | 'text'
        | 'image'
        | 'file'
        | 'audio'
        | 'video'
        | 'system',
      sentAt: message.createdAt,
      recipientIds,
      replyToMessageId: message.replyToId || undefined,
      fileAttachments:
        message.attachmentUrls.length > 0
          ? message.attachmentUrls
          : undefined,
    });
    
    await this.eventBus.emit(messageEvent);
    this.logger.debug(`MessageSentEvent emitted for message ${message.id}`);

    // Return message as-is (no encryption)
    return message;
  }

  async getConversationMessages(
    userId: string,
    conversationId: string,
    page = 1,
    limit = 50,
  ) {
    // Verify user is participant in conversation
    await this.verifyParticipant(userId, conversationId);

    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        readReceipts: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Return messages as-is (no decryption needed)
    return messages.reverse(); // Return in chronological order
  }

  async updateMessage(
    userId: string,
    messageId: string,
    updateMessageDto: UpdateMessageDto,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit deleted message');
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: updateMessageDto.content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return updatedMessage;
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return { success: true };
  }

  // Read Receipts
  async markMessageAsRead(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Don't create read receipt for own messages
    if (message.senderId === userId) {
      return;
    }

    // Verify user is participant in conversation
    await this.verifyParticipant(userId, message.conversationId);

    await this.prisma.messageReadReceipt.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      create: {
        messageId,
        userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    // Update participant's lastReadAt
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId: message.conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // Publish message read event
    await this.eventBus.emit(
      new MessageReadEvent({
        messageId,
        readBy: userId,
        readAt: new Date(),
        conversationId: message.conversationId,
        messagesSinceLastRead: 1, // Could be enhanced to calculate actual count
      }),
    );
  }

  // Message Reactions
  async addMessageReaction(userId: string, messageId: string, emoji: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify user is participant in conversation
    await this.verifyParticipant(userId, message.conversationId);

    const reaction = await this.prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
      create: {
        messageId,
        userId,
        emoji,
      },
      update: {
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return reaction;
  }

  async removeMessageReaction(
    userId: string,
    messageId: string,
    emoji: string,
  ) {
    await this.prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId,
        emoji,
      },
    });

    return { success: true };
  }

  // User Blocking
  async blockUser(blockerId: string, blockedId: string, reason?: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }

    await this.prisma.userBlock.upsert({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
      create: {
        blockerId,
        blockedId,
        reason,
      },
      update: {
        reason,
      },
    });

    return { success: true };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.userBlock.deleteMany({
      where: {
        blockerId,
        blockedId,
      },
    });

    return { success: true };
  }

  // Helper Methods
  private async findDirectConversation(user1Id: string, user2Id: string) {
    return this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,
        participants: {
          every: {
            userId: { in: [user1Id, user2Id] },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  private async verifyParticipant(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant || !participant.isActive) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    return participant;
  }

  // Search Messages
  // Search messages by content (no encryption limitations)
  async searchMessages(
    userId: string,
    query: string,
    conversationId?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      AND: [
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          isDeleted: false,
        },
        {
          conversation: {
            participants: {
              some: {
                userId,
                isActive: true,
              },
            },
          },
        },
      ],
    };

    if (conversationId) {
      whereClause.conversationId = conversationId;
    }

    const messages = await this.prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        conversation: {
          select: {
            id: true,
            type: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Return search results
    return {
      messages,
      searchInfo: {
        query,
        totalResults: messages.length,
        note: 'Search performed on message content.',
      },
    };
  }
}
