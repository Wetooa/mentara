import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';
import { ConversationType, MessageType, ParticipantRole } from '@prisma/client';
import {
  MessageReadEvent,
  ConversationCreatedEvent,
} from '../common/events/messaging-events';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';

describe('MessagingService', () => {
  let service: MessagingService;
  let prismaService: jest.Mocked<PrismaService>;
  let eventBusService: jest.Mocked<EventBusService>;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();
    const mockEventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: EventBusService,
          useValue: mockEventBus,
        },
      ],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
    prismaService = module.get(PrismaService);
    eventBusService = module.get(EventBusService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Conversation Management', () => {
    describe('createConversation', () => {
      const mockCreateConversationDto = {
        participantIds: [TEST_USER_IDS.THERAPIST],
        type: ConversationType.DIRECT,
        title: 'Direct Chat',
      };

      const mockCreatedConversation = {
        id: 'conversation-1',
        type: ConversationType.DIRECT,
        title: 'Direct Chat',
        participants: [
          {
            userId: TEST_USER_IDS.CLIENT,
            role: ParticipantRole.ADMIN,
            user: {
              id: TEST_USER_IDS.CLIENT,
              firstName: 'John',
              lastName: 'Doe',
              avatarUrl: 'avatar.jpg',
              role: 'client',
            },
          },
          {
            userId: TEST_USER_IDS.THERAPIST,
            role: ParticipantRole.MEMBER,
            user: {
              id: TEST_USER_IDS.THERAPIST,
              firstName: 'Dr. Jane',
              lastName: 'Smith',
              avatarUrl: 'therapist-avatar.jpg',
              role: 'therapist',
            },
          },
        ],
        messages: [],
      };

      it('should create a direct conversation successfully', async () => {
        jest
          .spyOn(service as any, 'findDirectConversation')
          .mockResolvedValue(null);
        (prismaService.conversation.create as jest.Mock).mockResolvedValue(
          mockCreatedConversation,
        );

        const result = await service.createConversation(
          TEST_USER_IDS.CLIENT,
          mockCreateConversationDto,
        );

        expect(result).toEqual(mockCreatedConversation);
        expect(prismaService.conversation.create).toHaveBeenCalledWith({
          data: {
            type: ConversationType.DIRECT,
            title: 'Direct Chat',
            participants: {
              create: [
                { userId: TEST_USER_IDS.CLIENT, role: ParticipantRole.ADMIN },
                {
                  userId: TEST_USER_IDS.THERAPIST,
                  role: ParticipantRole.MEMBER,
                },
              ],
            },
          },
          include: expect.objectContaining({
            participants: expect.any(Object),
            messages: expect.any(Object),
          }),
        });

        expect(eventBusService.emit).toHaveBeenCalledWith(
          expect.any(ConversationCreatedEvent),
        );
      });

      it('should return existing direct conversation if it already exists', async () => {
        const existingConversation = {
          ...mockCreatedConversation,
          id: 'existing-1',
        };
        jest
          .spyOn(service as any, 'findDirectConversation')
          .mockResolvedValue(existingConversation);

        const result = await service.createConversation(
          TEST_USER_IDS.CLIENT,
          mockCreateConversationDto,
        );

        expect(result).toEqual(existingConversation);
        expect(prismaService.conversation.create).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException for invalid direct conversation participants', async () => {
        const invalidDto = {
          ...mockCreateConversationDto,
          participantIds: [TEST_USER_IDS.THERAPIST, TEST_USER_IDS.ADMIN], // Too many participants
        };

        await expect(
          service.createConversation(TEST_USER_IDS.CLIENT, invalidDto),
        ).rejects.toThrow(BadRequestException);
      });

      it('should create group conversation with multiple participants', async () => {
        const groupDto = {
          participantIds: [TEST_USER_IDS.THERAPIST, TEST_USER_IDS.ADMIN],
          type: ConversationType.GROUP,
          title: 'Group Chat',
        };

        const groupConversation = {
          ...mockCreatedConversation,
          type: ConversationType.GROUP,
          title: 'Group Chat',
        };

        (prismaService.conversation.create as jest.Mock).mockResolvedValue(
          groupConversation,
        );

        const result = await service.createConversation(
          TEST_USER_IDS.CLIENT,
          groupDto,
        );

        expect(result).toEqual(groupConversation);
        expect(prismaService.conversation.create).toHaveBeenCalledWith({
          data: {
            type: ConversationType.GROUP,
            title: 'Group Chat',
            participants: {
              create: [
                { userId: TEST_USER_IDS.CLIENT, role: ParticipantRole.ADMIN },
                {
                  userId: TEST_USER_IDS.THERAPIST,
                  role: ParticipantRole.MEMBER,
                },
                { userId: TEST_USER_IDS.ADMIN, role: ParticipantRole.MEMBER },
              ],
            },
          },
          include: expect.any(Object),
        });
      });

      it('should emit ConversationCreatedEvent with correct data', async () => {
        jest
          .spyOn(service as any, 'findDirectConversation')
          .mockResolvedValue(null);
        (prismaService.conversation.create as jest.Mock).mockResolvedValue(
          mockCreatedConversation,
        );

        await service.createConversation(
          TEST_USER_IDS.CLIENT,
          mockCreateConversationDto,
        );

        expect(eventBusService.emit).toHaveBeenCalledWith(
          expect.objectContaining({
            conversationId: 'conversation-1',
            createdBy: TEST_USER_IDS.CLIENT,
            participantIds: [TEST_USER_IDS.CLIENT, TEST_USER_IDS.THERAPIST],
            conversationType: 'direct',
            title: 'Direct Chat',
            isPrivate: true,
          }),
        );
      });
    });

    describe('getUserConversations', () => {
      const mockConversations = [
        {
          id: 'conversation-1',
          type: ConversationType.DIRECT,
          lastMessageAt: new Date(),
          participants: [
            {
              userId: TEST_USER_IDS.CLIENT,
              user: {
                id: TEST_USER_IDS.CLIENT,
                firstName: 'John',
                lastName: 'Doe',
                avatarUrl: 'avatar.jpg',
                role: 'client',
              },
            },
          ],
          messages: [
            {
              id: 'message-1',
              content: 'Hello',
              sender: {
                id: TEST_USER_IDS.THERAPIST,
                firstName: 'Dr. Jane',
                lastName: 'Smith',
                avatarUrl: 'therapist-avatar.jpg',
              },
            },
          ],
          _count: {
            messages: 2, // Unread messages
          },
        },
      ];

      it('should return user conversations with pagination', async () => {
        (prismaService.conversation.findMany as jest.Mock).mockResolvedValue(
          mockConversations,
        );

        const result = await service.getUserConversations(
          TEST_USER_IDS.CLIENT,
          1,
          20,
        );

        expect(result).toEqual(mockConversations);
        expect(prismaService.conversation.findMany).toHaveBeenCalledWith({
          where: {
            participants: {
              some: {
                userId: TEST_USER_IDS.CLIENT,
                isActive: true,
              },
            },
            isActive: true,
          },
          include: expect.objectContaining({
            participants: expect.any(Object),
            messages: expect.any(Object),
            _count: expect.any(Object),
          }),
          orderBy: { lastMessageAt: 'desc' },
          skip: 0,
          take: 20,
        });
      });

      it('should handle pagination correctly', async () => {
        (prismaService.conversation.findMany as jest.Mock).mockResolvedValue(
          mockConversations,
        );

        await service.getUserConversations(TEST_USER_IDS.CLIENT, 3, 10);

        expect(prismaService.conversation.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 20, // (3-1) * 10
            take: 10,
          }),
        );
      });
    });
  });

  describe('Message Management', () => {
    describe('sendMessage', () => {
      const mockSendMessageDto = {
        content: 'Hello there!',
        messageType: MessageType.TEXT,
      };

      const mockCreatedMessage = {
        id: 'message-1',
        conversationId: 'conversation-1',
        senderId: TEST_USER_IDS.CLIENT,
        content: 'Hello there!',
        messageType: MessageType.TEXT,
        replyToId: null,
        attachmentUrl: null,
        attachmentName: null,
        attachmentSize: null,
        createdAt: new Date(),
        sender: {
          id: TEST_USER_IDS.CLIENT,
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: 'avatar.jpg',
        },
        replyTo: null,
        reactions: [],
      };

      const mockConversation = {
        id: 'conversation-1',
        participants: [
          { userId: TEST_USER_IDS.CLIENT },
          { userId: TEST_USER_IDS.THERAPIST },
        ],
      };

      it('should send message successfully', async () => {
        jest.spyOn(service as any, 'verifyParticipant').mockResolvedValue(true);
        (prismaService.message.create as jest.Mock).mockResolvedValue(
          mockCreatedMessage,
        );
        (prismaService.conversation.update as jest.Mock).mockResolvedValue({
          lastMessageAt: new Date(),
        });
        (prismaService.conversation.findUnique as jest.Mock).mockResolvedValue(
          mockConversation,
        );

        const result = await service.sendMessage(
          TEST_USER_IDS.CLIENT,
          'conversation-1',
          mockSendMessageDto,
        );

        expect(result).toEqual(mockCreatedMessage);
        expect(service['verifyParticipant']).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          'conversation-1',
        );
        expect(prismaService.message.create).toHaveBeenCalledWith({
          data: {
            conversationId: 'conversation-1',
            senderId: TEST_USER_IDS.CLIENT,
            content: 'Hello there!',
            messageType: MessageType.TEXT,
            replyToId: undefined,
            attachmentUrl: null,
            attachmentName: null,
            attachmentSize: null,
          },
          include: expect.any(Object),
        });
      });

      it('should update conversation lastMessageAt', async () => {
        jest.spyOn(service as any, 'verifyParticipant').mockResolvedValue(true);
        (prismaService.message.create as jest.Mock).mockResolvedValue(
          mockCreatedMessage,
        );
        (prismaService.conversation.update as jest.Mock).mockResolvedValue({
          lastMessageAt: new Date(),
        });
        (prismaService.conversation.findUnique as jest.Mock).mockResolvedValue(
          mockConversation,
        );

        await service.sendMessage(
          TEST_USER_IDS.CLIENT,
          'conversation-1',
          mockSendMessageDto,
        );

        expect(prismaService.conversation.update).toHaveBeenCalledWith({
          where: { id: 'conversation-1' },
          data: { lastMessageAt: expect.any(Date) },
        });
      });

      it('should emit MessageSentEvent', async () => {
        jest.spyOn(service as any, 'verifyParticipant').mockResolvedValue(true);
        (prismaService.message.create as jest.Mock).mockResolvedValue(
          mockCreatedMessage,
        );
        (prismaService.conversation.update as jest.Mock).mockResolvedValue({
          lastMessageAt: new Date(),
        });
        (prismaService.conversation.findUnique as jest.Mock).mockResolvedValue(
          mockConversation,
        );

        await service.sendMessage(
          TEST_USER_IDS.CLIENT,
          'conversation-1',
          mockSendMessageDto,
        );

        expect(eventBusService.emit).toHaveBeenCalledWith(
          expect.objectContaining({
            messageId: 'message-1',
            conversationId: 'conversation-1',
            senderId: TEST_USER_IDS.CLIENT,
            content: 'Hello there!',
            messageType: 'text',
            recipientIds: [TEST_USER_IDS.THERAPIST],
          }),
        );
      });

      it('should handle reply messages', async () => {
        const replyDto = {
          ...mockSendMessageDto,
          replyToId: 'original-message-id',
        };

        jest.spyOn(service as any, 'verifyParticipant').mockResolvedValue(true);
        (prismaService.message.create as jest.Mock).mockResolvedValue({
          ...mockCreatedMessage,
          replyToId: 'original-message-id',
        });
        (prismaService.conversation.update as jest.Mock).mockResolvedValue({
          lastMessageAt: new Date(),
        });
        (prismaService.conversation.findUnique as jest.Mock).mockResolvedValue(
          mockConversation,
        );

        await service.sendMessage(
          TEST_USER_IDS.CLIENT,
          'conversation-1',
          replyDto,
        );

        expect(prismaService.message.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            replyToId: 'original-message-id',
          }),
          include: expect.any(Object),
        });
      });

      it('should handle file attachments', async () => {
        const fileDto = {
          ...mockSendMessageDto,
          messageType: MessageType.FILE,
          attachmentUrl: 'https://storage.com/file.pdf',
          attachmentName: 'document.pdf',
          attachmentSize: 1024,
        };

        jest.spyOn(service as any, 'verifyParticipant').mockResolvedValue(true);
        (prismaService.message.create as jest.Mock).mockResolvedValue({
          ...mockCreatedMessage,
          messageType: MessageType.FILE,
          attachmentUrl: 'https://storage.com/file.pdf',
        });
        (prismaService.conversation.update as jest.Mock).mockResolvedValue({
          lastMessageAt: new Date(),
        });
        (prismaService.conversation.findUnique as jest.Mock).mockResolvedValue(
          mockConversation,
        );

        await service.sendMessage(
          TEST_USER_IDS.CLIENT,
          'conversation-1',
          fileDto,
        );

        expect(eventBusService.emit).toHaveBeenCalledWith(
          expect.objectContaining({
            messageType: 'file',
            fileAttachments: ['https://storage.com/file.pdf'],
          }),
        );
      });
    });

    describe('getConversationMessages', () => {
      const mockMessages = [
        {
          id: 'message-2',
          content: 'Second message',
          createdAt: new Date('2024-01-02'),
          sender: { firstName: 'Jane', lastName: 'Smith' },
          replyTo: null,
          reactions: [],
          readReceipts: [],
        },
        {
          id: 'message-1',
          content: 'First message',
          createdAt: new Date('2024-01-01'),
          sender: { firstName: 'John', lastName: 'Doe' },
          replyTo: null,
          reactions: [],
          readReceipts: [],
        },
      ];

      it('should return messages in chronological order', async () => {
        jest.spyOn(service as any, 'verifyParticipant').mockResolvedValue(true);
        (prismaService.message.findMany as jest.Mock).mockResolvedValue(
          mockMessages,
        );

        const result = await service.getConversationMessages(
          TEST_USER_IDS.CLIENT,
          'conversation-1',
          1,
          50,
        );

        // Should reverse the order to be chronological
        expect(result).toEqual(mockMessages.reverse());
        expect(service['verifyParticipant']).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          'conversation-1',
        );
      });

      it('should handle pagination', async () => {
        jest.spyOn(service as any, 'verifyParticipant').mockResolvedValue(true);
        (prismaService.message.findMany as jest.Mock).mockResolvedValue(
          mockMessages,
        );

        await service.getConversationMessages(
          TEST_USER_IDS.CLIENT,
          'conversation-1',
          2,
          25,
        );

        expect(prismaService.message.findMany).toHaveBeenCalledWith({
          where: {
            conversationId: 'conversation-1',
            isDeleted: false,
          },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
          skip: 25, // (2-1) * 25
          take: 25,
        });
      });
    });

    describe('updateMessage', () => {
      const mockMessage = {
        id: 'message-1',
        senderId: TEST_USER_IDS.CLIENT,
        isDeleted: false,
      };

      const mockUpdateDto = {
        content: 'Updated message content',
      };

      it('should update message successfully', async () => {
        const updatedMessage = {
          ...mockMessage,
          content: 'Updated message content',
          isEdited: true,
          editedAt: expect.any(Date),
          sender: { firstName: 'John', lastName: 'Doe' },
          reactions: [],
        };

        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(
          mockMessage,
        );
        (prismaService.message.update as jest.Mock).mockResolvedValue(
          updatedMessage,
        );

        const result = await service.updateMessage(
          TEST_USER_IDS.CLIENT,
          'message-1',
          mockUpdateDto,
        );

        expect(result).toEqual(updatedMessage);
        expect(prismaService.message.update).toHaveBeenCalledWith({
          where: { id: 'message-1' },
          data: {
            content: 'Updated message content',
            isEdited: true,
            editedAt: expect.any(Date),
          },
          include: expect.any(Object),
        });
      });

      it('should throw NotFoundException when message not found', async () => {
        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
          service.updateMessage(
            TEST_USER_IDS.CLIENT,
            'non-existent',
            mockUpdateDto,
          ),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException when user is not message sender', async () => {
        const otherUserMessage = {
          ...mockMessage,
          senderId: 'other-user-id',
        };

        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(
          otherUserMessage,
        );

        await expect(
          service.updateMessage(
            TEST_USER_IDS.CLIENT,
            'message-1',
            mockUpdateDto,
          ),
        ).rejects.toThrow(ForbiddenException);
      });

      it('should throw BadRequestException when message is deleted', async () => {
        const deletedMessage = {
          ...mockMessage,
          isDeleted: true,
        };

        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(
          deletedMessage,
        );

        await expect(
          service.updateMessage(
            TEST_USER_IDS.CLIENT,
            'message-1',
            mockUpdateDto,
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('deleteMessage', () => {
      const mockMessage = {
        id: 'message-1',
        senderId: TEST_USER_IDS.CLIENT,
      };

      it('should delete message successfully', async () => {
        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(
          mockMessage,
        );
        (prismaService.message.update as jest.Mock).mockResolvedValue({
          ...mockMessage,
          isDeleted: true,
        });

        const result = await service.deleteMessage(
          TEST_USER_IDS.CLIENT,
          'message-1',
        );

        expect(result).toEqual({ success: true });
        expect(prismaService.message.update).toHaveBeenCalledWith({
          where: { id: 'message-1' },
          data: { isDeleted: true },
        });
      });

      it('should throw NotFoundException when message not found', async () => {
        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
          service.deleteMessage(TEST_USER_IDS.CLIENT, 'non-existent'),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException when user is not message sender', async () => {
        const otherUserMessage = {
          ...mockMessage,
          senderId: 'other-user-id',
        };

        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(
          otherUserMessage,
        );

        await expect(
          service.deleteMessage(TEST_USER_IDS.CLIENT, 'message-1'),
        ).rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('Read Receipts', () => {
    describe('markMessageAsRead', () => {
      const mockMessage = {
        id: 'message-1',
        senderId: TEST_USER_IDS.THERAPIST,
        conversationId: 'conversation-1',
      };

      it('should mark message as read successfully', async () => {
        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(
          mockMessage,
        );
        jest.spyOn(service as any, 'verifyParticipant').mockResolvedValue(true);
        (
          prismaService.messageReadReceipt.upsert as jest.Mock
        ).mockResolvedValue({
          messageId: 'message-1',
          userId: TEST_USER_IDS.CLIENT,
          readAt: new Date(),
        });
        (
          prismaService.conversationParticipant.updateMany as jest.Mock
        ).mockResolvedValue({
          count: 1,
        });

        await service.markMessageAsRead(TEST_USER_IDS.CLIENT, 'message-1');

        expect(prismaService.messageReadReceipt.upsert).toHaveBeenCalledWith({
          where: {
            messageId_userId: {
              messageId: 'message-1',
              userId: TEST_USER_IDS.CLIENT,
            },
          },
          create: {
            messageId: 'message-1',
            userId: TEST_USER_IDS.CLIENT,
          },
          update: {
            readAt: expect.any(Date),
          },
        });

        expect(eventBusService.emit).toHaveBeenCalledWith(
          expect.any(MessageReadEvent),
        );
      });

      it('should not create read receipt for own messages', async () => {
        const ownMessage = {
          ...mockMessage,
          senderId: TEST_USER_IDS.CLIENT,
        };

        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(
          ownMessage,
        );

        await service.markMessageAsRead(TEST_USER_IDS.CLIENT, 'message-1');

        expect(prismaService.messageReadReceipt.upsert).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException when message not found', async () => {
        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
          service.markMessageAsRead(TEST_USER_IDS.CLIENT, 'non-existent'),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Message Reactions', () => {
    describe('addMessageReaction', () => {
      const mockMessage = {
        id: 'message-1',
        conversationId: 'conversation-1',
      };

      it('should add reaction successfully', async () => {
        const mockReaction = {
          id: 'reaction-1',
          messageId: 'message-1',
          userId: TEST_USER_IDS.CLIENT,
          emoji: '👍',
          user: {
            id: TEST_USER_IDS.CLIENT,
            firstName: 'John',
            lastName: 'Doe',
          },
        };

        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(
          mockMessage,
        );
        jest.spyOn(service as any, 'verifyParticipant').mockResolvedValue(true);
        (prismaService.messageReaction.upsert as jest.Mock).mockResolvedValue(
          mockReaction,
        );

        const result = await service.addMessageReaction(
          TEST_USER_IDS.CLIENT,
          'message-1',
          '👍',
        );

        expect(result).toEqual(mockReaction);
        expect(prismaService.messageReaction.upsert).toHaveBeenCalledWith({
          where: {
            messageId_userId_emoji: {
              messageId: 'message-1',
              userId: TEST_USER_IDS.CLIENT,
              emoji: '👍',
            },
          },
          create: {
            messageId: 'message-1',
            userId: TEST_USER_IDS.CLIENT,
            emoji: '👍',
          },
          update: {
            emoji: '👍',
          },
          include: expect.any(Object),
        });
      });

      it('should throw NotFoundException when message not found', async () => {
        (prismaService.message.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
          service.addMessageReaction(
            TEST_USER_IDS.CLIENT,
            'non-existent',
            '👍',
          ),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('removeMessageReaction', () => {
      it('should remove reaction successfully', async () => {
        (
          prismaService.messageReaction.deleteMany as jest.Mock
        ).mockResolvedValue({
          count: 1,
        });

        const result = await service.removeMessageReaction(
          TEST_USER_IDS.CLIENT,
          'message-1',
          '👍',
        );

        expect(result).toEqual({ success: true });
        expect(prismaService.messageReaction.deleteMany).toHaveBeenCalledWith({
          where: {
            messageId: 'message-1',
            userId: TEST_USER_IDS.CLIENT,
            emoji: '👍',
          },
        });
      });
    });
  });

  describe('User Blocking', () => {
    describe('blockUser', () => {
      it('should block user successfully', async () => {
        (prismaService.userBlock.upsert as jest.Mock).mockResolvedValue({
          id: 'block-1',
          blockerId: TEST_USER_IDS.CLIENT,
          blockedId: TEST_USER_IDS.THERAPIST,
          reason: 'Inappropriate behavior',
        });

        const result = await service.blockUser(
          TEST_USER_IDS.CLIENT,
          TEST_USER_IDS.THERAPIST,
          'Inappropriate behavior',
        );

        expect(result).toEqual({ success: true });
        expect(prismaService.userBlock.upsert).toHaveBeenCalledWith({
          where: {
            blockerId_blockedId: {
              blockerId: TEST_USER_IDS.CLIENT,
              blockedId: TEST_USER_IDS.THERAPIST,
            },
          },
          create: {
            blockerId: TEST_USER_IDS.CLIENT,
            blockedId: TEST_USER_IDS.THERAPIST,
            reason: 'Inappropriate behavior',
          },
          update: {
            reason: 'Inappropriate behavior',
          },
        });
      });

      it('should throw BadRequestException when trying to block self', async () => {
        await expect(
          service.blockUser(TEST_USER_IDS.CLIENT, TEST_USER_IDS.CLIENT),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('unblockUser', () => {
      it('should unblock user successfully', async () => {
        (prismaService.userBlock.deleteMany as jest.Mock).mockResolvedValue({
          count: 1,
        });

        const result = await service.unblockUser(
          TEST_USER_IDS.CLIENT,
          TEST_USER_IDS.THERAPIST,
        );

        expect(result).toEqual({ success: true });
        expect(prismaService.userBlock.deleteMany).toHaveBeenCalledWith({
          where: {
            blockerId: TEST_USER_IDS.CLIENT,
            blockedId: TEST_USER_IDS.THERAPIST,
          },
        });
      });
    });
  });

  describe('Helper Methods', () => {
    describe('findDirectConversation', () => {
      it('should find existing direct conversation', async () => {
        const mockConversation = {
          id: 'conversation-1',
          type: ConversationType.DIRECT,
          participants: [],
        };

        (prismaService.conversation.findFirst as jest.Mock).mockResolvedValue(
          mockConversation,
        );

        const result = await service['findDirectConversation'](
          TEST_USER_IDS.CLIENT,
          TEST_USER_IDS.THERAPIST,
        );

        expect(result).toEqual(mockConversation);
        expect(prismaService.conversation.findFirst).toHaveBeenCalledWith({
          where: {
            type: ConversationType.DIRECT,
            participants: {
              every: {
                userId: { in: [TEST_USER_IDS.CLIENT, TEST_USER_IDS.THERAPIST] },
              },
            },
          },
          include: expect.any(Object),
        });
      });
    });

    describe('verifyParticipant', () => {
      it('should return participant when valid and active', async () => {
        const mockParticipant = {
          id: 'participant-1',
          conversationId: 'conversation-1',
          userId: TEST_USER_IDS.CLIENT,
          isActive: true,
        };

        (
          prismaService.conversationParticipant.findUnique as jest.Mock
        ).mockResolvedValue(mockParticipant);

        const result = await service['verifyParticipant'](
          TEST_USER_IDS.CLIENT,
          'conversation-1',
        );

        expect(result).toEqual(mockParticipant);
      });

      it('should throw ForbiddenException when participant not found', async () => {
        (
          prismaService.conversationParticipant.findUnique as jest.Mock
        ).mockResolvedValue(null);

        await expect(
          service['verifyParticipant'](TEST_USER_IDS.CLIENT, 'conversation-1'),
        ).rejects.toThrow(ForbiddenException);
      });

      it('should throw ForbiddenException when participant is inactive', async () => {
        const inactiveParticipant = {
          id: 'participant-1',
          conversationId: 'conversation-1',
          userId: TEST_USER_IDS.CLIENT,
          isActive: false,
        };

        (
          prismaService.conversationParticipant.findUnique as jest.Mock
        ).mockResolvedValue(inactiveParticipant);

        await expect(
          service['verifyParticipant'](TEST_USER_IDS.CLIENT, 'conversation-1'),
        ).rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('Search Messages', () => {
    describe('searchMessages', () => {
      const mockSearchResults = [
        {
          id: 'message-1',
          content: 'Hello world',
          sender: {
            id: TEST_USER_IDS.CLIENT,
            firstName: 'John',
            lastName: 'Doe',
            avatarUrl: 'avatar.jpg',
          },
          conversation: {
            id: 'conversation-1',
            type: ConversationType.DIRECT,
            title: null,
          },
        },
      ];

      it('should search messages across all conversations', async () => {
        (prismaService.message.findMany as jest.Mock).mockResolvedValue(
          mockSearchResults,
        );

        const result = await service.searchMessages(
          TEST_USER_IDS.CLIENT,
          'hello',
          undefined,
          1,
          20,
        );

        expect(result).toEqual(mockSearchResults);
        expect(prismaService.message.findMany).toHaveBeenCalledWith({
          where: {
            content: {
              contains: 'hello',
              mode: 'insensitive',
            },
            isDeleted: false,
            conversation: {
              participants: {
                some: {
                  userId: TEST_USER_IDS.CLIENT,
                  isActive: true,
                },
              },
            },
          },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 20,
        });
      });

      it('should search messages within specific conversation', async () => {
        (prismaService.message.findMany as jest.Mock).mockResolvedValue(
          mockSearchResults,
        );

        await service.searchMessages(
          TEST_USER_IDS.CLIENT,
          'hello',
          'conversation-1',
          1,
          20,
        );

        expect(prismaService.message.findMany).toHaveBeenCalledWith({
          where: expect.objectContaining({
            conversationId: 'conversation-1',
          }),
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 20,
        });
      });

      it('should handle pagination in search', async () => {
        (prismaService.message.findMany as jest.Mock).mockResolvedValue(
          mockSearchResults,
        );

        await service.searchMessages(
          TEST_USER_IDS.CLIENT,
          'hello',
          undefined,
          2,
          10,
        );

        expect(prismaService.message.findMany).toHaveBeenCalledWith({
          where: expect.any(Object),
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
          skip: 10, // (2-1) * 10
          take: 10,
        });
      });
    });
  });
});
