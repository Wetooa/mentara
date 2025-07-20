import { Test, TestingModule } from '@nestjs/testing';
import { MatchingAnalyticsService } from './matching-analytics.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TherapistScore } from './advanced-matching.service';
import { CompatibilityAnalysis } from './compatibility-analysis.service';

describe('MatchingAnalyticsService', () => {
  let service: MatchingAnalyticsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockTherapistScore: TherapistScore = {
    therapist: {
      id: 'therapist-123',
      userId: 'therapist-user-123',
      status: 'approved',
      mobile: '+1234567890',
      province: 'Metro Manila',
      providerType: 'Licensed Psychologist',
      professionalLicenseType: 'Clinical Psychology',
      isPRCLicensed: 'Yes',
      prcLicenseNumber: 'PRC123456',
      expirationDateOfLicense: new Date('2025-12-31'),
      practiceStartDate: new Date('2015-01-01'),
      sessionLength: '60 minutes',
      hourlyRate: 1800,
      providedOnlineTherapyBefore: true,
      comfortableUsingVideoConferencing: true,
      compliesWithDataPrivacyAct: true,
      willingToAbideByPlatformGuidelines: true,
      expertise: ['Depression', 'Anxiety', 'Trauma'],
      illnessSpecializations: ['PTSD', 'Panic Disorder'],
      approaches: ['Cognitive Behavioral Therapy (CBT)'],
      therapeuticApproachesUsedList: ['Mindfulness-Based Cognitive Therapy (MBCT)'],
      treatmentSuccessRates: {
        'Depression': 85,
        'Anxiety': 90,
        'PTSD': 78,
      },
      yearsOfExperience: 8,
      languagesOffered: ['English', 'Filipino'],
      acceptsInsurance: true,
      acceptedInsuranceTypes: ['PhilHealth', 'HMO'],
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        avatarUrl: 'https://example.com/therapist-avatar.jpg',
      },
      reviews: [
        {
          rating: 5,
          status: 'APPROVED',
        },
        {
          rating: 4,
          status: 'APPROVED',
        },
      ],
    },
    totalScore: 85,
    breakdown: {
      conditionScore: 80,
      approachScore: 85,
      experienceScore: 90,
      reviewScore: 88,
      logisticsScore: 92,
    },
    matchExplanation: {
      primaryMatches: ['Depression', 'Anxiety'],
      secondaryMatches: ['PTSD'],
      approachMatches: ['CBT'],
      experienceYears: 8,
      averageRating: 4.5,
      totalReviews: 2,
      successRates: {
        'Depression': 85,
        'Anxiety': 90,
      },
    },
  };

  const mockCompatibilityAnalysis: CompatibilityAnalysis = {
    personalityCompatibility: {
      communicationStyle: 85,
      personalityMatch: 80,
      culturalCompatibility: 90,
      overallCompatibility: 85,
    },
    sessionCompatibility: {
      formatMatch: 90,
      durationMatch: 85,
      frequencyMatch: 80,
      schedulingCompatibility: 88,
      overallCompatibility: 86,
    },
    demographicCompatibility: {
      ageCompatibility: 75,
      genderCompatibility: 80,
      languageCompatibility: 95,
      culturalCompatibility: 88,
      overallCompatibility: 85,
    },
    overallCompatibilityScore: 85,
    compatibilityFactors: {
      strengths: ['Excellent communication style match', 'Strong personality compatibility'],
      concerns: ['Minor age preference difference'],
      recommendations: ['Consider discussing communication preferences in initial session'],
    },
  };

  const mockMatchHistory = [
    {
      id: 'match-1',
      clientId: 'client-123',
      therapistId: 'therapist-user-123',
      totalScore: 85,
      conditionScore: 80,
      approachScore: 85,
      experienceScore: 90,
      reviewScore: 88,
      logisticsScore: 92,
      primaryMatches: ['Depression', 'Anxiety'],
      secondaryMatches: ['PTSD'],
      approachMatches: ['CBT'],
      recommendationRank: 1,
      totalRecommendations: 3,
      recommendationAlgorithm: 'advanced_v1.0',
      wasViewed: true,
      wasContacted: false,
      becameClient: true,
      clientSatisfactionScore: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'match-2',
      clientId: 'client-123',
      therapistId: 'therapist-user-456',
      totalScore: 78,
      conditionScore: 75,
      approachScore: 80,
      experienceScore: 85,
      reviewScore: 82,
      logisticsScore: 88,
      primaryMatches: ['Depression'],
      secondaryMatches: ['Anxiety'],
      approachMatches: ['CBT'],
      recommendationRank: 2,
      totalRecommendations: 3,
      recommendationAlgorithm: 'advanced_v1.0',
      wasViewed: false,
      wasContacted: false,
      becameClient: false,
      clientSatisfactionScore: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockFeedback = [
    {
      id: 'feedback-1',
      clientId: 'client-123',
      therapistId: 'therapist-user-123',
      matchHistoryId: 'match-1',
      relevanceScore: 4.5,
      accuracyScore: 4.0,
      helpfulnessScore: 4.8,
      overallSatisfaction: 4.4,
      feedbackText: 'Great recommendation!',
      selectedTherapist: true,
      reasonNotSelected: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingAnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            matchHistory: {
              createMany: jest.fn(),
              updateMany: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              groupBy: jest.fn(),
            },
            clientCompatibility: {
              upsert: jest.fn(),
            },
            recommendationFeedback: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            algorithmPerformance: {
              create: jest.fn(),
            },
            therapist: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MatchingAnalyticsService>(MatchingAnalyticsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackRecommendation', () => {
    it('should track multiple therapist recommendations successfully', async () => {
      const therapistScores = [mockTherapistScore];
      prismaService.matchHistory.createMany.mockResolvedValue({
        count: 1,
        skipDuplicates: true,
      });

      await service.trackRecommendation('client-123', therapistScores, 'advanced_v1.0');

      expect(prismaService.matchHistory.createMany).toHaveBeenCalledWith({
        data: [
          {
            clientId: 'client-123',
            therapistId: 'therapist-user-123',
            totalScore: 85,
            conditionScore: 80,
            approachScore: 85,
            experienceScore: 90,
            reviewScore: 88,
            logisticsScore: 92,
            primaryMatches: ['Depression', 'Anxiety'],
            secondaryMatches: ['PTSD'],
            approachMatches: ['CBT'],
            recommendationRank: 1,
            totalRecommendations: 1,
            recommendationAlgorithm: 'advanced_v1.0',
          },
        ],
        skipDuplicates: true,
      });
    });

    it('should use default algorithm version when not provided', async () => {
      const therapistScores = [mockTherapistScore];
      prismaService.matchHistory.createMany.mockResolvedValue({
        count: 1,
        skipDuplicates: true,
      });

      await service.trackRecommendation('client-123', therapistScores);

      expect(prismaService.matchHistory.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            recommendationAlgorithm: 'advanced_v1.0',
          }),
        ]),
        skipDuplicates: true,
      });
    });

    it('should handle database errors gracefully', async () => {
      const therapistScores = [mockTherapistScore];
      prismaService.matchHistory.createMany.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(service.trackRecommendation('client-123', therapistScores)).resolves.not.toThrow();
    });

    it('should track recommendation rank correctly for multiple therapists', async () => {
      const therapistScores = [mockTherapistScore, mockTherapistScore];
      prismaService.matchHistory.createMany.mockResolvedValue({
        count: 2,
        skipDuplicates: true,
      });

      await service.trackRecommendation('client-123', therapistScores);

      expect(prismaService.matchHistory.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            recommendationRank: 1,
            totalRecommendations: 2,
          }),
          expect.objectContaining({
            recommendationRank: 2,
            totalRecommendations: 2,
          }),
        ],
        skipDuplicates: true,
      });
    });
  });

  describe('trackCompatibilityAnalysis', () => {
    it('should track compatibility analysis successfully', async () => {
      prismaService.clientCompatibility.upsert.mockResolvedValue({
        id: 'compatibility-1',
        clientId: 'client-123',
        therapistId: 'therapist-user-123',
        personalityCompatibility: 85,
        sessionCompatibility: 86,
        demographicCompatibility: 85,
        overallCompatibility: 85,
      });

      await service.trackCompatibilityAnalysis(
        'client-123',
        'therapist-user-123',
        mockCompatibilityAnalysis,
        '1.0',
      );

      expect(prismaService.clientCompatibility.upsert).toHaveBeenCalledWith({
        where: {
          clientId_therapistId: {
            clientId: 'client-123',
            therapistId: 'therapist-user-123',
          },
        },
        update: expect.objectContaining({
          personalityCompatibility: 85,
          sessionCompatibility: 86,
          demographicCompatibility: 85,
          overallCompatibility: 85,
          communicationStyleScore: 85,
          personalityMatchScore: 80,
          culturalCompatibilityScore: 90,
          formatMatchScore: 90,
          durationMatchScore: 85,
          frequencyMatchScore: 80,
          schedulingCompatibilityScore: 88,
          ageCompatibilityScore: 75,
          genderCompatibilityScore: 80,
          languageCompatibilityScore: 95,
          strengths: ['Excellent communication style match', 'Strong personality compatibility'],
          concerns: ['Minor age preference difference'],
          recommendations: ['Consider discussing communication preferences in initial session'],
          analysisVersion: '1.0',
        }),
        create: expect.objectContaining({
          clientId: 'client-123',
          therapistId: 'therapist-user-123',
          personalityCompatibility: 85,
          sessionCompatibility: 86,
          demographicCompatibility: 85,
          overallCompatibility: 85,
          analysisVersion: '1.0',
        }),
      });
    });

    it('should use default analysis version when not provided', async () => {
      prismaService.clientCompatibility.upsert.mockResolvedValue({});

      await service.trackCompatibilityAnalysis(
        'client-123',
        'therapist-user-123',
        mockCompatibilityAnalysis,
      );

      expect(prismaService.clientCompatibility.upsert).toHaveBeenCalledWith({
        where: expect.any(Object),
        update: expect.objectContaining({
          analysisVersion: '1.0',
        }),
        create: expect.objectContaining({
          analysisVersion: '1.0',
        }),
      });
    });

    it('should handle database errors gracefully', async () => {
      prismaService.clientCompatibility.upsert.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(
        service.trackCompatibilityAnalysis(
          'client-123',
          'therapist-user-123',
          mockCompatibilityAnalysis,
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('trackRecommendationView', () => {
    it('should track recommendation view successfully', async () => {
      prismaService.matchHistory.updateMany.mockResolvedValue({ count: 1 });

      await service.trackRecommendationView('client-123', 'therapist-user-123');

      expect(prismaService.matchHistory.updateMany).toHaveBeenCalledWith({
        where: {
          clientId: 'client-123',
          therapistId: 'therapist-user-123',
          wasViewed: false,
        },
        data: {
          wasViewed: true,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      prismaService.matchHistory.updateMany.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(
        service.trackRecommendationView('client-123', 'therapist-user-123'),
      ).resolves.not.toThrow();
    });
  });

  describe('trackTherapistContact', () => {
    it('should track therapist contact successfully', async () => {
      prismaService.matchHistory.updateMany.mockResolvedValue({ count: 1 });

      await service.trackTherapistContact('client-123', 'therapist-user-123');

      expect(prismaService.matchHistory.updateMany).toHaveBeenCalledWith({
        where: {
          clientId: 'client-123',
          therapistId: 'therapist-user-123',
          wasContacted: false,
        },
        data: {
          wasContacted: true,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      prismaService.matchHistory.updateMany.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(
        service.trackTherapistContact('client-123', 'therapist-user-123'),
      ).resolves.not.toThrow();
    });
  });

  describe('trackSuccessfulMatch', () => {
    it('should track successful match successfully', async () => {
      prismaService.matchHistory.updateMany.mockResolvedValue({ count: 1 });

      await service.trackSuccessfulMatch('client-123', 'therapist-user-123');

      expect(prismaService.matchHistory.updateMany).toHaveBeenCalledWith({
        where: {
          clientId: 'client-123',
          therapistId: 'therapist-user-123',
          becameClient: false,
        },
        data: {
          becameClient: true,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      prismaService.matchHistory.updateMany.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(
        service.trackSuccessfulMatch('client-123', 'therapist-user-123'),
      ).resolves.not.toThrow();
    });
  });

  describe('recordRecommendationFeedback', () => {
    it('should record feedback successfully', async () => {
      const feedback = {
        relevanceScore: 4.5,
        accuracyScore: 4.0,
        helpfulnessScore: 4.8,
        feedbackText: 'Great recommendation!',
        selectedTherapist: true,
        reasonNotSelected: null,
      };

      prismaService.matchHistory.findFirst.mockResolvedValue(mockMatchHistory[0]);
      prismaService.recommendationFeedback.create.mockResolvedValue({
        id: 'feedback-1',
        ...feedback,
      });

      await service.recordRecommendationFeedback('client-123', 'therapist-user-123', feedback);

      expect(prismaService.matchHistory.findFirst).toHaveBeenCalledWith({
        where: { clientId: 'client-123', therapistId: 'therapist-user-123' },
        orderBy: { createdAt: 'desc' },
      });

      expect(prismaService.recommendationFeedback.create).toHaveBeenCalledWith({
        data: {
          clientId: 'client-123',
          therapistId: 'therapist-user-123',
          matchHistoryId: 'match-1',
          relevanceScore: 4.5,
          accuracyScore: 4.0,
          helpfulnessScore: 4.8,
          feedbackText: 'Great recommendation!',
          selectedTherapist: true,
          reasonNotSelected: null,
        },
      });
    });

    it('should handle feedback without matching history', async () => {
      const feedback = {
        relevanceScore: 4.5,
        accuracyScore: 4.0,
        helpfulnessScore: 4.8,
      };

      prismaService.matchHistory.findFirst.mockResolvedValue(null);
      prismaService.recommendationFeedback.create.mockResolvedValue({
        id: 'feedback-1',
        ...feedback,
      });

      await service.recordRecommendationFeedback('client-123', 'therapist-user-123', feedback);

      expect(prismaService.recommendationFeedback.create).toHaveBeenCalledWith({
        data: {
          clientId: 'client-123',
          therapistId: 'therapist-user-123',
          matchHistoryId: null,
          relevanceScore: 4.5,
          accuracyScore: 4.0,
          helpfulnessScore: 4.8,
          feedbackText: undefined,
          selectedTherapist: false,
          reasonNotSelected: undefined,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const feedback = {
        relevanceScore: 4.5,
        accuracyScore: 4.0,
        helpfulnessScore: 4.8,
      };

      prismaService.matchHistory.findFirst.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(
        service.recordRecommendationFeedback('client-123', 'therapist-user-123', feedback),
      ).resolves.not.toThrow();
    });
  });

  describe('getAlgorithmPerformance', () => {
    it('should calculate algorithm performance metrics correctly', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      prismaService.matchHistory.findMany.mockResolvedValue(mockMatchHistory);
      prismaService.recommendationFeedback.findMany.mockResolvedValue(mockFeedback);

      const result = await service.getAlgorithmPerformance('advanced_v1.0', startDate, endDate);

      expect(result).toEqual({
        totalRecommendations: 2,
        successfulMatches: 1,
        averageMatchScore: 81.5, // (85 + 78) / 2
        averageSatisfactionScore: 4.4,
        clickThroughRate: 50, // 1 viewed out of 2 recommendations
        conversionRate: 50, // 1 successful match out of 2 recommendations
        retentionRate: 0, // Placeholder
      });

      expect(prismaService.matchHistory.findMany).toHaveBeenCalledWith({
        where: {
          recommendationAlgorithm: 'advanced_v1.0',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      expect(prismaService.recommendationFeedback.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          overallSatisfaction: {
            not: null,
          },
        },
      });
    });

    it('should handle empty data gracefully', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      prismaService.matchHistory.findMany.mockResolvedValue([]);
      prismaService.recommendationFeedback.findMany.mockResolvedValue([]);

      const result = await service.getAlgorithmPerformance('advanced_v1.0', startDate, endDate);

      expect(result).toEqual({
        totalRecommendations: 0,
        successfulMatches: 0,
        averageMatchScore: 0,
        averageSatisfactionScore: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        retentionRate: 0,
      });
    });

    it('should handle database errors by throwing', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      prismaService.matchHistory.findMany.mockRejectedValue(new Error('Database error'));

      await expect(
        service.getAlgorithmPerformance('advanced_v1.0', startDate, endDate),
      ).rejects.toThrow('Database error');
    });
  });

  describe('storePerformanceSnapshot', () => {
    it('should store performance snapshot successfully', async () => {
      const metrics = {
        totalRecommendations: 100,
        successfulMatches: 25,
        averageMatchScore: 82.5,
        averageSatisfactionScore: 4.2,
        clickThroughRate: 75,
        conversionRate: 25,
        retentionRate: 80,
      };

      const periodStart = new Date('2023-01-01');
      const periodEnd = new Date('2023-01-31');

      prismaService.algorithmPerformance.create.mockResolvedValue({
        id: 'performance-1',
        algorithmName: 'advanced_v1.0',
        version: '1.0',
        ...metrics,
        periodStart,
        periodEnd,
      });

      await service.storePerformanceSnapshot('advanced_v1.0', '1.0', metrics, periodStart, periodEnd);

      expect(prismaService.algorithmPerformance.create).toHaveBeenCalledWith({
        data: {
          algorithmName: 'advanced_v1.0',
          version: '1.0',
          totalRecommendations: 100,
          successfulMatches: 25,
          averageMatchScore: 82.5,
          averageSatisfactionScore: 4.2,
          clickThroughRate: 75,
          conversionRate: 25,
          retentionRate: 80,
          periodStart,
          periodEnd,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const metrics = {
        totalRecommendations: 100,
        successfulMatches: 25,
        averageMatchScore: 82.5,
        averageSatisfactionScore: 4.2,
        clickThroughRate: 75,
        conversionRate: 25,
        retentionRate: 80,
      };

      prismaService.algorithmPerformance.create.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(
        service.storePerformanceSnapshot('advanced_v1.0', '1.0', metrics, new Date(), new Date()),
      ).resolves.not.toThrow();
    });
  });

  describe('getTopPerformingTherapists', () => {
    it('should get top performing therapists successfully', async () => {
      const mockGroupByResults = [
        {
          therapistId: 'therapist-user-123',
          _count: { id: 5 },
          _avg: { totalScore: 85, clientSatisfactionScore: 4.5 },
        },
        {
          therapistId: 'therapist-user-456',
          _count: { id: 3 },
          _avg: { totalScore: 82, clientSatisfactionScore: 4.2 },
        },
      ];

      const mockTherapist = {
        id: 'therapist-123',
        userId: 'therapist-user-123',
        user: {
          firstName: 'Dr. Jane',
          lastName: 'Smith',
        },
      };

      prismaService.matchHistory.groupBy.mockResolvedValue(mockGroupByResults);
      prismaService.therapist.findUnique.mockResolvedValue(mockTherapist);

      const result = await service.getTopPerformingTherapists(10);

      expect(result).toEqual([
        {
          therapist: mockTherapist,
          successfulMatches: 5,
          averageMatchScore: 85,
          averageSatisfactionScore: 4.5,
        },
        {
          therapist: mockTherapist,
          successfulMatches: 3,
          averageMatchScore: 82,
          averageSatisfactionScore: 4.2,
        },
      ]);

      expect(prismaService.matchHistory.groupBy).toHaveBeenCalledWith({
        by: ['therapistId'],
        where: {
          becameClient: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          totalScore: true,
          clientSatisfactionScore: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      });
    });

    it('should filter by date range when provided', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      prismaService.matchHistory.groupBy.mockResolvedValue([]);

      await service.getTopPerformingTherapists(10, startDate, endDate);

      expect(prismaService.matchHistory.groupBy).toHaveBeenCalledWith({
        by: ['therapistId'],
        where: {
          becameClient: true,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          id: true,
        },
        _avg: {
          totalScore: true,
          clientSatisfactionScore: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      });
    });

    it('should handle database errors by throwing', async () => {
      prismaService.matchHistory.groupBy.mockRejectedValue(new Error('Database error'));

      await expect(service.getTopPerformingTherapists(10)).rejects.toThrow('Database error');
    });
  });

  describe('getMatchingInsights', () => {
    it('should get matching insights successfully', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      const mockConditionMatches = [
        {
          primaryMatches: ['Depression'],
          secondaryMatches: ['Anxiety'],
          totalScore: 85,
        },
      ];

      const mockApproachMatches = [
        {
          approachMatches: ['CBT'],
          totalScore: 85,
        },
      ];

      const mockScoreDistribution = [
        {
          totalScore: 85,
          _count: { id: 5 },
        },
        {
          totalScore: 78,
          _count: { id: 3 },
        },
      ];

      prismaService.matchHistory.findMany
        .mockResolvedValueOnce(mockConditionMatches)
        .mockResolvedValueOnce(mockApproachMatches);

      prismaService.matchHistory.groupBy.mockResolvedValue(mockScoreDistribution);

      const result = await service.getMatchingInsights(startDate, endDate);

      expect(result).toEqual({
        conditionMatches: mockConditionMatches,
        approachMatches: mockApproachMatches,
        scoreDistribution: mockScoreDistribution,
      });

      // Verify condition matches query
      expect(prismaService.matchHistory.findMany).toHaveBeenCalledWith({
        where: {
          becameClient: true,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          primaryMatches: true,
          secondaryMatches: true,
          totalScore: true,
        },
      });

      // Verify approach matches query
      expect(prismaService.matchHistory.findMany).toHaveBeenCalledWith({
        where: {
          becameClient: true,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          approachMatches: true,
          totalScore: true,
        },
      });

      // Verify score distribution query
      expect(prismaService.matchHistory.groupBy).toHaveBeenCalledWith({
        by: ['totalScore'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          totalScore: 'asc',
        },
      });
    });

    it('should handle database errors by throwing', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      prismaService.matchHistory.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.getMatchingInsights(startDate, endDate)).rejects.toThrow('Database error');
    });
  });

  describe('integration tests', () => {
    it('should handle complete analytics workflow', async () => {
      const clientId = 'client-123';
      const therapistId = 'therapist-user-123';
      const therapistScores = [mockTherapistScore];

      // Mock all database operations
      prismaService.matchHistory.createMany.mockResolvedValue({ count: 1 });
      prismaService.clientCompatibility.upsert.mockResolvedValue({});
      prismaService.matchHistory.updateMany.mockResolvedValue({ count: 1 });
      prismaService.matchHistory.findFirst.mockResolvedValue(mockMatchHistory[0]);
      prismaService.recommendationFeedback.create.mockResolvedValue({});

      // Track recommendation
      await service.trackRecommendation(clientId, therapistScores);

      // Track compatibility analysis
      await service.trackCompatibilityAnalysis(clientId, therapistId, mockCompatibilityAnalysis);

      // Track user interactions
      await service.trackRecommendationView(clientId, therapistId);
      await service.trackTherapistContact(clientId, therapistId);
      await service.trackSuccessfulMatch(clientId, therapistId);

      // Record feedback
      await service.recordRecommendationFeedback(clientId, therapistId, {
        relevanceScore: 4.5,
        accuracyScore: 4.0,
        helpfulnessScore: 4.8,
      });

      // Verify all operations were called
      expect(prismaService.matchHistory.createMany).toHaveBeenCalled();
      expect(prismaService.clientCompatibility.upsert).toHaveBeenCalled();
      expect(prismaService.matchHistory.updateMany).toHaveBeenCalledTimes(3);
      expect(prismaService.recommendationFeedback.create).toHaveBeenCalled();
    });

    it('should handle performance metrics calculation accurately', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      // Setup comprehensive mock data
      const comprehensiveMatchHistory = [
        { ...mockMatchHistory[0], wasViewed: true, wasContacted: true, becameClient: true },
        { ...mockMatchHistory[1], wasViewed: true, wasContacted: false, becameClient: false },
        { ...mockMatchHistory[1], wasViewed: false, wasContacted: false, becameClient: false },
      ];

      prismaService.matchHistory.findMany.mockResolvedValue(comprehensiveMatchHistory);
      prismaService.recommendationFeedback.findMany.mockResolvedValue([
        { ...mockFeedback[0], overallSatisfaction: 4.5 },
        { ...mockFeedback[0], overallSatisfaction: 4.0 },
      ]);

      const result = await service.getAlgorithmPerformance('advanced_v1.0', startDate, endDate);

      expect(result.totalRecommendations).toBe(3);
      expect(result.successfulMatches).toBe(1);
      expect(result.clickThroughRate).toBe(66.67); // 2 viewed out of 3
      expect(result.conversionRate).toBe(33.33); // 1 successful out of 3
      expect(result.averageSatisfactionScore).toBe(4.25); // (4.5 + 4.0) / 2
    });
  });
});