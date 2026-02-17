import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../providers/prisma-client.provider';
import { DatabaseTestSetup } from '../database-test.setup';
import { MeetingStatus } from '@prisma/client';

describe('Therapist Dashboard E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;
  let therapistId: string;
  let clientIds: string[];

  beforeAll(async () => {
    // Setup test database
    prisma = await DatabaseTestSetup.setupTestDatabase();

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Setup test data
    await setupTestData();
  });

  afterEach(async () => {
    await DatabaseTestSetup.cleanupDatabase();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  async function setupTestData() {
    // Create therapist
    const therapist = await prisma.user.create({
      data: {
        id: 'dashboard-therapist-123',
        email: 'dashboard.therapist@test.com',
        firstName: 'Dashboard',
        lastName: 'Therapist',
        role: 'therapist',
      },
    });
    therapistId = therapist.id;

    await prisma.therapist.create({
      data: {
        userId: therapistId,
        mobile: '+1234567890',
        province: 'Ontario',
        providerType: 'Clinical Psychologist',
        professionalLicenseType: 'Licensed',
        isPRCLicensed: 'yes',
        prcLicenseNumber: 'PRC789012',
        practiceStartDate: new Date('2020-01-01'),
        yearsOfExperience: 4,
        areasOfExpertise: ['Anxiety', 'Depression', 'PTSD'],
        assessmentTools: ['PHQ-9', 'GAD-7', 'PCL-5'],
        therapeuticApproachesUsedList: ['CBT', 'DBT', 'EMDR'],
        languagesOffered: ['English'],
        providedOnlineTherapyBefore: true,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [60],
        status: 'APPROVED',
        hourlyRate: 175,
        expirationDateOfLicense: new Date('2025-12-31'),
        compliesWithDataPrivacyAct: true,
        willingToAbideByPlatformGuidelines: true,
        treatmentSuccessRates: {},
        sessionLength: '60',
      },
    });

    // Create multiple clients
    clientIds = [];
    for (let i = 1; i <= 5; i++) {
      const client = await prisma.user.create({
        data: {
          id: `dashboard-client-${i}`,
          email: `dashboard.client${i}@test.com`,
          firstName: `Client${i}`,
          lastName: 'Test',
          role: 'client',
        },
      });
      clientIds.push(client.id);

      await prisma.client.create({
        data: {
          userId: client.id,
          hasSeenTherapistRecommendations: true,
        },
      });
    }

    // Create sample meetings with different statuses
    const meetingData = [
      {
        id: 'dashboard-meeting-1',
        clientId: clientIds[0],
        therapistId: therapistId,
        startTime: new Date('2024-12-20T10:00:00Z'),
        duration: 60,
        status: MeetingStatus.COMPLETED,
        meetingType: 'INDIVIDUAL',
        description:
          'Good progress on anxiety management. Client practicing breathing techniques regularly.',
      },
      {
        id: 'dashboard-meeting-2',
        clientId: clientIds[1],
        therapistId: therapistId,
        startTime: new Date('2024-12-21T14:00:00Z'),
        duration: 60,
        status: MeetingStatus.SCHEDULED,
        meetingType: 'INDIVIDUAL',
      },
      {
        id: 'dashboard-meeting-3',
        clientId: clientIds[2],
        therapistId: therapistId,
        startTime: new Date('2024-12-22T09:00:00Z'),
        duration: 60,
        status: MeetingStatus.SCHEDULED,
        meetingType: 'COUPLES',
      },
      {
        id: 'dashboard-meeting-4',
        clientId: clientIds[3],
        therapistId: therapistId,
        startTime: new Date('2024-12-19T15:00:00Z'),
        duration: 60,
        status: MeetingStatus.CANCELLED,
        meetingType: 'INDIVIDUAL',
      },
      {
        id: 'dashboard-meeting-5',
        clientId: clientIds[4],
        therapistId: therapistId,
        startTime: new Date('2024-12-23T11:00:00Z'),
        duration: 90,
        status: MeetingStatus.SCHEDULED,
        meetingType: 'INDIVIDUAL',
      },
    ];

    await prisma.meeting.createMany({ data: meetingData });

    // Create some reviews
    const reviewData = [
      {
        id: 'dashboard-review-1',
        clientId: clientIds[0],
        therapistId: therapistId,
        rating: 5,
        comment: 'Excellent therapist! Very helpful and understanding.',
        wouldRecommend: true,
      },
      {
        id: 'dashboard-review-2',
        clientId: clientIds[1],
        therapistId: therapistId,
        rating: 4,
        comment: 'Good sessions, making progress.',
        wouldRecommend: true,
      },
    ];

    await prisma.review.createMany({ data: reviewData });
  }

  describe('Dashboard Overview', () => {
    it('should load therapist dashboard with comprehensive statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/therapist/dashboard')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        stats: expect.objectContaining({
          totalClients: expect.any(Number),
          upcomingMeetings: expect.any(Number),
          completedMeetings: expect.any(Number),
          averageRating: expect.any(Number),
          totalReviews: expect.any(Number),
        }),
        upcomingMeetings: expect.any(Array),
        recentMeetings: expect.any(Array),
        clientSummary: expect.any(Array),
      });

      // Verify statistics accuracy
      const stats = response.body.data.stats;
      expect(stats.totalClients).toBe(5);
      expect(stats.upcomingMeetings).toBe(3); // Scheduled meetings
      expect(stats.completedMeetings).toBe(1);
      expect(stats.averageRating).toBe(4.5); // (5 + 4) / 2
      expect(stats.totalReviews).toBe(2);
    });

    it('should show upcoming meetings in chronological order', async () => {
      const response = await request(app.getHttpServer())
        .get('/therapist/dashboard')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      const upcomingMeetings = response.body.data.upcomingMeetings;
      expect(upcomingMeetings).toHaveLength(3);

      // Should be ordered by scheduledAt (earliest first)
      expect(new Date(upcomingMeetings[0].startTime).getTime()).toBeLessThan(
        new Date(upcomingMeetings[1].startTime).getTime(),
      );

      expect(new Date(upcomingMeetings[1].startTime).getTime()).toBeLessThan(
        new Date(upcomingMeetings[2].startTime).getTime(),
      );
    });

    it('should display client summary with key information', async () => {
      const response = await request(app.getHttpServer())
        .get('/therapist/dashboard')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      const clientSummary = response.body.data.clientSummary;
      expect(clientSummary).toHaveLength(5);

      // Verify client summary contains required fields
      clientSummary.forEach((client) => {
        expect(client).toMatchObject({
          id: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          lastMeeting: expect.any(String),
          totalMeetings: expect.any(Number),
          status: expect.any(String),
        });
      });
    });
  });

  describe('Schedule Management', () => {
    it('should manage therapist availability settings', async () => {
      // Get current availability
      const currentAvailability = await request(app.getHttpServer())
        .get('/booking/availability')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(currentAvailability.body.success).toBe(true);

      // Add new availability slot
      const newAvailabilityData = {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      };

      const addAvailabilityResponse = await request(app.getHttpServer())
        .post('/booking/availability')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .send(newAvailabilityData)
        .expect(201);

      expect(addAvailabilityResponse.body.success).toBe(true);
      const availabilityId = addAvailabilityResponse.body.data.id;

      // Update availability slot
      const updateData = {
        startTime: '10:00',
        endTime: '16:00',
      };

      await request(app.getHttpServer())
        .put(`/booking/availability/${availabilityId}`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .send(updateData)
        .expect(200);

      // Delete availability slot
      await request(app.getHttpServer())
        .delete(`/booking/availability/${availabilityId}`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);
    });

    it('should handle time-off requests', async () => {
      const timeOffData = {
        startDate: '2024-12-24',
        endDate: '2024-12-26',
        reason: 'Holiday break',
        isRecurring: false,
      };

      const timeOffResponse = await request(app.getHttpServer())
        .post('/booking/time-off')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .send(timeOffData)
        .expect(201);

      expect(timeOffResponse.body.success).toBe(true);

      // Verify time-off appears in availability check
      const availabilityCheck = await request(app.getHttpServer())
        .get('/booking/availability/check?date=2024-12-25')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(availabilityCheck.body.data.available).toBe(false);
      expect(availabilityCheck.body.data.reason).toContain('time-off');
    });
  });

  describe('Client Management', () => {
    it('should view detailed client profiles and history', async () => {
      const clientId = clientIds[0];

      const clientProfileResponse = await request(app.getHttpServer())
        .get(`/therapist/clients/${clientId}/profile`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(clientProfileResponse.body.success).toBe(true);
      expect(clientProfileResponse.body.data).toMatchObject({
        id: clientId,
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: expect.any(String),
        meetings: expect.any(Array),
        preAssessments: expect.any(Array),
      });
    });

    it('should add session notes and treatment plans', async () => {
      const meetingId = 'dashboard-meeting-1';

      const sessionNotesData = {
        description:
          'Updated session notes: Client showed excellent progress. Discussed new coping strategies.',
        nextSteps:
          'Continue practicing mindfulness exercises. Schedule follow-up in 2 weeks.',
        treatmentGoals: 'Reduce anxiety levels, improve sleep quality',
        homework:
          'Practice breathing exercises daily, maintain anxiety journal',
      };

      const updateNotesResponse = await request(app.getHttpServer())
        .patch(`/booking/meetings/${meetingId}/notes`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .send(sessionNotesData)
        .expect(200);

      expect(updateNotesResponse.body.success).toBe(true);
      expect(updateNotesResponse.body.data.description).toContain(
        'excellent progress',
      );
    });

    it('should create and assign worksheets to clients', async () => {
      const clientId = clientIds[0];

      const worksheetData = {
        title: 'Anxiety Management Worksheet',
        description: 'Weekly exercises to help manage anxiety symptoms',
        content: JSON.stringify({
          exercises: [
            {
              title: 'Breathing Exercise',
              instructions: 'Practice 4-7-8 breathing for 5 minutes daily',
              frequency: 'Daily',
            },
            {
              title: 'Thought Record',
              instructions: 'Record anxious thoughts and challenge them',
              frequency: 'When needed',
            },
          ],
        }),
        dueDate: new Date('2024-12-27T23:59:59Z').toISOString(),
      };

      const worksheetResponse = await request(app.getHttpServer())
        .post(`/worksheets/assign/${clientId}`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .send(worksheetData)
        .expect(201);

      expect(worksheetResponse.body.success).toBe(true);
      expect(worksheetResponse.body.data.title).toBe(
        'Anxiety Management Worksheet',
      );

      // Verify worksheet appears in client's assignments
      const clientWorksheetsResponse = await request(app.getHttpServer())
        .get(`/therapist/clients/${clientId}/worksheets`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(clientWorksheetsResponse.body.data).toHaveLength(1);
      expect(clientWorksheetsResponse.body.data[0].title).toBe(
        'Anxiety Management Worksheet',
      );
    });
  });

  describe('Analytics and Reporting', () => {
    it('should generate therapy outcome reports', async () => {
      const analyticsResponse = await request(app.getHttpServer())
        .get('/therapist/analytics')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(analyticsResponse.body.success).toBe(true);
      expect(analyticsResponse.body.data).toMatchObject({
        sessionStats: expect.objectContaining({
          totalSessions: expect.any(Number),
          completedSessions: expect.any(Number),
          cancelledSessions: expect.any(Number),
          averageSessionDuration: expect.any(Number),
        }),
        clientOutcomes: expect.any(Array),
        monthlyTrends: expect.any(Array),
        rating: expect.objectContaining({
          average: expect.any(Number),
          total: expect.any(Number),
          distribution: expect.any(Object),
        }),
      });
    });

    it('should export client progress reports', async () => {
      const clientId = clientIds[0];

      const progressReportResponse = await request(app.getHttpServer())
        .get(`/therapist/clients/${clientId}/progress-report`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(progressReportResponse.body.success).toBe(true);
      expect(progressReportResponse.body.data).toMatchObject({
        clientInfo: expect.objectContaining({
          id: clientId,
          firstName: expect.any(String),
          lastName: expect.any(String),
        }),
        treatmentSummary: expect.objectContaining({
          totalSessions: expect.any(Number),
          treatmentDuration: expect.any(String),
          goals: expect.any(Array),
        }),
        sessionHistory: expect.any(Array),
        outcomes: expect.any(Object),
      });
    });

    it('should track key performance indicators', async () => {
      const kpiResponse = await request(app.getHttpServer())
        .get('/therapist/kpi')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(kpiResponse.body.success).toBe(true);
      expect(kpiResponse.body.data).toMatchObject({
        utilization: expect.objectContaining({
          currentWeek: expect.any(Number),
          previousWeek: expect.any(Number),
          trend: expect.any(String),
        }),
        clientRetention: expect.objectContaining({
          rate: expect.any(Number),
          newClients: expect.any(Number),
          returningClients: expect.any(Number),
        }),
        sessionEffectiveness: expect.objectContaining({
          completionRate: expect.any(Number),
          averageRating: expect.any(Number),
          clientSatisfaction: expect.any(Number),
        }),
      });
    });
  });

  describe('Communication Features', () => {
    it('should manage client communications through dashboard', async () => {
      // Get all conversations for therapist
      const conversationsResponse = await request(app.getHttpServer())
        .get('/messaging/conversations')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(conversationsResponse.body.success).toBe(true);
      expect(Array.isArray(conversationsResponse.body.data)).toBe(true);

      // Create new conversation with client
      const newConversationData = {
        participantIds: [clientIds[0]],
        isGroup: false,
        title: 'Session Follow-up',
      };

      const newConversationResponse = await request(app.getHttpServer())
        .post('/messaging/conversations')
        .set('x-user-id', therapistId)
        .send(newConversationData)
        .expect(201);

      const conversationId = newConversationResponse.body.data.id;

      // Send initial message
      const messageData = {
        content:
          'Hi! Following up on our session yesterday. How are you feeling about the techniques we discussed?',
        messageType: 'TEXT',
      };

      const messageResponse = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', therapistId)
        .send(messageData)
        .expect(201);

      expect(messageResponse.body.success).toBe(true);
    });

    it('should handle urgent client communications', async () => {
      // Simulate urgent message from client
      const urgentConversationData = {
        participantIds: [therapistId],
        isGroup: false,
        title: 'Urgent Support Needed',
        priority: 'HIGH',
      };

      const urgentConversationResponse = await request(app.getHttpServer())
        .post('/messaging/conversations')
        .set('x-user-id', clientIds[0])
        .send(urgentConversationData)
        .expect(201);

      const conversationId = urgentConversationResponse.body.data.id;

      const urgentMessageData = {
        content:
          "I'm having a panic attack and the techniques aren't working. Can you help?",
        messageType: 'TEXT',
        priority: 'URGENT',
      };

      await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientIds[0])
        .send(urgentMessageData)
        .expect(201);

      // Therapist should see urgent messages prominently in dashboard
      const dashboardResponse = await request(app.getHttpServer())
        .get('/therapist/dashboard')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(dashboardResponse.body.data.urgentMessages).toBeDefined();
      expect(dashboardResponse.body.data.urgentMessages.length).toBeGreaterThan(
        0,
      );
    });
  });

  describe('Professional Development', () => {
    it('should track continuing education and certifications', async () => {
      const ceData = {
        title: 'Advanced CBT Techniques',
        provider: 'Mental Health Institute',
        completionDate: '2024-12-15',
        hours: 20,
        certificateUrl: 'https://example.com/certificate.pdf',
        category: 'Clinical Training',
      };

      const ceResponse = await request(app.getHttpServer())
        .post('/therapist/continuing-education')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .send(ceData)
        .expect(201);

      expect(ceResponse.body.success).toBe(true);

      // Get all CE records
      const ceListResponse = await request(app.getHttpServer())
        .get('/therapist/continuing-education')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(ceListResponse.body.data).toHaveLength(1);
      expect(ceListResponse.body.data[0].title).toBe('Advanced CBT Techniques');
    });

    it('should generate professional summary for license renewal', async () => {
      const professionalSummaryResponse = await request(app.getHttpServer())
        .get('/therapist/professional-summary')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(professionalSummaryResponse.body.success).toBe(true);
      expect(professionalSummaryResponse.body.data).toMatchObject({
        therapistInfo: expect.objectContaining({
          name: expect.any(String),
          licenseNumber: expect.any(String),
          licenseStatus: expect.any(String),
        }),
        practiceStatistics: expect.objectContaining({
          totalClients: expect.any(Number),
          totalSessions: expect.any(Number),
          averageRating: expect.any(Number),
        }),
        continuingEducation: expect.any(Array),
        specializations: expect.any(Array),
      });
    });
  });
});
