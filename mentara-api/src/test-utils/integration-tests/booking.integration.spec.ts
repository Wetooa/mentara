import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../providers/prisma-client.provider';
import { BookingModule } from '../../booking/booking.module';
import { MeetingStatus } from '@prisma/client';
import { DatabaseTestSetup } from '../database-test.setup';

describe('Booking Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;
  let clientId: string;
  let therapistId: string;

  beforeAll(async () => {
    // Setup test database
    prisma = await DatabaseTestSetup.setupTestDatabase();

    moduleRef = await Test.createTestingModule({
      imports: [BookingModule],
      providers: [
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Create test users
    await setupTestUsers();
  });

  afterEach(async () => {
    // Clean meetings after each test but keep users
    await prisma.meeting.deleteMany();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  async function setupTestUsers() {
    // Create client user
    const clientUser = await prisma.user.create({
      data: {
        id: 'client-test-123',
        email: 'client@test.com',
        firstName: 'Test',
        lastName: 'Client',
        role: 'client',
      },
    });
    clientId = clientUser.id;

    await prisma.client.create({
      data: {
        userId: clientId,
        hasSeenTherapistRecommendations: false,
      },
    });

    // Create therapist user
    const therapistUser = await prisma.user.create({
      data: {
        id: 'therapist-test-123',
        firstName: 'Test',
        lastName: 'Therapist',
        email: 'therapist@test.com',
        role: 'therapist',
      },
    });
    therapistId = therapistUser.id;

    await prisma.therapist.create({
      data: {
        userId: therapistId,
        mobile: '+1234567890',
        province: 'Ontario',
        providerType: 'Clinical Psychologist',
        professionalLicenseType: 'Licensed',
        isPRCLicensed: 'yes',
        prcLicenseNumber: 'PRC123456',
        practiceStartDate: new Date('2020-01-01'),
        yearsOfExperience: 5,
        areasOfExpertise: ['Anxiety'],
        assessmentTools: ['PHQ-9'],
        therapeuticApproachesUsedList: ['CBT'],
        languagesOffered: ['English'],
        providedOnlineTherapyBefore: true,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [60],
        acceptTypes: ['Individual'],
        status: 'APPROVED',
        hourlyRate: 150,
        expirationDateOfLicense: new Date('2025-01-01'),
        compliesWithDataPrivacyAct: true,
        willingToAbideByPlatformGuidelines: true,
        treatmentSuccessRates: {},
        sessionLength: '60 minutes',
      },
    });
  }

  describe('POST /booking/meetings', () => {
    it('should create a new meeting successfully', async () => {
      const meetingData = {
        therapistId: therapistId,
        startTime: new Date('2024-12-01T10:00:00Z').toISOString(),
        duration: 60,
        meetingType: 'INDIVIDUAL',
        notes: 'Initial consultation',
      };

      const response = await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(meetingData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          clientId: clientId,
          therapistId: therapistId,
          status: MeetingStatus.SCHEDULED,
          duration: 60,
        }),
      });

      // Verify in database
      const meeting = await prisma.meeting.findFirst({
        where: { clientId: clientId },
      });

      expect(meeting).toBeTruthy();
      expect(meeting?.status).toBe(MeetingStatus.SCHEDULED);
    });

    it('should validate meeting time constraints', async () => {
      const pastMeetingData = {
        therapistId: therapistId,
        startTime: new Date('2020-01-01T10:00:00Z').toISOString(),
        duration: 60,
        meetingType: 'INDIVIDUAL',
      };

      await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(pastMeetingData)
        .expect(400);
    });

    it('should prevent double booking', async () => {
      const meetingTime = new Date('2024-12-01T10:00:00Z');

      // Create first meeting
      await prisma.meeting.create({
        data: {
          id: 'meeting-1',
          clientId: clientId,
          therapistId: therapistId,
          startTime: meetingTime,
          duration: 60,
          status: MeetingStatus.SCHEDULED,
          meetingType: 'INDIVIDUAL',
        },
      });

      // Try to create second meeting at same time
      const conflictingMeetingData = {
        therapistId: therapistId,
        startTime: meetingTime.toISOString(),
        duration: 60,
        meetingType: 'INDIVIDUAL',
      };

      await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(conflictingMeetingData)
        .expect(400);
    });
  });

  describe('GET /booking/meetings', () => {
    beforeEach(async () => {
      // Create test meetings
      await prisma.meeting.createMany({
        data: [
          {
            id: 'meeting-1',
            clientId: clientId,
            therapistId: therapistId,
            startTime: new Date('2024-12-01T10:00:00Z'),
            duration: 60,
            status: MeetingStatus.SCHEDULED,
            meetingType: 'INDIVIDUAL',
          },
          {
            id: 'meeting-2',
            clientId: clientId,
            therapistId: therapistId,
            startTime: new Date('2024-12-02T14:00:00Z'),
            duration: 60,
            status: MeetingStatus.COMPLETED,
            meetingType: 'INDIVIDUAL',
          },
        ],
      });
    });

    it('should return client meetings', async () => {
      const response = await request(app.getHttpServer())
        .get('/booking/meetings')
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'meeting-1',
            status: MeetingStatus.SCHEDULED,
          }),
          expect.objectContaining({
            id: 'meeting-2',
            status: MeetingStatus.COMPLETED,
          }),
        ]),
      );
    });

    it('should return therapist meetings', async () => {
      const response = await request(app.getHttpServer())
        .get('/booking/meetings')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should not return meetings for unauthorized users', async () => {
      const response = await request(app.getHttpServer())
        .get('/booking/meetings')
        .set('x-user-id', 'unauthorized-user')
        .set('x-user-role', 'client')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /booking/meetings/:id', () => {
    let meetingId: string;

    beforeEach(async () => {
      const meeting = await prisma.meeting.create({
        data: {
          id: 'test-meeting-detail',
          clientId: clientId,
          therapistId: therapistId,
          startTime: new Date('2024-12-01T10:00:00Z'),
          duration: 60,
          status: MeetingStatus.SCHEDULED,
          meetingType: 'INDIVIDUAL',
          description: 'Test meeting notes',
        },
      });
      meetingId = meeting.id;
    });

    it('should return meeting details for client', async () => {
      const response = await request(app.getHttpServer())
        .get(`/booking/meetings/${meetingId}`)
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: meetingId,
          clientId: clientId,
          therapistId: therapistId,
          description: 'Test meeting notes',
        }),
      });
    });

    it('should return meeting details for therapist', async () => {
      const response = await request(app.getHttpServer())
        .get(`/booking/meetings/${meetingId}`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(meetingId);
    });

    it('should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .get(`/booking/meetings/${meetingId}`)
        .set('x-user-id', 'unauthorized-user')
        .set('x-user-role', 'client')
        .expect(403);
    });

    it('should handle non-existent meeting', async () => {
      await request(app.getHttpServer())
        .get('/booking/meetings/non-existent-id')
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .expect(404);
    });
  });

  describe('PUT /booking/meetings/:id', () => {
    let meetingId: string;

    beforeEach(async () => {
      const meeting = await prisma.meeting.create({
        data: {
          id: 'test-meeting-update',
          clientId: clientId,
          therapistId: therapistId,
          startTime: new Date('2024-12-01T10:00:00Z'),
          duration: 60,
          status: MeetingStatus.SCHEDULED,
          meetingType: 'INDIVIDUAL',
        },
      });
      meetingId = meeting.id;
    });

    it('should update meeting successfully', async () => {
      const updateData = {
        startTime: new Date('2024-12-01T14:00:00Z').toISOString(),
        notes: 'Updated notes',
      };

      const response = await request(app.getHttpServer())
        .put(`/booking/meetings/${meetingId}`)
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated notes');

      // Verify in database
      const updatedMeeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
      });

      expect(updatedMeeting?.description).toBe('Updated notes');
    });

    it('should prevent updating past meetings', async () => {
      // Create past meeting
      const pastMeeting = await prisma.meeting.create({
        data: {
          id: 'past-meeting',
          clientId: clientId,
          therapistId: therapistId,
          startTime: new Date('2020-01-01T10:00:00Z'),
          duration: 60,
          status: MeetingStatus.COMPLETED,
          meetingType: 'INDIVIDUAL',
        },
      });

      const updateData = {
        notes: 'Should not update',
      };

      await request(app.getHttpServer())
        .put(`/booking/meetings/${pastMeeting.id}`)
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /booking/meetings/:id/cancel', () => {
    let meetingId: string;

    beforeEach(async () => {
      const meeting = await prisma.meeting.create({
        data: {
          id: 'test-meeting-cancel',
          clientId: clientId,
          therapistId: therapistId,
          startTime: new Date('2024-12-01T10:00:00Z'),
          duration: 60,
          status: MeetingStatus.SCHEDULED,
          meetingType: 'INDIVIDUAL',
        },
      });
      meetingId = meeting.id;
    });

    it('should cancel meeting successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/booking/meetings/${meetingId}/cancel`)
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(MeetingStatus.CANCELLED);

      // Verify in database
      const cancelledMeeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
      });

      expect(cancelledMeeting?.status).toBe(MeetingStatus.CANCELLED);
    });

    it('should prevent cancelling already cancelled meetings', async () => {
      // First cancellation
      await request(app.getHttpServer())
        .delete(`/booking/meetings/${meetingId}/cancel`)
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .expect(200);

      // Second cancellation attempt
      await request(app.getHttpServer())
        .delete(`/booking/meetings/${meetingId}/cancel`)
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .expect(400);
    });
  });

  describe('Database Performance', () => {
    beforeEach(async () => {
      // Create multiple meetings for performance testing
      const meetings = Array.from({ length: 50 }, (_, i) => ({
        id: `perf-meeting-${i}`,
        clientId: clientId,
        therapistId: therapistId,
        startTime: new Date(
          `2024-12-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
        ),
        duration: 60,
        status: i % 3 === 0 ? MeetingStatus.COMPLETED : MeetingStatus.SCHEDULED,
        meetingType: 'INDIVIDUAL' as const,
      }));

      await prisma.meeting.createMany({ data: meetings });
    });

    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get('/booking/meetings')
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.data).toHaveLength(50);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should perform efficient queries with filters', async () => {
      const startTime = Date.now();

      // Get only scheduled meetings
      const scheduledMeetings = await prisma.meeting.findMany({
        where: {
          clientId: clientId,
          status: MeetingStatus.SCHEDULED,
        },
        orderBy: { startTime: 'asc' },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(scheduledMeetings.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent meeting creations', async () => {
      const meetingPromises = Array.from({ length: 5 }, (_, i) =>
        request(app.getHttpServer())
          .post('/booking/meetings')
          .set('x-user-id', clientId)
          .send({
            therapistId: therapistId,
            startTime: new Date(`2024-12-${i + 10}T10:00:00Z`).toISOString(),
            duration: 60,
            meetingType: 'INDIVIDUAL',
          }),
      );

      const results = await Promise.allSettled(meetingPromises);
      const successful = results.filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status === 201,
      );

      expect(successful.length).toBe(5); // All should succeed since different times
    });

    it('should handle concurrent updates safely', async () => {
      // Create a meeting to update
      const meeting = await prisma.meeting.create({
        data: {
          id: 'concurrent-update-test',
          clientId: clientId,
          therapistId: therapistId,
          startTime: new Date('2024-12-01T10:00:00Z'),
          duration: 60,
          status: MeetingStatus.SCHEDULED,
          meetingType: 'INDIVIDUAL',
        },
      });

      // Attempt concurrent updates
      const updatePromises = [
        request(app.getHttpServer())
          .put(`/booking/meetings/${meeting.id}`)
          .set('x-user-id', clientId)
          .set('x-user-role', 'client')
          .send({ notes: 'Update 1' }),
        request(app.getHttpServer())
          .put(`/booking/meetings/${meeting.id}`)
          .set('x-user-id', therapistId)
          .set('x-user-role', 'therapist')
          .send({ notes: 'Update 2' }),
      ];

      const results = await Promise.allSettled(updatePromises);
      const successful = results.filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status === 200,
      );

      expect(successful.length).toBeGreaterThanOrEqual(1); // At least one should succeed

      // Verify final state is consistent
      const finalMeeting = await prisma.meeting.findUnique({
        where: { id: meeting.id },
      });

      expect(finalMeeting?.description).toMatch(/Update [12]/);
    });
  });
});
