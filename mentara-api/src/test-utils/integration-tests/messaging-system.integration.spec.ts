import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { DatabaseTestSetup } from '../database-test.setup';
import { TestDataGenerator } from '../enhanced-test-helpers';

/**
 * Messaging System Integration Tests
 * 
 * Comprehensive testing of the messaging system including conversations,
 * messages, reactions, read receipts, user blocking, and real-time features.
 */
describe('Messaging System Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

  // Test users
  let user1: any, user2: any, user3: any, moderatorUser: any;

  beforeAll(async () => {
    // Setup test database
    prisma = await DatabaseTestSetup.setupTestDatabase();

    moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Create test users
    await setupTestUsers();
  });

  afterEach(async () => {
    // Clean messaging data but keep users
    await cleanMessagingData();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  async function setupTestUsers() {
    user1 = await prisma.user.create({
      data: TestDataGenerator.createUser({
        id: 'msg-user-1',
        email: 'user1@messaging.com',
        firstName: 'Alice',
        lastName: 'Johnson',
      }),
    });

    user2 = await prisma.user.create({
      data: TestDataGenerator.createUser({
        id: 'msg-user-2', 
        email: 'user2@messaging.com',
        firstName: 'Bob',
        lastName: 'Smith',
      }),
    });

    user3 = await prisma.user.create({
      data: TestDataGenerator.createUser({
        id: 'msg-user-3',
        email: 'user3@messaging.com',
        firstName: 'Charlie',
        lastName: 'Brown',
      }),
    });

    moderatorUser = await prisma.user.create({
      data: TestDataGenerator.createUser({
        id: 'msg-moderator',
        email: 'moderator@messaging.com',
        firstName: 'Moderator',
        lastName: 'Admin',
        role: 'moderator',
      }),
    });
  }

  async function cleanMessagingData() {
    await prisma.typingIndicator.deleteMany();
    await prisma.messageReaction.deleteMany();
    await prisma.messageReadReceipt.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.userBlock.deleteMany();
  }

  describe('Direct Conversation Creation and Management', () => {
    it('should create direct conversation between two users', async () => {
      // Create direct conversation
      const conversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          isActive: true,
          participants: {
            create: [
              {
                userId: user1.id,
                role: 'MEMBER',
                isActive: true,
              },
              {
                userId: user2.id,
                role: 'MEMBER',
                isActive: true,
              },
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      // Verify conversation creation
      expect(conversation.type).toBe('DIRECT');
      expect(conversation.participants).toHaveLength(2);
      expect(conversation.participants.map(p => p.userId)).toContain(user1.id);
      expect(conversation.participants.map(p => p.userId)).toContain(user2.id);
      expect(conversation.isActive).toBe(true);
    });

    it('should create group conversation with multiple participants', async () => {
      // Create group conversation
      const groupConversation = await prisma.conversation.create({
        data: {
          type: 'GROUP',
          title: 'Support Group Chat',
          isActive: true,
          participants: {
            create: [
              {
                userId: user1.id,
                role: 'ADMIN',
                isActive: true,
              },
              {
                userId: user2.id,
                role: 'MEMBER',
                isActive: true,
              },
              {
                userId: user3.id,
                role: 'MEMBER',
                isActive: true,
              },
              {
                userId: moderatorUser.id,
                role: 'MODERATOR',
                isActive: true,
              },
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      // Verify group conversation
      expect(groupConversation.type).toBe('GROUP');
      expect(groupConversation.title).toBe('Support Group Chat');
      expect(groupConversation.participants).toHaveLength(4);
      
      const roles = groupConversation.participants.map(p => p.role);
      expect(roles).toContain('ADMIN');
      expect(roles).toContain('MODERATOR');
      expect(roles.filter(r => r === 'MEMBER')).toHaveLength(2);
    });

    it('should handle participant management in conversations', async () => {
      // Create initial conversation
      const conversation = await prisma.conversation.create({
        data: {
          type: 'GROUP',
          title: 'Dynamic Group',
          isActive: true,
          participants: {
            create: [
              {
                userId: user1.id,
                role: 'ADMIN',
                isActive: true,
              },
              {
                userId: user2.id,
                role: 'MEMBER',
                isActive: true,
              },
            ],
          },
        },
      });

      // Add new participant
      const newParticipant = await prisma.conversationParticipant.create({
        data: {
          conversationId: conversation.id,
          userId: user3.id,
          role: 'MEMBER',
          isActive: true,
        },
      });

      // Mute a participant
      await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: conversation.id,
            userId: user2.id,
          },
        },
        data: {
          isMuted: true,
        },
      });

      // Remove a participant (set inactive)
      await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: conversation.id,
            userId: user3.id,
          },
        },
        data: {
          isActive: false,
        },
      });

      // Verify participant changes
      const updatedConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      const activeParticipants = updatedConversation?.participants.filter(p => p.isActive);
      const mutedParticipants = updatedConversation?.participants.filter(p => p.isMuted);

      expect(updatedConversation?.participants).toHaveLength(3);
      expect(activeParticipants).toHaveLength(2);
      expect(mutedParticipants).toHaveLength(1);
    });
  });

  describe('Message Creation and Threading', () => {
    let testConversation: any;

    beforeEach(async () => {
      testConversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          isActive: true,
          participants: {
            create: [
              {
                userId: user1.id,
                role: 'MEMBER',
              },
              {
                userId: user2.id,
                role: 'MEMBER',
              },
            ],
          },
        },
      });
    });

    it('should create and thread messages correctly', async () => {
      // Create initial message
      const initialMessage = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user1.id,
          content: 'How are you feeling today?',
          messageType: 'TEXT',
        },
      });

      // Create reply to the message
      const replyMessage = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user2.id,
          content: 'I am feeling much better, thank you for asking!',
          messageType: 'TEXT',
          replyToId: initialMessage.id,
        },
      });

      // Create another reply to form a thread
      const secondReply = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user1.id,
          content: 'That is wonderful to hear!',
          messageType: 'TEXT',
          replyToId: initialMessage.id,
        },
      });

      // Update conversation last message time
      await prisma.conversation.update({
        where: { id: testConversation.id },
        data: { lastMessageAt: new Date() },
      });

      // Verify message threading
      const messageThread = await prisma.message.findUnique({
        where: { id: initialMessage.id },
        include: {
          replies: {
            include: {
              sender: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          replyTo: true,
        },
      });

      expect(messageThread?.replies).toHaveLength(2);
      expect(messageThread?.replies[0].content).toContain('feeling much better');
      expect(messageThread?.replies[1].content).toContain('wonderful to hear');
      expect(replyMessage.replyToId).toBe(initialMessage.id);
      expect(secondReply.replyToId).toBe(initialMessage.id);
    });

    it('should handle different message types', async () => {
      // Text message
      const textMessage = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user1.id,
          content: 'Hello world!',
          messageType: 'TEXT',
        },
      });

      // Image message
      const imageMessage = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user2.id,
          content: 'Check out this photo',
          messageType: 'IMAGE',
          attachmentUrl: 'https://example.com/image.jpg',
          attachmentName: 'photo.jpg',
          attachmentSize: 1024000,
        },
      });

      // File message
      const fileMessage = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user1.id,
          content: 'Here is the document you requested',
          messageType: 'FILE',
          attachmentUrl: 'https://example.com/document.pdf',
          attachmentName: 'therapy-plan.pdf',
          attachmentSize: 2048000,
        },
      });

      // System message
      const systemMessage = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user1.id,
          content: 'User joined the conversation',
          messageType: 'SYSTEM',
        },
      });

      // Verify different message types
      const messages = await prisma.message.findMany({
        where: { conversationId: testConversation.id },
        orderBy: { createdAt: 'asc' },
      });

      expect(messages).toHaveLength(4);
      expect(messages[0].messageType).toBe('TEXT');
      expect(messages[1].messageType).toBe('IMAGE');
      expect(messages[1].attachmentUrl).toBeTruthy();
      expect(messages[2].messageType).toBe('FILE');
      expect(messages[2].attachmentSize).toBe(2048000);
      expect(messages[3].messageType).toBe('SYSTEM');
    });

    it('should handle message editing and deletion', async () => {
      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user1.id,
          content: 'Original message content',
          messageType: 'TEXT',
        },
      });

      // Edit message
      const editedMessage = await prisma.message.update({
        where: { id: message.id },
        data: {
          content: 'Edited message content',
          isEdited: true,
          editedAt: new Date(),
        },
      });

      // Soft delete message
      const deletedMessage = await prisma.message.update({
        where: { id: message.id },
        data: {
          isDeleted: true,
          content: '[Message deleted]',
        },
      });

      expect(editedMessage.isEdited).toBe(true);
      expect(editedMessage.editedAt).toBeTruthy();
      expect(deletedMessage.isDeleted).toBe(true);
      expect(deletedMessage.content).toBe('[Message deleted]');
    });
  });

  describe('Message Reactions and Read Receipts', () => {
    let testConversation: any;
    let testMessage: any;

    beforeEach(async () => {
      testConversation = await prisma.conversation.create({
        data: {
          type: 'GROUP',
          title: 'Reaction Test Group',
          participants: {
            create: [
              { userId: user1.id, role: 'MEMBER' },
              { userId: user2.id, role: 'MEMBER' },
              { userId: user3.id, role: 'MEMBER' },
            ],
          },
        },
      });

      testMessage = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user1.id,
          content: 'Great news everyone!',
          messageType: 'TEXT',
        },
      });
    });

    it('should handle message reactions correctly', async () => {
      // Add reactions from different users
      const reaction1 = await prisma.messageReaction.create({
        data: {
          messageId: testMessage.id,
          userId: user2.id,
          emoji: '👍',
        },
      });

      const reaction2 = await prisma.messageReaction.create({
        data: {
          messageId: testMessage.id,
          userId: user3.id,
          emoji: '😊',
        },
      });

      // User2 adds another reaction
      const reaction3 = await prisma.messageReaction.create({
        data: {
          messageId: testMessage.id,
          userId: user2.id,
          emoji: '🎉',
        },
      });

      // Get message with reactions
      const messageWithReactions = await prisma.message.findUnique({
        where: { id: testMessage.id },
        include: {
          reactions: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      expect(messageWithReactions?.reactions).toHaveLength(3);
      expect(messageWithReactions?.reactions[0].emoji).toBe('👍');
      expect(messageWithReactions?.reactions[1].emoji).toBe('😊');
      expect(messageWithReactions?.reactions[2].emoji).toBe('🎉');

      // Verify user2 has two reactions
      const user2Reactions = messageWithReactions?.reactions.filter(r => r.userId === user2.id);
      expect(user2Reactions).toHaveLength(2);
    });

    it('should handle reaction removal', async () => {
      // Add reaction
      const reaction = await prisma.messageReaction.create({
        data: {
          messageId: testMessage.id,
          userId: user2.id,
          emoji: '👍',
        },
      });

      // Remove reaction
      await prisma.messageReaction.delete({
        where: { id: reaction.id },
      });

      // Verify reaction removed
      const messageWithReactions = await prisma.message.findUnique({
        where: { id: testMessage.id },
        include: {
          reactions: true,
        },
      });

      expect(messageWithReactions?.reactions).toHaveLength(0);
    });

    it('should track read receipts correctly', async () => {
      // Create read receipts for different users
      const readReceipt1 = await prisma.messageReadReceipt.create({
        data: {
          messageId: testMessage.id,
          userId: user2.id,
        },
      });

      const readReceipt2 = await prisma.messageReadReceipt.create({
        data: {
          messageId: testMessage.id,
          userId: user3.id,
        },
      });

      // Update participant last read times
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId: testConversation.id,
          userId: user2.id,
        },
        data: {
          lastReadAt: new Date(),
        },
      });

      // Get message with read receipts
      const messageWithReceipts = await prisma.message.findUnique({
        where: { id: testMessage.id },
        include: {
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
      });

      expect(messageWithReceipts?.readReceipts).toHaveLength(2);
      expect(messageWithReceipts?.readReceipts.map(r => r.userId)).toContain(user2.id);
      expect(messageWithReceipts?.readReceipts.map(r => r.userId)).toContain(user3.id);
    });
  });

  describe('User Blocking and Privacy', () => {
    it('should handle user blocking relationships', async () => {
      // User1 blocks User2
      const userBlock = await prisma.userBlock.create({
        data: {
          blockerId: user1.id,
          blockedId: user2.id,
          reason: 'Inappropriate messages',
        },
      });

      // Try to create conversation between blocked users
      const conversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          participants: {
            create: [
              { userId: user1.id, role: 'MEMBER' },
              { userId: user2.id, role: 'MEMBER' },
            ],
          },
        },
      });

      // This would normally be handled by application logic to prevent messaging
      // Here we just verify the block relationship exists
      const blockingRelationship = await prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: user1.id,
            blockedId: user2.id,
          },
        },
        include: {
          blocker: true,
          blocked: true,
        },
      });

      expect(blockingRelationship).toBeTruthy();
      expect(blockingRelationship?.reason).toBe('Inappropriate messages');
      expect(blockingRelationship?.blockerId).toBe(user1.id);
      expect(blockingRelationship?.blockedId).toBe(user2.id);
    });

    it('should handle mutual blocking', async () => {
      // User1 blocks User2
      await prisma.userBlock.create({
        data: {
          blockerId: user1.id,
          blockedId: user2.id,
          reason: 'Harassment',
        },
      });

      // User2 blocks User1
      await prisma.userBlock.create({
        data: {
          blockerId: user2.id,
          blockedId: user1.id,
          reason: 'Retaliation',
        },
      });

      // Check blocking relationships
      const user1Blocking = await prisma.user.findUnique({
        where: { id: user1.id },
        include: {
          blocking: {
            include: {
              blocked: true,
            },
          },
          blockedBy: {
            include: {
              blocker: true,
            },
          },
        },
      });

      expect(user1Blocking?.blocking).toHaveLength(1);
      expect(user1Blocking?.blockedBy).toHaveLength(1);
      expect(user1Blocking?.blocking[0].blockedId).toBe(user2.id);
      expect(user1Blocking?.blockedBy[0].blockerId).toBe(user2.id);
    });

    it('should handle unblocking users', async () => {
      // Create block
      const userBlock = await prisma.userBlock.create({
        data: {
          blockerId: user1.id,
          blockedId: user2.id,
          reason: 'Misunderstanding',
        },
      });

      // Remove block
      await prisma.userBlock.delete({
        where: { id: userBlock.id },
      });

      // Verify block removed
      const removedBlock = await prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: user1.id,
            blockedId: user2.id,
          },
        },
      });

      expect(removedBlock).toBeNull();
    });
  });

  describe('Real-time Features Simulation', () => {
    let testConversation: any;

    beforeEach(async () => {
      testConversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          participants: {
            create: [
              { userId: user1.id, role: 'MEMBER' },
              { userId: user2.id, role: 'MEMBER' },
            ],
          },
        },
      });
    });

    it('should handle typing indicators', async () => {
      // User starts typing
      const typingIndicator = await prisma.typingIndicator.create({
        data: {
          conversationId: testConversation.id,
          userId: user1.id,
          isTyping: true,
        },
      });

      // Update typing timestamp
      const updatedIndicator = await prisma.typingIndicator.update({
        where: { id: typingIndicator.id },
        data: {
          lastTypingAt: new Date(),
        },
      });

      // User stops typing
      await prisma.typingIndicator.update({
        where: { id: typingIndicator.id },
        data: {
          isTyping: false,
        },
      });

      // Get typing status
      const typingStatus = await prisma.typingIndicator.findUnique({
        where: {
          conversationId_userId: {
            conversationId: testConversation.id,
            userId: user1.id,
          },
        },
      });

      expect(typingStatus?.isTyping).toBe(false);
      expect(typingStatus?.lastTypingAt).toBeTruthy();
    });

    it('should handle conversation activity updates', async () => {
      const startTime = new Date();

      // Create message which should update conversation activity
      const message = await prisma.message.create({
        data: {
          conversationId: testConversation.id,
          senderId: user1.id,
          content: 'Active conversation!',
          messageType: 'TEXT',
        },
      });

      // Update conversation last message time
      const updatedConversation = await prisma.conversation.update({
        where: { id: testConversation.id },
        data: {
          lastMessageAt: message.createdAt,
        },
      });

      expect(updatedConversation.lastMessageAt).toBeTruthy();
      expect(new Date(updatedConversation.lastMessageAt!).getTime()).toBeGreaterThan(startTime.getTime());
    });
  });

  describe('Complex Messaging Workflows', () => {
    it('should handle complete messaging workflow', async () => {
      // 1. Create group conversation
      const groupConversation = await prisma.conversation.create({
        data: {
          type: 'GROUP',
          title: 'Therapy Support Group',
          isActive: true,
          participants: {
            create: [
              { userId: user1.id, role: 'ADMIN' },
              { userId: user2.id, role: 'MEMBER' },
              { userId: user3.id, role: 'MEMBER' },
              { userId: moderatorUser.id, role: 'MODERATOR' },
            ],
          },
        },
      });

      // 2. Create initial message
      const welcomeMessage = await prisma.message.create({
        data: {
          conversationId: groupConversation.id,
          senderId: user1.id,
          content: 'Welcome everyone to our support group!',
          messageType: 'TEXT',
        },
      });

      // 3. Add reactions
      await prisma.messageReaction.createMany({
        data: [
          { messageId: welcomeMessage.id, userId: user2.id, emoji: '👋' },
          { messageId: welcomeMessage.id, userId: user3.id, emoji: '😊' },
          { messageId: welcomeMessage.id, userId: moderatorUser.id, emoji: '💜' },
        ],
      });

      // 4. Create threaded responses
      const response1 = await prisma.message.create({
        data: {
          conversationId: groupConversation.id,
          senderId: user2.id,
          content: 'Thank you for creating this space!',
          messageType: 'TEXT',
          replyToId: welcomeMessage.id,
        },
      });

      const response2 = await prisma.message.create({
        data: {
          conversationId: groupConversation.id,
          senderId: user3.id,
          content: 'Looking forward to our discussions!',
          messageType: 'TEXT',
          replyToId: welcomeMessage.id,
        },
      });

      // 5. Add read receipts
      await prisma.messageReadReceipt.createMany({
        data: [
          { messageId: welcomeMessage.id, userId: user2.id },
          { messageId: welcomeMessage.id, userId: user3.id },
          { messageId: welcomeMessage.id, userId: moderatorUser.id },
          { messageId: response1.id, userId: user1.id },
          { messageId: response1.id, userId: user3.id },
          { messageId: response2.id, userId: user1.id },
          { messageId: response2.id, userId: user2.id },
        ],
      });

      // 6. Update conversation activity
      await prisma.conversation.update({
        where: { id: groupConversation.id },
        data: { lastMessageAt: new Date() },
      });

      // 7. Verify complete workflow
      const completeConversation = await prisma.conversation.findUnique({
        where: { id: groupConversation.id },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            include: {
              reactions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
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
                    },
                  },
                },
              },
              replies: {
                include: {
                  sender: {
                    select: {
                      id: true,
                      firstName: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      // Comprehensive assertions
      expect(completeConversation?.participants).toHaveLength(4);
      expect(completeConversation?.messages).toHaveLength(3);
      expect(completeConversation?.messages[0].reactions).toHaveLength(3);
      expect(completeConversation?.messages[0].replies).toHaveLength(2);
      expect(completeConversation?.messages[0].readReceipts).toHaveLength(3);
      expect(completeConversation?.lastMessageAt).toBeTruthy();
      
      // Verify role distribution
      const roles = completeConversation?.participants.map(p => p.role);
      expect(roles).toContain('ADMIN');
      expect(roles).toContain('MODERATOR');
      expect(roles.filter(r => r === 'MEMBER')).toHaveLength(2);
    });
  });
});