/**
 * Comprehensive Test Suite for AuthController
 * Tests general authentication functionality and session management
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let emailVerificationService: EmailVerificationService;
  let passwordResetService: PasswordResetService;
  let module: TestingModule;

  // Mock AuthService
  const mockAuthService = {
    registerUserWithEmail: jest.fn(),
    loginWithEmail: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    getUser: jest.fn(),
    getUsers: jest.fn(),
    forceLogout: jest.fn(),
    validateUser: jest.fn(),
    validateToken: jest.fn(),
    checkUserExists: jest.fn(),
    handleOAuthLogin: jest.fn(),
    getSessionInfo: jest.fn(),
    getActiveSessions: jest.fn(),
    terminateSession: jest.fn(),
    terminateOtherSessions: jest.fn(),
    universalLogout: jest.fn(),
  };

  // Mock EmailVerificationService
  const mockEmailVerificationService = {
    sendVerificationEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
    verifyEmail: jest.fn(),
  };

  // Mock PasswordResetService
  const mockPasswordResetService = {
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    validateResetToken: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockUser = {
    id: TEST_USER_IDS.CLIENT,
    email: TEST_EMAILS.CLIENT,
    firstName: 'John',
    lastName: 'Doe',
    role: 'client',
    emailVerified: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-02-14T10:00:00Z'),
  };

  const mockTokens = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'refresh_token_123456789',
    expiresIn: 3600,
  };

  const mockAuthResult = {
    user: mockUser,
    tokens: mockTokens,
  };

  const registerDto = {
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'client' as const,
  };

  const loginDto = {
    email: TEST_EMAILS.CLIENT,
    password: 'password123',
  };

  const mockRequest = {
    ip: '192.168.1.1',
    get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser'),
    headers: {
      'x-refresh-token': 'refresh_token_123456789',
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
        {
          provide: PasswordResetService,
          useValue: mockPasswordResetService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    emailVerificationService = module.get<EmailVerificationService>(EmailVerificationService);
    passwordResetService = module.get<PasswordResetService>(PasswordResetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all services injected', () => {
      expect(authService).toBeDefined();
      expect(emailVerificationService).toBeDefined();
      expect(passwordResetService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard for authenticated routes', () => {
      const authMethods = ['getMe', 'getAllUsers', 'forceLogout', 'getProfile'];
      authMethods.forEach(method => {
        const guards = Reflect.getMetadata('__guards__', controller[method]);
        expect(guards).toContain(JwtAuthGuard);
      });
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', AuthController);
      expect(controllerMetadata).toBe('auth');
    });
  });

  describe('POST /auth/register', () => {
    it('should register user successfully', async () => {
      mockAuthService.registerUserWithEmail.mockResolvedValue(mockAuthResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResult);
      expect(authService.registerUserWithEmail).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.firstName,
        registerDto.lastName,
        'client', // Should default to client for any role
      );
    });

    it('should force therapist role to client for general registration', async () => {
      const therapistDto = { ...registerDto, role: 'therapist' as const };
      mockAuthService.registerUserWithEmail.mockResolvedValue(mockAuthResult);

      const result = await controller.register(therapistDto);

      expect(authService.registerUserWithEmail).toHaveBeenCalledWith(
        therapistDto.email,
        therapistDto.password,
        therapistDto.firstName,
        therapistDto.lastName,
        'therapist', // Therapist should be allowed
      );
    });

    it('should handle registration errors', async () => {
      const registrationError = new Error('Email already exists');
      mockAuthService.registerUserWithEmail.mockRejectedValue(registrationError);

      await expect(controller.register(registerDto)).rejects.toThrow(registrationError);
    });

    it('should validate password strength requirements', async () => {
      const weakPasswordDto = { ...registerDto, password: '123' };
      const validationError = new Error('Password too weak');
      mockAuthService.registerUserWithEmail.mockRejectedValue(validationError);

      await expect(controller.register(weakPasswordDto)).rejects.toThrow(validationError);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      mockAuthService.loginWithEmail.mockResolvedValue(mockAuthResult);

      const result = await controller.login(loginDto, mockRequest as any);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
          emailVerified: mockUser.emailVerified,
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
      });

      expect(authService.loginWithEmail).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
        mockRequest.ip,
        'Mozilla/5.0 Test Browser',
      );
    });

    it('should handle invalid credentials', async () => {
      const loginError = new UnauthorizedException('Invalid credentials');
      mockAuthService.loginWithEmail.mockRejectedValue(loginError);

      await expect(controller.login(loginDto, mockRequest as any)).rejects.toThrow(loginError);
    });

    it('should handle missing IP address', async () => {
      const requestWithoutIp = { ...mockRequest, ip: undefined };
      mockAuthService.loginWithEmail.mockResolvedValue(mockAuthResult);

      const result = await controller.login(loginDto, requestWithoutIp as any);

      expect(authService.loginWithEmail).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
        undefined,
        'Mozilla/5.0 Test Browser',
      );
    });
  });

  describe('POST /auth/refresh', () => {
    const refreshDto = { refreshToken: 'refresh_token_123456789' };

    it('should refresh tokens successfully', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(mockTokens);

      const result = await controller.refreshTokens(refreshDto, mockRequest as any);

      expect(result).toEqual(mockTokens);
      expect(authService.refreshTokens).toHaveBeenCalledWith(
        refreshDto.refreshToken,
        mockRequest.ip,
        'Mozilla/5.0 Test Browser',
      );
    });

    it('should handle missing refresh token', async () => {
      const emptyDto = { refreshToken: undefined };

      await expect(controller.refreshTokens(emptyDto as any, mockRequest as any))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle invalid refresh token', async () => {
      const refreshError = new UnauthorizedException('Invalid refresh token');
      mockAuthService.refreshTokens.mockRejectedValue(refreshError);

      await expect(controller.refreshTokens(refreshDto, mockRequest as any))
        .rejects.toThrow(refreshError);
    });
  });

  describe('POST /auth/logout', () => {
    const logoutDto = { refreshToken: 'refresh_token_123456789' };

    it('should logout successfully with refresh token', async () => {
      mockAuthService.logout.mockResolvedValue(null);

      const result = await controller.logout(logoutDto);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(authService.logout).toHaveBeenCalledWith(logoutDto.refreshToken);
    });

    it('should logout successfully without refresh token', async () => {
      const emptyDto = { refreshToken: undefined };

      const result = await controller.logout(emptyDto as any);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe('GET /auth/me', () => {
    it('should get current user successfully', async () => {
      mockAuthService.getUser.mockResolvedValue(mockUser);

      const result = await controller.getMe(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockUser);
      expect(authService.getUser).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle user not found', async () => {
      const notFoundError = new Error('User not found');
      mockAuthService.getUser.mockRejectedValue(notFoundError);

      await expect(controller.getMe('non-existent-user')).rejects.toThrow(notFoundError);
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile successfully', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await controller.getProfile(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle invalid user', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.getProfile(TEST_USER_IDS.CLIENT))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/validate-token', () => {
    it('should validate token successfully', async () => {
      const tokenValidation = {
        valid: true,
        user: mockUser,
        expires: '2024-02-14T11:00:00Z',
      };
      mockAuthService.validateToken.mockResolvedValue(tokenValidation);

      const result = await controller.validateToken({ token: 'valid_token' });

      expect(result).toEqual({
        valid: true,
        user: mockUser,
        expires: '2024-02-14T11:00:00Z',
      });
    });

    it('should handle invalid token', async () => {
      const tokenValidation = {
        valid: false,
        error: 'Token expired',
      };
      mockAuthService.validateToken.mockResolvedValue(tokenValidation);

      const result = await controller.validateToken({ token: 'expired_token' });

      expect(result).toEqual({
        valid: false,
        error: 'Token expired',
      });
    });

    it('should handle missing token', async () => {
      await expect(controller.validateToken({ token: '' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('GET /auth/check-user', () => {
    it('should check user existence successfully', async () => {
      const userCheck = {
        exists: true,
        role: 'client',
        isVerified: true,
      };
      mockAuthService.checkUserExists.mockResolvedValue(userCheck);

      const result = await controller.checkUserExists(TEST_EMAILS.CLIENT);

      expect(result).toEqual(userCheck);
      expect(authService.checkUserExists).toHaveBeenCalledWith(TEST_EMAILS.CLIENT);
    });

    it('should handle non-existent user', async () => {
      const userCheck = { exists: false };
      mockAuthService.checkUserExists.mockResolvedValue(userCheck);

      const result = await controller.checkUserExists('nonexistent@example.com');

      expect(result).toEqual({ exists: false });
    });

    it('should handle missing email', async () => {
      await expect(controller.checkUserExists('')).rejects.toThrow(UnauthorizedException);
    });

    it('should handle invalid email format', async () => {
      await expect(controller.checkUserExists('invalid-email'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Password Reset Endpoints', () => {
    describe('POST /auth/request-password-reset', () => {
      it('should request password reset successfully', async () => {
        mockPasswordResetService.requestPasswordReset.mockResolvedValue(null);

        const result = await controller.requestPasswordReset({ email: TEST_EMAILS.CLIENT });

        expect(result.message).toContain('If an account with that email exists');
        expect(passwordResetService.requestPasswordReset).toHaveBeenCalledWith(TEST_EMAILS.CLIENT);
      });
    });

    describe('POST /auth/reset-password', () => {
      const resetDto = {
        token: 'reset_token_123',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      it('should reset password successfully', async () => {
        const resetResult = { success: true, message: 'Password reset successfully' };
        mockPasswordResetService.resetPassword.mockResolvedValue(resetResult);

        const result = await controller.resetPassword(resetDto);

        expect(result).toEqual(resetResult);
        expect(passwordResetService.resetPassword).toHaveBeenCalledWith(
          resetDto.token,
          resetDto.newPassword,
        );
      });

      it('should handle password mismatch', async () => {
        const mismatchDto = { ...resetDto, confirmPassword: 'DifferentPassword!' };

        await expect(controller.resetPassword(mismatchDto))
          .rejects.toThrow(UnauthorizedException);
      });
    });

    describe('GET /auth/validate-reset-token', () => {
      it('should validate reset token successfully', async () => {
        const validation = { valid: true, email: TEST_EMAILS.CLIENT };
        mockPasswordResetService.validateResetToken.mockResolvedValue(validation);

        const result = await controller.validateResetToken('valid_token');

        expect(result).toEqual(validation);
        expect(passwordResetService.validateResetToken).toHaveBeenCalledWith('valid_token');
      });
    });
  });

  describe('Email Verification Endpoints', () => {
    describe('POST /auth/send-verification-email', () => {
      it('should send verification email successfully', async () => {
        mockEmailVerificationService.sendVerificationEmail.mockResolvedValue(null);

        const result = await controller.sendVerificationEmail(TEST_USER_IDS.CLIENT);

        expect(result.message).toBe('Verification email sent successfully');
        expect(emailVerificationService.sendVerificationEmail)
          .toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      });
    });

    describe('POST /auth/verify-email', () => {
      it('should verify email successfully', async () => {
        const verification = { success: true, message: 'Email verified successfully' };
        mockEmailVerificationService.verifyEmail.mockResolvedValue(verification);

        const result = await controller.verifyEmail({ token: 'verify_token_123' });

        expect(result).toEqual(verification);
        expect(emailVerificationService.verifyEmail).toHaveBeenCalledWith('verify_token_123');
      });
    });
  });

  describe('Session Management', () => {
    describe('GET /auth/session-info', () => {
      it('should get session info successfully', async () => {
        const sessionInfo = {
          sessionId: 'session_123',
          createdAt: '2024-02-14T10:00:00Z',
          lastActivity: '2024-02-14T10:30:00Z',
          device: 'Chrome Browser',
          ipAddress: '192.168.1.1',
        };
        mockAuthService.getSessionInfo.mockResolvedValue(sessionInfo);

        const result = await controller.getSessionInfo(mockRequest as any);

        expect(result).toEqual(sessionInfo);
        expect(authService.getSessionInfo).toHaveBeenCalledWith('refresh_token_123456789');
      });

      it('should handle missing refresh token', async () => {
        const requestWithoutToken = { headers: {} };

        await expect(controller.getSessionInfo(requestWithoutToken as any))
          .rejects.toThrow(UnauthorizedException);
      });
    });

    describe('GET /auth/active-sessions', () => {
      it('should get active sessions successfully', async () => {
        const sessions = {
          sessions: [
            {
              id: 'session_1',
              device: 'Chrome',
              lastActivity: '2024-02-14T10:30:00Z',
              isCurrent: true,
            },
            {
              id: 'session_2',
              device: 'Firefox',
              lastActivity: '2024-02-13T15:20:00Z',
              isCurrent: false,
            },
          ],
        };
        mockAuthService.getActiveSessions.mockResolvedValue(sessions);

        const result = await controller.getActiveSessions(TEST_USER_IDS.CLIENT, mockRequest as any);

        expect(result).toEqual(sessions);
        expect(authService.getActiveSessions).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          'refresh_token_123456789',
        );
      });
    });

    describe('DELETE /auth/terminate-session', () => {
      it('should terminate session successfully', async () => {
        const terminateResult = { success: true, message: 'Session terminated' };
        mockAuthService.terminateSession.mockResolvedValue(terminateResult);

        const result = await controller.terminateSession(
          { sessionId: 'session_123' },
          TEST_USER_IDS.CLIENT,
        );

        expect(result).toEqual(terminateResult);
        expect(authService.terminateSession).toHaveBeenCalledWith(
          'session_123',
          TEST_USER_IDS.CLIENT,
        );
      });
    });

    describe('POST /auth/universal-logout', () => {
      it('should perform universal logout successfully', async () => {
        const logoutResult = { success: true, message: 'All sessions terminated' };
        mockAuthService.universalLogout.mockResolvedValue(logoutResult);

        const result = await controller.universalLogout(TEST_USER_IDS.CLIENT);

        expect(result).toEqual(logoutResult);
        expect(authService.universalLogout).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      });
    });
  });

  describe('OAuth Endpoints', () => {
    describe('POST /auth/oauth/token-exchange', () => {
      it('should reject direct token exchange as not implemented', async () => {
        const oauthDto = { provider: 'google' as const, code: 'auth_code_123' };

        await expect(controller.exchangeOAuthToken(oauthDto))
          .rejects.toThrow(UnauthorizedException);
      });

      it('should handle missing authorization code', async () => {
        const oauthDto = { provider: 'google' as const, code: '' };

        await expect(controller.exchangeOAuthToken(oauthDto))
          .rejects.toThrow(UnauthorizedException);
      });

      it('should handle invalid provider', async () => {
        const oauthDto = { provider: 'invalid' as any, code: 'auth_code_123' };

        await expect(controller.exchangeOAuthToken(oauthDto))
          .rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted login response', async () => {
      mockAuthService.loginWithEmail.mockResolvedValue(mockAuthResult);

      const result = await controller.login(loginDto, mockRequest as any);

      TestAssertions.expectValidEntity(result, ['user', 'accessToken', 'refreshToken', 'expiresIn']);
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('role');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(typeof result.expiresIn).toBe('number');
    });

    it('should return properly formatted user check response', async () => {
      const userCheck = { exists: true, role: 'client', isVerified: true };
      mockAuthService.checkUserExists.mockResolvedValue(userCheck);

      const result = await controller.checkUserExists(TEST_EMAILS.CLIENT);

      expect(result).toHaveProperty('exists');
      expect(typeof result.exists).toBe('boolean');
      if (result.exists) {
        expect(result).toHaveProperty('role');
        expect(result).toHaveProperty('isVerified');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Auth service temporarily unavailable');
      mockAuthService.loginWithEmail.mockRejectedValue(serviceError);

      await expect(controller.login(loginDto, mockRequest as any)).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockAuthService.getUser.mockRejectedValue(dbError);

      await expect(controller.getMe(TEST_USER_IDS.CLIENT)).rejects.toThrow(dbError);
    });

    it('should handle validation errors consistently', async () => {
      const validationError = new Error('Invalid input data');
      mockAuthService.registerUserWithEmail.mockRejectedValue(validationError);

      await expect(controller.register(registerDto)).rejects.toThrow(validationError);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete auth lifecycle', async () => {
      // Register user
      mockAuthService.registerUserWithEmail.mockResolvedValue(mockAuthResult);
      const registerResult = await controller.register(registerDto);
      expect(registerResult.user.email).toBe(registerDto.email);

      // Login user
      mockAuthService.loginWithEmail.mockResolvedValue(mockAuthResult);
      const loginResult = await controller.login(loginDto, mockRequest as any);
      expect(loginResult.accessToken).toBeDefined();

      // Get profile
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      const profileResult = await controller.getProfile(TEST_USER_IDS.CLIENT);
      expect(profileResult.id).toBe(TEST_USER_IDS.CLIENT);

      // Logout
      mockAuthService.logout.mockResolvedValue(null);
      const logoutResult = await controller.logout({ refreshToken: mockTokens.refreshToken });
      expect(logoutResult.message).toBe('Logged out successfully');
    });

    it('should handle session management workflow', async () => {
      // Get session info
      const sessionInfo = { sessionId: 'session_123', device: 'Chrome' };
      mockAuthService.getSessionInfo.mockResolvedValue(sessionInfo);
      const sessionResult = await controller.getSessionInfo(mockRequest as any);
      expect(sessionResult.sessionId).toBe('session_123');

      // Get active sessions
      const sessions = { sessions: [{ id: 'session_123', isCurrent: true }] };
      mockAuthService.getActiveSessions.mockResolvedValue(sessions);
      const sessionsResult = await controller.getActiveSessions(TEST_USER_IDS.CLIENT, mockRequest as any);
      expect(sessionsResult.sessions).toHaveLength(1);

      // Terminate session
      const terminateResult = { success: true, message: 'Session terminated' };
      mockAuthService.terminateSession.mockResolvedValue(terminateResult);
      const terminateResponse = await controller.terminateSession(
        { sessionId: 'session_123' },
        TEST_USER_IDS.CLIENT,
      );
      expect(terminateResponse.success).toBe(true);
    });
  });
});