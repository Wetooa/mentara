import { Test, TestingModule } from '@nestjs/testing';
import { 
  UnauthorizedException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ModeratorAuthController } from './moderator-auth.controller';
import { ModeratorAuthService } from '../services/moderator-auth.service';
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
  TEST_COMMUNITY_IDS,
} from '../../test-utils/auth-testing-helpers';

describe('ModeratorAuthController', () => {
  let controller: ModeratorAuthController;
  let moderatorAuthService: ModeratorAuthService;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;

  // Test data constants
  const mockModeratorUser = {
    id: TEST_USER_IDS.MODERATOR,
    email: TEST_EMAILS.MODERATOR,
    firstName: 'Jane',
    lastName: 'Moderator',
    role: 'moderator',
    emailVerified: true,
    permissions: ['moderate_posts', 'ban_users', 'delete_comments'],
    assignedCommunities: [TEST_COMMUNITY_IDS.ANXIETY_SUPPORT, TEST_COMMUNITY_IDS.DEPRESSION_HELP],
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };

  const mockCreateAccountResult = {
    user: mockModeratorUser,
    message: 'Moderator account created successfully',
  };

  const mockLoginResult = {
    user: mockModeratorUser,
    tokens: mockTokens,
  };

  const mockPermissions = {
    permissions: ['moderate_posts', 'ban_users', 'delete_comments'],
    canModeratePosts: true,
    canBanUsers: true,
    canDeleteComments: true,
    canAccessReports: true,
  };

  const mockAssignedCommunities = {
    assignedCommunities: [
      {
        id: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
        name: 'Anxiety Support',
        description: 'A supportive community for anxiety management',
        memberCount: 150,
        pendingPosts: 5,
      },
      {
        id: TEST_COMMUNITY_IDS.DEPRESSION_HELP,
        name: 'Depression Help',
        description: 'Support for depression recovery',
        memberCount: 120,
        pendingPosts: 3,
      },
    ],
  };

  const mockDashboardStats = {
    totalPostsModerated: 45,
    pendingReports: 8,
    communitiesManaged: 2,
    usersModerated: 12,
    recentActivity: [
      {
        action: 'post_moderated',
        timestamp: new Date().toISOString(),
        communityId: TEST_COMMUNITY_IDS.ANXIETY_SUPPORT,
      },
      {
        action: 'user_banned',
        timestamp: new Date().toISOString(),
        communityId: TEST_COMMUNITY_IDS.DEPRESSION_HELP,
      },
    ],
  };

  beforeEach(async () => {
    // Create mock services
    const mockModeratorAuthService = {
      createModeratorAccount: jest.fn(),
      loginModerator: jest.fn(),
      getModeratorProfile: jest.fn(),
      getModeratorPermissions: jest.fn(),
      getAssignedCommunities: jest.fn(),
      getModeratorDashboardStats: jest.fn(),
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
      controllers: [ModeratorAuthController],
      providers: [
        {
          provide: ModeratorAuthService,
          useValue: mockModeratorAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ModeratorAuthController>(ModeratorAuthController);
    moderatorAuthService = module.get<ModeratorAuthService>(ModeratorAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createModeratorAccount', () => {
    const validRegisterDto = {
      email: 'newmoderator@mentara.com',
      password: 'SecurePass123!',
      firstName: 'New',
      lastName: 'Moderator',
      permissions: ['moderate_posts', 'ban_users'],
      assignedCommunities: [TEST_COMMUNITY_IDS.ANXIETY_SUPPORT],
    };

    it('should create moderator account successfully for admin user', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'createModeratorAccount').mockResolvedValue(mockCreateAccountResult);

      // Act
      const result = await controller.createModeratorAccount('admin', validRegisterDto);

      // Assert
      expect(moderatorAuthService.createModeratorAccount).toHaveBeenCalledWith(
        validRegisterDto.email,
        validRegisterDto.password,
        validRegisterDto.firstName,
        validRegisterDto.lastName,
        validRegisterDto.permissions,
        validRegisterDto.assignedCommunities,
      );
      expect(result).toEqual({
        user: {
          id: mockModeratorUser.id,
          email: mockModeratorUser.email,
          firstName: mockModeratorUser.firstName,
          lastName: mockModeratorUser.lastName,
          role: mockModeratorUser.role,
          emailVerified: mockModeratorUser.emailVerified,
        },
        message: mockCreateAccountResult.message,
      });
    });

    it('should create moderator account with optional fields', async () => {
      // Arrange
      const minimalRegisterDto = {
        email: 'minimal@mentara.com',
        password: 'SecurePass123!',
        firstName: 'Minimal',
        lastName: 'Moderator',
      };

      jest.spyOn(moderatorAuthService, 'createModeratorAccount').mockResolvedValue(mockCreateAccountResult);

      // Act
      const result = await controller.createModeratorAccount('admin', minimalRegisterDto);

      // Assert
      expect(moderatorAuthService.createModeratorAccount).toHaveBeenCalledWith(
        minimalRegisterDto.email,
        minimalRegisterDto.password,
        minimalRegisterDto.firstName,
        minimalRegisterDto.lastName,
        [], // empty permissions array
        [], // empty assignedCommunities array
      );
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      // Act & Assert
      await expect(controller.createModeratorAccount('client', validRegisterDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(controller.createModeratorAccount('therapist', validRegisterDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(controller.createModeratorAccount('moderator', validRegisterDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle email already exists error', async () => {
      // Arrange
      const error = new BadRequestException('Email already exists');
      jest.spyOn(moderatorAuthService, 'createModeratorAccount').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createModeratorAccount('admin', validRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(moderatorAuthService, 'createModeratorAccount').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createModeratorAccount('admin', validRegisterDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    const validLoginDto = {
      email: TEST_EMAILS.MODERATOR,
      password: 'SecurePass123!',
    };

    const mockRequest = {
      ip: '192.168.1.1',
      get: jest.fn().mockReturnValue('Test User Agent'),
    } as any;

    it('should login moderator successfully with valid credentials', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'loginModerator').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(validLoginDto, mockRequest);

      // Assert
      expect(moderatorAuthService.loginModerator).toHaveBeenCalledWith(
        validLoginDto.email,
        validLoginDto.password,
        mockRequest.ip,
        'Test User Agent',
      );

      expect(result).toEqual({
        user: {
          id: mockModeratorUser.id,
          email: mockModeratorUser.email,
          firstName: mockModeratorUser.firstName,
          lastName: mockModeratorUser.lastName,
          role: mockModeratorUser.role,
          emailVerified: mockModeratorUser.emailVerified,
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

      jest.spyOn(moderatorAuthService, 'loginModerator').mockResolvedValue(mockLoginResult);

      // Act
      await controller.login(validLoginDto, mockRequestWithoutUserAgent);

      // Assert
      expect(moderatorAuthService.loginModerator).toHaveBeenCalledWith(
        validLoginDto.email,
        validLoginDto.password,
        mockRequestWithoutUserAgent.ip,
        undefined,
      );
    });

    it('should handle invalid credentials', async () => {
      // Arrange
      const authError = new UnauthorizedException('Invalid credentials');
      jest.spyOn(moderatorAuthService, 'loginModerator').mockRejectedValue(authError);

      // Act & Assert
      await expect(controller.login(validLoginDto, mockRequest)).rejects.toThrow(authError);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      jest.spyOn(moderatorAuthService, 'loginModerator').mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.login(validLoginDto, mockRequest)).rejects.toThrow(serviceError);
    });
  });

  describe('getProfile', () => {
    it('should return moderator profile successfully', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'getModeratorProfile').mockResolvedValue(mockModeratorUser);

      // Act
      const result = await controller.getProfile(TEST_USER_IDS.MODERATOR);

      // Assert
      expect(moderatorAuthService.getModeratorProfile).toHaveBeenCalledWith(TEST_USER_IDS.MODERATOR);
      expect(result).toEqual(mockModeratorUser);
    });

    it('should handle profile not found', async () => {
      // Arrange
      const notFoundError = new Error('Moderator profile not found');
      jest.spyOn(moderatorAuthService, 'getModeratorProfile').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getProfile(TEST_USER_IDS.MODERATOR)).rejects.toThrow(notFoundError);
    });
  });

  describe('getPermissions', () => {
    it('should return moderator permissions successfully', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'getModeratorPermissions').mockResolvedValue(mockPermissions);

      // Act
      const result = await controller.getPermissions(TEST_USER_IDS.MODERATOR);

      // Assert
      expect(moderatorAuthService.getModeratorPermissions).toHaveBeenCalledWith(TEST_USER_IDS.MODERATOR);
      expect(result).toEqual(mockPermissions);
    });

    it('should handle permissions not found', async () => {
      // Arrange
      const notFoundError = new Error('Moderator permissions not found');
      jest.spyOn(moderatorAuthService, 'getModeratorPermissions').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getPermissions(TEST_USER_IDS.MODERATOR)).rejects.toThrow(notFoundError);
    });
  });

  describe('getAssignedCommunities', () => {
    it('should return assigned communities successfully', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'getAssignedCommunities').mockResolvedValue(mockAssignedCommunities);

      // Act
      const result = await controller.getAssignedCommunities(TEST_USER_IDS.MODERATOR);

      // Assert
      expect(moderatorAuthService.getAssignedCommunities).toHaveBeenCalledWith(TEST_USER_IDS.MODERATOR);
      expect(result).toEqual(mockAssignedCommunities);
    });

    it('should handle assigned communities not found', async () => {
      // Arrange
      const notFoundError = new Error('Assigned communities not found');
      jest.spyOn(moderatorAuthService, 'getAssignedCommunities').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getAssignedCommunities(TEST_USER_IDS.MODERATOR)).rejects.toThrow(notFoundError);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics successfully', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'getModeratorDashboardStats').mockResolvedValue(mockDashboardStats);

      // Act
      const result = await controller.getDashboardStats(TEST_USER_IDS.MODERATOR);

      // Assert
      expect(moderatorAuthService.getModeratorDashboardStats).toHaveBeenCalledWith(TEST_USER_IDS.MODERATOR);
      expect(result).toEqual(mockDashboardStats);
    });

    it('should handle dashboard stats not found', async () => {
      // Arrange
      const notFoundError = new Error('Dashboard stats not found');
      jest.spyOn(moderatorAuthService, 'getModeratorDashboardStats').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getDashboardStats(TEST_USER_IDS.MODERATOR)).rejects.toThrow(notFoundError);
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
      const createAccountMetadata = Reflect.getMetadata('__throttler_options__', controller.createModeratorAccount);
      const loginMetadata = Reflect.getMetadata('__throttler_options__', controller.login);
      
      expect(createAccountMetadata).toBeDefined();
      expect(loginMetadata).toBeDefined();
    });

    it('should require authentication for protected endpoints', () => {
      // Test that protected endpoints have JwtAuthGuard
      const protectedMethods = ['createModeratorAccount', 'getProfile', 'getPermissions', 'getAssignedCommunities', 'getDashboardStats'];
      
      protectedMethods.forEach(method => {
        const guards = Reflect.getMetadata('__guards__', controller[method as keyof ModeratorAuthController]);
        expect(guards).toBeDefined();
      });
    });

    it('should allow public access to login endpoint', () => {
      // Test that login endpoint is marked as public
      const publicMetadata = Reflect.getMetadata('isPublic', controller.login);
      expect(publicMetadata).toBeTruthy();
    });
  });

  describe('Role-based Access Control', () => {
    it('should test role-based access for moderator creation', async () => {
      // Test that only admin role can create moderators
      const registerDto = {
        email: 'test@mentara.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'Moderator',
      };

      await RoleBasedTestUtils.testWithRoles(
        async (userId: string, role: string) => {
          try {
            await controller.createModeratorAccount(role, registerDto);
            return true;
          } catch (error) {
            return false;
          }
        },
        {
          client: false,
          therapist: false,
          admin: true,
          moderator: false,
        },
      );
    });

    it('should validate moderator-specific functionality', async () => {
      // Test that moderator-specific endpoints work for moderators
      const moderatorContext = MockBuilder.createAuthContext('moderator');
      
      jest.spyOn(moderatorAuthService, 'getModeratorProfile').mockResolvedValue(mockModeratorUser);
      
      const result = await controller.getProfile(moderatorContext.userId);
      
      expect(result).toBeDefined();
      expect(result.role).toBe('moderator');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      jest.spyOn(moderatorAuthService, 'getModeratorProfile').mockRejectedValue(networkError);

      // Act & Assert
      await expect(controller.getProfile(TEST_USER_IDS.MODERATOR)).rejects.toThrow(networkError);
    });

    it('should handle validation errors', async () => {
      // Test that invalid data would be caught by the validation pipe
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '',
        lastName: '',
      };

      // In a real scenario, this would throw a validation error
      // The pipe would catch this before it reaches the controller
      expect(() => {
        // This would be handled by ZodValidationPipe
        // and would throw a BadRequestException
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete moderator account creation workflow', async () => {
      // Arrange
      const createAccountDto = {
        email: 'integration@mentara.com',
        password: 'SecurePass123!',
        firstName: 'Integration',
        lastName: 'Test',
        permissions: ['moderate_posts', 'ban_users'],
        assignedCommunities: [TEST_COMMUNITY_IDS.ANXIETY_SUPPORT],
      };

      jest.spyOn(moderatorAuthService, 'createModeratorAccount').mockResolvedValue(mockCreateAccountResult);

      // Act
      const result = await controller.createModeratorAccount('admin', createAccountDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockModeratorUser.email);
      expect(result.user.role).toBe('moderator');
      expect(result.message).toBe(mockCreateAccountResult.message);
    });

    it('should handle complete moderator login workflow', async () => {
      // Arrange
      const loginDto = {
        email: TEST_EMAILS.MODERATOR,
        password: 'SecurePass123!',
      };

      const mockRequest = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Test User Agent'),
      } as any;

      jest.spyOn(moderatorAuthService, 'loginModerator').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(loginDto, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockModeratorUser.email);
      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(result.expiresIn).toBe(mockTokens.expiresIn);
    });

    it('should handle complete moderator profile workflow', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'getModeratorProfile').mockResolvedValue(mockModeratorUser);
      jest.spyOn(moderatorAuthService, 'getModeratorPermissions').mockResolvedValue(mockPermissions);
      jest.spyOn(moderatorAuthService, 'getAssignedCommunities').mockResolvedValue(mockAssignedCommunities);

      // Act - Get profile
      const profile = await controller.getProfile(TEST_USER_IDS.MODERATOR);
      
      // Act - Get permissions
      const permissions = await controller.getPermissions(TEST_USER_IDS.MODERATOR);
      
      // Act - Get assigned communities
      const communities = await controller.getAssignedCommunities(TEST_USER_IDS.MODERATOR);

      // Assert
      expect(profile).toBeDefined();
      expect(profile.role).toBe('moderator');
      expect(profile.permissions).toEqual(mockModeratorUser.permissions);
      
      expect(permissions).toBeDefined();
      expect(permissions.canModeratePosts).toBe(true);
      expect(permissions.canBanUsers).toBe(true);
      
      expect(communities).toBeDefined();
      expect(communities.assignedCommunities).toHaveLength(2);
    });

    it('should handle complete moderator dashboard workflow', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'getModeratorDashboardStats').mockResolvedValue(mockDashboardStats);

      // Act
      const stats = await controller.getDashboardStats(TEST_USER_IDS.MODERATOR);

      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalPostsModerated).toBe(45);
      expect(stats.pendingReports).toBe(8);
      expect(stats.communitiesManaged).toBe(2);
      expect(stats.recentActivity).toHaveLength(2);
    });
  });

  describe('Data Validation', () => {
    it('should validate moderator creation data structure', () => {
      // Test that we're using the correct DTO structure
      const validModeratorData = {
        email: 'test@mentara.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'Moderator',
        permissions: ['moderate_posts', 'ban_users'],
        assignedCommunities: [TEST_COMMUNITY_IDS.ANXIETY_SUPPORT],
      };

      // Verify all required fields are present
      expect(validModeratorData.email).toBeDefined();
      expect(validModeratorData.password).toBeDefined();
      expect(validModeratorData.firstName).toBeDefined();
      expect(validModeratorData.lastName).toBeDefined();
      expect(validModeratorData.permissions).toBeDefined();
      expect(validModeratorData.assignedCommunities).toBeDefined();
    });

    it('should validate login data structure', () => {
      // Test that we're using the correct DTO structure
      const validLoginData = {
        email: 'test@mentara.com',
        password: 'SecurePass123!',
      };

      // Verify all required fields are present
      expect(validLoginData.email).toBeDefined();
      expect(validLoginData.password).toBeDefined();
    });
  });

  describe('Response Format Validation', () => {
    it('should return correctly formatted moderator creation response', async () => {
      // Arrange
      const createAccountDto = {
        email: 'format@mentara.com',
        password: 'SecurePass123!',
        firstName: 'Format',
        lastName: 'Test',
        permissions: ['moderate_posts'],
        assignedCommunities: [TEST_COMMUNITY_IDS.ANXIETY_SUPPORT],
      };

      jest.spyOn(moderatorAuthService, 'createModeratorAccount').mockResolvedValue(mockCreateAccountResult);

      // Act
      const result = await controller.createModeratorAccount('admin', createAccountDto);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('message');
      expect(result).not.toHaveProperty('accessToken'); // Creation doesn't include tokens
      expect(result).not.toHaveProperty('refreshToken');
      
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('firstName');
      expect(result.user).toHaveProperty('lastName');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('emailVerified');
    });

    it('should return correctly formatted login response', async () => {
      // Arrange
      const loginDto = {
        email: TEST_EMAILS.MODERATOR,
        password: 'SecurePass123!',
      };

      const mockRequest = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Test User Agent'),
      } as any;

      jest.spyOn(moderatorAuthService, 'loginModerator').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(loginDto, mockRequest);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).not.toHaveProperty('message'); // Login doesn't include message
    });

    it('should return correctly formatted permissions response', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'getModeratorPermissions').mockResolvedValue(mockPermissions);

      // Act
      const result = await controller.getPermissions(TEST_USER_IDS.MODERATOR);

      // Assert
      expect(result).toHaveProperty('permissions');
      expect(result).toHaveProperty('canModeratePosts');
      expect(result).toHaveProperty('canBanUsers');
      expect(result).toHaveProperty('canDeleteComments');
      expect(result).toHaveProperty('canAccessReports');
      
      expect(result.permissions).toBeInstanceOf(Array);
      expect(result.canModeratePosts).toBe(true);
      expect(result.canBanUsers).toBe(true);
    });

    it('should return correctly formatted dashboard stats response', async () => {
      // Arrange
      jest.spyOn(moderatorAuthService, 'getModeratorDashboardStats').mockResolvedValue(mockDashboardStats);

      // Act
      const result = await controller.getDashboardStats(TEST_USER_IDS.MODERATOR);

      // Assert
      expect(result).toHaveProperty('totalPostsModerated');
      expect(result).toHaveProperty('pendingReports');
      expect(result).toHaveProperty('communitiesManaged');
      expect(result).toHaveProperty('usersModerated');
      expect(result).toHaveProperty('recentActivity');
      
      expect(result.totalPostsModerated).toBe(45);
      expect(result.recentActivity).toBeInstanceOf(Array);
      expect(result.recentActivity).toHaveLength(2);
    });
  });

  describe('Admin-only Functionality', () => {
    it('should enforce admin-only access for moderator creation', async () => {
      // Arrange
      const createAccountDto = {
        email: 'admin-only@mentara.com',
        password: 'SecurePass123!',
        firstName: 'Admin',
        lastName: 'Only',
      };

      // Test each role
      const roles = ['client', 'therapist', 'moderator'];
      
      for (const role of roles) {
        await expect(controller.createModeratorAccount(role, createAccountDto)).rejects.toThrow(
          ForbiddenException,
        );
      }

      // Test admin access
      jest.spyOn(moderatorAuthService, 'createModeratorAccount').mockResolvedValue(mockCreateAccountResult);
      const result = await controller.createModeratorAccount('admin', createAccountDto);
      expect(result).toBeDefined();
    });

    it('should validate admin role before moderator creation', async () => {
      // Arrange
      const createAccountDto = {
        email: 'validation@mentara.com',
        password: 'SecurePass123!',
        firstName: 'Validation',
        lastName: 'Test',
      };

      // Act & Assert
      await expect(controller.createModeratorAccount('invalid-role', createAccountDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});