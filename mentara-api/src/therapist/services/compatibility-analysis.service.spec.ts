import { Test, TestingModule } from '@nestjs/testing';
import { CompatibilityAnalysisService } from './compatibility-analysis.service';
import {
  PersonalityCompatibility,
  SessionCompatibility,
  DemographicCompatibility,
  CompatibilityAnalysis,
} from './compatibility-analysis.service';

describe('CompatibilityAnalysisService', () => {
  let service: CompatibilityAnalysisService;

  const mockClient = {
    id: 'client-123',
    userId: 'user-123',
    hasSeenTherapistRecommendations: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    preAssessment: {
      id: 'assessment-123',
      userId: 'user-123',
      severityLevels: {
        'anxiety': 'Moderate',
        'depression': 'Severe',
        'ptsd': 'Mild',
        'social_anxiety': 'Moderately Severe',
        'ocd': 'Moderate',
        'adhd': 'Mild',
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
        key: 'communicationStyle',
        value: 'direct',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-2',
        userId: 'user-123',
        key: 'therapistGender',
        value: 'Female',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-3',
        userId: 'user-123',
        key: 'sessionFormat',
        value: '["online", "in-person"]',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-4',
        userId: 'user-123',
        key: 'preferredLanguages',
        value: '["English", "Filipino"]',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-5',
        userId: 'user-123',
        key: 'sessionDuration',
        value: '60',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-6',
        userId: 'user-123',
        key: 'sessionFrequency',
        value: 'weekly',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-7',
        userId: 'user-123',
        key: 'therapistAge',
        value: '30-40',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-8',
        userId: 'user-123',
        key: 'therapistWarmth',
        value: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pref-9',
        userId: 'user-123',
        key: 'spiritualPreferences',
        value: 'important',
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

  const mockTherapist = {
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
    approaches: ['Cognitive Behavioral Therapy (CBT)', 'Person-Centered Therapy'],
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
    preferredSessionLength: [50, 60],
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      avatarUrl: 'https://example.com/therapist-avatar.jpg',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompatibilityAnalysisService],
    }).compile();

    service = module.get<CompatibilityAnalysisService>(CompatibilityAnalysisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeCompatibility', () => {
    it('should analyze compatibility comprehensively', async () => {
      const result = await service.analyzeCompatibility(mockClient, mockTherapist);

      expect(result).toEqual({
        personalityCompatibility: expect.objectContaining({
          communicationStyle: expect.any(Number),
          personalityMatch: expect.any(Number),
          culturalCompatibility: expect.any(Number),
          overallCompatibility: expect.any(Number),
        }),
        sessionCompatibility: expect.objectContaining({
          formatMatch: expect.any(Number),
          durationMatch: expect.any(Number),
          frequencyMatch: expect.any(Number),
          schedulingCompatibility: expect.any(Number),
          overallCompatibility: expect.any(Number),
        }),
        demographicCompatibility: expect.objectContaining({
          ageCompatibility: expect.any(Number),
          genderCompatibility: expect.any(Number),
          languageCompatibility: expect.any(Number),
          culturalCompatibility: expect.any(Number),
          overallCompatibility: expect.any(Number),
        }),
        overallCompatibilityScore: expect.any(Number),
        compatibilityFactors: expect.objectContaining({
          strengths: expect.any(Array),
          concerns: expect.any(Array),
          recommendations: expect.any(Array),
        }),
      });

      expect(result.overallCompatibilityScore).toBeGreaterThan(0);
      expect(result.overallCompatibilityScore).toBeLessThanOrEqual(100);
    });

    it('should handle client with minimal preferences', async () => {
      const clientWithMinimalPrefs = {
        ...mockClient,
        clientPreferences: [],
      };

      const result = await service.analyzeCompatibility(clientWithMinimalPrefs, mockTherapist);

      expect(result.overallCompatibilityScore).toBeGreaterThan(0);
      expect(result.compatibilityFactors.strengths).toBeInstanceOf(Array);
      expect(result.compatibilityFactors.concerns).toBeInstanceOf(Array);
      expect(result.compatibilityFactors.recommendations).toBeInstanceOf(Array);
    });

    it('should handle therapist with minimal data', async () => {
      const therapistWithMinimalData = {
        ...mockTherapist,
        approaches: [],
        languagesOffered: [],
        expertise: [],
        illnessSpecializations: [],
      };

      const result = await service.analyzeCompatibility(mockClient, therapistWithMinimalData);

      expect(result.overallCompatibilityScore).toBeGreaterThanOrEqual(0);
      expect(result.personalityCompatibility.overallCompatibility).toBeGreaterThanOrEqual(0);
    });
  });

  describe('analyzePersonalityCompatibility', () => {
    it('should analyze personality compatibility with high scores for good matches', () => {
      const result = (service as any).analyzePersonalityCompatibility(
        mockClient.preAssessment,
        { communicationStyle: 'direct', therapistWarmth: 'high' },
        mockTherapist,
      );

      expect(result).toEqual({
        communicationStyle: expect.any(Number),
        personalityMatch: expect.any(Number),
        culturalCompatibility: expect.any(Number),
        overallCompatibility: expect.any(Number),
      });

      expect(result.communicationStyle).toBeGreaterThan(70);
      expect(result.overallCompatibility).toBeGreaterThan(0);
      expect(result.overallCompatibility).toBeLessThanOrEqual(100);
    });

    it('should analyze personality compatibility with lower scores for poor matches', () => {
      const poorMatchTherapist = {
        ...mockTherapist,
        approaches: ['Psychoanalytic Therapy'],
        languagesOffered: ['Spanish'],
      };

      const result = (service as any).analyzePersonalityCompatibility(
        mockClient.preAssessment,
        { communicationStyle: 'direct' },
        poorMatchTherapist,
      );

      expect(result.communicationStyle).toBeGreaterThanOrEqual(0);
      expect(result.personalityMatch).toBeGreaterThanOrEqual(0);
      expect(result.overallCompatibility).toBeGreaterThanOrEqual(0);
    });
  });

  describe('analyzeCommunicationStyle', () => {
    it('should give high scores for direct communication style with CBT therapist', () => {
      const score = (service as any).analyzeCommunicationStyle(
        mockClient.preAssessment,
        { communicationStyle: 'direct' },
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give high scores for gentle communication style with person-centered therapist', () => {
      const score = (service as any).analyzeCommunicationStyle(
        mockClient.preAssessment,
        { communicationStyle: 'gentle' },
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give bonus for anxiety with CBT approach', () => {
      const anxietyAssessment = {
        ...mockClient.preAssessment,
        severityLevels: { anxiety: 'Moderate' },
      };

      const score = (service as any).analyzeCommunicationStyle(
        anxietyAssessment,
        {},
        mockTherapist,
      );

      expect(score).toBeGreaterThan(70);
    });

    it('should give bonus for PTSD with EMDR approach', () => {
      const ptsdAssessment = {
        ...mockClient.preAssessment,
        severityLevels: { ptsd: 'Severe' },
      };

      const emdrTherapist = {
        ...mockTherapist,
        approaches: ['Eye Movement Desensitization and Reprocessing (EMDR)'],
      };

      const score = (service as any).analyzeCommunicationStyle(
        ptsdAssessment,
        {},
        emdrTherapist,
      );

      expect(score).toBeGreaterThan(80);
    });

    it('should give bonus for depression with IPT approach', () => {
      const depressionAssessment = {
        ...mockClient.preAssessment,
        severityLevels: { depression: 'Severe' },
      };

      const iptTherapist = {
        ...mockTherapist,
        approaches: ['Interpersonal Therapy (IPT)'],
      };

      const score = (service as any).analyzeCommunicationStyle(
        depressionAssessment,
        {},
        iptTherapist,
      );

      expect(score).toBeGreaterThan(75);
    });

    it('should handle missing communication style preference', () => {
      const score = (service as any).analyzeCommunicationStyle(
        mockClient.preAssessment,
        {},
        mockTherapist,
      );

      expect(score).toBeGreaterThan(60);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('analyzePersonalityMatch', () => {
    it('should give high scores for social anxiety with calm therapist personality', () => {
      const socialAnxietyAssessment = {
        ...mockClient.preAssessment,
        severityLevels: { social_anxiety: 'Severe' },
      };

      const score = (service as any).analyzePersonalityMatch(
        socialAnxietyAssessment,
        { therapistPersonality: 'calm' },
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80);
    });

    it('should give high scores for OCD with structured approaches', () => {
      const ocdAssessment = {
        ...mockClient.preAssessment,
        severityLevels: { ocd: 'Moderate' },
      };

      const score = (service as any).analyzePersonalityMatch(
        ocdAssessment,
        {},
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80);
    });

    it('should give bonus for ADHD with behavioral therapy', () => {
      const adhdAssessment = {
        ...mockClient.preAssessment,
        severityLevels: { adhd: 'Moderate' },
      };

      const behavioralTherapist = {
        ...mockTherapist,
        approaches: ['Behavioral Therapy'],
      };

      const score = (service as any).analyzePersonalityMatch(
        adhdAssessment,
        {},
        behavioralTherapist,
      );

      expect(score).toBeGreaterThan(80);
    });

    it('should give bonus for high warmth preference with person-centered therapy', () => {
      const score = (service as any).analyzePersonalityMatch(
        mockClient.preAssessment,
        { therapistWarmth: 'high' },
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80);
    });

    it('should handle missing personality preferences', () => {
      const score = (service as any).analyzePersonalityMatch(
        mockClient.preAssessment,
        {},
        mockTherapist,
      );

      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('analyzeCulturalCompatibility', () => {
    it('should give high scores for matching languages', () => {
      const score = (service as any).analyzeCulturalCompatibility(
        { preferredLanguages: ['English'] },
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80);
    });

    it('should penalize language barriers', () => {
      const noLanguageMatchTherapist = {
        ...mockTherapist,
        languagesOffered: ['Spanish'],
      };

      const score = (service as any).analyzeCulturalCompatibility(
        { preferredLanguages: ['English'] },
        noLanguageMatchTherapist,
      );

      expect(score).toBeLessThan(60);
    });

    it('should give bonus for multiple shared languages', () => {
      const score = (service as any).analyzeCulturalCompatibility(
        { preferredLanguages: ['English', 'Filipino'] },
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80);
    });

    it('should give bonus for matching spiritual preferences', () => {
      const spiritualTherapist = {
        ...mockTherapist,
        approaches: ['Spiritual Therapy'],
      };

      const score = (service as any).analyzeCulturalCompatibility(
        { spiritualPreferences: 'important' },
        spiritualTherapist,
      );

      expect(score).toBeGreaterThan(90);
    });

    it('should penalize conflicting spiritual preferences', () => {
      const spiritualTherapist = {
        ...mockTherapist,
        approaches: ['Spiritual Therapy'],
      };

      const score = (service as any).analyzeCulturalCompatibility(
        { spiritualPreferences: 'avoid' },
        spiritualTherapist,
      );

      expect(score).toBeLessThan(70);
    });

    it('should handle missing language preferences', () => {
      const score = (service as any).analyzeCulturalCompatibility(
        {},
        mockTherapist,
      );

      expect(score).toBeGreaterThan(70);
    });
  });

  describe('analyzeSessionCompatibility', () => {
    it('should analyze session compatibility comprehensively', () => {
      const result = (service as any).analyzeSessionCompatibility(
        { sessionFormat: ['online'], sessionDuration: '60', sessionFrequency: 'weekly' },
        mockTherapist,
      );

      expect(result).toEqual({
        formatMatch: expect.any(Number),
        durationMatch: expect.any(Number),
        frequencyMatch: expect.any(Number),
        schedulingCompatibility: 80,
        overallCompatibility: expect.any(Number),
      });

      expect(result.overallCompatibility).toBeGreaterThan(0);
      expect(result.overallCompatibility).toBeLessThanOrEqual(100);
    });

    it('should calculate weighted overall compatibility', () => {
      const result = (service as any).analyzeSessionCompatibility(
        { sessionFormat: ['online'], sessionDuration: '60', sessionFrequency: 'weekly' },
        mockTherapist,
      );

      // Verify it's a weighted average
      const expectedOverall = Math.round(
        result.formatMatch * 0.3 +
        result.durationMatch * 0.2 +
        result.frequencyMatch * 0.2 +
        result.schedulingCompatibility * 0.3,
      );

      expect(result.overallCompatibility).toBe(expectedOverall);
    });
  });

  describe('analyzeFormatCompatibility', () => {
    it('should give high scores for online format with experienced online therapist', () => {
      const score = (service as any).analyzeFormatCompatibility(
        { sessionFormat: ['online'] },
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80);
    });

    it('should give high scores for in-person format', () => {
      const score = (service as any).analyzeFormatCompatibility(
        { sessionFormat: ['in-person'] },
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80);
    });

    it('should penalize online format with therapist not comfortable with video', () => {
      const uncomfortableTherapist = {
        ...mockTherapist,
        comfortableUsingVideoConferencing: false,
      };

      const score = (service as any).analyzeFormatCompatibility(
        { sessionFormat: ['online'] },
        uncomfortableTherapist,
      );

      expect(score).toBeLessThan(60);
    });

    it('should handle non-array session format', () => {
      const score = (service as any).analyzeFormatCompatibility(
        { sessionFormat: 'online' },
        mockTherapist,
      );

      expect(score).toBe(70); // Default neutral score
    });

    it('should handle missing session format preference', () => {
      const score = (service as any).analyzeFormatCompatibility(
        {},
        mockTherapist,
      );

      expect(score).toBeGreaterThan(80); // Default preference includes both formats
    });
  });

  describe('analyzeDurationCompatibility', () => {
    it('should give high scores for matching duration', () => {
      const score = (service as any).analyzeDurationCompatibility(
        { sessionDuration: '60' },
        mockTherapist,
      );

      expect(score).toBe(90);
    });

    it('should give neutral score for missing duration preference', () => {
      const score = (service as any).analyzeDurationCompatibility(
        {},
        mockTherapist,
      );

      expect(score).toBe(80);
    });

    it('should give lower score for non-matching duration', () => {
      const score = (service as any).analyzeDurationCompatibility(
        { sessionDuration: '90' },
        mockTherapist,
      );

      expect(score).toBe(60);
    });

    it('should handle close duration matches', () => {
      const therapistWithFlexibleDuration = {
        ...mockTherapist,
        preferredSessionLength: [45, 50, 55],
      };

      const score = (service as any).analyzeDurationCompatibility(
        { sessionDuration: '50' },
        therapistWithFlexibleDuration,
      );

      expect(score).toBe(90);
    });
  });

  describe('analyzeFrequencyCompatibility', () => {
    it('should give neutral score for any frequency preference', () => {
      const score = (service as any).analyzeFrequencyCompatibility(
        { sessionFrequency: 'weekly' },
        mockTherapist,
      );

      expect(score).toBe(85);
    });

    it('should give neutral score for missing frequency preference', () => {
      const score = (service as any).analyzeFrequencyCompatibility(
        {},
        mockTherapist,
      );

      expect(score).toBe(80);
    });
  });

  describe('analyzeDemographicCompatibility', () => {
    it('should analyze demographic compatibility comprehensively', () => {
      const result = (service as any).analyzeDemographicCompatibility(
        mockClient,
        { therapistGender: 'Female', therapistAge: '30-40', preferredLanguages: ['English'] },
        mockTherapist,
      );

      expect(result).toEqual({
        ageCompatibility: expect.any(Number),
        genderCompatibility: expect.any(Number),
        languageCompatibility: expect.any(Number),
        culturalCompatibility: expect.any(Number),
        overallCompatibility: expect.any(Number),
      });

      expect(result.overallCompatibility).toBeGreaterThan(0);
      expect(result.overallCompatibility).toBeLessThanOrEqual(100);
    });

    it('should calculate weighted overall compatibility', () => {
      const result = (service as any).analyzeDemographicCompatibility(
        mockClient,
        { preferredLanguages: ['English'] },
        mockTherapist,
      );

      // Verify it's a weighted average
      const expectedOverall = Math.round(
        result.ageCompatibility * 0.2 +
        result.genderCompatibility * 0.3 +
        result.languageCompatibility * 0.3 +
        result.culturalCompatibility * 0.2,
      );

      expect(result.overallCompatibility).toBe(expectedOverall);
    });
  });

  describe('analyzeAgeCompatibility', () => {
    it('should give high scores for no age preference', () => {
      const score = (service as any).analyzeAgeCompatibility(
        mockClient,
        { therapistAge: 'any' },
        mockTherapist,
      );

      expect(score).toBe(90);
    });

    it('should give neutral score for specific age preference', () => {
      const score = (service as any).analyzeAgeCompatibility(
        mockClient,
        { therapistAge: '30-40' },
        mockTherapist,
      );

      expect(score).toBe(75);
    });

    it('should give high score for missing age preference', () => {
      const score = (service as any).analyzeAgeCompatibility(
        mockClient,
        {},
        mockTherapist,
      );

      expect(score).toBe(90);
    });
  });

  describe('analyzeGenderCompatibility', () => {
    it('should give high scores for no gender preference', () => {
      const score = (service as any).analyzeGenderCompatibility(
        { therapistGender: 'any' },
        mockTherapist,
      );

      expect(score).toBe(90);
    });

    it('should give neutral score for specific gender preference', () => {
      const score = (service as any).analyzeGenderCompatibility(
        { therapistGender: 'Female' },
        mockTherapist,
      );

      expect(score).toBe(75);
    });

    it('should give high score for missing gender preference', () => {
      const score = (service as any).analyzeGenderCompatibility(
        {},
        mockTherapist,
      );

      expect(score).toBe(90);
    });
  });

  describe('analyzeLanguageCompatibility', () => {
    it('should give high scores for perfect language match', () => {
      const score = (service as any).analyzeLanguageCompatibility(
        { preferredLanguages: ['English'] },
        mockTherapist,
      );

      expect(score).toBe(100);
    });

    it('should give partial scores for partial language match', () => {
      const score = (service as any).analyzeLanguageCompatibility(
        { preferredLanguages: ['English', 'Spanish'] },
        mockTherapist,
      );

      expect(score).toBe(60); // 50% match
    });

    it('should give poor scores for no language match', () => {
      const noLanguageMatchTherapist = {
        ...mockTherapist,
        languagesOffered: ['Spanish'],
      };

      const score = (service as any).analyzeLanguageCompatibility(
        { preferredLanguages: ['English'] },
        noLanguageMatchTherapist,
      );

      expect(score).toBe(20);
    });

    it('should handle missing language preferences', () => {
      const score = (service as any).analyzeLanguageCompatibility(
        {},
        mockTherapist,
      );

      expect(score).toBe(100); // Default to English match
    });
  });

  describe('calculateOverallCompatibility', () => {
    it('should calculate weighted overall compatibility score', () => {
      const personality: PersonalityCompatibility = {
        communicationStyle: 80,
        personalityMatch: 85,
        culturalCompatibility: 90,
        overallCompatibility: 85,
      };

      const session: SessionCompatibility = {
        formatMatch: 90,
        durationMatch: 85,
        frequencyMatch: 80,
        schedulingCompatibility: 80,
        overallCompatibility: 85,
      };

      const demographic: DemographicCompatibility = {
        ageCompatibility: 75,
        genderCompatibility: 80,
        languageCompatibility: 95,
        culturalCompatibility: 85,
        overallCompatibility: 85,
      };

      const result = (service as any).calculateOverallCompatibility(
        personality,
        session,
        demographic,
      );

      const expectedScore = Math.round(
        personality.overallCompatibility * 0.4 +
        session.overallCompatibility * 0.3 +
        demographic.overallCompatibility * 0.3,
      );

      expect(result).toBe(expectedScore);
    });
  });

  describe('generateCompatibilityFactors', () => {
    it('should generate comprehensive compatibility factors', () => {
      const personality: PersonalityCompatibility = {
        communicationStyle: 85,
        personalityMatch: 90,
        culturalCompatibility: 80,
        overallCompatibility: 85,
      };

      const session: SessionCompatibility = {
        formatMatch: 90,
        durationMatch: 85,
        frequencyMatch: 80,
        schedulingCompatibility: 80,
        overallCompatibility: 85,
      };

      const demographic: DemographicCompatibility = {
        ageCompatibility: 75,
        genderCompatibility: 80,
        languageCompatibility: 95,
        culturalCompatibility: 85,
        overallCompatibility: 85,
      };

      const result = (service as any).generateCompatibilityFactors(
        personality,
        session,
        demographic,
        { sessionFormat: ['online'] },
        mockTherapist,
      );

      expect(result).toEqual({
        strengths: expect.any(Array),
        concerns: expect.any(Array),
        recommendations: expect.any(Array),
      });

      expect(result.strengths).toContain('Strong personality compatibility');
      expect(result.strengths).toContain('Session format preferences align well');
      expect(result.strengths).toContain('Shared language proficiency');
    });

    it('should identify concerns for low compatibility scores', () => {
      const lowCompatibility: PersonalityCompatibility = {
        communicationStyle: 45,
        personalityMatch: 50,
        culturalCompatibility: 40,
        overallCompatibility: 45,
      };

      const lowSession: SessionCompatibility = {
        formatMatch: 45,
        durationMatch: 50,
        frequencyMatch: 55,
        schedulingCompatibility: 50,
        overallCompatibility: 50,
      };

      const lowDemographic: DemographicCompatibility = {
        ageCompatibility: 50,
        genderCompatibility: 45,
        languageCompatibility: 40,
        culturalCompatibility: 45,
        overallCompatibility: 45,
      };

      const result = (service as any).generateCompatibilityFactors(
        lowCompatibility,
        lowSession,
        lowDemographic,
        { sessionFormat: ['online'] },
        mockTherapist,
      );

      expect(result.concerns).toContain('Communication style may not be ideal match');
      expect(result.concerns).toContain('Session format preferences may conflict');
      expect(result.concerns).toContain('Language barriers may affect communication');
    });

    it('should provide recommendations for low compatibility areas', () => {
      const lowCompatibility: PersonalityCompatibility = {
        communicationStyle: 50,
        personalityMatch: 60,
        culturalCompatibility: 55,
        overallCompatibility: 55,
      };

      const lowSession: SessionCompatibility = {
        formatMatch: 50,
        durationMatch: 60,
        frequencyMatch: 65,
        schedulingCompatibility: 60,
        overallCompatibility: 60,
      };

      const lowDemographic: DemographicCompatibility = {
        ageCompatibility: 60,
        genderCompatibility: 55,
        languageCompatibility: 50,
        culturalCompatibility: 55,
        overallCompatibility: 55,
      };

      const result = (service as any).generateCompatibilityFactors(
        lowCompatibility,
        lowSession,
        lowDemographic,
        { sessionFormat: ['online'] },
        mockTherapist,
      );

      expect(result.recommendations).toContain('Consider discussing communication preferences in initial session');
      expect(result.recommendations).toContain('Flexibility in session format may be beneficial');
      expect(result.recommendations).toContain('Cultural sensitivity and accommodation may be important');
    });
  });

  describe('parseClientPreferences', () => {
    it('should parse JSON array preferences correctly', () => {
      const preferences = [
        {
          id: 'pref-1',
          userId: 'user-123',
          key: 'sessionFormat',
          value: '["online", "in-person"]',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pref-2',
          userId: 'user-123',
          key: 'therapistGender',
          value: 'Female',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const parsed = (service as any).parseClientPreferences(preferences);

      expect(parsed.sessionFormat).toEqual(['online', 'in-person']);
      expect(parsed.therapistGender).toBe('Female');
    });

    it('should handle malformed JSON gracefully', () => {
      const preferences = [
        {
          id: 'pref-1',
          userId: 'user-123',
          key: 'sessionFormat',
          value: 'invalid-json[',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const parsed = (service as any).parseClientPreferences(preferences);

      expect(parsed.sessionFormat).toBe('invalid-json[');
    });

    it('should handle non-JSON string values', () => {
      const preferences = [
        {
          id: 'pref-1',
          userId: 'user-123',
          key: 'sessionDuration',
          value: '60',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const parsed = (service as any).parseClientPreferences(preferences);

      expect(parsed.sessionDuration).toBe('60');
    });
  });

  describe('getSeverityWeight', () => {
    it('should return correct weights for all severity levels', () => {
      const testCases = [
        { severity: 'Minimal', expected: 1 },
        { severity: 'Mild', expected: 2 },
        { severity: 'Moderate', expected: 3 },
        { severity: 'Moderately Severe', expected: 4 },
        { severity: 'Severe', expected: 5 },
        { severity: 'Very Severe', expected: 5 },
        { severity: 'Extreme', expected: 5 },
        { severity: 'Low', expected: 1 },
        { severity: 'High', expected: 4 },
        { severity: 'Substantial', expected: 4 },
        { severity: 'Subclinical', expected: 1 },
        { severity: 'Clinical', expected: 4 },
        { severity: 'Subthreshold', expected: 2 },
        { severity: 'Positive', expected: 4 },
        { severity: 'Negative', expected: 0 },
        { severity: 'None', expected: 0 },
      ];

      testCases.forEach(({ severity, expected }) => {
        const weight = (service as any).getSeverityWeight(severity);
        expect(weight).toBe(expected);
      });
    });

    it('should return default weight for unknown severity', () => {
      const weight = (service as any).getSeverityWeight('Unknown');
      expect(weight).toBe(1);
    });
  });

  describe('integration tests', () => {
    it('should handle complete compatibility analysis workflow', async () => {
      const result = await service.analyzeCompatibility(mockClient, mockTherapist);

      // Verify all components are present and reasonable
      expect(result.personalityCompatibility.overallCompatibility).toBeGreaterThan(50);
      expect(result.sessionCompatibility.overallCompatibility).toBeGreaterThan(50);
      expect(result.demographicCompatibility.overallCompatibility).toBeGreaterThan(50);
      expect(result.overallCompatibilityScore).toBeGreaterThan(50);

      // Verify compatibility factors are meaningful
      expect(result.compatibilityFactors.strengths.length).toBeGreaterThan(0);
      expect(result.compatibilityFactors.concerns.length).toBeGreaterThanOrEqual(0);
      expect(result.compatibilityFactors.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('should produce different results for different client-therapist pairs', async () => {
      const differentClient = {
        ...mockClient,
        preAssessment: {
          ...mockClient.preAssessment,
          severityLevels: { 'eating_disorder': 'Severe' },
        },
        clientPreferences: [
          {
            id: 'pref-1',
            userId: 'user-123',
            key: 'communicationStyle',
            value: 'gentle',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      const differentTherapist = {
        ...mockTherapist,
        approaches: ['Psychodynamic Therapy'],
        languagesOffered: ['Spanish'],
        providedOnlineTherapyBefore: false,
      };

      const result1 = await service.analyzeCompatibility(mockClient, mockTherapist);
      const result2 = await service.analyzeCompatibility(differentClient, differentTherapist);

      expect(result1.overallCompatibilityScore).not.toBe(result2.overallCompatibilityScore);
      expect(result1.personalityCompatibility.communicationStyle).not.toBe(
        result2.personalityCompatibility.communicationStyle,
      );
    });
  });
});