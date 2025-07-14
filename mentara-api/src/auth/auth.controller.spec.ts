import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
} from '../test-utils/enhanced-test-helpers';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    registerClient: jest.fn(),
    registerTherapist: jest.fn(),
    getUsers: jest.fn(),
    getUser: jest.fn(),
    forceLogout: jest.fn(),
  };

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have authService injected', () => {
      expect(authService).toBeDefined();
    });
  });

  describe('registerClient', () => {
    const mockClientData = {
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '+1234567890',
        address: '123 Main St',
        birthDate: '1990-01-01',
      },
      hasSeenTherapistRecommendations: false,
    };

    it('should successfully register a client', async () => {
      const expectedResult = {
        id: TEST_USER_IDS.CLIENT,
        ...mockClientData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authService.registerClient.mockResolvedValue(expectedResult as any);

      const result = await controller.registerClient(
        TEST_USER_IDS.CLIENT,
        mockClientData as any,
      );

      expect(authService.registerClient).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        mockClientData,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle registration conflict', async () => {
      authService.registerClient.mockRejectedValue(
        new ConflictException('User already exists'),
      );

      await expect(
        controller.registerClient(TEST_USER_IDS.CLIENT, mockClientData as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('registerTherapist', () => {
    const mockTherapistData = {
      user: {
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        mobile: '+1234567890',
        address: '456 Medical Center',
        birthDate: '1980-01-01',
      },
      mobile: '+1234567890',
      province: 'Test Province',
    };

    it('should successfully register a therapist', async () => {
      const expectedResult = {
        id: TEST_USER_IDS.THERAPIST,
        ...mockTherapistData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authService.registerTherapist.mockResolvedValue(expectedResult as any);

      const result = await controller.registerTherapist(
        TEST_USER_IDS.THERAPIST,
        mockTherapistData as any,
      );

      expect(authService.registerTherapist).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        mockTherapistData,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle therapist registration conflict', async () => {
      authService.registerTherapist.mockRejectedValue(
        new ConflictException('Therapist already exists'),
      );

      await expect(
        controller.registerTherapist(
          TEST_USER_IDS.THERAPIST,
          mockTherapistData as any,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getAllUsers', () => {
    it('should return list of all users', async () => {
      const mockUsers = [
        { id: 'user1', emailAddresses: [{ emailAddress: 'user1@test.com' }] },
        { id: 'user2', emailAddresses: [{ emailAddress: 'user2@test.com' }] },
      ];

      authService.getUsers.mockResolvedValue(mockUsers as any);

      const result = await controller.getAllUsers();

      expect(authService.getUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should handle service errors when fetching users', async () => {
      authService.getUsers.mockRejectedValue(new Error('Clerk API error'));

      await expect(controller.getAllUsers()).rejects.toThrow('Clerk API error');
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      const mockUser = {
        id: TEST_USER_IDS.CLIENT,
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
      };

      authService.getUser.mockResolvedValue(mockUser as any);

      const result = await controller.getMe(TEST_USER_IDS.CLIENT);

      expect(authService.getUser).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found scenario', async () => {
      authService.getUser.mockResolvedValue(undefined as any);

      const result = await controller.getMe('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('forceLogout', () => {
    it('should successfully force logout user', async () => {
      const expectedResult = {
        success: true,
        message: 'User sessions revoked successfully',
      };

      authService.forceLogout.mockResolvedValue(expectedResult);

      const result = await controller.forceLogout(TEST_USER_IDS.CLIENT);

      expect(authService.forceLogout).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle force logout errors', async () => {
      authService.forceLogout.mockRejectedValue(
        new InternalServerErrorException('Force logout failed'),
      );

      await TestAssertions.expectToThrowNestException(
        () => controller.forceLogout(TEST_USER_IDS.CLIENT),
        InternalServerErrorException,
        'Force logout failed',
      );
    });
  });

  describe('authentication flow integration', () => {
    it('should handle complete client registration flow', async () => {
      const mockRequest = MockBuilder.createMockRequest('client');
      const clientDto = {
        user: TestDataGenerator.createUser({ role: 'client' }),
        hasSeenTherapistRecommendations: false,
      };

      const expectedClient = {
        id: 'client-123',
        ...clientDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authService.registerClient.mockResolvedValue(expectedClient as any);

      const result = await controller.registerClient(
        mockRequest.user.userId,
        clientDto as any,
      );

      expect(authService.registerClient).toHaveBeenCalledWith(
        mockRequest.user.userId,
        clientDto,
      );
      expect(result).toEqual(expectedClient);
    });

    it('should handle complete therapist registration flow', async () => {
      const mockRequest = MockBuilder.createMockRequest('therapist');
      const therapistDto = {
        user: TestDataGenerator.createUser({ role: 'therapist' }),
        mobile: '+1234567890',
        province: 'Test Province',
      };

      const expectedTherapist = {
        id: 'therapist-123',
        ...therapistDto,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authService.registerTherapist.mockResolvedValue(expectedTherapist as any);

      const result = await controller.registerTherapist(
        mockRequest.user.userId,
        therapistDto as any,
      );

      expect(authService.registerTherapist).toHaveBeenCalledWith(
        mockRequest.user.userId,
        therapistDto,
      );
      expect(result).toEqual(expectedTherapist);
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      authService.registerClient.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        controller.registerClient(TEST_USER_IDS.CLIENT, {} as any),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle authentication service failures', async () => {
      authService.getUsers.mockRejectedValue(
        new InternalServerErrorException('Authentication service unavailable'),
      );

      await expect(controller.getAllUsers()).rejects.toThrow(
        'Authentication service unavailable',
      );
    });

    it('should handle invalid user data', async () => {
      const invalidData = {
        user: null,
        hasSeenTherapistRecommendations: null,
      };

      authService.registerClient.mockRejectedValue(
        new Error('Invalid user data provided'),
      );

      await expect(
        controller.registerClient(TEST_USER_IDS.CLIENT, invalidData as any),
      ).rejects.toThrow('Invalid user data provided');
    });
  });
});
