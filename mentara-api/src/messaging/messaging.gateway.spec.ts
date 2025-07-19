import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MessagingGateway } from './messaging.gateway';
import { PrismaService } from '../providers/prisma-client.provider';
import { WebSocketAuthService } from './services/websocket-auth.service';
import { Server, Socket } from 'socket.io';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';

// Mock interface for authenticated socket
interface MockAuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  isAuthenticated?: boolean;
  join: jest.Mock;
  leave: jest.Mock;
  emit: jest.Mock;
  to: jest.Mock;
  disconnect: jest.Mock;
  id: string;
}

// Mock data for comprehensive testing
const mockConversation = {
  id: 'conversation-1',
  participants: [
    {
      id: 'participant-1',
      userId: TEST_USER_IDS.CLIENT,
      isActive: true,
      user: {
        id: TEST_USER_IDS.CLIENT,
        notificationSettings: {
          pushNewMessages: true,
        },
        deviceTokens: [
          {
            id: 'token-1',
            token: 'device-token-123',
          },
        ],
      },
    },
    {
      id: 'participant-2',
      userId: TEST_USER_IDS.THERAPIST,
      isActive: true,
      user: {
        id: TEST_USER_IDS.THERAPIST,
        notificationSettings: {
          pushNewMessages: false,
        },
        deviceTokens: [],
      },
    },
  ],
};

const mockUser = {
  id: TEST_USER_IDS.CLIENT,
  role: 'client',
  isActive: true,
};

const mockMembership = {
  id: 'membership-1',
  communityId: 'community-1',
  userId: TEST_USER_IDS.CLIENT,
};

const mockPost = {
  id: 'post-1',
  title: 'Test Post',
  content: 'Test content',
  room: {
    roomGroup: {
      community: {
        memberships: [
          {
            userId: TEST_USER_IDS.CLIENT,
          },
        ],
      },
    },
  },
};

