import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../providers/prisma-client.provider';
import { DatabaseTestSetup } from '../database-test.setup';

describe('User Registration E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

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
  });

  afterEach(async () => {
    await DatabaseTestSetup.cleanupDatabase();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  describe('Complete Client Registration Flow', () => {
    it('should complete full client registration and onboarding journey', async () => {
      const clientData = {
        user: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          mobile: '+1234567890',
          address: '123 Main St, Toronto, ON',
          birthDate: '1990-05-15',
        },
        hasSeenTherapistRecommendations: false,
      };

      // Step 1: Register as client
      const registrationResponse = await request(app.getHttpServer())
        .post('/auth/register/client')
        .send(clientData)
        .expect(201);

      expect(registrationResponse.body.success).toBe(true);
      const userId = registrationResponse.body.data.id;

      // Step 2: Verify user profile can be retrieved
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('x-user-id', userId)
        .expect(200);

      expect(profileResponse.body.data).toMatchObject({
        id: userId,
        email: 'sarah.johnson@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'client',
      });

      // Step 3: Complete pre-assessment
      const assessmentData = {
        responses: Array.from({ length: 201 }, (_, i) => ({
          questionId: i + 1,
          response: Math.floor(Math.random() * 5) + 1, // Random 1-5 rating
        })),
      };

      const assessmentResponse = await request(app.getHttpServer())
        .post('/pre-assessment')
        .set('x-user-id', userId)
        .send(assessmentData)
        .expect(201);

      expect(assessmentResponse.body.success).toBe(true);
      expect(assessmentResponse.body.data.status).toBe('COMPLETED');

      // Step 4: View therapist recommendations
      const recommendationsResponse = await request(app.getHttpServer())
        .get('/client/therapist-recommendations')
        .set('x-user-id', userId)
        .expect(200);

      expect(recommendationsResponse.body.success).toBe(true);
      expect(Array.isArray(recommendationsResponse.body.data)).toBe(true);

      // Step 5: Search for therapists
      const searchResponse = await request(app.getHttpServer())
        .get('/search/therapists?expertise=anxiety&province=ontario')
        .set('x-user-id', userId)
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(Array.isArray(searchResponse.body.data)).toBe(true);

      // Verify complete user journey in database
      const finalUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          client: true,
        },
      });

      expect(finalUser?.client).toBeTruthy();

      // Verify pre-assessment was created
      const preAssessments = await prisma.preAssessment.findMany({
        where: { clientId: finalUser?.client?.userId },
      });
      expect(preAssessments).toHaveLength(1);
    });

    it('should handle validation errors gracefully during registration', async () => {
      const invalidClientData = {
        user: {
          firstName: '',
          lastName: 'Johnson',
          email: 'invalid-email',
          mobile: '+1234567890',
        },
        // Missing required field
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register/client')
        .send(invalidClientData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');

      // Verify no partial data was created
      const users = await prisma.user.findMany({
        where: { email: 'invalid-email' },
      });

      expect(users).toHaveLength(0);
    });
  });

  describe('Complete Therapist Registration Flow', () => {
    it('should complete full therapist application and approval journey', async () => {
      const therapistData = {
        userId: 'therapist-e2e-123',
        email: 'dr.smith@example.com',
        firstName: 'Dr. Emily',
        lastName: 'Smith',
        mobile: '+1234567890',
        province: 'Ontario',
        providerType: 'Clinical Psychologist',
        professionalLicenseType: 'Licensed',
        isPRCLicensed: 'yes',
        prcLicenseNumber: 'PRC789012',
        isLicenseActive: 'yes',
        practiceStartDate: '2018-01-01',
        yearsOfExperience: 6,
        areasOfExpertise: ['Anxiety', 'Depression', 'PTSD'],
        assessmentTools: ['PHQ-9', 'GAD-7', 'PCL-5'],
        therapeuticApproachesUsedList: ['CBT', 'DBT', 'EMDR'],
        languagesOffered: ['English', 'French'],
        providedOnlineTherapyBefore: true,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [60],
        hourlyRate: 175,
        bio: 'Experienced clinical psychologist specializing in trauma and anxiety disorders.',
      };

      // Step 1: Submit therapist application
      const applicationResponse = await request(app.getHttpServer())
        .post('/auth/register/therapist')
        .send(therapistData)
        .expect(201);

      expect(applicationResponse.body.success).toBe(true);
      const therapistId = applicationResponse.body.data.id;

      // Step 2: Verify application is pending
      const pendingApplication = await prisma.therapist.findUnique({
        where: { userId: therapistId },
      });

      expect(pendingApplication?.status).toBe('PENDING');

      // Step 3: Admin reviews and approves application
      const approvalResponse = await request(app.getHttpServer())
        .patch(`/admin/therapist-applications/${therapistId}/approve`)
        .set('x-user-id', 'admin-user-123')
        .set('x-user-role', 'admin')
        .send({
          approvalNotes: 'All credentials verified. Approved for practice.',
        })
        .expect(200);

      expect(approvalResponse.body.success).toBe(true);
      expect(approvalResponse.body.data.status).toBe('APPROVED');

      // Step 4: Create user account for approved therapist
      const userResponse = await request(app.getHttpServer())
        .post('/admin/create-therapist-user')
        .set('x-user-id', 'admin-user-123')
        .set('x-user-role', 'admin')
        .send({
          therapistId: therapistId,
          userId: therapistData.userId,
        })
        .expect(201);

      expect(userResponse.body.success).toBe(true);

      // Step 5: Therapist sets up availability
      const availabilityData = {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      };

      const availabilityResponse = await request(app.getHttpServer())
        .post('/booking/availability')
        .set('x-user-id', therapistData.userId)
        .set('x-user-role', 'therapist')
        .send(availabilityData)
        .expect(201);

      expect(availabilityResponse.body.success).toBe(true);

      // Step 6: Verify therapist can view dashboard
      const dashboardResponse = await request(app.getHttpServer())
        .get('/therapist/dashboard')
        .set('x-user-id', therapistData.userId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(dashboardResponse.body.success).toBe(true);
      expect(dashboardResponse.body.data).toHaveProperty('stats');

      // Verify complete therapist journey in database
      const finalTherapist = await prisma.therapist.findUnique({
        where: { userId: therapistId },
        include: {
          user: true,
        },
      });

      expect(finalTherapist?.status).toBe('APPROVED');
      expect(finalTherapist?.user).toBeTruthy();
      expect(finalTherapist?.user).toBeTruthy();
    });

    it('should handle application rejection workflow', async () => {
      const therapistData = {
        userId: 'rejected-therapist-123',
        email: 'rejected@example.com',
        firstName: 'John',
        lastName: 'Doe',
        mobile: '+1234567890',
        province: 'Ontario',
        providerType: 'Counselor',
        professionalLicenseType: 'Unlicensed',
        isPRCLicensed: 'no',
        prcLicenseNumber: '',
        isLicenseActive: 'no',
        practiceStartDate: '2023-01-01',
        yearsOfExperience: 1,
        areasOfExpertise: ['General Counseling'],
        assessmentTools: [],
        therapeuticApproachesUsedList: ['Supportive Therapy'],
        languagesOffered: ['English'],
        providedOnlineTherapyBefore: false,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [45],
        hourlyRate: 75,
        bio: 'New counselor seeking to start practice.',
      };

      // Step 1: Submit application
      const applicationResponse = await request(app.getHttpServer())
        .post('/auth/register/therapist')
        .send(therapistData)
        .expect(201);

      const therapistId = applicationResponse.body.data.id;

      // Step 2: Admin rejects application
      const rejectionResponse = await request(app.getHttpServer())
        .patch(`/admin/therapist-applications/${therapistId}/reject`)
        .set('x-user-id', 'admin-user-123')
        .set('x-user-role', 'admin')
        .send({
          rejectionReason:
            'Insufficient professional qualifications. PRC license required.',
        })
        .expect(200);

      expect(rejectionResponse.body.success).toBe(true);
      expect(rejectionResponse.body.data.status).toBe('REJECTED');

      // Step 3: Verify rejected status in database
      const rejectedApplication = await prisma.therapist.findUnique({
        where: { userId: therapistId },
      });

      expect(rejectedApplication?.status).toBe('REJECTED');
      expect(rejectedApplication?.status).toBe('PRC license required');

      // Step 4: Verify no user account was created
      const user = await prisma.user.findUnique({
        where: { id: therapistData.userId },
      });

      expect(user).toBeNull();
    });
  });

  describe('Cross-Module Integration', () => {
    it('should handle complete user registration to first booking flow', async () => {
      // Create a therapist first
      const therapistUser = await prisma.user.create({
        data: {
          id: 'e2e-therapist-123',
          email: 'dr.sarah.wilson@example.com',
          firstName: 'Dr. Sarah',
          lastName: 'Wilson',
          role: 'therapist',
        },
      });

      await prisma.therapist.create({
        data: {
          userId: therapistUser.id,
          mobile: '+1234567890',
          province: 'Ontario',
          providerType: 'Clinical Psychologist',
          professionalLicenseType: 'Licensed',
          isPRCLicensed: 'yes',
          prcLicenseNumber: 'PRC123456',
          practiceStartDate: new Date('2020-01-01'),
          yearsOfExperience: 4,
          areasOfExpertise: ['Anxiety', 'Depression'],
          assessmentTools: ['PHQ-9', 'GAD-7'],
          therapeuticApproachesUsedList: ['CBT', 'ACT'],
          languagesOffered: ['English'],
          providedOnlineTherapyBefore: true,
          comfortableUsingVideoConferencing: true,
          preferredSessionLength: [60],
          status: 'APPROVED',
          hourlyRate: 160,
          expirationDateOfLicense: new Date('2025-12-31'),
          compliesWithDataPrivacyAct: true,
          willingToAbideByPlatformGuidelines: true,
          treatmentSuccessRates: {},
          sessionLength: '60',
        },
      });

      // Step 1: Client registration
      const clientData = {
        user: {
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@example.com',
          mobile: '+1234567890',
          address: '456 Oak St, Toronto, ON',
          birthDate: '1985-03-20',
        },
        hasSeenTherapistRecommendations: false,
      };

      const registrationResponse = await request(app.getHttpServer())
        .post('/auth/register/client')
        .send(clientData)
        .expect(201);

      const clientUserId = registrationResponse.body.data.id;

      // Step 2: Complete pre-assessment
      const assessmentData = {
        responses: Array.from({ length: 201 }, (_, i) => ({
          questionId: i + 1,
          response: 3, // Moderate responses
        })),
      };

      await request(app.getHttpServer())
        .post('/pre-assessment')
        .set('x-user-id', clientUserId)
        .send(assessmentData)
        .expect(201);

      // Step 3: Search and find therapist
      const searchResponse = await request(app.getHttpServer())
        .get('/search/therapists?expertise=anxiety')
        .set('x-user-id', clientUserId)
        .expect(200);

      expect(searchResponse.body.data.length).toBeGreaterThan(0);

      // Step 4: Book meeting with therapist
      const meetingData = {
        therapistId: therapistUser.id,
        scheduledAt: new Date('2024-12-15T10:00:00Z').toISOString(),
        duration: 60,
        meetingType: 'INDIVIDUAL',
        notes: 'Initial consultation for anxiety management',
      };

      const bookingResponse = await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientUserId)
        .send(meetingData)
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
      const meetingId = bookingResponse.body.data.id;

      // Step 5: Start conversation with therapist
      const messageData = {
        content: 'Hi Dr. Wilson, looking forward to our session!',
        messageType: 'TEXT',
      };

      // First need to create/find conversation
      const conversationResponse = await request(app.getHttpServer())
        .post('/messaging/conversations')
        .set('x-user-id', clientUserId)
        .send({
          participantIds: [therapistUser.id],
          isGroup: false,
        })
        .expect(201);

      const conversationId = conversationResponse.body.data.id;

      const messageResponse = await request(app.getHttpServer())
        .post(`/messaging/conversations/${conversationId}/messages`)
        .set('x-user-id', clientUserId)
        .send(messageData)
        .expect(201);

      expect(messageResponse.body.success).toBe(true);

      // Step 6: Verify complete workflow
      const finalUser = await prisma.user.findUnique({
        where: { id: clientUserId },
        include: {
          client: true,
        },
      });

      expect(finalUser?.client).toBeTruthy();
      expect(finalUser?.client).toBeTruthy();
      expect(finalUser?.client).toBeTruthy();
      expect(finalUser?.client).toBeTruthy();

      // Verify therapist has received the booking
      const therapistMeetings = await prisma.meeting.findMany({
        where: { therapistId: therapistUser.id },
      });

      expect(therapistMeetings).toHaveLength(1);
      expect(therapistMeetings[0].id).toBe(meetingId);
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle network failures gracefully', async () => {
      const clientData = {
        user: {
          firstName: 'Test',
          lastName: 'User',
          email: 'network.test@example.com',
          mobile: '+1234567890',
        },
        hasSeenTherapistRecommendations: false,
      };

      // Simulate potential network/database issues by testing with high concurrency
      const requests = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .post('/auth/register/client')
          .send(clientData),
      );

      const results = await Promise.allSettled(requests);
      const successful = results.filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status === 201,
      );
      const failed = results.filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status >= 400,
      );

      // Should have exactly one success (first request) and four conflicts
      expect(successful.length).toBe(1);
      expect(failed.length).toBe(4);

      // Verify only one user was created
      const users = await prisma.user.findMany({
        where: { email: 'network.test@example.com' },
      });

      expect(users).toHaveLength(1);
    });

    it('should maintain data consistency during partial failures', async () => {
      const clientData = {
        user: {
          firstName: 'Consistency',
          lastName: 'Test',
          email: 'consistency.test@example.com',
          mobile: '+1234567890',
        },
        hasSeenTherapistRecommendations: false,
      };

      // Register user successfully
      const registrationResponse = await request(app.getHttpServer())
        .post('/auth/register/client')
        .send(clientData)
        .expect(201);

      const userId = registrationResponse.body.data.id;

      // Try to submit invalid assessment that should fail
      const invalidAssessmentData = {
        responses: [], // Empty responses should fail validation
      };

      await request(app.getHttpServer())
        .post('/pre-assessment')
        .set('x-user-id', userId)
        .send(invalidAssessmentData)
        .expect(400);

      // Verify user still exists and is in valid state
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          client: true,
        },
      });

      expect(user).toBeTruthy();
      expect(user?.client).toBeTruthy();
      expect(user?.client).toBeTruthy(); // Client should exist

      // Verify user can still complete valid assessment later
      const validAssessmentData = {
        responses: Array.from({ length: 201 }, (_, i) => ({
          questionId: i + 1,
          response: 2,
        })),
      };

      const assessmentResponse = await request(app.getHttpServer())
        .post('/pre-assessment')
        .set('x-user-id', userId)
        .send(validAssessmentData)
        .expect(201);

      expect(assessmentResponse.body.success).toBe(true);
    });
  });
});
