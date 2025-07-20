import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthService } from './admin-auth.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TokenService } from './token.service';
import { EmailVerificationService } from './email-verification.service';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let tokenService: jest.Mocked<TokenService>;
  let emailVerificationService: jest.Mocked<EmailVerificationService>;

  const mockAdminUser = {
    id: 'admin-user-123',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    emailVerified: true,
    password: 'hashed-password',
    failedLoginCount: 0,
    lockoutUntil: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin = {
    id: 'admin-123',
    userId: 'admin-user-123',
    adminLevel: 'admin',
    permissions: ['user_management', 'content_moderation'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    expiresIn: '1h',
  };

  const mockStats = {
    totalUsers: 1000,
    totalClients: 800,
    totalTherapists: 150,
    totalModerators: 25,
    totalAdmins: 5,
    pendingApplications: 12,
    totalCommunities: 45,
    totalPosts: 2500,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            admin: {
              findUnique: jest.fn(),
              create: jest.fn(),
              count: jest.fn(),
            },
            client: {
              count: jest.fn(),
            },
            therapist: {
              count: jest.fn(),
            },
            moderator: {
              count: jest.fn(),
            },
            community: {
              count: jest.fn(),
            },
            post: {
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

    service = module.get<AdminAuthService>(AdminAuthService);
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

  describe('createAdminAccount', () => {
    it('should create admin account successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockAdminUser),
          },
          admin: {
            create: jest.fn().mockResolvedValue(mockAdmin),
          },
        };
        return callback(tx);
      });

      const result = await service.createAdminAccount(
        'admin@example.com',
        'password123',
        'Admin',
        'User',
        'superadmin',
        ['user_management', 'system_admin'],
      );

      expect(result).toEqual({
        user: mockAdminUser,
        message: 'Admin account created successfully.',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should create admin account with default parameters', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockAdminUser),
          },
          admin: {
            create: jest.fn().mockResolvedValue(mockAdmin),
          },
        };
        return callback(tx);
      });

      const result = await service.createAdminAccount(
        'admin@example.com',
        'password123',
        'Admin',
        'User',
      );

      expect(result).toEqual({
        user: mockAdminUser,
        message: 'Admin account created successfully.',
      });
    });

    it('should throw BadRequestException for existing user', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockAdminUser);

      await expect(
        service.createAdminAccount(
          'admin@example.com',
          'password123',
          'Admin',
          'User',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle transaction failure', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.createAdminAccount(
          'admin@example.com',
          'password123',
          'Admin',
          'User',
        ),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('loginAdmin', () => {
    const mockAdminWithProfile = {
      ...mockAdminUser,
      admin: mockAdmin,
    };

    it('should login admin successfully', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockAdminWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockAdminUser);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.loginAdmin(
        'admin@example.com',
        'password123',
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result).toEqual({
        user: mockAdminWithProfile,
        tokens: mockTokens,
      });

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'admin@example.com',
          role: 'admin',
        },
        include: {
          admin: true,
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockAdminUser.password);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockAdminUser.id },
        data: {
          failedLoginCount: 0,
          lockoutUntil: null,
          lastLoginAt: expect.any(Date),
        },
      });
    });

    it('should throw UnauthorizedException for non-existent admin', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.loginAdmin('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const lockedAdmin = {
        ...mockAdminWithProfile,
        lockoutUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      };

      prismaService.user.findFirst.mockResolvedValue(lockedAdmin);

      await expect(
        service.loginAdmin('admin@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for admin without password', async () => {
      const adminWithoutPassword = {
        ...mockAdminWithProfile,
        password: null,
      };

      prismaService.user.findFirst.mockResolvedValue(adminWithoutPassword);

      await expect(
        service.loginAdmin('admin@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle failed login and increment failed count', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockAdminWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 2 });
      prismaService.user.update.mockResolvedValue(mockAdminUser);

      await expect(
        service.loginAdmin('admin@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockAdminUser.id },
        data: {
          failedLoginCount: 3,
        },
      });
    });

    it('should lock account after max failed attempts', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockAdminWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 4 });
      prismaService.user.update.mockResolvedValue(mockAdminUser);

      await expect(
        service.loginAdmin('admin@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockAdminUser.id },
        data: {
          failedLoginCount: 5,
          lockoutUntil: expect.any(Date),
        },
      });
    });
  });

  describe('getAdminProfile', () => {
    it('should get admin profile successfully', async () => {
      const mockAdminWithProfile = {
        ...mockAdminUser,
        admin: mockAdmin,
      };

      prismaService.user.findUnique.mockResolvedValue(mockAdminWithProfile);

      const result = await service.getAdminProfile('admin-user-123');

      expect(result).toEqual(mockAdminWithProfile);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-user-123' },
        include: {
          admin: true,
        },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getAdminProfile('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-admin user', async () => {
      const nonAdminUser = {
        ...mockAdminUser,
        role: 'client',
      };

      prismaService.user.findUnique.mockResolvedValue(nonAdminUser);

      await expect(service.getAdminProfile('admin-user-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAdminPermissions', () => {
    it('should get admin permissions successfully', async () => {
      const mockPermissions = {
        permissions: ['user_management', 'content_moderation'],
        adminLevel: 'admin',
      };

      prismaService.admin.findUnique.mockResolvedValue(mockPermissions);

      const result = await service.getAdminPermissions('admin-user-123');

      expect(result).toEqual(mockPermissions);
      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { userId: 'admin-user-123' },
        select: {
          permissions: true,
          adminLevel: true,
        },
      });
    });

    it('should throw UnauthorizedException for non-existent admin', async () => {
      prismaService.admin.findUnique.mockResolvedValue(null);

      await expect(service.getAdminPermissions('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAdminDashboardStats', () => {
    it('should get admin dashboard statistics successfully', async () => {
      prismaService.admin.findUnique.mockResolvedValue(mockAdmin);

      // Mock all the count queries
      prismaService.user.count.mockResolvedValue(mockStats.totalUsers);
      prismaService.client.count.mockResolvedValue(mockStats.totalClients);
      prismaService.therapist.count
        .mockResolvedValueOnce(mockStats.totalTherapists)
        .mockResolvedValueOnce(mockStats.pendingApplications);
      prismaService.moderator.count.mockResolvedValue(mockStats.totalModerators);
      prismaService.admin.count.mockResolvedValue(mockStats.totalAdmins);
      prismaService.community.count.mockResolvedValue(mockStats.totalCommunities);
      prismaService.post.count.mockResolvedValue(mockStats.totalPosts);

      const result = await service.getAdminDashboardStats('admin-user-123');

      expect(result).toEqual(mockStats);
      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { userId: 'admin-user-123' },
      });
    });

    it('should throw UnauthorizedException for non-existent admin', async () => {
      prismaService.admin.findUnique.mockResolvedValue(null);

      await expect(service.getAdminDashboardStats('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('handleFailedLogin (private method)', () => {
    it('should increment failed login count for admin with existing failed attempts', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 2 });
      prismaService.user.update.mockResolvedValue(mockAdminUser);

      await (service as any).handleFailedLogin('admin-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'admin-user-123' },
        data: {
          failedLoginCount: 3,
        },
      });
    });

    it('should lock account when max attempts reached', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 4 });
      prismaService.user.update.mockResolvedValue(mockAdminUser);

      await (service as any).handleFailedLogin('admin-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'admin-user-123' },
        data: {
          failedLoginCount: 5,
          lockoutUntil: expect.any(Date),
        },
      });
    });

    it('should handle user not found during failed login', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.update.mockResolvedValue(mockAdminUser);

      await (service as any).handleFailedLogin('admin-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'admin-user-123' },
        data: {
          failedLoginCount: 1,
        },
      });
    });

    it('should handle user with zero failed attempts', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 0 });
      prismaService.user.update.mockResolvedValue(mockAdminUser);

      await (service as any).handleFailedLogin('admin-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'admin-user-123' },
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
            create: jest.fn().mockResolvedValue(mockAdminUser),
          },
          admin: {
            create: jest.fn().mockResolvedValue(mockAdmin),
          },
        };
        return callback(tx);
      });

      await service.createAdminAccount(
        'admin@example.com',
        'password123',
        'Admin',
        'User',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should use bcrypt.compare for password verification', async () => {
      const mockAdminWithProfile = {
        ...mockAdminUser,
        admin: mockAdmin,
      };

      prismaService.user.findFirst.mockResolvedValue(mockAdminWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockAdminUser);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      await service.loginAdmin('admin@example.com', 'password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockAdminUser.password);
    });
  });

  describe('transaction handling', () => {
    it('should handle transaction in createAdminAccount', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockAdminUser),
          },
          admin: {
            create: jest.fn().mockResolvedValue(mockAdmin),
          },
        };
        return callback(tx);
      });

      prismaService.$transaction = mockTransaction;

      await service.createAdminAccount(
        'admin@example.com',
        'password123',
        'Admin',
        'User',
      );

      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});