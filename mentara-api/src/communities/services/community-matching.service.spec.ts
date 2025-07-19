import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CommunityMatchingService } from './community-matching.service';
import { PrismaService } from '../../providers/prisma-client.provider';

describe('CommunityMatchingService', () => {
  let service: CommunityMatchingService;
  let prismaService: jest.Mocked<PrismaService>;
  let loggerSpy: jest.SpyInstance;

  // Mock data
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

  const mockPTSDCommunity = {
    id: 'community-789',
    name: 'PTSD Support Network',
    slug: 'ptsd-support',
    description: 'A supportive community for PTSD',
    imageUrl: 'ptsd.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockGeneralCommunity = {
    id: 'community-general',
    name: 'General Support',
    slug: 'general-support',
    description: 'General mental health support',
    imageUrl: 'general.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPreAssessment = {
    id: 'assessment-123',
    clientId: 'user-123',
    questionnaires: ['phq-9', 'gad-7', 'ptsd-5'],
    answers: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    answerMatrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    scores: {
      phq9Score: 15, // Moderately severe depression
      gad7Score: 12, // Moderate anxiety
      ptsd5Score: 8, // Moderate PTSD
    },
    severityLevels: {
      phq9: 'moderately severe',
      gad7: 'moderate',
      ptsd5: 'moderate',
    },
    aiEstimate: { hasDepression: true, hasAnxiety: true },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUserAssessmentProfile = {
    userId: 'user-123',
    assessments: {
      phq9: {
        score: 15,
        severity: 'moderately severe',
        date: new Date('2024-01-01'),
      },
      gad7: {
        score: 12,
        severity: 'moderate',
        date: new Date('2024-01-01'),
      },
      ptsd5: {
        score: 8,
        severity: 'moderate',
        date: new Date('2024-01-01'),
      },
    },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      community: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      preAssessment: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityMatchingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommunityMatchingService>(CommunityMatchingService);
    prismaService = module.get(PrismaService);

    // Setup logger spies
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCompatibilityScore', () => {
    beforeEach(() => {
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
    });

    it('should calculate high compatibility score for matching conditions', async () => {
      const result = await service.calculateCompatibilityScore(
        mockUserAssessmentProfile,
        'depression-support'
      );

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { slug: 'depression-support' },
        select: { id: true, name: true, slug: true },
      });

      expect(result).toEqual({
        communityId: 'community-123',
        communitySlug: 'depression-support',
        compatibilityScore: expect.any(Number),
        reasoning: expect.stringContaining('Depression Support Network'),
        matchingFactors: expect.arrayContaining(['PHQ9 (moderately severe)']),
        assessmentContributions: expect.objectContaining({
          phq9: expect.objectContaining({
            score: 15,
            weight: 0.8,
            contribution: expect.any(Number),
          }),
        }),
      });

      expect(result.compatibilityScore).toBeGreaterThan(0.7); // High compatibility
    });

    it('should calculate moderate compatibility for general communities', async () => {
      prismaService.community.findUnique.mockResolvedValue(mockGeneralCommunity);

      const result = await service.calculateCompatibilityScore(
        mockUserAssessmentProfile,
        'general-support'
      );

      expect(result.compatibilityScore).toBeLessThan(0.9); // Should be lower due to general community penalty
      expect(result.communitySlug).toBe('general-support');
    });

    it('should throw error for non-existent community', async () => {
      prismaService.community.findUnique.mockResolvedValue(null);

      await expect(
        service.calculateCompatibilityScore(mockUserAssessmentProfile, 'non-existent-community')
      ).rejects.toThrow('Community not found: non-existent-community');
    });

    it('should return zero compatibility when no assessments match', async () => {
      const noMatchProfile = {
        userId: 'user-123',
        assessments: {
          unknownAssessment: {
            score: 15,
            severity: 'moderate',
            date: new Date('2024-01-01'),
          },
        },
      };

      const result = await service.calculateCompatibilityScore(
        noMatchProfile,
        'depression-support'
      );

      expect(result.compatibilityScore).toBe(0);
      expect(result.matchingFactors).toEqual([]);
    });

    it('should apply specificity bonus for targeted communities', async () => {
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);

      const result = await service.calculateCompatibilityScore(
        mockUserAssessmentProfile,
        'depression-support'
      );

      // Depression-support is a specific community for PHQ-9, should get bonus
      expect(result.compatibilityScore).toBeGreaterThan(0.7);
    });

    it('should apply general community penalty', async () => {
      prismaService.community.findUnique.mockResolvedValue(mockGeneralCommunity);

      const result = await service.calculateCompatibilityScore(
        mockUserAssessmentProfile,
        'general-support'
      );

      // General communities get penalty
      expect(result.assessmentContributions.phq9.contribution).toBeLessThan(
        0.8 * 1.0 * 0.8 // weight * severity * full specificity
      );
    });

    it('should handle multiple assessment contributions correctly', async () => {
      prismaService.community.findUnique.mockResolvedValue(mockAnxietyCommunity);

      const multiAssessmentProfile = {
        userId: 'user-123',
        assessments: {
          gad7: {
            score: 15,
            severity: 'severe',
            date: new Date('2024-01-01'),
          },
          phq9: {
            score: 10,
            severity: 'moderate',
            date: new Date('2024-01-01'),
          },
        },
      };

      const result = await service.calculateCompatibilityScore(
        multiAssessmentProfile,
        'anxiety-warriors'
      );

      expect(result.matchingFactors).toContain('GAD7 (severe)');
      expect(result.assessmentContributions).toHaveProperty('gad7');
      expect(result.assessmentContributions.gad7.score).toBe(15);
    });
  });

  describe('getSeverityMultiplier', () => {
    it('should return correct multipliers for PHQ-9 scores', () => {
      const getSeverityMultiplier = (service as any).getSeverityMultiplier.bind(service);

      expect(getSeverityMultiplier('phq9', 2)).toBe(0.3); // Minimal
      expect(getSeverityMultiplier('phq9', 7)).toBe(0.6); // Mild
      expect(getSeverityMultiplier('phq9', 12)).toBe(0.9); // Moderate
      expect(getSeverityMultiplier('phq9', 17)).toBe(1.0); // Moderately severe
      expect(getSeverityMultiplier('phq9', 25)).toBe(1.0); // Severe
    });

    it('should return correct multipliers for GAD-7 scores', () => {
      const getSeverityMultiplier = (service as any).getSeverityMultiplier.bind(service);

      expect(getSeverityMultiplier('gad7', 3)).toBe(0.3); // Minimal
      expect(getSeverityMultiplier('gad7', 8)).toBe(0.6); // Mild
      expect(getSeverityMultiplier('gad7', 13)).toBe(0.9); // Moderate
      expect(getSeverityMultiplier('gad7', 18)).toBe(1.0); // Severe
    });

    it('should return correct multipliers for PTSD-5 scores', () => {
      const getSeverityMultiplier = (service as any).getSeverityMultiplier.bind(service);

      expect(getSeverityMultiplier('ptsd5', 1)).toBe(0.3); // Minimal
      expect(getSeverityMultiplier('ptsd5', 5)).toBe(0.6); // Mild
      expect(getSeverityMultiplier('ptsd5', 12)).toBe(0.9); // Moderate
      expect(getSeverityMultiplier('ptsd5', 18)).toBe(1.0); // Severe
    });

    it('should return default multiplier for unknown assessment types', () => {
      const getSeverityMultiplier = (service as any).getSeverityMultiplier.bind(service);

      expect(getSeverityMultiplier('unknown-assessment', 15)).toBe(0.5);
    });
  });

  describe('getCommunitySpecificityBonus', () => {
    it('should return bonus for specific community matches', () => {
      const getCommunitySpecificityBonus = (service as any).getCommunitySpecificityBonus.bind(service);

      expect(getCommunitySpecificityBonus('depression-support', 'phq9')).toBe(1.2);
      expect(getCommunitySpecificityBonus('anxiety-support', 'gad7')).toBe(1.2);
      expect(getCommunitySpecificityBonus('ptsd-support', 'ptsd5')).toBe(1.2);
      expect(getCommunitySpecificityBonus('trauma-recovery', 'ptsd5')).toBe(1.2);
      expect(getCommunitySpecificityBonus('panic-disorder', 'gad7')).toBe(1.2);
      expect(getCommunitySpecificityBonus('social-anxiety', 'gad7')).toBe(1.2);
    });

    it('should return penalty for general communities', () => {
      const getCommunitySpecificityBonus = (service as any).getCommunitySpecificityBonus.bind(service);

      expect(getCommunitySpecificityBonus('general-support', 'phq9')).toBe(0.8);
      expect(getCommunitySpecificityBonus('mental-wellness', 'gad7')).toBe(0.8);
      expect(getCommunitySpecificityBonus('therapy-discussion', 'ptsd5')).toBe(0.8);
    });

    it('should return neutral multiplier for other communities', () => {
      const getCommunitySpecificityBonus = (service as any).getCommunitySpecificityBonus.bind(service);

      expect(getCommunitySpecificityBonus('other-community', 'phq9')).toBe(1.0);
    });
  });

  describe('generateReasoningText', () => {
    it('should generate appropriate text for high compatibility', () => {
      const generateReasoningText = (service as any).generateReasoningText.bind(service);

      const reasoning = generateReasoningText(
        'Depression Support Network',
        ['PHQ9 (moderately severe)'],
        0.85,
        { phq9: { score: 15, weight: 0.8, contribution: 0.68 } }
      );

      expect(reasoning).toContain('85% compatibility');
      expect(reasoning).toContain('Depression Support Network');
      expect(reasoning).toContain('PHQ9 (moderately severe)');
      expect(reasoning).toContain('excellent match');
    });

    it('should generate appropriate text for moderate compatibility', () => {
      const generateReasoningText = (service as any).generateReasoningText.bind(service);

      const reasoning = generateReasoningText(
        'General Support',
        ['PHQ9 (mild)'],
        0.65,
        { phq9: { score: 8, weight: 0.8, contribution: 0.52 } }
      );

      expect(reasoning).toContain('65% compatibility');
      expect(reasoning).toContain('good fit');
    });

    it('should generate appropriate text for low compatibility', () => {
      const generateReasoningText = (service as any).generateReasoningText.bind(service);

      const reasoning = generateReasoningText(
        'Specific Community',
        ['GAD7 (minimal)'],
        0.35,
        { gad7: { score: 3, weight: 0.7, contribution: 0.21 } }
      );

      expect(reasoning).toContain('35% compatibility');
      expect(reasoning).toContain('some relevant support');
    });

    it('should generate appropriate text for very low compatibility', () => {
      const generateReasoningText = (service as any).generateReasoningText.bind(service);

      const reasoning = generateReasoningText(
        'Unrelated Community',
        [],
        0.15,
        {}
      );

      expect(reasoning).toContain('15% compatibility');
      expect(reasoning).toContain('other communities that are more specifically aligned');
    });

    it('should handle empty matching factors', () => {
      const generateReasoningText = (service as any).generateReasoningText.bind(service);

      const reasoning = generateReasoningText(
        'Community Name',
        [],
        0.5,
        {}
      );

      expect(reasoning).not.toContain('This recommendation is based on your');
      expect(reasoning).toContain('50% compatibility');
    });
  });

  describe('getRecommendationsForUser', () => {
    beforeEach(() => {
      prismaService.preAssessment.findUnique.mockResolvedValue(mockPreAssessment);
      prismaService.community.findMany.mockResolvedValue([
        { slug: 'depression-support', name: 'Depression Support Network' },
        { slug: 'anxiety-warriors', name: 'Anxiety Warriors' },
        { slug: 'ptsd-support', name: 'PTSD Support Network' },
        { slug: 'general-support', name: 'General Support' },
      ]);
      prismaService.community.findUnique.mockImplementation((args) => {
        const slug = args.where.slug;
        if (slug === 'depression-support') return Promise.resolve(mockCommunity);
        if (slug === 'anxiety-warriors') return Promise.resolve(mockAnxietyCommunity);
        if (slug === 'ptsd-support') return Promise.resolve(mockPTSDCommunity);
        if (slug === 'general-support') return Promise.resolve(mockGeneralCommunity);
        return Promise.resolve(null);
      });
    });

    it('should return sorted recommendations for user', async () => {
      const result = await service.getRecommendationsForUser('user-123');

      expect(prismaService.preAssessment.findUnique).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
        select: {
          scores: true,
          severityLevels: true,
          createdAt: true,
        },
      });

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        select: { slug: true, name: true },
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);

      // Should be sorted by compatibility score (highest first)
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].compatibilityScore).toBeGreaterThanOrEqual(result[i].compatibilityScore);
      }

      // Should only include communities with >20% compatibility
      result.forEach(recommendation => {
        expect(recommendation.compatibilityScore).toBeGreaterThan(0.2);
      });
    });

    it('should return empty array when no assessment data exists', async () => {
      prismaService.preAssessment.findUnique.mockResolvedValue(null);

      const result = await service.getRecommendationsForUser('user-123');

      expect(result).toEqual([]);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('No assessment data found for user user-123')
      );
    });

    it('should return empty array when assessment has no scores', async () => {
      const emptyAssessment = {
        ...mockPreAssessment,
        scores: {},
        severityLevels: {},
      };
      prismaService.preAssessment.findUnique.mockResolvedValue(emptyAssessment);

      const result = await service.getRecommendationsForUser('user-123');

      expect(result).toEqual([]);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('No assessment data found for user user-123')
      );
    });

    it('should filter out low compatibility recommendations', async () => {
      // Mock very low scores that would result in low compatibility
      const lowScoreAssessment = {
        ...mockPreAssessment,
        scores: {
          phq9Score: 1, // Minimal depression
          gad7Score: 1, // Minimal anxiety
        },
        severityLevels: {
          phq9: 'minimal',
          gad7: 'minimal',
        },
      };
      prismaService.preAssessment.findUnique.mockResolvedValue(lowScoreAssessment);

      const result = await service.getRecommendationsForUser('user-123');

      // Should filter out recommendations with <20% compatibility
      result.forEach(recommendation => {
        expect(recommendation.compatibilityScore).toBeGreaterThan(0.2);
      });
    });

    it('should limit results to top 10 recommendations', async () => {
      // Mock many communities
      const manyCommunities = Array.from({ length: 15 }, (_, i) => ({
        slug: `community-${i}`,
        name: `Community ${i}`,
      }));
      prismaService.community.findMany.mockResolvedValue(manyCommunities);
      
      // Mock all communities as found
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);

      const result = await service.getRecommendationsForUser('user-123');

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should handle errors for individual community calculations gracefully', async () => {
      prismaService.community.findUnique.mockImplementation((args) => {
        if (args.where.slug === 'depression-support') return Promise.resolve(mockCommunity);
        if (args.where.slug === 'anxiety-warriors') return Promise.reject(new Error('Database error'));
        return Promise.resolve(mockGeneralCommunity);
      });

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      const result = await service.getRecommendationsForUser('user-123');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error calculating compatibility for anxiety-warriors'),
        expect.any(Error)
      );

      // Should still return other successful recommendations
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle database errors during user profile retrieval', async () => {
      prismaService.preAssessment.findUnique.mockRejectedValue(new Error('Database error'));

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await expect(service.getRecommendationsForUser('user-123')).rejects.toThrow('Database error');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error getting recommendations for user user-123'),
        expect.any(Error)
      );
    });
  });

  describe('getUserAssessmentProfile', () => {
    beforeEach(() => {
      prismaService.preAssessment.findUnique.mockResolvedValue(mockPreAssessment);
    });

    it('should map PHQ-9 scores correctly', async () => {
      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);

      const result = await getUserAssessmentProfile('user-123');

      expect(result).toEqual({
        userId: 'user-123',
        assessments: expect.objectContaining({
          phq9: expect.objectContaining({
            score: 15,
            severity: 'moderately severe',
            date: expect.any(Date),
          }),
        }),
      });
    });

    it('should map GAD-7 scores correctly', async () => {
      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);

      const result = await getUserAssessmentProfile('user-123');

      expect(result.assessments).toHaveProperty('gad7');
      expect(result.assessments.gad7.score).toBe(12);
      expect(result.assessments.gad7.severity).toBe('moderate');
    });

    it('should map PTSD-5 scores correctly', async () => {
      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);

      const result = await getUserAssessmentProfile('user-123');

      expect(result.assessments).toHaveProperty('ptsd5');
      expect(result.assessments.ptsd5.score).toBe(8);
      expect(result.assessments.ptsd5.severity).toBe('moderate');
    });

    it('should return null when no pre-assessment exists', async () => {
      prismaService.preAssessment.findUnique.mockResolvedValue(null);

      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);
      const result = await getUserAssessmentProfile('user-123');

      expect(result).toBeNull();
    });

    it('should handle missing score fields gracefully', async () => {
      const incompleteAssessment = {
        ...mockPreAssessment,
        scores: {
          phq9Score: 15,
          // Missing gad7Score and ptsd5Score
        },
      };
      prismaService.preAssessment.findUnique.mockResolvedValue(incompleteAssessment);

      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);
      const result = await getUserAssessmentProfile('user-123');

      expect(result.assessments).toHaveProperty('phq9');
      expect(result.assessments).not.toHaveProperty('gad7');
      expect(result.assessments).not.toHaveProperty('ptsd5');
    });

    it('should handle null/undefined scores', async () => {
      const nullScoresAssessment = {
        ...mockPreAssessment,
        scores: {
          phq9Score: null,
          gad7Score: undefined,
          ptsd5Score: 0, // Valid zero score
        },
      };
      prismaService.preAssessment.findUnique.mockResolvedValue(nullScoresAssessment);

      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);
      const result = await getUserAssessmentProfile('user-123');

      expect(result.assessments).not.toHaveProperty('phq9');
      expect(result.assessments).not.toHaveProperty('gad7');
      expect(result.assessments).toHaveProperty('ptsd5'); // Zero is valid
    });

    it('should handle database errors', async () => {
      prismaService.preAssessment.findUnique.mockRejectedValue(new Error('Database error'));

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);

      const result = await getUserAssessmentProfile('user-123');

      expect(result).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error getting assessment profile for user user-123'),
        expect.any(Error)
      );
    });
  });

  describe('severity assessment helpers', () => {
    describe('getDepressionSeverity', () => {
      it('should return correct severity levels for PHQ-9 scores', () => {
        const getDepressionSeverity = (service as any).getDepressionSeverity.bind(service);

        expect(getDepressionSeverity(2)).toBe('minimal');
        expect(getDepressionSeverity(4)).toBe('minimal');
        expect(getDepressionSeverity(7)).toBe('mild');
        expect(getDepressionSeverity(9)).toBe('mild');
        expect(getDepressionSeverity(12)).toBe('moderate');
        expect(getDepressionSeverity(14)).toBe('moderate');
        expect(getDepressionSeverity(17)).toBe('moderately severe');
        expect(getDepressionSeverity(19)).toBe('moderately severe');
        expect(getDepressionSeverity(25)).toBe('severe');
      });
    });

    describe('getAnxietySeverity', () => {
      it('should return correct severity levels for GAD-7 scores', () => {
        const getAnxietySeverity = (service as any).getAnxietySeverity.bind(service);

        expect(getAnxietySeverity(3)).toBe('minimal');
        expect(getAnxietySeverity(4)).toBe('minimal');
        expect(getAnxietySeverity(7)).toBe('mild');
        expect(getAnxietySeverity(9)).toBe('mild');
        expect(getAnxietySeverity(12)).toBe('moderate');
        expect(getAnxietySeverity(14)).toBe('moderate');
        expect(getAnxietySeverity(18)).toBe('severe');
        expect(getAnxietySeverity(21)).toBe('severe');
      });
    });

    describe('getPTSDSeverity', () => {
      it('should return correct severity levels for PTSD-5 scores', () => {
        const getPTSDSeverity = (service as any).getPTSDSeverity.bind(service);

        expect(getPTSDSeverity(1)).toBe('minimal');
        expect(getPTSDSeverity(2)).toBe('minimal');
        expect(getPTSDSeverity(5)).toBe('mild');
        expect(getPTSDSeverity(7)).toBe('mild');
        expect(getPTSDSeverity(12)).toBe('moderate');
        expect(getPTSDSeverity(14)).toBe('moderate');
        expect(getPTSDSeverity(18)).toBe('severe');
        expect(getPTSDSeverity(20)).toBe('severe');
      });
    });
  });

  describe('handleAssessmentChange', () => {
    beforeEach(() => {
      prismaService.preAssessment.findUnique.mockResolvedValue(mockPreAssessment);
      prismaService.community.findMany.mockResolvedValue([
        { slug: 'depression-support', name: 'Depression Support Network' },
        { slug: 'anxiety-warriors', name: 'Anxiety Warriors' },
      ]);
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);
    });

    it('should handle assessment change and generate new recommendations', async () => {
      await service.handleAssessmentChange('user-123', 'phq9');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Assessment change detected for user user-123: phq9'
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generated')
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('new recommendations for user user-123')
      );
    });

    it('should handle errors during recommendation generation', async () => {
      prismaService.preAssessment.findUnique.mockRejectedValue(new Error('Database error'));

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await service.handleAssessmentChange('user-123', 'gad7');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error handling assessment change for user user-123'),
        expect.any(Error)
      );
    });

    it('should log when no new recommendations are generated', async () => {
      prismaService.preAssessment.findUnique.mockResolvedValue(null); // No assessment

      await service.handleAssessmentChange('user-123', 'ptsd5');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Generated 0 new recommendations for user user-123'
      );
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty community list', async () => {
      prismaService.preAssessment.findUnique.mockResolvedValue(mockPreAssessment);
      prismaService.community.findMany.mockResolvedValue([]);

      const result = await service.getRecommendationsForUser('user-123');

      expect(result).toEqual([]);
    });

    it('should handle malformed assessment scores', async () => {
      const malformedAssessment = {
        ...mockPreAssessment,
        scores: 'invalid-scores', // Should be object
        severityLevels: null,
      };
      prismaService.preAssessment.findUnique.mockResolvedValue(malformedAssessment);

      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);
      const result = await getUserAssessmentProfile('user-123');

      expect(result.assessments).toEqual({});
    });

    it('should handle very high scores correctly', async () => {
      const highScoreAssessment = {
        ...mockPreAssessment,
        scores: {
          phq9Score: 50, // Beyond normal range
          gad7Score: 100,
          ptsd5Score: 200,
        },
      };
      prismaService.preAssessment.findUnique.mockResolvedValue(highScoreAssessment);

      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);
      const result = await getUserAssessmentProfile('user-123');

      expect(result.assessments.phq9.severity).toBe('severe');
      expect(result.assessments.gad7.severity).toBe('severe');
      expect(result.assessments.ptsd5.severity).toBe('severe');
    });

    it('should handle negative scores correctly', async () => {
      const negativeScoreAssessment = {
        ...mockPreAssessment,
        scores: {
          phq9Score: -5, // Invalid negative score
          gad7Score: -1,
          ptsd5Score: -10,
        },
      };
      prismaService.preAssessment.findUnique.mockResolvedValue(negativeScoreAssessment);

      const getUserAssessmentProfile = (service as any).getUserAssessmentProfile.bind(service);
      const result = await getUserAssessmentProfile('user-123');

      // Should still process negative scores (might be data error)
      expect(result.assessments.phq9.severity).toBe('minimal'); // Negative treated as minimal
      expect(result.assessments.gad7.severity).toBe('minimal');
      expect(result.assessments.ptsd5.severity).toBe('minimal');
    });

    it('should handle concurrent assessment changes', async () => {
      prismaService.preAssessment.findUnique.mockResolvedValue(mockPreAssessment);
      prismaService.community.findMany.mockResolvedValue([
        { slug: 'depression-support', name: 'Depression Support Network' },
      ]);
      prismaService.community.findUnique.mockResolvedValue(mockCommunity);

      // Simulate concurrent changes
      const promises = [
        service.handleAssessmentChange('user-123', 'phq9'),
        service.handleAssessmentChange('user-123', 'gad7'),
        service.handleAssessmentChange('user-123', 'ptsd5'),
      ];

      await Promise.all(promises);

      // Should handle all changes without errors
      expect(loggerSpy).toHaveBeenCalledTimes(6); // 2 logs per change * 3 changes
    });

    it('should handle assessment community mapping edge cases', () => {
      const getAssessmentCommunityMappings = (service as any).getAssessmentCommunityMappings.bind(service);
      const mappings = getAssessmentCommunityMappings();

      // Verify all mappings have required properties
      Object.values(mappings).forEach((mapping: any) => {
        expect(mapping).toHaveProperty('score');
        expect(mapping).toHaveProperty('communities');
        expect(mapping).toHaveProperty('weight');
        expect(Array.isArray(mapping.communities)).toBe(true);
        expect(typeof mapping.weight).toBe('number');
        expect(mapping.weight).toBeGreaterThan(0);
        expect(mapping.weight).toBeLessThanOrEqual(1);
      });
    });

    it('should normalize compatibility scores to 0-1 range', async () => {
      // Test with very high contributions that might exceed 1.0
      const highContributionProfile = {
        userId: 'user-123',
        assessments: {
          phq9: {
            score: 27, // Maximum PHQ-9 score
            severity: 'severe',
            date: new Date('2024-01-01'),
          },
          gad7: {
            score: 21, // Maximum GAD-7 score
            severity: 'severe',
            date: new Date('2024-01-01'),
          },
          ptsd5: {
            score: 20, // Maximum PTSD-5 score
            severity: 'severe',
            date: new Date('2024-01-01'),
          },
        },
      };

      prismaService.community.findUnique.mockResolvedValue(mockCommunity);

      const result = await service.calculateCompatibilityScore(
        highContributionProfile,
        'depression-support'
      );

      expect(result.compatibilityScore).toBeLessThanOrEqual(1.0);
      expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    });
  });
});