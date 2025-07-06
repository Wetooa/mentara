// E2E test exports
export * from './user-registration.e2e-spec';
export * from './booking-workflow.e2e-spec';
export * from './messaging-workflow.e2e-spec';
export * from './therapist-dashboard.e2e-spec';

// E2E test configuration and utilities
export const E2E_TEST_CONFIG = {
  timeout: 60000, // 60 seconds for E2E tests
  database: {
    cleanup: true,
    seed: true,
  },
  api: {
    baseUrl: 'http://localhost',
    timeout: 30000,
  },
  performance: {
    maxResponseTime: 5000, // 5 seconds max for E2E operations
    maxConcurrentUsers: 10,
  },
};

export interface E2ETestSetup {
  app: any;
  prisma: any;
  moduleRef: any;
}

export class E2ETestHelper {
  static async setupCompleteUserFlow(prisma: any) {
    // Create all necessary test data for complete user flows
    const users = await this.createTestUsers(prisma);
    const therapists = await this.createTestTherapists(
      prisma,
      users.therapistUsers,
    );
    const clients = await this.createTestClients(prisma, users.clientUsers);

    return {
      users,
      therapists,
      clients,
    };
  }

  static async createTestUsers(prisma: any) {
    const clientUsers: any[] = [];
    const therapistUsers: any[] = [];

    // Create 3 client users
    for (let i = 1; i <= 3; i++) {
      const client = await prisma.user.create({
        data: {
          id: `e2e-client-${i}`,
          email: `e2e.client${i}@test.com`,
          firstName: `Client${i}`,
          lastName: 'E2E',
          role: 'client',
        },
      });
      clientUsers.push(client);
    }

    // Create 2 therapist users
    for (let i = 1; i <= 2; i++) {
      const therapist = await prisma.user.create({
        data: {
          id: `e2e-therapist-${i}`,
          email: `e2e.therapist${i}@test.com`,
          firstName: `Therapist${i}`,
          lastName: 'E2E',
          role: 'therapist',
        },
      });
      therapistUsers.push(therapist);
    }

    return { clientUsers, therapistUsers };
  }

  static async createTestTherapists(prisma: any, therapistUsers: any[]) {
    const therapists: any[] = [];

    for (let i = 0; i < therapistUsers.length; i++) {
      const therapist = await prisma.therapist.create({
        data: {
          id: `e2e-therapist-profile-${i + 1}`,
          userId: therapistUsers[i].id,
          email: therapistUsers[i].email,
          firstName: therapistUsers[i].firstName,
          lastName: therapistUsers[i].lastName,
          mobile: `+123456789${i}`,
          province: 'Ontario',
          providerType: 'Clinical Psychologist',
          professionalLicenseType: 'Licensed',
          isPRCLicensed: 'yes',
          prcLicenseNumber: `PRC${i + 1}23456`,
          isLicenseActive: 'yes',
          practiceStartDate: new Date('2020-01-01'),
          yearsOfExperience: 4,
          areasOfExpertise: ['Anxiety', 'Depression'],
          assessmentTools: ['PHQ-9', 'GAD-7'],
          therapeuticApproachesUsedList: ['CBT', 'DBT'],
          languagesOffered: ['English'],
          providedOnlineTherapyBefore: true,
          comfortableUsingVideoConferencing: true,
          preferredSessionLength: [60],
          applicationStatus: 'APPROVED',
          hourlyRate: 150 + i * 25,
          isActive: true,
        },
      });
      therapists.push(therapist);
    }

    return therapists;
  }

  static async createTestClients(prisma: any, clientUsers: any[]) {
    const clients: any[] = [];

    for (let i = 0; i < clientUsers.length; i++) {
      const client = await prisma.client.create({
        data: {
          id: `e2e-client-profile-${i + 1}`,
          userId: clientUsers[i].id,
          hasSeenTherapistRecommendations: i % 2 === 0, // Alternate true/false
        },
      });
      clients.push(client);
    }

    return clients;
  }

  static async simulateUserJourney(app: any, journeySteps: any[]) {
    const results: any[] = [];

    for (const step of journeySteps) {
      try {
        const startTime = Date.now();
        const result = await step.execute(app);
        const endTime = Date.now();

        results.push({
          stepName: step.name,
          success: true,
          duration: endTime - startTime,
          result,
        });
      } catch (error) {
        results.push({
          stepName: step.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });

        if (step.required) {
          throw new Error(`Required step failed: ${step.name}`);
        }
      }
    }

    return results;
  }

  static async measurePerformance(
    app: any,
    endpoint: string,
    options: any = {},
  ) {
    const iterations = options.iterations || 10;
    const concurrency = options.concurrency || 1;
    const times: number[] = [];

    const executeRequest = async () => {
      const startTime = Date.now();

      try {
        await app
          .get(endpoint)
          .set(options.headers || {})
          .expect(options.expectedStatus || 200);

        const endTime = Date.now();
        return endTime - startTime;
      } catch (error) {
        throw new Error(
          `Performance test failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    // Execute requests in batches for concurrency testing
    for (let batch = 0; batch < Math.ceil(iterations / concurrency); batch++) {
      const batchPromises: Promise<number>[] = [];
      const batchSize = Math.min(concurrency, iterations - batch * concurrency);

      for (let i = 0; i < batchSize; i++) {
        batchPromises.push(executeRequest());
      }

      const batchTimes = await Promise.all(batchPromises);
      times.push(...batchTimes);
    }

    return {
      average: times.reduce((sum, time) => sum + time, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)],
      total: times.length,
    };
  }

  static async validateDataConsistency(prisma: any, validations: any[]) {
    const results: any[] = [];

    for (const validation of validations) {
      try {
        const result = await validation.execute(prisma);
        results.push({
          name: validation.name,
          passed: result.passed,
          message: result.message,
          details: result.details,
        });
      } catch (error) {
        results.push({
          name: validation.name,
          passed: false,
          message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return results;
  }
}

// Common E2E test patterns
export const E2E_PATTERNS = {
  USER_REGISTRATION: {
    name: 'User Registration',
    steps: [
      'Submit registration form',
      'Verify email validation',
      'Complete profile setup',
      'Verify account creation',
    ],
  },
  BOOKING_FLOW: {
    name: 'Booking Flow',
    steps: [
      'Search therapists',
      'View therapist profile',
      'Check availability',
      'Book meeting',
      'Confirm booking',
    ],
  },
  MESSAGING_FLOW: {
    name: 'Messaging Flow',
    steps: [
      'Create conversation',
      'Send message',
      'Receive response',
      'Share file',
      'Mark as read',
    ],
  },
  THERAPY_SESSION: {
    name: 'Therapy Session',
    steps: [
      'Join session',
      'Conduct session',
      'Add session notes',
      'Complete session',
      'Submit review',
    ],
  },
};
