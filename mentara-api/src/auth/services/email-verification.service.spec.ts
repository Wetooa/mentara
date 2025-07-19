import { Test, TestingModule } from '@nestjs/testing';
import { EmailVerificationService } from './email-verification.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EmailService } from '../../email/email.service';
import { TokenService } from './token.service';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';

jest.mock('crypto');

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let prismaService: jest.Mocked<PrismaService>;
  let emailService: jest.Mocked<EmailService>;
  let tokenService: jest.Mocked<TokenService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    emailVerified: false,
    emailVerifyToken: null,
    emailVerifyTokenExp: null,
  };

  const mockVerifiedUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    emailVerified: true,
    emailVerifyToken: 'hashed-token',
    emailVerifyTokenExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  const mockUserWithToken = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    emailVerified: false,
    emailVerifyToken: 'hashed-token',
    emailVerifyTokenExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  const mockTokenData = {
    token: 'raw-token',
    hashedToken: 'hashed-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
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
            generateEmailVerificationToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailVerificationService>(EmailVerificationService);
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email for user without existing token', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.generateEmailVerificationToken.mockResolvedValue(mockTokenData);
      prismaService.user.update.mockResolvedValue(mockUser);
      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await service.sendVerificationEmail('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          firstName: true,
          emailVerified: true,
          emailVerifyToken: true,
          emailVerifyTokenExp: true,
        },
      });

      expect(tokenService.generateEmailVerificationToken).toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          emailVerifyToken: mockTokenData.hashedToken,
          emailVerifyTokenExp: mockTokenData.expiresAt,
        },
      });

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Verify Your Mentara Account',
        template: 'email-verification',
        data: {
          firstName: mockUser.firstName,
          verificationUrl: `https://mentara.com/verify-email?token=${mockTokenData.token}`,
          supportEmail: 'support@mentara.com',
        },
      });
    });

    it('should resend existing valid token without generating new one', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserWithToken);
      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await service.sendVerificationEmail('user-123');

      expect(tokenService.generateEmailVerificationToken).not.toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: mockUserWithToken.email,
        subject: 'Verify Your Mentara Account',
        template: 'email-verification',
        data: {
          firstName: mockUserWithToken.firstName,
          verificationUrl: `https://mentara.com/verify-email?token=${mockUserWithToken.emailVerifyToken}`,
          supportEmail: 'support@mentara.com',
        },
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.sendVerificationEmail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for already verified email', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockVerifiedUser);

      await expect(service.sendVerificationEmail('user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should generate new token when existing token is expired', async () => {
      const userWithExpiredToken = {
        ...mockUserWithToken,
        emailVerifyTokenExp: new Date(Date.now() - 1000),
      };

      prismaService.user.findUnique.mockResolvedValue(userWithExpiredToken);
      tokenService.generateEmailVerificationToken.mockResolvedValue(mockTokenData);
      prismaService.user.update.mockResolvedValue(mockUser);
      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await service.sendVerificationEmail('user-123');

      expect(tokenService.generateEmailVerificationToken).toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          emailVerifyToken: mockTokenData.hashedToken,
          emailVerifyTokenExp: mockTokenData.expiresAt,
        },
      });
    });

    it('should handle email service failure', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      tokenService.generateEmailVerificationToken.mockResolvedValue(mockTokenData);
      prismaService.user.update.mockResolvedValue(mockUser);
      emailService.sendGenericEmail.mockRejectedValue(new Error('Email service error'));

      await expect(service.sendVerificationEmail('user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'raw-token';
      const userToVerify = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        emailVerifyTokenExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      prismaService.user.findUnique.mockResolvedValue(userToVerify);
      prismaService.user.update.mockResolvedValue({
        ...userToVerify,
        emailVerified: true,
      });

      const result = await service.verifyEmail(token);

      expect(result).toEqual({
        success: true,
        message: 'Email verified successfully',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { emailVerifyToken: 'hashed-token' },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          emailVerifyTokenExp: true,
        },
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          emailVerified: true,
          emailVerifyToken: null,
          emailVerifyTokenExp: null,
          isVerified: true,
        },
      });
    });

    it('should throw BadRequestException for missing token', async () => {
      await expect(service.verifyEmail('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid token', async () => {
      const token = 'invalid-token';
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
    });

    it('should return success message for already verified email', async () => {
      const token = 'raw-token';
      const alreadyVerifiedUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        emailVerifyTokenExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      prismaService.user.findUnique.mockResolvedValue(alreadyVerifiedUser);

      const result = await service.verifyEmail(token);

      expect(result).toEqual({
        success: true,
        message: 'Email already verified',
      });

      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should handle expired token by cleaning up and throwing error', async () => {
      const token = 'expired-token';
      const userWithExpiredToken = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        emailVerifyTokenExp: new Date(Date.now() - 1000),
      };

      prismaService.user.findUnique.mockResolvedValue(userWithExpiredToken);
      prismaService.user.update.mockResolvedValue(userWithExpiredToken);

      await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          emailVerifyToken: null,
          emailVerifyTokenExp: null,
        },
      });
    });

    it('should handle token without expiration date', async () => {
      const token = 'token-without-exp';
      const userWithoutExpiration = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        emailVerifyTokenExp: null,
      };

      prismaService.user.findUnique.mockResolvedValue(userWithoutExpiration);
      prismaService.user.update.mockResolvedValue(userWithoutExpiration);

      await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email for existing unverified user', async () => {
      const email = 'test@example.com';
      const unverifiedUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        emailVerified: false,
      };

      prismaService.user.findUnique.mockResolvedValue(unverifiedUser);
      // Mock the sendVerificationEmail method by setting up the full chain
      prismaService.user.findUnique
        .mockResolvedValueOnce(unverifiedUser)
        .mockResolvedValueOnce(mockUser);
      tokenService.generateEmailVerificationToken.mockResolvedValue(mockTokenData);
      prismaService.user.update.mockResolvedValue(mockUser);
      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await service.resendVerificationEmail(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          emailVerified: true,
        },
      });
    });

    it('should silently return for non-existent user (security)', async () => {
      const email = 'nonexistent@example.com';
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.resendVerificationEmail(email)).resolves.not.toThrow();
    });

    it('should throw BadRequestException for already verified email', async () => {
      const email = 'verified@example.com';
      const verifiedUser = {
        id: 'user-123',
        email: 'verified@example.com',
        firstName: 'John',
        emailVerified: true,
      };

      prismaService.user.findUnique.mockResolvedValue(verifiedUser);

      await expect(service.resendVerificationEmail(email)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should clean up expired verification tokens', async () => {
      prismaService.user.updateMany.mockResolvedValue({ count: 5 });

      await service.cleanupExpiredTokens();

      expect(prismaService.user.updateMany).toHaveBeenCalledWith({
        where: {
          emailVerifyTokenExp: {
            lt: expect.any(Date),
          },
        },
        data: {
          emailVerifyToken: null,
          emailVerifyTokenExp: null,
        },
      });
    });
  });

  describe('sendVerificationEmailWithToken (private method)', () => {
    it('should send verification email with correct template data', async () => {
      const email = 'test@example.com';
      const firstName = 'John';
      const token = 'verification-token';

      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await (service as any).sendVerificationEmailWithToken(email, firstName, token);

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: email,
        subject: 'Verify Your Mentara Account',
        template: 'email-verification',
        data: {
          firstName,
          verificationUrl: `https://mentara.com/verify-email?token=${token}`,
          supportEmail: 'support@mentara.com',
        },
      });
    });

    it('should use default support email when env variable not set', async () => {
      delete process.env.SUPPORT_EMAIL;
      const email = 'test@example.com';
      const firstName = 'John';
      const token = 'verification-token';

      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await (service as any).sendVerificationEmailWithToken(email, firstName, token);

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: email,
        subject: 'Verify Your Mentara Account',
        template: 'email-verification',
        data: {
          firstName,
          verificationUrl: `https://mentara.com/verify-email?token=${token}`,
          supportEmail: 'support@mentara.com',
        },
      });
    });

    it('should handle email service failure and throw BadRequestException', async () => {
      const email = 'test@example.com';
      const firstName = 'John';
      const token = 'verification-token';

      emailService.sendGenericEmail.mockRejectedValue(new Error('Email service error'));

      await expect(
        (service as any).sendVerificationEmailWithToken(email, firstName, token),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('crypto hash integration', () => {
    it('should use crypto.createHash for token verification', async () => {
      const token = 'test-token';
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed-token'),
      };

      (crypto.createHash as jest.Mock).mockReturnValue(mockHash);

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);

      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockHash.update).toHaveBeenCalledWith(token);
      expect(mockHash.digest).toHaveBeenCalledWith('hex');
    });
  });

  describe('environment variable handling', () => {
    it('should handle missing FRONTEND_URL', async () => {
      delete process.env.FRONTEND_URL;
      const email = 'test@example.com';
      const firstName = 'John';
      const token = 'verification-token';

      emailService.sendGenericEmail.mockResolvedValue(undefined);

      await (service as any).sendVerificationEmailWithToken(email, firstName, token);

      expect(emailService.sendGenericEmail).toHaveBeenCalledWith({
        to: email,
        subject: 'Verify Your Mentara Account',
        template: 'email-verification',
        data: {
          firstName,
          verificationUrl: `undefined/verify-email?token=${token}`,
          supportEmail: 'support@mentara.com',
        },
      });
    });
  });
});