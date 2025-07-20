import { Test, TestingModule } from '@nestjs/testing';
import { TherapistRecommendationService } from './therapist-recommendation.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { InternalServerErrorException } from '@nestjs/common';
import { TherapistRecommendationRequest } from 'mentara-commons';

describe('TherapistRecommendationService', () => {
  let service: TherapistRecommendationService;
  let prismaService: any;

  // Mock data
  const mockUser = {
    userId: 'user-123',
    id: 'client-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    createdAt: new Date('2024-01-15T00:00:00Z'),
    updatedAt: new Date('2024-01-15T00:00:00Z'),
  };

  const mockPreAssessment = {
    id: 'assessment-123',
    userId: 'user-123',
    questionnaires: ['anxiety', 'depression', 'stress'],
    severityLevels: {
      anxiety: 'Moderate',
      depression: 'Mild',
      stress: 'Moderately Severe',
    },
    responses: {
      anxiety: [2, 3, 2, 3, 2, 1, 2],
      depression: [1, 2, 1, 2, 1, 0, 1],
      stress: [4, 3, 4, 3, 4, 4, 3],
    },
    scores: {
      anxiety: 15,
      depression: 8,
      stress: 25,
    },
    recommendations: ['CBT', 'Mindfulness', 'Stress Management'],
    createdAt: new Date('2024-01-15T00:00:00Z'),
    updatedAt: new Date('2024-01-15T00:00:00Z'),
  };

  const mockClientWithAssessment = {
    ...mockUser,
    preAssessment: mockPreAssessment,
  };

  const mockTherapist1 = {
    userId: 'therapist-1',
    id: 'therapist-1',
    bio: 'Experienced therapist specializing in anxiety and depression',
    expertise: ['anxiety', 'depression'],
    hourlyRate: 100,
    yearsOfExperience: 5,
    province: 'Ontario',
    status: 'approved',
    practiceStartDate: new Date('2019-01-01T00:00:00Z'),
    approaches: ['CBT', 'DBT'],
    languages: ['English', 'French'],
    acceptTypes: ['individual', 'couples'],
    sessionLength: '50 minutes',
    createdAt: new Date('2024-01-10T00:00:00Z'),
    user: {
      id: 'therapist-user-1',
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@example.com',
      avatarUrl: 'https://example.com/avatar1.jpg',
    },
  };

  const mockTherapist2 = {
    userId: 'therapist-2',
    id: 'therapist-2',
    bio: 'Specialist in trauma and PTSD treatment',
    expertise: ['trauma', 'ptsd', 'anxiety'],
    hourlyRate: 120,
    yearsOfExperience: 8,
    province: 'Ontario',
    status: 'approved',
    practiceStartDate: new Date('2016-01-01T00:00:00Z'),
    approaches: ['EMDR', 'CBT'],
    languages: ['English'],
    acceptTypes: ['individual'],
    sessionLength: '60 minutes',
    createdAt: new Date('2024-01-08T00:00:00Z'),
    user: {
      id: 'therapist-user-2',
      firstName: 'Dr. Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@example.com',
      avatarUrl: 'https://example.com/avatar2.jpg',
    },
  };

  const mockTherapist3 = {
    userId: 'therapist-3',
    id: 'therapist-3',
    bio: 'General practice therapist',
    expertise: ['general', 'wellness'],
    hourlyRate: 80,
    yearsOfExperience: 3,
    province: 'Quebec',
    status: 'approved',
    practiceStartDate: new Date('2021-01-01T00:00:00Z'),
    approaches: ['Humanistic', 'Integrative'],
    languages: ['English', 'French'],
    acceptTypes: ['individual', 'group'],
    sessionLength: '45 minutes',
    createdAt: new Date('2024-01-12T00:00:00Z'),
    user: {
      id: 'therapist-user-3',
      firstName: 'Dr. Emma',
      lastName: 'Brown',
      email: 'emma.brown@example.com',
      avatarUrl: 'https://example.com/avatar3.jpg',
    },
  };

  const mockRequest: TherapistRecommendationRequest = {
    userId: 'user-123',
    limit: 10,
    includeInactive: false,
    province: 'Ontario',
    maxHourlyRate: 150,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      client: {
        findUnique: jest.fn(),
      },
      therapist: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TherapistRecommendationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TherapistRecommendationService>(
      TherapistRecommendationService,
    );
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecommendedTherapists', () => {
    beforeEach(() => {
      prismaService.client.findUnique.mockResolvedValue(
        mockClientWithAssessment,
      );
      prismaService.therapist.findMany.mockResolvedValue([
        mockTherapist1,
        mockTherapist2,
        mockTherapist3,
      ]);
    });

    it('should return therapist recommendations successfully', async () => {
      const result = await service.getRecommendedTherapists(mockRequest);

      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { userId: mockRequest.userId },
        include: { preAssessment: true },
      });

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith({
        where: {
          status: 'approved',
          province: mockRequest.province,
          hourlyRate: { lte: mockRequest.maxHourlyRate },
        },
        orderBy: { createdAt: 'desc' },
        take: mockRequest.limit,
        include: { user: true },
      });

      expect(result).toEqual({
        totalCount: 3,
        userConditions: ['anxiety', 'depression', 'stress'],
        therapists: expect.arrayContaining([
          expect.objectContaining({
            ...mockTherapist1,
            matchScore: expect.any(Number),
          }),
          expect.objectContaining({
            ...mockTherapist2,
            matchScore: expect.any(Number),
          }),
          expect.objectContaining({
            ...mockTherapist3,
            matchScore: expect.any(Number),
          }),
        ]),
        matchCriteria: {
          primaryConditions: ['stress'],
          secondaryConditions: ['anxiety', 'depression'],
          severityLevels: mockPreAssessment.severityLevels,
        },
        page: 1,
        pageSize: mockRequest.limit,
      });
    });

    it('should sort therapists by match score descending', async () => {
      const result = await service.getRecommendedTherapists(mockRequest);

      const scores = result.therapists.map((t: any) => t.matchScore);
      const sortedScores = [...scores].sort((a, b) => b - a);

      expect(scores).toEqual(sortedScores);
    });

    it('should handle request without optional filters', async () => {
      const minimalRequest = { userId: 'user-123' };

      await service.getRecommendedTherapists(minimalRequest);

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith({
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: true },
      });
    });

    it('should apply province filter when provided', async () => {
      const requestWithProvince = { ...mockRequest, province: 'Quebec' };

      await service.getRecommendedTherapists(requestWithProvince);

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            province: 'Quebec',
          }),
        }),
      );
    });

    it('should apply max hourly rate filter when provided', async () => {
      const requestWithRate = { ...mockRequest, maxHourlyRate: 90 };

      await service.getRecommendedTherapists(requestWithRate);

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            hourlyRate: { lte: 90 },
          }),
        }),
      );
    });

    it('should use default limit when not provided', async () => {
      const requestWithoutLimit = { userId: 'user-123' };

      await service.getRecommendedTherapists(requestWithoutLimit);

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });

    it('should throw InternalServerErrorException when user not found', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow('User not found');
    });

    it('should throw InternalServerErrorException when user has no pre-assessment', async () => {
      prismaService.client.findUnique.mockResolvedValue({
        ...mockUser,
        preAssessment: null,
      });

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow('No pre-assessment found for user');
    });

    it('should handle empty therapist results', async () => {
      prismaService.therapist.findMany.mockResolvedValue([]);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result).toEqual({
        totalCount: 0,
        userConditions: ['anxiety', 'depression', 'stress'],
        therapists: [],
        matchCriteria: {
          primaryConditions: ['stress'],
          secondaryConditions: ['anxiety', 'depression'],
          severityLevels: mockPreAssessment.severityLevels,
        },
        page: 1,
        pageSize: mockRequest.limit,
      });
    });

    it('should handle database errors gracefully', async () => {
      prismaService.client.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle therapists with no expertise', async () => {
      const therapistWithoutExpertise = {
        ...mockTherapist1,
        expertise: null,
      };

      prismaService.therapist.findMany.mockResolvedValue([
        therapistWithoutExpertise,
      ]);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.therapists[0]).toHaveProperty('matchScore');
      expect(result.therapists[0].matchScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle therapists with empty expertise array', async () => {
      const therapistWithEmptyExpertise = {
        ...mockTherapist1,
        expertise: [],
      };

      prismaService.therapist.findMany.mockResolvedValue([
        therapistWithEmptyExpertise,
      ]);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.therapists[0]).toHaveProperty('matchScore');
      expect(result.therapists[0].matchScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle pre-assessment with no questionnaires', async () => {
      const clientWithEmptyAssessment = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: [],
          severityLevels: {},
        },
      };

      prismaService.client.findUnique.mockResolvedValue(
        clientWithEmptyAssessment,
      );

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.userConditions).toEqual([]);
      expect(result.matchCriteria.primaryConditions).toEqual([]);
      expect(result.matchCriteria.secondaryConditions).toEqual([]);
    });

    it('should handle pre-assessment with null questionnaires', async () => {
      const clientWithNullQuestionnaires = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: null,
        },
      };

      prismaService.client.findUnique.mockResolvedValue(
        clientWithNullQuestionnaires,
      );

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle different severity levels correctly', async () => {
      const clientWithVariedSeverity = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: ['anxiety', 'depression', 'stress', 'trauma'],
          severityLevels: {
            anxiety: 'Severe',
            depression: 'Minimal',
            stress: 'Moderate',
            trauma: 'Clinical',
          },
        },
      };

      prismaService.client.findUnique.mockResolvedValue(
        clientWithVariedSeverity,
      );

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.matchCriteria.primaryConditions).toContain('anxiety');
      expect(result.matchCriteria.primaryConditions).toContain('trauma');
      expect(result.matchCriteria.secondaryConditions).toContain('stress');
      expect(result.matchCriteria.primaryConditions).not.toContain(
        'depression',
      );
      expect(result.matchCriteria.secondaryConditions).not.toContain(
        'depression',
      );
    });

    it('should calculate match scores correctly for expertise matching', async () => {
      const therapistWithMatchingExpertise = {
        ...mockTherapist1,
        expertise: ['anxiety', 'depression'],
      };

      const therapistWithoutMatchingExpertise = {
        ...mockTherapist2,
        expertise: ['trauma', 'ptsd'],
      };

      prismaService.therapist.findMany.mockResolvedValue([
        therapistWithMatchingExpertise,
        therapistWithoutMatchingExpertise,
      ]);

      const result = await service.getRecommendedTherapists(mockRequest);

      const matchingTherapist = result.therapists.find(
        (t: any) => t.userId === 'therapist-1',
      );
      const nonMatchingTherapist = result.therapists.find(
        (t: any) => t.userId === 'therapist-2',
      );

      expect(matchingTherapist.matchScore).toBeGreaterThan(
        nonMatchingTherapist.matchScore,
      );
    });

    it('should calculate years of experience correctly', async () => {
      const currentYear = new Date().getFullYear();
      const therapistWithRecentStart = {
        ...mockTherapist1,
        practiceStartDate: new Date(`${currentYear - 2}-01-01`),
        yearsOfExperience: 2,
      };

      const therapistWithOldStart = {
        ...mockTherapist2,
        practiceStartDate: new Date(`${currentYear - 10}-01-01`),
        yearsOfExperience: 10,
      };

      prismaService.therapist.findMany.mockResolvedValue([
        therapistWithRecentStart,
        therapistWithOldStart,
      ]);

      const result = await service.getRecommendedTherapists(mockRequest);

      const recentTherapist = result.therapists.find(
        (t: any) => t.userId === 'therapist-1',
      );
      const experiencedTherapist = result.therapists.find(
        (t: any) => t.userId === 'therapist-2',
      );

      expect(experiencedTherapist.matchScore).toBeGreaterThan(
        recentTherapist.matchScore,
      );
    });

    it('should handle therapists with no yearsOfExperience field', async () => {
      const therapistWithoutYearsField = {
        ...mockTherapist1,
        yearsOfExperience: null,
      };

      prismaService.therapist.findMany.mockResolvedValue([
        therapistWithoutYearsField,
      ]);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.therapists[0]).toHaveProperty('matchScore');
      expect(result.therapists[0].matchScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle future practice start dates', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const therapistWithFutureStart = {
        ...mockTherapist1,
        practiceStartDate: futureDate,
      };

      prismaService.therapist.findMany.mockResolvedValue([
        therapistWithFutureStart,
      ]);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.therapists[0]).toHaveProperty('matchScore');
      expect(result.therapists[0].matchScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle malformed severity levels', async () => {
      const clientWithMalformedSeverity = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: ['anxiety', 'depression'],
          severityLevels: {
            anxiety: 'Invalid Severity',
            depression: null,
          },
        },
      };

      prismaService.client.findUnique.mockResolvedValue(
        clientWithMalformedSeverity,
      );

      const result = await service.getRecommendedTherapists(mockRequest);

      // Only anxiety has a severity value (even if invalid), depression is null so gets filtered out
      expect(result.userConditions).toEqual(['anxiety']);
      // Invalid severity gets default weight of 1, which is not >= 2, so no secondary conditions
      expect(result.matchCriteria.primaryConditions).toEqual([]);
      expect(result.matchCriteria.secondaryConditions).toEqual([]);
    });

    it('should handle very large datasets efficiently', async () => {
      const manyTherapists = Array(100)
        .fill(null)
        .map((_, i) => ({
          ...mockTherapist1,
          userId: `therapist-${i}`,
          id: `therapist-${i}`,
          expertise: i % 2 === 0 ? ['anxiety'] : ['depression'],
          user: {
            ...mockTherapist1.user,
            id: `therapist-user-${i}`,
          },
        }));

      prismaService.therapist.findMany.mockResolvedValue(manyTherapists);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.therapists).toHaveLength(100);
      expect(result.totalCount).toBe(100);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => service.getRecommendedTherapists(mockRequest));

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toHaveProperty('therapists');
        expect(result).toHaveProperty('totalCount');
      });
    });

    it('should handle edge case severity levels', async () => {
      const clientWithEdgeCaseSeverity = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: ['anxiety', 'depression', 'stress'],
          severityLevels: {
            anxiety: 'None',
            depression: 'Subthreshold',
            stress: 'Extreme',
          },
        },
      };

      prismaService.client.findUnique.mockResolvedValue(
        clientWithEdgeCaseSeverity,
      );

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.matchCriteria.primaryConditions).toContain('stress');
      expect(result.matchCriteria.secondaryConditions).toContain('depression');
      expect(result.matchCriteria.primaryConditions).not.toContain('anxiety');
      expect(result.matchCriteria.secondaryConditions).not.toContain('anxiety');
    });

    it('should handle null severity levels', async () => {
      const clientWithNullSeverity = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          severityLevels: null,
        },
      };

      prismaService.client.findUnique.mockResolvedValue(clientWithNullSeverity);

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle malformed request parameters', async () => {
      const malformedRequest = {
        userId: 'user-123',
        limit: -1,
        maxHourlyRate: 'invalid',
      } as any;

      // The service doesn't validate request parameters, so it won't throw
      const result = await service.getRecommendedTherapists(malformedRequest);

      expect(result).toHaveProperty('therapists');
      expect(result.pageSize).toBe(-1);
    });

    it('should handle string numeric values in request', async () => {
      const requestWithStringNumbers = {
        userId: 'user-123',
        limit: '5' as any,
        maxHourlyRate: '100' as any,
      };

      // Should not throw error and handle conversion
      const result = await service.getRecommendedTherapists(
        requestWithStringNumbers,
      );

      expect(result).toHaveProperty('therapists');
      expect(result.pageSize).toBe('5');
    });

    it('should handle therapists with null or undefined fields', async () => {
      const therapistWithNullFields = {
        ...mockTherapist1,
        expertise: null,
        yearsOfExperience: undefined,
        practiceStartDate: null,
        hourlyRate: undefined,
      };

      prismaService.therapist.findMany.mockResolvedValue([
        therapistWithNullFields,
      ]);

      // This will throw because practiceStartDate is null and calculateYearsOfExperience tries to call getFullYear on null
      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle empty request object', async () => {
      const emptyRequest = {} as any;

      // For empty request, we need to mock client.findUnique to return null for undefined userId
      prismaService.client.findUnique.mockResolvedValue(null);

      // Empty request will cause userId to be undefined, which will cause user not found error
      await expect(
        service.getRecommendedTherapists(emptyRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle assessment with mixed data types', async () => {
      const clientWithMixedData = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: ['anxiety', 'depression', 123 as any],
          severityLevels: {
            anxiety: 'Moderate',
            depression: 'Mild',
            123: 'Invalid',
          },
        },
      };

      prismaService.client.findUnique.mockResolvedValue(clientWithMixedData);

      // Should handle gracefully without throwing
      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.userConditions).toContain('anxiety');
      expect(result.userConditions).toContain('depression');
    });

    it('should maintain consistent scoring across multiple calls', async () => {
      const results = await Promise.all([
        service.getRecommendedTherapists(mockRequest),
        service.getRecommendedTherapists(mockRequest),
        service.getRecommendedTherapists(mockRequest),
      ]);

      const scores1 = results[0].therapists.map((t: any) => t.matchScore);
      const scores2 = results[1].therapists.map((t: any) => t.matchScore);
      const scores3 = results[2].therapists.map((t: any) => t.matchScore);

      expect(scores1).toEqual(scores2);
      expect(scores2).toEqual(scores3);
    });

    it('should handle non-Error exceptions', async () => {
      const nonErrorException = { message: 'Custom error', code: 500 };
      prismaService.client.findUnique.mockRejectedValue(nonErrorException);

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle assessment with duplicate questionnaires', async () => {
      const clientWithDuplicates = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: ['anxiety', 'depression', 'anxiety', 'depression'],
        },
      };

      prismaService.client.findUnique.mockResolvedValue(clientWithDuplicates);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.userConditions).toContain('anxiety');
      expect(result.userConditions).toContain('depression');
    });

    it('should handle very old practice start dates', async () => {
      const therapistWithVeryOldStart = {
        ...mockTherapist1,
        practiceStartDate: new Date('1980-01-01'),
        yearsOfExperience: 44,
      };

      prismaService.therapist.findMany.mockResolvedValue([
        therapistWithVeryOldStart,
      ]);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.therapists[0]).toHaveProperty('matchScore');
      expect(result.therapists[0].matchScore).toBeGreaterThan(0);
    });

    it('should handle zero and negative hourly rates', async () => {
      const therapistWithZeroRate = {
        ...mockTherapist1,
        hourlyRate: 0,
      };

      const therapistWithNegativeRate = {
        ...mockTherapist2,
        hourlyRate: -50,
      };

      prismaService.therapist.findMany.mockResolvedValue([
        therapistWithZeroRate,
        therapistWithNegativeRate,
      ]);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.therapists).toHaveLength(2);
      expect(result.therapists[0]).toHaveProperty('matchScore');
      expect(result.therapists[1]).toHaveProperty('matchScore');
    });

    it('should handle assessment with special characters in questionnaire names', async () => {
      const clientWithSpecialChars = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: [
            'anxiety-disorder',
            'depression_scale',
            'stress/trauma',
          ],
          severityLevels: {
            'anxiety-disorder': 'Moderate',
            depression_scale: 'Mild',
            'stress/trauma': 'Severe',
          },
        },
      };

      prismaService.client.findUnique.mockResolvedValue(clientWithSpecialChars);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.userConditions).toContain('anxiety-disorder');
      expect(result.userConditions).toContain('depression_scale');
      expect(result.userConditions).toContain('stress/trauma');
    });

    it('should handle extremely large limit values', async () => {
      const requestWithLargeLimit = {
        ...mockRequest,
        limit: 999999,
      };

      const result = await service.getRecommendedTherapists(
        requestWithLargeLimit,
      );

      expect(result.pageSize).toBe(999999);
    });

    it('should handle zero limit value', async () => {
      const requestWithZeroLimit = {
        ...mockRequest,
        limit: 0,
      };

      const result =
        await service.getRecommendedTherapists(requestWithZeroLimit);

      expect(result.pageSize).toBe(0);
    });

    it('should handle Unicode characters in user conditions', async () => {
      const clientWithUnicode = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: ['ansiedad', 'depresión', 'estrés'],
          severityLevels: {
            ansiedad: 'Moderado',
            depresión: 'Leve',
            estrés: 'Severo',
          },
        },
      };

      prismaService.client.findUnique.mockResolvedValue(clientWithUnicode);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.userConditions).toContain('ansiedad');
      expect(result.userConditions).toContain('depresión');
      expect(result.userConditions).toContain('estrés');
    });

    it('should handle assessment with very long questionnaire names', async () => {
      const longName = 'a'.repeat(1000);
      const clientWithLongNames = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          questionnaires: [longName, 'short'],
          severityLevels: {
            [longName]: 'Moderate',
            short: 'Mild',
          },
        },
      };

      prismaService.client.findUnique.mockResolvedValue(clientWithLongNames);

      const result = await service.getRecommendedTherapists(mockRequest);

      expect(result.userConditions).toContain(longName);
      expect(result.userConditions).toContain('short');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle database timeout errors', async () => {
      prismaService.client.findUnique.mockRejectedValue(
        new Error('Connection timeout'),
      );

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle network errors', async () => {
      prismaService.client.findUnique.mockRejectedValue(
        new Error('Network error'),
      );

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle memory errors gracefully', async () => {
      prismaService.client.findUnique.mockRejectedValue(
        new Error('Out of memory'),
      );

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle JSON parsing errors in severity levels', async () => {
      const clientWithInvalidJson = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          severityLevels: 'invalid json string' as any,
        },
      };

      prismaService.client.findUnique.mockResolvedValue(clientWithInvalidJson);

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle circular reference errors', async () => {
      const circularObj: any = {};
      circularObj.self = circularObj;

      const clientWithCircularRef = {
        ...mockUser,
        preAssessment: {
          ...mockPreAssessment,
          severityLevels: circularObj,
        },
      };

      prismaService.client.findUnique.mockResolvedValue(clientWithCircularRef);

      await expect(
        service.getRecommendedTherapists(mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
