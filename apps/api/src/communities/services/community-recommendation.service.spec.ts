import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { CommunityRecommendationService } from './community-recommendation.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { CommunityMatchingService } from './community-matching.service';

describe('CommunityRecommendationService', () => {
  let service: CommunityRecommendationService;
  let prismaService: jest.Mocked<PrismaService>;
  let communityMatchingService: jest.Mocked<CommunityMatchingService>;
  let loggerSpy: jest.SpyInstance;

  // Mock data
  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    isActive: true,
    memberships: [
      { communityId: 'community-existing-1' },
      { communityId: 'community-existing-2' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUserWithoutMemberships = {
    ...mockUser,
    memberships: [],
  };

  const mockCommunities = [
    {
      id: 'community-123',
      name: 'Depression Support Network',
      slug: 'depression-support',
      description: 'A supportive community for depression',
      imageUrl: 'depression.jpg',
      _count: { memberships: 25 },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'community-456',
      name: 'Anxiety Warriors',
      slug: 'anxiety-warriors',
      description: 'A supportive community for anxiety',
      imageUrl: 'anxiety.jpg',
      _count: { memberships: 45 },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'community-789',
      name: 'PTSD Support Network',
      slug: 'ptsd-support',
      description: 'A supportive community for PTSD',
      imageUrl: 'ptsd.jpg',
      _count: { memberships: 15 },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'community-small',
      name: 'Small Support Group',
      slug: 'small-support',
      description: 'A small intimate support group',
      imageUrl: 'small.jpg',
      _count: { memberships: 8 }, // Small community
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  const mockLargeCommunity = {
    id: 'community-large',
    name: 'Large Community',
    slug: 'large-community',
    description: 'A large community',
    imageUrl: 'large.jpg',
    _count: { memberships: 150 }, // Large community
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
      community: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const mockCommunityMatchingService = {
      calculateCompatibilityScore: jest.fn(),
      getRecommendationsForUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityRecommendationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CommunityMatchingService,
          useValue: mockCommunityMatchingService,
        },
      ],
    }).compile();

    service = module.get<CommunityRecommendationService>(CommunityRecommendationService);
    prismaService = module.get(PrismaService);
    communityMatchingService = module.get(CommunityMatchingService);

    // Setup logger spies
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Mock Math.random for consistent testing
    jest.spyOn(Math, 'random').mockReturnValue(0.7); // Will result in base score of 0.76
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRecommendations', () => {
    beforeEach(() => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.community.findMany.mockResolvedValue(mockCommunities);
    });

    it('should return recommendations for user with existing memberships', async () => {
      const result = await service.getUserRecommendations('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          memberships: {
            select: { communityId: true },
          },
        },
      });

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        where: {
          id: { notIn: ['community-existing-1', 'community-existing-2'] },
        },
        include: {
          _count: {
            select: { memberships: true },
          },
        },
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(10);

      // Verify recommendation structure
      const recommendation = result[0];
      expect(recommendation).toHaveProperty('id');
      expect(recommendation).toHaveProperty('name');
      expect(recommendation).toHaveProperty('slug');
      expect(recommendation).toHaveProperty('description');
      expect(recommendation).toHaveProperty('imageUrl');
      expect(recommendation).toHaveProperty('memberCount');
      expect(recommendation).toHaveProperty('compatibilityScore');
      expect(recommendation).toHaveProperty('score');
      expect(recommendation).toHaveProperty('reason');
      expect(recommendation).toHaveProperty('status');
      expect(recommendation).toHaveProperty('createdAt');
      expect(recommendation).toHaveProperty('updatedAt');

      // Verify score is alias for compatibilityScore
      expect(recommendation.score).toBe(recommendation.compatibilityScore);
      expect(recommendation.status).toBe('pending');
    });

    it('should return recommendations for user without existing memberships', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserWithoutMemberships);

      const result = await service.getUserRecommendations('user-123');

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        where: {
          id: { notIn: [] },
        },
        include: {
          _count: {
            select: { memberships: true },
          },
        },
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter out communities with low compatibility scores', async () => {
      // Mock low random value to test filtering
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // Will result in base score of 0.28

      const result = await service.getUserRecommendations('user-123');

      // Should filter out recommendations with score <= 0.3
      result.forEach(recommendation => {
        expect(recommendation.compatibilityScore).toBeGreaterThan(0.3);
      });
    });

    it('should sort recommendations by compatibility score in descending order', async () => {
      // Mock varying scores
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.8) // 0.84 + size bonus
        .mockReturnValueOnce(0.5) // 0.6 + size bonus
        .mockReturnValueOnce(0.3) // 0.44 + size bonus
        .mockReturnValueOnce(0.7); // 0.76 + size bonus

      const result = await service.getUserRecommendations('user-123');

      // Should be sorted by score (highest first)
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].compatibilityScore).toBeGreaterThanOrEqual(result[i].compatibilityScore);
      }
    });

    it('should limit results to top 10 recommendations', async () => {
      // Mock many communities
      const manyCommunities = Array.from({ length: 15 }, (_, i) => ({
        id: `community-${i}`,
        name: `Community ${i}`,
        slug: `community-${i}`,
        description: `Description ${i}`,
        imageUrl: `image-${i}.jpg`,
        _count: { memberships: 20 },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }));

      prismaService.community.findMany.mockResolvedValue(manyCommunities);

      const result = await service.getUserRecommendations('user-123');

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should apply size bonus for small communities', async () => {
      // Test with communities of different sizes
      const communitiesWithSizes = [
        { ...mockCommunities[0], _count: { memberships: 8 } }, // Small - should get bonus
        { ...mockCommunities[1], _count: { memberships: 50 } }, // Large - no bonus
      ];
      
      prismaService.community.findMany.mockResolvedValue(communitiesWithSizes);

      // Mock consistent base score
      jest.spyOn(Math, 'random').mockReturnValue(0.6); // Base score 0.68

      const result = await service.getUserRecommendations('user-123');

      // Small community should have higher score due to size bonus
      const smallCommunityRec = result.find(r => r.memberCount === 8);
      const largeCommunityRec = result.find(r => r.memberCount === 50);

      if (smallCommunityRec && largeCommunityRec) {
        expect(smallCommunityRec.compatibilityScore).toBeGreaterThan(largeCommunityRec.compatibilityScore);
      }
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserRecommendations('non-existent-user')).rejects.toThrow(
        new NotFoundException('User non-existent-user not found')
      );
    });

    it('should handle database errors gracefully', async () => {
      prismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      const result = await service.getUserRecommendations('user-123');

      expect(result).toEqual([]);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error getting recommendations for user user-123'),
        expect.any(Error)
      );
    });

    it('should handle empty communities list', async () => {
      prismaService.community.findMany.mockResolvedValue([]);

      const result = await service.getUserRecommendations('user-123');

      expect(result).toEqual([]);
    });

    it('should handle communities with missing count data', async () => {
      const communitiesWithoutCount = [
        {
          ...mockCommunities[0],
          _count: { memberships: undefined },
        },
      ];
      
      prismaService.community.findMany.mockResolvedValue(communitiesWithoutCount as any);

      const result = await service.getUserRecommendations('user-123');

      // Should handle gracefully without crashing
      expect(result).toBeInstanceOf(Array);
    });

    it('should set appropriate timestamps for recommendations', async () => {
      const beforeCall = new Date();
      const result = await service.getUserRecommendations('user-123');
      const afterCall = new Date();

      if (result.length > 0) {
        const recommendation = result[0];
        expect(recommendation.createdAt).toBeInstanceOf(Date);
        expect(recommendation.updatedAt).toBeInstanceOf(Date);
        expect(recommendation.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        expect(recommendation.createdAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
      }
    });
  });

  describe('calculateCompatibilityScore', () => {
    beforeEach(() => {
      jest.spyOn(Math, 'random').mockReturnValue(0.6); // Base score 0.68
    });

    it('should calculate base compatibility score', async () => {
      const calculateCompatibilityScore = (service as any).calculateCompatibilityScore.bind(service);
      
      const score = await calculateCompatibilityScore([], mockCommunities[0]);

      expect(score).toBeCloseTo(0.78, 2); // 0.68 + 0.1 (size bonus)
      expect(score).toBeGreaterThanOrEqual(0.2);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it('should apply size bonus for small communities', async () => {
      const calculateCompatibilityScore = (service as any).calculateCompatibilityScore.bind(service);
      
      const smallCommunityScore = await calculateCompatibilityScore([], mockCommunities[3]); // 8 members
      const largeCommunityScore = await calculateCompatibilityScore([], mockLargeCommunity); // 150 members

      expect(smallCommunityScore).toBeGreaterThan(largeCommunityScore);
      expect(smallCommunityScore - largeCommunityScore).toBeCloseTo(0.1, 2); // Size bonus difference
    });

    it('should cap maximum score at 1.0', async () => {
      const calculateCompatibilityScore = (service as any).calculateCompatibilityScore.bind(service);
      
      // Mock very high random value
      jest.spyOn(Math, 'random').mockReturnValue(0.95); // Base score 0.96 + 0.1 = 1.06

      const score = await calculateCompatibilityScore([], mockCommunities[3]); // Small community

      expect(score).toBe(1.0); // Should be capped at 1.0
    });

    it('should handle communities without member count', async () => {
      const calculateCompatibilityScore = (service as any).calculateCompatibilityScore.bind(service);
      
      const communityWithoutCount = {
        ...mockCommunities[0],
        _count: { memberships: undefined },
      };

      const score = await calculateCompatibilityScore([], communityWithoutCount);

      expect(score).toBeGreaterThanOrEqual(0.2);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it('should provide consistent scores for same community', async () => {
      const calculateCompatibilityScore = (service as any).calculateCompatibilityScore.bind(service);
      
      // Mock consistent random value
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const score1 = await calculateCompatibilityScore([], mockCommunities[0]);
      const score2 = await calculateCompatibilityScore([], mockCommunities[0]);

      expect(score1).toBe(score2);
    });
  });

  describe('generateRecommendationReason', () => {
    it('should generate appropriate reason for excellent match', () => {
      const generateRecommendationReason = (service as any).generateRecommendationReason.bind(service);
      
      const reason = generateRecommendationReason(0.85);
      
      expect(reason).toBe('Excellent match based on your assessment responses');
    });

    it('should generate appropriate reason for good compatibility', () => {
      const generateRecommendationReason = (service as any).generateRecommendationReason.bind(service);
      
      const reason = generateRecommendationReason(0.65);
      
      expect(reason).toBe('Good compatibility with your interests');
    });

    it('should generate appropriate reason for potential good fit', () => {
      const generateRecommendationReason = (service as any).generateRecommendationReason.bind(service);
      
      const reason = generateRecommendationReason(0.45);
      
      expect(reason).toBe('Potential good fit for your needs');
    });

    it('should generate appropriate reason for moderate compatibility', () => {
      const generateRecommendationReason = (service as any).generateRecommendationReason.bind(service);
      
      const reason = generateRecommendationReason(0.35);
      
      expect(reason).toBe('Moderate compatibility');
    });

    it('should handle edge case scores', () => {
      const generateRecommendationReason = (service as any).generateRecommendationReason.bind(service);
      
      expect(generateRecommendationReason(0.8)).toBe('Excellent match based on your assessment responses');
      expect(generateRecommendationReason(0.6)).toBe('Good compatibility with your interests');
      expect(generateRecommendationReason(0.4)).toBe('Potential good fit for your needs');
      expect(generateRecommendationReason(0.0)).toBe('Moderate compatibility');
      expect(generateRecommendationReason(1.0)).toBe('Excellent match based on your assessment responses');
    });
  });

  describe('generateRecommendationsForUser', () => {
    it('should log generation message', async () => {
      await service.generateRecommendationsForUser('user-123');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Generated recommendations for user user-123 (calculated on-demand)'
      );
    });

    it('should log generation message with force flag', async () => {
      await service.generateRecommendationsForUser('user-123', true);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Generated recommendations for user user-123 (calculated on-demand)'
      );
    });

    it('should handle different user IDs', async () => {
      await service.generateRecommendationsForUser('user-456');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Generated recommendations for user user-456 (calculated on-demand)'
      );
    });

    it('should not throw errors', async () => {
      await expect(service.generateRecommendationsForUser('user-123')).resolves.not.toThrow();
    });
  });

  describe('getRecommendationById', () => {
    it('should return null for any recommendation ID', async () => {
      const result = await service.getRecommendationById('recommendation-123');

      expect(result).toBeNull();
    });

    it('should return null for different recommendation IDs', async () => {
      const result1 = await service.getRecommendationById('rec-1');
      const result2 = await service.getRecommendationById('rec-2');
      const result3 = await service.getRecommendationById('');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    it('should handle long recommendation IDs', async () => {
      const longId = 'a'.repeat(1000);
      const result = await service.getRecommendationById(longId);

      expect(result).toBeNull();
    });
  });

  describe('handleRecommendationInteraction', () => {
    const mockInteractionData = {
      recommendationId: 'rec-123',
      action: 'accept',
      userId: 'user-123',
    };

    it('should log interaction for accept action', async () => {
      await service.handleRecommendationInteraction(mockInteractionData);

      expect(loggerSpy).toHaveBeenCalledWith(
        'User user-123 accepted recommendation rec-123'
      );
    });

    it('should log interaction for reject action', async () => {
      const rejectData = { ...mockInteractionData, action: 'reject' };
      
      await service.handleRecommendationInteraction(rejectData);

      expect(loggerSpy).toHaveBeenCalledWith(
        'User user-123 rejected recommendation rec-123'
      );
    });

    it('should log interaction for view action', async () => {
      const viewData = { ...mockInteractionData, action: 'view' };
      
      await service.handleRecommendationInteraction(viewData);

      expect(loggerSpy).toHaveBeenCalledWith(
        'User user-123 viewed recommendation rec-123'
      );
    });

    it('should handle custom actions', async () => {
      const customData = { ...mockInteractionData, action: 'bookmark' };
      
      await service.handleRecommendationInteraction(customData);

      expect(loggerSpy).toHaveBeenCalledWith(
        'User user-123 bookmarked recommendation rec-123'
      );
    });

    it('should handle different user IDs', async () => {
      const differentUserData = { ...mockInteractionData, userId: 'user-456' };
      
      await service.handleRecommendationInteraction(differentUserData);

      expect(loggerSpy).toHaveBeenCalledWith(
        'User user-456 accepted recommendation rec-123'
      );
    });

    it('should handle different recommendation IDs', async () => {
      const differentRecData = { ...mockInteractionData, recommendationId: 'rec-456' };
      
      await service.handleRecommendationInteraction(differentRecData);

      expect(loggerSpy).toHaveBeenCalledWith(
        'User user-123 accepted recommendation rec-456'
      );
    });

    it('should not throw errors', async () => {
      await expect(
        service.handleRecommendationInteraction(mockInteractionData)
      ).resolves.not.toThrow();
    });

    it('should handle empty action strings', async () => {
      const emptyActionData = { ...mockInteractionData, action: '' };
      
      await service.handleRecommendationInteraction(emptyActionData);

      expect(loggerSpy).toHaveBeenCalledWith(
        'User user-123 ed recommendation rec-123'
      );
    });

    it('should handle special characters in actions', async () => {
      const specialActionData = { ...mockInteractionData, action: 'action-with-dashes_and_underscores' };
      
      await service.handleRecommendationInteraction(specialActionData);

      expect(loggerSpy).toHaveBeenCalledWith(
        'User user-123 action-with-dashes_and_underscoresed recommendation rec-123'
      );
    });
  });

  describe('getRecommendationStats', () => {
    it('should return default stats structure', async () => {
      const result = await service.getRecommendationStats();

      expect(result).toEqual({
        totalRecommendations: 0,
        acceptedRecommendations: 0,
        rejectedRecommendations: 0,
        pendingRecommendations: 0,
        averageCompatibilityScore: 0,
        topCommunities: [],
      });
    });

    it('should return consistent stats structure on multiple calls', async () => {
      const result1 = await service.getRecommendationStats();
      const result2 = await service.getRecommendationStats();

      expect(result1).toEqual(result2);
    });

    it('should have all required properties', async () => {
      const result = await service.getRecommendationStats();

      expect(result).toHaveProperty('totalRecommendations');
      expect(result).toHaveProperty('acceptedRecommendations');
      expect(result).toHaveProperty('rejectedRecommendations');
      expect(result).toHaveProperty('pendingRecommendations');
      expect(result).toHaveProperty('averageCompatibilityScore');
      expect(result).toHaveProperty('topCommunities');

      expect(typeof result.totalRecommendations).toBe('number');
      expect(typeof result.acceptedRecommendations).toBe('number');
      expect(typeof result.rejectedRecommendations).toBe('number');
      expect(typeof result.pendingRecommendations).toBe('number');
      expect(typeof result.averageCompatibilityScore).toBe('number');
      expect(Array.isArray(result.topCommunities)).toBe(true);
    });

    it('should not throw errors', async () => {
      await expect(service.getRecommendationStats()).resolves.not.toThrow();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle user with null memberships', async () => {
      const userWithNullMemberships = {
        ...mockUser,
        memberships: null,
      };
      
      prismaService.user.findUnique.mockResolvedValue(userWithNullMemberships as any);
      prismaService.community.findMany.mockResolvedValue(mockCommunities);

      await expect(service.getUserRecommendations('user-123')).rejects.toThrow();
    });

    it('should handle communities with null member counts', async () => {
      const communitiesWithNullCounts = [
        {
          ...mockCommunities[0],
          _count: null,
        },
      ];
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.community.findMany.mockResolvedValue(communitiesWithNullCounts as any);

      const result = await service.getUserRecommendations('user-123');

      expect(result).toBeInstanceOf(Array);
    });

    it('should handle very large numbers of communities efficiently', async () => {
      const largeCommunityList = Array.from({ length: 1000 }, (_, i) => ({
        id: `community-${i}`,
        name: `Community ${i}`,
        slug: `community-${i}`,
        description: `Description ${i}`,
        imageUrl: `image-${i}.jpg`,
        _count: { memberships: i % 100 }, // Varying sizes
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }));

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.community.findMany.mockResolvedValue(largeCommunityList);

      const startTime = Date.now();
      const result = await service.getUserRecommendations('user-123');
      const endTime = Date.now();

      expect(result.length).toBeLessThanOrEqual(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent user recommendation requests', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.community.findMany.mockResolvedValue(mockCommunities);

      const promises = [
        service.getUserRecommendations('user-123'),
        service.getUserRecommendations('user-123'),
        service.getUserRecommendations('user-123'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeInstanceOf(Array);
      });
    });

    it('should handle database timeout errors', async () => {
      const timeoutError = new Error('Connection timeout');
      prismaService.user.findUnique.mockRejectedValue(timeoutError);

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      const result = await service.getUserRecommendations('user-123');

      expect(result).toEqual([]);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error getting recommendations for user user-123'),
        timeoutError
      );
    });

    it('should handle malformed community data gracefully', async () => {
      const malformedCommunities = [
        {
          // Missing required fields
          id: 'community-malformed',
          // name: missing
          // slug: missing
          description: 'Description',
          _count: { memberships: 10 },
        },
      ];
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.community.findMany.mockResolvedValue(malformedCommunities as any);

      const result = await service.getUserRecommendations('user-123');

      // Should handle gracefully without crashing
      expect(result).toBeInstanceOf(Array);
    });

    it('should maintain score precision', async () => {
      // Test with specific random values to check precision
      jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
      
      const calculateCompatibilityScore = (service as any).calculateCompatibilityScore.bind(service);
      const score = await calculateCompatibilityScore([], mockCommunities[0]);

      expect(score).toBeCloseTo(0.32876, 5); // High precision check
    });

    it('should handle edge case scores in reason generation', async () => {
      const generateRecommendationReason = (service as any).generateRecommendationReason.bind(service);
      
      // Test boundary values
      expect(generateRecommendationReason(0.800000001)).toBe('Excellent match based on your assessment responses');
      expect(generateRecommendationReason(0.799999999)).toBe('Good compatibility with your interests');
      expect(generateRecommendationReason(0.600000001)).toBe('Good compatibility with your interests');
      expect(generateRecommendationReason(0.599999999)).toBe('Potential good fit for your needs');
      expect(generateRecommendationReason(0.400000001)).toBe('Potential good fit for your needs');
      expect(generateRecommendationReason(0.399999999)).toBe('Moderate compatibility');
    });

    it('should handle negative scores gracefully', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(-0.5); // Negative random (shouldn't happen but test anyway)
      
      const calculateCompatibilityScore = (service as any).calculateCompatibilityScore.bind(service);
      const score = await calculateCompatibilityScore([], mockCommunities[0]);

      expect(score).toBeGreaterThanOrEqual(0); // Should still be non-negative
    });

    it('should handle infinity and NaN in calculations', async () => {
      const communityWithInfiniteMembers = {
        ...mockCommunities[0],
        _count: { memberships: Infinity },
      };
      
      const calculateCompatibilityScore = (service as any).calculateCompatibilityScore.bind(service);
      const score = await calculateCompatibilityScore([], communityWithInfiniteMembers);

      expect(score).toBeFinite();
      expect(score).not.toBeNaN();
    });
  });

  describe('recommendation data integrity', () => {
    it('should ensure all recommendations have required fields', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.community.findMany.mockResolvedValue(mockCommunities);

      const result = await service.getUserRecommendations('user-123');

      result.forEach(recommendation => {
        expect(recommendation.id).toBeDefined();
        expect(recommendation.name).toBeDefined();
        expect(recommendation.slug).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.imageUrl).toBeDefined();
        expect(recommendation.memberCount).toBeDefined();
        expect(recommendation.compatibilityScore).toBeDefined();
        expect(recommendation.score).toBeDefined();
        expect(recommendation.reason).toBeDefined();
        expect(recommendation.status).toBeDefined();
        expect(recommendation.createdAt).toBeDefined();
        expect(recommendation.updatedAt).toBeDefined();

        expect(typeof recommendation.id).toBe('string');
        expect(typeof recommendation.name).toBe('string');
        expect(typeof recommendation.slug).toBe('string');
        expect(typeof recommendation.description).toBe('string');
        expect(typeof recommendation.imageUrl).toBe('string');
        expect(typeof recommendation.memberCount).toBe('number');
        expect(typeof recommendation.compatibilityScore).toBe('number');
        expect(typeof recommendation.score).toBe('number');
        expect(typeof recommendation.reason).toBe('string');
        expect(typeof recommendation.status).toBe('string');
        expect(recommendation.createdAt).toBeInstanceOf(Date);
        expect(recommendation.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should ensure score fields are in valid range', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.community.findMany.mockResolvedValue(mockCommunities);

      const result = await service.getUserRecommendations('user-123');

      result.forEach(recommendation => {
        expect(recommendation.compatibilityScore).toBeGreaterThanOrEqual(0);
        expect(recommendation.compatibilityScore).toBeLessThanOrEqual(1);
        expect(recommendation.score).toBeGreaterThanOrEqual(0);
        expect(recommendation.score).toBeLessThanOrEqual(1);
        expect(recommendation.memberCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should ensure consistency between score fields', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.community.findMany.mockResolvedValue(mockCommunities);

      const result = await service.getUserRecommendations('user-123');

      result.forEach(recommendation => {
        expect(recommendation.score).toBe(recommendation.compatibilityScore);
      });
    });

    it('should ensure status field is always set correctly', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.community.findMany.mockResolvedValue(mockCommunities);

      const result = await service.getUserRecommendations('user-123');

      result.forEach(recommendation => {
        expect(recommendation.status).toBe('pending');
      });
    });
  });
});