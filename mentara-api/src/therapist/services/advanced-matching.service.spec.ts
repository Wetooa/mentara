import { Test, TestingModule } from '@nestjs/testing';
import { AdvancedMatchingService } from './advanced-matching.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import {
  AdvancedMatchingService,
  ClientForMatching,
  TherapistForMatching,
  MatchingWeights,
  UserConditionProfile,
  TherapistScore,
} from './advanced-matching.service';

describe('AdvancedMatchingService', () => {
  let service: AdvancedMatchingService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockClient: ClientForMatching = {
    id: 'client-123',
    userId: 'user-123',
    hasSeenTherapistRecommendations: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    preAssessment: {
      id: 'assessment-123',
      userId: 'user-123',
      severityLevels: {
        'Depression': 'Severe',
        'Anxiety': 'Moderate',
        'PTSD': 'Mild',
      },
      questionnaires: ['Depression', 'Anxiety', 'PTSD'],
      totalScore: 85,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    clientPreferences: [
      {
        id: 'pref-1',
        userId: 'user-123',
        key: 'approaches',
        value: '["Cognitive Behavioral Therapy (CBT)", "Mindfulness-Based Cognitive Therapy (MBCT)"]',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-2',
        userId: 'user-123',
        key: 'maxBudget',
        value: '2000',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-3',
        userId: 'user-123',
        key: 'province',
        value: 'Metro Manila',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-4',
        userId: 'user-123',
        key: 'therapistGender',
        value: 'Female',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    user: {
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
  };

  const mockTherapist: TherapistForMatching = {
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
      {
        rating: 5,
        status: 'APPROVED',
      },
    ],
  };

  const mockCustomWeights: MatchingWeights = {
    conditionMatch: 0.5,
    approachCompatibility: 0.2,
    experienceAndSuccess: 0.15,
    reviewsAndRatings: 0.1,
    availabilityAndLogistics: 0.05,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvancedMatchingService,
        {
          provide: PrismaService,
          useValue: {
            // Mock PrismaService methods if needed
          },
        },
      ],
    }).compile();

    service = module.get<AdvancedMatchingService>(AdvancedMatchingService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateAdvancedMatch', () => {
    it('should calculate comprehensive match score successfully', async () => {
      const result = await service.calculateAdvancedMatch(mockClient, mockTherapist);

      expect(result).toEqual({
        therapist: mockTherapist,
        totalScore: expect.any(Number),
        breakdown: {
          conditionScore: expect.any(Number),
          approachScore: expect.any(Number),
          experienceScore: expect.any(Number),
          reviewScore: expect.any(Number),
          logisticsScore: expect.any(Number),
        },
        matchExplanation: {
          primaryMatches: expect.any(Array),
          secondaryMatches: expect.any(Array),
          approachMatches: expect.any(Array),
          experienceYears: expect.any(Number),
          averageRating: expect.any(Number),
          totalReviews: expect.any(Number),
          successRates: expect.any(Object),
        },
      });

      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('should use custom weights when provided', async () => {
      const result = await service.calculateAdvancedMatch(
        mockClient,
        mockTherapist,
        mockCustomWeights,
      );

      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.breakdown.conditionScore).toBeGreaterThan(0);
    });

    it('should throw error for client without pre-assessment', async () => {
      const clientWithoutAssessment = {
        ...mockClient,
        preAssessment: null,
      };

      await expect(
        service.calculateAdvancedMatch(clientWithoutAssessment, mockTherapist),
      ).rejects.toThrow('Client must have a valid pre-assessment');
    });

    it('should throw error for client without preferences', async () => {
      const clientWithoutPreferences = {
        ...mockClient,
        clientPreferences: null,
      };

      await expect(
        service.calculateAdvancedMatch(clientWithoutPreferences, mockTherapist),
      ).rejects.toThrow('Client preferences are required for matching');
    });

    it('should throw error for therapist without user information', async () => {
      const therapistWithoutUser = {
        ...mockTherapist,
        user: null,
      };

      await expect(
        service.calculateAdvancedMatch(mockClient, therapistWithoutUser),
      ).rejects.toThrow('Therapist must have valid user information');
    });

    it('should handle missing optional therapist fields gracefully', async () => {
      const therapistWithMissingFields = {
        ...mockTherapist,
        expertise: undefined,
        illnessSpecializations: undefined,
        approaches: undefined,
        therapeuticApproachesUsedList: undefined,
        treatmentSuccessRates: undefined,
        yearsOfExperience: undefined,
        languagesOffered: undefined,
        acceptedInsuranceTypes: undefined,
      };

      const result = await service.calculateAdvancedMatch(
        mockClient,
        therapistWithMissingFields,
      );

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.conditionScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('buildUserConditionProfile', () => {
    it('should build comprehensive user profile with primary and secondary conditions', () => {
      const profile = (service as any).buildUserConditionProfile(mockClient);

      expect(profile).toEqual({
        primaryConditions: expect.any(Array),
        secondaryConditions: expect.any(Array),
        preferredApproaches: expect.any(Array),
        sessionPreferences: expect.any(Object),
        demographics: expect.any(Object),
        logistics: expect.any(Object),
      });

      // Check that severe depression is in primary conditions
      const severePrimaryConditions = profile.primaryConditions.filter(
        (c) => c.condition === 'Depression' && c.severity === 'Severe',
      );
      expect(severePrimaryConditions).toHaveLength(1);

      // Check that moderate anxiety is in secondary conditions
      const moderateSecondaryConditions = profile.secondaryConditions.filter(
        (c) => c.condition === 'Anxiety' && c.severity === 'Moderate',
      );
      expect(moderateSecondaryConditions).toHaveLength(1);
    });

    it('should parse client preferences correctly', () => {
      const profile = (service as any).buildUserConditionProfile(mockClient);

      expect(profile.preferredApproaches).toContain('Cognitive Behavioral Therapy (CBT)');
      expect(profile.preferredApproaches).toContain('Mindfulness-Based Cognitive Therapy (MBCT)');
      expect(profile.logistics.maxHourlyRate).toBe(2000);
      expect(profile.logistics.province).toBe('Metro Manila');
      expect(profile.demographics.genderPreference).toBe('Female');
    });

    it('should handle missing or invalid preference values', () => {
      const clientWithInvalidPrefs = {
        ...mockClient,
        clientPreferences: [
          {
            id: 'pref-1',
            userId: 'user-123',
            key: 'approaches',
            value: 'invalid-json[',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      const profile = (service as any).buildUserConditionProfile(clientWithInvalidPrefs);

      expect(profile.preferredApproaches).toEqual([]);
    });
  });

  describe('calculateConditionMatchScore', () => {
    it('should score primary conditions higher than secondary conditions', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [
          { condition: 'Depression', severity: 'Severe', weight: 5 },
        ],
        secondaryConditions: [
          { condition: 'Anxiety', severity: 'Moderate', weight: 3 },
        ],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const score = (service as any).calculateConditionMatchScore(
        userProfile,
        mockTherapist,
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for therapist with no matching conditions', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [
          { condition: 'Eating Disorders', severity: 'Severe', weight: 5 },
        ],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const therapistWithNoMatch = {
        ...mockTherapist,
        expertise: ['Substance Abuse'],
        illnessSpecializations: ['Addiction'],
      };

      const score = (service as any).calculateConditionMatchScore(
        userProfile,
        therapistWithNoMatch,
      );

      expect(score).toBe(0);
    });

    it('should apply expertise depth bonus for multiple matched conditions', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [
          { condition: 'Depression', severity: 'Severe', weight: 5 },
          { condition: 'Anxiety', severity: 'Severe', weight: 5 },
        ],
        secondaryConditions: [
          { condition: 'PTSD', severity: 'Moderate', weight: 3 },
        ],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const score = (service as any).calculateConditionMatchScore(
        userProfile,
        mockTherapist,
      );

      // Should get bonus for matching multiple conditions
      expect(score).toBeGreaterThan(50);
    });

    it('should cap score at 100', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [
          { condition: 'Depression', severity: 'Severe', weight: 5 },
          { condition: 'Anxiety', severity: 'Severe', weight: 5 },
          { condition: 'PTSD', severity: 'Severe', weight: 5 },
        ],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const score = (service as any).calculateConditionMatchScore(
        userProfile,
        mockTherapist,
      );

      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateApproachCompatibilityScore', () => {
    it('should give perfect score for exact approach matches', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Cognitive Therapy (MBCT)'],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const score = (service as any).calculateApproachCompatibilityScore(
        userProfile,
        mockTherapist,
      );

      expect(score).toBeGreaterThan(90); // Should be high for exact matches
    });

    it('should give evidence-based score when no preferences specified', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const score = (service as any).calculateApproachCompatibilityScore(
        userProfile,
        mockTherapist,
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give diversity bonus for multiple approaches', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const therapistWithManyApproaches = {
        ...mockTherapist,
        approaches: ['CBT', 'DBT', 'ACT', 'EMDR'],
        therapeuticApproachesUsedList: ['Mindfulness', 'Psychodynamic'],
      };

      const score = (service as any).calculateApproachCompatibilityScore(
        userProfile,
        therapistWithManyApproaches,
      );

      expect(score).toBeGreaterThan(40); // Should get diversity bonus
    });

    it('should handle missing approach data gracefully', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: ['CBT'],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const therapistWithNoApproaches = {
        ...mockTherapist,
        approaches: undefined,
        therapeuticApproachesUsedList: undefined,
      };

      const score = (service as any).calculateApproachCompatibilityScore(
        userProfile,
        therapistWithNoApproaches,
      );

      expect(score).toBe(0);
    });
  });

  describe('calculateExperienceAndSuccessScore', () => {
    it('should calculate experience score with diminishing returns', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [
          { condition: 'Depression', severity: 'Severe', weight: 5 },
        ],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      // Test new therapist (0-5 years)
      const newTherapist = {
        ...mockTherapist,
        practiceStartDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), // 2 years ago
        yearsOfExperience: 2,
      };

      const newScore = (service as any).calculateExperienceAndSuccessScore(
        userProfile,
        newTherapist,
      );

      // Test experienced therapist (5-10 years)
      const experiencedTherapist = {
        ...mockTherapist,
        practiceStartDate: new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000), // 7 years ago
        yearsOfExperience: 7,
      };

      const experiencedScore = (service as any).calculateExperienceAndSuccessScore(
        userProfile,
        experiencedTherapist,
      );

      // Test senior therapist (10+ years)
      const seniorTherapist = {
        ...mockTherapist,
        practiceStartDate: new Date(Date.now() - 15 * 365 * 24 * 60 * 60 * 1000), // 15 years ago
        yearsOfExperience: 15,
      };

      const seniorScore = (service as any).calculateExperienceAndSuccessScore(
        userProfile,
        seniorTherapist,
      );

      expect(newScore).toBeGreaterThan(0);
      expect(experiencedScore).toBeGreaterThan(newScore);
      expect(seniorScore).toBeGreaterThan(experiencedScore);
      expect(seniorScore).toBeLessThanOrEqual(100);
    });

    it('should include success rate bonus for relevant conditions', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [
          { condition: 'Depression', severity: 'Severe', weight: 5 },
        ],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const therapistWithHighSuccess = {
        ...mockTherapist,
        treatmentSuccessRates: { 'Depression': 95 },
      };

      const therapistWithLowSuccess = {
        ...mockTherapist,
        treatmentSuccessRates: { 'Depression': 60 },
      };

      const highScore = (service as any).calculateExperienceAndSuccessScore(
        userProfile,
        therapistWithHighSuccess,
      );

      const lowScore = (service as any).calculateExperienceAndSuccessScore(
        userProfile,
        therapistWithLowSuccess,
      );

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('should handle missing success rate data', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [
          { condition: 'Depression', severity: 'Severe', weight: 5 },
        ],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const therapistWithoutSuccess = {
        ...mockTherapist,
        treatmentSuccessRates: undefined,
      };

      const score = (service as any).calculateExperienceAndSuccessScore(
        userProfile,
        therapistWithoutSuccess,
      );

      expect(score).toBeGreaterThan(0);
    });
  });

  describe('calculateReviewScore', () => {
    it('should calculate score based on average rating and volume', async () => {
      const score = await (service as any).calculateReviewScore(mockTherapist);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return neutral score for therapist with no reviews', async () => {
      const therapistWithoutReviews = {
        ...mockTherapist,
        reviews: [],
      };

      const score = await (service as any).calculateReviewScore(therapistWithoutReviews);

      expect(score).toBe(50);
    });

    it('should only count approved reviews', async () => {
      const therapistWithMixedReviews = {
        ...mockTherapist,
        reviews: [
          { rating: 5, status: 'APPROVED' },
          { rating: 1, status: 'PENDING' },
          { rating: 1, status: 'REJECTED' },
        ],
      };

      const score = await (service as any).calculateReviewScore(therapistWithMixedReviews);

      expect(score).toBeGreaterThan(50); // Should only count the approved 5-star review
    });

    it('should apply volume bonus for many reviews', async () => {
      const therapistWithManyReviews = {
        ...mockTherapist,
        reviews: Array(20).fill({ rating: 4, status: 'APPROVED' }),
      };

      const manyReviewsScore = await (service as any).calculateReviewScore(therapistWithManyReviews);
      const fewReviewsScore = await (service as any).calculateReviewScore(mockTherapist);

      expect(manyReviewsScore).toBeGreaterThan(fewReviewsScore);
    });

    it('should apply penalty for very few reviews', async () => {
      const therapistWithFewReviews = {
        ...mockTherapist,
        reviews: [{ rating: 5, status: 'APPROVED' }],
      };

      const score = await (service as any).calculateReviewScore(therapistWithFewReviews);

      expect(score).toBeLessThan(100); // Should be penalized for low count
    });
  });

  describe('calculateLogisticsScore', () => {
    it('should give perfect score for all logistics matches', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {
          maxHourlyRate: 2000,
          province: 'Metro Manila',
          insuranceTypes: ['PhilHealth'],
        },
      };

      const score = (service as any).calculateLogisticsScore(userProfile, mockTherapist);

      expect(score).toBe(100);
    });

    it('should penalize location mismatch', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {
          province: 'Cebu',
        },
      };

      const score = (service as any).calculateLogisticsScore(userProfile, mockTherapist);

      expect(score).toBe(70); // 100 - 30 for location mismatch
    });

    it('should penalize budget overrun', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {
          maxHourlyRate: 1000, // Lower than therapist rate of 1800
        },
      };

      const score = (service as any).calculateLogisticsScore(userProfile, mockTherapist);

      expect(score).toBe(60); // 100 - 40 for budget overrun
    });

    it('should penalize insurance mismatch', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {
          insuranceTypes: ['MediCard'], // Not accepted by therapist
        },
      };

      const score = (service as any).calculateLogisticsScore(userProfile, mockTherapist);

      expect(score).toBe(80); // 100 - 20 for insurance mismatch
    });

    it('should penalize language barrier', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['Spanish'] },
        logistics: {},
      };

      const score = (service as any).calculateLogisticsScore(userProfile, mockTherapist);

      expect(score).toBe(75); // 100 - 25 for language barrier
    });

    it('should not go below 0', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['Spanish'] },
        logistics: {
          maxHourlyRate: 1000,
          province: 'Cebu',
          insuranceTypes: ['MediCard'],
        },
      };

      const score = (service as any).calculateLogisticsScore(userProfile, mockTherapist);

      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('buildMatchExplanation', () => {
    it('should build comprehensive match explanation', () => {
      const userProfile: UserConditionProfile = {
        primaryConditions: [
          { condition: 'Depression', severity: 'Severe', weight: 5 },
        ],
        secondaryConditions: [
          { condition: 'Anxiety', severity: 'Moderate', weight: 3 },
        ],
        preferredApproaches: ['Cognitive Behavioral Therapy (CBT)'],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const explanation = (service as any).buildMatchExplanation(
        userProfile,
        mockTherapist,
        80,
        90,
        75,
        85,
      );

      expect(explanation).toEqual({
        primaryMatches: expect.arrayContaining(['Depression']),
        secondaryMatches: expect.arrayContaining(['Anxiety']),
        approachMatches: expect.arrayContaining(['Cognitive Behavioral Therapy (CBT)']),
        experienceYears: expect.any(Number),
        averageRating: expect.any(Number),
        totalReviews: expect.any(Number),
        successRates: expect.any(Object),
      });

      expect(explanation.experienceYears).toBeGreaterThan(0);
      expect(explanation.averageRating).toBeGreaterThan(0);
      expect(explanation.totalReviews).toBeGreaterThan(0);
    });

    it('should handle therapist with no reviews', () => {
      const therapistWithoutReviews = {
        ...mockTherapist,
        reviews: [],
      };

      const userProfile: UserConditionProfile = {
        primaryConditions: [],
        secondaryConditions: [],
        preferredApproaches: [],
        sessionPreferences: { format: [], duration: [], frequency: 'weekly' },
        demographics: { ageRange: 'any', languagePreference: ['English'] },
        logistics: {},
      };

      const explanation = (service as any).buildMatchExplanation(
        userProfile,
        therapistWithoutReviews,
        80,
        90,
        75,
        85,
      );

      expect(explanation.averageRating).toBe(0);
      expect(explanation.totalReviews).toBe(0);
    });
  });

  describe('parseClientPreferences', () => {
    it('should parse JSON array preferences correctly', () => {
      const preferences = [
        {
          id: 'pref-1',
          userId: 'user-123',
          key: 'approaches',
          value: '["CBT", "DBT"]',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const parsed = (service as any).parseClientPreferences(preferences);

      expect(parsed.approaches).toEqual(['CBT', 'DBT']);
    });

    it('should handle non-JSON string values', () => {
      const preferences = [
        {
          id: 'pref-1',
          userId: 'user-123',
          key: 'maxBudget',
          value: '2000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const parsed = (service as any).parseClientPreferences(preferences);

      expect(parsed.maxBudget).toBe('2000');
    });

    it('should handle malformed JSON gracefully', () => {
      const preferences = [
        {
          id: 'pref-1',
          userId: 'user-123',
          key: 'approaches',
          value: 'invalid-json[',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const parsed = (service as any).parseClientPreferences(preferences);

      expect(parsed.approaches).toBe('invalid-json[');
    });
  });

  describe('calculateYearsOfExperience', () => {
    it('should calculate years correctly for past dates', () => {
      const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);
      const years = (service as any).calculateYearsOfExperience(fiveYearsAgo);

      expect(years).toBe(5);
    });

    it('should handle recent start dates', () => {
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      const years = (service as any).calculateYearsOfExperience(sixMonthsAgo);

      expect(years).toBe(0);
    });

    it('should handle anniversary dates correctly', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const years = (service as any).calculateYearsOfExperience(oneYearAgo);

      expect(years).toBe(1);
    });

    it('should not return negative years', () => {
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const years = (service as any).calculateYearsOfExperience(futureDate);

      expect(years).toBe(0);
    });
  });

  describe('integration tests', () => {
    it('should handle complete matching workflow with edge cases', async () => {
      // Client with minimal data
      const minimalClient = {
        ...mockClient,
        clientPreferences: [],
        preAssessment: {
          ...mockClient.preAssessment,
          severityLevels: {},
          questionnaires: [],
        },
      };

      // Therapist with minimal data
      const minimalTherapist = {
        ...mockTherapist,
        expertise: [],
        illnessSpecializations: [],
        approaches: [],
        therapeuticApproachesUsedList: [],
        reviews: [],
        treatmentSuccessRates: {},
      };

      const result = await service.calculateAdvancedMatch(minimalClient, minimalTherapist);

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.breakdown).toBeDefined();
      expect(result.matchExplanation).toBeDefined();
    });

    it('should produce different scores for different therapists', async () => {
      const therapist1 = {
        ...mockTherapist,
        expertise: ['Depression'],
        reviews: [{ rating: 5, status: 'APPROVED' }],
      };

      const therapist2 = {
        ...mockTherapist,
        expertise: ['Anxiety'],
        reviews: [{ rating: 3, status: 'APPROVED' }],
      };

      const result1 = await service.calculateAdvancedMatch(mockClient, therapist1);
      const result2 = await service.calculateAdvancedMatch(mockClient, therapist2);

      expect(result1.totalScore).not.toBe(result2.totalScore);
    });
  });
});