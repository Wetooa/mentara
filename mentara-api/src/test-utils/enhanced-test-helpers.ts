/**
 * Enhanced Test Helpers for Mentara Backend Testing
 * Provides advanced utilities for comprehensive testing
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../providers/prisma-client.provider';
import { createMockPrismaService, TEST_USER_IDS, TEST_EMAILS } from './index';

// Enhanced Mock Builders
export class MockBuilder {
  /**
   * Creates a comprehensive NestJS testing module with all common mocks
   */
  static async createTestingModule(
    providers: any[] = [],
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      providers: [
        ...providers,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
        {
          provide: 'EventBusService',
          useValue: {
            emit: jest.fn(),
            subscribe: jest.fn(),
          },
        },
        {
          provide: 'EmailService',
          useValue: {
            sendEmail: jest.fn(),
            sendTemplateEmail: jest.fn(),
          },
        },
      ],
    }).compile();
  }

  /**
   * Creates mock authentication context
   */
  static createAuthContext(role: string = 'client', userId?: string) {
    return {
      userId:
        userId ||
        TEST_USER_IDS[role.toUpperCase() as keyof typeof TEST_USER_IDS],
      role,
      email: TEST_EMAILS[role.toUpperCase() as keyof typeof TEST_EMAILS],
      isActive: true,
      isVerified: true,
    };
  }

  /**
   * Creates mock request object with authentication
   */
  static createMockRequest(role: string = 'client', userId?: string) {
    const authContext = this.createAuthContext(role, userId);
    return {
      user: authContext,
      headers: {
        authorization: `Bearer mock-jwt-token-${role}`,
        'user-agent': 'test-agent',
      },
      ip: '127.0.0.1',
      method: 'GET',
      url: '/test',
    };
  }
}

