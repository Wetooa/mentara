import { Test, TestingModule } from '@nestjs/testing';
import { ModeratorAuthService } from './moderator-auth.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TokenService } from './token.service';
import { EmailVerificationService } from '../email/email-verification.service';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('ModeratorAuthService', () => {
  let service: ModeratorAuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let tokenService: jest.Mocked<TokenService>;
  let emailVerificationService: jest.Mocked<EmailVerificationService>;

  const mockModeratorUser = {
    id: 'moderator-user-123',
    email: 'moderator@example.com',
    firstName: 'Moderator',
    lastName: 'User',
    role: 'moderator',
    emailVerified: true,
    password: 'hashed-password',
    failedLoginCount: 0,
    lockoutUntil: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockModerator = {
    id: 'moderator-123',
    userId: 'moderator-user-123',
    permissions: ['content_moderation', 'user_management'],
    assignedCommunities: ['community-1', 'community-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCommunity = {
    id: 'community-1',
    name: 'Mental Health Support',
    slug: 'mental-health-support',
    description: 'A community for mental health discussions',
    createdAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    expiresIn: '1h',
  };

  const mockStats = {
    totalManagedCommunities: 2,
    totalMembersInManagedCommunities: 150,
    pendingJoinRequests: 0,
    totalPostsInManagedCommunities: 45,
    totalReportsInManagedCommunities: 3,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModeratorAuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            moderator: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            community: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            membership: {
              count: jest.fn(),
            },
            post: {
              count: jest.fn(),
            },
            report: {
              count: jest.fn(),
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

    service = module.get<ModeratorAuthService>(ModeratorAuthService);
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

  describe('createModeratorAccount', () => {
    it('should create moderator account successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockModeratorUser),
          },
          moderator: {
            create: jest.fn().mockResolvedValue(mockModerator),
          },
        };
        return callback(tx);
      });

      const result = await service.createModeratorAccount(
        'moderator@example.com',
        'password123',
        'Moderator',
        'User',
        ['content_moderation', 'user_management'],
        ['community-1', 'community-2'],
      );

      expect(result).toEqual({
        user: mockModeratorUser,
        message: 'Moderator account created successfully.',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'moderator@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should create moderator account with default parameters', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockModeratorUser),
          },
          moderator: {
            create: jest.fn().mockResolvedValue({
              ...mockModerator,
              permissions: [],
              assignedCommunities: [],
            }),
          },
        };
        return callback(tx);
      });

      const result = await service.createModeratorAccount(
        'moderator@example.com',
        'password123',
        'Moderator',
        'User',
      );

      expect(result).toEqual({
        user: mockModeratorUser,
        message: 'Moderator account created successfully.',
      });
    });

    it('should throw BadRequestException for existing user', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockModeratorUser);

      await expect(
        service.createModeratorAccount(
          'moderator@example.com',
          'password123',
          'Moderator',
          'User',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle transaction failure', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.createModeratorAccount(
          'moderator@example.com',
          'password123',
          'Moderator',
          'User',
        ),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('loginModerator', () => {
    const mockModeratorWithProfile = {
      ...mockModeratorUser,
      moderator: mockModerator,
    };

    it('should login moderator successfully', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockModeratorWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockModeratorUser);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.loginModerator(
        'moderator@example.com',
        'password123',
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result).toEqual({
        user: mockModeratorWithProfile,
        tokens: mockTokens,
      });

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'moderator@example.com',
          role: 'moderator',
        },
        include: {
          moderator: true,
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockModeratorUser.password);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockModeratorUser.id },
        data: {
          failedLoginCount: 0,
          lockoutUntil: null,
          lastLoginAt: expect.any(Date),
        },
      });
    });

    it('should throw UnauthorizedException for non-existent moderator', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.loginModerator('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const lockedModerator = {
        ...mockModeratorWithProfile,
        lockoutUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      };

      prismaService.user.findFirst.mockResolvedValue(lockedModerator);

      await expect(
        service.loginModerator('moderator@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for moderator without password', async () => {
      const moderatorWithoutPassword = {
        ...mockModeratorWithProfile,
        password: null,
      };

      prismaService.user.findFirst.mockResolvedValue(moderatorWithoutPassword);

      await expect(
        service.loginModerator('moderator@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle failed login and increment failed count', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockModeratorWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 2 });
      prismaService.user.update.mockResolvedValue(mockModeratorUser);

      await expect(
        service.loginModerator('moderator@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockModeratorUser.id },
        data: {
          failedLoginCount: 3,
        },
      });
    });
  });

  describe('getModeratorProfile', () => {
    it('should get moderator profile successfully', async () => {
      const mockModeratorWithProfile = {
        ...mockModeratorUser,
        moderator: {
          ...mockModerator,
          moderatorCommunities: [
            {
              id: 'mc-1',
              community: {
                id: 'community-1',
                name: 'Mental Health Support',
                slug: 'mental-health-support',
              },
            },
          ],
        },
      };

      prismaService.user.findUnique.mockResolvedValue(mockModeratorWithProfile);

      const result = await service.getModeratorProfile('moderator-user-123');

      expect(result).toEqual(mockModeratorWithProfile);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'moderator-user-123' },
        include: {
          moderator: {
            include: {
              moderatorCommunities: {
                include: {
                  community: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
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

      await expect(service.getModeratorProfile('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-moderator user', async () => {
      const nonModeratorUser = {
        ...mockModeratorUser,
        role: 'client',
      };

      prismaService.user.findUnique.mockResolvedValue(nonModeratorUser);

      await expect(service.getModeratorProfile('moderator-user-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getModeratorPermissions', () => {
    it('should get moderator permissions successfully', async () => {
      const mockPermissions = {
        permissions: ['content_moderation', 'user_management'],
        assignedCommunities: ['community-1', 'community-2'],
      };

      prismaService.moderator.findUnique.mockResolvedValue(mockPermissions);

      const result = await service.getModeratorPermissions('moderator-user-123');

      expect(result).toEqual(mockPermissions);
      expect(prismaService.moderator.findUnique).toHaveBeenCalledWith({
        where: { userId: 'moderator-user-123' },
        select: {
          permissions: true,
          assignedCommunities: true,
        },
      });
    });

    it('should throw UnauthorizedException for non-existent moderator', async () => {
      prismaService.moderator.findUnique.mockResolvedValue(null);

      await expect(service.getModeratorPermissions('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAssignedCommunities', () => {
    it('should get assigned communities successfully', async () => {
      const mockModeratorWithCommunities = {
        assignedCommunities: ['community-1', 'community-2'],
      };

      prismaService.moderator.findUnique.mockResolvedValue(mockModeratorWithCommunities);
      prismaService.community.findMany.mockResolvedValue([
        {
          id: 'community-1',
          name: 'Mental Health Support',
          slug: 'mental-health-support',
          description: 'A community for mental health discussions',
          createdAt: new Date(),
        },
        {
          id: 'community-2',
          name: 'Therapy Resources',
          slug: 'therapy-resources',
          description: 'Resources for therapy and healing',
          createdAt: new Date(),
        },
      ]);

      const result = await service.getAssignedCommunities('moderator-user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: 'community-1',
        name: 'Mental Health Support',
        slug: 'mental-health-support',
      }));
    });

    it('should return empty array for moderator with no assigned communities', async () => {
      const mockModeratorWithoutCommunities = {
        assignedCommunities: [],
      };

      prismaService.moderator.findUnique.mockResolvedValue(mockModeratorWithoutCommunities);

      const result = await service.getAssignedCommunities('moderator-user-123');

      expect(result).toEqual([]);
      expect(prismaService.community.findMany).not.toHaveBeenCalled();
    });

    it('should handle non-array assignedCommunities', async () => {
      const mockModeratorWithNonArrayCommunities = {
        assignedCommunities: 'not-an-array',
      };

      prismaService.moderator.findUnique.mockResolvedValue(mockModeratorWithNonArrayCommunities);

      const result = await service.getAssignedCommunities('moderator-user-123');

      expect(result).toEqual([]);
    });

    it('should throw UnauthorizedException for non-existent moderator', async () => {
      prismaService.moderator.findUnique.mockResolvedValue(null);

      await expect(service.getAssignedCommunities('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getModeratorDashboardStats', () => {
    it('should get moderator dashboard statistics successfully', async () => {
      const mockModeratorWithCommunities = {
        ...mockModerator,
        moderatorCommunities: [
          { id: 'mc-1', communityId: 'community-1' },
          { id: 'mc-2', communityId: 'community-2' },
        ],
      };

      prismaService.moderator.findUnique.mockResolvedValue(mockModeratorWithCommunities);

      // Mock all the count queries
      prismaService.community.count.mockResolvedValue(2);
      prismaService.membership.count.mockResolvedValue(150);
      prismaService.post.count.mockResolvedValue(45);
      prismaService.report.count.mockResolvedValue(3);

      const result = await service.getModeratorDashboardStats('moderator-user-123');

      expect(result).toEqual({
        totalManagedCommunities: 2,
        totalMembersInManagedCommunities: 150,
        pendingJoinRequests: 0,
        totalPostsInManagedCommunities: 45,
        totalReportsInManagedCommunities: 3,
      });
    });

    it('should throw UnauthorizedException for non-existent moderator', async () => {
      prismaService.moderator.findUnique.mockResolvedValue(null);

      await expect(service.getModeratorDashboardStats('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('handleFailedLogin (private method)', () => {
    it('should increment failed login count for moderator with existing failed attempts', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 2 });
      prismaService.user.update.mockResolvedValue(mockModeratorUser);

      await (service as any).handleFailedLogin('moderator-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'moderator-user-123' },
        data: {
          failedLoginCount: 3,
        },
      });
    });

    it('should lock account when max attempts reached', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 4 });
      prismaService.user.update.mockResolvedValue(mockModeratorUser);

      await (service as any).handleFailedLogin('moderator-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'moderator-user-123' },
        data: {
          failedLoginCount: 5,
          lockoutUntil: expect.any(Date),
        },
      });
    });

    it('should handle user not found during failed login', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.update.mockResolvedValue(mockModeratorUser);

      await (service as any).handleFailedLogin('moderator-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'moderator-user-123' },
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
            create: jest.fn().mockResolvedValue(mockModeratorUser),
          },
          moderator: {
            create: jest.fn().mockResolvedValue(mockModerator),
          },
        };
        return callback(tx);
      });

      await service.createModeratorAccount(
        'moderator@example.com',
        'password123',
        'Moderator',
        'User',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should use bcrypt.compare for password verification', async () => {
      const mockModeratorWithProfile = {
        ...mockModeratorUser,
        moderator: mockModerator,
      };

      prismaService.user.findFirst.mockResolvedValue(mockModeratorWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockModeratorUser);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      await service.loginModerator('moderator@example.com', 'password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockModeratorUser.password);
    });
  });
});