import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventBusService } from '../../common/events/event-bus.service';
import {
  UserRegisteredEvent,
  UserProfileUpdatedEvent,
  UserDeactivatedEvent,
  UserReactivatedEvent,
} from '../../common/events/user-events';
import {
  createMockPrismaService,
  createMockEventBus,
  TEST_USER_IDS,
} from '../test-utils';
import {
  TestDataGenerator,
  TestAssertions,
} from '../test-utils/enhanced-test-helpers';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrisma: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();
    mockEventBus = createMockEventBus();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user by id (active only)', async () => {
      const mockUser = TestDataGenerator.createUser({ isActive: true });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(TEST_USER_IDS.CLIENT);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: TEST_USER_IDS.CLIENT,
          isActive: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByIdIncludeInactive', () => {
    it('should return a user by id including inactive users', async () => {
      const mockUser = TestDataGenerator.createUser({ isActive: false });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByIdIncludeInactive(
        TEST_USER_IDS.CLIENT,
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all active users', async () => {
      const mockUsers = [
        TestDataGenerator.createUser({ isActive: true }),
        TestDataGenerator.createUser({ isActive: true }),
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database error'));

      await TestAssertions.expectToThrowNestException(
        () => service.findAll(),
        InternalServerErrorException,
        'Database error',
      );
    });
  });

  describe('findOne', () => {
    it('should return user with therapist relationship', async () => {
      const mockUser = {
        ...TestDataGenerator.createUser({ isActive: true }),
        therapist: { id: 'therapist-123' },
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(TEST_USER_IDS.CLIENT);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: TEST_USER_IDS.CLIENT,
          isActive: true,
        },
        include: { therapist: true },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneIncludeInactive', () => {
    it('should return user with all relationships including inactive', async () => {
      const mockUser = {
        ...TestDataGenerator.createUser({ isActive: false }),
        therapist: { id: 'therapist-123' },
        client: { id: 'client-123' },
        admin: { id: 'admin-123' },
        moderator: { id: 'moderator-123' },
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneIncludeInactive(TEST_USER_IDS.CLIENT);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
        include: {
          therapist: true,
          client: true,
          admin: true,
          moderator: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByRole', () => {
    it('should return users by role (active only)', async () => {
      const mockUsers = [
        TestDataGenerator.createUser({ role: 'client', isActive: true }),
        TestDataGenerator.createUser({ role: 'client', isActive: true }),
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findByRole('client');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'client',
          isActive: true,
        },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('update', () => {
    it('should update user and emit profile updated event', async () => {
      const previousUser = TestDataGenerator.createUser();
      const updatedUser = { ...previousUser, firstName: 'Updated Name' };
      const updateData = { firstName: 'Updated Name' };

      mockPrisma.user.findUnique.mockResolvedValue(previousUser);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(TEST_USER_IDS.CLIENT, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
        data: updateData,
      });

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        expect.any(UserProfileUpdatedEvent),
      );

      expect(result).toEqual(updatedUser);
    });

    it('should throw error if user not found during update', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await TestAssertions.expectToThrowNestException(
        () => service.update(TEST_USER_IDS.CLIENT, { firstName: 'Test' }),
        InternalServerErrorException,
        'User not found',
      );
    });

    it('should handle update database errors', async () => {
      const mockUser = TestDataGenerator.createUser();
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockRejectedValue(new Error('Update failed'));

      await TestAssertions.expectToThrowNestException(
        () => service.update(TEST_USER_IDS.CLIENT, { firstName: 'Test' }),
        InternalServerErrorException,
        'Failed to update user',
      );
    });
  });

  describe('remove (soft delete)', () => {
    it('should soft delete user and emit deactivation event', async () => {
      const mockUser = TestDataGenerator.createUser({ isActive: true });
      const deactivatedUser = {
        ...mockUser,
        isActive: false,
        suspendedAt: new Date(),
        suspensionReason: 'Account deactivated by user',
      };

      mockPrisma.user.update.mockResolvedValue(deactivatedUser);

      const result = await service.remove(TEST_USER_IDS.CLIENT);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
        data: {
          isActive: false,
          suspendedAt: expect.any(Date),
          suspensionReason: 'Account deactivated by user',
        },
      });

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        expect.any(UserDeactivatedEvent),
      );

      expect(result).toEqual(deactivatedUser);
    });
  });

  describe('deactivate', () => {
    it('should administratively deactivate user', async () => {
      const mockUser = TestDataGenerator.createUser({ isActive: true });
      const deactivatedUser = {
        ...mockUser,
        isActive: false,
        suspendedAt: new Date(),
        suspendedBy: TEST_USER_IDS.ADMIN,
        suspensionReason: 'Policy violation',
      };

      mockPrisma.user.update.mockResolvedValue(deactivatedUser);

      const result = await service.deactivate(
        TEST_USER_IDS.CLIENT,
        'Policy violation',
        TEST_USER_IDS.ADMIN,
      );

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
        data: {
          isActive: false,
          suspendedAt: expect.any(Date),
          suspendedBy: TEST_USER_IDS.ADMIN,
          suspensionReason: 'Policy violation',
        },
      });

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        expect.any(UserDeactivatedEvent),
      );

      expect(result).toEqual(deactivatedUser);
    });
  });

  describe('reactivate', () => {
    it('should reactivate user and emit reactivation event', async () => {
      const suspendedDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const mockUser = TestDataGenerator.createUser({
        isActive: false,
        suspendedAt: suspendedDate,
      });
      const reactivatedUser = {
        ...mockUser,
        isActive: true,
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(reactivatedUser);

      const result = await service.reactivate(
        TEST_USER_IDS.CLIENT,
        TEST_USER_IDS.ADMIN,
      );

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
        data: {
          isActive: true,
          suspendedAt: null,
          suspendedBy: null,
          suspensionReason: null,
        },
      });

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        expect.any(UserReactivatedEvent),
      );

      expect(result).toEqual(reactivatedUser);
    });

    it('should throw error if user not found during reactivation', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await TestAssertions.expectToThrowNestException(
        () => service.reactivate(TEST_USER_IDS.CLIENT),
        InternalServerErrorException,
        'User not found',
      );
    });
  });

  describe('getUserRole', () => {
    it('should return user role', async () => {
      const mockUser = { role: 'client' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserRole(TEST_USER_IDS.CLIENT);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
        select: { role: true },
      });
      expect(result).toBe('client');
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserRole('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user and emit registration event', async () => {
      const userData = TestDataGenerator.createUser();
      mockPrisma.user.create.mockResolvedValue(userData);

      const result = await service.create(userData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        expect.any(UserRegisteredEvent),
      );

      expect(result).toEqual(userData);
    });

    it('should handle create database errors', async () => {
      const userData = TestDataGenerator.createUser();
      mockPrisma.user.create.mockRejectedValue(new Error('Creation failed'));

      await TestAssertions.expectToThrowNestException(
        () => service.create(userData),
        InternalServerErrorException,
        'Failed to create user',
      );
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete user', async () => {
      const mockUser = TestDataGenerator.createUser();
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      const result = await service.permanentDelete(TEST_USER_IDS.CLIENT);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
