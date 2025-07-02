import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../providers/prisma-client.provider';
import { DatabaseTestSetup } from '../database-test.setup';
import { MeetingStatus } from '@prisma/client';

describe('Booking Workflow E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;
  let clientId: string;
  let therapistId: string;

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
    await setupTestUsers();
  });

  afterEach(async () => {
    await DatabaseTestSetup.cleanupDatabase();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  async function setupTestUsers() {
    // Create client
    const client = await prisma.user.create({
      data: {
        id: 'booking-client-123',
        email: 'booking.client@test.com',
        firstName: 'Booking',
        lastName: 'Client',
        role: 'client',
      },
    });
    clientId = client.id;

    await prisma.client.create({
      data: {
        userId: clientId,
        hasSeenTherapistRecommendations: true,
      },
    });

    // Create therapist
    const { id: newTherapistId } = await prisma.user.create({
      data: {
        id: 'booking-therapist-123',
        email: 'booking.therapist@test.com',
        firstName: 'Booking',
        lastName: 'Therapist',
        role: 'therapist',
      },
    });
    therapistId = newTherapistId;

    await prisma.therapist.create({
      data: {
        userId: therapistId,
        mobile: '+1234567890',
        province: 'Ontario',
        providerType: 'Clinical Psychologist',
        professionalLicenseType: 'Licensed',
        isPRCLicensed: 'yes',
        prcLicenseNumber: 'PRC789012',
        expirationDateOfLicense: new Date('2025-12-31'),
        practiceStartDate: new Date('2020-01-01'),
        yearsOfExperience: 4,
        areasOfExpertise: ['Anxiety', 'Depression'],
        assessmentTools: ['PHQ-9', 'GAD-7'],
        therapeuticApproachesUsedList: ['CBT', 'DBT'],
        languagesOffered: ['English'],
        providedOnlineTherapyBefore: true,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [60],
        sessionLength: '60',
        hourlyRate: 160,
        compliesWithDataPrivacyAct: true,
        willingToAbideByPlatformGuidelines: true,
        status: 'approved',
        treatmentSuccessRates: {},
      },
    });
  }

  describe('Complete Booking Flow', () => {
    it('should complete full booking workflow from search to session completion', async () => {
      // Step 1: Search for therapists
      const searchResponse = await request(app.getHttpServer())
        .get('/search/therapists?expertise=anxiety&province=ontario')
        .set('x-user-id', clientId)
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(Array.isArray(searchResponse.body.data)).toBe(true);

      // Step 2: View therapist profile
      const profileResponse = await request(app.getHttpServer())
        .get(`/therapist/profile/${therapistId}`)
        .set('x-user-id', clientId)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.id).toBe(therapistId);

      // Step 3: Check therapist availability
      const availabilityResponse = await request(app.getHttpServer())
        .get(`/booking/therapists/${therapistId}/availability`)
        .set('x-user-id', clientId)
        .expect(200);

      expect(availabilityResponse.body.success).toBe(true);

      // Step 4: Book a meeting
      const meetingData = {
        therapistId: therapistId,
        scheduledAt: new Date('2024-12-20T10:00:00Z').toISOString(),
        duration: 60,
        meetingType: 'INDIVIDUAL',
        notes: 'First session - anxiety management',
      };

      const bookingResponse = await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(meetingData)
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
      const meetingId = bookingResponse.body.data.id;

      // Step 5: Verify meeting appears in client's bookings
      const clientMeetingsResponse = await request(app.getHttpServer())
        .get('/booking/meetings')
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .expect(200);

      expect(clientMeetingsResponse.body.data).toHaveLength(1);
      expect(clientMeetingsResponse.body.data[0].id).toBe(meetingId);

      // Step 6: Verify meeting appears in therapist's schedule
      const therapistMeetingsResponse = await request(app.getHttpServer())
        .get('/booking/meetings')
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(therapistMeetingsResponse.body.data).toHaveLength(1);
      expect(therapistMeetingsResponse.body.data[0].id).toBe(meetingId);

      // Step 7: Start the session (therapist perspective)
      const startSessionResponse = await request(app.getHttpServer())
        .patch(`/booking/meetings/${meetingId}/start`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .expect(200);

      expect(startSessionResponse.body.data.status).toBe(
        MeetingStatus.IN_PROGRESS,
      );

      // Step 8: Complete the session with notes
      const completeSessionData = {
        sessionNotes:
          'Client showed good engagement. Discussed coping strategies for anxiety. Homework assigned: practice breathing exercises.',
        nextSteps:
          'Follow up in 1 week. Focus on implementation of breathing techniques.',
      };

      const completeSessionResponse = await request(app.getHttpServer())
        .patch(`/booking/meetings/${meetingId}/complete`)
        .set('x-user-id', therapistId)
        .set('x-user-role', 'therapist')
        .send(completeSessionData)
        .expect(200);

      expect(completeSessionResponse.body.data.status).toBe(
        MeetingStatus.COMPLETED,
      );
      expect(completeSessionResponse.body.data.sessionNotes).toContain(
        'coping strategies',
      );

      // Step 9: Client reviews the session
      const reviewData = {
        rating: 5,
        comment:
          'Very helpful session. The breathing techniques are already making a difference.',
        wouldRecommend: true,
      };

      const reviewResponse = await request(app.getHttpServer())
        .post(`/reviews/therapist/${therapistId}`)
        .set('x-user-id', clientId)
        .send(reviewData)
        .expect(201);

      expect(reviewResponse.body.success).toBe(true);
      expect(reviewResponse.body.data.rating).toBe(5);

      // Step 10: Book a follow-up session
      const followUpMeetingData = {
        therapistId: therapistId,
        scheduledAt: new Date('2024-12-27T10:00:00Z').toISOString(),
        duration: 60,
        meetingType: 'INDIVIDUAL',
        notes: 'Follow-up session - review breathing exercises progress',
      };

      const followUpResponse = await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(followUpMeetingData)
        .expect(201);

      expect(followUpResponse.body.success).toBe(true);

      // Verify complete workflow in database
      const finalMeetings = await prisma.meeting.findMany({
        where: { clientId: clientId },
        include: {
          reviews: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      expect(finalMeetings).toHaveLength(2);
      expect(finalMeetings[0].status).toBe(MeetingStatus.COMPLETED);
      expect(finalMeetings[0].description).toContain('coping strategies');
      expect(finalMeetings[0].reviews).toHaveLength(1);
      expect(finalMeetings[1].status).toBe(MeetingStatus.SCHEDULED);
    });

    it('should handle booking cancellation and rescheduling workflow', async () => {
      // Step 1: Book initial meeting
      const meetingData = {
        therapistId: therapistId,
        scheduledAt: new Date('2024-12-25T14:00:00Z').toISOString(),
        duration: 60,
        meetingType: 'INDIVIDUAL',
        notes: 'Initial booking to be rescheduled',
      };

      const bookingResponse = await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(meetingData)
        .expect(201);

      const meetingId = bookingResponse.body.data.id;

      // Step 2: Client needs to reschedule - first cancel
      const cancelResponse = await request(app.getHttpServer())
        .delete(`/booking/meetings/${meetingId}/cancel`)
        .set('x-user-id', clientId)
        .set('x-user-role', 'client')
        .send({ reason: 'Need to reschedule due to work conflict' })
        .expect(200);

      expect(cancelResponse.body.data.status).toBe(MeetingStatus.CANCELLED);

      // Step 3: Book new meeting at different time
      const rescheduledMeetingData = {
        therapistId: therapistId,
        scheduledAt: new Date('2024-12-26T10:00:00Z').toISOString(),
        duration: 60,
        meetingType: 'INDIVIDUAL',
        notes: 'Rescheduled meeting',
      };

      const rescheduledResponse = await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(rescheduledMeetingData)
        .expect(201);

      expect(rescheduledResponse.body.success).toBe(true);
      const newMeetingId = rescheduledResponse.body.data.id;

      // Step 4: Verify both meetings exist with correct statuses
      const allMeetings = await prisma.meeting.findMany({
        where: { clientId: clientId },
        orderBy: { createdAt: 'asc' },
      });

      expect(allMeetings).toHaveLength(2);
      expect(allMeetings[0].status).toBe(MeetingStatus.CANCELLED);
      expect(allMeetings[1].status).toBe(MeetingStatus.SCHEDULED);
      expect(allMeetings[1].id).toBe(newMeetingId);
    });
  });

  describe('Booking Edge Cases', () => {
    it('should handle double booking prevention', async () => {
      const meetingTime = new Date('2024-12-30T15:00:00Z').toISOString();

      // First booking
      const firstBookingData = {
        therapistId: therapistId,
        scheduledAt: meetingTime,
        duration: 60,
        meetingType: 'INDIVIDUAL',
        notes: 'First booking',
      };

      await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(firstBookingData)
        .expect(201);

      // Attempt second booking at same time (should fail)
      const conflictingBookingData = {
        therapistId: therapistId,
        scheduledAt: meetingTime,
        duration: 60,
        meetingType: 'INDIVIDUAL',
        notes: 'Conflicting booking',
      };

      const conflictResponse = await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', 'another-client-123')
        .send(conflictingBookingData)
        .expect(400);

      expect(conflictResponse.body.success).toBe(false);
      expect(conflictResponse.body.message).toContain('conflict');
    });

    it('should prevent booking in past', async () => {
      const pastTime = new Date('2020-01-01T10:00:00Z').toISOString();

      const pastBookingData = {
        therapistId: therapistId,
        scheduledAt: pastTime,
        duration: 60,
        meetingType: 'INDIVIDUAL',
      };

      const response = await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(pastBookingData)
        .expect(400);

      expect(response.body.message).toContain('past');
    });

    it('should handle booking outside therapist availability', async () => {
      // Try to book at 2 AM when therapist is not available
      const unavailableTime = new Date('2024-12-31T02:00:00Z').toISOString();

      const unavailableBookingData = {
        therapistId: therapistId,
        scheduledAt: unavailableTime,
        duration: 60,
        meetingType: 'INDIVIDUAL',
      };

      const response = await request(app.getHttpServer())
        .post('/booking/meetings')
        .set('x-user-id', clientId)
        .send(unavailableBookingData)
        .expect(400);

      expect(response.body.message).toContain('availability');
    });
  });

  describe('Multi-User Booking Scenarios', () => {
    it('should handle concurrent booking attempts gracefully', async () => {
      const meetingTime = new Date('2025-01-01T10:00:00Z').toISOString();

      // Create multiple clients
      const clients: string[] = [];
      for (let i = 0; i < 3; i++) {
        const client = await prisma.user.create({
          data: {
            id: `concurrent-client-${i}`,
            email: `concurrent${i}@test.com`,
            firstName: `Client${i}`,
            lastName: 'Test',
            role: 'client',
          },
        });
        clients.push(client.id);
      }

      // All clients try to book same time slot simultaneously
      const bookingPromises = clients.map((clientId) =>
        request(app.getHttpServer())
          .post('/booking/meetings')
          .set('x-user-id', clientId)
          .send({
            therapistId: therapistId,
            scheduledAt: meetingTime,
            duration: 60,
            meetingType: 'INDIVIDUAL',
            notes: `Booking from ${clientId}`,
          }),
      );

      const results = await Promise.allSettled(bookingPromises);

      // Only one should succeed
      const successful = results.filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status === 201,
      ).length;

      const failed = results.filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status >= 400,
      ).length;

      expect(successful).toBe(1);
      expect(failed).toBe(2);

      // Verify only one meeting exists
      const meetings = await prisma.meeting.findMany({
        where: {
          therapistId: therapistId,
          startTime: new Date(meetingTime),
        },
      });

      expect(meetings).toHaveLength(1);
    });

    it('should maintain data consistency during high load', async () => {
      // Create multiple valid time slots
      const timeSlots = [
        '2025-01-02T09:00:00Z',
        '2025-01-02T10:00:00Z',
        '2025-01-02T11:00:00Z',
        '2025-01-02T14:00:00Z',
        '2025-01-02T15:00:00Z',
      ];

      // Create multiple clients
      const clients: string[] = [];
      for (let i = 0; i < 5; i++) {
        const client = await prisma.user.create({
          data: {
            id: `load-client-${i}`,
            email: `load${i}@test.com`,
            firstName: `LoadClient${i}`,
            lastName: 'Test',
            role: 'client',
          },
        });
        clients.push(client.id);
      }

      // Each client books a different time slot
      const bookingPromises = clients.map((clientId, index) =>
        request(app.getHttpServer())
          .post('/booking/meetings')
          .set('x-user-id', clientId)
          .send({
            therapistId: therapistId,
            scheduledAt: timeSlots[index],
            duration: 60,
            meetingType: 'INDIVIDUAL',
            notes: `Load test booking ${index}`,
          }),
      );

      const results = await Promise.allSettled(bookingPromises);

      // All should succeed since different time slots
      const successful = results.filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status === 201,
      ).length;

      expect(successful).toBe(5);

      // Verify all meetings exist
      const allMeetings = await prisma.meeting.findMany({
        where: { therapistId: therapistId },
        orderBy: { createdAt: 'asc' },
      });

      expect(allMeetings.length).toBeGreaterThanOrEqual(5);

      // Verify no duplicate bookings at same time
      const timeSlotCounts = new Map();
      allMeetings.forEach((meeting) => {
        const timeKey = meeting.startTime.toISOString();
        timeSlotCounts.set(timeKey, (timeSlotCounts.get(timeKey) || 0) + 1);
      });

      Array.from(timeSlotCounts.values()).forEach((count) => {
        expect(count).toBe(1); // No time slot should have more than 1 booking
      });
    });
  });
});
