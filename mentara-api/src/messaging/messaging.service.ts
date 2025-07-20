import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
} from 'mentara-commons';
import { ConversationType, MessageType, ParticipantRole } from '@prisma/client';
import { EventBusService } from '../common/events/event-bus.service';
import {
  MessageSentEvent,
  MessageReadEvent,
  ConversationCreatedEvent,
} from '../common/events/messaging-events';
import {
  MessageEncryptionService,
  EncryptedMessage,
} from './services/message-encryption.service';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly messageEncryption: MessageEncryptionService,
  ) {}

  // Conversation Management
  async createConversation(
    userId: string,
    createConversationDto: CreateConversationDto,
  ) {
    const {
      participantIds,
      type = ConversationType.DIRECT,
      title,
    } = createConversationDto;

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
    const skip = (page - 1) * limit;

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

    return conversations;
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
    // Verify user is participant in conversation
    await this.verifyParticipant(userId, conversationId);

    const {
      content,
      messageType = MessageType.TEXT,
      replyToId,
      attachmentUrl,
      attachmentName,
      attachmentSize,
    } = sendMessageDto;

    // Get conversation details to determine encryption type
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

    // Determine encryption type based on conversation participants
    const conversationType = this.messageEncryption.getConversationType(
      conversation.participants.map((p) => ({ role: p.user.role })),
    );

    // Encrypt message content for sensitive conversations
    let finalContent = content;
    let encryptionData: EncryptedMessage | null = null;

    if (messageType === MessageType.TEXT && content.trim().length > 0) {
      try {
        encryptionData = await this.messageEncryption.encryptMessage(
          content,
          conversationType,
        );
        finalContent = encryptionData.encryptedContent; // Store encrypted content
      } catch (error) {
        this.logger.error(
          'Message encryption failed - refusing to store plaintext:',
          error,
        );
        throw new InternalServerErrorException(
          'Message encryption failed - cannot proceed for security reasons',
        );
      }
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: finalContent, // Store encrypted content
        messageType,
        replyToId,
        // Keep backward compatibility with single attachment fields
        attachmentUrl: attachmentUrls[0] || attachmentUrl,
        attachmentName: attachmentNames[0] || attachmentName,
        attachmentSize: attachmentSizes[0] || attachmentSize,
        // Add new multiple attachment fields
        attachmentUrls,
        attachmentNames,
        attachmentSizes,
        // Store encryption metadata
        encryptionIv: encryptionData?.iv,
        encryptionAuthTag: encryptionData?.authTag,
        encryptionKeyId: encryptionData?.keyId,
        isEncrypted: !!encryptionData,
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

    // Update conversation lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // For encrypted messages, sanitize content in events for security
    let eventContent = content;
    if (message.isEncrypted && encryptionData) {
      // Events should NOT contain plaintext for encrypted messages
      eventContent = '[Encrypted Message]';
    }

    const recipientIds =
      conversation?.participants
        .map((p) => p.userId)
        .filter((id) => id !== userId) || [];

    // Publish message sent event
    await this.eventBus.emit(
      new MessageSentEvent({
        messageId: message.id,
        conversationId,
        senderId: userId,
        content: eventContent, // Use sanitized content for events
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
          attachmentUrls.length > 0
            ? attachmentUrls
            : message.attachmentUrl
              ? [message.attachmentUrl]
              : undefined,
        isEncrypted: message.isEncrypted,
      }),
    );

    // Return message with sanitized content for security
    return {
      ...message,
      content: eventContent, // Return sanitized content for encrypted messages
    };
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

    // Decrypt messages if they are encrypted
    const decryptedMessages = await Promise.all(
      messages.map(async (message) => {
        if (
          message.isEncrypted &&
          message.encryptionIv &&
          message.encryptionAuthTag &&
          message.encryptionKeyId
        ) {
          try {
            const encryptedMessage = {
              encryptedContent: message.content,
              iv: message.encryptionIv,
              authTag: message.encryptionAuthTag,
              keyId: message.encryptionKeyId,
            };

            const decrypted =
              await this.messageEncryption.decryptMessage(encryptedMessage);
            return {
              ...message,
              content: decrypted.content,
            };
          } catch (error) {
            this.logger.error(
              `Failed to decrypt message ${message.id}:`,
              error,
            );
            return {
              ...message,
              content: '[Message could not be decrypted]',
            };
          }
        }
        return message;
      }),
    );

    return decryptedMessages.reverse(); // Return in chronological order
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
  // NOTE: This search only works on non-encrypted messages for security reasons.
  // Encrypted messages cannot be searched by content and are excluded from results.
  async searchMessages(
    userId: string,
    query: string,
    conversationId?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      // Only search non-encrypted messages for security
      AND: [
        {
          OR: [
            {
              isEncrypted: false,
              content: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              isEncrypted: true,
              // For encrypted messages, only search in non-sensitive metadata
              messageType: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
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

    // Return results with metadata about search limitations
    return {
      messages,
      searchInfo: {
        query,
        totalResults: messages.length,
        note: 'Search results only include non-encrypted messages. Encrypted message content cannot be searched for security reasons.',
      },
    };
  }
}
