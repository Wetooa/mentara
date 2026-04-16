import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketAuthService, AuthenticatedUser } from './websocket-auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../providers/prisma-client.provider';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

describe('WebSocketAuthService', () => {
  let service: WebSocketAuthService;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: jest.Mocked<PrismaService>;
  let mockSocket: Partial<Socket>;

  const mockUser = {
    id: 'user-123',
    role: 'client',
    emailVerified: true,
    lockoutUntil: null,
    failedLoginCount: 0,
  };

  const mockJwtPayload = {
    sub: 'user-123',
    email: 'user@example.com',
    iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketAuthService,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WebSocketAuthService>(WebSocketAuthService);
    jwtService = module.get(JwtService);
    prismaService = module.get(PrismaService);

    // Mock socket with default properties
    mockSocket = {
      id: 'socket-123',
      handshake: {
        headers: {
          authorization: 'Bearer valid-token',
        },
        auth: {},
        query: {},
        address: '127.0.0.1',
      },
      conn: {
        remoteAddress: '127.0.0.1',
      },
    };

    // Clear any existing intervals
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticateSocket', () => {
    beforeEach(() => {
      jwtService.verify.mockReturnValue(mockJwtPayload);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
    });

    it('should authenticate socket successfully', async () => {
      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toEqual({
        userId: 'user-123',
        role: 'client',
        lastAuthenticated: expect.any(Date),
        connectionCount: 1,
      });
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
        algorithms: ['HS256'],
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'user-123',
          deactivatedAt: null,
          isActive: true,
        },
        select: {
          id: true,
          role: true,
          emailVerified: true,
          lockoutUntil: true,
          failedLoginCount: true,
        },
      });
    });

    it('should return null when no token is provided', async () => {
      mockSocket.handshake!.headers = {};

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should return null when token verification fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return null when token payload is invalid', async () => {
      jwtService.verify.mockReturnValue({
        sub: null,
        email: null,
        iat: Date.now() / 1000,
      });

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return null when token is stale', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        email: 'user@example.com',
        iat: Math.floor(Date.now() / 1000) - 25 * 60 * 60, // 25 hours ago
      });

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return null when user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
    });

    it('should return null when user account is locked', async () => {
      const lockedUser = {
        ...mockUser,
        lockoutUntil: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      };
      prismaService.user.findUnique.mockResolvedValue(lockedUser);

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
    });

    it('should allow connection when lockout period has expired', async () => {
      const unlockedUser = {
        ...mockUser,
        lockoutUntil: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      };
      prismaService.user.findUnique.mockResolvedValue(unlockedUser);

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toEqual({
        userId: 'user-123',
        role: 'client',
        lastAuthenticated: expect.any(Date),
        connectionCount: 1,
      });
    });

    it('should return null when connection limit is exceeded', async () => {
      // First, create max allowed connections
      const maxConnections = 5;
      for (let i = 0; i < maxConnections; i++) {
        const socketId = `socket-${i}`;
        await service.authenticateSocket({
          ...mockSocket,
          id: socketId,
        } as Socket);
      }

      // Try to create one more connection (should fail)
      const result = await service.authenticateSocket({
        ...mockSocket,
        id: 'socket-overflow',
      } as Socket);

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      prismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
    });

    it('should log successful authentication', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.authenticateSocket(mockSocket as Socket);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Socket socket-123 authenticated as user user-123 with role client (1 connections)',
      );
    });

    it('should log authentication failures', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
      mockSocket.handshake!.headers = {}; // No token

      await service.authenticateSocket(mockSocket as Socket);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Socket socket-123 connected without valid token',
      );
    });
  });

  describe('Token Extraction', () => {
    it('should extract token from Authorization header', async () => {
      mockSocket.handshake!.headers = {
        authorization: 'Bearer test-token',
      };

      await service.authenticateSocket(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('test-token', {
        algorithms: ['HS256'],
      });
    });

    it('should extract token from auth object', async () => {
      mockSocket.handshake!.headers = {};
      mockSocket.handshake!.auth = { token: 'auth-token' };

      await service.authenticateSocket(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('auth-token', {
        algorithms: ['HS256'],
      });
    });

    it('should extract token from query parameters', async () => {
      mockSocket.handshake!.headers = {};
      mockSocket.handshake!.auth = {};
      mockSocket.handshake!.query = { token: 'query-token' };

      await service.authenticateSocket(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('query-token', {
        algorithms: ['HS256'],
      });
    });

    it('should extract token from cookies', async () => {
      mockSocket.handshake!.headers = {
        cookie: '__session=cookie-token; other=value',
      };

      await service.authenticateSocket(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('cookie-token', {
        algorithms: ['HS256'],
      });
    });

    it('should handle malformed Authorization header', async () => {
      mockSocket.handshake!.headers = {
        authorization: 'Invalid header format',
      };

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should handle empty Bearer token', async () => {
      mockSocket.handshake!.headers = {
        authorization: 'Bearer ',
      };

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should handle complex cookie parsing', async () => {
      mockSocket.handshake!.headers = {
        cookie: 'first=value1; __session=session-token; last=value2; __session=duplicate',
      };

      await service.authenticateSocket(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('session-token', {
        algorithms: ['HS256'],
      });
    });

    it('should handle URL encoded cookies', async () => {
      mockSocket.handshake!.headers = {
        cookie: '__session=encoded%20token%20value',
      };

      await service.authenticateSocket(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('encoded token value', {
        algorithms: ['HS256'],
      });
    });

    it('should handle cookie parsing errors gracefully', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
      mockSocket.handshake!.headers = {
        cookie: '__session=%invalid%encoding',
      };

      // Mock decodeURIComponent to throw an error
      const originalDecodeURIComponent = global.decodeURIComponent;
      global.decodeURIComponent = jest.fn(() => {
        throw new Error('Invalid encoding');
      });

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to extract cookie value for __session:',
        expect.any(Error),
      );

      // Restore original function
      global.decodeURIComponent = originalDecodeURIComponent;
    });
  });

  describe('Rate Limiting', () => {
    it('should allow connections within rate limit', async () => {
      const ipAddress = '192.168.1.1';
      mockSocket.handshake!.headers = {
        'x-forwarded-for': ipAddress,
        authorization: 'Bearer valid-token',
      };

      // Make 5 connections (within limit of 10)
      for (let i = 0; i < 5; i++) {
        await service.authenticateSocket({
          ...mockSocket,
          id: `socket-${i}`,
        } as Socket);
      }

      // Should still allow connection
      const result = await service.authenticateSocket({
        ...mockSocket,
        id: 'socket-final',
      } as Socket);

      expect(result).toEqual({
        userId: 'user-123',
        role: 'client',
        lastAuthenticated: expect.any(Date),
        connectionCount: 6,
      });
    });

    it('should block connections exceeding rate limit', async () => {
      const ipAddress = '192.168.1.2';
      mockSocket.handshake!.headers = {
        'x-forwarded-for': ipAddress,
        authorization: 'Bearer valid-token',
      };

      // Make 10 failed connections (at the limit)
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      for (let i = 0; i < 10; i++) {
        await service.authenticateSocket({
          ...mockSocket,
          id: `socket-${i}`,
        } as Socket);
      }

      // Reset JWT service to return valid token
      jwtService.verify.mockReturnValue(mockJwtPayload);

      // Should be blocked due to rate limit
      const result = await service.authenticateSocket({
        ...mockSocket,
        id: 'socket-blocked',
      } as Socket);

      expect(result).toBeNull();
    });

    it('should reset rate limit after time window', async () => {
      const ipAddress = '192.168.1.3';
      mockSocket.handshake!.headers = {
        'x-forwarded-for': ipAddress,
        authorization: 'Bearer valid-token',
      };

      // Make 10 failed connections to hit rate limit
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      for (let i = 0; i < 10; i++) {
        await service.authenticateSocket({
          ...mockSocket,
          id: `socket-${i}`,
        } as Socket);
      }

      // Advance time by 1 minute and 1 second
      jest.advanceTimersByTime(61 * 1000);

      // Reset JWT service
      jwtService.verify.mockReturnValue(mockJwtPayload);

      // Should now allow connection
      const result = await service.authenticateSocket({
        ...mockSocket,
        id: 'socket-after-reset',
      } as Socket);

      expect(result).toEqual({
        userId: 'user-123',
        role: 'client',
        lastAuthenticated: expect.any(Date),
        connectionCount: 1,
      });
    });

    it('should extract IP from various headers', async () => {
      const testCases = [
        { header: 'x-forwarded-for', value: '203.0.113.195' },
        { header: 'x-real-ip', value: '203.0.113.196' },
      ];

      for (const testCase of testCases) {
        mockSocket.handshake!.headers = {
          [testCase.header]: testCase.value,
          authorization: 'Bearer valid-token',
        };

        await service.authenticateSocket({
          ...mockSocket,
          id: `socket-${testCase.header}`,
        } as Socket);

        // Should use the IP from header
        expect(jwtService.verify).toHaveBeenCalled();
      }
    });

    it('should use fallback IP when headers are not available', async () => {
      mockSocket.handshake!.headers = {
        authorization: 'Bearer valid-token',
      };
      mockSocket.handshake!.address = '10.0.0.1';

      await service.authenticateSocket(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalled();
    });

    it('should handle unknown IP addresses', async () => {
      mockSocket.handshake!.headers = {
        authorization: 'Bearer valid-token',
      };
      mockSocket.handshake!.address = undefined;
      mockSocket.conn!.remoteAddress = undefined;

      await service.authenticateSocket(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      jwtService.verify.mockReturnValue(mockJwtPayload);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateToken('valid-token');

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'user-123',
          deactivatedAt: null,
        },
        select: { id: true },
      });
    });

    it('should reject invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toBe(false);
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should reject token for non-existent user', async () => {
      jwtService.verify.mockReturnValue(mockJwtPayload);
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateToken('valid-token');

      expect(result).toBe(false);
    });

    it('should log validation warnings', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await service.validateToken('expired-token');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Token validation failed:',
        expect.any(Error),
      );
    });
  });

  describe('Connection Management', () => {
    it('should track multiple connections per user', async () => {
      // Create multiple connections for the same user
      for (let i = 0; i < 3; i++) {
        const result = await service.authenticateSocket({
          ...mockSocket,
          id: `socket-${i}`,
        } as Socket);

        expect(result?.connectionCount).toBe(i + 1);
      }
    });

    it('should clean up connection when socket disconnects', async () => {
      const socketId = 'socket-cleanup';
      await service.authenticateSocket({
        ...mockSocket,
        id: socketId,
      } as Socket);

      service.cleanupConnection(socketId);

      // Create another connection, should reset count
      const result = await service.authenticateSocket({
        ...mockSocket,
        id: 'socket-new',
      } as Socket);

      expect(result?.connectionCount).toBe(1);
    });

    it('should handle cleanup of non-existent connection', () => {
      // Should not throw error
      expect(() => service.cleanupConnection('non-existent')).not.toThrow();
    });
  });

  describe('Connection Statistics', () => {
    it('should return accurate connection statistics', async () => {
      // Create connections for different users
      for (let i = 0; i < 3; i++) {
        jwtService.verify.mockReturnValue({
          ...mockJwtPayload,
          sub: `user-${i}`,
        });
        prismaService.user.findUnique.mockResolvedValue({
          ...mockUser,
          id: `user-${i}`,
        });

        await service.authenticateSocket({
          ...mockSocket,
          id: `socket-${i}`,
        } as Socket);
      }

      const stats = service.getConnectionStats();

      expect(stats).toEqual({
        totalConnections: 3,
        uniqueUsers: 3,
        trackedIps: 1, // All connections from same IP
        maxConnectionsPerUser: 5,
        maxAttemptsPerMinute: 10,
      });
    });

    it('should count unique users correctly', async () => {
      // Create multiple connections for same user
      for (let i = 0; i < 3; i++) {
        await service.authenticateSocket({
          ...mockSocket,
          id: `socket-${i}`,
        } as Socket);
      }

      const stats = service.getConnectionStats();

      expect(stats.totalConnections).toBe(3);
      expect(stats.uniqueUsers).toBe(1);
    });
  });

  describe('Cleanup and Maintenance', () => {
    it('should clean up connection tracking periodically', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');

      // Trigger the cleanup interval
      jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes

      expect(loggerSpy).toHaveBeenCalledWith(
        'Cleaned up connection tracking data',
      );
    });

    it('should remove old connection attempts during cleanup', async () => {
      const ipAddress = '192.168.1.100';
      mockSocket.handshake!.headers = {
        'x-forwarded-for': ipAddress,
        authorization: 'Bearer invalid-token',
      };

      // Create some failed attempts
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await service.authenticateSocket({
        ...mockSocket,
        id: 'socket-old',
      } as Socket);

      // Advance time by more than 1 hour
      jest.advanceTimersByTime(61 * 60 * 1000);

      // Trigger cleanup
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Reset JWT service
      jwtService.verify.mockReturnValue(mockJwtPayload);

      // Should not be rate limited anymore
      const result = await service.authenticateSocket({
        ...mockSocket,
        id: 'socket-new',
      } as Socket);

      expect(result).toEqual({
        userId: 'user-123',
        role: 'client',
        lastAuthenticated: expect.any(Date),
        connectionCount: 1,
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle JWT verification errors gracefully', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token parsing failed');
      });

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Socket socket-123 authentication failed:',
        'Token parsing failed',
      );
    });

    it('should handle non-Error exceptions', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      jwtService.verify.mockImplementation(() => {
        throw 'String error';
      });

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Socket socket-123 authentication failed:',
        'String error',
      );
    });

    it('should handle missing socket properties', async () => {
      const malformedSocket = {
        id: 'socket-malformed',
        handshake: {
          headers: {},
          auth: {},
          query: {},
        },
      } as Socket;

      const result = await service.authenticateSocket(malformedSocket);

      expect(result).toBeNull();
    });

    it('should handle arrays in token sources', async () => {
      mockSocket.handshake!.query = { token: ['token1', 'token2'] };

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
      expect(jwtService.verify).not.toHaveBeenCalled();
    });
  });

  describe('Security Features', () => {
    it('should enforce algorithm restriction', async () => {
      await service.authenticateSocket(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
        algorithms: ['HS256'],
      });
    });

    it('should check for required payload fields', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        // Missing email field
        iat: Date.now() / 1000,
      });

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
    });

    it('should validate token freshness', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        email: 'user@example.com',
        iat: Math.floor(Date.now() / 1000) - 25 * 60 * 60, // 25 hours ago
      });

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
    });

    it('should check user active status', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        deactivatedAt: new Date(),
      });

      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete authentication flow', async () => {
      const result = await service.authenticateSocket(mockSocket as Socket);

      expect(result).toEqual({
        userId: 'user-123',
        role: 'client',
        lastAuthenticated: expect.any(Date),
        connectionCount: 1,
      });

      const stats = service.getConnectionStats();
      expect(stats.totalConnections).toBe(1);
      expect(stats.uniqueUsers).toBe(1);

      service.cleanupConnection('socket-123');
      const statsAfterCleanup = service.getConnectionStats();
      expect(statsAfterCleanup.totalConnections).toBe(0);
    });

    it('should handle multiple concurrent authentication attempts', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          service.authenticateSocket({
            ...mockSocket,
            id: `socket-${i}`,
          } as Socket),
        );
      }

      const results = await Promise.all(promises);

      expect(results.every(result => result !== null)).toBe(true);
      expect(results.map(r => r?.connectionCount)).toEqual([1, 2, 3]);
    });
  });
});