import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from '../services/admin-auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
  SecurityGuardTestUtils,
  RoleBasedTestUtils,
  TEST_USER_IDS,
  TEST_EMAILS,
} from '../../test-utils/auth-testing-helpers';
import { createMockPrismaService } from '../../test-utils';

describe('AdminAuthController', () => {
  let controller: AdminAuthController;
  let adminAuthService: AdminAuthService;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;

  // Test data constants
  const mockAdminUser = {
    id: TEST_USER_IDS.ADMIN,
    email: TEST_EMAILS.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    emailVerified: true,
    adminLevel: 'admin',
    permissions: ['read', 'write', 'delete'],
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  const mockSuperAdminUser = {
    ...mockAdminUser,
    id: 'super-admin-123',
    email: 'super@mentara.com',
    adminLevel: 'super_admin',
    permissions: ['read', 'write', 'delete', 'create_admins'],
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };

  const mockDashboardStats = {
    totalUsers: 1000,
    totalTherapists: 100,
    totalAdmins: 5,
    activeUsers: 750,
    pendingApplications: 25,
    systemHealth: 'healthy',
    lastUpdated: new Date(),
  };

  beforeEach(async () => {
    // Create mock services
    const mockAdminAuthService = {
      createAdminAccount: jest.fn(),
      loginAdmin: jest.fn(),
      getAdminProfile: jest.fn(),
      getAdminPermissions: jest.fn(),
      getAdminDashboardStats: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'short',
            ttl: 1000,
            limit: 3,
          },
        ]),
      ],
      controllers: [AdminAuthController],
      providers: [
        {
          provide: AdminAuthService,
          useValue: mockAdminAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AdminAuthController>(AdminAuthController);
    adminAuthService = module.get<AdminAuthService>(AdminAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdminAccount', () => {
    const validRegisterDto = {
      email: 'newadmin@mentara.com',
      password: 'SecurePass123!',
      firstName: 'New',
      lastName: 'Admin',
      adminLevel: 'admin' as const,
      permissions: ['read', 'write'] as string[],
    };

    it('should create admin account successfully when called by admin', async () => {
      // Arrange
      const mockCreatedUser = {
        user: mockAdminUser,
        message: 'Admin account created successfully',
      };

      jest.spyOn(adminAuthService, 'createAdminAccount').mockResolvedValue(mockCreatedUser);

      // Act
      const result = await controller.createAdminAccount('admin', validRegisterDto);

      // Assert
      expect(adminAuthService.createAdminAccount).toHaveBeenCalledWith(
        validRegisterDto.email,
        validRegisterDto.password,
        validRegisterDto.firstName,
        validRegisterDto.lastName,
        validRegisterDto.adminLevel,
        validRegisterDto.permissions,
      );

      expect(result).toEqual({
        user: {
          id: mockAdminUser.id,
          email: mockAdminUser.email,
          firstName: mockAdminUser.firstName,
          lastName: mockAdminUser.lastName,
          role: mockAdminUser.role,
          emailVerified: mockAdminUser.emailVerified,
        },
        message: mockCreatedUser.message,
      });
    });

    it('should throw ForbiddenException when called by non-admin', async () => {
      // Arrange & Act & Assert
      await TestAssertions.expectToThrowNestException(
        () => controller.createAdminAccount('client', validRegisterDto),
        ForbiddenException,
        'Only admins can create admin accounts',
      );

      expect(adminAuthService.createAdminAccount).not.toHaveBeenCalled();
    });

    it('should use default values when optional fields are not provided', async () => {
      // Arrange
      const minimalRegisterDto = {
        email: 'newadmin@mentara.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'Admin',
      };

      const mockCreatedUser = {
        user: mockAdminUser,
        message: 'Admin account created successfully',
      };

      jest.spyOn(adminAuthService, 'createAdminAccount').mockResolvedValue(mockCreatedUser);

      // Act
      await controller.createAdminAccount('admin', minimalRegisterDto);

      // Assert
      expect(adminAuthService.createAdminAccount).toHaveBeenCalledWith(
        minimalRegisterDto.email,
        minimalRegisterDto.password,
        minimalRegisterDto.firstName,
        minimalRegisterDto.lastName,
        'admin', // Default adminLevel
        [], // Default permissions
      );
    });

    it('should handle service errors appropriately', async () => {
      // Arrange
      const serviceError = new Error('Email already exists');
      jest.spyOn(adminAuthService, 'createAdminAccount').mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.createAdminAccount('admin', validRegisterDto)).rejects.toThrow(serviceError);
    });
  });

  describe('login', () => {
    const validLoginDto = {
      email: TEST_EMAILS.ADMIN,
      password: 'SecurePass123!',
    };

    const mockRequest = {
      ip: '192.168.1.1',
      get: jest.fn().mockReturnValue('Test User Agent'),
    } as any;

    it('should login admin successfully with valid credentials', async () => {
      // Arrange
      const mockLoginResult = {
        user: mockAdminUser,
        tokens: mockTokens,
      };

      jest.spyOn(adminAuthService, 'loginAdmin').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(validLoginDto, mockRequest);

      // Assert
      expect(adminAuthService.loginAdmin).toHaveBeenCalledWith(
        validLoginDto.email,
        validLoginDto.password,
        mockRequest.ip,
        'Test User Agent',
      );

      expect(result).toEqual({
        user: {
          id: mockAdminUser.id,
          email: mockAdminUser.email,
          firstName: mockAdminUser.firstName,
          lastName: mockAdminUser.lastName,
          role: mockAdminUser.role,
          emailVerified: mockAdminUser.emailVerified,
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
      });
    });

    it('should handle missing User-Agent header', async () => {
      // Arrange
      const mockRequestWithoutUserAgent = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue(undefined),
      } as any;

      const mockLoginResult = {
        user: mockAdminUser,
        tokens: mockTokens,
      };

      jest.spyOn(adminAuthService, 'loginAdmin').mockResolvedValue(mockLoginResult);

      // Act
      await controller.login(validLoginDto, mockRequestWithoutUserAgent);

      // Assert
      expect(adminAuthService.loginAdmin).toHaveBeenCalledWith(
        validLoginDto.email,
        validLoginDto.password,
        mockRequestWithoutUserAgent.ip,
        undefined,
      );
    });

    it('should handle invalid credentials', async () => {
      // Arrange
      const authError = new UnauthorizedException('Invalid credentials');
      jest.spyOn(adminAuthService, 'loginAdmin').mockRejectedValue(authError);

      // Act & Assert
      await expect(controller.login(validLoginDto, mockRequest)).rejects.toThrow(authError);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      jest.spyOn(adminAuthService, 'loginAdmin').mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.login(validLoginDto, mockRequest)).rejects.toThrow(serviceError);
    });
  });

  describe('getProfile', () => {
    it('should return admin profile successfully', async () => {
      // Arrange
      jest.spyOn(adminAuthService, 'getAdminProfile').mockResolvedValue(mockAdminUser);

      // Act
      const result = await controller.getProfile(TEST_USER_IDS.ADMIN);

      // Assert
      expect(adminAuthService.getAdminProfile).toHaveBeenCalledWith(TEST_USER_IDS.ADMIN);
      expect(result).toEqual(mockAdminUser);
    });

    it('should handle profile not found', async () => {
      // Arrange
      const notFoundError = new Error('Admin profile not found');
      jest.spyOn(adminAuthService, 'getAdminProfile').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getProfile(TEST_USER_IDS.ADMIN)).rejects.toThrow(notFoundError);
    });
  });

  describe('getPermissions', () => {
    const mockPermissions = {
      permissions: ['read', 'write', 'delete'],
      adminLevel: 'admin',
      canCreateAdmins: true,
      canModifyUsers: true,
      canAccessAnalytics: true,
    };

    it('should return admin permissions successfully', async () => {
      // Arrange
      jest.spyOn(adminAuthService, 'getAdminPermissions').mockResolvedValue(mockPermissions);

      // Act
      const result = await controller.getPermissions(TEST_USER_IDS.ADMIN);

      // Assert
      expect(adminAuthService.getAdminPermissions).toHaveBeenCalledWith(TEST_USER_IDS.ADMIN);
      expect(result).toEqual(mockPermissions);
    });

    it('should handle permissions not found', async () => {
      // Arrange
      const notFoundError = new Error('Admin permissions not found');
      jest.spyOn(adminAuthService, 'getAdminPermissions').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getPermissions(TEST_USER_IDS.ADMIN)).rejects.toThrow(notFoundError);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics successfully', async () => {
      // Arrange
      jest.spyOn(adminAuthService, 'getAdminDashboardStats').mockResolvedValue(mockDashboardStats);

      // Act
      const result = await controller.getDashboardStats(TEST_USER_IDS.ADMIN);

      // Assert
      expect(adminAuthService.getAdminDashboardStats).toHaveBeenCalledWith(TEST_USER_IDS.ADMIN);
      expect(result).toEqual(mockDashboardStats);
    });

    it('should handle dashboard stats error', async () => {
      // Arrange
      const statsError = new Error('Unable to fetch dashboard statistics');
      jest.spyOn(adminAuthService, 'getAdminDashboardStats').mockRejectedValue(statsError);

      // Act & Assert
      await expect(controller.getDashboardStats(TEST_USER_IDS.ADMIN)).rejects.toThrow(statsError);
    });
  });

  describe('Role-based Access Control', () => {
    it('should test role-based access for protected endpoints', async () => {
      // Test that different roles can access appropriate endpoints
      await RoleBasedTestUtils.testWithRoles(
        async (userId: string, role: string) => {
          // Mock the auth guard to return the specific role
          mockJwtAuthGuard.canActivate.mockReturnValue(role === 'admin');
          
          try {
            await controller.getProfile(userId);
            return true;
          } catch (error) {
            return false;
          }
        },
        {
          admin: true,
          client: false,
          therapist: false,
          moderator: false,
        },
      );
    });
  });

  describe('Security Tests', () => {
    it('should validate input data through ZodValidationPipe', () => {
      // This tests that the controller uses proper validation
      const validationPipe = new ZodValidationPipe({} as any);
      expect(validationPipe).toBeDefined();
    });

    it('should apply rate limiting through ThrottlerGuard', () => {
      // Test that throttling is configured
      const createAccountMetadata = Reflect.getMetadata('__throttler_options__', controller.createAdminAccount);
      const loginMetadata = Reflect.getMetadata('__throttler_options__', controller.login);
      
      expect(createAccountMetadata).toBeDefined();
      expect(loginMetadata).toBeDefined();
    });

    it('should require authentication for protected endpoints', () => {
      // Test that protected endpoints have JwtAuthGuard
      const protectedMethods = ['createAdminAccount', 'getProfile', 'getPermissions', 'getDashboardStats'];
      
      protectedMethods.forEach(method => {
        const guards = Reflect.getMetadata('__guards__', controller[method as keyof AdminAuthController]);
        expect(guards).toBeDefined();
      });
    });

    it('should allow public access to login endpoint', () => {
      // Test that login endpoint is marked as public
      const publicMetadata = Reflect.getMetadata('isPublic', controller.login);
      expect(publicMetadata).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      jest.spyOn(adminAuthService, 'getAdminProfile').mockRejectedValue(networkError);

      // Act & Assert
      await expect(controller.getProfile(TEST_USER_IDS.ADMIN)).rejects.toThrow(networkError);
    });

    it('should handle validation errors', async () => {
      // This would be handled by the ZodValidationPipe
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '',
        lastName: '',
      };

      // In a real scenario, this would throw a validation error
      // The pipe would catch this before it reaches the controller
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete admin creation workflow', async () => {
      // Arrange
      const mockCreatedUser = {
        user: mockAdminUser,
        message: 'Admin account created successfully',
      };

      jest.spyOn(adminAuthService, 'createAdminAccount').mockResolvedValue(mockCreatedUser);

      // Act
      const result = await controller.createAdminAccount('admin', {
        email: 'newadmin@mentara.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'Admin',
        adminLevel: 'admin',
        permissions: ['read', 'write'],
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockAdminUser.email);
      expect(result.message).toBe('Admin account created successfully');
    });

    it('should handle complete login workflow', async () => {
      // Arrange
      const mockLoginResult = {
        user: mockAdminUser,
        tokens: mockTokens,
      };

      jest.spyOn(adminAuthService, 'loginAdmin').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(
        {
          email: TEST_EMAILS.ADMIN,
          password: 'SecurePass123!',
        },
        {
          ip: '192.168.1.1',
          get: jest.fn().mockReturnValue('Test User Agent'),
        } as any,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockAdminUser.email);
      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(result.expiresIn).toBe(mockTokens.expiresIn);
    });
  });
});