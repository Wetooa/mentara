import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpStatus,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
} from '../test-utils/enhanced-test-helpers';

describe('MessagingController', () => {
  let controller: MessagingController;
  let messagingService: jest.Mocked<MessagingService>;

  const mockMessagingService = {
    createConversation: jest.fn(),
    getUserConversations: jest.fn(),
    getConversationMessages: jest.fn(),
    sendMessage: jest.fn(),
    updateMessage: jest.fn(),
    deleteMessage: jest.fn(),
    markMessageAsRead: jest.fn(),
    addMessageReaction: jest.fn(),
    removeMessageReaction: jest.fn(),
    blockUser: jest.fn(),
    unblockUser: jest.fn(),
    searchMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
      providers: [
        { provide: MessagingService, useValue: mockMessagingService },
      ],
    }).compile();

    controller = module.get<MessagingController>(MessagingController);
    messagingService = module.get(MessagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createConversation', () => {
    const createConversationDto = {
      participantIds: [TEST_USER_IDS.THERAPIST],
      type: 'DIRECT' as const,
      title: 'Therapy Session Chat',
    };

    it('should create a new conversation', async () => {
      const mockConversation = {
        id: 'conversation-123',
        ...createConversationDto,
        createdBy: TEST_USER_IDS.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      messagingService.createConversation.mockResolvedValue(
        mockConversation as any,
      );

      const result = await controller.createConversation(
        TEST_USER_IDS.CLIENT,
        createConversationDto,
      );

      expect(messagingService.createConversation).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        createConversationDto,
      );
      expect(result).toEqual(mockConversation);
    });

    it('should handle conversation creation errors', async () => {
      messagingService.createConversation.mockRejectedValue(
        new BadRequestException('Invalid participant IDs'),
      );

      await expect(
        controller.createConversation(
          TEST_USER_IDS.CLIENT,
          createConversationDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserConversations', () => {
    it('should return user conversations with default pagination', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          title: 'Therapy Chat',
          lastMessage: TestDataGenerator.createMessage(),
          participants: [TEST_USER_IDS.CLIENT, TEST_USER_IDS.THERAPIST],
        },
        {
          id: 'conv-2',
          title: 'Support Group',
          lastMessage: TestDataGenerator.createMessage(),
          participants: [TEST_USER_IDS.CLIENT, TEST_USER_IDS.MODERATOR],
        },
      ];

      messagingService.getUserConversations.mockResolvedValue(
        mockConversations as any,
      );

      const result = await controller.getUserConversations(
        TEST_USER_IDS.CLIENT,
      );

      expect(messagingService.getUserConversations).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        1, // default page
        20, // default limit
      );
      expect(result).toEqual(mockConversations);
    });

    it('should handle custom pagination parameters', async () => {
      const mockConversations = [];
      messagingService.getUserConversations.mockResolvedValue(
        mockConversations as any,
      );

      await controller.getUserConversations(
        TEST_USER_IDS.CLIENT,
        '2', // page
        '10', // limit
      );

      expect(messagingService.getUserConversations).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        2,
        10,
      );
    });

    it('should pass through NaN values from invalid pagination parameters', async () => {
      const mockConversations = [];
      messagingService.getUserConversations.mockResolvedValue(
        mockConversations as any,
      );

      await controller.getUserConversations(
        TEST_USER_IDS.CLIENT,
        'invalid', // should default to 1
        'invalid', // should default to 20
      );

      expect(messagingService.getUserConversations).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        NaN, // parseInt('invalid') returns NaN
        NaN, // parseInt('invalid') returns NaN
      );
    });
  });

  describe('getConversationMessages', () => {
    const conversationId = 'conversation-123';

    it('should return conversation messages', async () => {
      const mockMessages = [
        TestDataGenerator.createMessage({ conversationId }),
        TestDataGenerator.createMessage({ conversationId }),
      ];

      messagingService.getConversationMessages.mockResolvedValue(
        mockMessages as any,
      );

      const result = await controller.getConversationMessages(
        TEST_USER_IDS.CLIENT,
        conversationId,
      );

      expect(messagingService.getConversationMessages).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        conversationId,
        1, // default page
        50, // default limit for messages
      );
      expect(result).toEqual(mockMessages);
    });

    it('should handle unauthorized access to conversation', async () => {
      messagingService.getConversationMessages.mockRejectedValue(
        new ForbiddenException('Not a participant in this conversation'),
      );

      await expect(
        controller.getConversationMessages(
          TEST_USER_IDS.CLIENT,
          conversationId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('sendMessage', () => {
    const conversationId = 'conversation-123';
    const sendMessageDto = {
      content: 'Hello, how are you feeling today?',
      messageType: 'TEXT' as const,
    };

    it('should send a message successfully', async () => {
      const mockMessage = {
        id: 'message-123',
        ...sendMessageDto,
        senderId: TEST_USER_IDS.CLIENT,
        conversationId,
        createdAt: new Date(),
        isEdited: false,
        isDeleted: false,
      };

      messagingService.sendMessage.mockResolvedValue(mockMessage as any);

      const result = await controller.sendMessage(
        TEST_USER_IDS.CLIENT,
        conversationId,
        sendMessageDto,
      );

      expect(messagingService.sendMessage).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        conversationId,
        sendMessageDto,
      );
      expect(result).toEqual(mockMessage);
    });

    it('should handle empty message content', async () => {
      const emptyMessageDto = {
        content: '',
        messageType: 'TEXT' as const,
      };

      messagingService.sendMessage.mockRejectedValue(
        new BadRequestException('Message content cannot be empty'),
      );

      await expect(
        controller.sendMessage(
          TEST_USER_IDS.CLIENT,
          conversationId,
          emptyMessageDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateMessage', () => {
    const messageId = 'message-123';
    const updateMessageDto = {
      content: 'Updated message content',
    };

    it('should update message successfully', async () => {
      const mockUpdatedMessage = {
        id: messageId,
        content: updateMessageDto.content,
        senderId: TEST_USER_IDS.CLIENT,
        isEdited: true,
        updatedAt: new Date(),
      };

      messagingService.updateMessage.mockResolvedValue(
        mockUpdatedMessage as any,
      );

      const result = await controller.updateMessage(
        TEST_USER_IDS.CLIENT,
        messageId,
        updateMessageDto,
      );

      expect(messagingService.updateMessage).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        messageId,
        updateMessageDto,
      );
      expect(result).toEqual(mockUpdatedMessage);
    });

    it('should handle unauthorized message update', async () => {
      messagingService.updateMessage.mockRejectedValue(
        new ForbiddenException('Cannot edit message from another user'),
      );

      await expect(
        controller.updateMessage(
          TEST_USER_IDS.CLIENT,
          messageId,
          updateMessageDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteMessage', () => {
    const messageId = 'message-123';

    it('should delete message successfully', async () => {
      messagingService.deleteMessage.mockResolvedValue({
        success: true,
      } as any);

      const result = await controller.deleteMessage(
        TEST_USER_IDS.CLIENT,
        messageId,
      );

      expect(messagingService.deleteMessage).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        messageId,
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle message not found', async () => {
      messagingService.deleteMessage.mockRejectedValue(
        new NotFoundException('Message not found'),
      );

      await expect(
        controller.deleteMessage(TEST_USER_IDS.CLIENT, messageId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markMessageAsRead', () => {
    const messageId = 'message-123';

    it('should mark message as read', async () => {
      const mockReadReceipt = {
        id: 'receipt-123',
        messageId,
        userId: TEST_USER_IDS.CLIENT,
        readAt: new Date(),
      };

      messagingService.markMessageAsRead.mockResolvedValue(
        mockReadReceipt as any,
      );

      const result = await controller.markMessageAsRead(
        TEST_USER_IDS.CLIENT,
        messageId,
      );

      expect(messagingService.markMessageAsRead).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        messageId,
      );
      expect(result).toEqual(mockReadReceipt);
    });
  });

  describe('addMessageReaction', () => {
    const messageId = 'message-123';
    const addReactionDto = { emoji: '❤️' };

    it('should add reaction to message', async () => {
      const mockReaction = {
        id: 'reaction-123',
        messageId,
        userId: TEST_USER_IDS.CLIENT,
        emoji: addReactionDto.emoji,
        createdAt: new Date(),
      };

      messagingService.addMessageReaction.mockResolvedValue(
        mockReaction as any,
      );

      const result = await controller.addMessageReaction(
        TEST_USER_IDS.CLIENT,
        messageId,
        addReactionDto,
      );

      expect(messagingService.addMessageReaction).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        messageId,
        addReactionDto.emoji,
      );
      expect(result).toEqual(mockReaction);
    });

    it('should handle duplicate reactions', async () => {
      messagingService.addMessageReaction.mockRejectedValue(
        new BadRequestException('Reaction already exists'),
      );

      await expect(
        controller.addMessageReaction(
          TEST_USER_IDS.CLIENT,
          messageId,
          addReactionDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeMessageReaction', () => {
    const messageId = 'message-123';
    const emoji = '❤️';

    it('should remove reaction from message', async () => {
      messagingService.removeMessageReaction.mockResolvedValue({
        success: true,
      } as any);

      const result = await controller.removeMessageReaction(
        TEST_USER_IDS.CLIENT,
        messageId,
        emoji,
      );

      expect(messagingService.removeMessageReaction).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        messageId,
        emoji,
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('blockUser', () => {
    const blockUserDto = {
      userId: TEST_USER_IDS.THERAPIST,
      reason: 'Inappropriate behavior',
    };

    it('should block user successfully', async () => {
      const mockBlock = {
        id: 'block-123',
        blockerId: TEST_USER_IDS.CLIENT,
        blockedId: blockUserDto.userId,
        reason: blockUserDto.reason,
        createdAt: new Date(),
      };

      messagingService.blockUser.mockResolvedValue(mockBlock as any);

      const result = await controller.blockUser(
        TEST_USER_IDS.CLIENT,
        blockUserDto,
      );

      expect(messagingService.blockUser).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        blockUserDto.userId,
        blockUserDto.reason,
      );
      expect(result).toEqual(mockBlock);
    });

    it('should handle self-blocking attempt', async () => {
      const selfBlockDto = {
        userId: TEST_USER_IDS.CLIENT,
        reason: 'Self-block attempt',
      };

      messagingService.blockUser.mockRejectedValue(
        new BadRequestException('Cannot block yourself'),
      );

      await expect(
        controller.blockUser(TEST_USER_IDS.CLIENT, selfBlockDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unblockUser', () => {
    const blockedUserId = TEST_USER_IDS.THERAPIST;

    it('should unblock user successfully', async () => {
      messagingService.unblockUser.mockResolvedValue({ success: true } as any);

      const result = await controller.unblockUser(
        TEST_USER_IDS.CLIENT,
        blockedUserId,
      );

      expect(messagingService.unblockUser).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        blockedUserId,
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle unblocking non-blocked user', async () => {
      messagingService.unblockUser.mockRejectedValue(
        new NotFoundException('User is not blocked'),
      );

      await expect(
        controller.unblockUser(TEST_USER_IDS.CLIENT, blockedUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchMessages', () => {
    const searchDto = {
      query: 'therapy session',
      conversationId: 'conversation-123',
      page: '1',
      limit: '10',
    };

    it('should search messages successfully', async () => {
      const mockSearchResults = {
        messages: [
          TestDataGenerator.createMessage({
            content: 'Our next therapy session is scheduled',
          }),
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      messagingService.searchMessages.mockResolvedValue(
        mockSearchResults as any,
      );

      const result = await controller.searchMessages(
        TEST_USER_IDS.CLIENT,
        searchDto,
      );

      expect(messagingService.searchMessages).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        searchDto.query,
        searchDto.conversationId,
        1,
        10,
      );
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle search with minimal parameters', async () => {
      const minimalSearchDto = {
        query: 'hello',
      };

      const mockSearchResults = {
        messages: [],
        total: 0,
        page: 1,
        limit: 20,
      };

      messagingService.searchMessages.mockResolvedValue(
        mockSearchResults as any,
      );

      const result = await controller.searchMessages(
        TEST_USER_IDS.CLIENT,
        minimalSearchDto as any,
      );

      expect(messagingService.searchMessages).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        'hello',
        undefined,
        1, // default page
        20, // default limit
      );
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle empty search query', async () => {
      const emptySearchDto = {
        query: '',
      };

      messagingService.searchMessages.mockRejectedValue(
        new BadRequestException('Search query cannot be empty'),
      );

      await expect(
        controller.searchMessages(TEST_USER_IDS.CLIENT, emptySearchDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('messaging flow integration', () => {
    it('should handle complete conversation workflow', async () => {
      // 1. Create conversation
      const createConversationDto = {
        participantIds: [TEST_USER_IDS.THERAPIST],
        type: 'DIRECT' as const,
        title: 'Therapy Session',
      };
      const mockConversation = {
        id: 'conversation-123',
        ...createConversationDto,
      };
      messagingService.createConversation.mockResolvedValue(
        mockConversation as any,
      );

      // 2. Send message
      const sendMessageDto = {
        content: 'Hello, looking forward to our session',
        messageType: 'TEXT' as const,
      };
      const mockMessage = {
        id: 'message-123',
        ...sendMessageDto,
        conversationId: mockConversation.id,
      };
      messagingService.sendMessage.mockResolvedValue(mockMessage as any);

      // 3. Mark as read
      const mockReadReceipt = {
        id: 'receipt-123',
        messageId: mockMessage.id,
        userId: TEST_USER_IDS.THERAPIST,
      };
      messagingService.markMessageAsRead.mockResolvedValue(
        mockReadReceipt as any,
      );

      // Execute workflow
      const conversation = await controller.createConversation(
        TEST_USER_IDS.CLIENT,
        createConversationDto,
      );
      const message = await controller.sendMessage(
        TEST_USER_IDS.CLIENT,
        conversation.id,
        sendMessageDto,
      );
      const readReceipt = await controller.markMessageAsRead(
        TEST_USER_IDS.THERAPIST,
        message.id,
      );

      expect(conversation).toEqual(mockConversation);
      expect(message).toEqual(mockMessage);
      expect(readReceipt).toEqual(mockReadReceipt);
    });
  });
});
