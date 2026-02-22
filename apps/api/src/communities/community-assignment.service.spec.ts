import { Test, TestingModule } from '@nestjs/testing';
import { CommunityAssignmentService } from './community-assignment.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { ILLNESS_COMMUNITIES } from '../config/community-configs';

describe('CommunityAssignmentService', () => {
  let service: CommunityAssignmentService;
  let prismaService: jest.Mocked<PrismaService>;

  // Mock data
  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  };

  const mockCommunity = {
    id: 'community-123',
    name: 'Depression Support Network',
    slug: 'depression-support',
    description: 'A supportive community for depression',
    imageUrl: 'image.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockAnxietyCommunity = {
    id: 'community-456',
    name: 'Anxiety Warriors',
    slug: 'anxiety-warriors',
    description: 'A supportive community for anxiety',
    imageUrl: 'anxiety.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockGeneralCommunity = {
    id: 'community-789',
    name: 'Support Circle',
    slug: 'support-circle',
    description: 'General support community',
    imageUrl: 'general.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockMindfulnessCommunity = {
    id: 'community-101',
    name: 'Mindfulness & Meditation',
    slug: 'mindfulness-meditation',
    description: 'Mindfulness and meditation community',
    imageUrl: 'mindfulness.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPreAssessment = {
    id: 'assessment-123',
    clientId: 'user-123',
    questionnaires: ['phq-9', 'gad-7-anxiety'],
    answers: [[1, 2, 3], [4, 5, 6]],
    answerMatrix: [[1, 2, 3], [4, 5, 6]],
    scores: {
      'phq-9': 15, // Moderate depression
      'gad-7-anxiety': 12, // Moderate anxiety
      'perceived-stress-scale': 8, // Mild stress
      'minimal-condition': 2, // Minimal score
    },
    severityLevels: {
      'phq-9': 'moderate',
      'gad-7-anxiety': 'moderate',
      'perceived-stress-scale': 'mild',
      'minimal-condition': 'minimal',
    },
    aiEstimate: { hasDepression: true, hasAnxiety: true },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockMembership = {
    id: 'membership-123',
    userId: 'user-123',
    communityId: 'community-123',
    role: 'member',
    joinedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      preAssessment: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      community: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      membership: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityAssignmentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommunityAssignmentService>(CommunityAssignmentService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignCommunitiesToUser', () => {
    beforeEach(() => {
      prismaService.preAssessment.findFirst.mockResolvedValue(mockPreAssessment);
      prismaService.community.findUnique.mockImplementation((args) => {
        const slug = args.where.slug;
        if (slug === 'depression-support') return Promise.resolve(mockCommunity);
        if (slug === 'anxiety-warriors') return Promise.resolve(mockAnxietyCommunity);
        return Promise.resolve(null);
      });
      prismaService.community.findFirst.mockImplementation((args) => {
        const name = args.where.name;
        if (name === 'Support Circle') return Promise.resolve(mockGeneralCommunity);
        if (name === 'Mindfulness & Meditation') return Promise.resolve(mockMindfulnessCommunity);
        return Promise.resolve(null);
      });
      prismaService.membership.findUnique.mockResolvedValue(null); // No existing memberships
      prismaService.membership.create.mockResolvedValue(mockMembership);
    });

    it('should assign communities based on moderate/severe assessment scores', async () => {
      const result = await service.assignCommunitiesToUser('user-123');

      expect(prismaService.preAssessment.findFirst).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
      });

      // Should find communities for moderate/severe conditions
      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { slug: 'depression-support' },
      });
      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { slug: 'anxiety-warriors' },
      });

      // Should create memberships for moderate/severe conditions
      expect(prismaService.membership.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          communityId: 'community-123',
          role: 'member',
          joinedAt: expect.any(Date),
        },
      });
      expect(prismaService.membership.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          communityId: 'community-456',
          role: 'member',
          joinedAt: expect.any(Date),
        },
      });

      // Should also assign general communities
      expect(prismaService.community.findFirst).toHaveBeenCalledWith({
        where: { name: 'Support Circle' },
      });
      expect(prismaService.community.findFirst).toHaveBeenCalledWith({
        where: { name: 'Mindfulness & Meditation' },
      });

      expect(result).toEqual(['Depression Support Network', 'Anxiety Warriors']);
    });

    it('should not assign communities for mild/minimal severity scores', async () => {
      const mildAssessment = {
        ...mockPreAssessment,
        scores: {
          'phq-9': 5, // Mild depression
          'gad-7-anxiety': 3, // Minimal anxiety
        },
        severityLevels: {
          'phq-9': 'mild',
          'gad-7-anxiety': 'minimal',
        },
      };
      prismaService.preAssessment.findFirst.mockResolvedValue(mildAssessment);

      const result = await service.assignCommunitiesToUser('user-123');

      // Should still query for communities but not create memberships for mild/minimal
      expect(prismaService.membership.create).toHaveBeenCalledTimes(2); // Only general communities
      expect(result).toEqual([]);
    });

    it('should return empty array when no pre-assessment exists', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(null);

      const result = await service.assignCommunitiesToUser('user-123');

      expect(result).toEqual([]);
      expect(prismaService.community.findUnique).not.toHaveBeenCalled();
      expect(prismaService.membership.create).not.toHaveBeenCalled();
    });

    it('should skip communities that do not exist in database', async () => {
      const assessmentWithNonExistentCommunity = {
        ...mockPreAssessment,
        scores: {
          'phq-9': 15, // Maps to depression-support
          'unknown-questionnaire': 20, // No mapping
        },
        severityLevels: {
          'phq-9': 'moderate',
          'unknown-questionnaire': 'severe',
        },
      };
      prismaService.preAssessment.findFirst.mockResolvedValue(assessmentWithNonExistentCommunity);
      
      // Only depression community exists
      prismaService.community.findUnique.mockImplementation((args) => {
        if (args.where.slug === 'depression-support') return Promise.resolve(mockCommunity);
        return Promise.resolve(null);
      });

      const result = await service.assignCommunitiesToUser('user-123');

      expect(result).toEqual(['Depression Support Network']);
    });

    it('should skip assignment if user is already a member', async () => {
      // User is already a member of depression community
      prismaService.membership.findUnique.mockImplementation((args) => {
        if (
          args.where.userId_communityId.userId === 'user-123' &&
          args.where.userId_communityId.communityId === 'community-123'
        ) {
          return Promise.resolve(mockMembership);
        }
        return Promise.resolve(null);
      });

      const result = await service.assignCommunitiesToUser('user-123');

      // Should check for existing membership
      expect(prismaService.membership.findUnique).toHaveBeenCalledWith({
        where: {
          userId_communityId: {
            userId: 'user-123',
            communityId: 'community-123',
          },
        },
      });

      // Should not create new membership for depression (already exists)
      const createCalls = prismaService.membership.create.mock.calls;
      const depressionAssignment = createCalls.find(call => 
        call[0].data.communityId === 'community-123'
      );
      expect(depressionAssignment).toBeUndefined();

      // Should still assign anxiety community and general communities
      expect(result).toEqual(['Anxiety Warriors']);
    });

    it('should handle database errors gracefully during membership creation', async () => {
      prismaService.membership.create.mockRejectedValueOnce(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.assignCommunitiesToUser('user-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to assign community'),
        expect.any(Error)
      );

      // Should continue with other assignments despite one failure
      expect(prismaService.membership.create).toHaveBeenCalledTimes(4); // 2 specific + 2 general

      consoleSpy.mockRestore();
    });

    it('should assign general support communities regardless of assessment results', async () => {
      const result = await service.assignCommunitiesToUser('user-123');

      // Should assign general communities
      expect(prismaService.community.findFirst).toHaveBeenCalledWith({
        where: { name: 'Support Circle' },
      });
      expect(prismaService.community.findFirst).toHaveBeenCalledWith({
        where: { name: 'Mindfulness & Meditation' },
      });

      // Should create memberships for general communities
      expect(prismaService.membership.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          communityId: 'community-789',
          role: 'member',
          joinedAt: expect.any(Date),
        },
      });
      expect(prismaService.membership.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          communityId: 'community-101',
          role: 'member',
          joinedAt: expect.any(Date),
        },
      });
    });

    it('should handle all questionnaire mappings correctly', async () => {
      const comprehensiveAssessment = {
        ...mockPreAssessment,
        scores: {
          'phq-9': 15, // depression-support
          'gad-7-anxiety': 12, // anxiety-warriors
          'social-phobia': 10, // social-anxiety-support
          'panic-disorder': 8, // anxiety-warriors
          'perceived-stress-scale': 14, // stress-support
          'burnout': 16, // burnout-recovery
          'insomnia': 12, // insomnia-support
          'ptsd': 18, // ptsd-support
          'obsessional-compulsive': 11, // ocd-support
          'adhd': 9, // adhd-support
          'binge-eating': 13, // eating-disorder-recovery
          'alcohol': 10, // substance-recovery-support
          'drug-abuse': 15, // substance-recovery-support
        },
        severityLevels: {
          'phq-9': 'moderate',
          'gad-7-anxiety': 'moderate',
          'social-phobia': 'moderate',
          'panic-disorder': 'moderate',
          'perceived-stress-scale': 'moderate',
          'burnout': 'severe',
          'insomnia': 'moderate',
          'ptsd': 'severe',
          'obsessional-compulsive': 'moderate',
          'adhd': 'moderate',
          'binge-eating': 'moderate',
          'alcohol': 'moderate',
          'drug-abuse': 'severe',
        },
      };

      prismaService.preAssessment.findFirst.mockResolvedValue(comprehensiveAssessment);

      // Mock all communities exist
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);

      await service.assignCommunitiesToUser('user-123');

      // Should attempt to find all mapped communities
      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { slug: 'depression-support' },
      });
      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { slug: 'anxiety-warriors' },
      });
      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { slug: 'social-anxiety-support' },
      });
      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { slug: 'stress-support' },
      });
    });
  });

  describe('assignGeneralSupportCommunities', () => {
    beforeEach(() => {
      prismaService.community.findFirst.mockImplementation((args) => {
        const name = args.where.name;
        if (name === 'Support Circle') return Promise.resolve(mockGeneralCommunity);
        if (name === 'Mindfulness & Meditation') return Promise.resolve(mockMindfulnessCommunity);
        return Promise.resolve(null);
      });
      prismaService.membership.findUnique.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);
    });

    it('should assign both general support communities', async () => {
      // Call the private method through assignCommunitiesToUser
      prismaService.preAssessment.findFirst.mockResolvedValue(null); // No assessment
      
      await service.assignCommunitiesToUser('user-123');

      expect(prismaService.community.findFirst).toHaveBeenCalledWith({
        where: { name: 'Support Circle' },
      });
      expect(prismaService.community.findFirst).toHaveBeenCalledWith({
        where: { name: 'Mindfulness & Meditation' },
      });

      expect(prismaService.membership.create).toHaveBeenCalledTimes(2);
    });

    it('should skip general communities if user is already a member', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(null);
      prismaService.membership.findUnique.mockResolvedValue(mockMembership); // Already a member

      await service.assignCommunitiesToUser('user-123');

      expect(prismaService.membership.create).not.toHaveBeenCalled();
    });

    it('should handle missing general communities gracefully', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(null);
      prismaService.community.findFirst.mockResolvedValue(null); // Communities don't exist

      await service.assignCommunitiesToUser('user-123');

      expect(prismaService.membership.create).not.toHaveBeenCalled();
    });

    it('should handle errors during general community assignment', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(null);
      prismaService.membership.create.mockRejectedValue(new Error('Assignment failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.assignCommunitiesToUser('user-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to assign general community'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getRecommendedCommunities', () => {
    beforeEach(() => {
      prismaService.preAssessment.findFirst.mockResolvedValue(mockPreAssessment);
    });

    it('should return recommended communities based on assessment scores', async () => {
      const result = await service.getRecommendedCommunities('user-123');

      expect(prismaService.preAssessment.findFirst).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
      });

      // Should include communities for moderate/severe conditions
      expect(result).toContain('Depression Support Network');
      expect(result).toContain('Anxiety Warriors');
      expect(result).not.toContain('Stress Support Community'); // mild severity
    });

    it('should return empty array when no pre-assessment exists', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(null);

      const result = await service.getRecommendedCommunities('user-123');

      expect(result).toEqual([]);
    });

    it('should filter out communities that are not in ILLNESS_COMMUNITIES config', async () => {
      const assessmentWithUnknownCommunity = {
        ...mockPreAssessment,
        scores: {
          'unknown-questionnaire': 20, // No mapping in ILLNESS_COMMUNITIES
        },
        severityLevels: {
          'unknown-questionnaire': 'severe',
        },
      };
      prismaService.preAssessment.findFirst.mockResolvedValue(assessmentWithUnknownCommunity);

      const result = await service.getRecommendedCommunities('user-123');

      expect(result).toEqual([]);
    });

    it('should only include communities for moderate or higher severity', async () => {
      const mixedSeverityAssessment = {
        ...mockPreAssessment,
        scores: {
          'phq-9': 15, // moderate
          'gad-7-anxiety': 5, // mild
          'ptsd': 18, // severe
        },
        severityLevels: {
          'phq-9': 'moderate',
          'gad-7-anxiety': 'mild',
          'ptsd': 'severe',
        },
      };
      prismaService.preAssessment.findFirst.mockResolvedValue(mixedSeverityAssessment);

      const result = await service.getRecommendedCommunities('user-123');

      expect(result).toContain('Depression Support Network'); // moderate
      expect(result).toContain('PTSD Support Network'); // severe
      expect(result).not.toContain('Anxiety Warriors'); // mild severity
    });
  });

  describe('bulkAssignCommunities', () => {
    it('should assign communities to multiple users', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      
      prismaService.preAssessment.findFirst.mockImplementation((args) => {
        if (args.where.clientId === 'user-1') return Promise.resolve(mockPreAssessment);
        if (args.where.clientId === 'user-2') return Promise.resolve(mockPreAssessment);
        if (args.where.clientId === 'user-3') return Promise.resolve(null); // No assessment
        return Promise.resolve(null);
      });

      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
      prismaService.membership.findUnique.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      const result = await service.bulkAssignCommunities(userIds);

      expect(result).toHaveProperty('user-1');
      expect(result).toHaveProperty('user-2');
      expect(result).toHaveProperty('user-3');

      expect(result['user-1']).toContain('Depression Support Network');
      expect(result['user-2']).toContain('Depression Support Network');
      expect(result['user-3']).toEqual([]); // No assessment
    });

    it('should handle errors for individual users gracefully', async () => {
      const userIds = ['user-1', 'user-2'];
      
      prismaService.preAssessment.findFirst.mockImplementation((args) => {
        if (args.where.clientId === 'user-1') return Promise.resolve(mockPreAssessment);
        if (args.where.clientId === 'user-2') return Promise.reject(new Error('Database error'));
        return Promise.resolve(null);
      });

      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
      prismaService.membership.findUnique.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.bulkAssignCommunities(userIds);

      expect(result['user-1']).toContain('Depression Support Network');
      expect(result['user-2']).toEqual([]); // Error case

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error assigning communities to user user-2'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle empty user list', async () => {
      const result = await service.bulkAssignCommunities([]);

      expect(result).toEqual({});
      expect(prismaService.preAssessment.findFirst).not.toHaveBeenCalled();
    });

    it('should process large number of users efficiently', async () => {
      const userIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);
      
      prismaService.preAssessment.findFirst.mockResolvedValue(null); // No assessments
      
      const result = await service.bulkAssignCommunities(userIds);

      expect(Object.keys(result)).toHaveLength(100);
      expect(prismaService.preAssessment.findFirst).toHaveBeenCalledTimes(100);
    });
  });

  describe('questionnaire mapping configuration', () => {
    it('should have correct mapping for depression-related assessments', async () => {
      const assessments = ['phq-9', 'mood-disorder'];
      
      for (const assessment of assessments) {
        const testAssessment = {
          ...mockPreAssessment,
          scores: { [assessment]: 15 },
          severityLevels: { [assessment]: 'moderate' },
        };
        
        prismaService.preAssessment.findFirst.mockResolvedValue(testAssessment);
        prismaService.community.findUnique.mockResolvedValue(mockCommunity);
        prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
        prismaService.membership.findUnique.mockResolvedValue(null);
        prismaService.membership.create.mockResolvedValue(mockMembership);

        await service.assignCommunitiesToUser('user-123');

        expect(prismaService.community.findUnique).toHaveBeenCalledWith({
          where: { slug: 'depression-support' },
        });

        jest.clearAllMocks();
      }
    });

    it('should have correct mapping for anxiety-related assessments', async () => {
      const assessmentMappings = [
        { assessment: 'gad-7-anxiety', expectedSlug: 'anxiety-warriors' },
        { assessment: 'social-phobia', expectedSlug: 'social-anxiety-support' },
        { assessment: 'panic-disorder', expectedSlug: 'anxiety-warriors' },
        { assessment: 'phobia', expectedSlug: 'phobia-support' },
      ];

      for (const { assessment, expectedSlug } of assessmentMappings) {
        const testAssessment = {
          ...mockPreAssessment,
          scores: { [assessment]: 15 },
          severityLevels: { [assessment]: 'moderate' },
        };
        
        prismaService.preAssessment.findFirst.mockResolvedValue(testAssessment);
        prismaService.community.findUnique.mockResolvedValue(mockCommunity);
        prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
        prismaService.membership.findUnique.mockResolvedValue(null);
        prismaService.membership.create.mockResolvedValue(mockMembership);

        await service.assignCommunitiesToUser('user-123');

        expect(prismaService.community.findUnique).toHaveBeenCalledWith({
          where: { slug: expectedSlug },
        });

        jest.clearAllMocks();
      }
    });

    it('should have correct mapping for other mental health assessments', async () => {
      const assessmentMappings = [
        { assessment: 'perceived-stress-scale', expectedSlug: 'stress-support' },
        { assessment: 'burnout', expectedSlug: 'burnout-recovery' },
        { assessment: 'insomnia', expectedSlug: 'insomnia-support' },
        { assessment: 'ptsd', expectedSlug: 'ptsd-support' },
        { assessment: 'obsessional-compulsive', expectedSlug: 'ocd-support' },
        { assessment: 'adhd', expectedSlug: 'adhd-support' },
        { assessment: 'binge-eating', expectedSlug: 'eating-disorder-recovery' },
        { assessment: 'alcohol', expectedSlug: 'substance-recovery-support' },
        { assessment: 'drug-abuse', expectedSlug: 'substance-recovery-support' },
      ];

      for (const { assessment, expectedSlug } of assessmentMappings) {
        const testAssessment = {
          ...mockPreAssessment,
          scores: { [assessment]: 15 },
          severityLevels: { [assessment]: 'moderate' },
        };
        
        prismaService.preAssessment.findFirst.mockResolvedValue(testAssessment);
        prismaService.community.findUnique.mockResolvedValue(mockCommunity);
        prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
        prismaService.membership.findUnique.mockResolvedValue(null);
        prismaService.membership.create.mockResolvedValue(mockMembership);

        await service.assignCommunitiesToUser('user-123');

        expect(prismaService.community.findUnique).toHaveBeenCalledWith({
          where: { slug: expectedSlug },
        });

        jest.clearAllMocks();
      }
    });
  });

  describe('severity threshold configuration', () => {
    it('should respect severity thresholds for community assignment', async () => {
      const severityTests = [
        { severity: 'minimal', shouldAssign: false },
        { severity: 'mild', shouldAssign: false },
        { severity: 'moderate', shouldAssign: true },
        { severity: 'severe', shouldAssign: true },
        { severity: 'very-severe', shouldAssign: true },
      ];

      for (const { severity, shouldAssign } of severityTests) {
        const testAssessment = {
          ...mockPreAssessment,
          scores: { 'phq-9': 15 },
          severityLevels: { 'phq-9': severity },
        };
        
        prismaService.preAssessment.findFirst.mockResolvedValue(testAssessment);
        prismaService.community.findUnique.mockResolvedValue(mockCommunity);
        prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
        prismaService.membership.findUnique.mockResolvedValue(null);
        prismaService.membership.create.mockResolvedValue(mockMembership);

        const result = await service.assignCommunitiesToUser('user-123');

        if (shouldAssign) {
          expect(result).toContain('Depression Support Network');
          expect(prismaService.community.findUnique).toHaveBeenCalledWith({
            where: { slug: 'depression-support' },
          });
        } else {
          expect(result).not.toContain('Depression Support Network');
        }

        jest.clearAllMocks();
      }
    });

    it('should handle case insensitive severity levels', async () => {
      const testAssessment = {
        ...mockPreAssessment,
        scores: { 'phq-9': 15 },
        severityLevels: { 'phq-9': 'MODERATE' }, // Uppercase
      };
      
      prismaService.preAssessment.findFirst.mockResolvedValue(testAssessment);
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
      prismaService.membership.findUnique.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      const result = await service.assignCommunitiesToUser('user-123');

      expect(result).toContain('Depression Support Network');
    });

    it('should handle undefined severity levels gracefully', async () => {
      const testAssessment = {
        ...mockPreAssessment,
        scores: { 'phq-9': 15 },
        severityLevels: { 'phq-9': undefined },
      };
      
      prismaService.preAssessment.findFirst.mockResolvedValue(testAssessment);
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
      prismaService.membership.findUnique.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      const result = await service.assignCommunitiesToUser('user-123');

      expect(result).not.toContain('Depression Support Network');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty assessment scores', async () => {
      const emptyAssessment = {
        ...mockPreAssessment,
        scores: {},
        severityLevels: {},
      };
      
      prismaService.preAssessment.findFirst.mockResolvedValue(emptyAssessment);
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
      prismaService.membership.findUnique.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      const result = await service.assignCommunitiesToUser('user-123');

      expect(result).toEqual([]);
      expect(prismaService.community.findUnique).not.toHaveBeenCalled();
      // Should still assign general communities
      expect(prismaService.community.findFirst).toHaveBeenCalled();
    });

    it('should handle null assessment data', async () => {
      const nullAssessment = {
        ...mockPreAssessment,
        scores: null,
        severityLevels: null,
      };
      
      prismaService.preAssessment.findFirst.mockResolvedValue(nullAssessment);

      const result = await service.assignCommunitiesToUser('user-123');

      expect(result).toEqual([]);
    });

    it('should handle database connection errors', async () => {
      prismaService.preAssessment.findFirst.mockRejectedValue(new Error('Database connection error'));

      await expect(service.assignCommunitiesToUser('user-123')).rejects.toThrow('Database connection error');
    });

    it('should handle concurrent assignment attempts', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(mockPreAssessment);
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
      prismaService.membership.findUnique.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      // Simulate concurrent calls
      const promises = [
        service.assignCommunitiesToUser('user-123'),
        service.assignCommunitiesToUser('user-123'),
        service.assignCommunitiesToUser('user-123'),
      ];

      const results = await Promise.all(promises);

      // All calls should complete successfully
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toContain('Depression Support Network');
      });
    });

    it('should handle very large assessment objects', async () => {
      const largeScores = {};
      const largeSeverityLevels = {};
      
      // Create large assessment with 1000 entries
      for (let i = 0; i < 1000; i++) {
        largeScores[`assessment-${i}`] = 15;
        largeSeverityLevels[`assessment-${i}`] = 'moderate';
      }
      
      // Add one known assessment
      largeScores['phq-9'] = 15;
      largeSeverityLevels['phq-9'] = 'moderate';

      const largeAssessment = {
        ...mockPreAssessment,
        scores: largeScores,
        severityLevels: largeSeverityLevels,
      };
      
      prismaService.preAssessment.findFirst.mockResolvedValue(largeAssessment);
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
      prismaService.membership.findUnique.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      const result = await service.assignCommunitiesToUser('user-123');

      expect(result).toContain('Depression Support Network');
      // Should handle large data efficiently
      expect(prismaService.community.findUnique).toHaveBeenCalledTimes(1); // Only for mapped questionnaire
    });
  });

  describe('console logging', () => {
    it('should log assignment progress and results', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(mockPreAssessment);
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
      prismaService.membership.findUnique.mockResolvedValue(null);
      prismaService.membership.create.mockResolvedValue(mockMembership);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.assignCommunitiesToUser('user-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-assigning communities for user: user-123')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Assigned user to community')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-assignment complete')
      );

      consoleSpy.mockRestore();
    });

    it('should log when no pre-assessment is found', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.assignCommunitiesToUser('user-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No pre-assessment found for user: user-123')
      );

      consoleSpy.mockRestore();
    });

    it('should log when community is not found', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(mockPreAssessment);
      prismaService.community.findUnique.mockResolvedValue(null); // Community not found
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.assignCommunitiesToUser('user-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Community not found for slug')
      );

      consoleSpy.mockRestore();
    });

    it('should log when user is already a member', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(mockPreAssessment);
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
      prismaService.community.findFirst.mockResolvedValue(mockGeneralCommunity);
      prismaService.membership.findUnique.mockResolvedValue(mockMembership); // Already a member
      prismaService.membership.create.mockResolvedValue(mockMembership);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.assignCommunitiesToUser('user-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('User already member of')
      );

      consoleSpy.mockRestore();
    });
  });
});