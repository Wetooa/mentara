import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { CreateConversationDto, SendMessageDto, UpdateMessageDto } from './dto/messaging.dto';
import { ConversationType, MessageType, ParticipantRole } from '@prisma/client';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  // Conversation Management
  async createConversation(userId: string, createConversationDto: CreateConversationDto) {
    const { participantIds, type = ConversationType.DIRECT, title } = createConversationDto;

    // Validate conversation type and participants
    if (type === ConversationType.DIRECT && participantIds.length !== 1) {
      throw new BadRequestException('Direct conversations must have exactly one other participant');
    }

    // Check if direct conversation already exists
    if (type === ConversationType.DIRECT) {
      const existingConversation = await this.findDirectConversation(userId, participantIds[0]);
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
  async sendMessage(userId: string, conversationId: string, sendMessageDto: SendMessageDto) {
    // Verify user is participant in conversation
    await this.verifyParticipant(userId, conversationId);

    const { content, messageType = MessageType.TEXT, replyToId, attachmentUrl, attachmentName, attachmentSize } = sendMessageDto;

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        messageType,
        replyToId,
        attachmentUrl,
        attachmentName,
        attachmentSize,
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

    return message;
  }

  async getConversationMessages(userId: string, conversationId: string, page = 1, limit = 50) {
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

    return messages.reverse(); // Return in chronological order
  }

  async updateMessage(userId: string, messageId: string, updateMessageDto: UpdateMessageDto) {
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

  async removeMessageReaction(userId: string, messageId: string, emoji: string) {
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
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return participant;
  }

  // Search Messages
  async searchMessages(userId: string, query: string, conversationId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      content: {
        contains: query,
        mode: 'insensitive',
      },
      isDeleted: false,
      conversation: {
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
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

    return messages;
  }
}