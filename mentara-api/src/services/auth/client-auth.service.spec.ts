import { Test, TestingModule } from '@nestjs/testing';
import { ClientAuthService } from './client-auth.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TokenService } from './token.service';
import { EmailVerificationService } from '../email/email-verification.service';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterClientDto } from 'mentara-commons';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('ClientAuthService', () => {
  let service: ClientAuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let tokenService: jest.Mocked<TokenService>;
  let emailVerificationService: jest.Mocked<EmailVerificationService>;

  const mockUser = {
    id: 'user-123',
    email: 'client@example.com',
    firstName: 'John',
    lastName: 'Doe',
    middleName: null,
    birthDate: new Date('1990-01-01'),
    address: '123 Main St',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: 'client',
    emailVerified: false,
    password: 'hashed-password',
    failedLoginCount: 0,
    lockoutUntil: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClient = {
    id: 'client-123',
    userId: 'user-123',
    hasSeenTherapistRecommendations: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    expiresIn: '1h',
  };

  const mockRegisterDto: RegisterClientDto = {
    email: 'client@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Middle',
    birthDate: '1990-01-01',
    address: '123 Main St',
    avatarUrl: 'https://example.com/avatar.jpg',
    hasSeenTherapistRecommendations: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientAuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            client: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokenPair: jest.fn(),
          },
        },
        {
          provide: EmailVerificationService,
          useValue: {
            sendVerificationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClientAuthService>(ClientAuthService);
    prismaService = module.get(PrismaService);
    tokenService = module.get(TokenService);
    emailVerificationService = module.get(EmailVerificationService);

    // Setup bcrypt mock
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerClient', () => {
    it('should register a new client successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
          client: {
            create: jest.fn().mockResolvedValue(mockClient),
          },
        };
        return callback(tx);
      });
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);
      emailVerificationService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await service.registerClient(mockRegisterDto);

      expect(result).toEqual({
        user: mockUser,
        tokens: mockTokens,
        message: 'Client registration successful. Please check your email for verification.',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 12);
      expect(tokenService.generateTokenPair).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );
      expect(emailVerificationService.sendVerificationEmail).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw BadRequestException for existing user', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.registerClient(mockRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle optional fields in registration', async () => {
      const minimalRegisterDto = {
        email: 'client@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue({
              ...mockUser,
              middleName: null,
              birthDate: null,
              address: null,
              avatarUrl: null,
            }),
          },
          client: {
            create: jest.fn().mockResolvedValue(mockClient),
          },
        };
        return callback(tx);
      });
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);
      emailVerificationService.sendVerificationEmail.mockResolvedValue(undefined);

      await service.registerClient(minimalRegisterDto);

      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should handle birthDate conversion', async () => {
      const registerDtoWithDate = {
        ...mockRegisterDto,
        birthDate: '1990-01-01',
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
          client: {
            create: jest.fn().mockResolvedValue(mockClient),
          },
        };
        return callback(tx);
      });
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);
      emailVerificationService.sendVerificationEmail.mockResolvedValue(undefined);

      await service.registerClient(registerDtoWithDate);

      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should handle transaction failure', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(service.registerClient(mockRegisterDto)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('loginClient', () => {
    const mockUserWithClient = {
      ...mockUser,
      client: mockClient,
    };

    it('should login client successfully', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockUserWithClient);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockUser);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.loginClient(
        'client@example.com',
        'password123',
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result).toEqual({
        user: mockUserWithClient,
        tokens: mockTokens,
      });

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'client@example.com',
          role: 'client',
        },
        include: {
          client: true,
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          failedLoginCount: 0,
          lockoutUntil: null,
          lastLoginAt: expect.any(Date),
        },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.loginClient('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const lockedUser = {
        ...mockUserWithClient,
        lockoutUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      };

      prismaService.user.findFirst.mockResolvedValue(lockedUser);

      await expect(
        service.loginClient('client@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for user without password', async () => {
      const userWithoutPassword = {
        ...mockUserWithClient,
        password: null,
      };

      prismaService.user.findFirst.mockResolvedValue(userWithoutPassword);

      await expect(
        service.loginClient('client@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle failed login and increment failed count', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockUserWithClient);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 2 });
      prismaService.user.update.mockResolvedValue(mockUser);

      await expect(
        service.loginClient('client@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          failedLoginCount: 3,
        },
      });
    });

    it('should lock account after max failed attempts', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockUserWithClient);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 4 });
      prismaService.user.update.mockResolvedValue(mockUser);

      await expect(
        service.loginClient('client@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          failedLoginCount: 5,
          lockoutUntil: expect.any(Date),
        },
      });
    });

    it('should handle user not found during failed login attempt', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockUserWithClient);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.update.mockResolvedValue(mockUser);

      await expect(
        service.loginClient('client@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          failedLoginCount: 1,
        },
      });
    });
  });

  describe('getClientProfile', () => {
    const mockTherapist = {
      id: 'therapist-123',
      userId: 'therapist-user-123',
      user: {
        id: 'therapist-user-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'therapist@example.com',
        avatarUrl: 'https://example.com/therapist-avatar.jpg',
      },
    };

    const mockUserWithFullClient = {
      ...mockUser,
      client: {
        ...mockClient,
        assignedTherapists: [
          {
            id: 'assignment-123',
            therapist: mockTherapist,
          },
        ],
      },
    };

    it('should get client profile successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserWithFullClient);

      const result = await service.getClientProfile('user-123');

      expect(result).toEqual(mockUserWithFullClient);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          client: {
            include: {
              assignedTherapists: {
                include: {
                  therapist: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          email: true,
                          avatarUrl: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getClientProfile('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-client user', async () => {
      const nonClientUser = {
        ...mockUser,
        role: 'therapist',
      };

      prismaService.user.findUnique.mockResolvedValue(nonClientUser);

      await expect(service.getClientProfile('user-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getFirstSignInStatus', () => {
    it('should get first sign-in status for client who has not seen recommendations', async () => {
      prismaService.client.findUnique.mockResolvedValue(mockClient);

      const result = await service.getFirstSignInStatus('user-123');

      expect(result).toEqual({
        hasSeenTherapistRecommendations: false,
      });
    });

    it('should get first sign-in status for client who has seen recommendations', async () => {
      const clientWithSeenRecommendations = {
        ...mockClient,
        hasSeenTherapistRecommendations: true,
      };

      prismaService.client.findUnique.mockResolvedValue(clientWithSeenRecommendations);

      const result = await service.getFirstSignInStatus('user-123');

      expect(result).toEqual({
        hasSeenTherapistRecommendations: true,
      });
    });

    it('should throw UnauthorizedException for non-existent client', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.getFirstSignInStatus('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('markRecommendationsSeen', () => {
    it('should mark recommendations as seen successfully', async () => {
      prismaService.client.findUnique.mockResolvedValue(mockClient);
      prismaService.client.update.mockResolvedValue({
        ...mockClient,
        hasSeenTherapistRecommendations: true,
      });

      const result = await service.markRecommendationsSeen('user-123');

      expect(result).toEqual({
        message: 'Recommendations marked as seen',
      });

      expect(prismaService.client.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: {
          hasSeenTherapistRecommendations: true,
        },
      });
    });

    it('should throw UnauthorizedException for non-existent client', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.markRecommendationsSeen('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('handleFailedLogin (private method)', () => {
    it('should increment failed login count for user with existing failed attempts', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 2 });
      prismaService.user.update.mockResolvedValue(mockUser);

      await (service as any).handleFailedLogin('user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          failedLoginCount: 3,
        },
      });
    });

    it('should lock account when max attempts reached', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 4 });
      prismaService.user.update.mockResolvedValue(mockUser);

      await (service as any).handleFailedLogin('user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          failedLoginCount: 5,
          lockoutUntil: expect.any(Date),
        },
      });
    });

    it('should handle user not found during failed login', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.update.mockResolvedValue(mockUser);

      await (service as any).handleFailedLogin('user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          failedLoginCount: 1,
        },
      });
    });

    it('should handle user with zero failed attempts', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 0 });
      prismaService.user.update.mockResolvedValue(mockUser);

      await (service as any).handleFailedLogin('user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          failedLoginCount: 1,
        },
      });
    });
  });

  describe('bcrypt integration', () => {
    it('should use bcrypt.hash for password hashing', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
          client: {
            create: jest.fn().mockResolvedValue(mockClient),
          },
        };
        return callback(tx);
      });
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);
      emailVerificationService.sendVerificationEmail.mockResolvedValue(undefined);

      await service.registerClient(mockRegisterDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 12);
    });

    it('should use bcrypt.compare for password verification', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockUserWithClient);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockUser);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      await service.loginClient('client@example.com', 'password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });
  });
});