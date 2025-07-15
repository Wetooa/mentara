import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';
import { UserRegisteredEvent } from '../common/events/user-events';
import {
  createMockPrismaService,
  createMockEventBus,
  TEST_USER_IDS,
} from '../test-utils';
import {
  TestDataGenerator,
  TestAssertions,
} from '../test-utils/enhanced-test-helpers';
import { ClientCreateDto } from 'schema/auth';

// @clerk/backend has been removed from the project - JWT auth is now used instead

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();
    mockEventBus = createMockEventBus();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Mock the private clerkClient property
    (service as any).clerkClient = mockClerkClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerClient', () => {
    const mockClientDto = {
      user: {
        id: TEST_USER_IDS.CLIENT,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        middleName: null,
        birthDate: new Date('1990-01-01'),
        address: null,
        avatarUrl: null,
        role: 'client',
        isActive: true,
        isVerified: false,
      },
      dateOfBirth: new Date('1990-01-01'),
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+1234567890',
        relationship: 'Parent',
      },
      hasSeenTherapistRecommendations: false,
    } as ClientCreateDto;

    it('should successfully register a new client', async () => {
      const userId = TEST_USER_IDS.CLIENT;

      // Mock database responses
      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrisma.user.create.mockResolvedValue(mockClientDto.user);

      const mockClient = {
        ...mockClientDto,
        user: mockClientDto.user,
        id: 'client-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.client.create.mockResolvedValue(mockClient);

      mockClerkClient.users.updateUserMetadata.mockResolvedValue({});

      const result = await service.registerClient(userId, mockClientDto);

      // Verify Clerk metadata update
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledWith(
        userId,
        {
          publicMetadata: {
            role: 'client',
          },
        },
      );

      // Verify database operations
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: mockClientDto.user,
      });

      expect(mockPrisma.client.create).toHaveBeenCalledWith({
        data: {
          ...mockClientDto,
          user: { connect: { id: userId } },
        },
        include: {
          user: true,
        },
      });

      // Verify event publication
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        expect.any(UserRegisteredEvent),
      );

      expect(result).toEqual(mockClient);
    });

    it('should throw ConflictException if user already exists', async () => {
      const userId = TEST_USER_IDS.CLIENT;
      const existingUser = TestDataGenerator.createUser();

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      await TestAssertions.expectToThrowNestException(
        () => service.registerClient(userId, mockClientDto),
        ConflictException,
        'User already exists',
      );

      expect(mockPrisma.client.create).not.toHaveBeenCalled();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const userId = TEST_USER_IDS.CLIENT;

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'));

      await TestAssertions.expectToThrowNestException(
        () => service.registerClient(userId, mockClientDto),
        InternalServerErrorException,
        'User registration failed',
      );
    });
  });

  describe('registerTherapist', () => {
    const mockTherapistDto = {
      user: {
        id: TEST_USER_IDS.THERAPIST,
        email: 'therapist@example.com',
        firstName: 'Dr. Test',
        lastName: 'Therapist',
        middleName: null,
        birthDate: new Date('1980-01-01'),
        address: null,
        avatarUrl: null,
        role: 'therapist',
        isActive: true,
        isVerified: false,
      },
      // Minimal required fields for TherapistCreateDto
      mobile: '+1234567890',
      province: 'Test Province',
    } as any; // Use any to avoid complex DTO construction

    it('should successfully register a new therapist', async () => {
      const userId = TEST_USER_IDS.THERAPIST;

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockTherapistDto.user);

      const mockTherapist = {
        ...mockTherapistDto,
        user: mockTherapistDto.user,
        id: 'therapist-123',
        status: 'pending',
        treatmentSuccessRates: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.therapist.create.mockResolvedValue(mockTherapist);

      mockClerkClient.users.updateUserMetadata.mockResolvedValue({});

      const result = await service.registerTherapist(userId, mockTherapistDto);

      // Verify Clerk metadata update
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledWith(
        userId,
        {
          publicMetadata: {
            role: 'therapist',
          },
        },
      );

      // Verify database operations
      expect(mockPrisma.therapist.create).toHaveBeenCalledWith({
        data: {
          ...mockTherapistDto,
          user: { connect: { id: userId } },
          status: 'pending',
        },
        include: {
          user: true,
        },
      });

      // Verify event publication
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        expect.any(UserRegisteredEvent),
      );

      expect(result).toEqual({
        ...mockTherapist,
        treatmentSuccessRates: {},
      });
    });

    it('should throw ConflictException if therapist user already exists', async () => {
      const userId = TEST_USER_IDS.THERAPIST;
      const existingUser = TestDataGenerator.createUser();

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      await TestAssertions.expectToThrowNestException(
        () => service.registerTherapist(userId, mockTherapistDto),
        ConflictException,
        'User already exists',
      );
    });
  });

  describe('getUsers', () => {
    it('should return list of users from Clerk', async () => {
      const mockUsers = [
        { id: 'user1', emailAddresses: [{ emailAddress: 'user1@test.com' }] },
        { id: 'user2', emailAddresses: [{ emailAddress: 'user2@test.com' }] },
      ];

      mockClerkClient.users.getUserList.mockResolvedValue(mockUsers);

      const result = await service.getUsers();

      expect(mockClerkClient.users.getUserList).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUser', () => {
    it('should return a specific user from Clerk', async () => {
      const userId = TEST_USER_IDS.CLIENT;
      const mockUser = {
        id: userId,
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      };

      mockClerkClient.users.getUser.mockResolvedValue(mockUser);

      const result = await service.getUser(userId);

      expect(mockClerkClient.users.getUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('forceLogout', () => {
    it('should revoke all user sessions successfully', async () => {
      const userId = TEST_USER_IDS.CLIENT;
      const mockSessions = {
        data: [{ id: 'session1' }, { id: 'session2' }],
      };

      mockClerkClient.sessions.getSessionList.mockResolvedValue(mockSessions);
      mockClerkClient.sessions.revokeSession.mockResolvedValue({});

      const result = await service.forceLogout(userId);

      expect(mockClerkClient.sessions.getSessionList).toHaveBeenCalledWith({
        userId,
      });

      expect(mockClerkClient.sessions.revokeSession).toHaveBeenCalledTimes(2);
      expect(mockClerkClient.sessions.revokeSession).toHaveBeenCalledWith(
        'session1',
      );
      expect(mockClerkClient.sessions.revokeSession).toHaveBeenCalledWith(
        'session2',
      );

      expect(result).toEqual({
        success: true,
        message: 'User sessions revoked successfully',
      });
    });

    it('should handle force logout errors', async () => {
      const userId = TEST_USER_IDS.CLIENT;

      mockClerkClient.sessions.getSessionList.mockRejectedValue(
        new Error('Clerk API error'),
      );

      await TestAssertions.expectToThrowNestException(
        () => service.forceLogout(userId),
        InternalServerErrorException,
        'Force logout failed',
      );
    });

    it('should handle empty sessions list', async () => {
      const userId = TEST_USER_IDS.CLIENT;
      const mockSessions = { data: [] };

      mockClerkClient.sessions.getSessionList.mockResolvedValue(mockSessions);

      const result = await service.forceLogout(userId);

      expect(mockClerkClient.sessions.revokeSession).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'User sessions revoked successfully',
      });
    });
  });
});
