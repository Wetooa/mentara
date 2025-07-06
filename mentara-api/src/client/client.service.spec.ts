import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('ClientService', () => {
  let service: ClientService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockClient = {
    id: 'client-123',
    userId: 'user-123',
    hasSeenTherapistRecommendations: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'client',
    },
  };

  const mockTherapist = {
    id: 'therapist-123',
    userId: 'therapist-user-123',
    hourlyRate: 150,
    user: {
      id: 'therapist-user-123',
      email: 'therapist@example.com',
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      role: 'therapist',
    },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      client: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      clientTherapist: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return client profile successfully', async () => {
      prismaService.client.findUnique.mockResolvedValue(mockClient);

      const result = await service.getProfile('user-123');

      expect(result).toEqual(mockClient);
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { user: true },
      });
    });

    it('should throw NotFoundException when client not found', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-user')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { userId: 'nonexistent-user' },
        include: { user: true },
      });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const dbError = new PrismaClientKnownRequestError('Database error', {
        code: 'P2002',
        clientVersion: '4.0.0',
      });
      prismaService.client.findUnique.mockRejectedValue(dbError);

      await expect(service.getProfile('user-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      prismaService.client.findUnique.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(service.getProfile('user-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      firstName: 'UpdatedName',
      lastName: 'UpdatedLastName',
    };

    it('should update client profile successfully', async () => {
      const updatedClient = {
        ...mockClient,
        user: { ...mockClient.user, ...updateData },
      };
      prismaService.client.update.mockResolvedValue(updatedClient);

      const result = await service.updateProfile('user-123', updateData);

      expect(result).toEqual(updatedClient);
      expect(prismaService.client.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: {
          user: {
            update: updateData,
          },
        },
        include: { user: true },
      });
    });

    it('should throw NotFoundException when client not found for update', async () => {
      const dbError = new PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '4.0.0',
      });
      prismaService.client.update.mockRejectedValue(dbError);

      await expect(
        service.updateProfile('nonexistent-user', updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on unique constraint violation', async () => {
      const dbError = new PrismaClientKnownRequestError(
        'Unique constraint violation',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
        },
      );
      prismaService.client.update.mockRejectedValue(dbError);

      await expect(
        service.updateProfile('user-123', updateData),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on other database errors', async () => {
      const dbError = new PrismaClientKnownRequestError(
        'Other database error',
        {
          code: 'P2001',
          clientVersion: '4.0.0',
        },
      );
      prismaService.client.update.mockRejectedValue(dbError);

      await expect(
        service.updateProfile('user-123', updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('needsTherapistRecommendations', () => {
    it('should return true when client has not seen recommendations', async () => {
      prismaService.client.findUnique.mockResolvedValue({
        hasSeenTherapistRecommendations: false,
      });

      const result = await service.needsTherapistRecommendations('user-123');

      expect(result).toBe(true);
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { hasSeenTherapistRecommendations: true },
      });
    });

    it('should return false when client has seen recommendations', async () => {
      prismaService.client.findUnique.mockResolvedValue({
        hasSeenTherapistRecommendations: true,
      });

      const result = await service.needsTherapistRecommendations('user-123');

      expect(result).toBe(false);
    });

    it('should return true when client not found', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      const result = await service.needsTherapistRecommendations('user-123');

      expect(result).toBe(true);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      prismaService.client.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.needsTherapistRecommendations('user-123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('markTherapistRecommendationsSeen', () => {
    it('should mark recommendations as seen successfully', async () => {
      const updatedClient = {
        ...mockClient,
        hasSeenTherapistRecommendations: true,
      };
      prismaService.client.update.mockResolvedValue(updatedClient);

      await service.markTherapistRecommendationsSeen('user-123');

      expect(prismaService.client.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: { hasSeenTherapistRecommendations: true },
      });
    });

    it('should throw NotFoundException when client not found', async () => {
      const dbError = new PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '4.0.0',
      });
      prismaService.client.update.mockRejectedValue(dbError);

      await expect(
        service.markTherapistRecommendationsSeen('nonexistent-user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      prismaService.client.update.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(
        service.markTherapistRecommendationsSeen('user-123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAssignedTherapist', () => {
    it('should return assigned therapist successfully', async () => {
      const mockAssignment = {
        therapist: mockTherapist,
      };
      prismaService.clientTherapist.findFirst.mockResolvedValue(mockAssignment);

      const result = await service.getAssignedTherapist('user-123');

      expect(result).toEqual(mockTherapist);
      expect(prismaService.clientTherapist.findFirst).toHaveBeenCalledWith({
        where: {
          clientId: 'user-123',
          status: 'active',
        },
        include: {
          therapist: {
            include: { user: true },
          },
        },
        orderBy: { assignedAt: 'desc' },
      });
    });

    it('should return null when no active assignment found', async () => {
      prismaService.clientTherapist.findFirst.mockResolvedValue(null);

      const result = await service.getAssignedTherapist('user-123');

      expect(result).toBeNull();
    });

    it('should return null when assignment has no therapist', async () => {
      prismaService.clientTherapist.findFirst.mockResolvedValue({
        therapist: null,
      });

      const result = await service.getAssignedTherapist('user-123');

      expect(result).toBeNull();
    });
  });
});
