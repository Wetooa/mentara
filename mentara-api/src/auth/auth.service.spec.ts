import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';
import { TokenService } from './services/token.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRegisteredEvent } from '../common/events/user-events';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let eventBusService: jest.Mocked<EventBusService>;
  let tokenService: jest.Mocked<TokenService>;
  let emailVerificationService: jest.Mocked<EmailVerificationService>;
  let passwordResetService: jest.Mocked<PasswordResetService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'client',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deactivatedAt: null,
    password: 'hashedPassword123',
    lockoutUntil: null,
    failedLoginCount: 0,
    client: { userId: 'user-123' },
    therapist: null,
  };

  const mockTokens = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    expiresIn: 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            client: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            therapist: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: EventBusService,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokenPair: jest.fn(),
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
            generateEmailVerificationToken: jest.fn(),
            checkAccountLockout: jest.fn(),
            handleFailedLogin: jest.fn(),
            resetFailedLoginCount: jest.fn(),
            refreshAccessToken: jest.fn(),
            revokeRefreshToken: jest.fn(),
            revokeAllUserTokens: jest.fn(),
            validateToken: jest.fn(),
            getSessionInfo: jest.fn(),
            getActiveSessions: jest.fn(),
            terminateSession: jest.fn(),
            terminateOtherSessions: jest.fn(),
          },
        },
        {
          provide: EmailVerificationService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            verifyEmail: jest.fn(),
            resendVerificationEmail: jest.fn(),
          },
        },
        {
          provide: PasswordResetService,
          useValue: {
            requestPasswordReset: jest.fn(),
            resetPassword: jest.fn(),
            validateResetToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    eventBusService = module.get(EventBusService);
    tokenService = module.get(TokenService);
    emailVerificationService = module.get(EmailVerificationService);
    passwordResetService = module.get(PasswordResetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerClient', () => {
    it('should register a new client successfully', async () => {
      const userData = {
        email: 'client@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Client',
      };

      // Mock the registration process
      prismaService.user.findUnique.mockResolvedValue(null);
      tokenService.hashPassword.mockResolvedValue('hashedPassword123');
      tokenService.generateEmailVerificationToken.mockResolvedValue({
        hashedToken: 'token123',
        expiresAt: new Date(Date.now() + 3600000),
      });
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.client.create.mockResolvedValue({ userId: mockUser.id });
      emailVerificationService.sendVerificationEmail.mockResolvedValue(undefined);
      eventBusService.emit.mockResolvedValue(undefined);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.registerClient(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
      );

      expect(result).toEqual({
        user: mockUser,
        tokens: mockTokens,
        message: 'Client registered successfully. Please check your email to verify your account.',
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(prismaService.client.create).toHaveBeenCalledWith({
        data: { userId: mockUser.id },
      });
      expect(eventBusService.emit).toHaveBeenCalledWith(
        expect.any(UserRegisteredEvent),
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.registerClient('existing@example.com', 'password', 'John', 'Doe'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      prismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(
        service.registerClient('test@example.com', 'password', 'John', 'Doe'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('registerTherapist', () => {
    it('should register a new therapist successfully', async () => {
      const userData = {
        email: 'therapist@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Therapist',
      };

      const therapistUser = { ...mockUser, role: 'therapist' };
      
      prismaService.user.findUnique.mockResolvedValue(null);
      tokenService.hashPassword.mockResolvedValue('hashedPassword123');
      tokenService.generateEmailVerificationToken.mockResolvedValue({
        hashedToken: 'token123',
        expiresAt: new Date(Date.now() + 3600000),
      });
      prismaService.user.create.mockResolvedValue(therapistUser);
      prismaService.therapist.create.mockResolvedValue({ userId: therapistUser.id });
      emailVerificationService.sendVerificationEmail.mockResolvedValue(undefined);
      eventBusService.emit.mockResolvedValue(undefined);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.registerTherapist(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
      );

      expect(result).toEqual({
        user: therapistUser,
        tokens: mockTokens,
        message: 'Therapist registered successfully. Please check your email to verify your account. Your application is pending approval.',
      });
      expect(prismaService.therapist.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: therapistUser.id,
          status: 'pending',
        }),
      });
    });
  });

  describe('loginWithEmail', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.checkAccountLockout.mockResolvedValue(false);
      tokenService.comparePassword.mockResolvedValue(true);
      tokenService.resetFailedLoginCount.mockResolvedValue(undefined);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.loginWithEmail(loginData.email, loginData.password);

      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        }),
        tokens: mockTokens,
      });
      expect(tokenService.comparePassword).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.loginWithEmail('invalid@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for deactivated account', async () => {
      const deactivatedUser = { ...mockUser, deactivatedAt: new Date() };
      prismaService.user.findUnique.mockResolvedValue(deactivatedUser);

      await expect(
        service.loginWithEmail('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.checkAccountLockout.mockResolvedValue(true);

      await expect(
        service.loginWithEmail('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.checkAccountLockout.mockResolvedValue(false);
      tokenService.comparePassword.mockResolvedValue(false);
      tokenService.handleFailedLogin.mockResolvedValue(undefined);

      await expect(
        service.loginWithEmail('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unverified email', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      prismaService.user.findUnique.mockResolvedValue(unverifiedUser);
      tokenService.checkAccountLockout.mockResolvedValue(false);
      tokenService.comparePassword.mockResolvedValue(true);

      await expect(
        service.loginWithEmail('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for user without password', async () => {
      const userWithoutPassword = { ...mockUser, password: null };
      prismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      await expect(
        service.loginWithEmail('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const token = 'valid-token';
      const tokenPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      tokenService.validateToken.mockResolvedValue({
        valid: true,
        payload: tokenPayload,
        expires: '2024-12-31T23:59:59Z',
      });
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateToken(token);

      expect(result).toEqual({
        valid: true,
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
        expires: '2024-12-31T23:59:59Z',
      });
    });

    it('should return invalid for invalid token', async () => {
      const token = 'invalid-token';
      tokenService.validateToken.mockResolvedValue({
        valid: false,
        error: 'Token expired',
      });

      const result = await service.validateToken(token);

      expect(result).toEqual({
        valid: false,
        error: 'Token expired',
      });
    });

    it('should return invalid for non-existent user', async () => {
      const token = 'valid-token';
      const tokenPayload = {
        sub: 'non-existent-user',
        email: 'test@example.com',
        role: 'client',
      };

      tokenService.validateToken.mockResolvedValue({
        valid: true,
        payload: tokenPayload,
        expires: '2024-12-31T23:59:59Z',
      });
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateToken(token);

      expect(result).toEqual({
        valid: false,
        error: 'User not found or deactivated',
      });
    });

    it('should return invalid for role mismatch', async () => {
      const token = 'valid-token';
      const tokenPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: 'admin', // Different role
      };

      tokenService.validateToken.mockResolvedValue({
        valid: true,
        payload: tokenPayload,
        expires: '2024-12-31T23:59:59Z',
      });
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateToken(token);

      expect(result).toEqual({
        valid: false,
        error: 'Role mismatch - token invalid',
      });
    });
  });

  describe('checkUserExists', () => {
    it('should return true for existing active user', async () => {
      const activeUser = { ...mockUser, isActive: true };
      prismaService.user.findUnique.mockResolvedValue(activeUser);

      const result = await service.checkUserExists('test@example.com');

      expect(result).toEqual({
        exists: true,
        role: mockUser.role,
        isVerified: mockUser.emailVerified,
      });
    });

    it('should return false for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.checkUserExists('nonexistent@example.com');

      expect(result).toEqual({ exists: false });
    });

    it('should return false for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      prismaService.user.findUnique.mockResolvedValue(inactiveUser);

      const result = await service.checkUserExists('test@example.com');

      expect(result).toEqual({ exists: false });
    });

    it('should return false on database error', async () => {
      prismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await service.checkUserExists('test@example.com');

      expect(result).toEqual({ exists: false });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user-123';
      const currentPassword = 'currentPassword';
      const newPassword = 'newPassword123';
      const hashedNewPassword = 'hashedNewPassword123';

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.comparePassword
        .mockResolvedValueOnce(true) // Current password valid
        .mockResolvedValueOnce(false); // New password different
      tokenService.hashPassword.mockResolvedValue(hashedNewPassword);
      prismaService.user.update.mockResolvedValue({ ...mockUser, password: hashedNewPassword });
      tokenService.revokeAllUserTokens.mockResolvedValue(undefined);

      const result = await service.changePassword(userId, currentPassword, newPassword);

      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully. Please log in again.',
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
      expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException for invalid current password', async () => {
      const userId = 'user-123';
      const currentPassword = 'wrongPassword';
      const newPassword = 'newPassword123';

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.comparePassword.mockResolvedValue(false);

      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for same password', async () => {
      const userId = 'user-123';
      const currentPassword = 'samePassword';
      const newPassword = 'samePassword';

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.comparePassword
        .mockResolvedValueOnce(true) // Current password valid
        .mockResolvedValueOnce(true); // New password same

      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const userId = 'non-existent-user';
      const currentPassword = 'password';
      const newPassword = 'newPassword';

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for user without password', async () => {
      const userId = 'user-123';
      const currentPassword = 'password';
      const newPassword = 'newPassword';
      const userWithoutPassword = { ...mockUser, password: null };

      prismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleOAuthLogin', () => {
    it('should login existing user successfully', async () => {
      const oauthUser = {
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'https://example.com/avatar.jpg',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.handleOAuthLogin(oauthUser, 'google', 'client');

      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        }),
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
        message: 'Login successful',
      });
    });

    it('should create new user for OAuth login', async () => {
      const oauthUser = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        picture: 'https://example.com/avatar.jpg',
      };

      const newUser = {
        id: 'new-user-123',
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        role: 'client',
        emailVerified: true,
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(newUser);
      prismaService.client.create.mockResolvedValue({ userId: newUser.id });
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);
      eventBusService.emit.mockResolvedValue(undefined);

      const result = await service.handleOAuthLogin(oauthUser, 'google', 'client');

      expect(result).toEqual({
        user: newUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
        message: 'Account created successfully',
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: oauthUser.email,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          role: 'client',
          emailVerified: true,
          avatarUrl: oauthUser.picture,
        }),
        select: expect.any(Object),
      });
      expect(eventBusService.emit).toHaveBeenCalledWith(
        expect.any(UserRegisteredEvent),
      );
    });

    it('should default to client role for invalid role', async () => {
      const oauthUser = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        picture: 'https://example.com/avatar.jpg',
      };

      const newUser = {
        id: 'new-user-123',
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        role: 'client',
        emailVerified: true,
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(newUser);
      prismaService.client.create.mockResolvedValue({ userId: newUser.id });
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);
      eventBusService.emit.mockResolvedValue(undefined);

      const result = await service.handleOAuthLogin(oauthUser, 'google', 'invalid-role');

      expect(result.user.role).toBe('client');
    });
  });

  describe('deactivateAccount', () => {
    it('should deactivate account successfully', async () => {
      const userId = 'user-123';
      const reason = 'User request';
      const deactivatedBy = 'admin-123';

      prismaService.user.update.mockResolvedValue({ ...mockUser, deactivatedAt: new Date() });
      tokenService.revokeAllUserTokens.mockResolvedValue(undefined);

      const result = await service.deactivateAccount(userId, reason, deactivatedBy);

      expect(result).toEqual({
        success: true,
        message: 'Account deactivated successfully',
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          deactivatedAt: expect.any(Date),
          deactivatedBy,
          deactivationReason: reason,
        },
      });
      expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(userId);
    });
  });

  describe('reactivateAccount', () => {
    it('should reactivate account successfully', async () => {
      const userId = 'user-123';

      prismaService.user.update.mockResolvedValue({ ...mockUser, deactivatedAt: null });

      const result = await service.reactivateAccount(userId);

      expect(result).toEqual({
        success: true,
        message: 'Account reactivated successfully',
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          deactivatedAt: null,
          deactivatedBy: null,
          deactivationReason: null,
          failedLoginCount: 0,
          lockoutUntil: null,
        },
      });
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'refresh-token-123';
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };

      tokenService.refreshAccessToken.mockResolvedValue(newTokens);

      const result = await service.refreshTokens(refreshToken);

      expect(result).toEqual(newTokens);
      expect(tokenService.refreshAccessToken).toHaveBeenCalledWith(
        refreshToken,
        undefined,
        undefined,
      );
    });
  });

  describe('getUsers', () => {
    it('should get all active users', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-456', email: 'user2@example.com' }];
      prismaService.user.findMany.mockResolvedValue(users);

      const result = await service.getUsers();

      expect(result).toEqual(users);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { deactivatedAt: null },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getUser', () => {
    it('should get user by ID', async () => {
      const userId = 'user-123';
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUser(userId);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId, deactivatedAt: null },
        select: expect.any(Object),
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const userId = 'non-existent-user';
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUser(userId)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      const userId = 'user-123';
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId, deactivatedAt: null },
        select: expect.any(Object),
      });
    });
  });

  describe('forceLogout', () => {
    it('should force logout user successfully', async () => {
      const userId = 'user-123';
      tokenService.revokeAllUserTokens.mockResolvedValue(undefined);

      const result = await service.forceLogout(userId);

      expect(result).toEqual({
        success: true,
        message: 'User sessions revoked successfully',
      });
      expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(userId);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const userId = 'user-123';
      tokenService.revokeAllUserTokens.mockRejectedValue(new Error('Database error'));

      await expect(service.forceLogout(userId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Session Management', () => {
    it('should get session info successfully', async () => {
      const refreshToken = 'refresh-token-123';
      const sessionInfo = {
        id: 'session-123',
        userId: 'user-123',
        createdAt: new Date(),
        lastUsedAt: new Date(),
      };

      tokenService.getSessionInfo.mockResolvedValue(sessionInfo);

      const result = await service.getSessionInfo(refreshToken);

      expect(result).toEqual(sessionInfo);
      expect(tokenService.getSessionInfo).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw UnauthorizedException for invalid session', async () => {
      const refreshToken = 'invalid-refresh-token';
      tokenService.getSessionInfo.mockResolvedValue(null);

      await expect(service.getSessionInfo(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should get active sessions for user', async () => {
      const userId = 'user-123';
      const sessions = [
        { id: 'session-1', userId, createdAt: new Date() },
        { id: 'session-2', userId, createdAt: new Date() },
      ];

      tokenService.getActiveSessions.mockResolvedValue(sessions);

      const result = await service.getActiveSessions(userId);

      expect(result).toEqual(sessions);
      expect(tokenService.getActiveSessions).toHaveBeenCalledWith(userId, undefined);
    });

    it('should terminate specific session', async () => {
      const sessionId = 'session-123';
      const userId = 'user-123';
      const terminationResult = { success: true, message: 'Session terminated' };

      tokenService.terminateSession.mockResolvedValue(terminationResult);

      const result = await service.terminateSession(sessionId, userId);

      expect(result).toEqual(terminationResult);
      expect(tokenService.terminateSession).toHaveBeenCalledWith(sessionId, userId);
    });

    it('should terminate other sessions', async () => {
      const userId = 'user-123';
      const currentRefreshToken = 'current-refresh-token';
      const terminationResult = { success: true, terminatedSessions: 2 };

      tokenService.terminateOtherSessions.mockResolvedValue(terminationResult);

      const result = await service.terminateOtherSessions(userId, currentRefreshToken);

      expect(result).toEqual(terminationResult);
      expect(tokenService.terminateOtherSessions).toHaveBeenCalledWith(userId, currentRefreshToken);
    });

    it('should perform universal logout', async () => {
      const userId = 'user-123';
      tokenService.revokeAllUserTokens.mockResolvedValue(undefined);

      const result = await service.universalLogout(userId);

      expect(result).toEqual({
        success: true,
        message: 'All sessions terminated successfully',
      });
      expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(userId);
    });
  });

  describe('First-Time User Flow', () => {
    it('should get first sign-in status for new user', async () => {
      const userId = 'user-123';
      const client = {
        hasSeenTherapistRecommendations: false,
        createdAt: new Date(),
      };

      prismaService.client.findUnique.mockResolvedValue(client);

      const result = await service.getFirstSignInStatus(userId);

      expect(result).toEqual({
        isFirstTime: true,
        needsWelcomeFlow: true,
        memberSince: client.createdAt,
      });
    });

    it('should get first sign-in status for returning user', async () => {
      const userId = 'user-123';
      const client = {
        hasSeenTherapistRecommendations: true,
        createdAt: new Date(),
      };

      prismaService.client.findUnique.mockResolvedValue(client);

      const result = await service.getFirstSignInStatus(userId);

      expect(result).toEqual({
        isFirstTime: false,
        needsWelcomeFlow: false,
        memberSince: client.createdAt,
      });
    });

    it('should mark recommendations as seen', async () => {
      const userId = 'user-123';
      const updatedClient = {
        hasSeenTherapistRecommendations: true,
        updatedAt: new Date(),
      };

      prismaService.client.update.mockResolvedValue(updatedClient);

      const result = await service.markRecommendationsSeen(userId);

      expect(result).toEqual({
        success: true,
        hasSeenRecommendations: true,
        markedAt: updatedClient.updatedAt,
        message: 'Recommendations marked as seen successfully',
      });
    });
  });

  describe('Email Verification', () => {
    it('should verify email successfully', async () => {
      const token = 'verification-token';
      const verificationResult = { success: true, message: 'Email verified' };

      emailVerificationService.verifyEmail.mockResolvedValue(verificationResult);

      const result = await service.verifyEmail(token);

      expect(result).toEqual(verificationResult);
      expect(emailVerificationService.verifyEmail).toHaveBeenCalledWith(token);
    });

    it('should resend verification email', async () => {
      const email = 'test@example.com';
      emailVerificationService.resendVerificationEmail.mockResolvedValue(undefined);

      await service.resendVerificationEmail(email);

      expect(emailVerificationService.resendVerificationEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('Password Reset', () => {
    it('should request password reset', async () => {
      const email = 'test@example.com';
      passwordResetService.requestPasswordReset.mockResolvedValue(undefined);

      await service.requestPasswordReset(email);

      expect(passwordResetService.requestPasswordReset).toHaveBeenCalledWith(email);
    });

    it('should reset password successfully', async () => {
      const token = 'reset-token';
      const newPassword = 'newPassword123';
      const resetResult = { success: true, message: 'Password reset successful' };

      passwordResetService.resetPassword.mockResolvedValue(resetResult);

      const result = await service.resetPassword(token, newPassword);

      expect(result).toEqual(resetResult);
      expect(passwordResetService.resetPassword).toHaveBeenCalledWith(token, newPassword);
    });

    it('should validate reset token', async () => {
      const token = 'reset-token';
      const validationResult = { valid: true, email: 'test@example.com' };

      passwordResetService.validateResetToken.mockResolvedValue(validationResult);

      const result = await service.validateResetToken(token);

      expect(result).toEqual(validationResult);
      expect(passwordResetService.validateResetToken).toHaveBeenCalledWith(token);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const refreshToken = 'refresh-token-123';
      tokenService.revokeRefreshToken.mockResolvedValue(undefined);

      await service.logout(refreshToken);

      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });
});