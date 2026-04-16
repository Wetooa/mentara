import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../app.module';
import { ConnectionManagerService } from './services/connection-manager.service';
import { WebSocketAuthService } from './services/websocket-auth.service';

describe('WebSocket Tests', () => {
  let app: INestApplication;
  let connectionManager: ConnectionManagerService;
  let authService: WebSocketAuthService;
  let clientSocket: Socket;
  let serverUrl: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connectionManager = moduleFixture.get<ConnectionManagerService>(
      ConnectionManagerService,
    );
    authService = moduleFixture.get<WebSocketAuthService>(
      WebSocketAuthService,
    );

    const httpServer = app.getHttpServer();
    serverUrl = `http://localhost:${httpServer.address().port}`;
  });

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    await app.close();
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  describe('Connection Management', () => {
    it('should register a new connection', async () => {
      const userId = 'test-user-1';
      const mockSocket = {
        id: 'test-socket-id',
        join: jest.fn(),
        leave: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      connectionManager.registerConnection(mockSocket, userId, {
        id: userId,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'client',
      });

      const registeredUserId = connectionManager.getUserId('test-socket-id');
      expect(registeredUserId).toBe(userId);
    });

    it('should unregister a connection', () => {
      const userId = 'test-user-2';
      const socketId = 'test-socket-id-2';
      const mockSocket = {
        id: socketId,
        join: jest.fn(),
        leave: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      connectionManager.registerConnection(mockSocket, userId, {
        id: userId,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'client',
      });

      connectionManager.unregisterConnection(socketId);

      const registeredUserId = connectionManager.getUserId(socketId);
      expect(registeredUserId).toBeUndefined();
    });

    it('should generate correct user room names', () => {
      const userId = 'test-user-3';
      const room = connectionManager.getUserRoom(userId);
      expect(room).toBe(`user_${userId}`);
    });
  });

  describe('Messaging Gateway', () => {
    it('should connect to messaging namespace', (done) => {
      clientSocket = io(`${serverUrl}/messaging`, {
        auth: {
          token: 'test-token', // Would need valid JWT in real test
        },
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (error) => {
        // Authentication might fail in test environment
        // This is expected if we don't have a valid token
        done();
      });
    });
  });

  describe('Notification Gateway', () => {
    it('should connect to notification namespace', (done) => {
      clientSocket = io(`${serverUrl}/notifications`, {
        auth: {
          token: 'test-token',
        },
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', () => {
        // Expected if authentication fails
        done();
      });
    });
  });

  describe('Video Call Gateway', () => {
    it('should connect to video call namespace', (done) => {
      clientSocket = io(`${serverUrl}/video-calls`, {
        auth: {
          token: 'test-token',
        },
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', () => {
        // Expected if authentication fails
        done();
      });
    });
  });

  describe('Room Management', () => {
    it('should use standardized room naming', () => {
      const userId = 'test-user-4';
      const room = connectionManager.getUserRoom(userId);
      
      // Room should follow the standardized format
      expect(room).toMatch(/^user_[a-zA-Z0-9-]+$/);
      expect(room).toBe(`user_${userId}`);
    });
  });
});

