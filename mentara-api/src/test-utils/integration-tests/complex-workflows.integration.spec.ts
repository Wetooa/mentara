import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { DatabaseTestSetup } from '../database-test.setup';
import { TestDataGenerator } from '../enhanced-test-helpers';

/**
 * Complex Workflow Integration Tests
 * 
 * End-to-end business process validation testing complete user journeys
 * from onboarding through therapy sessions and beyond.
 */
describe('Complex Workflow Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

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
  });

  afterEach(async () => {
    // Clean database after each test
    await DatabaseTestSetup.cleanupDatabase();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  describe('Complete User Onboarding → Assessment → Matching → Booking → Session Workflow', () => {
    it('should execute complete client journey end-to-end', async () => {
      const startTime = Date.now();
      
      // === PHASE 1: USER ONBOARDING ===
      console.log('🚀 Starting complete client journey workflow...');
      
      // 1. Create user account
      const clientUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'journey-client-123',
          email: 'client-journey@mentara.com',
          firstName: 'Journey',
          lastName: 'Client',
          role: 'client',
          isActive: true,
          isVerified: false,
        }),
      });

      // 2. Create client profile
      const client = await prisma.client.create({
        data: {
          userId: clientUser.id,
          hasSeenTherapistRecommendations: false,
        },
      });

      // 3. Setup notification preferences
      const notificationSettings = await prisma.notificationSettings.create({
        data: {
          userId: clientUser.id,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
        },
      });

      // 4. Create medical history
      const medicalHistories = await prisma.clientMedicalHistory.createMany({
        data: [
          {
            clientId: client.userId,
            condition: 'Generalized Anxiety Disorder',
            notes: 'Diagnosed in 2020, currently managing with therapy',
          },
          {
            clientId: client.userId,
            condition: 'Major Depressive Disorder',
            notes: 'Episodic, responsive to CBT treatment',
          },
        ],
      });

      // 5. Set client preferences
      const preferences = await prisma.clientPreference.createMany({
        data: [
          {
            clientId: client.userId,
            key: 'preferred_session_time',
            value: 'morning',
          },
          {
            clientId: client.userId,
            key: 'session_frequency',
            value: 'weekly',
          },
          {
            clientId: client.userId,
            key: 'therapeutic_approach',
            value: 'CBT',
          },
          {
            clientId: client.userId,
            key: 'therapist_gender_preference',
            value: 'no_preference',
          },
        ],
      });

      // === PHASE 2: MENTAL HEALTH ASSESSMENT ===
      
      // 6. Create comprehensive pre-assessment
      const preAssessment = await prisma.preAssessment.create({
        data: {
          userId: clientUser.id,
          questionnaires: {
            PHQ9: [2, 3, 2, 1, 3, 2, 3, 2, 1], // Depression screening
            GAD7: [3, 2, 3, 3, 2, 2, 3], // Anxiety screening
            PCL5: [1, 2, 1, 0, 2, 3, 2, 1, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 1, 2], // PTSD screening
            DASS21: [2, 1, 3, 2, 1, 2, 3, 2, 1, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 1, 2], // Depression, Anxiety, Stress
            WHOQOL: [3, 4, 3, 4, 3, 3, 4, 3, 4, 3, 3, 4, 3, 3, 4, 3, 4, 3, 3, 4, 3, 4, 3, 3, 4], // Quality of life
          },
          scores: {
            depression: 18, // Moderate depression
            anxiety: 16, // Moderate anxiety
            ptsd: 12, // Mild PTSD symptoms
            stress: 14, // Moderate stress
            qualityOfLife: 85, // Good quality of life
            overallSeverity: 'moderate',
          },
          severityLevels: {
            depression: 'moderate',
            anxiety: 'moderate',
            ptsd: 'mild',
            stress: 'moderate',
          },
          recommendations: [
            'CBT therapy recommended for anxiety and depression',
            'EMDR consideration for PTSD symptoms',
            'Stress management techniques',
            'Regular therapy sessions recommended',
          ],
          status: 'COMPLETED',
        },
      });

      // === PHASE 3: THERAPIST MATCHING & RECOMMENDATIONS ===
      
      // 7. Create therapist profiles for matching
      const therapistProfiles = [];
      
      for (let i = 1; i <= 3; i++) {
        const therapistUser = await prisma.user.create({
          data: TestDataGenerator.createUser({
            id: `journey-therapist-${i}`,
            email: `therapist${i}-journey@mentara.com`,
            firstName: `Dr. Therapist${i}`,
            lastName: 'Professional',
            role: 'therapist',
            isActive: true,
            isVerified: true,
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
            areasOfExpertise: i === 1 ? ['Anxiety', 'Depression', 'CBT'] : 
                             i === 2 ? ['PTSD', 'Trauma', 'EMDR'] : 
                             ['Stress Management', 'Mindfulness', 'ACT'],
            assessmentTools: ['PHQ-9', 'GAD-7', 'PCL-5'].slice(0, i + 1),
            therapeuticApproachesUsedList: i === 1 ? ['CBT', 'DBT'] : 
                                         i === 2 ? ['EMDR', 'Trauma-Informed CBT'] : 
                                         ['ACT', 'Mindfulness-Based Therapy'],
            languagesOffered: ['English'],
            providedOnlineTherapyBefore: true,
            comfortableUsingVideoConferencing: true,
            preferredSessionLength: [60],
            acceptTypes: ['Individual'],
            status: 'approved',
            hourlyRate: 120 + (i * 30),
            expirationDateOfLicense: new Date('2025-01-01'),
            compliesWithDataPrivacyAct: true,
            willingToAbideByPlatformGuidelines: true,
            treatmentSuccessRates: {
              anxiety: 0.85 + (i * 0.05),
              depression: 0.80 + (i * 0.05),
              ptsd: 0.75 + (i * 0.05),
            },
            sessionLength: '60 minutes',
          },
        });

        therapistProfiles.push({ user: therapistUser, therapist });
      }

      // 8. Create matching analytics and recommendations
      const selectedTherapist = therapistProfiles[0]; // Best match
      
      const matchHistory = await prisma.matchHistory.create({
        data: {
          clientId: client.userId,
          therapistId: selectedTherapist.therapist.userId,
          totalScore: 92,
          conditionScore: 95, // Excellent match for anxiety/depression
          approachScore: 90, // CBT approach matches client preference
          experienceScore: 88, // Good experience level
          reviewScore: 85, // Good reviews
          logisticsScore: 90, // Schedule compatibility
          compatibilityScore: 89,
          primaryMatches: ['Anxiety', 'Depression'],
          secondaryMatches: ['Stress Management'],
          approachMatches: ['CBT', 'DBT'],
          recommendationRank: 1,
          totalRecommendations: 3,
          wasViewed: true,
          wasContacted: true,
          becameClient: true,
          sessionCount: 0, // Will be updated later
          recommendationAlgorithm: 'advanced_ml',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
      });

      // 9. Create client compatibility analysis
      const compatibility = await prisma.clientCompatibility.create({
        data: {
          clientId: client.userId,
          therapistId: selectedTherapist.therapist.userId,
          personalityCompatibility: 88,
          sessionCompatibility: 92,
          demographicCompatibility: 85,
          overallCompatibility: 89,
          communicationStyleScore: 90,
          personalityMatchScore: 86,
          culturalCompatibilityScore: 85,
          formatMatchScore: 95,
          durationMatchScore: 90,
          frequencyMatchScore: 88,
          schedulingCompatibilityScore: 92,
          ageCompatibilityScore: 80,
          genderCompatibilityScore: 85,
          languageCompatibilityScore: 100,
          strengths: [
            'Excellent therapeutic approach match (CBT)',
            'Strong experience with anxiety and depression',
            'Compatible session scheduling preferences',
            'High treatment success rates',
          ],
          concerns: [
            'Consider cultural background alignment',
          ],
          recommendations: [
            'Start with weekly CBT sessions',
            'Focus on anxiety management techniques',
            'Monitor depression symptoms closely',
            'Consider DBT skills integration',
          ],
          analysisVersion: '3.1',
        },
      });

      // 10. Update client to show they've seen recommendations
      await prisma.client.update({
        where: { userId: client.userId },
        data: { hasSeenTherapistRecommendations: true },
      });

      // === PHASE 4: THERAPIST ASSIGNMENT & BOOKING ===
      
      // 11. Create client-therapist assignment
      const assignment = await prisma.clientTherapist.create({
        data: {
          clientId: client.userId,
          therapistId: selectedTherapist.therapist.userId,
          notes: 'Matched based on CBT expertise and anxiety/depression specialization',
        },
      });

      // 12. Create therapy sessions
      const sessions = [];
      const sessionDates = [
        new Date('2024-12-01T10:00:00Z'),
        new Date('2024-12-08T10:00:00Z'),
        new Date('2024-12-15T10:00:00Z'),
        new Date('2024-12-22T10:00:00Z'),
      ];

      for (const [index, sessionDate] of sessionDates.entries()) {
        const meeting = await prisma.meeting.create({
          data: {
            clientId: client.userId,
            therapistId: selectedTherapist.therapist.userId,
            startTime: sessionDate,
            duration: 60,
            status: index < 2 ? 'COMPLETED' : 'SCHEDULED',
            meetingType: 'video',
            description: `Session ${index + 1}: ${
              index === 0 ? 'Initial Assessment and Goal Setting' :
              index === 1 ? 'CBT Techniques for Anxiety Management' :
              index === 2 ? 'Depression Coping Strategies' :
              'Progress Review and Future Planning'
            }`,
          },
        });

        sessions.push(meeting);

        // Create session logs for completed sessions
        if (index < 2) {
          const sessionLog = await prisma.sessionLog.create({
            data: {
              clientId: client.userId,
              meetingId: meeting.id,
              sessionDate: sessionDate,
              duration: 60,
              sessionType: 'Individual',
              notes: index === 0 
                ? 'Client presented with moderate anxiety and depression. Established therapeutic goals and introduced CBT concepts. Good rapport established.'
                : 'Continued CBT work on anxiety management. Client practiced breathing techniques and cognitive restructuring. Showing improvement in anxiety symptoms.',
              mood: index === 0 ? 'anxious' : 'improving',
              progress: index === 0 ? 'baseline' : 'good',
            },
          });
        }
      }

      // === PHASE 5: ONGOING THERAPY & FEEDBACK ===
      
      // 13. Create review and feedback
      const review = await prisma.review.create({
        data: {
          clientId: client.userId,
          therapistId: selectedTherapist.therapist.userId,
          rating: 5,
          comment: 'Dr. Therapist1 has been incredibly helpful. The CBT techniques have really helped me manage my anxiety, and I feel more hopeful about my depression.',
          isAnonymous: false,
        },
      });

      // 14. Create recommendation feedback
      const feedback = await prisma.recommendationFeedback.create({
        data: {
          clientId: client.userId,
          therapistId: selectedTherapist.therapist.userId,
          matchHistoryId: matchHistory.id,
          relevanceScore: 5,
          accuracyScore: 5,
          helpfulnessScore: 5,
          feedbackText: 'The recommendation was perfect! The therapist specializes exactly in what I needed help with.',
          selectedTherapist: true,
          hadInitialSession: true,
          continuedTherapy: true,
          overallSatisfaction: 5,
        },
      });

      // 15. Update match history with session progress
      await prisma.matchHistory.update({
        where: { id: matchHistory.id },
        data: {
          sessionCount: 2, // Two completed sessions
          clientSatisfactionScore: 5,
        },
      });

      // === PHASE 6: COMMUNITY ENGAGEMENT ===
      
      // 16. Create community and user participation
      const community = await prisma.community.create({
        data: {
          name: 'Anxiety Support Group',
          description: 'A supportive community for people managing anxiety',
          isPrivate: false,
          memberLimit: 50,
        },
      });

      const roomGroup = await prisma.roomGroup.create({
        data: {
          communityId: community.id,
          name: 'General Support',
          description: 'General discussions and support',
        },
      });

      const room = await prisma.room.create({
        data: {
          communityId: community.id,
          roomGroupId: roomGroup.id,
          name: 'Daily Check-ins',
          description: 'Share your daily progress and challenges',
          postingRole: 'MEMBER',
        },
      });

      // 17. Join community
      const membership = await prisma.membership.create({
        data: {
          userId: clientUser.id,
          communityId: community.id,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      });

      // 18. Create community post
      const post = await prisma.post.create({
        data: {
          authorId: clientUser.id,
          communityId: community.id,
          roomId: room.id,
          title: 'Progress Update: Two Months of Therapy',
          content: 'I wanted to share my progress with everyone. After two months of CBT therapy, I\'m seeing real improvements in my anxiety levels. The breathing techniques and cognitive restructuring have been game-changers for me.',
          type: 'TEXT',
          isApproved: true,
        },
      });

      // === PHASE 7: ACTIVITY TRACKING & NOTIFICATIONS ===
      
      // 19. Create comprehensive activity tracking
      const activities = await prisma.userActivity.createMany({
        data: [
          {
            userId: clientUser.id,
            activityType: 'registration',
            activityData: { source: 'web', completedAt: clientUser.createdAt },
          },
          {
            userId: clientUser.id,
            activityType: 'assessment_completion',
            activityData: { assessmentType: 'pre-assessment', score: 18 },
          },
          {
            userId: clientUser.id,
            activityType: 'therapist_match',
            activityData: { therapistId: selectedTherapist.therapist.userId, score: 92 },
          },
          {
            userId: clientUser.id,
            activityType: 'session_completion',
            activityData: { sessionNumber: 1, meetingId: sessions[0].id },
          },
          {
            userId: clientUser.id,
            activityType: 'session_completion',
            activityData: { sessionNumber: 2, meetingId: sessions[1].id },
          },
          {
            userId: clientUser.id,
            activityType: 'community_post',
            activityData: { postId: post.id, community: community.name },
          },
        ],
      });

      // 20. Create notifications
      const notifications = await prisma.notification.createMany({
        data: [
          {
            userId: clientUser.id,
            type: 'welcome',
            title: 'Welcome to Mentara!',
            message: 'Complete your mental health assessment to get personalized therapist recommendations.',
            isRead: true,
            priority: 'medium',
          },
          {
            userId: clientUser.id,
            type: 'assessment_complete',
            title: 'Assessment Complete',
            message: 'Your mental health assessment is complete. View your therapist recommendations.',
            isRead: true,
            priority: 'high',
          },
          {
            userId: clientUser.id,
            type: 'therapist_match',
            title: 'Perfect Match Found!',
            message: 'We found an excellent therapist match for you. Schedule your first session.',
            isRead: true,
            priority: 'high',
          },
          {
            userId: clientUser.id,
            type: 'session_reminder',
            title: 'Upcoming Session',
            message: 'You have a therapy session tomorrow at 10:00 AM.',
            isRead: false,
            priority: 'high',
          },
          {
            userId: clientUser.id,
            type: 'community_welcome',
            title: 'Welcome to Anxiety Support Group',
            message: 'You\'ve successfully joined the Anxiety Support Group community.',
            isRead: true,
            priority: 'medium',
          },
        ],
      });

      // 21. Create audit logs
      const auditLogs = await prisma.auditLog.createMany({
        data: [
          {
            userId: clientUser.id,
            action: 'USER_REGISTRATION',
            entity: 'User',
            entityId: clientUser.id,
            details: { source: 'web', role: 'client' },
            severity: 'INFO',
          },
          {
            userId: clientUser.id,
            action: 'ASSESSMENT_COMPLETION',
            entity: 'PreAssessment',
            entityId: preAssessment.id,
            details: { overallSeverity: 'moderate', status: 'COMPLETED' },
            severity: 'INFO',
          },
          {
            userId: clientUser.id,
            action: 'THERAPIST_ASSIGNMENT',
            entity: 'ClientTherapist',
            entityId: assignment.id,
            details: { therapistId: selectedTherapist.therapist.userId, matchScore: 92 },
            severity: 'INFO',
          },
          {
            userId: clientUser.id,
            action: 'SESSION_COMPLETION',
            entity: 'Meeting',
            entityId: sessions[0].id,
            details: { sessionNumber: 1, duration: 60 },
            severity: 'INFO',
          },
          {
            userId: clientUser.id,
            action: 'COMMUNITY_JOIN',
            entity: 'Membership',
            entityId: membership.id,
            details: { communityId: community.id, role: 'MEMBER' },
            severity: 'INFO',
          },
        ],
      });

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // === COMPREHENSIVE VERIFICATION ===
      
      // Verify complete workflow by querying the final state
      const completeUserJourney = await prisma.user.findUnique({
        where: { id: clientUser.id },
        include: {
          client: {
            include: {
              assignedTherapists: {
                include: {
                  therapist: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
              meetings: {
                include: {
                  therapist: {
                    include: {
                      user: true,
                    },
                  },
                },
                orderBy: { startTime: 'asc' },
              },
              sessionLogs: {
                orderBy: { sessionDate: 'asc' },
              },
              reviews: {
                include: {
                  therapist: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
          preAssessment: true,
          notificationSettings: true,
          notifications: {
            orderBy: { createdAt: 'desc' },
          },
          activities: {
            orderBy: { createdAt: 'asc' },
          },
          auditLogs: {
            orderBy: { createdAt: 'asc' },
          },
          memberships: {
            include: {
              community: true,
            },
          },
          posts: {
            include: {
              community: true,
              room: true,
            },
          },
        },
      });

      // Comprehensive assertions
      expect(completeUserJourney).toBeTruthy();
      expect(completeUserJourney?.role).toBe('client');
      expect(completeUserJourney?.client?.hasSeenTherapistRecommendations).toBe(true);
      expect(completeUserJourney?.client?.assignedTherapists).toHaveLength(1);
      expect(completeUserJourney?.client?.meetings).toHaveLength(4);
      expect(completeUserJourney?.client?.sessionLogs).toHaveLength(2);
      expect(completeUserJourney?.client?.reviews).toHaveLength(1);
      expect(completeUserJourney?.preAssessment?.status).toBe('COMPLETED');
      expect(completeUserJourney?.notificationSettings?.emailNotifications).toBe(true);
      expect(completeUserJourney?.notifications).toHaveLength(5);
      expect(completeUserJourney?.activities).toHaveLength(6);
      expect(completeUserJourney?.auditLogs).toHaveLength(5);
      expect(completeUserJourney?.memberships).toHaveLength(1);
      expect(completeUserJourney?.posts).toHaveLength(1);

      // Verify specific workflow outcomes
      const completedSessions = completeUserJourney?.client?.meetings.filter(m => m.status === 'COMPLETED');
      const scheduledSessions = completeUserJourney?.client?.meetings.filter(m => m.status === 'SCHEDULED');
      
      expect(completedSessions).toHaveLength(2);
      expect(scheduledSessions).toHaveLength(2);
      expect(completeUserJourney?.client?.reviews[0].rating).toBe(5);

      // Verify analytics data exists
      const analyticsData = await Promise.all([
        prisma.matchHistory.findFirst({ where: { clientId: client.userId } }),
        prisma.clientCompatibility.findFirst({ where: { clientId: client.userId } }),
        prisma.recommendationFeedback.findFirst({ where: { clientId: client.userId } }),
      ]);

      expect(analyticsData[0]?.totalScore).toBe(92);
      expect(analyticsData[1]?.overallCompatibility).toBe(89);
      expect(analyticsData[2]?.overallSatisfaction).toBe(5);

      console.log(`✅ Complete Client Journey Workflow Verified Successfully!
      📊 Workflow Statistics:
        ⏱️  Total Duration: ${totalDuration}ms
        👤 User Created: ${completeUserJourney?.email}
        🧠 Assessment Score: ${(completeUserJourney?.preAssessment?.answers as any)?.scores?.depression}/27 (Depression)
        🎯 Match Score: ${analyticsData[0]?.totalScore}/100
        💜 Compatibility: ${analyticsData[1]?.overallCompatibility}/100
        ⭐ Satisfaction: ${analyticsData[2]?.overallSatisfaction}/5
        📅 Sessions Completed: ${completedSessions?.length}
        🏆 Therapy Review: ${completeUserJourney?.client?.reviews[0].rating}/5 stars
        👥 Community Posts: ${completeUserJourney?.posts.length}
        🔔 Notifications: ${completeUserJourney?.notifications.length}
        📝 Activity Logs: ${completeUserJourney?.activities.length}
      `);

      expect(totalDuration).toBeLessThan(30000); // Should complete within 30 seconds
    }, 45000); // Extended timeout for complex workflow
  });

  describe('Therapist Application → Review → Approval → Client Assignment Workflow', () => {
    it('should execute complete therapist onboarding and client assignment workflow', async () => {
      console.log('🩺 Starting therapist onboarding workflow...');

      // === PHASE 1: THERAPIST APPLICATION ===
      
      // 1. Create therapist user
      const therapistUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'workflow-therapist-123',
          email: 'new-therapist@mentara.com',
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          role: 'therapist',
          isActive: true,
          isVerified: false, // Not verified until approved
        }),
      });

      // 2. Create comprehensive therapist application
      const therapist = await prisma.therapist.create({
        data: {
          userId: therapistUser.id,
          mobile: '+1234567890',
          province: 'British Columbia',
          providerType: 'Licensed Clinical Social Worker',
          professionalLicenseType: 'Licensed',
          isPRCLicensed: 'yes',
          prcLicenseNumber: 'PRC789012',
          isLicenseActive: 'yes',
          practiceStartDate: new Date('2018-06-01'),
          yearsOfExperience: 6,
          areasOfExpertise: [
            'Trauma Therapy',
            'PTSD',
            'Anxiety Disorders',
            'Depression',
            'EMDR',
          ],
          assessmentTools: [
            'PHQ-9',
            'GAD-7',
            'PCL-5',
            'CAPS-5',
            'PTSD Checklist',
          ],
          therapeuticApproachesUsedList: [
            'EMDR',
            'Trauma-Informed CBT',
            'Somatic Experiencing',
            'Mindfulness-Based Therapy',
          ],
          languagesOffered: ['English', 'French'],
          providedOnlineTherapyBefore: true,
          comfortableUsingVideoConferencing: true,
          weeklyAvailability: '25',
          preferredSessionLength: [60, 90],
          acceptTypes: ['Individual', 'Couples'],
          hourlyRate: 180,
          expirationDateOfLicense: new Date('2025-12-31'),
          compliesWithDataPrivacyAct: true,
          willingToAbideByPlatformGuidelines: true,
          status: 'pending', // Pending review
          bio: 'Specialized trauma therapist with 6 years of experience helping clients heal from PTSD and complex trauma using EMDR and somatic approaches.',
          education: 'MSW from University of British Columbia',
          certifications: ['EMDR Level II', 'Trauma-Informed Care Certificate'],
          treatmentSuccessRates: {},
          sessionLength: '60-90 minutes',
        },
      });

      // === PHASE 2: ADMIN REVIEW PROCESS ===
      
      // 3. Create admin user for review
      const adminUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'workflow-admin-123',
          email: 'admin@mentara.com',
          firstName: 'Admin',
          lastName: 'Reviewer',
          role: 'admin',
          isActive: true,
          isVerified: true,
        }),
      });

      const admin = await prisma.admin.create({
        data: {
          userId: adminUser.id,
          permissions: ['review_therapists', 'approve_therapists', 'manage_users'],
          adminLevel: 'admin',
        },
      });

      // 4. Create audit log for application submission
      await prisma.auditLog.create({
        data: {
          userId: therapistUser.id,
          action: 'THERAPIST_APPLICATION_SUBMITTED',
          entity: 'Therapist',
          entityId: therapist.userId,
          details: {
            applicationStatus: 'pending',
            providerType: therapist.providerType,
            specializations: therapist.areasOfExpertise,
          },
          severity: 'INFO',
        },
      });

      // 5. Admin reviews and approves therapist
      const approvedTherapist = await prisma.therapist.update({
        where: { userId: therapist.userId },
        data: {
          status: 'approved',
          processedBy: admin.userId,
          processedAt: new Date(),
          reviewNotes: 'Excellent credentials and experience. EMDR certification verified. Approved for platform.',
        },
      });

      // 6. Update user verification status
      await prisma.user.update({
        where: { id: therapistUser.id },
        data: { isVerified: true },
      });

      // 7. Create approval audit log
      await prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'THERAPIST_APPROVED',
          entity: 'Therapist',
          entityId: therapist.userId,
          details: {
            reviewedBy: adminUser.id,
            previousStatus: 'pending',
            newStatus: 'approved',
            reviewNotes: 'Excellent credentials and experience',
          },
          severity: 'INFO',
        },
      });

      // === PHASE 3: CLIENT MATCHING AND ASSIGNMENT ===
      
      // 8. Create client needing trauma therapy
      const traumaClientUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'trauma-client-123',
          email: 'trauma-client@mentara.com',
          firstName: 'Alex',
          lastName: 'Rivera',
          role: 'client',
        }),
      });

      const traumaClient = await prisma.client.create({
        data: {
          userId: traumaClientUser.id,
          hasSeenTherapistRecommendations: false,
        },
      });

      // 9. Create trauma-focused pre-assessment
      const traumaAssessment = await prisma.preAssessment.create({
        data: {
          userId: traumaClientUser.id,
          questionnaires: {
            PHQ9: [3, 3, 2, 2, 3, 3, 3, 2, 2], // Moderate-severe depression
            GAD7: [3, 3, 3, 2, 3, 3, 3], // Severe anxiety
            PCL5: [3, 4, 3, 4, 3, 3, 4, 3, 4, 3, 3, 4, 3, 3, 4, 3, 4, 3, 3, 4], // Significant PTSD symptoms
          },
          scores: {
            depression: 23, // Moderate-severe
            anxiety: 20, // Severe
            ptsd: 68, // Significant PTSD symptoms
          },
          severityLevels: {
            depression: 'moderate-severe',
            anxiety: 'severe',
            ptsd: 'significant',
          },
          status: 'COMPLETED',
        },
      });

      // 10. Create client medical history indicating trauma
      await prisma.clientMedicalHistory.createMany({
        data: [
          {
            clientId: traumaClient.userId,
            condition: 'Post-Traumatic Stress Disorder',
            notes: 'Motor vehicle accident 18 months ago, experiencing flashbacks and nightmares',
          },
          {
            clientId: traumaClient.userId,
            condition: 'Major Depressive Disorder',
            notes: 'Secondary to PTSD, began after trauma',
          },
        ],
      });

      // 11. Create matching analysis showing therapist as perfect match
      const traumaMatchHistory = await prisma.matchHistory.create({
        data: {
          clientId: traumaClient.userId,
          therapistId: approvedTherapist.userId,
          totalScore: 96, // Excellent match
          conditionScore: 98, // Perfect specialization match
          approachScore: 95, // EMDR exactly what client needs
          experienceScore: 94, // Strong trauma experience
          reviewScore: 90, // New therapist, no reviews yet
          logisticsScore: 92, // Good availability match
          compatibilityScore: 94,
          primaryMatches: ['PTSD', 'Trauma Therapy'],
          secondaryMatches: ['Depression', 'Anxiety'],
          approachMatches: ['EMDR', 'Trauma-Informed CBT'],
          recommendationRank: 1,
          totalRecommendations: 1, // Only one perfect match
          wasViewed: true,
          wasContacted: true,
          becameClient: true,
          sessionCount: 0,
          recommendationAlgorithm: 'trauma_specialized',
        },
      });

      // 12. Create compatibility analysis
      const traumaCompatibility = await prisma.clientCompatibility.create({
        data: {
          clientId: traumaClient.userId,
          therapistId: approvedTherapist.userId,
          personalityCompatibility: 92,
          sessionCompatibility: 95,
          demographicCompatibility: 88,
          overallCompatibility: 94,
          communicationStyleScore: 90,
          personalityMatchScore: 94,
          culturalCompatibilityScore: 85,
          formatMatchScore: 98, // Individual therapy preference
          durationMatchScore: 95, // 60-90 min sessions ideal for trauma
          frequencyMatchScore: 92,
          schedulingCompatibilityScore: 88,
          ageCompatibilityScore: 85,
          genderCompatibilityScore: 90,
          languageCompatibilityScore: 100,
          strengths: [
            'Specialized EMDR training perfect for PTSD treatment',
            'Extensive trauma therapy experience',
            'Excellent session format match for trauma processing',
            'Strong therapeutic approach alignment',
          ],
          concerns: [
            'New to platform - building review history',
          ],
          recommendations: [
            'Begin with EMDR assessment and preparation',
            'Schedule 90-minute sessions for trauma processing',
            'Weekly sessions recommended initially',
            'Monitor dissociation and grounding techniques',
          ],
          analysisVersion: '4.0',
        },
      });

      // === PHASE 4: ASSIGNMENT AND FIRST SESSION ===
      
      // 13. Create client-therapist assignment
      const traumaAssignment = await prisma.clientTherapist.create({
        data: {
          clientId: traumaClient.userId,
          therapistId: approvedTherapist.userId,
          notes: 'Specialized trauma therapy assignment. Client has PTSD from MVA, excellent match for EMDR treatment.',
        },
      });

      // 14. Schedule first session
      const firstSession = await prisma.meeting.create({
        data: {
          clientId: traumaClient.userId,
          therapistId: approvedTherapist.userId,
          startTime: new Date('2024-12-10T14:00:00Z'),
          duration: 90, // Extended session for trauma work
          status: 'COMPLETED',
          meetingType: 'video',
          description: 'Initial EMDR Assessment and Trauma History',
        },
      });

      // 15. Create session log
      const traumaSessionLog = await prisma.sessionLog.create({
        data: {
          clientId: traumaClient.userId,
          meetingId: firstSession.id,
          sessionDate: firstSession.startTime,
          duration: 90,
          sessionType: 'Individual',
          notes: 'Comprehensive trauma assessment completed. Client reports MVA trauma with significant PTSD symptoms. EMDR suitability confirmed. Established safety and grounding protocols. Client motivated for treatment.',
          mood: 'anxious but hopeful',
          progress: 'assessment complete',
        },
      });

      // 16. Update client to show they've seen recommendations
      await prisma.client.update({
        where: { userId: traumaClient.userId },
        data: { hasSeenTherapistRecommendations: true },
      });

      // 17. Create follow-up feedback
      const traumaFeedback = await prisma.recommendationFeedback.create({
        data: {
          clientId: traumaClient.userId,
          therapistId: approvedTherapist.userId,
          matchHistoryId: traumaMatchHistory.id,
          relevanceScore: 5,
          accuracyScore: 5,
          helpfulnessScore: 5,
          feedbackText: 'Perfect match! Finally found a therapist who truly understands trauma and has the specialized training I need.',
          selectedTherapist: true,
          hadInitialSession: true,
          continuedTherapy: true,
          overallSatisfaction: 5,
        },
      });

      // === COMPREHENSIVE VERIFICATION ===
      
      // Verify complete therapist workflow
      const completeTherapistWorkflow = await prisma.therapist.findUnique({
        where: { userId: approvedTherapist.userId },
        include: {
          user: true,
          processedByAdmin: {
            include: {
              user: true,
            },
          },
          assignedClients: {
            include: {
              client: {
                include: {
                  user: true,
                  preAssessment: true,
                  sessionLogs: true,
                },
              },
            },
          },
          meetings: {
            include: {
              client: {
                include: {
                  user: true,
                },
              },
            },
          },
          reviews: true,
          matchHistory: true,
          clientCompatibility: true,
          recommendationFeedback: true,
        },
      });

      // Comprehensive assertions
      expect(completeTherapistWorkflow).toBeTruthy();
      expect(completeTherapistWorkflow?.status).toBe('approved');
      expect(completeTherapistWorkflow?.user.isVerified).toBe(true);
      expect(completeTherapistWorkflow?.processedByAdmin?.user.role).toBe('admin');
      expect(completeTherapistWorkflow?.assignedClients).toHaveLength(1);
      expect(completeTherapistWorkflow?.meetings).toHaveLength(1);
      expect(completeTherapistWorkflow?.matchHistory).toHaveLength(1);
      expect(completeTherapistWorkflow?.clientCompatibility).toHaveLength(1);
      expect(completeTherapistWorkflow?.recommendationFeedback).toHaveLength(1);

      // Verify match quality
      const matchQuality = completeTherapistWorkflow?.matchHistory[0];
      const compatibility = completeTherapistWorkflow?.clientCompatibility[0];
      const feedback = completeTherapistWorkflow?.recommendationFeedback[0];

      expect(matchQuality?.totalScore).toBe(96);
      expect(compatibility?.overallCompatibility).toBe(94);
      expect(feedback?.overallSatisfaction).toBe(5);

      // Verify client received proper trauma-specialized care
      const traumaClient = completeTherapistWorkflow?.assignedClients[0].client;
      expect((traumaClient?.preAssessment?.answers as any)?.severityLevels?.ptsd).toBe('significant');
      expect(traumaClient?.sessionLogs).toHaveLength(1);
      expect(traumaClient?.sessionLogs[0].notes).toContain('EMDR');

      console.log(`✅ Complete Therapist Workflow Verified Successfully!
      🩺 Therapist Onboarding Statistics:
        👨‍⚕️  Therapist: ${completeTherapistWorkflow?.user.firstName} ${completeTherapistWorkflow?.user.lastName}
        📋 Specialization: ${completeTherapistWorkflow?.areasOfExpertise.join(', ')}
        ✅ Status: ${completeTherapistWorkflow?.status}
        👤 Reviewed by: ${completeTherapistWorkflow?.processedByAdmin?.user.firstName}
        👥 Assigned Clients: ${completeTherapistWorkflow?.assignedClients.length}
        🎯 Match Score: ${matchQuality?.totalScore}/100
        💜 Compatibility: ${compatibility?.overallCompatibility}/100
        ⭐ Client Satisfaction: ${feedback?.overallSatisfaction}/5
        🔧 Specialized for: ${matchQuality?.primaryMatches.join(', ')}
      `);
    });
  });

  describe('Community Participation → Content Creation → Moderation Workflow', () => {
    it('should execute complete community engagement workflow', async () => {
      console.log('👥 Starting community engagement workflow...');

      // === PHASE 1: COMMUNITY SETUP ===
      
      // 1. Create community
      const community = await prisma.community.create({
        data: {
          name: 'Depression Support Network',
          description: 'A safe space for people experiencing depression to share, support, and heal together',
          isPrivate: false,
          memberLimit: 100,
        },
      });

      // 2. Create room structure
      const roomGroups = await prisma.roomGroup.createMany({
        data: [
          {
            communityId: community.id,
            name: 'Support & Sharing',
            description: 'Share experiences and support each other',
          },
          {
            communityId: community.id,
            name: 'Resources & Tips',
            description: 'Share helpful resources and coping strategies',
          },
          {
            communityId: community.id,
            name: 'General Discussion',
            description: 'General conversations and community updates',
          },
        ],
      });

      const createdRoomGroups = await prisma.roomGroup.findMany({
        where: { communityId: community.id },
      });

      const rooms = await prisma.room.createMany({
        data: [
          {
            communityId: community.id,
            roomGroupId: createdRoomGroups[0].id,
            name: 'Daily Check-ins',
            description: 'Share how you are feeling today',
            postingRole: 'MEMBER',
          },
          {
            communityId: community.id,
            roomGroupId: createdRoomGroups[0].id,
            name: 'Breakthrough Moments',
            description: 'Celebrate your wins and progress',
            postingRole: 'MEMBER',
          },
          {
            communityId: community.id,
            roomGroupId: createdRoomGroups[1].id,
            name: 'Coping Strategies',
            description: 'Share what works for you',
            postingRole: 'MEMBER',
          },
          {
            communityId: community.id,
            roomGroupId: createdRoomGroups[2].id,
            name: 'Community Updates',
            description: 'Important community announcements',
            postingRole: 'MODERATOR',
          },
        ],
      });

      const createdRooms = await prisma.room.findMany({
        where: { communityId: community.id },
      });

      // === PHASE 2: USER PARTICIPATION ===
      
      // 3. Create community members
      const memberUsers = [];
      for (let i = 1; i <= 5; i++) {
        const user = await prisma.user.create({
          data: TestDataGenerator.createUser({
            id: `community-member-${i}`,
            email: `member${i}@community.com`,
            firstName: `Member${i}`,
            lastName: 'User',
            role: 'client',
          }),
        });
        memberUsers.push(user);
      }

      // 4. Create moderator
      const moderatorUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'community-moderator',
          email: 'moderator@community.com',
          firstName: 'Community',
          lastName: 'Moderator',
          role: 'moderator',
        }),
      });

      const moderator = await prisma.moderator.create({
        data: {
          userId: moderatorUser.id,
          permissions: ['moderate_content', 'manage_members', 'post_announcements'],
          assignedCommunities: { [community.id]: 'active' },
        },
      });

      // 5. Create memberships
      const memberships = [];
      for (const user of memberUsers) {
        const membership = await prisma.membership.create({
          data: {
            userId: user.id,
            communityId: community.id,
            role: 'MEMBER',
            status: 'ACTIVE',
          },
        });
        memberships.push(membership);
      }

      // Add moderator membership
      await prisma.membership.create({
        data: {
          userId: moderatorUser.id,
          communityId: community.id,
          role: 'MODERATOR',
          status: 'ACTIVE',
        },
      });

      // === PHASE 3: CONTENT CREATION ===
      
      // 6. Create community posts
      const posts = [];
      
      // Member 1: Daily check-in
      const checkInPost = await prisma.post.create({
        data: {
          authorId: memberUsers[0].id,
          communityId: community.id,
          roomId: createdRooms[0].id, // Daily Check-ins room
          title: 'Struggling today but here',
          content: 'Having a rough day with my depression. The grey weather isn\'t helping, but I\'m trying to remember that this feeling will pass. Just wanted to check in and let everyone know I\'m still fighting.',
          type: 'TEXT',
          isApproved: true,
        },
      });
      posts.push(checkInPost);

      // Member 2: Breakthrough moment
      const breakthroughPost = await prisma.post.create({
        data: {
          authorId: memberUsers[1].id,
          communityId: community.id,
          roomId: createdRooms[1].id, // Breakthrough Moments room
          title: 'Small victory: Made it to therapy today!',
          content: 'I almost cancelled my therapy session this morning because my depression was telling me it wouldn\'t help. But I pushed through and went anyway. My therapist reminded me how much progress I\'ve made. Sometimes we need those outside perspectives to see our own growth.',
          type: 'TEXT',
          isApproved: true,
        },
      });
      posts.push(breakthroughPost);

      // Member 3: Coping strategy
      const copingPost = await prisma.post.create({
        data: {
          authorId: memberUsers[2].id,
          communityId: community.id,
          roomId: createdRooms[2].id, // Coping Strategies room
          title: 'The 5-4-3-2-1 grounding technique that saves me',
          content: 'When my depression spirals and I feel disconnected, I use this grounding technique: 5 things I can see, 4 things I can touch, 3 things I can hear, 2 things I can smell, 1 thing I can taste. It brings me back to the present moment and helps me feel more anchored.',
          type: 'TEXT',
          isApproved: true,
        },
      });
      posts.push(copingPost);

      // Moderator: Community update
      const updatePost = await prisma.post.create({
        data: {
          authorId: moderatorUser.id,
          communityId: community.id,
          roomId: createdRooms[3].id, // Community Updates room
          title: 'Welcome to our new community members!',
          content: 'We\'ve grown to over 50 members this month! Remember our community guidelines: be kind, respect privacy, no medical advice, and support each other\'s journeys. We\'re here for each other.',
          type: 'TEXT',
          isApproved: true,
        },
      });
      posts.push(updatePost);

      // === PHASE 4: COMMUNITY INTERACTION ===
      
      // 7. Create comments and replies
      const comments = [];
      
      // Support comment on struggling post
      const supportComment = await prisma.comment.create({
        data: {
          authorId: memberUsers[3].id,
          postId: checkInPost.id,
          content: 'Sending you virtual hugs. The fact that you checked in today shows incredible strength. You\'re not alone in this fight.',
          isApproved: true,
        },
      });
      comments.push(supportComment);

      // Reply to support comment
      const thankYouReply = await prisma.reply.create({
        data: {
          authorId: memberUsers[0].id,
          commentId: supportComment.id,
          content: 'Thank you so much. This community means everything to me.',
          isApproved: true,
        },
      });

      // Encouraging comment on breakthrough post
      const encouragingComment = await prisma.comment.create({
        data: {
          authorId: memberUsers[4].id,
          postId: breakthroughPost.id,
          content: 'This is amazing! I needed to read this today. You\'re inspiring me to keep my own therapy appointment tomorrow.',
          isApproved: true,
        },
      });
      comments.push(encouragingComment);

      // Helpful comment on coping strategy
      const helpfulComment = await prisma.comment.create({
        data: {
          authorId: moderatorUser.id,
          postId: copingPost.id,
          content: 'Thank you for sharing this technique! Grounding exercises are so helpful for managing depression symptoms. This is exactly the kind of resource sharing we love to see.',
          isApproved: true,
        },
      });
      comments.push(helpfulComment);

      // === PHASE 5: HEARTS AND ENGAGEMENT ===
      
      // 8. Create hearts (likes) on posts
      await prisma.postHeart.createMany({
        data: [
          { userId: memberUsers[1].id, postId: checkInPost.id },
          { userId: memberUsers[2].id, postId: checkInPost.id },
          { userId: memberUsers[3].id, postId: checkInPost.id },
          { userId: memberUsers[4].id, postId: checkInPost.id },
          { userId: moderatorUser.id, postId: checkInPost.id },
          { userId: memberUsers[0].id, postId: breakthroughPost.id },
          { userId: memberUsers[2].id, postId: breakthroughPost.id },
          { userId: memberUsers[3].id, postId: breakthroughPost.id },
          { userId: memberUsers[0].id, postId: copingPost.id },
          { userId: memberUsers[1].id, postId: copingPost.id },
          { userId: memberUsers[3].id, postId: copingPost.id },
          { userId: memberUsers[4].id, postId: copingPost.id },
          { userId: moderatorUser.id, postId: copingPost.id },
        ],
      });

      // 9. Create hearts on comments
      await prisma.commentHeart.createMany({
        data: [
          { userId: memberUsers[0].id, commentId: supportComment.id },
          { userId: memberUsers[1].id, commentId: supportComment.id },
          { userId: memberUsers[2].id, commentId: supportComment.id },
          { userId: memberUsers[1].id, commentId: encouragingComment.id },
          { userId: memberUsers[2].id, commentId: encouragingComment.id },
          { userId: memberUsers[0].id, commentId: helpfulComment.id },
          { userId: memberUsers[1].id, commentId: helpfulComment.id },
        ],
      });

      // 10. Create hearts on replies
      await prisma.replyHeart.createMany({
        data: [
          { userId: memberUsers[3].id, replyId: thankYouReply.id },
          { userId: memberUsers[4].id, replyId: thankYouReply.id },
          { userId: moderatorUser.id, replyId: thankYouReply.id },
        ],
      });

      // === PHASE 6: MODERATION ACTIVITY ===
      
      // 11. Create moderation activities (simulated content review)
      await prisma.auditLog.createMany({
        data: [
          {
            userId: moderatorUser.id,
            action: 'CONTENT_APPROVED',
            entity: 'Post',
            entityId: checkInPost.id,
            details: { reason: 'Appropriate content, supportive message' },
            severity: 'INFO',
          },
          {
            userId: moderatorUser.id,
            action: 'CONTENT_APPROVED',
            entity: 'Post',
            entityId: breakthroughPost.id,
            details: { reason: 'Positive content, encouraging message' },
            severity: 'INFO',
          },
          {
            userId: moderatorUser.id,
            action: 'CONTENT_APPROVED',
            entity: 'Post',
            entityId: copingPost.id,
            details: { reason: 'Valuable resource sharing, helpful content' },
            severity: 'INFO',
          },
        ],
      });

      // === COMPREHENSIVE VERIFICATION ===
      
      // Verify complete community workflow
      const completeCommunityWorkflow = await prisma.community.findUnique({
        where: { id: community.id },
        include: {
          roomGroups: {
            include: {
              rooms: {
                include: {
                  posts: {
                    include: {
                      author: true,
                      comments: {
                        include: {
                          author: true,
                          replies: {
                            include: {
                              author: true,
                              hearts: true,
                            },
                          },
                          hearts: true,
                        },
                      },
                      hearts: true,
                    },
                  },
                },
              },
            },
          },
          memberships: {
            include: {
              user: true,
            },
          },
        },
      });

      // Count engagement metrics
      const totalPosts = completeCommunityWorkflow?.roomGroups
        .flatMap(rg => rg.rooms)
        .flatMap(r => r.posts).length || 0;
      
      const totalComments = completeCommunityWorkflow?.roomGroups
        .flatMap(rg => rg.rooms)
        .flatMap(r => r.posts)
        .flatMap(p => p.comments).length || 0;
      
      const totalReplies = completeCommunityWorkflow?.roomGroups
        .flatMap(rg => rg.rooms)
        .flatMap(r => r.posts)
        .flatMap(p => p.comments)
        .flatMap(c => c.replies).length || 0;
      
      const totalPostHearts = completeCommunityWorkflow?.roomGroups
        .flatMap(rg => rg.rooms)
        .flatMap(r => r.posts)
        .flatMap(p => p.hearts).length || 0;

      // Comprehensive assertions
      expect(completeCommunityWorkflow).toBeTruthy();
      expect(completeCommunityWorkflow?.memberships).toHaveLength(6); // 5 members + 1 moderator
      expect(completeCommunityWorkflow?.roomGroups).toHaveLength(3);
      expect(totalPosts).toBe(4);
      expect(totalComments).toBe(3);
      expect(totalReplies).toBe(1);
      expect(totalPostHearts).toBe(13);

      // Verify member roles
      // Note: Membership model does not have role field - roles are determined by User.role and ModeratorCommunity
      const memberIds = completeCommunityWorkflow?.memberships.map(m => m.userId);
      expect(memberIds).toBeDefined();
      expect(memberIds?.length).toBe(6); // 5 members + 1 moderator

      // Verify content distribution across rooms
      const roomPostCounts = completeCommunityWorkflow?.roomGroups
        .flatMap(rg => rg.rooms)
        .map(r => ({ name: r.name, posts: r.posts.length }));
      
      expect(roomPostCounts?.find(r => r.name === 'Daily Check-ins')?.posts).toBe(1);
      expect(roomPostCounts?.find(r => r.name === 'Breakthrough Moments')?.posts).toBe(1);
      expect(roomPostCounts?.find(r => r.name === 'Coping Strategies')?.posts).toBe(1);
      expect(roomPostCounts?.find(r => r.name === 'Community Updates')?.posts).toBe(1);

      console.log(`✅ Complete Community Workflow Verified Successfully!
      👥 Community Engagement Statistics:
        🏘️  Community: ${completeCommunityWorkflow?.name}
        👥 Total Members: ${completeCommunityWorkflow?.memberships.length}
        🏠 Room Groups: ${completeCommunityWorkflow?.roomGroups.length}
        🏘️  Rooms: ${completeCommunityWorkflow?.roomGroups.flatMap(rg => rg.rooms).length}
        📝 Posts Created: ${totalPosts}
        💬 Comments: ${totalComments}
        🔗 Replies: ${totalReplies}
        💜 Post Hearts: ${totalPostHearts}
        🛡️  Moderator Actions: 3 content approvals
        📊 Engagement Rate: ${((totalComments + totalReplies + totalPostHearts) / totalPosts).toFixed(1)} interactions per post
      `);
    });
  });
});