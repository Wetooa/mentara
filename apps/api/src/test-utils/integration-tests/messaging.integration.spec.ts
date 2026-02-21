import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../providers/prisma-client.provider';
import { MessagingModule } from '../../messaging/messaging.module';
import { DatabaseTestSetup } from '../database-test.setup';
import { MessageType, ConversationType } from '@prisma/client';

describe('Messaging Integration Tests', () => {
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
      imports: [MessagingModule],
      providers: [
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Create test users and conversation
    await setupTestData();
  });

  afterEach(async () => {
    // Clean messages after each test but keep users and conversation
    await prisma.message.deleteMany();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  async function setupTestData() {
    // Create users
    const clientUser = await prisma.user.create({
      data: {
        id: 'client-msg-123',
        email: 'client.msg@test.com',
        firstName: 'Client',
        lastName: 'User',
        role: 'client',
      },
    });
    clientId = clientUser.id;

    const therapistUser = await prisma.user.create({
      data: {
        id: 'therapist-msg-123',
        email: 'therapist.msg@test.com',
        firstName: 'Therapist',
        lastName: 'User',
        role: 'therapist',
      },
    });
    therapistId = therapistUser.id;

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        id: 'test-conversation-123',
        type: ConversationType.DIRECT,
      },
    });
    conversationId = conversation.id;

    // Create conversation participants
    await prisma.conversationParticipant.createMany({
      data: [
        {
          id: 'participant-1',
          conversationId: conversationId,
          userId: clientId,
          joinedAt: new Date(),
        },
        {
          id: 'participant-2',
          conversationId: conversationId,
          userId: therapistId,
          joinedAt: new Date(),
        },
      ],
    });
  }

  describe('POST /messaging/conversations/:id/messages', () => {
    it('should send a message successfully', async () => {
      const messageData = {
        content: 'Hello, this is a test message',
        messageType: MessageType.TEXT,
      };

      const response = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send(messageData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          content: 'Hello, this is a test message',
          senderId: clientId,
          conversationId: conversationId,
          messageType: MessageType.TEXT,
        }),
      });

      // Verify in database
      const message = await prisma.message.findFirst({
        where: { conversationId: conversationId },
      });

      expect(message).toBeTruthy();
      expect(message?.content).toBe('Hello, this is a test message');
      expect(message?.senderId).toBe(clientId);
    });

    it('should reject messages from non-participants', async () => {
      // Create a non-participant user
      const outsiderUser = await prisma.user.create({
        data: {
          id: 'outsider-123',
          email: 'outsider@test.com',
          firstName: 'Outsider',
          lastName: 'User',
          role: 'client',
        },
      });

      const messageData = {
        content: 'This should be rejected',
        messageType: MessageType.TEXT,
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', outsiderUser.id)
        .send(messageData)
        .expect(403);
    });

    it('should validate message content', async () => {
      const invalidMessageData = {
        content: '', // Empty content
        messageType: MessageType.TEXT,
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send(invalidMessageData)
        .expect(400);
    });

    it('should handle different message types', async () => {
      const imageMessageData = {
        content: 'image.jpg',
        messageType: 'IMAGE',
        metadata: JSON.stringify({
          fileName: 'image.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
        }),
      };

      const response = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send(imageMessageData)
        .expect(201);

      expect(response.body.data.messageType).toBe('IMAGE');
      expect(JSON.parse(response.body.data.metadata || '{}')).toMatchObject({
        fileName: 'image.jpg',
        fileSize: 1024,
      });
    });
  });

  describe('GET /messaging/conversations/:id/messages', () => {
    beforeEach(async () => {
      // Create test messages
      const messages = [
        {
          id: 'msg-1',
          conversationId: conversationId,
          senderId: clientId,
          content: 'First message',
          messageType: MessageType.TEXT,
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'msg-2',
          conversationId: conversationId,
          senderId: therapistId,
          content: 'Second message',
          messageType: MessageType.TEXT,
          createdAt: new Date('2024-01-01T10:01:00Z'),
        },
        {
          id: 'msg-3',
          conversationId: conversationId,
          senderId: clientId,
          content: 'Third message',
          messageType: MessageType.TEXT,
          createdAt: new Date('2024-01-01T10:02:00Z'),
        },
      ];

      await prisma.message.createMany({ data: messages });
    });

    it('should retrieve conversation messages', async () => {
      const response = await request(app.getHttpServer())
        .get(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);

      // Should be ordered by createdAt desc (newest first)
      const messages = response.body.data;
      expect(messages[0].content).toBe('Third message');
      expect(messages[1].content).toBe('Second message');
      expect(messages[2].content).toBe('First message');
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/messaging/conversations/${conversationId}/messages?limit=2&offset=1`,
        )
        .set('x-user-id', clientId)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].content).toBe('Second message');
      expect(response.body.data[1].content).toBe('First message');
    });

    it('should include sender information', async () => {
      const response = await request(app.getHttpServer())
        .get(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .expect(200);

      expect(response.body.data[0]).toMatchObject({
        senderId: clientId,
        sender: expect.objectContaining({
          id: clientId,
          firstName: 'Client',
          lastName: 'User',
        }),
      });
    });

    it('should reject access from non-participants', async () => {
      const outsiderUser = await prisma.user.create({
        data: {
          id: 'outsider-msg-123',
          email: 'outsider.msg@test.com',
          firstName: 'Outsider',
          lastName: 'User',
          role: 'client',
        },
      });

      await request(app.getHttpServer())
        .get(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', outsiderUser.id)
        .expect(403);
    });
  });

  describe('PUT /messaging/messages/:id', () => {
    let messageId: string;

    beforeEach(async () => {
      const message = await prisma.message.create({
        data: {
          id: 'editable-msg-123',
          conversationId: conversationId,
          senderId: clientId,
          content: 'Original message',
          messageType: MessageType.TEXT,
          createdAt: new Date(),
        },
      });
      messageId = message.id;
    });

    it('should edit own message successfully', async () => {
      const updateData = {
        content: 'Edited message content',
      };

      const response = await request(app.getHttpServer())
        .put(`/messaging/messages/${messageId}`)
        .set('x-user-id', clientId)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: messageId,
          content: 'Edited message content',
          isEdited: true,
          editedAt: expect.any(String),
        }),
      });

      // Verify in database
      const updatedMessage = await prisma.message.findUnique({
        where: { id: messageId },
      });

      expect(updatedMessage?.content).toBe('Edited message content');
      expect(updatedMessage?.isEdited).toBe(true);
      expect(updatedMessage?.editedAt).toBeTruthy();
    });

    it('should prevent editing others messages', async () => {
      const updateData = {
        content: 'Should not be able to edit this',
      };

      await request(app.getHttpServer())
        .put(`/messaging/messages/${messageId}`)
        .set('x-user-id', therapistId) // Different user
        .send(updateData)
        .expect(403);
    });

    it('should prevent editing old messages', async () => {
      // Create an old message (more than edit time limit)
      const oldMessage = await prisma.message.create({
        data: {
          id: 'old-msg-123',
          conversationId: conversationId,
          senderId: clientId,
          content: 'Old message',
          messageType: MessageType.TEXT,
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        },
      });

      const updateData = {
        content: 'Trying to edit old message',
      };

      await request(app.getHttpServer())
        .put(`/messaging/messages/${oldMessage.id}`)
        .set('x-user-id', clientId)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /messaging/messages/:id', () => {
    let messageId: string;

    beforeEach(async () => {
      const message = await prisma.message.create({
        data: {
          id: 'deletable-msg-123',
          conversationId: conversationId,
          senderId: clientId,
          content: 'Message to delete',
          messageType: MessageType.TEXT,
          createdAt: new Date(),
        },
      });
      messageId = message.id;
    });

    it('should delete own message successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/messaging/messages/${messageId}`)
        .set('x-user-id', clientId)
        .expect(200);

      // Verify soft deletion in database
      const deletedMessage = await prisma.message.findUnique({
        where: { id: messageId },
      });

      expect(deletedMessage?.isDeleted).toBe(true);
    });

    it('should prevent deleting others messages', async () => {
      await request(app.getHttpServer())
        .delete(`/messaging/messages/${messageId}`)
        .set('x-user-id', therapistId) // Different user
        .expect(403);
    });

    it('should handle already deleted messages', async () => {
      // First deletion
      await request(app.getHttpServer())
        .delete(`/messaging/messages/${messageId}`)
        .set('x-user-id', clientId)
        .expect(200);

      // Second deletion attempt
      await request(app.getHttpServer())
        .delete(`/messaging/messages/${messageId}`)
        .set('x-user-id', clientId)
        .expect(400);
    });
  });

  describe('Message Read Receipts', () => {
    let messageId: string;

    beforeEach(async () => {
      const message = await prisma.message.create({
        data: {
          id: 'readable-msg-123',
          conversationId: conversationId,
          senderId: clientId,
          content: 'Message to mark as read',
          messageType: MessageType.TEXT,
        },
      });
      messageId = message.id;
    });

    it('should mark message as read', async () => {
      await request(app.getHttpServer())
        .post(`/messaging/messages/${messageId}/read`)
        .set('x-user-id', therapistId)
        .expect(200);

      // Verify read receipt in database
      const readReceipt = await prisma.messageReadReceipt.findFirst({
        where: {
          messageId: messageId,
          userId: therapistId,
        },
      });

      expect(readReceipt).toBeTruthy();
      expect(readReceipt?.readAt).toBeTruthy();
    });

    it('should handle duplicate read receipts', async () => {
      // First read
      await request(app.getHttpServer())
        .post(`/messaging/messages/${messageId}/read`)
        .set('x-user-id', therapistId)
        .expect(200);

      // Second read (should be idempotent)
      await request(app.getHttpServer())
        .post(`/messaging/messages/${messageId}/read`)
        .set('x-user-id', therapistId)
        .expect(200);

      // Should still have only one read receipt
      const readReceipts = await prisma.messageReadReceipt.findMany({
        where: {
          messageId: messageId,
          userId: therapistId,
        },
      });

      expect(readReceipts).toHaveLength(1);
    });

    it('should not allow marking own messages as read', async () => {
      await request(app.getHttpServer())
        .post(`/messaging/messages/${messageId}/read`)
        .set('x-user-id', clientId) // Same as sender
        .expect(400);
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle concurrent message sending', async () => {
      const messagePromises = Array.from({ length: 10 }, (_, i) =>
        request(app.getHttpServer())
          .post(`/messaging/conversations/${conversationId}/messages`)
          .set('x-user-id', i % 2 === 0 ? clientId : therapistId)
          .send({
            content: `Concurrent message ${i}`,
            messageType: MessageType.TEXT,
          }),
      );

      const results = await Promise.allSettled(messagePromises);
      const successful = results.filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status === 201,
      );

      expect(successful.length).toBe(10); // All should succeed
    });

    it('should maintain message order consistency', async () => {
      // Send messages sequentially
      const messageContents = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];

      for (const content of messageContents) {
        await request(app.getHttpServer())
          .post(`/messaging/conversations/${conversationId}/messages`)
          .set('x-user-id', clientId)
          .send({
            content: content,
            messageType: MessageType.TEXT,
          });
      }

      // Retrieve messages
      const response = await request(app.getHttpServer())
        .get(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .expect(200);

      const messages = response.body.data;
      expect(messages).toHaveLength(5);

      // Should be in reverse chronological order (newest first)
      expect(messages[0].content).toBe('Fifth');
      expect(messages[4].content).toBe('First');
    });

    it('should handle large conversation history efficiently', async () => {
      // Create many messages
      const messages = Array.from({ length: 100 }, (_, i) => ({
        id: `bulk-msg-${i}`,
        conversationId: conversationId,
        senderId: i % 2 === 0 ? clientId : therapistId,
        content: `Bulk message ${i}`,
        messageType: MessageType.TEXT,
        createdAt: new Date(Date.now() + i * 1000),
      }));

      await prisma.message.createMany({ data: messages });

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get(`/messaging/conversations/${conversationId}/messages?limit=20`)
        .set('x-user-id', clientId)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.data).toHaveLength(20);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-existent conversation', async () => {
      await request(app.getHttpServer())
        .get('/messaging/conversations/non-existent-id/messages')
        .set('x-user-id', clientId)
        .expect(404);
    });

    it('should handle non-existent message', async () => {
      await request(app.getHttpServer())
        .put('/messaging/messages/non-existent-id')
        .set('x-user-id', clientId)
        .send({ content: 'Updated content' })
        .expect(404);
    });

    it('should validate message content length', async () => {
      const longContent = 'a'.repeat(10001); // Exceed max length

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send({
          content: longContent,
          messageType: MessageType.TEXT,
        })
        .expect(400);
    });

    it('should handle malformed JSON metadata', async () => {
      await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientId)
        .send({
          content: 'Message with invalid metadata',
          messageType: 'FILE',
          metadata: 'invalid-json-string',
        })
        .expect(400);
    });
  });
});
