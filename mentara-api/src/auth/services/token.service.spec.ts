import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService, TokenPair } from './token.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

jest.mock('crypto');
jest.mock('bcrypt');

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'client',
    emailVerified: true,
    deactivatedAt: null,
    lockoutUntil: null,
    failedLoginCount: 0,
    lastLoginAt: null,
  };

  const mockRefreshToken = {
    id: 'token-123',
    token: 'hashed-token',
    userId: 'user-123',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    lastActivity: new Date(),
    revokedAt: null,
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    deviceName: 'Windows PC',
    location: 'Unknown Location',
    user: mockUser,
  };

  const mockJwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'client',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService);
    prismaService = module.get(PrismaService);

    // Setup crypto mock
    (crypto.randomBytes as jest.Mock).mockImplementation((size: number) => {
      return Buffer.from('a'.repeat(size * 2), 'hex');
    });

    (crypto.createHash as jest.Mock).mockImplementation(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('mocked-hash'),
    }));

    // Setup bcrypt mock
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Setup environment variables
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.BCRYPT_SALT_ROUNDS = '12';
    process.env.MAX_LOGIN_ATTEMPTS = '5';
    process.env.LOCKOUT_DURATION_MINUTES = '15';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens successfully', async () => {
      const expectedTokenPair = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: '1h',
      };

      jwtService.sign.mockReturnValue('access-token');
      prismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await service.generateTokenPair(
        'user-123',
        'test@example.com',
        'client',
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result).toEqual(expectedTokenPair);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: 'user-123',
          email: 'test@example.com',
          role: 'client',
        },
        { expiresIn: '1h' },
      );
      expect(prismaService.refreshToken.create).toHaveBeenCalled();
    });

    it('should generate token pair with default expiration when env not set', async () => {
      delete process.env.JWT_EXPIRES_IN;
      jwtService.sign.mockReturnValue('access-token');
      prismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await service.generateTokenPair(
        'user-123',
        'test@example.com',
        'client',
      );

      expect(result.expiresIn).toBe('1h');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const refreshToken = 'refresh-token';
      const newTokenPair = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: '1h',
      };

      prismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      prismaService.refreshToken.update.mockResolvedValue(mockRefreshToken);
      jwtService.sign.mockReturnValue('new-access-token');
      prismaService.refreshToken.create.mockResolvedValue({
        ...mockRefreshToken,
        token: 'new-hashed-token',
      });

      const result = await service.refreshAccessToken(
        refreshToken,
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result).toEqual(newTokenPair);
      expect(prismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: mockRefreshToken.id },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-token';
      prismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshAccessToken(refreshToken),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const refreshToken = 'expired-token';
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000),
      };

      prismaService.refreshToken.findUnique.mockResolvedValue(expiredToken);
      prismaService.refreshToken.delete.mockResolvedValue(expiredToken);

      await expect(
        service.refreshAccessToken(refreshToken),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: expiredToken.id },
      });
    });

    it('should throw UnauthorizedException for revoked refresh token', async () => {
      const refreshToken = 'revoked-token';
      const revokedToken = {
        ...mockRefreshToken,
        revokedAt: new Date(),
      };

      prismaService.refreshToken.findUnique.mockResolvedValue(revokedToken);

      await expect(
        service.refreshAccessToken(refreshToken),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for deactivated user', async () => {
      const refreshToken = 'valid-token';
      const tokenWithDeactivatedUser = {
        ...mockRefreshToken,
        user: { ...mockUser, deactivatedAt: new Date() },
      };

      prismaService.refreshToken.findUnique.mockResolvedValue(tokenWithDeactivatedUser);

      await expect(
        service.refreshAccessToken(refreshToken),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke refresh token successfully', async () => {
      const refreshToken = 'refresh-token';
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.revokeRefreshToken(refreshToken);

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          token: 'mocked-hash',
          revokedAt: null,
        },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all user tokens successfully', async () => {
      const userId = 'user-123';
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      await service.revokeAllUserTokens(userId);

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should clean up expired and revoked tokens', async () => {
      prismaService.refreshToken.deleteMany.mockResolvedValue({ count: 5 });

      await service.cleanupExpiredTokens();

      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { expiresAt: { lt: expect.any(Date) } },
            { revokedAt: { not: null } },
          ],
        },
      });
    });
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed-password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
    });

    it('should use default salt rounds when env not set', async () => {
      delete process.env.BCRYPT_SALT_ROUNDS;
      const password = 'password123';

      await service.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
    });
  });

  describe('comparePassword', () => {
    it('should compare password successfully', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed-password';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.comparePassword(password, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return false for invalid password', async () => {
      const password = 'wrong-password';
      const hashedPassword = 'hashed-password';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.comparePassword(password, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('generateEmailVerificationToken', () => {
    it('should generate email verification token successfully', async () => {
      const result = await service.generateEmailVerificationToken();

      expect(result).toEqual({
        token: expect.any(String),
        hashedToken: 'mocked-hash',
        expiresAt: expect.any(Date),
      });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate password reset token successfully', async () => {
      const result = await service.generatePasswordResetToken();

      expect(result).toEqual({
        token: expect.any(String),
        hashedToken: 'mocked-hash',
        expiresAt: expect.any(Date),
      });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    });
  });

  describe('checkAccountLockout', () => {
    it('should return false for non-locked account', async () => {
      const userId = 'user-123';
      prismaService.user.findUnique.mockResolvedValue({
        lockoutUntil: null,
        failedLoginCount: 2,
      });

      const result = await service.checkAccountLockout(userId);

      expect(result).toBe(false);
    });

    it('should return true for locked account', async () => {
      const userId = 'user-123';
      prismaService.user.findUnique.mockResolvedValue({
        lockoutUntil: new Date(Date.now() + 10 * 60 * 1000),
        failedLoginCount: 5,
      });

      const result = await service.checkAccountLockout(userId);

      expect(result).toBe(true);
    });

    it('should clear expired lockout', async () => {
      const userId = 'user-123';
      prismaService.user.findUnique.mockResolvedValue({
        lockoutUntil: new Date(Date.now() - 1000),
        failedLoginCount: 5,
      });
      prismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.checkAccountLockout(userId);

      expect(result).toBe(false);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          lockoutUntil: null,
          failedLoginCount: 0,
        },
      });
    });

    it('should return false for non-existent user', async () => {
      const userId = 'non-existent';
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.checkAccountLockout(userId);

      expect(result).toBe(false);
    });
  });

  describe('handleFailedLogin', () => {
    it('should increment failed login count', async () => {
      const userId = 'user-123';
      prismaService.user.findUnique.mockResolvedValue({
        failedLoginCount: 2,
      });
      prismaService.user.update.mockResolvedValue(mockUser);

      await service.handleFailedLogin(userId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { failedLoginCount: 3 },
      });
    });

    it('should lock account after max failed attempts', async () => {
      const userId = 'user-123';
      prismaService.user.findUnique.mockResolvedValue({
        failedLoginCount: 4,
      });
      prismaService.user.update.mockResolvedValue(mockUser);

      await service.handleFailedLogin(userId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          failedLoginCount: 5,
          lockoutUntil: expect.any(Date),
        },
      });
    });

    it('should handle non-existent user gracefully', async () => {
      const userId = 'non-existent';
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.handleFailedLogin(userId)).resolves.not.toThrow();
    });
  });

  describe('resetFailedLoginCount', () => {
    it('should reset failed login count and update last login', async () => {
      const userId = 'user-123';
      prismaService.user.update.mockResolvedValue(mockUser);

      await service.resetFailedLoginCount(userId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          failedLoginCount: 0,
          lockoutUntil: null,
          lastLoginAt: expect.any(Date),
        },
      });
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      jwtService.verify.mockReturnValue(mockJwtPayload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual({
        valid: true,
        payload: mockJwtPayload,
        expires: expect.any(String),
      });
    });

    it('should return invalid for expired token', async () => {
      const expiredPayload = {
        ...mockJwtPayload,
        exp: Math.floor(Date.now() / 1000) - 1000,
      };
      jwtService.verify.mockReturnValue(expiredPayload);

      const result = await service.validateToken('expired-token');

      expect(result).toEqual({
        valid: false,
        error: 'Token has expired',
      });
    });

    it('should return invalid for malformed token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toEqual({
        valid: false,
        error: 'Invalid token',
      });
    });
  });

  describe('getSessionInfo', () => {
    it('should return session info successfully', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);

      const result = await service.getSessionInfo('refresh-token');

      expect(result).toEqual({
        sessionId: mockRefreshToken.id,
        createdAt: mockRefreshToken.createdAt.toISOString(),
        lastActivity: mockRefreshToken.lastActivity.toISOString(),
        device: mockRefreshToken.deviceName,
        location: mockRefreshToken.location,
        ipAddress: mockRefreshToken.ipAddress,
        userAgent: mockRefreshToken.userAgent,
      });
    });

    it('should return null for invalid session', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(null);

      const result = await service.getSessionInfo('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired session', async () => {
      const expiredSession = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000),
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(expiredSession);

      const result = await service.getSessionInfo('expired-token');

      expect(result).toBeNull();
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions for user', async () => {
      const sessions = [mockRefreshToken];
      prismaService.refreshToken.findMany.mockResolvedValue(sessions);

      const result = await service.getActiveSessions('user-123');

      expect(result.sessions).toHaveLength(1);
      expect(result.sessions[0]).toEqual({
        id: mockRefreshToken.id,
        device: mockRefreshToken.deviceName,
        location: mockRefreshToken.location,
        lastActivity: mockRefreshToken.lastActivity.toISOString(),
        isCurrent: false,
        ipAddress: mockRefreshToken.ipAddress,
        userAgent: mockRefreshToken.userAgent,
        createdAt: mockRefreshToken.createdAt.toISOString(),
      });
    });

    it('should mark current session correctly', async () => {
      const sessions = [mockRefreshToken];
      prismaService.refreshToken.findMany.mockResolvedValue(sessions);

      const result = await service.getActiveSessions('user-123', 'current-token');

      expect(result.sessions[0].isCurrent).toBe(true);
    });
  });

  describe('terminateSession', () => {
    it('should terminate session successfully', async () => {
      const sessionId = 'session-123';
      const userId = 'user-123';
      prismaService.refreshToken.findFirst.mockResolvedValue(mockRefreshToken);
      prismaService.refreshToken.update.mockResolvedValue(mockRefreshToken);

      const result = await service.terminateSession(sessionId, userId);

      expect(result).toEqual({
        success: true,
        message: 'Session terminated successfully',
      });
      expect(prismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should handle non-existent session', async () => {
      const sessionId = 'non-existent';
      const userId = 'user-123';
      prismaService.refreshToken.findFirst.mockResolvedValue(null);

      const result = await service.terminateSession(sessionId, userId);

      expect(result).toEqual({
        success: false,
        message: 'Session not found or already terminated',
      });
    });
  });

  describe('terminateOtherSessions', () => {
    it('should terminate other sessions successfully', async () => {
      const userId = 'user-123';
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.terminateOtherSessions(userId);

      expect(result).toEqual({
        success: true,
        terminatedCount: 2,
        message: '2 sessions terminated successfully',
      });
    });

    it('should exclude current session when provided', async () => {
      const userId = 'user-123';
      const currentToken = 'current-token';
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.terminateOtherSessions(userId, currentToken);

      expect(result.terminatedCount).toBe(1);
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          revokedAt: null,
          token: { not: 'mocked-hash' },
        },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('updateSessionActivity', () => {
    it('should update session activity successfully', async () => {
      const refreshToken = 'refresh-token';
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.updateSessionActivity(refreshToken);

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          token: 'mocked-hash',
          revokedAt: null,
        },
        data: {
          lastActivity: expect.any(Date),
        },
      });
    });
  });

  describe('extractDeviceInfo', () => {
    it('should extract Android device info', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36';
      const result = (service as any).extractDeviceInfo(userAgent);
      expect(result).toBe('Android Device');
    });

    it('should extract iPhone device info', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15';
      const result = (service as any).extractDeviceInfo(userAgent);
      expect(result).toBe('iPhone');
    });

    it('should extract Windows PC info', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const result = (service as any).extractDeviceInfo(userAgent);
      expect(result).toBe('Windows PC');
    });

    it('should extract Mac info', () => {
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
      const result = (service as any).extractDeviceInfo(userAgent);
      expect(result).toBe('Mac');
    });

    it('should return Unknown Device for undefined userAgent', () => {
      const result = (service as any).extractDeviceInfo(undefined);
      expect(result).toBe('Unknown Device');
    });
  });

  describe('getLocationFromIP', () => {
    it('should return Local for localhost IP', async () => {
      const result = await (service as any).getLocationFromIP('127.0.0.1');
      expect(result).toBe('Local');
    });

    it('should return Local for IPv6 localhost', async () => {
      const result = await (service as any).getLocationFromIP('::1');
      expect(result).toBe('Local');
    });

    it('should return Unknown Location for other IPs', async () => {
      const result = await (service as any).getLocationFromIP('192.168.1.1');
      expect(result).toBe('Unknown Location');
    });

    it('should return Unknown Location for undefined IP', async () => {
      const result = await (service as any).getLocationFromIP(undefined);
      expect(result).toBe('Local');
    });
  });
});