// Test Data Generators
export class TestDataGenerator {
  /**
   * Generates realistic test user data
   */
  static createUser(overrides: Partial<any> = {}) {
    return {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      role: 'client',
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generates therapist application data
   */
  static createTherapistApplication(overrides: Partial<any> = {}) {
    return {
      userId: TEST_USER_IDS.THERAPIST,
      email: TEST_EMAILS.THERAPIST,
      firstName: 'Dr. Test',
      lastName: 'Therapist',
      mobile: '+1234567890',
      province: 'Test Province',
      providerType: 'Licensed Clinical Psychologist',
      professionalLicenseType: 'LCP',
      isPRCLicensed: 'yes',
      prcLicenseNumber: 'LCP-12345',
      practiceStartDate: new Date('2020-01-01'),
      areasOfExpertise: ['anxiety', 'depression'],
      therapeuticApproachesUsedList: ['CBT', 'DBT'],
      languagesOffered: ['English'],
      assessmentTools: ['GAD-7', 'PHQ-9'],
      providedOnlineTherapyBefore: true,
      comfortableUsingVideoConferencing: true,
      weeklyAvailability: '20-30 hours',
      preferredSessionLength: '60',
      hourlyRate: 150.0,
      ...overrides,
    };
  }

  /**
   * Generates meeting/session data
   */
  static createMeeting(overrides: Partial<any> = {}) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow

    return {
      id: `meeting-${Date.now()}`,
      title: 'Test Therapy Session',
      startTime: futureDate,
      duration: 60,
      status: 'SCHEDULED',
      meetingType: 'video',
      clientId: TEST_USER_IDS.CLIENT,
      therapistId: TEST_USER_IDS.THERAPIST,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  /**
   * Generates message data for testing
   */
  static createMessage(overrides: Partial<any> = {}) {
    return {
      id: `message-${Date.now()}`,
      conversationId: `conversation-${Date.now()}`,
      senderId: TEST_USER_IDS.CLIENT,
      content: 'Test message content',
      messageType: 'TEXT',
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generates assessment data
   */
  static createPreAssessment(overrides: Partial<any> = {}) {
    // Generate 201 random answers (1-5 scale)
    const answers = Array.from(
      { length: 201 },
      () => Math.floor(Math.random() * 5) + 1,
    );

    return {
      id: `assessment-${Date.now()}`,
      userId: TEST_USER_IDS.CLIENT,
      responses: answers,
      completedAt: new Date(),
      scores: {
        anxiety: 65,
        depression: 45,
        stress: 55,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}

// Test Assertion Helpers
export class TestAssertions {
  /**
   * Asserts that a function throws a specific NestJS exception
   */
  static async expectToThrowNestException(
    asyncFn: () => Promise<any>,
    exceptionType: any,
    expectedMessage?: string,
  ) {
    let thrownError: any = null;
    try {
      await asyncFn();
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(exceptionType);
    if (expectedMessage) {
      expect(thrownError.message).toContain(expectedMessage);
    }
  }

  /**
   * Asserts proper DTO validation
   */
  static expectValidDto(dto: any, expectedFields: string[]) {
    expectedFields.forEach((field) => {
      expect(dto).toHaveProperty(field);
      expect(dto[field]).toBeDefined();
    });
  }

  /**
   * Asserts proper database entity structure
   */
  static expectValidEntity(entity: any, requiredFields: string[]) {
    expect(entity).toBeDefined();
    expect(entity).not.toBeNull();

    requiredFields.forEach((field) => {
      expect(entity).toHaveProperty(field);
    });

    // Common entity fields
    expect(entity).toHaveProperty('id');
    expect(entity).toHaveProperty('createdAt');
    expect(entity).toHaveProperty('updatedAt');
  }

  /**
   * Asserts proper API response structure
   */
  static expectValidApiResponse(response: any, expectedData?: any) {
    expect(response).toBeDefined();

    if (expectedData) {
      expect(response).toMatchObject(expectedData);
    }
  }
}

// Performance Testing Utilities
export class PerformanceTestUtils {
  /**
   * Measures function execution time
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // Convert to milliseconds

    return { result, duration };
  }

  /**
   * Asserts that a function executes within a time limit
   */
  static async expectToExecuteWithin<T>(
    fn: () => Promise<T>,
    maxDurationMs: number,
  ): Promise<T> {
    const { result, duration } = await this.measureExecutionTime(fn);

    expect(duration).toBeLessThan(maxDurationMs);

    return result;
  }

  /**
   * Runs a function multiple times and measures average performance
   */
  static async benchmarkFunction<T>(
    fn: () => Promise<T>,
    iterations: number = 10,
  ): Promise<{
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
  }> {
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureExecutionTime(fn);
      durations.push(duration);
    }

    return {
      averageDuration:
        durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
    };
  }
}

// Database Testing Utilities
export class DatabaseTestUtils {
  /**
   * Creates a transaction-wrapped test for database operations
   */
  static withTransaction(testFn: (prisma: any) => Promise<void>) {
    return async () => {
      const mockPrisma = createMockPrismaService();

      // Mock transaction behavior
      mockPrisma.$transaction = jest.fn(async (callback) => {
        return callback(mockPrisma);
      });

      await testFn(mockPrisma);
    };
  }

  /**
   * Validates that proper database constraints are checked
   */
  static expectDatabaseConstraintError(error: any, constraintType: string) {
    expect(error).toBeDefined();
    expect(error.message).toContain(constraintType);
  }
}

// Integration Testing Helpers
export class IntegrationTestHelpers {
  /**
   * Creates a full request context for integration tests
   */
  static createFullRequestContext(role: string = 'client') {
    return {
      user: MockBuilder.createAuthContext(role),
      request: MockBuilder.createMockRequest(role),
      response: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      },
    };
  }

  /**
   * Simulates a complete authentication flow
   */
  static async simulateAuthFlow(role: string = 'client') {
    const authContext = MockBuilder.createAuthContext(role);

    // Mock the authentication process
    const mockClerkUser = {
      id: authContext.userId,
      emailAddresses: [{ emailAddress: authContext.email }],
      firstName: 'Test',
      lastName: 'User',
    };

    return { authContext, mockClerkUser };
  }
}

// All utilities are already exported above via class declarations
