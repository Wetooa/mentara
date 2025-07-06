import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { TEST_USER_IDS } from '../test-utils';
import { ClientCreateDto } from '../client/dto/client.dto';

// Mock Clerk client
const mockClerkClient = {
  users: {
    updateUserMetadata: jest.fn(),
    getUserList: jest.fn(),
    getUser: jest.fn(),
  },
};

jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(() => mockClerkClient),
}));

// Mock Prisma
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  client: {
    create: jest.fn(),
  },
  therapist: {
    create: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Mock the private clerkClient property
    (service as any).clerkClient = mockClerkClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAdmin', () => {
    it('should return true for valid admin user', async () => {
      const adminUser = {
        id: TEST_USER_IDS.ADMIN,
        role: 'admin',
        email: 'admin@example.com',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);

      const result = await service.checkAdmin(TEST_USER_IDS.ADMIN);

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { role: 'admin', id: TEST_USER_IDS.ADMIN },
      });
    });

    it('should return false for non-admin user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.checkAdmin(TEST_USER_IDS.CLIENT);

      expect(result).toBe(false);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { role: 'admin', id: TEST_USER_IDS.CLIENT },
      });
    });

    it('should return false when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.checkAdmin('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('registerClient', () => {
    it('should throw ConflictException when user already exists', async () => {
      const existingUser = {
        id: TEST_USER_IDS.CLIENT,
        email: 'client@example.com',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      const mockClientCreateDto = {
        user: {},
        hasSeenTherapistRecommendations: false,
      } as ClientCreateDto;

      await expect(
        service.registerClient(TEST_USER_IDS.CLIENT, mockClientCreateDto),
      ).rejects.toThrow(ConflictException);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
      });
    });
  });

  describe('getUsers', () => {
    it('should return list of users from Clerk', async () => {
      const mockUsers = [
        {
          id: 'user1',
          emailAddresses: [{ emailAddress: 'user1@example.com' }],
        },
        {
          id: 'user2',
          emailAddresses: [{ emailAddress: 'user2@example.com' }],
        },
      ];
      mockClerkClient.users.getUserList.mockResolvedValue(mockUsers);

      const result = await service.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockClerkClient.users.getUserList).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUser', () => {
    it('should return specific user from Clerk', async () => {
      const mockUser = {
        id: TEST_USER_IDS.CLIENT,
        emailAddresses: [{ emailAddress: 'client@example.com' }],
      };
      mockClerkClient.users.getUser.mockResolvedValue(mockUser);

      const result = await service.getUser(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockUser);
      expect(mockClerkClient.users.getUser).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
      );
    });
  });
});
