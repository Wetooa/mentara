import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TherapistClientController } from './therapist-client.controller';
import { TherapistManagementService } from '../therapist-management.service';
import { createMockPrismaService, TEST_USER_IDS } from '../../test-utils';
import {
  TestDataGenerator,
  TestAssertions,
} from '../../test-utils/enhanced-test-helpers';

describe('TherapistClientController', () => {
  let controller: TherapistClientController;
  let therapistManagementService: jest.Mocked<TherapistManagementService>;

  const mockTherapistManagementService = {
    getAssignedPatients: jest.fn(),
    getAllClients: jest.fn(),
    getClientById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TherapistClientController],
      providers: [
        {
          provide: TherapistManagementService,
          useValue: mockTherapistManagementService,
        },
      ],
    }).compile();

    controller = module.get<TherapistClientController>(
      TherapistClientController,
    );
    therapistManagementService = module.get(TherapistManagementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAssignedPatients', () => {
    it('should return assigned patients for therapist', async () => {
      const mockClients = [
        {
          userId: TEST_USER_IDS.CLIENT,
          user: TestDataGenerator.createUser({
            id: TEST_USER_IDS.CLIENT,
            role: 'client',
          }),
          hasSeenTherapistRecommendations: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 'client-2-user',
          user: TestDataGenerator.createUser({
            id: 'client-2-user',
            role: 'client',
            firstName: 'Jane',
            lastName: 'Smith',
          }),
          hasSeenTherapistRecommendations: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      therapistManagementService.getAssignedPatients.mockResolvedValue(
        mockClients as any,
      );

      const result = await controller.getAssignedPatients(
        TEST_USER_IDS.THERAPIST,
      );

      expect(
        therapistManagementService.getAssignedPatients,
      ).toHaveBeenCalledWith(TEST_USER_IDS.THERAPIST);
      expect(result).toEqual(mockClients);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('userId', TEST_USER_IDS.CLIENT);
    });

    it('should return empty array when therapist has no assigned patients', async () => {
      therapistManagementService.getAssignedPatients.mockResolvedValue([]);

      const result = await controller.getAssignedPatients(
        TEST_USER_IDS.THERAPIST,
      );

      expect(
        therapistManagementService.getAssignedPatients,
      ).toHaveBeenCalledWith(TEST_USER_IDS.THERAPIST);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle unauthorized therapist access', async () => {
      therapistManagementService.getAssignedPatients.mockRejectedValue(
        new ForbiddenException('Not authorized to access this data'),
      );

      await expect(
        controller.getAssignedPatients('unauthorized-therapist-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle therapist not found', async () => {
      therapistManagementService.getAssignedPatients.mockRejectedValue(
        new NotFoundException('Therapist not found'),
      );

      await expect(
        controller.getAssignedPatients('non-existent-therapist'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle service errors gracefully', async () => {
      therapistManagementService.getAssignedPatients.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        controller.getAssignedPatients(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('getAllClients', () => {
    it('should return all available clients for therapist', async () => {
      const mockAllClients = [
        {
          userId: TEST_USER_IDS.CLIENT,
          user: TestDataGenerator.createUser({
            id: TEST_USER_IDS.CLIENT,
            role: 'client',
          }),
          hasSeenTherapistRecommendations: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 'client-3-user',
          user: TestDataGenerator.createUser({
            id: 'client-3-user',
            role: 'client',
            firstName: 'Bob',
            lastName: 'Wilson',
          }),
          hasSeenTherapistRecommendations: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      therapistManagementService.getAllClients.mockResolvedValue(
        mockAllClients as any,
      );

      const result = await controller.getAllClients(TEST_USER_IDS.THERAPIST);

      expect(therapistManagementService.getAllClients).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
      );
      expect(result).toEqual(mockAllClients);
      expect(result).toHaveLength(2);

      // Verify client data structure
      expect(result[0]).toHaveProperty('userId', TEST_USER_IDS.CLIENT);
      expect(result[1]).toHaveProperty('userId', 'client-3-user');
    });

    it('should handle therapist with access to no clients', async () => {
      therapistManagementService.getAllClients.mockResolvedValue([]);

      const result = await controller.getAllClients(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle unauthorized access to client list', async () => {
      therapistManagementService.getAllClients.mockRejectedValue(
        new ForbiddenException('Insufficient permissions to view all clients'),
      );

      await expect(
        controller.getAllClients('unauthorized-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle database errors during client retrieval', async () => {
      therapistManagementService.getAllClients.mockRejectedValue(
        new Error('Query timeout'),
      );

      await expect(
        controller.getAllClients(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow('Query timeout');
    });

    it('should return clients with complete profile information', async () => {
      const mockCompleteClient = {
        userId: 'complete-client-user',
        user: TestDataGenerator.createUser({
          role: 'client',
          firstName: 'Complete',
          lastName: 'Profile',
          email: 'complete@example.com',
          isActive: true,
          emailVerified: true,
        }),
        hasSeenTherapistRecommendations: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      therapistManagementService.getAllClients.mockResolvedValue([
        mockCompleteClient as any,
      ]);

      const result = await controller.getAllClients(TEST_USER_IDS.THERAPIST);

      expect(result[0]).toHaveProperty('user');
      expect(result[0].user).toHaveProperty('firstName', 'Complete');
      expect(result[0].user).toHaveProperty('isActive', true);
      expect(result[0]).toHaveProperty('hasSeenTherapistRecommendations', true);
    });
  });

  describe('getClientById', () => {
    const clientId = 'specific-client-id';

    it('should return specific client by ID', async () => {
      const mockClient = {
        userId: TEST_USER_IDS.CLIENT,
        user: TestDataGenerator.createUser({
          id: TEST_USER_IDS.CLIENT,
          role: 'client',
          firstName: 'Specific',
          lastName: 'Client',
        }),
        hasSeenTherapistRecommendations: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      therapistManagementService.getClientById.mockResolvedValue(
        mockClient as any,
      );

      const result = await controller.getClientById(
        TEST_USER_IDS.THERAPIST,
        clientId,
      );

      expect(therapistManagementService.getClientById).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        clientId,
      );
      expect(result).toEqual(mockClient);
      expect(result.userId).toBe(TEST_USER_IDS.CLIENT);
      expect(result.user.firstName).toBe('Specific');
    });

    it('should handle client not found', async () => {
      therapistManagementService.getClientById.mockRejectedValue(
        new NotFoundException('Client not found'),
      );

      await expect(
        controller.getClientById(
          TEST_USER_IDS.THERAPIST,
          'non-existent-client',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle unauthorized access to specific client', async () => {
      therapistManagementService.getClientById.mockRejectedValue(
        new ForbiddenException('Not authorized to access this client'),
      );

      await expect(
        controller.getClientById('unauthorized-therapist', clientId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle invalid client ID format', async () => {
      therapistManagementService.getClientById.mockRejectedValue(
        new BadRequestException('Invalid client ID format'),
      );

      await expect(
        controller.getClientById(TEST_USER_IDS.THERAPIST, 'invalid-id-format'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate therapist-client relationship', async () => {
      const restrictedClient = {
        id: clientId,
        user: TestDataGenerator.createUser({
          role: 'client',
          firstName: 'Restricted',
          lastName: 'Access',
        }),
        therapistId: 'different-therapist-id', // Different therapist
        status: 'active',
      };

      therapistManagementService.getClientById.mockRejectedValue(
        new ForbiddenException('Client is not assigned to this therapist'),
      );

      await expect(
        controller.getClientById(TEST_USER_IDS.THERAPIST, clientId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle database connection issues', async () => {
      therapistManagementService.getClientById.mockRejectedValue(
        new Error('Database connection lost'),
      );

      await expect(
        controller.getClientById(TEST_USER_IDS.THERAPIST, clientId),
      ).rejects.toThrow('Database connection lost');
    });

    it('should return client with detailed relationship data', async () => {
      const detailedClient = {
        userId: 'detailed-client-user',
        user: TestDataGenerator.createUser({
          role: 'client',
          firstName: 'Detailed',
          lastName: 'Client',
          email: 'detailed@example.com',
        }),
        hasSeenTherapistRecommendations: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
      };

      therapistManagementService.getClientById.mockResolvedValue(
        detailedClient as any,
      );

      const result = await controller.getClientById(
        TEST_USER_IDS.THERAPIST,
        clientId,
      );

      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.user.email).toBe('detailed@example.com');
    });
  });

  describe('Controller Integration Tests', () => {
    it('should handle complete client management workflow', async () => {
      const workflowClientId = 'workflow-client';

      // 1. Get all clients
      const allClients = [
        {
          userId: 'workflow-user-id',
          user: TestDataGenerator.createUser({
            id: 'workflow-user-id',
            role: 'client',
          }),
          hasSeenTherapistRecommendations: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      therapistManagementService.getAllClients.mockResolvedValue(
        allClients as any,
      );

      // 2. Get assigned patients (empty initially)
      therapistManagementService.getAssignedPatients.mockResolvedValue([]);

      // 3. Get specific client details
      const specificClient = {
        userId: 'workflow-user-id',
        user: TestDataGenerator.createUser({
          id: 'workflow-user-id',
          role: 'client',
        }),
        hasSeenTherapistRecommendations: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      therapistManagementService.getClientById.mockResolvedValue(
        specificClient as any,
      );

      // Execute workflow
      const allClientsResult = await controller.getAllClients(
        TEST_USER_IDS.THERAPIST,
      );
      const assignedResult = await controller.getAssignedPatients(
        TEST_USER_IDS.THERAPIST,
      );
      const specificResult = await controller.getClientById(
        TEST_USER_IDS.THERAPIST,
        workflowClientId,
      );

      expect(allClientsResult).toHaveLength(1);
      expect(assignedResult).toHaveLength(0);
      expect(specificResult).toHaveProperty('userId', 'workflow-user-id');
      expect(specificResult.hasSeenTherapistRecommendations).toBe(true);
    });

    it('should maintain consistent client data across endpoints', async () => {
      const consistentClientId = 'consistent-client';
      const baseClientData = {
        userId: 'consistent-user-id',
        user: TestDataGenerator.createUser({
          id: 'consistent-user-id',
          firstName: 'Consistent',
          lastName: 'Client',
          role: 'client',
        }),
        hasSeenTherapistRecommendations: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set up consistent responses
      therapistManagementService.getAllClients.mockResolvedValue([
        baseClientData as any,
      ]);
      therapistManagementService.getAssignedPatients.mockResolvedValue([
        baseClientData as any,
      ]);
      therapistManagementService.getClientById.mockResolvedValue(
        baseClientData as any,
      );

      // Execute all endpoints
      const allClients = await controller.getAllClients(
        TEST_USER_IDS.THERAPIST,
      );
      const assignedClients = await controller.getAssignedPatients(
        TEST_USER_IDS.THERAPIST,
      );
      const specificClient = await controller.getClientById(
        TEST_USER_IDS.THERAPIST,
        consistentClientId,
      );

      // Verify consistency
      expect(allClients[0].user.firstName).toBe('Consistent');
      expect(assignedClients[0].user.firstName).toBe('Consistent');
      expect(specificClient.user.firstName).toBe('Consistent');
      
      expect(allClients[0].userId).toBe('consistent-user-id');
      expect(assignedClients[0].userId).toBe('consistent-user-id');
      expect(specificClient.userId).toBe('consistent-user-id');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null or undefined client data gracefully', async () => {
      therapistManagementService.getClientById.mockResolvedValue(null as any);

      const result = await controller.getClientById(
        TEST_USER_IDS.THERAPIST,
        'null-client',
      );

      expect(result).toBeNull();
    });

    it('should handle malformed client responses', async () => {
      const malformedClient = {
        userId: 'malformed-user',
        // Missing required fields
        user: null,
        hasSeenTherapistRecommendations: undefined,
      };

      therapistManagementService.getClientById.mockResolvedValue(
        malformedClient as any,
      );

      const result = await controller.getClientById(
        TEST_USER_IDS.THERAPIST,
        'malformed',
      );

      expect(result.userId).toBe('malformed-user');
      expect(result.user).toBeNull();
    });

    it('should handle service timeout errors', async () => {
      therapistManagementService.getAllClients.mockRejectedValue(
        new Error('Operation timed out'),
      );

      await expect(
        controller.getAllClients(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow('Operation timed out');
    });

    it('should handle concurrent requests appropriately', async () => {
      const concurrentClientData = {
        userId: 'concurrent-user',
        user: TestDataGenerator.createUser({ role: 'client' }),
        hasSeenTherapistRecommendations: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      therapistManagementService.getClientById.mockResolvedValue(
        concurrentClientData as any,
      );

      // Simulate concurrent requests
      const promises = [
        controller.getClientById(TEST_USER_IDS.THERAPIST, 'concurrent-client'),
        controller.getClientById(TEST_USER_IDS.THERAPIST, 'concurrent-client'),
        controller.getClientById(TEST_USER_IDS.THERAPIST, 'concurrent-client'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.userId === 'concurrent-user')).toBe(true);
      expect(therapistManagementService.getClientById).toHaveBeenCalledTimes(3);
    });
  });
});
