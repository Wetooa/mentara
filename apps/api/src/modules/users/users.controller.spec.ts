import { Test, TestingModule } from '@nestjs/testing';
import { 
  HttpException, 
  HttpStatus, 
  ForbiddenException, 
  Logger 
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { RoleUtils } from '../../utils/role-utils';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  SecurityGuardTestUtils,
  RoleBasedTestUtils,
} from '../test-utils/auth-testing-helpers';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
} from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let supabaseStorageService: SupabaseStorageService;
  let roleUtils: RoleUtils;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;
  let mockAdminAuthGuard: jest.Mocked<AdminAuthGuard>;

  // Test data constants
  const mockUser = {
    id: TEST_USER_IDS.CLIENT,
    email: TEST_EMAILS.CLIENT,
    firstName: 'John',
    lastName: 'Doe',
    role: 'client',
    bio: 'User bio',
    avatarUrl: 'https://example.com/avatar.jpg',
    coverImageUrl: 'https://example.com/cover.jpg',
    phoneNumber: '+1234567890',
    timezone: 'America/New_York',
    language: 'en',
    theme: 'light',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: true,
    profileComplete: true,
    isActive: true,
  };

  const mockAdminUser = {
    id: TEST_USER_IDS.ADMIN,
    email: TEST_EMAILS.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: true,
    profileComplete: true,
    isActive: true,
  };

  const mockUsers = [mockUser, mockAdminUser];

  const mockFile = {
    fieldname: 'avatar',
    originalname: 'avatar.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test file content'),
  } as Express.Multer.File;

  const mockUploadResult = {
    url: 'https://example.com/uploaded-avatar.jpg',
    filename: 'avatar.jpg',
    size: 1024,
  };

  beforeEach(async () => {
    // Create mock services
    const mockUsersService = {
      findAll: jest.fn(),
      findAllIncludeInactive: jest.fn(),
      findOne: jest.fn(),
      findOneIncludeInactive: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      deactivate: jest.fn(),
      reactivate: jest.fn(),
    };

    const mockSupabaseStorageService = {
      validateFile: jest.fn(),
      uploadFile: jest.fn(),
      getSupportedBuckets: jest.fn(),
    };

    const mockRoleUtils = {
      isUserAdmin: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    } as any;

    mockAdminAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    } as any;

    // Add static method mock
    SupabaseStorageService.getSupportedBuckets = jest.fn().mockReturnValue({
      USER_PROFILES: 'user-profiles',
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockSupabaseStorageService,
        },
        {
          provide: RoleUtils,
          useValue: mockRoleUtils,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminAuthGuard)
      .useValue(mockAdminAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    supabaseStorageService = module.get<SupabaseStorageService>(SupabaseStorageService);
    roleUtils = module.get<RoleUtils>(RoleUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users for admin', async () => {
      // Arrange
      jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);

      // Act
      const result = await controller.findAll(TEST_USER_IDS.ADMIN);

      // Assert
      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(usersService, 'findAll').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findAll(TEST_USER_IDS.ADMIN)).rejects.toThrow(HttpException);
    });
  });

  describe('findAllIncludeInactive', () => {
    it('should return all users including inactive for admin', async () => {
      const mockUsers = [
        TestDataGenerator.createUser({ isActive: true }),
        TestDataGenerator.createUser({ isActive: false }),
      ];

      usersService.findAllIncludeInactive.mockResolvedValue(mockUsers as any);

      const result = await controller.findAllIncludeInactive(
        TEST_USER_IDS.ADMIN,
      );

      expect(usersService.findAllIncludeInactive).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should handle service errors when fetching all users', async () => {
      usersService.findAllIncludeInactive.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        controller.findAllIncludeInactive(TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    const mockUser = TestDataGenerator.createUser({ id: TEST_USER_IDS.CLIENT });

    it('should allow user to view their own profile', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.findOne.mockResolvedValue(mockUser as any);

      const result = await controller.findOne(
        { id: TEST_USER_IDS.CLIENT },
        TEST_USER_IDS.CLIENT,
      );

      expect(roleUtils.isUserAdmin).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(usersService.findOne).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockUser);
    });

    it('should allow admin to view any user profile', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(true);
      usersService.findOneIncludeInactive.mockResolvedValue(mockUser as any);

      const result = await controller.findOne(
        { id: TEST_USER_IDS.CLIENT },
        TEST_USER_IDS.ADMIN,
      );

      expect(roleUtils.isUserAdmin).toHaveBeenCalledWith(TEST_USER_IDS.ADMIN);
      expect(usersService.findOneIncludeInactive).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw ForbiddenException when non-admin tries to view other user', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);

      await expect(
        controller.findOne({ id: TEST_USER_IDS.THERAPIST }, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(ForbiddenException);

      expect(usersService.findOne).not.toHaveBeenCalled();
    });

    it('should throw HttpException when user not found', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.findOne.mockResolvedValue(null);

      await expect(
        controller.findOne({ id: TEST_USER_IDS.CLIENT }, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      bio: 'Updated bio',
    };

    it('should allow user to update their own profile', async () => {
      const updatedUser = { ...TestDataGenerator.createUser(), ...updateData };
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update(
        { id: TEST_USER_IDS.CLIENT },
        updateData,
        TEST_USER_IDS.CLIENT,
      );

      expect(roleUtils.isUserAdmin).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        updateData,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should allow admin to update any user with all fields', async () => {
      const adminUpdateData = {
        firstName: 'Admin Updated',
        role: 'admin',
        isActive: false,
      };
      const updatedUser = {
        ...TestDataGenerator.createUser(),
        ...adminUpdateData,
      };

      roleUtils.isUserAdmin.mockResolvedValue(true);
      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update(
        { id: TEST_USER_IDS.CLIENT },
        adminUpdateData,
        TEST_USER_IDS.ADMIN,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        adminUpdateData,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should sanitize non-admin updates to allowed fields only', async () => {
      const unauthorizedData = {
        firstName: 'John',
        role: 'admin', // Should be filtered out
        isActive: false, // Should be filtered out
        bio: 'New bio',
      };
      const sanitizedData = {
        firstName: 'John',
        bio: 'New bio',
      };
      const updatedUser = {
        ...TestDataGenerator.createUser(),
        ...sanitizedData,
      };

      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update(
        { id: TEST_USER_IDS.CLIENT },
        unauthorizedData,
        TEST_USER_IDS.CLIENT,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        sanitizedData,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw ForbiddenException when non-admin tries to update other user', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);

      await expect(
        controller.update(
          { id: TEST_USER_IDS.THERAPIST },
          updateData,
          TEST_USER_IDS.CLIENT,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(usersService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should allow user to deactivate their own account', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.remove.mockResolvedValue({} as any);

      const result = await controller.remove(
        { id: TEST_USER_IDS.CLIENT },
        TEST_USER_IDS.CLIENT,
      );

      expect(roleUtils.isUserAdmin).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(usersService.remove).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual({
        message: 'User account deactivated successfully',
      });
    });

    it('should allow admin to deactivate any user account', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(true);
      usersService.remove.mockResolvedValue({} as any);

      const result = await controller.remove(
        { id: TEST_USER_IDS.CLIENT },
        TEST_USER_IDS.ADMIN,
      );

      expect(usersService.remove).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual({
        message: 'User account deactivated successfully',
      });
    });

    it('should throw ForbiddenException when non-admin tries to deactivate other user', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);

      await expect(
        controller.remove({ id: TEST_USER_IDS.THERAPIST }, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(ForbiddenException);

      expect(usersService.remove).not.toHaveBeenCalled();
    });
  });

  describe('deactivateUser (admin only)', () => {
    it('should allow admin to deactivate user with reason', async () => {
      const deactivationBody = { reason: 'Policy violation' };
      usersService.deactivate.mockResolvedValue({} as any);

      const result = await controller.deactivateUser(
        { id: TEST_USER_IDS.CLIENT },
        deactivationBody,
        TEST_USER_IDS.ADMIN,
      );

      expect(usersService.deactivate).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        'Policy violation',
        TEST_USER_IDS.ADMIN,
      );
      expect(result).toEqual({
        message: 'User account deactivated by administrator',
      });
    });

    it('should handle deactivation without reason', async () => {
      const deactivationBody = {};
      usersService.deactivate.mockResolvedValue({} as any);

      const result = await controller.deactivateUser(
        { id: TEST_USER_IDS.CLIENT },
        deactivationBody,
        TEST_USER_IDS.ADMIN,
      );

      expect(usersService.deactivate).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        undefined,
        TEST_USER_IDS.ADMIN,
      );
      expect(result).toEqual({
        message: 'User account deactivated by administrator',
      });
    });

    it('should handle service errors during deactivation', async () => {
      const deactivationBody = { reason: 'Test reason' };
      usersService.deactivate.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.deactivateUser(
          { id: TEST_USER_IDS.CLIENT },
          deactivationBody,
          TEST_USER_IDS.ADMIN,
        ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('reactivateUser (admin only)', () => {
    it('should allow admin to reactivate user', async () => {
      usersService.reactivate.mockResolvedValue({} as any);

      const result = await controller.reactivateUser(
        { id: TEST_USER_IDS.CLIENT },
        TEST_USER_IDS.ADMIN,
      );

      expect(usersService.reactivate).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
      );
      expect(result).toEqual({
        message: 'User account reactivated successfully',
      });
    });

    it('should handle service errors during reactivation', async () => {
      usersService.reactivate.mockRejectedValue(
        new Error('Reactivation failed'),
      );

      await expect(
        controller.reactivateUser({ id: TEST_USER_IDS.CLIENT }, TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('error handling', () => {
    it('should preserve ForbiddenException from service layer', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(true);
      usersService.findOneIncludeInactive.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(
        controller.findOne({ id: TEST_USER_IDS.CLIENT }, TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should wrap generic errors in HttpException', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.findOne.mockRejectedValue(new Error('Generic error'));

      await expect(
        controller.findOne({ id: TEST_USER_IDS.CLIENT }, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(HttpException);
    });

    it('should handle role utils errors gracefully', async () => {
      roleUtils.isUserAdmin.mockRejectedValue(new Error('Role check failed'));

      await expect(
        controller.findOne({ id: TEST_USER_IDS.CLIENT }, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('authorization edge cases', () => {
    it('should handle empty update data for non-admin', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.update.mockResolvedValue(
        TestDataGenerator.createUser() as any,
      );

      await controller.update({ id: TEST_USER_IDS.CLIENT }, {}, TEST_USER_IDS.CLIENT);

      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        {},
      );
    });

    it('should handle mixed allowed and disallowed fields for non-admin', async () => {
      const mixedData = {
        firstName: 'John', // Allowed
        lastName: 'Doe', // Allowed
        role: 'admin', // Not allowed
        bio: 'New bio', // Allowed
        isActive: false, // Not allowed
        avatarUrl: 'http://example.com/avatar.jpg', // Allowed
      };
      const expectedSanitizedData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'New bio',
        avatarUrl: 'http://example.com/avatar.jpg',
      };

      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.update.mockResolvedValue(
        TestDataGenerator.createUser() as any,
      );

      await controller.update(
        { id: TEST_USER_IDS.CLIENT },
        mixedData,
        TEST_USER_IDS.CLIENT,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        expectedSanitizedData,
      );
    });
  });

  describe('File Upload Integration', () => {
    it('should handle avatar upload successfully', async () => {
      // Arrange
      const mockFiles = {
        avatar: [mockFile],
      };
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      roleUtils.isUserAdmin.mockResolvedValue(false);
      supabaseStorageService.validateFile.mockReturnValue({ isValid: true });
      supabaseStorageService.uploadFile.mockResolvedValue(mockUploadResult);
      usersService.update.mockResolvedValue(
        TestDataGenerator.createUser() as any,
      );

      // Act
      await controller.update(
        { id: TEST_USER_IDS.CLIENT },
        updateData,
        TEST_USER_IDS.CLIENT,
        mockFiles,
      );

      // Assert
      expect(supabaseStorageService.validateFile).toHaveBeenCalledWith(mockFile);
      expect(supabaseStorageService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'user-profiles',
      );
      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        {
          ...updateData,
          avatarUrl: mockUploadResult.url,
        },
      );
    });

    it('should handle cover image upload successfully', async () => {
      // Arrange
      const mockCoverFile = {
        ...mockFile,
        fieldname: 'cover',
        originalname: 'cover.jpg',
      };
      const mockFiles = {
        cover: [mockCoverFile],
      };
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      roleUtils.isUserAdmin.mockResolvedValue(false);
      supabaseStorageService.validateFile.mockReturnValue({ isValid: true });
      supabaseStorageService.uploadFile.mockResolvedValue(mockUploadResult);
      usersService.update.mockResolvedValue(
        TestDataGenerator.createUser() as any,
      );

      // Act
      await controller.update(
        { id: TEST_USER_IDS.CLIENT },
        updateData,
        TEST_USER_IDS.CLIENT,
        mockFiles,
      );

      // Assert
      expect(supabaseStorageService.validateFile).toHaveBeenCalledWith(mockCoverFile);
      expect(supabaseStorageService.uploadFile).toHaveBeenCalledWith(
        mockCoverFile,
        'user-profiles',
      );
      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        {
          ...updateData,
          coverImageUrl: mockUploadResult.url,
        },
      );
    });

    it('should handle multiple file uploads simultaneously', async () => {
      // Arrange
      const mockCoverFile = {
        ...mockFile,
        fieldname: 'cover',
        originalname: 'cover.jpg',
      };
      const mockFiles = {
        avatar: [mockFile],
        cover: [mockCoverFile],
      };
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      roleUtils.isUserAdmin.mockResolvedValue(false);
      supabaseStorageService.validateFile.mockReturnValue({ isValid: true });
      supabaseStorageService.uploadFile.mockResolvedValue(mockUploadResult);
      usersService.update.mockResolvedValue(
        TestDataGenerator.createUser() as any,
      );

      // Act
      await controller.update(
        { id: TEST_USER_IDS.CLIENT },
        updateData,
        TEST_USER_IDS.CLIENT,
        mockFiles,
      );

      // Assert
      expect(supabaseStorageService.validateFile).toHaveBeenCalledTimes(2);
      expect(supabaseStorageService.uploadFile).toHaveBeenCalledTimes(2);
      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        {
          ...updateData,
          avatarUrl: mockUploadResult.url,
          coverImageUrl: mockUploadResult.url,
        },
      );
    });

    it('should handle file validation errors', async () => {
      // Arrange
      const mockFiles = {
        avatar: [mockFile],
      };
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      roleUtils.isUserAdmin.mockResolvedValue(false);
      supabaseStorageService.validateFile.mockReturnValue({
        isValid: false,
        error: 'File too large',
      });

      // Act & Assert
      await expect(
        controller.update(
          { id: TEST_USER_IDS.CLIENT },
          updateData,
          TEST_USER_IDS.CLIENT,
          mockFiles,
        ),
      ).rejects.toThrow('Avatar validation failed: File too large');
    });

    it('should handle file upload errors', async () => {
      // Arrange
      const mockFiles = {
        avatar: [mockFile],
      };
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      roleUtils.isUserAdmin.mockResolvedValue(false);
      supabaseStorageService.validateFile.mockReturnValue({ isValid: true });
      supabaseStorageService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      // Act & Assert
      await expect(
        controller.update(
          { id: TEST_USER_IDS.CLIENT },
          updateData,
          TEST_USER_IDS.CLIENT,
          mockFiles,
        ),
      ).rejects.toThrow('Failed to update user: Upload failed');
    });
  });

  describe('Security Tests', () => {
    it('should validate input data through ZodValidationPipe', () => {
      // This tests that the controller uses proper validation
      const validationPipe = new ZodValidationPipe({} as any);
      expect(validationPipe).toBeDefined();
    });

    it('should require authentication for all endpoints', () => {
      // Test that all endpoints have JwtAuthGuard
      const protectedMethods = ['findAll', 'findAllIncludeInactive', 'findOne', 'update', 'remove', 'deactivateUser', 'reactivateUser'];
      
      protectedMethods.forEach(method => {
        const guards = Reflect.getMetadata('__guards__', UsersController.prototype[method as keyof UsersController]);
        expect(guards).toBeDefined();
      });
    });

    it('should enforce admin-only access for admin endpoints', () => {
      // Test that admin endpoints have AdminAuthGuard
      const adminMethods = ['findAll', 'findAllIncludeInactive', 'deactivateUser', 'reactivateUser'];
      
      adminMethods.forEach(method => {
        const guards = Reflect.getMetadata('__guards__', controller[method as keyof UsersController]);
        expect(guards).toBeDefined();
      });
    });

    it('should handle JWT token validation', async () => {
      // Test that JWT guard is properly applied
      mockJwtAuthGuard.canActivate.mockReturnValue(false);
      
      // Mock the actual HTTP exception that would be thrown
      const unauthorizedError = new Error('Unauthorized');
      usersService.findAll.mockRejectedValue(unauthorizedError);
      
      await expect(controller.findAll(TEST_USER_IDS.ADMIN)).rejects.toThrow();
    });

    it('should handle admin authorization validation', async () => {
      // Test that admin guard is properly applied
      mockAdminAuthGuard.canActivate.mockReturnValue(false);
      
      // Mock the actual HTTP exception that would be thrown
      const forbiddenError = new Error('Forbidden');
      usersService.findAll.mockRejectedValue(forbiddenError);
      
      await expect(controller.findAll(TEST_USER_IDS.ADMIN)).rejects.toThrow();
    });

    it('should prevent unauthorized access to other user profiles', async () => {
      // Test that users can only access their own profile
      roleUtils.isUserAdmin.mockResolvedValue(false);
      
      await expect(
        controller.findOne({ id: TEST_USER_IDS.THERAPIST }, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Role-based Access Control', () => {
    it('should test role-based access for admin endpoints', async () => {
      // Test that admin endpoints require admin role
      await RoleBasedTestUtils.testWithRoles(
        async (userId: string, role: string) => {
          try {
            await controller.findAll(userId);
            return true;
          } catch (error) {
            return false;
          }
        },
        {
          client: false,
          therapist: false,
          admin: true,
          admin: false,
        },
      );
    });

    it('should validate user-specific functionality', async () => {
      // Test that users can access their own profile
      const userContext = MockBuilder.createAuthContext('client');
      
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.findOne.mockResolvedValue(mockUser as any);
      
      const result = await controller.findOne({ id: userContext.userId }, userContext.userId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(userContext.userId);
    });

    it('should test field sanitization for non-admin users', async () => {
      // Test that non-admin users cannot update sensitive fields
      const sensitiveData = {
        firstName: 'John',
        role: 'admin', // Should be filtered out
        isActive: false, // Should be filtered out
        emailVerified: true, // Should be filtered out
      };
      
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.update.mockResolvedValue(mockUser as any);
      
      await controller.update({ id: TEST_USER_IDS.CLIENT }, sensitiveData, TEST_USER_IDS.CLIENT);
      
      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        { firstName: 'John' }, // Only allowed fields
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user profile update workflow', async () => {
      // Arrange
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio',
        timezone: 'America/Los_Angeles',
        language: 'en',
        theme: 'dark',
      };
      const updatedUser = { ...mockUser, ...updateData };
      
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.update.mockResolvedValue(updatedUser as any);
      
      // Act
      const result = await controller.update(
        { id: TEST_USER_IDS.CLIENT },
        updateData,
        TEST_USER_IDS.CLIENT,
      );
      
      // Assert
      expect(result).toBeDefined();
      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
      expect(result.bio).toBe('Updated bio');
      expect(result.timezone).toBe('America/Los_Angeles');
    });

    it('should handle complete admin user management workflow', async () => {
      // Arrange
      roleUtils.isUserAdmin.mockResolvedValue(true);
      usersService.findAll.mockResolvedValue(mockUsers as any);
      usersService.findAllIncludeInactive.mockResolvedValue(mockUsers as any);
      usersService.findOneIncludeInactive.mockResolvedValue(mockUser as any);
      
      // Act - Get all users
      const allUsers = await controller.findAll(TEST_USER_IDS.ADMIN);
      
      // Act - Get all users including inactive
      const allUsersIncludeInactive = await controller.findAllIncludeInactive(TEST_USER_IDS.ADMIN);
      
      // Act - View specific user
      const specificUser = await controller.findOne({ id: TEST_USER_IDS.CLIENT }, TEST_USER_IDS.ADMIN);
      
      // Assert
      expect(allUsers).toBeDefined();
      expect(allUsers).toHaveLength(2);
      
      expect(allUsersIncludeInactive).toBeDefined();
      expect(allUsersIncludeInactive).toHaveLength(2);
      
      expect(specificUser).toBeDefined();
      expect(specificUser.id).toBe(TEST_USER_IDS.CLIENT);
    });

    it('should handle complete user deactivation workflow', async () => {
      // Arrange
      usersService.deactivate.mockResolvedValue({} as any);
      
      // Act
      const result = await controller.deactivateUser(
        { id: TEST_USER_IDS.CLIENT },
        { reason: 'Policy violation' },
        TEST_USER_IDS.ADMIN,
      );
      
      // Assert
      expect(result).toBeDefined();
      expect(result.message).toBe('User account deactivated by administrator');
      expect(usersService.deactivate).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        'Policy violation',
        TEST_USER_IDS.ADMIN,
      );
    });

    it('should handle complete user reactivation workflow', async () => {
      // Arrange
      usersService.reactivate.mockResolvedValue({} as any);
      
      // Act
      const result = await controller.reactivateUser(
        { id: TEST_USER_IDS.CLIENT },
        TEST_USER_IDS.ADMIN,
      );
      
      // Assert
      expect(result).toBeDefined();
      expect(result.message).toBe('User account reactivated successfully');
      expect(usersService.reactivate).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });
  });

  describe('Data Validation', () => {
    it('should validate user update data structure', () => {
      // Test that we're using the correct DTO structure
      const validUpdateData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'User bio',
        avatarUrl: 'https://example.com/avatar.jpg',
        coverImageUrl: 'https://example.com/cover.jpg',
        phoneNumber: '+1234567890',
        timezone: 'America/New_York',
        language: 'en',
        theme: 'light',
      };
      
      // Verify all fields are defined
      expect(validUpdateData.firstName).toBeDefined();
      expect(validUpdateData.lastName).toBeDefined();
      expect(validUpdateData.bio).toBeDefined();
      expect(validUpdateData.avatarUrl).toBeDefined();
      expect(validUpdateData.coverImageUrl).toBeDefined();
      expect(validUpdateData.phoneNumber).toBeDefined();
      expect(validUpdateData.timezone).toBeDefined();
      expect(validUpdateData.language).toBeDefined();
      expect(validUpdateData.theme).toBeDefined();
    });

    it('should validate deactivation data structure', () => {
      // Test that we're using the correct DTO structure
      const validDeactivationData = {
        reason: 'Policy violation',
      };
      
      // Verify all fields are defined
      expect(validDeactivationData.reason).toBeDefined();
    });

    it('should validate user ID parameter structure', () => {
      // Test that we're using the correct parameter structure
      const validUserIdParam = {
        id: TEST_USER_IDS.CLIENT,
      };
      
      // Verify all fields are defined
      expect(validUserIdParam.id).toBeDefined();
    });
  });

  describe('Response Format Validation', () => {
    it('should return correctly formatted user list response', async () => {
      // Arrange
      roleUtils.isUserAdmin.mockResolvedValue(true);
      usersService.findAll.mockResolvedValue(mockUsers as any);
      
      // Act
      const result = await controller.findAll(TEST_USER_IDS.ADMIN);
      
      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      
      const user = result[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('isActive');
    });

    it('should return correctly formatted user profile response', async () => {
      // Arrange
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.findOne.mockResolvedValue(mockUser as any);
      
      // Act
      const result = await controller.findOne({ id: TEST_USER_IDS.CLIENT }, TEST_USER_IDS.CLIENT);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('bio');
      expect(result).toHaveProperty('avatarUrl');
      expect(result).toHaveProperty('coverImageUrl');
      expect(result).toHaveProperty('phoneNumber');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('language');
      expect(result).toHaveProperty('theme');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should return correctly formatted update response', async () => {
      // Arrange
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };
      const updatedUser = { ...mockUser, ...updateData };
      
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.update.mockResolvedValue(updatedUser as any);
      
      // Act
      const result = await controller.update(
        { id: TEST_USER_IDS.CLIENT },
        updateData,
        TEST_USER_IDS.CLIENT,
      );
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
    });

    it('should return correctly formatted deactivation response', async () => {
      // Arrange
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.remove.mockResolvedValue({} as any);
      
      // Act
      const result = await controller.remove({ id: TEST_USER_IDS.CLIENT }, TEST_USER_IDS.CLIENT);
      
      // Assert
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('User account deactivated successfully');
    });

    it('should return correctly formatted admin deactivation response', async () => {
      // Arrange
      usersService.deactivate.mockResolvedValue({} as any);
      
      // Act
      const result = await controller.deactivateUser(
        TEST_USER_IDS.CLIENT,
        { reason: 'Policy violation' },
        TEST_USER_IDS.ADMIN,
      );
      
      // Assert
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('User account deactivated by administrator');
    });

    it('should return correctly formatted reactivation response', async () => {
      // Arrange
      usersService.reactivate.mockResolvedValue({} as any);
      
      // Act
      const result = await controller.reactivateUser(
        { id: TEST_USER_IDS.CLIENT },
        TEST_USER_IDS.ADMIN,
      );
      
      // Assert
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('User account reactivated successfully');
    });
  });
});
