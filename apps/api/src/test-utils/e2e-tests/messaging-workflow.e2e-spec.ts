import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../providers/prisma-client.provider';
import { DatabaseTestSetup } from '../database-test.setup';
import { ConversationType } from '@prisma/client';

describe('Messaging Workflow E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;
  let clientId: string;
  let therapistId: string;
  let conversationId: string;

  beforeAll(async () => {
    // Setup test database
    prisma = await DatabaseTestSetup.setupTestDatabase();

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Setup test data
    await setupTestUsers();
  });

  afterEach(async () => {
    await DatabaseTestSetup.cleanupDatabase();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  async function setupTestUsers() {
    // Create client
    const client = await prisma.user.create({
      data: {
        id: 'msg-client-123',
        email: 'msg.client@test.com',
        firstName: 'Messaging',
        lastName: 'Client',
        role: 'client',
      },
    });
    clientId = client.id;

    // Create therapist
    const therapist = await prisma.user.create({
      data: {
        id: 'msg-therapist-123',
        email: 'msg.therapist@test.com',
        firstName: 'Messaging',
        lastName: 'Therapist',
        role: 'therapist',
      },
    });
    therapistId = therapist.id;
  }

  describe('Complete Messaging Flow', () => {
    it('should complete full messaging workflow from conversation creation to file sharing', async () => {
      // Step 1: Client initiates conversation with therapist
      const conversationData = {
        participantIds: [therapistId],
        type: ConversationType.DIRECT,
        title: 'Session Discussion',
      };

      const conversationResponse = await request(app.getHttpServer())
        .post('/messaging/conversations')
        .set('x-user-id', clientId)
        .send(conversationData)
        .expect(201);

      expect(conversationResponse.body.success).toBe(true);
      conversationId = conversationResponse.body.data.id;

      // Step 2: Client sends initial message
      const initialMessageData = {
        content:
          'Hi Dr. Therapist, I wanted to follow up on our last session about anxiety management techniques.',
        messageType: 'TEXT',
      };

      const initialMessageResponse = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send(initialMessageData)
        .expect(201);

      expect(initialMessageResponse.body.success).toBe(true);
      const firstMessageId = initialMessageResponse.body.data.id;

      // Step 3: Therapist reads and responds
      await request(app.getHttpServer())
        .post(`/messaging/messages/${firstMessageId}/read`)
        .set('x-user-id', therapistId)
        .expect(200);

      const therapistResponseData = {
        content:
          "Hello! I'm glad you're following up. How have the breathing exercises been working for you?",
        messageType: 'TEXT',
      };

      const therapistResponse = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', therapistId)
        .send(therapistResponseData)
        .expect(201);

      expect(therapistResponse.body.success).toBe(true);
      const therapistMessageId = therapistResponse.body.data.id;

      // Step 4: Client responds with detailed update
      const clientUpdateData = {
        content:
          "The breathing exercises have been really helpful! I've been practicing them daily. I also wanted to share my anxiety journal entries with you.",
        messageType: 'TEXT',
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send(clientUpdateData)
        .expect(201);

      // Step 5: Client shares a file (simulated)
      const fileMessageData = {
        content: 'anxiety-journal-week1.pdf',
        messageType: 'FILE',
        metadata: JSON.stringify({
          fileName: 'anxiety-journal-week1.pdf',
          fileSize: 2048,
          mimeType: 'application/pdf',
          uploadUrl:
            'https://storage.example.com/files/anxiety-journal-week1.pdf',
        }),
      };

      const fileMessageResponse = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send(fileMessageData)
        .expect(201);

      expect(fileMessageResponse.body.data.messageType).toBe('FILE');

      // Step 6: Therapist acknowledges and provides feedback
      await request(app.getHttpServer())
        .post(`/messaging/messages/${therapistMessageId}/read`)
        .set('x-user-id', clientId)
        .expect(200);

      const feedbackData = {
        content:
          "Thank you for sharing your journal entries. I can see great progress in your self-awareness. Let's discuss this more in our next session.",
        messageType: 'TEXT',
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', therapistId)
        .send(feedbackData)
        .expect(201);

      // Step 7: Retrieve conversation history
      const historyResponse = await request(app.getHttpServer())
        .get(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .expect(200);

      expect(historyResponse.body.data).toHaveLength(5);
      expect(
        historyResponse.body.data.some((msg) => msg.messageType === 'FILE'),
      ).toBe(true);

      // Step 8: Client edits a recent message
      const latestTextMessage = historyResponse.body.data.find(
        (msg) => msg.senderId === clientId && msg.messageType === 'TEXT',
      );

      if (latestTextMessage) {
        const editData = {
          content:
            "The breathing exercises have been really helpful! I've been practicing them twice daily. I also wanted to share my anxiety journal entries with you.",
        };

        await request(app.getHttpServer())
          .put(`/messaging/messages/${latestTextMessage.id}`)
          .set('x-user-id', clientId)
          .send(editData)
          .expect(200);
      }

      // Step 9: Verify final conversation state
      const finalConversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            include: {
              readReceipts: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          participants: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      expect((finalConversation as any)?.messages).toHaveLength(5);
      expect((finalConversation as any)?.participants).toHaveLength(2);
      expect(
        (finalConversation as any)?.messages.some(
          (msg: any) => msg.messageType === 'FILE',
        ),
      ).toBe(true);
      expect(
        (finalConversation as any)?.messages.some(
          (msg: any) => msg.isEdited === true,
        ),
      ).toBe(true);
    });

    it('should handle group conversation workflow', async () => {
      // Create additional users for group conversation
      const moderator = await prisma.user.create({
        data: {
          id: 'msg-moderator-123',
          email: 'msg.moderator@test.com',
          firstName: 'Group',
          lastName: 'Moderator',
          role: 'moderator',
        },
      });

      const anotherClient = await prisma.user.create({
        data: {
          id: 'msg-client2-123',
          email: 'msg.client2@test.com',
          firstName: 'Another',
          lastName: 'Client',
          role: 'client',
        },
      });

      // Step 1: Moderator creates group conversation
      const groupConversationData = {
        participantIds: [clientId, anotherClient.id, therapistId],
        isGroup: true,
        title: 'Anxiety Support Group Session',
        description: 'Weekly group discussion for anxiety management',
      };

      const groupResponse = await request(app.getHttpServer())
        .post('/messaging/conversations')
        .set('x-user-id', moderator.id)
        .send(groupConversationData)
        .expect(201);

      const groupConversationId = groupResponse.body.data.id;

      // Step 2: Moderator starts discussion
      const openingMessageData = {
        content:
          "Welcome everyone to our weekly anxiety support group. Let's start by sharing how everyone's week went.",
        messageType: 'TEXT',
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${groupConversationId}/messages`)
        .set('x-user-id', moderator.id)
        .send(openingMessageData)
        .expect(201);

      // Step 3: Clients participate in discussion
      const client1ResponseData = {
        content:
          'Thanks for hosting this. I had a challenging week but used the breathing techniques we discussed.',
        messageType: 'TEXT',
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${groupConversationId}/messages`)
        .set('x-user-id', clientId)
        .send(client1ResponseData)
        .expect(201);

      const client2ResponseData = {
        content:
          "I'm still struggling with panic attacks. The techniques help but I need more practice.",
        messageType: 'TEXT',
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${groupConversationId}/messages`)
        .set('x-user-id', anotherClient.id)
        .send(client2ResponseData)
        .expect(201);

      // Step 4: Therapist provides professional input
      const therapistAdviceData = {
        content:
          "It's normal to need time to master these techniques. Remember, progress isn't always linear. Let's practice together.",
        messageType: 'TEXT',
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${groupConversationId}/messages`)
        .set('x-user-id', therapistId)
        .send(therapistAdviceData)
        .expect(201);

      // Step 5: Verify group conversation
      const groupMessages = await request(app.getHttpServer())
        .get(`/messaging/conversations/${groupConversationId}/messages`)
        .set('x-user-id', clientId)
        .expect(200);

      expect(groupMessages.body.data).toHaveLength(4);

      // Verify different participants contributed
      const senderIds = groupMessages.body.data.map((msg) => msg.senderId);
      expect(new Set(senderIds).size).toBe(4); // All 4 participants sent messages
    });
  });

  describe('Real-time Messaging Features', () => {
    beforeEach(async () => {
      // Create a conversation for real-time tests
      const conversation = await prisma.conversation.create({
        data: {
          id: 'realtime-conversation',
          type: ConversationType.DIRECT,
        },
      });
      conversationId = conversation.id;

      await prisma.conversationParticipant.createMany({
        data: [
          {
            id: 'participant-client',
            conversationId: conversationId,
            userId: clientId,
            joinedAt: new Date(),
          },
          {
            id: 'participant-therapist',
            conversationId: conversationId,
            userId: therapistId,
            joinedAt: new Date(),
          },
        ],
      });
    });

    it('should handle typing indicators', async () => {
      // Simulate typing start
      const typingStartResponse = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/typing`)
        .set('x-user-id', clientId)
        .send({ isTyping: true })
        .expect(200);

      expect(typingStartResponse.body.success).toBe(true);

      // Simulate typing stop
      const typingStopResponse = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/typing`)
        .set('x-user-id', clientId)
        .send({ isTyping: false })
        .expect(200);

      expect(typingStopResponse.body.success).toBe(true);
    });

    it('should handle message reactions', async () => {
      // First send a message
      const messageData = {
        content: 'This is great advice!',
        messageType: 'TEXT',
      };

      const messageResponse = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send(messageData)
        .expect(201);

      const messageId = messageResponse.body.data.id;

      // Add reaction
      const reactionData = {
        emoji: '👍',
      };

      const reactionResponse = await request(app.getHttpServer())
        .post(`/messaging/messages/${messageId}/reactions`)
        .set('x-user-id', therapistId)
        .send(reactionData)
        .expect(201);

      expect(reactionResponse.body.success).toBe(true);

      // Remove reaction
      await request(app.getHttpServer())
        .delete(`/messaging/messages/${messageId}/reactions/👍`)
        .set('x-user-id', therapistId)
        .expect(200);
    });

    it('should handle message search', async () => {
      // Create multiple messages for search
      const messages = [
        "Let's discuss anxiety management techniques",
        'The breathing exercises are very helpful',
        "I'm feeling much better after our last session",
        'Can we schedule another appointment?',
      ];

      for (const content of messages) {
        await request(app.getHttpServer())
          .post(`/messaging/conversations/${conversationId}/messages`)
          .set('x-user-id', clientId)
          .send({
            content,
            messageType: 'TEXT',
          });
      }

      // Search for messages
      const searchResponse = await request(app.getHttpServer())
        .get(`/messaging/conversations/${conversationId}/search?q=anxiety`)
        .set('x-user-id', clientId)
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data.length).toBeGreaterThan(0);
      expect(searchResponse.body.data[0].content).toContain('anxiety');
    });
  });

  describe('Message Management', () => {
    beforeEach(async () => {
      // Create conversation and initial messages
      const conversation = await prisma.conversation.create({
        data: {
          id: 'management-conversation',
          type: ConversationType.DIRECT,
        },
      });
      conversationId = conversation.id;

      await prisma.conversationParticipant.createMany({
        data: [
          {
            id: 'mgmt-participant-client',
            conversationId: conversationId,
            userId: clientId,
            joinedAt: new Date(),
          },
          {
            id: 'mgmt-participant-therapist',
            conversationId: conversationId,
            userId: therapistId,
            joinedAt: new Date(),
          },
        ],
      });
    });

    it('should handle message deletion workflow', async () => {
      // Send message
      const messageData = {
        content: 'I accidentally shared sensitive information',
        messageType: 'TEXT',
      };

      const messageResponse = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send(messageData)
        .expect(201);

      const messageId = messageResponse.body.data.id;

      // Delete message
      await request(app.getHttpServer())
        .delete(`/messaging/messages/${messageId}`)
        .set('x-user-id', clientId)
        .expect(200);

      // Verify soft deletion
      const deletedMessage = await prisma.message.findUnique({
        where: { id: messageId },
      });

      expect(deletedMessage?.isDeleted).toBe(true);

      // Verify deleted message doesn't appear in conversation
      const conversationMessages = await request(app.getHttpServer())
        .get(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .expect(200);

      const visibleMessage = conversationMessages.body.data.find(
        (msg) => msg.id === messageId,
      );
      expect(visibleMessage?.content).toBe('[Message deleted]');
    });

    it('should handle bulk message operations', async () => {
      // Create multiple messages
      const messageIds: string[] = [];
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post(`/messaging/conversations/${conversationId}/messages`)
          .set('x-user-id', clientId)
          .send({
            content: `Bulk message ${i + 1}`,
            messageType: 'TEXT',
          });
        messageIds.push(response.body.data.id);
      }

      // Bulk mark as read
      const bulkReadData = {
        messageIds: messageIds.slice(0, 3),
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/bulk-read`)
        .set('x-user-id', therapistId)
        .send(bulkReadData)
        .expect(200);

      // Verify read receipts
      const readReceipts = await prisma.messageReadReceipt.findMany({
        where: {
          userId: therapistId,
          messageId: { in: messageIds.slice(0, 3) },
        },
      });

      expect(readReceipts).toHaveLength(3);
    });
  });

  describe('Privacy and Security', () => {
    it('should prevent unauthorized access to conversations', async () => {
      // Create unauthorized user
      const unauthorizedUser = await prisma.user.create({
        data: {
          id: 'unauthorized-user-123',
          email: 'unauthorized@test.com',
          firstName: 'Unauthorized',
          lastName: 'User',
          role: 'client',
        },
      });

      // Create private conversation
      const privateConversation = await prisma.conversation.create({
        data: {
          id: 'private-conversation',
          type: ConversationType.DIRECT,
        },
      });

      await prisma.conversationParticipant.createMany({
        data: [
          {
            id: 'private-participant-1',
            conversationId: privateConversation.id,
            userId: clientId,
            joinedAt: new Date(),
          },
          {
            id: 'private-participant-2',
            conversationId: privateConversation.id,
            userId: therapistId,
            joinedAt: new Date(),
          },
        ],
      });

      // Unauthorized user tries to access conversation
      await request(app.getHttpServer())
        .get(`/messaging/conversations/${privateConversation.id}/messages`)
        .set('x-user-id', unauthorizedUser.id)
        .expect(403);

      // Unauthorized user tries to send message
      await request(app.getHttpServer())
        .post(`/messaging/conversations/${privateConversation.id}/messages`)
        .set('x-user-id', unauthorizedUser.id)
        .send({
          content: 'Unauthorized message',
          messageType: 'TEXT',
        })
        .expect(403);
    });

    it('should validate message content for security', async () => {
      const conversation = await prisma.conversation.create({
        data: {
          id: 'security-conversation',
          type: ConversationType.DIRECT,
        },
      });

      await prisma.conversationParticipant.createMany({
        data: [
          {
            id: 'security-participant-1',
            conversationId: conversation.id,
            userId: clientId,
            joinedAt: new Date(),
          },
          {
            id: 'security-participant-2',
            conversationId: conversation.id,
            userId: therapistId,
            joinedAt: new Date(),
          },
        ],
      });

      // Test XSS prevention
      const xssMessageData = {
        content: '<script>alert("XSS")</script>This is a message',
        messageType: 'TEXT',
      };

      const response = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversation.id}/messages`)
        .set('x-user-id', clientId)
        .send(xssMessageData)
        .expect(201);

      // Content should be sanitized
      expect(response.body.data.content).not.toContain('<script>');
      expect(response.body.data.content).toContain('This is a message');
    });
  });
});
