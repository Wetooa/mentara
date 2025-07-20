import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { DatabaseTestSetup } from '../database-test.setup';
import { TestDataGenerator } from '../enhanced-test-helpers';

/**
 * Matching Analytics Integration Tests
 * 
 * Comprehensive testing of the AI/ML matching analytics system including
 * match history, client compatibility, recommendation feedback, and algorithm performance tracking.
 */
describe('Matching Analytics Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

  // Test entities
  let testClients: any[] = [];
  let testTherapists: any[] = [];

  beforeAll(async () => {
    // Setup test database
    prisma = await DatabaseTestSetup.setupTestDatabase();

    moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Create test users and profiles
    await setupTestData();
  });

  afterEach(async () => {
    // Clean analytics data but keep users
    await cleanAnalyticsData();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  async function setupTestData() {
    // Create test clients
    for (let i = 1; i <= 3; i++) {
      const clientUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: `analytics-client-${i}`,
          email: `client${i}@analytics.com`,
          firstName: `Client${i}`,
          lastName: 'User',
          role: 'client',
        }),
      });

      const client = await prisma.client.create({
        data: {
          userId: clientUser.id,
          hasSeenTherapistRecommendations: i > 1, // First client hasn't seen recommendations yet
        },
      });

      testClients.push({ user: clientUser, client });
    }

    // Create test therapists
    const specializations = [
      ['Anxiety', 'Depression', 'PTSD'],
      ['ADHD', 'Bipolar', 'Eating Disorders'],
      ['Addiction', 'Trauma', 'Grief'],
    ];

    const approaches = [
      ['CBT', 'DBT', 'ACT'],
      ['Psychodynamic', 'Humanistic', 'Solution-Focused'],
      ['EMDR', 'Narrative Therapy', 'Family Systems'],
    ];

    for (let i = 1; i <= 3; i++) {
      const therapistUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: `analytics-therapist-${i}`,
          email: `therapist${i}@analytics.com`,
          firstName: `Dr. Therapist${i}`,
          lastName: 'Professional',
          role: 'therapist',
        }),
      });

      const therapist = await prisma.therapist.create({
        data: {
          userId: therapistUser.id,
          mobile: `+123456789${i}`,
          province: 'Ontario',
          providerType: 'Clinical Psychologist',
          professionalLicenseType: 'Licensed',
          isPRCLicensed: 'yes',
          prcLicenseNumber: `PRC12345${i}`,
          practiceStartDate: new Date('2020-01-01'),
          yearsOfExperience: 5 + i,
          areasOfExpertise: specializations[i - 1],
          assessmentTools: ['PHQ-9', 'GAD-7', 'PCL-5'].slice(0, i + 1),
          therapeuticApproachesUsedList: approaches[i - 1],
          languagesOffered: ['English', 'French'].slice(0, i),
          providedOnlineTherapyBefore: true,
          comfortableUsingVideoConferencing: true,
          preferredSessionLength: [60, 90].slice(0, i),
          acceptTypes: ['Individual', 'Couples', 'Family'].slice(0, i + 1),
          status: 'approved',
          hourlyRate: 100 + (i * 25),
          expirationDateOfLicense: new Date('2025-01-01'),
          compliesWithDataPrivacyAct: true,
          willingToAbideByPlatformGuidelines: true,
          treatmentSuccessRates: {
            anxiety: 0.85 + (i * 0.05),
            depression: 0.80 + (i * 0.03),
          },
          sessionLength: '60 minutes',
        },
      });

      testTherapists.push({ user: therapistUser, therapist });
    }
  }

  async function cleanAnalyticsData() {
    await prisma.recommendationFeedback.deleteMany();
    await prisma.algorithmPerformance.deleteMany();
    await prisma.clientCompatibility.deleteMany();
    await prisma.matchHistory.deleteMany();
    await prisma.matchingWeight.deleteMany();
  }

  describe('Matching Weight Configuration', () => {
    it('should create and manage matching weights', async () => {
      // Create matching weights
      const weights = await prisma.matchingWeight.createMany({
        data: [
          {
            name: 'conditionMatch',
            weight: 0.30,
            description: 'How well therapist specializations match client conditions',
            isActive: true,
          },
          {
            name: 'approachCompatibility',
            weight: 0.25,
            description: 'Compatibility of therapeutic approaches with client preferences',
            isActive: true,
          },
          {
            name: 'experienceLevel',
            weight: 0.20,
            description: 'Therapist experience level and track record',
            isActive: true,
          },
          {
            name: 'logisticsMatch',
            weight: 0.15,
            description: 'Schedule, location, and session format compatibility',
            isActive: true,
          },
          {
            name: 'reviewScore',
            weight: 0.10,
            description: 'Therapist average rating and reviews',
            isActive: true,
          },
        ],
      });

      // Verify weights created
      const createdWeights = await prisma.matchingWeight.findMany({
        orderBy: { weight: 'desc' },
      });

      expect(createdWeights).toHaveLength(5);
      expect(createdWeights[0].name).toBe('conditionMatch');
      expect(createdWeights[0].weight).toBe(0.30);
      
      // Verify total weights sum to 1.0
      const totalWeight = createdWeights.reduce((sum, w) => sum + w.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0, 2);
    });

    it('should handle weight updates and deactivation', async () => {
      // Create initial weight
      const weight = await prisma.matchingWeight.create({
        data: {
          name: 'personalityMatch',
          weight: 0.15,
          description: 'Personality compatibility assessment',
          isActive: true,
        },
      });

      // Update weight value
      const updatedWeight = await prisma.matchingWeight.update({
        where: { id: weight.id },
        data: {
          weight: 0.18,
          description: 'Enhanced personality compatibility assessment',
        },
      });

      // Deactivate weight
      await prisma.matchingWeight.update({
        where: { id: weight.id },
        data: { isActive: false },
      });

      // Verify changes
      const finalWeight = await prisma.matchingWeight.findUnique({
        where: { id: weight.id },
      });

      expect(finalWeight?.weight).toBe(0.18);
      expect(finalWeight?.isActive).toBe(false);
      expect(finalWeight?.description).toContain('Enhanced');
    });
  });

  describe('Match History Creation and Tracking', () => {
    it('should create comprehensive match history records', async () => {
      const client = testClients[0];
      const therapist = testTherapists[0];

      // Create match history
      const matchHistory = await prisma.matchHistory.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          totalScore: 85,
          conditionScore: 90,
          approachScore: 80,
          experienceScore: 85,
          reviewScore: 88,
          logisticsScore: 75,
          compatibilityScore: 82,
          primaryMatches: ['Anxiety', 'Depression'],
          secondaryMatches: ['Stress Management'],
          approachMatches: ['CBT', 'DBT'],
          recommendationRank: 1,
          totalRecommendations: 5,
          wasViewed: true,
          wasContacted: true,
          becameClient: true,
          sessionCount: 3,
          clientSatisfactionScore: 5,
          recommendationAlgorithm: 'advanced',
          userAgent: 'Mozilla/5.0 Chrome/120.0',
        },
      });

      // Verify match history creation
      const createdMatch = await prisma.matchHistory.findUnique({
        where: { id: matchHistory.id },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          therapist: {
            include: {
              user: true,
            },
          },
        },
      });

      expect(createdMatch?.totalScore).toBe(85);
      expect(createdMatch?.primaryMatches).toContain('Anxiety');
      expect(createdMatch?.approachMatches).toContain('CBT');
      expect(createdMatch?.recommendationRank).toBe(1);
      expect(createdMatch?.becameClient).toBe(true);
      expect(createdMatch?.clientSatisfactionScore).toBe(5);
    });

    it('should track recommendation funnel progression', async () => {
      const client = testClients[1];

      // Create multiple match histories for different therapists with different outcomes
      const matches = [
        {
          therapistId: testTherapists[0].therapist.userId,
          rank: 1,
          wasViewed: true,
          wasContacted: true,
          becameClient: true,
          sessions: 5,
          satisfaction: 5,
        },
        {
          therapistId: testTherapists[1].therapist.userId,
          rank: 2,
          wasViewed: true,
          wasContacted: false,
          becameClient: false,
          sessions: 0,
          satisfaction: null,
        },
        {
          therapistId: testTherapists[2].therapist.userId,
          rank: 3,
          wasViewed: false,
          wasContacted: false,
          becameClient: false,
          sessions: 0,
          satisfaction: null,
        },
      ];

      for (const match of matches) {
        await prisma.matchHistory.create({
          data: {
            clientId: client.client.userId,
            therapistId: match.therapistId,
            totalScore: 85 - (match.rank * 5),
            conditionScore: 90 - (match.rank * 3),
            approachScore: 80 - (match.rank * 2),
            experienceScore: 85 - (match.rank * 2),
            reviewScore: 85 - (match.rank * 3),
            logisticsScore: 75,
            primaryMatches: ['Depression'],
            secondaryMatches: ['Anxiety'],
            approachMatches: ['CBT'],
            recommendationRank: match.rank,
            totalRecommendations: 3,
            wasViewed: match.wasViewed,
            wasContacted: match.wasContacted,
            becameClient: match.becameClient,
            sessionCount: match.sessions,
            clientSatisfactionScore: match.satisfaction,
            recommendationAlgorithm: 'advanced',
          },
        });
      }

      // Analyze funnel metrics
      const clientMatches = await prisma.matchHistory.findMany({
        where: { clientId: client.client.userId },
        orderBy: { recommendationRank: 'asc' },
      });

      const viewedCount = clientMatches.filter(m => m.wasViewed).length;
      const contactedCount = clientMatches.filter(m => m.wasContacted).length;
      const convertedCount = clientMatches.filter(m => m.becameClient).length;

      expect(clientMatches).toHaveLength(3);
      expect(viewedCount).toBe(2); // 67% view rate
      expect(contactedCount).toBe(1); // 50% contact rate from viewed
      expect(convertedCount).toBe(1); // 100% conversion rate from contacted
    });
  });

  describe('Client Compatibility Analysis', () => {
    it('should create detailed compatibility assessments', async () => {
      const client = testClients[0];
      const therapist = testTherapists[0];

      // Create compatibility assessment
      const compatibility = await prisma.clientCompatibility.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          personalityCompatibility: 85,
          sessionCompatibility: 90,
          demographicCompatibility: 75,
          overallCompatibility: 83,
          communicationStyleScore: 88,
          personalityMatchScore: 82,
          culturalCompatibilityScore: 78,
          formatMatchScore: 95,
          durationMatchScore: 85,
          frequencyMatchScore: 80,
          schedulingCompatibilityScore: 70,
          ageCompatibilityScore: 85,
          genderCompatibilityScore: 90,
          languageCompatibilityScore: 100,
          strengths: [
            'Excellent communication style match',
            'Strong therapeutic approach alignment',
            'Compatible session preferences',
          ],
          concerns: [
            'Slight scheduling conflicts',
            'Geographic distance considerations',
          ],
          recommendations: [
            'Schedule sessions during mutually available times',
            'Consider video sessions to overcome distance',
            'Focus on CBT techniques given strong alignment',
          ],
          analysisVersion: '2.1',
        },
      });

      // Verify compatibility assessment
      const createdCompatibility = await prisma.clientCompatibility.findUnique({
        where: { id: compatibility.id },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          therapist: {
            include: {
              user: true,
            },
          },
        },
      });

      expect(createdCompatibility?.overallCompatibility).toBe(83);
      expect(createdCompatibility?.strengths).toHaveLength(3);
      expect(createdCompatibility?.concerns).toHaveLength(2);
      expect(createdCompatibility?.recommendations).toHaveLength(3);
      expect(createdCompatibility?.languageCompatibilityScore).toBe(100);
    });

    it('should handle compatibility updates and versioning', async () => {
      const client = testClients[1];
      const therapist = testTherapists[1];

      // Create initial compatibility
      const initialCompatibility = await prisma.clientCompatibility.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          personalityCompatibility: 70,
          sessionCompatibility: 75,
          demographicCompatibility: 80,
          overallCompatibility: 75,
          communicationStyleScore: 72,
          personalityMatchScore: 68,
          culturalCompatibilityScore: 85,
          formatMatchScore: 80,
          durationMatchScore: 70,
          frequencyMatchScore: 75,
          schedulingCompatibilityScore: 65,
          ageCompatibilityScore: 90,
          genderCompatibilityScore: 85,
          languageCompatibilityScore: 90,
          strengths: ['Good demographic match'],
          concerns: ['Some communication style differences'],
          recommendations: ['Consider communication preferences'],
          analysisVersion: '1.0',
        },
      });

      // Update compatibility with new analysis
      const updatedCompatibility = await prisma.clientCompatibility.update({
        where: { id: initialCompatibility.id },
        data: {
          personalityCompatibility: 78,
          sessionCompatibility: 82,
          overallCompatibility: 80,
          communicationStyleScore: 80,
          personalityMatchScore: 76,
          strengths: [
            'Good demographic match',
            'Improved communication alignment after assessment',
          ],
          concerns: ['Minor scheduling conflicts remain'],
          recommendations: [
            'Focus on building rapport early',
            'Flexible scheduling arrangements',
          ],
          analysisVersion: '1.1',
        },
      });

      expect(updatedCompatibility.overallCompatibility).toBe(80);
      expect(updatedCompatibility.analysisVersion).toBe('1.1');
      expect(updatedCompatibility.strengths).toHaveLength(2);
    });
  });

  describe('Recommendation Feedback Loop', () => {
    it('should track comprehensive recommendation feedback', async () => {
      const client = testClients[0];
      const therapist = testTherapists[0];

      // Create match history first
      const matchHistory = await prisma.matchHistory.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          totalScore: 88,
          conditionScore: 90,
          approachScore: 85,
          experienceScore: 90,
          reviewScore: 85,
          logisticsScore: 80,
          primaryMatches: ['Anxiety'],
          secondaryMatches: ['Depression'],
          approachMatches: ['CBT'],
          recommendationRank: 1,
          totalRecommendations: 3,
          wasViewed: true,
          wasContacted: true,
          becameClient: true,
          recommendationAlgorithm: 'advanced',
        },
      });

      // Create feedback
      const feedback = await prisma.recommendationFeedback.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          matchHistoryId: matchHistory.id,
          relevanceScore: 5,
          accuracyScore: 4,
          helpfulnessScore: 5,
          feedbackText: 'Excellent match! The therapist\'s specialization in anxiety perfectly matched my needs.',
          selectedTherapist: true,
          hadInitialSession: true,
          continuedTherapy: true,
          overallSatisfaction: 5,
        },
      });

      // Verify feedback creation
      const createdFeedback = await prisma.recommendationFeedback.findUnique({
        where: { id: feedback.id },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          therapist: {
            include: {
              user: true,
            },
          },
          matchHistory: true,
        },
      });

      expect(createdFeedback?.relevanceScore).toBe(5);
      expect(createdFeedback?.selectedTherapist).toBe(true);
      expect(createdFeedback?.continuedTherapy).toBe(true);
      expect(createdFeedback?.matchHistory?.totalScore).toBe(88);
    });

    it('should handle negative feedback scenarios', async () => {
      const client = testClients[1];
      const therapist = testTherapists[1];

      // Create match history for unsuccessful match
      const matchHistory = await prisma.matchHistory.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          totalScore: 72,
          conditionScore: 75,
          approachScore: 70,
          experienceScore: 75,
          reviewScore: 68,
          logisticsScore: 70,
          primaryMatches: ['ADHD'],
          secondaryMatches: [],
          approachMatches: ['Psychodynamic'],
          recommendationRank: 2,
          totalRecommendations: 5,
          wasViewed: true,
          wasContacted: true,
          becameClient: false,
          recommendationAlgorithm: 'basic',
        },
      });

      // Create negative feedback
      const feedback = await prisma.recommendationFeedback.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          matchHistoryId: matchHistory.id,
          relevanceScore: 2,
          accuracyScore: 2,
          helpfulnessScore: 1,
          feedbackText: 'The recommendation did not match my needs. The therapeutic approach was not suitable for my condition.',
          selectedTherapist: false,
          reasonNotSelected: 'Therapeutic approach mismatch and poor initial consultation experience',
          hadInitialSession: true,
          continuedTherapy: false,
          overallSatisfaction: 2,
        },
      });

      expect(feedback.relevanceScore).toBe(2);
      expect(feedback.selectedTherapist).toBe(false);
      expect(feedback.reasonNotSelected).toContain('approach mismatch');
      expect(feedback.continuedTherapy).toBe(false);
    });
  });

  describe('Algorithm Performance Tracking', () => {
    it('should track algorithm performance metrics', async () => {
      // Create performance record for advanced algorithm
      const performance = await prisma.algorithmPerformance.create({
        data: {
          algorithmName: 'advanced_ml',
          version: '2.1',
          totalRecommendations: 500,
          successfulMatches: 185,
          averageMatchScore: 82.5,
          averageSatisfactionScore: 4.2,
          periodStart: new Date('2024-01-01'),
          periodEnd: new Date('2024-01-31'),
          clickThroughRate: 0.75, // 75% viewed recommendations
          conversionRate: 0.37, // 37% became clients
          retentionRate: 0.82, // 82% continued therapy
        },
      });

      // Create performance record for basic algorithm
      const basicPerformance = await prisma.algorithmPerformance.create({
        data: {
          algorithmName: 'basic_scoring',
          version: '1.0',
          totalRecommendations: 300,
          successfulMatches: 90,
          averageMatchScore: 68.5,
          averageSatisfactionScore: 3.8,
          periodStart: new Date('2024-01-01'),
          periodEnd: new Date('2024-01-31'),
          clickThroughRate: 0.60,
          conversionRate: 0.30,
          retentionRate: 0.70,
        },
      });

      // Compare algorithm performance
      const algorithms = await prisma.algorithmPerformance.findMany({
        where: {
          periodStart: new Date('2024-01-01'),
          periodEnd: new Date('2024-01-31'),
        },
        orderBy: {
          conversionRate: 'desc',
        },
      });

      expect(algorithms).toHaveLength(2);
      expect(algorithms[0].algorithmName).toBe('advanced_ml');
      expect(algorithms[0].conversionRate).toBeGreaterThan(algorithms[1].conversionRate);
      expect(algorithms[0].averageSatisfactionScore).toBeGreaterThan(algorithms[1].averageSatisfactionScore);
    });

    it('should track performance trends over time', async () => {
      const algorithmName = 'ml_enhanced';
      const periods = [
        {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
          conversion: 0.32,
          satisfaction: 3.9,
        },
        {
          start: new Date('2024-02-01'),
          end: new Date('2024-02-29'),
          conversion: 0.35,
          satisfaction: 4.1,
        },
        {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-31'),
          conversion: 0.38,
          satisfaction: 4.3,
        },
      ];

      // Create performance records for each period
      for (const [index, period] of periods.entries()) {
        await prisma.algorithmPerformance.create({
          data: {
            algorithmName,
            version: '1.5',
            totalRecommendations: 400 + (index * 50),
            successfulMatches: Math.round((400 + (index * 50)) * period.conversion),
            averageMatchScore: 75.0 + (index * 2),
            averageSatisfactionScore: period.satisfaction,
            periodStart: period.start,
            periodEnd: period.end,
            clickThroughRate: 0.70 + (index * 0.02),
            conversionRate: period.conversion,
            retentionRate: 0.75 + (index * 0.03),
          },
        });
      }

      // Analyze performance trends
      const performanceTrend = await prisma.algorithmPerformance.findMany({
        where: { algorithmName },
        orderBy: { periodStart: 'asc' },
      });

      expect(performanceTrend).toHaveLength(3);
      expect(performanceTrend[2].conversionRate).toBeGreaterThan(performanceTrend[0].conversionRate);
      expect(performanceTrend[2].averageSatisfactionScore).toBeGreaterThan(performanceTrend[0].averageSatisfactionScore);
    });
  });

  describe('Complete Analytics Workflow', () => {
    it('should demonstrate end-to-end analytics flow', async () => {
      const client = testClients[2];
      const therapist = testTherapists[2];

      // 1. Setup matching weights
      await prisma.matchingWeight.createMany({
        data: [
          { name: 'conditionMatch', weight: 0.35, isActive: true },
          { name: 'approachCompatibility', weight: 0.30, isActive: true },
          { name: 'experienceLevel', weight: 0.20, isActive: true },
          { name: 'logisticsMatch', weight: 0.15, isActive: true },
        ],
      });

      // 2. Create compatibility analysis
      const compatibility = await prisma.clientCompatibility.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          personalityCompatibility: 92,
          sessionCompatibility: 88,
          demographicCompatibility: 85,
          overallCompatibility: 88,
          communicationStyleScore: 90,
          personalityMatchScore: 94,
          culturalCompatibilityScore: 82,
          formatMatchScore: 90,
          durationMatchScore: 85,
          frequencyMatchScore: 88,
          schedulingCompatibilityScore: 85,
          ageCompatibilityScore: 80,
          genderCompatibilityScore: 95,
          languageCompatibilityScore: 100,
          strengths: [
            'Exceptional personality compatibility',
            'Strong therapeutic approach alignment',
            'Excellent communication style match',
          ],
          concerns: [
            'Minor cultural adaptation needed',
          ],
          recommendations: [
            'Leverage strong personality match',
            'Focus on trauma-informed approaches',
            'Maintain consistent session schedule',
          ],
          analysisVersion: '3.0',
        },
      });

      // 3. Create match history
      const matchHistory = await prisma.matchHistory.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          totalScore: 92,
          conditionScore: 95,
          approachScore: 90,
          experienceScore: 88,
          reviewScore: 92,
          logisticsScore: 85,
          compatibilityScore: compatibility.overallCompatibility,
          primaryMatches: ['Trauma', 'PTSD'],
          secondaryMatches: ['Anxiety', 'Depression'],
          approachMatches: ['EMDR', 'Trauma-Informed CBT'],
          recommendationRank: 1,
          totalRecommendations: 4,
          wasViewed: true,
          wasContacted: true,
          becameClient: true,
          sessionCount: 8,
          clientSatisfactionScore: 5,
          recommendationAlgorithm: 'ml_enhanced',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
      });

      // 4. Create positive feedback
      const feedback = await prisma.recommendationFeedback.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          matchHistoryId: matchHistory.id,
          relevanceScore: 5,
          accuracyScore: 5,
          helpfulnessScore: 5,
          feedbackText: 'Outstanding match! The therapist\'s expertise in trauma therapy and EMDR has been transformative for my healing journey.',
          selectedTherapist: true,
          hadInitialSession: true,
          continuedTherapy: true,
          overallSatisfaction: 5,
        },
      });

      // 5. Update algorithm performance
      const algorithmPerformance = await prisma.algorithmPerformance.create({
        data: {
          algorithmName: 'ml_enhanced',
          version: '3.0',
          totalRecommendations: 100,
          successfulMatches: 42,
          averageMatchScore: 86.5,
          averageSatisfactionScore: 4.4,
          periodStart: new Date('2024-03-01'),
          periodEnd: new Date('2024-03-31'),
          clickThroughRate: 0.82,
          conversionRate: 0.42,
          retentionRate: 0.88,
        },
      });

      // 6. Verify complete analytics workflow
      const completeAnalytics = await prisma.matchHistory.findUnique({
        where: { id: matchHistory.id },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          therapist: {
            include: {
              user: true,
            },
          },
          feedback: {
            include: {
              client: true,
              therapist: true,
            },
          },
        },
      });

      const relatedCompatibility = await prisma.clientCompatibility.findUnique({
        where: {
          clientId_therapistId: {
            clientId: client.client.userId,
            therapistId: therapist.therapist.userId,
          },
        },
      });

      const weights = await prisma.matchingWeight.findMany({
        where: { isActive: true },
      });

      const performance = await prisma.algorithmPerformance.findUnique({
        where: { id: algorithmPerformance.id },
      });

      // Comprehensive assertions
      expect(completeAnalytics?.totalScore).toBe(92);
      expect(completeAnalytics?.becameClient).toBe(true);
      expect(completeAnalytics?.feedback).toHaveLength(1);
      expect(completeAnalytics?.feedback[0].overallSatisfaction).toBe(5);
      expect(relatedCompatibility?.overallCompatibility).toBe(88);
      expect(weights.reduce((sum, w) => sum + w.weight, 0)).toBeCloseTo(1.0);
      expect(performance?.conversionRate).toBe(0.42);
      expect(performance?.retentionRate).toBe(0.88);

      console.log('✅ Complete Analytics Workflow Verified:');
      console.log(`   Match Score: ${completeAnalytics?.totalScore}/100`);
      console.log(`   Compatibility: ${relatedCompatibility?.overallCompatibility}/100`);
      console.log(`   Client Satisfaction: ${completeAnalytics?.feedback[0].overallSatisfaction}/5`);
      console.log(`   Algorithm Performance: ${(performance?.conversionRate! * 100).toFixed(1)}% conversion`);
    });
  });
});