import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetService } from './password-reset.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EmailService } from '../../services/email.service';
import { TokenService } from './token.service';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';

jest.mock('crypto');

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let prismaService: jest.Mocked<PrismaService>;
  let emailService: jest.Mocked<EmailService>;
  let tokenService: jest.Mocked<TokenService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    deactivatedAt: null,
    resetToken: null,
    resetTokenExpiry: null,
    password: 'current-hashed-password',
  };

  const mockUserWithToken = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    deactivatedAt: null,
    resetToken: 'hashed-token',
    resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    password: 'current-hashed-password',
  };

  const mockTokenData = {
    token: 'raw-token',
    hashedToken: 'hashed-token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendGenericEmail: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generatePasswordResetToken: jest.fn(),
            comparePassword: jest.fn(),
            hashPassword: jest.fn(),
            revokeAllUserTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    prismaService = module.get(PrismaService);
    emailService = module.get(EmailService);
    tokenService = module.get(TokenService);

    // Setup crypto mock
    (crypto.createHash as jest.Mock).mockImplementation(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('hashed-token'),
    }));

    // Setup environment variables
    process.env.FRONTEND_URL = 'https://mentara.com';
    process.env.SUPPORT_EMAIL = 'support@mentara.com';
    process.env.MIN_PASSWORD_LENGTH = '8';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email for valid user', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.generatePasswordResetToken.mockResolvedValue(mockTokenData);
      prismaService.user.update.mockResolvedValue(mockUser);
      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await service.requestPasswordReset('test@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          email: true,
          firstName: true,
          deactivatedAt: true,
          resetToken: true,
          resetTokenExpiry: true,
        },
      });

      expect(tokenService.generatePasswordResetToken).toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          resetToken: mockTokenData.hashedToken,
          resetTokenExpiry: mockTokenData.expiresAt,
        },
      });

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Reset Your Mentara Password',
        template: 'password-reset',
        data: {
          firstName: 'John',
          resetUrl: `https://mentara.com/reset-password?token=${mockTokenData.token}`,
          expiryTime: '1 hour',
          supportEmail: 'support@mentara.com',
        },
      });
    });

    it('should silently return for non-existent user (security)', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.requestPasswordReset('nonexistent@example.com')).resolves.not.toThrow();
      expect(tokenService.generatePasswordResetToken).not.toHaveBeenCalled();
      expect(emailService.sendGenericEmail).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for deactivated user', async () => {
      const deactivatedUser = {
        ...mockUser,
        deactivatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(deactivatedUser);

      await expect(service.requestPasswordReset('test@example.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for recent token request', async () => {
      const userWithRecentToken = {
        ...mockUser,
        resetToken: 'existing-token',
        resetTokenExpiry: new Date(Date.now() + 55 * 60 * 1000), // 55 minutes from now
      };

      prismaService.user.findUnique.mockResolvedValue(userWithRecentToken);

      await expect(service.requestPasswordReset('test@example.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow new token request for old token with less than 10 minutes remaining', async () => {
      const userWithOldToken = {
        ...mockUser,
        resetToken: 'existing-token',
        resetTokenExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      };

      prismaService.user.findUnique.mockResolvedValue(userWithOldToken);
      tokenService.generatePasswordResetToken.mockResolvedValue(mockTokenData);
      prismaService.user.update.mockResolvedValue(mockUser);
      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await service.requestPasswordReset('test@example.com');

      expect(tokenService.generatePasswordResetToken).toHaveBeenCalled();
    });

    it('should handle email service failure', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.generatePasswordResetToken.mockResolvedValue(mockTokenData);
      prismaService.user.update.mockResolvedValue(mockUser);
      emailService.sendGenericEmail.mockRejectedValue(new Error('Email service error'));

      await expect(service.requestPasswordReset('test@example.com')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPassword', () => {
    const validPassword = 'NewPassword123!';

    it('should reset password successfully', async () => {
      const token = 'valid-token';
      const hashedNewPassword = 'new-hashed-password';

      prismaService.user.findUnique.mockResolvedValue(mockUserWithToken);
      tokenService.comparePassword.mockResolvedValue(false); // New password is different
      tokenService.hashPassword.mockResolvedValue(hashedNewPassword);
      prismaService.user.update.mockResolvedValue(mockUser);
      tokenService.revokeAllUserTokens.mockResolvedValue(undefined);
      emailService.sendGenericEmail.mockResolvedValue(undefined);

      const result = await service.resetPassword(token, validPassword);

      expect(result).toEqual({
        success: true,
        message: 'Password reset successfully',
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          password: hashedNewPassword,
          resetToken: null,
          resetTokenExpiry: null,
          failedLoginCount: 0,
          lockoutUntil: null,
        },
      });

      expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith('user-123');
    });

    it('should throw BadRequestException for missing token', async () => {
      await expect(service.resetPassword('', validPassword)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for missing password', async () => {
      await expect(service.resetPassword('token', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for weak password', async () => {
      const weakPassword = 'weak';

      await expect(service.resetPassword('token', weakPassword)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid token', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', validPassword)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for expired token', async () => {
      const userWithExpiredToken = {
        ...mockUserWithToken,
        resetTokenExpiry: new Date(Date.now() - 1000),
      };

      prismaService.user.findUnique.mockResolvedValue(userWithExpiredToken);
      prismaService.user.update.mockResolvedValue(mockUser);

      await expect(service.resetPassword('expired-token', validPassword)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
    });

    it('should throw BadRequestException for deactivated user', async () => {
      const deactivatedUser = {
        ...mockUserWithToken,
        deactivatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(deactivatedUser);

      await expect(service.resetPassword('token', validPassword)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for same password', async () => {
      const token = 'valid-token';

      prismaService.user.findUnique.mockResolvedValue(mockUserWithToken);
      tokenService.comparePassword.mockResolvedValue(true); // Same password

      await expect(service.resetPassword(token, validPassword)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow password reset for user without existing password', async () => {
      const token = 'valid-token';
      const userWithoutPassword = {
        ...mockUserWithToken,
        password: null,
      };
      const hashedNewPassword = 'new-hashed-password';

      prismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
      tokenService.hashPassword.mockResolvedValue(hashedNewPassword);
      prismaService.user.update.mockResolvedValue(mockUser);
      tokenService.revokeAllUserTokens.mockResolvedValue(undefined);
      emailService.sendGenericEmail.mockResolvedValue(undefined);

      const result = await service.resetPassword(token, validPassword);

      expect(result.success).toBe(true);
      expect(tokenService.comparePassword).not.toHaveBeenCalled();
    });
  });

  describe('validateResetToken', () => {
    it('should validate token successfully', async () => {
      const token = 'valid-token';
      const userWithValidToken = {
        email: 'test@example.com',
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
        deactivatedAt: null,
      };

      prismaService.user.findUnique.mockResolvedValue(userWithValidToken);

      const result = await service.validateResetToken(token);

      expect(result).toEqual({
        valid: true,
        email: 'test@example.com',
      });
    });

    it('should return invalid for missing token', async () => {
      const result = await service.validateResetToken('');

      expect(result).toEqual({ valid: false });
    });

    it('should return invalid for non-existent token', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateResetToken('invalid-token');

      expect(result).toEqual({ valid: false });
    });

    it('should return invalid for deactivated user', async () => {
      const deactivatedUser = {
        email: 'test@example.com',
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
        deactivatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(deactivatedUser);

      const result = await service.validateResetToken('token');

      expect(result).toEqual({ valid: false });
    });

    it('should return invalid for expired token', async () => {
      const userWithExpiredToken = {
        email: 'test@example.com',
        resetTokenExpiry: new Date(Date.now() - 1000),
        deactivatedAt: null,
      };

      prismaService.user.findUnique.mockResolvedValue(userWithExpiredToken);

      const result = await service.validateResetToken('expired-token');

      expect(result).toEqual({ valid: false });
    });

    it('should return invalid for token without expiry', async () => {
      const userWithoutExpiry = {
        email: 'test@example.com',
        resetTokenExpiry: null,
        deactivatedAt: null,
      };

      prismaService.user.findUnique.mockResolvedValue(userWithoutExpiry);

      const result = await service.validateResetToken('token');

      expect(result).toEqual({ valid: false });
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const strongPassword = 'StrongPassword123!';
      expect(() => (service as any).validatePasswordStrength(strongPassword)).not.toThrow();
    });

    it('should throw for too short password', () => {
      const shortPassword = 'Ab1!';
      expect(() => (service as any).validatePasswordStrength(shortPassword)).toThrow(
        BadRequestException,
      );
    });

    it('should throw for password without uppercase', () => {
      const noUpperPassword = 'password123!';
      expect(() => (service as any).validatePasswordStrength(noUpperPassword)).toThrow(
        BadRequestException,
      );
    });

    it('should throw for password without lowercase', () => {
      const noLowerPassword = 'PASSWORD123!';
      expect(() => (service as any).validatePasswordStrength(noLowerPassword)).toThrow(
        BadRequestException,
      );
    });

    it('should throw for password without number', () => {
      const noNumberPassword = 'Password!';
      expect(() => (service as any).validatePasswordStrength(noNumberPassword)).toThrow(
        BadRequestException,
      );
    });

    it('should throw for password without special character', () => {
      const noSpecialPassword = 'Password123';
      expect(() => (service as any).validatePasswordStrength(noSpecialPassword)).toThrow(
        BadRequestException,
      );
    });

    it('should throw for common password', () => {
      const commonPassword = 'password123';
      expect(() => (service as any).validatePasswordStrength(commonPassword)).toThrow(
        BadRequestException,
      );
    });

    it('should use default min length when env variable not set', () => {
      delete process.env.MIN_PASSWORD_LENGTH;
      const shortPassword = 'Ab1!567'; // 7 characters
      expect(() => (service as any).validatePasswordStrength(shortPassword)).toThrow(
        BadRequestException,
      );
    });

    it('should accept various special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';
      for (const char of specialChars) {
        const password = `Password123${char}`;
        expect(() => (service as any).validatePasswordStrength(password)).not.toThrow();
      }
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should clean up expired reset tokens', async () => {
      prismaService.user.updateMany.mockResolvedValue({ count: 3 });

      await service.cleanupExpiredTokens();

      expect(prismaService.user.updateMany).toHaveBeenCalledWith({
        where: {
          resetTokenExpiry: {
            lt: expect.any(Date),
          },
        },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
    });
  });

  describe('sendPasswordResetEmail (private method)', () => {
    it('should send password reset email with correct template data', async () => {
      const email = 'test@example.com';
      const firstName = 'John';
      const token = 'reset-token';

      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await (service as any).sendPasswordResetEmail(email, firstName, token);

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: email,
        subject: 'Reset Your Mentara Password',
        template: 'password-reset',
        data: {
          firstName,
          resetUrl: `https://mentara.com/reset-password?token=${token}`,
          expiryTime: '1 hour',
          supportEmail: 'support@mentara.com',
        },
      });
    });

    it('should use default support email when env variable not set', async () => {
      delete process.env.SUPPORT_EMAIL;
      const email = 'test@example.com';
      const firstName = 'John';
      const token = 'reset-token';

      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await (service as any).sendPasswordResetEmail(email, firstName, token);

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: email,
        subject: 'Reset Your Mentara Password',
        template: 'password-reset',
        data: {
          firstName,
          resetUrl: `https://mentara.com/reset-password?token=${token}`,
          expiryTime: '1 hour',
          supportEmail: 'support@mentara.com',
        },
      });
    });

    it('should handle email service failure', async () => {
      const email = 'test@example.com';
      const firstName = 'John';
      const token = 'reset-token';

      emailService.sendGenericEmail.mockRejectedValue(new Error('Email service error'));

      await expect(
        (service as any).sendPasswordResetEmail(email, firstName, token),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendPasswordResetConfirmationEmail (private method)', () => {
    it('should send confirmation email after successful reset', async () => {
      const email = 'test@example.com';

      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await (service as any).sendPasswordResetConfirmationEmail(email);

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: email,
        subject: 'Password Reset Successful',
        template: 'password-reset-confirmation',
        data: {
          supportEmail: 'support@mentara.com',
          loginUrl: 'https://mentara.com/login',
        },
      });
    });

    it('should not throw error if confirmation email fails', async () => {
      const email = 'test@example.com';

      emailService.sendGenericEmail.mockRejectedValue(new Error('Email service error'));

      await expect(
        (service as any).sendPasswordResetConfirmationEmail(email),
      ).resolves.not.toThrow();
    });
  });

  describe('crypto hash integration', () => {
    it('should use crypto.createHash for token hashing', async () => {
      const token = 'test-token';
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed-token'),
      };

      (crypto.createHash as jest.Mock).mockReturnValue(mockHash);

      await service.validateResetToken(token);

      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockHash.update).toHaveBeenCalledWith(token);
      expect(mockHash.digest).toHaveBeenCalledWith('hex');
    });
  });

  describe('environment variable handling', () => {
    it('should handle missing FRONTEND_URL in reset email', async () => {
      delete process.env.FRONTEND_URL;
      const email = 'test@example.com';
      const firstName = 'John';
      const token = 'reset-token';

      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await (service as any).sendPasswordResetEmail(email, firstName, token);

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: email,
        subject: 'Reset Your Mentara Password',
        template: 'password-reset',
        data: {
          firstName,
          resetUrl: `undefined/reset-password?token=${token}`,
          expiryTime: '1 hour',
          supportEmail: 'support@mentara.com',
        },
      });
    });

    it('should handle missing FRONTEND_URL in confirmation email', async () => {
      delete process.env.FRONTEND_URL;
      const email = 'test@example.com';

      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await (service as any).sendPasswordResetConfirmationEmail(email);

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: email,
        subject: 'Password Reset Successful',
        template: 'password-reset-confirmation',
        data: {
          supportEmail: 'support@mentara.com',
          loginUrl: 'undefined/login',
        },
      });
    });
  });
});