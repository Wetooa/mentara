import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';

/* eslint-disable @typescript-eslint/unbound-method */

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    registerClient: jest.fn(),
    registerTherapist: jest.fn(),
    updateUserRole: jest.fn(),
    validateToken: jest.fn(),
    getUserProfile: jest.fn(),
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

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      authService.registerClient.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        controller.registerClient(TEST_USER_IDS.CLIENT, {} as any),
      ).rejects.toThrow('Database connection failed');
    });
  });
});