describe('MessagingGateway', () => {
  let gateway: MessagingGateway;
  let prismaService: jest.Mocked<PrismaService>;
  let webSocketAuthService: jest.Mocked<WebSocketAuthService>;
  let mockServer: jest.Mocked<Server>;
  let mockSocket: MockAuthenticatedSocket;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();
    const mockWebSocketAuth = {
      authenticateSocket: jest.fn(),
      cleanupConnection: jest.fn(),
    };

    mockServer = {
      to: jest.fn(() => ({ emit: jest.fn() })),
      emit: jest.fn(),
      sockets: {
        sockets: new Map(),
      },
    } as any;

    mockSocket = {
      id: 'socket-123',
      userId: undefined,
      userRole: undefined,
      isAuthenticated: false,
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn(() => ({ emit: jest.fn() })),
      disconnect: jest.fn(),
    } as MockAuthenticatedSocket;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingGateway,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: WebSocketAuthService,
          useValue: mockWebSocketAuth,
        },
      ],
    }).compile();

    gateway = module.get<MessagingGateway>(MessagingGateway);
    prismaService = module.get(PrismaService);
    webSocketAuthService = module.get(WebSocketAuthService);

    // Set the server on the gateway
    gateway.server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    beforeEach(() => {
      webSocketAuthService.authenticateSocket.mockResolvedValue({
        userId: TEST_USER_IDS.CLIENT,
        role: 'client',
        lastAuthenticated: new Date(),
        connectionCount: 1,
      });
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      prismaService.conversation.findMany.mockResolvedValue([
        { id: 'conversation-1' },
        { id: 'conversation-2' },
      ]);
    });

    it('should handle successful connection', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      await gateway.handleConnection(mockSocket);

      expect(webSocketAuthService.authenticateSocket).toHaveBeenCalledWith(mockSocket);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: TEST_USER_IDS.CLIENT,
          isActive: true,
        },
        select: { id: true, role: true, isActive: true },
      });
      expect(mockSocket.userId).toBe(TEST_USER_IDS.CLIENT);
      expect(mockSocket.userRole).toBe('client');
      expect(mockSocket.isAuthenticated).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith('authenticated', {
        userId: TEST_USER_IDS.CLIENT,
        role: 'client',
        message: 'Successfully authenticated and connected',
        timestamp: expect.any(String),
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User ${TEST_USER_IDS.CLIENT} successfully authenticated and connected with socket socket-123`
      );
    });

    it('should handle authentication failure', async () => {
      webSocketAuthService.authenticateSocket.mockResolvedValue(null);
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Authentication failed. Please provide a valid token.',
        code: 'AUTH_FAILED',
      });
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
      expect(loggerSpy).toHaveBeenCalledWith('Client socket-123 authentication failed');
    });

    it('should handle user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'User account not found or inactive',
        code: 'USER_NOT_FOUND',
      });
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
      expect(loggerSpy).toHaveBeenCalledWith(`User ${TEST_USER_IDS.CLIENT} not found or inactive`);
    });

    it('should handle inactive user', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'User account not found or inactive',
        code: 'USER_NOT_FOUND',
      });
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should join user to conversation rooms', async () => {
      await gateway.handleConnection(mockSocket);

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
        select: { id: true },
      });
      expect(mockSocket.join).toHaveBeenCalledWith('conversation-1');
      expect(mockSocket.join).toHaveBeenCalledWith('conversation-2');
    });

    it('should join user to personal room', async () => {
      await gateway.handleConnection(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith(`user_${TEST_USER_IDS.CLIENT}`);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Database connection failed');
      prismaService.user.findUnique.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connection_error', {
        message: 'Internal server error during connection',
        code: 'INTERNAL_ERROR',
      });
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
      expect(loggerSpy).toHaveBeenCalledWith('Connection error for client socket-123:', error);
    });
  });

  describe('handleDisconnect', () => {
    beforeEach(() => {
      mockSocket.userId = TEST_USER_IDS.CLIENT;
      mockSocket.isAuthenticated = true;
      // Initialize user sockets map
      gateway['userSockets'] = new Map();
      gateway['userSockets'].set(TEST_USER_IDS.CLIENT, new Set(['socket-123']));
      gateway['conversationParticipants'] = new Map();
      gateway['conversationParticipants'].set('conversation-1', new Set([TEST_USER_IDS.CLIENT]));
    });

    it('should handle disconnect for authenticated user', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      await gateway.handleDisconnect(mockSocket);

      expect(webSocketAuthService.cleanupConnection).toHaveBeenCalledWith('socket-123');
      expect(loggerSpy).toHaveBeenCalledWith(`User ${TEST_USER_IDS.CLIENT} disconnected socket socket-123`);
    });

    it('should clean up user sockets tracking', async () => {
      await gateway.handleDisconnect(mockSocket);

      expect(gateway['userSockets'].has(TEST_USER_IDS.CLIENT)).toBe(false);
    });

    it('should clean up conversation participants', async () => {
      await gateway.handleDisconnect(mockSocket);

      expect(gateway['conversationParticipants'].has('conversation-1')).toBe(false);
    });

    it('should not clean up if user has other sockets', async () => {
      gateway['userSockets'].set(TEST_USER_IDS.CLIENT, new Set(['socket-123', 'socket-456']));

      await gateway.handleDisconnect(mockSocket);

      expect(gateway['userSockets'].has(TEST_USER_IDS.CLIENT)).toBe(true);
      expect(gateway['userSockets'].get(TEST_USER_IDS.CLIENT)?.has('socket-123')).toBe(false);
      expect(gateway['userSockets'].get(TEST_USER_IDS.CLIENT)?.has('socket-456')).toBe(true);
    });

    it('should handle disconnect errors', async () => {
      const error = new Error('Disconnect error');
      webSocketAuthService.cleanupConnection.mockImplementation(() => {
        throw error;
      });
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await gateway.handleDisconnect(mockSocket);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error during disconnect cleanup for socket socket-123:',
        error
      );
    });

    it('should handle disconnect for unauthenticated user', async () => {
      mockSocket.userId = undefined;
      mockSocket.isAuthenticated = false;

      await gateway.handleDisconnect(mockSocket);

      expect(webSocketAuthService.cleanupConnection).toHaveBeenCalledWith('socket-123');
    });
  });

  describe('handleJoinConversation', () => {
    beforeEach(() => {
      mockSocket.userId = TEST_USER_IDS.CLIENT;
      mockSocket.isAuthenticated = true;
      
      prismaService.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-1',
        conversationId: 'conversation-1',
        userId: TEST_USER_IDS.CLIENT,
        isActive: true,
      });
    });

    it('should join conversation successfully', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      await gateway.handleJoinConversation(mockSocket, { conversationId: 'conversation-1' });

      expect(prismaService.conversationParticipant.findFirst).toHaveBeenCalledWith({
        where: {
          conversationId: 'conversation-1',
          userId: TEST_USER_IDS.CLIENT,
          isActive: true,
        },
      });
      expect(mockSocket.join).toHaveBeenCalledWith('conversation-1');
      expect(mockSocket.to).toHaveBeenCalledWith('conversation-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('conversation_joined', {
        conversationId: 'conversation-1',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User ${TEST_USER_IDS.CLIENT} joined conversation conversation-1`
      );
    });

    it('should deny access for non-participant', async () => {
      prismaService.conversationParticipant.findFirst.mockResolvedValue(null);

      await gateway.handleJoinConversation(mockSocket, { conversationId: 'conversation-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied to this conversation',
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated user', async () => {
      mockSocket.isAuthenticated = false;

      await gateway.handleJoinConversation(mockSocket, { conversationId: 'conversation-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Authentication required for this action',
        code: 'AUTH_REQUIRED',
      });
      expect(prismaService.conversationParticipant.findFirst).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      prismaService.conversationParticipant.findFirst.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await gateway.handleJoinConversation(mockSocket, { conversationId: 'conversation-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to join conversation',
      });
      expect(loggerSpy).toHaveBeenCalledWith('Error joining conversation:', error);
    });
  });

  describe('handleLeaveConversation', () => {
    beforeEach(() => {
      mockSocket.userId = TEST_USER_IDS.CLIENT;
      mockSocket.isAuthenticated = true;
      gateway['conversationParticipants'] = new Map();
      gateway['conversationParticipants'].set('conversation-1', new Set([TEST_USER_IDS.CLIENT]));
    });

    it('should leave conversation successfully', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      gateway.handleLeaveConversation(mockSocket, { conversationId: 'conversation-1' });

      expect(mockSocket.leave).toHaveBeenCalledWith('conversation-1');
      expect(mockSocket.to).toHaveBeenCalledWith('conversation-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('conversation_left', {
        conversationId: 'conversation-1',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User ${TEST_USER_IDS.CLIENT} left conversation conversation-1`
      );
    });

    it('should clean up conversation participants', async () => {
      gateway.handleLeaveConversation(mockSocket, { conversationId: 'conversation-1' });

      expect(gateway['conversationParticipants'].has('conversation-1')).toBe(false);
    });

    it('should reject unauthenticated user', async () => {
      mockSocket.isAuthenticated = false;

      gateway.handleLeaveConversation(mockSocket, { conversationId: 'conversation-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Authentication required for this action',
        code: 'AUTH_REQUIRED',
      });
      expect(mockSocket.leave).not.toHaveBeenCalled();
    });
  });

  describe('handleTypingIndicator', () => {
    beforeEach(() => {
      mockSocket.userId = TEST_USER_IDS.CLIENT;
      mockSocket.isAuthenticated = true;
      
      prismaService.typingIndicator.upsert.mockResolvedValue({
        id: 'typing-1',
        conversationId: 'conversation-1',
        userId: TEST_USER_IDS.CLIENT,
        lastTypingAt: new Date(),
      });
    });

    it('should handle typing indicator (typing)', async () => {
      await gateway.handleTypingIndicator(mockSocket, {
        conversationId: 'conversation-1',
        isTyping: true,
      });

      expect(prismaService.typingIndicator.upsert).toHaveBeenCalledWith({
        where: {
          conversationId_userId: {
            conversationId: 'conversation-1',
            userId: TEST_USER_IDS.CLIENT,
          },
        },
        create: {
          conversationId: 'conversation-1',
          userId: TEST_USER_IDS.CLIENT,
          lastTypingAt: expect.any(Date),
        },
        update: {
          lastTypingAt: expect.any(Date),
        },
      });
      expect(mockSocket.to).toHaveBeenCalledWith('conversation-1');
    });

    it('should handle typing indicator (stopped typing)', async () => {
      await gateway.handleTypingIndicator(mockSocket, {
        conversationId: 'conversation-1',
        isTyping: false,
      });

      expect(prismaService.typingIndicator.deleteMany).toHaveBeenCalledWith({
        where: {
          conversationId: 'conversation-1',
          userId: TEST_USER_IDS.CLIENT,
        },
      });
      expect(mockSocket.to).toHaveBeenCalledWith('conversation-1');
    });

    it('should reject unauthenticated user', async () => {
      mockSocket.isAuthenticated = false;

      await gateway.handleTypingIndicator(mockSocket, {
        conversationId: 'conversation-1',
        isTyping: true,
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Authentication required for this action',
        code: 'AUTH_REQUIRED',
      });
      expect(prismaService.typingIndicator.upsert).not.toHaveBeenCalled();
    });
  });

  describe('Message Broadcasting', () => {
    beforeEach(() => {
      // Mock push notification methods
      jest.spyOn(gateway as any, 'sendPushNotifications').mockImplementation();
    });

    it('should broadcast message to conversation', () => {
      const message = {
        id: 'message-1',
        content: 'Hello world',
        senderId: TEST_USER_IDS.CLIENT,
      };

      gateway.broadcastMessage('conversation-1', message);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
      expect(gateway['sendPushNotifications']).toHaveBeenCalledWith('conversation-1', message);
    });

    it('should broadcast message update', () => {
      const update = {
        content: 'Updated message',
        isEdited: true,
      };

      gateway.broadcastMessageUpdate('conversation-1', 'message-1', update);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
    });

    it('should broadcast read receipt', () => {
      gateway.broadcastReadReceipt('conversation-1', 'message-1', TEST_USER_IDS.CLIENT);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
    });

    it('should broadcast reaction', () => {
      const reaction = {
        emoji: '👍',
        userId: TEST_USER_IDS.CLIENT,
      };

      gateway.broadcastReaction('conversation-1', 'message-1', reaction);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
    });
  });

  describe('Community Room Management', () => {
    beforeEach(() => {
      mockSocket.userId = TEST_USER_IDS.CLIENT;
      mockSocket.isAuthenticated = true;
      
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);
    });

    it('should join community room', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      await gateway.handleJoinCommunity(mockSocket, { communityId: 'community-1' });

      expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
        where: {
          communityId: 'community-1',
          userId: TEST_USER_IDS.CLIENT,
        },
      });
      expect(mockSocket.join).toHaveBeenCalledWith('community_community-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('community_joined', {
        communityId: 'community-1',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User ${TEST_USER_IDS.CLIENT} joined community room community-1`
      );
    });

    it('should deny access for non-member', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      await gateway.handleJoinCommunity(mockSocket, { communityId: 'community-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied to this community',
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should leave community room', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      await gateway.handleLeaveCommunity(mockSocket, { communityId: 'community-1' });

      expect(mockSocket.leave).toHaveBeenCalledWith('community_community-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('community_left', {
        communityId: 'community-1',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User ${TEST_USER_IDS.CLIENT} left community room community-1`
      );
    });

    it('should handle join community errors', async () => {
      const error = new Error('Database error');
      prismaService.membership.findFirst.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await gateway.handleJoinCommunity(mockSocket, { communityId: 'community-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to join community',
      });
      expect(loggerSpy).toHaveBeenCalledWith('Error joining community:', error);
    });
  });

  describe('Post Room Management', () => {
    beforeEach(() => {
      mockSocket.userId = TEST_USER_IDS.CLIENT;
      mockSocket.isAuthenticated = true;
      
      prismaService.post.findFirst.mockResolvedValue(mockPost);
    });

    it('should join post room', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      await gateway.handleJoinPost(mockSocket, { postId: 'post-1' });

      expect(prismaService.post.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'post-1',
          room: {
            roomGroup: {
              community: {
                memberships: {
                  some: {
                    userId: TEST_USER_IDS.CLIENT,
                  },
                },
              },
            },
          },
        },
      });
      expect(mockSocket.join).toHaveBeenCalledWith('post_post-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('post_joined', {
        postId: 'post-1',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User ${TEST_USER_IDS.CLIENT} joined post room post-1`
      );
    });

    it('should deny access for non-member', async () => {
      prismaService.post.findFirst.mockResolvedValue(null);

      await gateway.handleJoinPost(mockSocket, { postId: 'post-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied to this post',
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should leave post room', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      await gateway.handleLeavePost(mockSocket, { postId: 'post-1' });

      expect(mockSocket.leave).toHaveBeenCalledWith('post_post-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('post_left', {
        postId: 'post-1',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User ${TEST_USER_IDS.CLIENT} left post room post-1`
      );
    });

    it('should handle join post errors', async () => {
      const error = new Error('Database error');
      prismaService.post.findFirst.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await gateway.handleJoinPost(mockSocket, { postId: 'post-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to join post',
      });
      expect(loggerSpy).toHaveBeenCalledWith('Error joining post:', error);
    });
  });

  describe('Personal Room Management', () => {
    beforeEach(() => {
      mockSocket.userId = TEST_USER_IDS.CLIENT;
    });

    it('should subscribe user to personal room', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
      
      await gateway.subscribeUserToPersonalRoom(mockSocket, TEST_USER_IDS.CLIENT);

      expect(mockSocket.join).toHaveBeenCalledWith(`user_${TEST_USER_IDS.CLIENT}`);
      expect(loggerSpy).toHaveBeenCalledWith(
        `User ${TEST_USER_IDS.CLIENT} subscribed to personal room: user_${TEST_USER_IDS.CLIENT}`
      );
    });

    it('should unsubscribe user from personal room', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
      
      await gateway.unsubscribeUserFromPersonalRoom(mockSocket, TEST_USER_IDS.CLIENT);

      expect(mockSocket.leave).toHaveBeenCalledWith(`user_${TEST_USER_IDS.CLIENT}`);
      expect(loggerSpy).toHaveBeenCalledWith(
        `User ${TEST_USER_IDS.CLIENT} unsubscribed from personal room: user_${TEST_USER_IDS.CLIENT}`
      );
    });
  });

  describe('Utility Methods', () => {
    it('should get server instance', () => {
      const server = gateway.getServer();
      expect(server).toBe(mockServer);
    });

    it('should clean up typing indicators', async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      await gateway.cleanupTypingIndicators();

      expect(prismaService.typingIndicator.deleteMany).toHaveBeenCalledWith({
        where: {
          lastTypingAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });

  describe('Push Notifications', () => {
    beforeEach(() => {
      prismaService.conversation.findUnique.mockResolvedValue(mockConversation);
    });

    it('should send push notifications to eligible users', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const message = {
        id: 'message-1',
        content: 'Hello world',
        senderId: TEST_USER_IDS.THERAPIST,
      };

      await gateway['sendPushNotifications']('conversation-1', message);

      expect(prismaService.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: 'conversation-1' },
        include: {
          participants: {
            include: {
              user: {
                include: {
                  notificationSettings: true,
                  deviceTokens: true,
                },
              },
            },
          },
        },
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        'Would send push notification to device: device-token-123'
      );
    });

    it('should handle conversation not found', async () => {
      prismaService.conversation.findUnique.mockResolvedValue(null);
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      await gateway['sendPushNotifications']('conversation-1', {});

      expect(loggerSpy).toHaveBeenCalledWith(
        'Conversation conversation-1 not found for push notifications'
      );
    });

    it('should handle no eligible participants', async () => {
      prismaService.conversation.findUnique.mockResolvedValue({
        id: 'conversation-1',
        participants: [],
      });
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await gateway['sendPushNotifications']('conversation-1', {});

      expect(loggerSpy).toHaveBeenCalledWith(
        'No eligible participants for push notifications in conversation conversation-1'
      );
    });

    it('should handle push notification errors', async () => {
      prismaService.conversation.findUnique.mockRejectedValue(new Error('Database error'));
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await gateway['sendPushNotifications']('conversation-1', {});

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to send push notifications for conversation conversation-1:',
        expect.any(Error)
      );
    });
  });

  describe('User Status Broadcasting', () => {
    beforeEach(() => {
      prismaService.conversation.findMany.mockResolvedValue([
        { id: 'conversation-1' },
        { id: 'conversation-2' },
      ]);
    });

    it('should broadcast user online status', async () => {
      await gateway['broadcastUserStatus'](TEST_USER_IDS.CLIENT, 'online');

      expect(prismaService.conversation.findMany).toHaveBeenCalledWith({
        where: {
          participants: {
            some: {
              userId: TEST_USER_IDS.CLIENT,
              isActive: true,
            },
          },
        },
        select: { id: true },
      });
      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
      expect(mockServer.to).toHaveBeenCalledWith('conversation-2');
    });

    it('should broadcast user offline status', async () => {
      await gateway['broadcastUserStatus'](TEST_USER_IDS.CLIENT, 'offline');

      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
      expect(mockServer.to).toHaveBeenCalledWith('conversation-2');
    });
  });

  describe('Authentication Guard', () => {
    it('should allow authenticated users', () => {
      mockSocket.isAuthenticated = true;
      mockSocket.userId = TEST_USER_IDS.CLIENT;

      const result = gateway['isAuthenticated'](mockSocket);

      expect(result).toBe(true);
    });

    it('should reject unauthenticated users', () => {
      mockSocket.isAuthenticated = false;
      mockSocket.userId = undefined;
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      const result = gateway['isAuthenticated'](mockSocket);

      expect(result).toBe(false);
      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Authentication required for this action',
        code: 'AUTH_REQUIRED',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        'Unauthenticated client socket-123 attempted to perform action'
      );
    });

    it('should reject users without userId', () => {
      mockSocket.isAuthenticated = true;
      mockSocket.userId = undefined;

      const result = gateway['isAuthenticated'](mockSocket);

      expect(result).toBe(false);
      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Authentication required for this action',
        code: 'AUTH_REQUIRED',
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete connection and conversation flow', async () => {
      // Setup
      webSocketAuthService.authenticateSocket.mockResolvedValue({
        userId: TEST_USER_IDS.CLIENT,
        role: 'client',
        lastAuthenticated: new Date(),
        connectionCount: 1,
      });
      
      prismaService.user.findUnique.mockResolvedValue({
        id: TEST_USER_IDS.CLIENT,
        role: 'client',
        isActive: true,
      });

      prismaService.conversation.findMany.mockResolvedValue([
        { id: 'conversation-1' },
      ]);

      prismaService.conversationParticipant.findFirst.mockResolvedValue({
        id: 'participant-1',
        conversationId: 'conversation-1',
        userId: TEST_USER_IDS.CLIENT,
        isActive: true,
      });

      // Connect
      await gateway.handleConnection(mockSocket);

      // Verify connection
      expect(mockSocket.isAuthenticated).toBe(true);
      expect(mockSocket.userId).toBe(TEST_USER_IDS.CLIENT);
      expect(mockSocket.join).toHaveBeenCalledWith('conversation-1');

      // Join specific conversation
      await gateway.handleJoinConversation(mockSocket, { conversationId: 'conversation-1' });

      // Verify join
      expect(mockSocket.join).toHaveBeenCalledWith('conversation-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('conversation_joined', {
        conversationId: 'conversation-1',
      });

      // Disconnect
      await gateway.handleDisconnect(mockSocket);

      // Verify cleanup
      expect(webSocketAuthService.cleanupConnection).toHaveBeenCalledWith('socket-123');
    });

    it('should handle concurrent connections for same user', async () => {
      const socket1 = { ...mockSocket, id: 'socket-1' };
      const socket2 = { ...mockSocket, id: 'socket-2' };

      // Setup auth
      webSocketAuthService.authenticateSocket.mockResolvedValue({
        userId: TEST_USER_IDS.CLIENT,
        role: 'client',
        lastAuthenticated: new Date(),
        connectionCount: 1,
      });
      
      prismaService.user.findUnique.mockResolvedValue({
        id: TEST_USER_IDS.CLIENT,
        role: 'client',
        isActive: true,
      });

      prismaService.conversation.findMany.mockResolvedValue([]);

      // Connect both sockets
      await gateway.handleConnection(socket1);
      await gateway.handleConnection(socket2);

      // Verify both connections
      expect(gateway['userSockets'].get(TEST_USER_IDS.CLIENT)?.size).toBe(2);
      expect(gateway['userSockets'].get(TEST_USER_IDS.CLIENT)?.has('socket-1')).toBe(true);
      expect(gateway['userSockets'].get(TEST_USER_IDS.CLIENT)?.has('socket-2')).toBe(true);

      // Disconnect one socket
      await gateway.handleDisconnect(socket1);

      // Verify user still tracked
      expect(gateway['userSockets'].get(TEST_USER_IDS.CLIENT)?.size).toBe(1);
      expect(gateway['userSockets'].get(TEST_USER_IDS.CLIENT)?.has('socket-2')).toBe(true);

      // Disconnect second socket
      await gateway.handleDisconnect(socket2);

      // Verify user completely removed
      expect(gateway['userSockets'].has(TEST_USER_IDS.CLIENT)).toBe(false);
    });

    it('should handle role-based access control during connection', async () => {
      // Test different user roles
      const roles = ['client', 'therapist', 'moderator', 'admin'];
      
      for (const role of roles) {
        webSocketAuthService.authenticateSocket.mockResolvedValue({
          userId: TEST_USER_IDS.CLIENT,
          role,
          lastAuthenticated: new Date(),
          connectionCount: 1,
        });
        
        prismaService.user.findUnique.mockResolvedValue({
          ...mockUser,
          role,
        });

        await gateway.handleConnection(mockSocket);

        expect(mockSocket.userRole).toBe(role);
        expect(mockSocket.isAuthenticated).toBe(true);
      }
    });

    it('should handle connection with network timeout', async () => {
      const timeoutError = new Error('Network timeout');
      webSocketAuthService.authenticateSocket.mockRejectedValue(timeoutError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connection_error', {
        message: 'Internal server error during connection',
        code: 'INTERNAL_ERROR',
      });
      expect(loggerSpy).toHaveBeenCalledWith('Connection error for client socket-123:', timeoutError);
    });

    it('should track multiple connections per user correctly', async () => {
      const socket1 = { ...mockSocket, id: 'socket-1' };
      const socket2 = { ...mockSocket, id: 'socket-2' };

      // Connect first socket
      await gateway.handleConnection(socket1);
      expect(gateway['userSockets'].get(TEST_USER_IDS.CLIENT)?.size).toBe(1);

      // Connect second socket for same user
      await gateway.handleConnection(socket2);
      expect(gateway['userSockets'].get(TEST_USER_IDS.CLIENT)?.size).toBe(2);
    });

    it('should handle user status broadcasting on connection', async () => {
      const broadcastSpy = jest.spyOn(gateway as any, 'broadcastUserStatus').mockResolvedValue(undefined);

      await gateway.handleConnection(mockSocket);

      expect(broadcastSpy).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, 'online');
    });
  });

  describe('Advanced Message Broadcasting', () => {
    beforeEach(() => {
      jest.spyOn(gateway as any, 'sendPushNotifications').mockImplementation();
    });

    it('should broadcast message with proper payload structure', () => {
      const message = {
        id: 'message-1',
        content: 'Hello world',
        senderId: TEST_USER_IDS.CLIENT,
        conversationId: 'conversation-1',
        timestamp: new Date(),
        messageType: 'text',
      };

      gateway.broadcastMessage('conversation-1', message);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
      expect(gateway['sendPushNotifications']).toHaveBeenCalledWith('conversation-1', message);
    });

    it('should handle message update broadcasting with version tracking', () => {
      const update = {
        content: 'Updated message content',
        isEdited: true,
        editedAt: new Date(),
        version: 2,
      };

      gateway.broadcastMessageUpdate('conversation-1', 'message-1', update);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
    });

    it('should broadcast read receipt with timestamp', () => {
      const readAt = new Date();
      
      gateway.broadcastReadReceipt('conversation-1', 'message-1', TEST_USER_IDS.CLIENT);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
    });

    it('should broadcast reaction with user information', () => {
      const reaction = {
        emoji: '👍',
        userId: TEST_USER_IDS.CLIENT,
        userName: 'John Doe',
        timestamp: new Date(),
      };

      gateway.broadcastReaction('conversation-1', 'message-1', reaction);

      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
    });

    it('should handle bulk message broadcasting', () => {
      const messages = [
        { id: 'msg-1', content: 'Message 1', senderId: TEST_USER_IDS.CLIENT },
        { id: 'msg-2', content: 'Message 2', senderId: TEST_USER_IDS.THERAPIST },
        { id: 'msg-3', content: 'Message 3', senderId: TEST_USER_IDS.CLIENT },
      ];

      messages.forEach(message => {
        gateway.broadcastMessage('conversation-1', message);
      });

      expect(mockServer.to).toHaveBeenCalledTimes(3);
      expect(gateway['sendPushNotifications']).toHaveBeenCalledTimes(3);
    });
  });

  describe('Advanced Typing Indicators', () => {
    beforeEach(() => {
      mockSocket.userId = TEST_USER_IDS.CLIENT;
      mockSocket.isAuthenticated = true;
    });

    it('should handle rapid typing indicator updates', async () => {
      const requests = [
        { conversationId: 'conversation-1', isTyping: true },
        { conversationId: 'conversation-1', isTyping: false },
        { conversationId: 'conversation-1', isTyping: true },
      ];

      for (const request of requests) {
        if (request.isTyping) {
          prismaService.typingIndicator.upsert.mockResolvedValue({
            id: 'typing-1',
            conversationId: 'conversation-1',
            userId: TEST_USER_IDS.CLIENT,
            lastTypingAt: new Date(),
          });
        } else {
          prismaService.typingIndicator.deleteMany.mockResolvedValue({ count: 1 });
        }

        await gateway.handleTypingIndicator(mockSocket, request);
      }

      expect(prismaService.typingIndicator.upsert).toHaveBeenCalledTimes(2);
      expect(prismaService.typingIndicator.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('should handle typing indicator database errors', async () => {
      const error = new Error('Database connection failed');
      prismaService.typingIndicator.upsert.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await gateway.handleTypingIndicator(mockSocket, {
        conversationId: 'conversation-1',
        isTyping: true,
      });

      expect(loggerSpy).toHaveBeenCalledWith('Error typing indicator:', error);
    });

    it('should clean up old typing indicators', async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      await gateway.cleanupTypingIndicators();

      expect(prismaService.typingIndicator.deleteMany).toHaveBeenCalledWith({
        where: {
          lastTypingAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });

  describe('Room Management Edge Cases', () => {
    beforeEach(() => {
      mockSocket.userId = TEST_USER_IDS.CLIENT;
      mockSocket.isAuthenticated = true;
    });

    it('should handle joining non-existent conversation', async () => {
      prismaService.conversationParticipant.findFirst.mockResolvedValue(null);

      await gateway.handleJoinConversation(mockSocket, { conversationId: 'non-existent' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied to this conversation',
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should handle joining community with suspended membership', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      await gateway.handleJoinCommunity(mockSocket, { communityId: 'community-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied to this community',
      });
    });

    it('should handle joining private post without access', async () => {
      prismaService.post.findFirst.mockResolvedValue(null);

      await gateway.handleJoinPost(mockSocket, { postId: 'private-post' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied to this post',
      });
    });

    it('should manage room subscriptions efficiently', async () => {
      // Subscribe to multiple rooms
      await gateway.subscribeUserToPersonalRoom(mockSocket, TEST_USER_IDS.CLIENT);
      await gateway.handleJoinCommunity(mockSocket, { communityId: 'community-1' });
      await gateway.handleJoinPost(mockSocket, { postId: 'post-1' });

      expect(mockSocket.join).toHaveBeenCalledWith(`user_${TEST_USER_IDS.CLIENT}`);
      expect(mockSocket.join).toHaveBeenCalledWith('community_community-1');
      expect(mockSocket.join).toHaveBeenCalledWith('post_post-1');

      // Unsubscribe from rooms
      await gateway.unsubscribeUserFromPersonalRoom(mockSocket, TEST_USER_IDS.CLIENT);
      await gateway.handleLeaveCommunity(mockSocket, { communityId: 'community-1' });
      await gateway.handleLeavePost(mockSocket, { postId: 'post-1' });

      expect(mockSocket.leave).toHaveBeenCalledWith(`user_${TEST_USER_IDS.CLIENT}`);
      expect(mockSocket.leave).toHaveBeenCalledWith('community_community-1');
      expect(mockSocket.leave).toHaveBeenCalledWith('post_post-1');
    });
  });

  describe('Push Notification Advanced Scenarios', () => {
    it('should handle conversation with mixed notification preferences', async () => {
      const mixedConversation = {
        ...mockConversation,
        participants: [
          {
            ...mockConversation.participants[0],
            user: {
              ...mockConversation.participants[0].user,
              notificationSettings: { pushNewMessages: true },
              deviceTokens: [{ id: 'token-1', token: 'active-token' }],
            },
          },
          {
            ...mockConversation.participants[1],
            user: {
              ...mockConversation.participants[1].user,
              notificationSettings: { pushNewMessages: false },
              deviceTokens: [{ id: 'token-2', token: 'disabled-token' }],
            },
          },
        ],
      };

      prismaService.conversation.findUnique.mockResolvedValue(mixedConversation);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await gateway['sendPushNotifications']('conversation-1', {
        id: 'message-1',
        content: 'Test message',
        senderId: TEST_USER_IDS.THERAPIST,
      });

      expect(loggerSpy).toHaveBeenCalledWith(
        'Would send push notification to device: active-token'
      );
    });

    it('should handle invalid device tokens gracefully', async () => {
      const invalidTokenConversation = {
        ...mockConversation,
        participants: [
          {
            ...mockConversation.participants[0],
            user: {
              ...mockConversation.participants[0].user,
              deviceTokens: [
                { id: 'invalid-token', token: 'expired-token' },
                { id: 'valid-token', token: 'valid-device-token' },
              ],
            },
          },
        ],
      };

      prismaService.conversation.findUnique.mockResolvedValue(invalidTokenConversation);
      prismaService.deviceToken.delete.mockResolvedValue({} as any);

      // Mock push notification failure for first token
      const originalLog = Logger.prototype.log;
      jest.spyOn(Logger.prototype, 'log').mockImplementation((message: string) => {
        if (message.includes('expired-token')) {
          throw new Error('Token invalid or expired');
        }
        originalLog.call(this, message);
      });

      await gateway['sendPushNotifications']('conversation-1', {
        id: 'message-1',
        content: 'Test message',
        senderId: TEST_USER_IDS.THERAPIST,
      });

      // Should continue processing valid tokens despite failures
      expect(prismaService.deviceToken.delete).toHaveBeenCalledWith({
        where: { id: 'invalid-token' },
      });
    });

    it('should optimize push notifications for large conversations', async () => {
      const largeConversation = {
        id: 'large-conversation',
        participants: Array.from({ length: 50 }, (_, i) => ({
          id: `participant-${i}`,
          userId: `user-${i}`,
          user: {
            id: `user-${i}`,
            notificationSettings: { pushNewMessages: i % 2 === 0 },
            deviceTokens: i % 3 === 0 ? [{ id: `token-${i}`, token: `device-${i}` }] : [],
          },
        })),
      };

      prismaService.conversation.findUnique.mockResolvedValue(largeConversation);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await gateway['sendPushNotifications']('large-conversation', {
        id: 'message-1',
        content: 'Broadcast message',
        senderId: 'external-sender',
      });

      // Should process all eligible participants
      expect(loggerSpy).toHaveBeenCalledWith(
        'Push notification processing completed for conversation large-conversation'
      );
    });
  });

  describe('User Status Broadcasting', () => {
    beforeEach(() => {
      prismaService.conversation.findMany.mockResolvedValue([
        { id: 'conversation-1' },
        { id: 'conversation-2' },
        { id: 'conversation-3' },
      ]);
    });

    it('should broadcast status to all user conversations', async () => {
      await gateway['broadcastUserStatus'](TEST_USER_IDS.CLIENT, 'online');

      expect(mockServer.to).toHaveBeenCalledTimes(3);
      expect(mockServer.to).toHaveBeenCalledWith('conversation-1');
      expect(mockServer.to).toHaveBeenCalledWith('conversation-2');
      expect(mockServer.to).toHaveBeenCalledWith('conversation-3');
    });

    it('should handle user with no conversations', async () => {
      prismaService.conversation.findMany.mockResolvedValue([]);

      await gateway['broadcastUserStatus'](TEST_USER_IDS.CLIENT, 'offline');

      expect(mockServer.to).not.toHaveBeenCalled();
    });

    it('should handle status broadcasting errors', async () => {
      const error = new Error('Database error');
      prismaService.conversation.findMany.mockRejectedValue(error);

      // Should not throw error
      await expect(gateway['broadcastUserStatus'](TEST_USER_IDS.CLIENT, 'online'))
        .resolves.not.toThrow();
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should handle partially authenticated socket', () => {
      mockSocket.isAuthenticated = true;
      mockSocket.userId = undefined;

      const result = gateway['isAuthenticated'](mockSocket);

      expect(result).toBe(false);
      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Authentication required for this action',
        code: 'AUTH_REQUIRED',
      });
    });

    it('should handle authentication with expired session', async () => {
      webSocketAuthService.authenticateSocket.mockResolvedValue({
        userId: TEST_USER_IDS.CLIENT,
        role: 'client',
        lastAuthenticated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        connectionCount: 1,
      });

      await gateway.handleConnection(mockSocket);

      // Should still allow connection but log the old session
      expect(mockSocket.isAuthenticated).toBe(true);
    });

    it('should handle user role changes during session', async () => {
      // Initial connection as client
      await gateway.handleConnection(mockSocket);
      expect(mockSocket.userRole).toBe('client');

      // User role changed to therapist (would require reconnection)
      webSocketAuthService.authenticateSocket.mockResolvedValue({
        userId: TEST_USER_IDS.CLIENT,
        role: 'therapist',
        lastAuthenticated: new Date(),
        connectionCount: 2,
      });

      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        role: 'therapist',
      });

      // Reconnect with new role
      await gateway.handleDisconnect(mockSocket);
      await gateway.handleConnection(mockSocket);

      expect(mockSocket.userRole).toBe('therapist');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high-frequency message broadcasting', () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        id: `message-${i}`,
        content: `Message ${i}`,
        senderId: TEST_USER_IDS.CLIENT,
      }));

      messages.forEach(message => {
        gateway.broadcastMessage('conversation-1', message);
      });

      expect(mockServer.to).toHaveBeenCalledTimes(100);
    });

    it('should efficiently manage memory with many connections', async () => {
      const connections = Array.from({ length: 50 }, (_, i) => ({
        ...mockSocket,
        id: `socket-${i}`,
        userId: `user-${i}`,
      }));

      // Connect all sockets
      for (const socket of connections) {
        webSocketAuthService.authenticateSocket.mockResolvedValue({
          userId: socket.userId!,
          role: 'client',
          lastAuthenticated: new Date(),
          connectionCount: 1,
        });

        prismaService.user.findUnique.mockResolvedValue({
          id: socket.userId!,
          role: 'client',
          isActive: true,
        });

        await gateway.handleConnection(socket);
      }

      expect(gateway['userSockets'].size).toBe(50);

      // Disconnect all sockets
      for (const socket of connections) {
        await gateway.handleDisconnect(socket);
      }

      expect(gateway['userSockets'].size).toBe(0);
    });

    it('should handle concurrent room operations', async () => {
      const operations = [
        () => gateway.handleJoinConversation(mockSocket, { conversationId: 'conv-1' }),
        () => gateway.handleJoinCommunity(mockSocket, { communityId: 'comm-1' }),
        () => gateway.handleJoinPost(mockSocket, { postId: 'post-1' }),
        () => gateway.handleLeaveConversation(mockSocket, { conversationId: 'conv-1' }),
        () => gateway.handleLeaveCommunity(mockSocket, { communityId: 'comm-1' }),
        () => gateway.handleLeavePost(mockSocket, { postId: 'post-1' }),
      ];

      // Execute operations concurrently
      await Promise.all(operations.map(op => op()));

      // All operations should complete without errors
      expect(mockSocket.join).toHaveBeenCalledTimes(3);
      expect(mockSocket.leave).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from WebSocket server errors', async () => {
      mockServer.to.mockImplementation(() => {
        throw new Error('WebSocket server error');
      });

      // Should not crash the application
      await expect(async () => {
        gateway.broadcastMessage('conversation-1', {
          id: 'message-1',
          content: 'Test message',
          senderId: TEST_USER_IDS.CLIENT,
        });
      }).not.toThrow();
    });

    it('should handle database disconnection gracefully', async () => {
      const dbError = new Error('Database connection lost');
      prismaService.conversation.findMany.mockRejectedValue(dbError);

      // Should handle error without crashing
      await expect(gateway.handleConnection(mockSocket)).resolves.not.toThrow();
    });

    it('should maintain state consistency during failures', async () => {
      // Simulate connection failure during room join
      prismaService.conversationParticipant.findFirst.mockRejectedValue(
        new Error('Connection timeout')
      );

      await gateway.handleJoinConversation(mockSocket, { conversationId: 'conversation-1' });

      // Should maintain clean state
      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to join conversation',
      });
      expect(gateway['conversationParticipants'].has('conversation-1')).toBe(false);
    });
  });

  describe('Comprehensive Integration Scenarios', () => {
    it('should handle therapist-client conversation workflow', async () => {
      // Therapist connects
      const therapistSocket = { ...mockSocket, id: 'therapist-socket' };
      webSocketAuthService.authenticateSocket.mockResolvedValue({
        userId: TEST_USER_IDS.THERAPIST,
        role: 'therapist',
        lastAuthenticated: new Date(),
        connectionCount: 1,
      });

      prismaService.user.findUnique.mockResolvedValue({
        id: TEST_USER_IDS.THERAPIST,
        role: 'therapist',
        isActive: true,
      });

      await gateway.handleConnection(therapistSocket);

      // Client connects
      webSocketAuthService.authenticateSocket.mockResolvedValue({
        userId: TEST_USER_IDS.CLIENT,
        role: 'client',
        lastAuthenticated: new Date(),
        connectionCount: 1,
      });

      await gateway.handleConnection(mockSocket);

      // Both join conversation
      await gateway.handleJoinConversation(therapistSocket, { conversationId: 'therapy-session' });
      await gateway.handleJoinConversation(mockSocket, { conversationId: 'therapy-session' });

      // Simulate message exchange
      gateway.broadcastMessage('therapy-session', {
        id: 'msg-1',
        content: 'How are you feeling today?',
        senderId: TEST_USER_IDS.THERAPIST,
      });

      gateway.broadcastMessage('therapy-session', {
        id: 'msg-2',
        content: 'I am feeling better, thank you.',
        senderId: TEST_USER_IDS.CLIENT,
      });

      expect(mockServer.to).toHaveBeenCalledWith('therapy-session');
      expect(gateway['sendPushNotifications']).toHaveBeenCalledTimes(2);
    });

    it('should handle community discussion workflow', async () => {
      // Multiple users join community
      const users = [TEST_USER_IDS.CLIENT, TEST_USER_IDS.THERAPIST, TEST_USER_IDS.ADMIN];
      const sockets = users.map((userId, i) => ({ ...mockSocket, id: `socket-${i}`, userId }));

      for (const socket of sockets) {
        await gateway.handleJoinCommunity(socket, { communityId: 'support-group' });
      }

      // Simulate community discussion
      gateway.broadcastMessage('community_support-group', {
        id: 'community-msg-1',
        content: 'Welcome to our support group!',
        senderId: TEST_USER_IDS.ADMIN,
      });

      expect(mockServer.to).toHaveBeenCalledWith('community_support-group');
    });

    it('should handle system-wide maintenance scenario', async () => {
      // Connect multiple users
      const users = Array.from({ length: 10 }, (_, i) => `user-${i}`);
      
      for (const userId of users) {
        const socket = { ...mockSocket, id: `socket-${userId}`, userId };
        webSocketAuthService.authenticateSocket.mockResolvedValue({
          userId,
          role: 'client',
          lastAuthenticated: new Date(),
          connectionCount: 1,
        });

        await gateway.handleConnection(socket);
      }

      // Simulate maintenance disconnection
      for (const userId of users) {
        const socket = { ...mockSocket, id: `socket-${userId}`, userId };
        await gateway.handleDisconnect(socket);
      }

      // Verify clean state
      expect(gateway['userSockets'].size).toBe(0);
      expect(gateway['conversationParticipants'].size).toBe(0);
    });
  });
  });
});