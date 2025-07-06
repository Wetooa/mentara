import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../providers/prisma-client.provider';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseTestSetup } from '../database-test.setup';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // Setup test database
    prisma = await DatabaseTestSetup.setupTestDatabase();

    moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
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

  describe('POST /auth/register/client', () => {
    it('should create a new client successfully', async () => {
      const clientData = {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          mobile: '+1234567890',
          address: '123 Main St',
          birthDate: '1990-01-01',
        },
        hasSeenTherapistRecommendations: false,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register/client')
        .send(clientData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          user: expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          }),
        }),
      });

      // Verify in database
      const user = await prisma.user.findUnique({
        where: { email: 'john.doe@example.com' },
        include: { client: true },
      });

      expect(user).toBeTruthy();
      expect(user?.client).toBeTruthy();
      expect(user?.role).toBe('client');
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await prisma.user.create({
        data: {
          id: 'existing-user',
          email: 'existing@example.com',
          firstName: 'Existing',
          lastName: 'User',
          role: 'client',
        },
      });

      const clientData = {
        user: {
          firstName: 'New',
          lastName: 'User',
          email: 'existing@example.com',
          mobile: '+1234567890',
        },
        hasSeenTherapistRecommendations: false,
      };

      await request(app.getHttpServer())
        .post('/auth/register/client')
        .send(clientData)
        .expect(409);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        user: {
          firstName: 'John',
          // Missing required fields
        },
        hasSeenTherapistRecommendations: false,
      };

      await request(app.getHttpServer())
        .post('/auth/register/client')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /auth/register/therapist', () => {
    it('should create a new therapist application', async () => {
      const therapistData = {
        userId: 'therapist-123',
        email: 'therapist@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        mobile: '+1234567890',
        province: 'Ontario',
        providerType: 'Clinical Psychologist',
        professionalLicenseType: 'Licensed',
        isPRCLicensed: 'yes',
        prcLicenseNumber: 'PRC123456',
        isLicenseActive: 'yes',
        practiceStartDate: '2020-01-01',
        yearsOfExperience: 5,
        areasOfExpertise: ['Anxiety', 'Depression'],
        assessmentTools: ['PHQ-9', 'GAD-7'],
        therapeuticApproachesUsedList: ['CBT', 'DBT'],
        languagesOffered: ['English', 'French'],
        providedOnlineTherapyBefore: 'yes',
        comfortableUsingVideoConferencing: 'yes',
        weeklyAvailability: '20',
        preferredSessionLength: '60',
        accepts: ['Individual', 'Couples'],
        hourlyRate: 150,
        bio: 'Experienced therapist.',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register/therapist')
        .send(therapistData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          applicationStatus: 'PENDING',
          email: 'therapist@example.com',
        }),
      });

      // Verify in database
      const therapist = await prisma.therapist.findUnique({
        where: { userId: response.body.data.id },
      });

      expect(therapist).toBeTruthy();
      expect(therapist?.status).toBe('PENDING');
    });

    it('should validate professional license requirements', async () => {
      const invalidTherapistData = {
        userId: 'therapist-123',
        email: 'therapist@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        // Missing professional license info
      };

      await request(app.getHttpServer())
        .post('/auth/register/therapist')
        .send(invalidTherapistData)
        .expect(400);
    });
  });

  describe('Database Transactions', () => {
    it('should rollback on client registration failure', async () => {
      // Mock a scenario where user creation succeeds but client creation fails
      const clientData = {
        user: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          mobile: '+1234567890',
        },
        hasSeenTherapistRecommendations: false,
      };

      // Attempt registration with invalid data that would cause a rollback
      try {
        await request(app.getHttpServer())
          .post('/auth/register/client')
          .send(clientData);
      } catch {
        // Expected to fail
      }

      // Verify no orphaned user record exists
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      // Should be null if transaction was properly rolled back
      expect(user).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      // Create a user and client
      const user = await prisma.user.create({
        data: {
          id: 'test-user-123',
          email: 'integrity@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'client',
        },
      });

      const client = await prisma.client.create({
        data: {
          userId: user.id,
          hasSeenTherapistRecommendations: false,
        },
      });

      // Verify relationships
      const userWithClient = await prisma.user.findUnique({
        where: { id: user.id },
        include: { client: true },
      });

      expect(userWithClient?.client?.userId).toBe(client.userId);
      expect(userWithClient?.client?.userId).toBe(user.id);
    });

    it('should enforce unique constraints', async () => {
      // Create first user
      await prisma.user.create({
        data: {
          id: 'user-1',
          email: 'unique@example.com',
          firstName: 'First',
          lastName: 'User',
          role: 'client',
        },
      });

      // Try to create second user with same email - should fail
      await expect(
        prisma.user.create({
          data: {
            id: 'user-2',
            email: 'unique@example.com',
            firstName: 'Second',
            lastName: 'User',
            role: 'client',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('Complex Queries', () => {
    beforeEach(async () => {
      // Setup test data
      await prisma.user.createMany({
        data: [
          {
            id: 'client-1',
            email: 'client1@example.com',
            firstName: 'Client',
            lastName: 'One',
            role: 'client',
          },
          {
            id: 'therapist-1',
            firstName: 'Therapist',
            lastName: 'One',
            email: 'therapist1@example.com',
            role: 'therapist',
          },
        ],
      });

      await prisma.client.create({
        data: {
          userId: 'client-1',
          hasSeenTherapistRecommendations: false,
        },
      });

      await prisma.therapist.create({
        data: {
          userId: 'therapist-1',
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
          status: 'approved',
          hourlyRate: 150,
          expirationDateOfLicense: new Date('2025-01-01'),
          compliesWithDataPrivacyAct: true,
          willingToAbideByPlatformGuidelines: true,
          treatmentSuccessRates: {},
          sessionLength: '60 minutes',
        },
      });
    });

    it('should perform complex joins correctly', async () => {
      const result = await prisma.user.findMany({
        where: { role: 'therapist' },
        include: {
          therapist: {
            select: {
              status: true,
              hourlyRate: true,
              areasOfExpertise: true,
            },
          },
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].therapist?.status).toBe('APPROVED');
      expect(Number(result[0].therapist?.hourlyRate)).toBeCloseTo(150);
    });

    it('should handle aggregation queries', async () => {
      const stats = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      });

      expect(stats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'client',
            _count: { id: 1 },
          }),
          expect.objectContaining({
            role: 'therapist',
            _count: { id: 1 },
          }),
        ]),
      );
    });
  });
});
