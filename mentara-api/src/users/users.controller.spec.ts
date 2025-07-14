import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RoleUtils } from '../utils/role-utils';
import {
  createMockPrismaService,
  createMockEventBus,
  TEST_USER_IDS,
} from '../test-utils';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
} from '../test-utils/enhanced-test-helpers';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let roleUtils: jest.Mocked<RoleUtils>;

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

  const mockRoleUtils = {
    isUserAdmin: jest.fn(),
    isUserModerator: jest.fn(),
    isUserTherapist: jest.fn(),
    isUserClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: RoleUtils, useValue: mockRoleUtils },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    roleUtils = module.get(RoleUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all active users for admin', async () => {
      const mockUsers = [
        TestDataGenerator.createUser({ isActive: true }),
        TestDataGenerator.createUser({ isActive: true }),
      ];

      usersService.findAll.mockResolvedValue(mockUsers as any);

      const result = await controller.findAll(TEST_USER_IDS.ADMIN);

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should handle service errors gracefully', async () => {
      usersService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll(TEST_USER_IDS.ADMIN)).rejects.toThrow(
        HttpException,
      );
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
        TEST_USER_IDS.CLIENT,
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
        TEST_USER_IDS.CLIENT,
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
        controller.findOne(TEST_USER_IDS.THERAPIST, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(ForbiddenException);

      expect(usersService.findOne).not.toHaveBeenCalled();
    });

    it('should throw HttpException when user not found', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.findOne.mockResolvedValue(null);

      await expect(
        controller.findOne(TEST_USER_IDS.CLIENT, TEST_USER_IDS.CLIENT),
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
        TEST_USER_IDS.CLIENT,
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
        role: 'moderator',
        isActive: false,
      };
      const updatedUser = {
        ...TestDataGenerator.createUser(),
        ...adminUpdateData,
      };

      roleUtils.isUserAdmin.mockResolvedValue(true);
      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update(
        TEST_USER_IDS.CLIENT,
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
        TEST_USER_IDS.CLIENT,
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
          TEST_USER_IDS.THERAPIST,
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
        TEST_USER_IDS.CLIENT,
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
        TEST_USER_IDS.CLIENT,
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
        controller.remove(TEST_USER_IDS.THERAPIST, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(ForbiddenException);

      expect(usersService.remove).not.toHaveBeenCalled();
    });
  });

  describe('deactivateUser (admin only)', () => {
    it('should allow admin to deactivate user with reason', async () => {
      const deactivationBody = { reason: 'Policy violation' };
      usersService.deactivate.mockResolvedValue({} as any);

      const result = await controller.deactivateUser(
        TEST_USER_IDS.CLIENT,
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
        TEST_USER_IDS.CLIENT,
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
          TEST_USER_IDS.CLIENT,
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
        TEST_USER_IDS.CLIENT,
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
        controller.reactivateUser(TEST_USER_IDS.CLIENT, TEST_USER_IDS.ADMIN),
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
        controller.findOne(TEST_USER_IDS.CLIENT, TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should wrap generic errors in HttpException', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.findOne.mockRejectedValue(new Error('Generic error'));

      await expect(
        controller.findOne(TEST_USER_IDS.CLIENT, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(HttpException);
    });

    it('should handle role utils errors gracefully', async () => {
      roleUtils.isUserAdmin.mockRejectedValue(new Error('Role check failed'));

      await expect(
        controller.findOne(TEST_USER_IDS.CLIENT, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('authorization edge cases', () => {
    it('should handle empty update data for non-admin', async () => {
      roleUtils.isUserAdmin.mockResolvedValue(false);
      usersService.update.mockResolvedValue(
        TestDataGenerator.createUser() as any,
      );

      await controller.update(TEST_USER_IDS.CLIENT, {}, TEST_USER_IDS.CLIENT);

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
        TEST_USER_IDS.CLIENT,
        mixedData,
        TEST_USER_IDS.CLIENT,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        expectedSanitizedData,
      );
    });
  });
});
