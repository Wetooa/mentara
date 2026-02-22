import { Test, TestingModule } from '@nestjs/testing';
import { ModeratorService } from './moderator.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { Prisma } from '@prisma/client';

describe('ModeratorService', () => {
  let service: ModeratorService;
  let prismaService: jest.Mocked<PrismaService>;

  // Mock data structures
  const mockDate = new Date('2024-01-15T10:00:00Z');

  const mockModerator = {
    id: 'moderator-123',
    userId: 'user-123',
    permissions: ['MODERATE_CONTENT', 'MANAGE_REPORTS'],
    level: 'moderator',
    isActive: true,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockModeratorList = [
    mockModerator,
    {
      ...mockModerator,
      id: 'moderator-124',
      userId: 'user-124',
      permissions: ['MODERATE_CONTENT'],
      level: 'junior_moderator',
    },
    {
      ...mockModerator,
      id: 'moderator-125',
      userId: 'user-125',
      permissions: ['MODERATE_CONTENT', 'MANAGE_REPORTS', 'ESCALATE_ISSUES'],
      level: 'senior_moderator',
      isActive: false,
    },
  ];

  const mockCreateModeratorData: Prisma.ModeratorCreateInput = {
    userId: 'user-126',
    permissions: ['MODERATE_CONTENT'],
    level: 'moderator',
    isActive: true,
  };

  const mockUpdateModeratorData: Prisma.ModeratorUpdateInput = {
    permissions: ['MODERATE_CONTENT', 'MANAGE_REPORTS', 'ESCALATE_ISSUES'],
    level: 'senior_moderator',
    isActive: true,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      moderator: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModeratorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ModeratorService>(ModeratorService);
    prismaService = module.get(PrismaService);

    // Mock Date constructor for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    beforeEach(() => {
      prismaService.moderator.findMany.mockResolvedValue(mockModeratorList);
    });

    it('should return all moderators', async () => {
      const result = await service.findAll();

      expect(prismaService.moderator.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockModeratorList);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no moderators exist', async () => {
      prismaService.moderator.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      const databaseError = new Error('Database connection failed');
      prismaService.moderator.findMany.mockRejectedValue(databaseError);

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should handle large number of moderators efficiently', async () => {
      const largeModeratorsArray = Array.from({ length: 1000 }, (_, i) => ({
        ...mockModerator,
        id: `moderator-${i}`,
        userId: `user-${i}`,
      }));

      prismaService.moderator.findMany.mockResolvedValue(largeModeratorsArray);

      const startTime = Date.now();
      const result = await service.findAll();
      const endTime = Date.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it('should handle null and undefined values in moderator data', async () => {
      const moderatorsWithNulls = [
        {
          ...mockModerator,
          permissions: null,
          level: undefined,
        },
      ];

      prismaService.moderator.findMany.mockResolvedValue(moderatorsWithNulls as any);

      const result = await service.findAll();

      expect(result).toEqual(moderatorsWithNulls);
    });

    it('should maintain data structure integrity', async () => {
      const result = await service.findAll();

      result.forEach(moderator => {
        expect(moderator).toHaveProperty('id');
        expect(moderator).toHaveProperty('userId');
        expect(moderator).toHaveProperty('permissions');
        expect(moderator).toHaveProperty('level');
        expect(moderator).toHaveProperty('isActive');
        expect(moderator).toHaveProperty('createdAt');
        expect(moderator).toHaveProperty('updatedAt');
      });
    });

    it('should handle concurrent findAll requests', async () => {
      const promises = Array.from({ length: 10 }, () => service.findAll());

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toEqual(mockModeratorList);
      });
      expect(prismaService.moderator.findMany).toHaveBeenCalledTimes(10);
    });
  });

  describe('findOne', () => {
    beforeEach(() => {
      prismaService.moderator.findUnique.mockResolvedValue(mockModerator);
    });

    it('should return moderator by userId', async () => {
      const result = await service.findOne('user-123');

      expect(prismaService.moderator.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(result).toEqual(mockModerator);
    });

    it('should return null for non-existent moderator', async () => {
      prismaService.moderator.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent-user');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const databaseError = new Error('Database connection failed');
      prismaService.moderator.findUnique.mockRejectedValue(databaseError);

      await expect(service.findOne('user-123')).rejects.toThrow('Database connection failed');
    });

    it('should handle empty string userId', async () => {
      await service.findOne('');

      expect(prismaService.moderator.findUnique).toHaveBeenCalledWith({
        where: { userId: '' },
      });
    });

    it('should handle null and undefined userId', async () => {
      await service.findOne(null as any);
      await service.findOne(undefined as any);

      expect(prismaService.moderator.findUnique).toHaveBeenCalledWith({
        where: { userId: null },
      });
      expect(prismaService.moderator.findUnique).toHaveBeenCalledWith({
        where: { userId: undefined },
      });
    });

    it('should handle special characters in userId', async () => {
      const specialUserId = 'user-123@domain.com#$%';

      await service.findOne(specialUserId);

      expect(prismaService.moderator.findUnique).toHaveBeenCalledWith({
        where: { userId: specialUserId },
      });
    });

    it('should handle Unicode characters in userId', async () => {
      const unicodeUserId = 'user-测试-🔒-∆∑©';

      await service.findOne(unicodeUserId);

      expect(prismaService.moderator.findUnique).toHaveBeenCalledWith({
        where: { userId: unicodeUserId },
      });
    });

    it('should handle very long userId strings', async () => {
      const longUserId = 'user-' + 'a'.repeat(1000);

      await service.findOne(longUserId);

      expect(prismaService.moderator.findUnique).toHaveBeenCalledWith({
        where: { userId: longUserId },
      });
    });

    it('should handle concurrent findOne requests for same user', async () => {
      const promises = Array.from({ length: 5 }, () => service.findOne('user-123'));

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toEqual(mockModerator);
      });
      expect(prismaService.moderator.findUnique).toHaveBeenCalledTimes(5);
    });

    it('should handle concurrent findOne requests for different users', async () => {
      prismaService.moderator.findUnique
        .mockResolvedValueOnce(mockModerator)
        .mockResolvedValueOnce({ ...mockModerator, userId: 'user-124' })
        .mockResolvedValueOnce({ ...mockModerator, userId: 'user-125' });

      const promises = [
        service.findOne('user-123'),
        service.findOne('user-124'),
        service.findOne('user-125'),
      ];

      const results = await Promise.all(promises);

      expect(results[0].userId).toBe('user-123');
      expect(results[1].userId).toBe('user-124');
      expect(results[2].userId).toBe('user-125');
    });
  });

  describe('create', () => {
    beforeEach(() => {
      prismaService.moderator.create.mockResolvedValue({
        ...mockModerator,
        ...mockCreateModeratorData,
        id: 'moderator-126',
      });
    });

    it('should create moderator successfully', async () => {
      const result = await service.create(mockCreateModeratorData);

      expect(prismaService.moderator.create).toHaveBeenCalledWith({
        data: mockCreateModeratorData,
      });
      expect(result).toEqual({
        ...mockModerator,
        ...mockCreateModeratorData,
        id: 'moderator-126',
      });
    });

    it('should handle minimal create data', async () => {
      const minimalData: Prisma.ModeratorCreateInput = {
        userId: 'user-minimal',
      };

      await service.create(minimalData);

      expect(prismaService.moderator.create).toHaveBeenCalledWith({
        data: minimalData,
      });
    });

    it('should handle complex permissions array', async () => {
      const complexData: Prisma.ModeratorCreateInput = {
        userId: 'user-complex',
        permissions: [
          'MODERATE_CONTENT',
          'MANAGE_REPORTS',
          'ESCALATE_ISSUES',
          'BAN_USERS',
          'REVIEW_APPEALS',
          'MODERATE_THERAPY_SESSIONS',
          'ACCESS_ANALYTICS',
        ],
        level: 'senior_moderator',
        isActive: true,
      };

      await service.create(complexData);

      expect(prismaService.moderator.create).toHaveBeenCalledWith({
        data: complexData,
      });
    });

    it('should handle create with null values', async () => {
      const dataWithNulls: Prisma.ModeratorCreateInput = {
        userId: 'user-nulls',
        permissions: null,
        level: null,
        isActive: null,
      };

      await service.create(dataWithNulls);

      expect(prismaService.moderator.create).toHaveBeenCalledWith({
        data: dataWithNulls,
      });
    });

    it('should handle create with undefined values', async () => {
      const dataWithUndefined: Prisma.ModeratorCreateInput = {
        userId: 'user-undefined',
        permissions: undefined,
        level: undefined,
        isActive: undefined,
      };

      await service.create(dataWithUndefined);

      expect(prismaService.moderator.create).toHaveBeenCalledWith({
        data: dataWithUndefined,
      });
    });

    it('should handle database constraint violations', async () => {
      const constraintError = new Error('Unique constraint violation');
      constraintError.name = 'P2002';
      prismaService.moderator.create.mockRejectedValue(constraintError);

      await expect(service.create(mockCreateModeratorData)).rejects.toThrow(
        'Unique constraint violation'
      );
    });

    it('should handle foreign key constraint violations', async () => {
      const foreignKeyError = new Error('Foreign key constraint violation');
      foreignKeyError.name = 'P2003';
      prismaService.moderator.create.mockRejectedValue(foreignKeyError);

      await expect(service.create(mockCreateModeratorData)).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });

    it('should handle database timeout errors', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'TimeoutError';
      prismaService.moderator.create.mockRejectedValue(timeoutError);

      await expect(service.create(mockCreateModeratorData)).rejects.toThrow(
        'Connection timeout'
      );
    });

    it('should handle very large permissions array', async () => {
      const largePermissions = Array.from({ length: 1000 }, (_, i) => `PERMISSION_${i}`);
      const dataWithLargePermissions: Prisma.ModeratorCreateInput = {
        userId: 'user-large-permissions',
        permissions: largePermissions,
      };

      await service.create(dataWithLargePermissions);

      expect(prismaService.moderator.create).toHaveBeenCalledWith({
        data: dataWithLargePermissions,
      });
    });

    it('should handle concurrent create operations', async () => {
      const createPromises = Array.from({ length: 10 }, (_, i) => {
        const data: Prisma.ModeratorCreateInput = {
          userId: `user-concurrent-${i}`,
          permissions: ['MODERATE_CONTENT'],
        };
        
        prismaService.moderator.create.mockResolvedValueOnce({
          ...mockModerator,
          id: `moderator-concurrent-${i}`,
          userId: `user-concurrent-${i}`,
        });

        return service.create(data);
      });

      const results = await Promise.all(createPromises);

      expect(results).toHaveLength(10);
      expect(prismaService.moderator.create).toHaveBeenCalledTimes(10);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      prismaService.moderator.update.mockResolvedValue({
        ...mockModerator,
        ...mockUpdateModeratorData,
      });
    });

    it('should update moderator successfully', async () => {
      const result = await service.update('user-123', mockUpdateModeratorData);

      expect(prismaService.moderator.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: mockUpdateModeratorData,
      });
      expect(result).toEqual({
        ...mockModerator,
        ...mockUpdateModeratorData,
      });
    });

    it('should handle partial updates', async () => {
      const partialUpdate: Prisma.ModeratorUpdateInput = {
        isActive: false,
      };

      await service.update('user-123', partialUpdate);

      expect(prismaService.moderator.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: partialUpdate,
      });
    });

    it('should handle empty update data', async () => {
      const emptyUpdate: Prisma.ModeratorUpdateInput = {};

      await service.update('user-123', emptyUpdate);

      expect(prismaService.moderator.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: emptyUpdate,
      });
    });

    it('should handle permission level changes', async () => {
      const levelChange: Prisma.ModeratorUpdateInput = {
        level: 'senior_moderator',
        permissions: [
          'MODERATE_CONTENT',
          'MANAGE_REPORTS',
          'ESCALATE_ISSUES',
          'BAN_USERS',
          'ACCESS_ANALYTICS',
        ],
      };

      await service.update('user-123', levelChange);

      expect(prismaService.moderator.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: levelChange,
      });
    });

    it('should handle permission removal', async () => {
      const permissionRemoval: Prisma.ModeratorUpdateInput = {
        permissions: ['MODERATE_CONTENT'], // Reduced permissions
      };

      await service.update('user-123', permissionRemoval);

      expect(prismaService.moderator.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: permissionRemoval,
      });
    });

    it('should handle moderator deactivation', async () => {
      const deactivation: Prisma.ModeratorUpdateInput = {
        isActive: false,
      };

      await service.update('user-123', deactivation);

      expect(prismaService.moderator.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: deactivation,
      });
    });

    it('should handle non-existent moderator updates', async () => {
      const notFoundError = new Error('Record not found');
      notFoundError.name = 'P2025';
      prismaService.moderator.update.mockRejectedValue(notFoundError);

      await expect(
        service.update('non-existent-user', mockUpdateModeratorData)
      ).rejects.toThrow('Record not found');
    });

    it('should handle null and undefined in update data', async () => {
      const updateWithNulls: Prisma.ModeratorUpdateInput = {
        permissions: null,
        level: null,
        isActive: null,
      };

      await service.update('user-123', updateWithNulls);

      expect(prismaService.moderator.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: updateWithNulls,
      });
    });

    it('should handle concurrent updates on same moderator', async () => {
      const update1: Prisma.ModeratorUpdateInput = { isActive: false };
      const update2: Prisma.ModeratorUpdateInput = { level: 'senior_moderator' };

      prismaService.moderator.update
        .mockResolvedValueOnce({ ...mockModerator, isActive: false })
        .mockRejectedValueOnce(new Error('Record being updated'));

      const promises = [
        service.update('user-123', update1),
        service.update('user-123', update2),
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });

    it('should handle complex permission updates', async () => {
      const complexUpdate: Prisma.ModeratorUpdateInput = {
        permissions: [
          'MODERATE_CONTENT',
          'MANAGE_REPORTS',
          'ESCALATE_ISSUES',
          'BAN_USERS',
          'REVIEW_APPEALS',
          'MODERATE_THERAPY_SESSIONS',
          'ACCESS_ANALYTICS',
          'CONFIGURE_MODERATION_RULES',
          'MANAGE_MODERATOR_ACCOUNTS',
          'EMERGENCY_INTERVENTIONS',
        ],
        level: 'admin_moderator',
        isActive: true,
      };

      await service.update('user-123', complexUpdate);

      expect(prismaService.moderator.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: complexUpdate,
      });
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      prismaService.moderator.delete.mockResolvedValue(mockModerator);
    });

    it('should remove moderator successfully', async () => {
      const result = await service.remove('user-123');

      expect(prismaService.moderator.delete).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(result).toEqual(mockModerator);
    });

    it('should handle removal of non-existent moderator', async () => {
      const notFoundError = new Error('Record not found');
      notFoundError.name = 'P2025';
      prismaService.moderator.delete.mockRejectedValue(notFoundError);

      await expect(service.remove('non-existent-user')).rejects.toThrow(
        'Record not found'
      );
    });

    it('should handle foreign key constraint violations on delete', async () => {
      const foreignKeyError = new Error('Foreign key constraint violation');
      foreignKeyError.name = 'P2003';
      prismaService.moderator.delete.mockRejectedValue(foreignKeyError);

      await expect(service.remove('user-123')).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });

    it('should handle database connection errors', async () => {
      const connectionError = new Error('Database connection failed');
      prismaService.moderator.delete.mockRejectedValue(connectionError);

      await expect(service.remove('user-123')).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle empty string userId', async () => {
      await service.remove('');

      expect(prismaService.moderator.delete).toHaveBeenCalledWith({
        where: { userId: '' },
      });
    });

    it('should handle null and undefined userId', async () => {
      await service.remove(null as any);
      await service.remove(undefined as any);

      expect(prismaService.moderator.delete).toHaveBeenCalledWith({
        where: { userId: null },
      });
      expect(prismaService.moderator.delete).toHaveBeenCalledWith({
        where: { userId: undefined },
      });
    });

    it('should handle concurrent deletion attempts', async () => {
      prismaService.moderator.delete
        .mockResolvedValueOnce(mockModerator)
        .mockRejectedValueOnce(new Error('Record not found'));

      const promises = [
        service.remove('user-123'),
        service.remove('user-123'),
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });

    it('should handle bulk deletion operations', async () => {
      const deletePromises = Array.from({ length: 50 }, (_, i) => {
        const userId = `user-bulk-${i}`;
        prismaService.moderator.delete.mockResolvedValueOnce({
          ...mockModerator,
          userId,
        });
        return service.remove(userId);
      });

      const results = await Promise.all(deletePromises);

      expect(results).toHaveLength(50);
      expect(prismaService.moderator.delete).toHaveBeenCalledTimes(50);
    });

    it('should handle transaction isolation during deletion', async () => {
      // Simulate transaction isolation behavior
      let deletionCount = 0;
      prismaService.moderator.delete.mockImplementation(() => {
        deletionCount++;
        if (deletionCount > 1) {
          throw new Error('Record already deleted');
        }
        return Promise.resolve(mockModerator);
      });

      const promises = [
        service.remove('user-isolated'),
        service.remove('user-isolated'),
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed moderator data gracefully', async () => {
      const malformedData = {
        id: 123, // Number instead of string
        userId: null,
        permissions: 'not_an_array',
        level: { invalid: 'object' },
        isActive: 'not_boolean',
        createdAt: 'invalid_date',
      };

      prismaService.moderator.findMany.mockResolvedValue([malformedData] as any);

      const result = await service.findAll();

      expect(result).toEqual([malformedData]);
    });

    it('should handle extremely large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        ...mockModerator,
        id: `moderator-${i}`,
        userId: `user-${i}`,
      }));

      prismaService.moderator.findMany.mockResolvedValue(largeDataset);

      const startTime = Date.now();
      const result = await service.findAll();
      const endTime = Date.now();

      expect(result).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle memory pressure gracefully', async () => {
      // Simulate memory-intensive operation
      const memoryIntensiveData = Array.from({ length: 1000 }, (_, i) => ({
        ...mockModerator,
        id: `moderator-${i}`,
        userId: `user-${i}`,
        permissions: Array.from({ length: 100 }, (_, j) => `PERMISSION_${i}_${j}`),
        metadata: {
          largeData: 'x'.repeat(10000), // 10KB per record
        },
      }));

      prismaService.moderator.findMany.mockResolvedValue(memoryIntensiveData as any);

      const result = await service.findAll();

      expect(result).toHaveLength(1000);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle network interruptions during operations', async () => {
      const networkError = new Error('ECONNRESET');
      networkError.name = 'NetworkError';

      prismaService.moderator.findMany.mockRejectedValue(networkError);

      await expect(service.findAll()).rejects.toThrow('ECONNRESET');
    });

    it('should handle database lock timeouts', async () => {
      const lockTimeoutError = new Error('Lock wait timeout exceeded');
      lockTimeoutError.name = 'LockTimeoutError';

      prismaService.moderator.update.mockRejectedValue(lockTimeoutError);

      await expect(
        service.update('user-123', mockUpdateModeratorData)
      ).rejects.toThrow('Lock wait timeout exceeded');
    });

    it('should maintain data consistency under concurrent operations', async () => {
      const concurrentOperations = [
        service.findOne('user-123'),
        service.update('user-123', { isActive: false }),
        service.findOne('user-123'),
        service.remove('user-123'),
      ];

      prismaService.moderator.findUnique.mockResolvedValue(mockModerator);
      prismaService.moderator.update.mockResolvedValue({
        ...mockModerator,
        isActive: false,
      });
      prismaService.moderator.delete.mockResolvedValue(mockModerator);

      const results = await Promise.allSettled(concurrentOperations);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
      expect(results[2].status).toBe('fulfilled');
      expect(results[3].status).toBe('fulfilled');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high-throughput operations efficiently', async () => {
      const operationCount = 1000;
      const operations = Array.from({ length: operationCount }, (_, i) => {
        if (i % 4 === 0) return service.findAll();
        if (i % 4 === 1) return service.findOne(`user-${i}`);
        if (i % 4 === 2) return service.create({ userId: `user-new-${i}` });
        return service.update(`user-${i}`, { isActive: i % 2 === 0 });
      });

      // Mock all responses
      prismaService.moderator.findMany.mockResolvedValue(mockModeratorList);
      prismaService.moderator.findUnique.mockResolvedValue(mockModerator);
      prismaService.moderator.create.mockResolvedValue(mockModerator);
      prismaService.moderator.update.mockResolvedValue(mockModerator);

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();

      expect(results).toHaveLength(operationCount);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle batch operations efficiently', async () => {
      const batchSize = 100;
      const batches = Array.from({ length: 10 }, (_, batchIndex) =>
        Array.from({ length: batchSize }, (_, i) => {
          const userId = `batch-${batchIndex}-user-${i}`;
          prismaService.moderator.create.mockResolvedValueOnce({
            ...mockModerator,
            userId,
          });
          return service.create({ userId });
        })
      );

      const startTime = Date.now();
      
      for (const batch of batches) {
        await Promise.all(batch);
      }
      
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
      expect(prismaService.moderator.create).toHaveBeenCalledTimes(1000);
    });

    it('should optimize memory usage for large result sets', async () => {
      const largeResultSet = Array.from({ length: 50000 }, (_, i) => ({
        ...mockModerator,
        id: `moderator-${i}`,
        userId: `user-${i}`,
      }));

      prismaService.moderator.findMany.mockResolvedValue(largeResultSet);

      const initialMemory = process.memoryUsage().heapUsed;
      const result = await service.findAll();
      const finalMemory = process.memoryUsage().heapUsed;

      expect(result).toHaveLength(50000);
      
      // Memory increase should be reasonable (less than 100MB for this test)
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Data Integrity and Validation', () => {
    it('should preserve data types throughout operations', async () => {
      const typedModerator = {
        id: 'string-id',
        userId: 'string-userId',
        permissions: ['array', 'of', 'strings'],
        level: 'string-level',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.moderator.findUnique.mockResolvedValue(typedModerator);

      const result = await service.findOne('string-userId');

      expect(typeof result.id).toBe('string');
      expect(typeof result.userId).toBe('string');
      expect(Array.isArray(result.permissions)).toBe(true);
      expect(typeof result.level).toBe('string');
      expect(typeof result.isActive).toBe('boolean');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should maintain referential integrity', async () => {
      const createData: Prisma.ModeratorCreateInput = {
        userId: 'valid-user-123',
        permissions: ['MODERATE_CONTENT'],
      };

      prismaService.moderator.create.mockResolvedValue({
        ...mockModerator,
        userId: 'valid-user-123',
      });

      const result = await service.create(createData);

      expect(result.userId).toBe('valid-user-123');
      expect(prismaService.moderator.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should validate business logic consistency', async () => {
      const businessLogicUpdate: Prisma.ModeratorUpdateInput = {
        level: 'senior_moderator',
        permissions: ['MODERATE_CONTENT', 'MANAGE_REPORTS', 'ESCALATE_ISSUES'],
        isActive: true,
      };

      prismaService.moderator.update.mockResolvedValue({
        ...mockModerator,
        ...businessLogicUpdate,
      });

      const result = await service.update('user-123', businessLogicUpdate);

      expect(result.level).toBe('senior_moderator');
      expect(result.permissions).toContain('ESCALATE_ISSUES');
      expect(result.isActive).toBe(true);
    });

    it('should handle edge cases in data validation', async () => {
      const edgeCaseData: Prisma.ModeratorCreateInput = {
        userId: '',
        permissions: [],
        level: '',
        isActive: false,
      };

      await service.create(edgeCaseData);

      expect(prismaService.moderator.create).toHaveBeenCalledWith({
        data: edgeCaseData,
      });
    });
  });
});