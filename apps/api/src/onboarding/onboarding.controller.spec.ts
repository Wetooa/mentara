/**
 * Comprehensive Test Suite for OnboardingController
 * Tests user onboarding flow management and completion tracking
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService, OnboardingStatus } from './onboarding.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/core/guards/admin-auth.guard';
import { ADMIN_ONLY_KEY } from '../auth/core/decorators/admin-only.decorator';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('OnboardingController', () => {
  let controller: OnboardingController;
  let onboardingService: OnboardingService;
  let module: TestingModule;

  // Mock OnboardingService
  const mockOnboardingService = {
    getOnboardingStatus: jest.fn(),
    markStepCompleted: jest.fn(),
    validateOnboardingCompleteness: jest.fn(),
    getOnboardingInsights: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockAdminAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockOnboardingStatus: OnboardingStatus = {
    userId: TEST_USER_IDS.CLIENT,
    isCompleted: false,
    completionPercentage: 60,
    steps: {
      profileSetup: {
        completed: true,
        completedAt: new Date('2024-02-10T10:00:00Z'),
        required: true,
      },
      preAssessment: {
        completed: true,
        completedAt: new Date('2024-02-11T14:00:00Z'),
        required: true,
      },
      therapistSelection: {
        completed: false,
        completedAt: null,
        required: true,
      },
      firstSession: {
        completed: false,
        completedAt: null,
        required: false,
      },
      communityJoin: {
        completed: false,
        completedAt: null,
        required: false,
      },
    },
    nextSteps: [
      {
        stepName: 'therapistSelection',
        title: 'Select Your Therapist',
        description: 'Browse and select a therapist that matches your needs',
        required: true,
        estimatedTime: 15,
      },
    ],
    startedAt: new Date('2024-02-10T09:00:00Z'),
    lastUpdatedAt: new Date('2024-02-11T14:30:00Z'),
  };

  const mockCompletedOnboardingStatus: OnboardingStatus = {
    ...mockOnboardingStatus,
    isCompleted: true,
    completionPercentage: 100,
    steps: {
      ...mockOnboardingStatus.steps,
      therapistSelection: {
        completed: true,
        completedAt: new Date('2024-02-12T16:00:00Z'),
        required: true,
      },
      firstSession: {
        completed: true,
        completedAt: new Date('2024-02-13T10:00:00Z'),
        required: false,
      },
    },
    nextSteps: [],
    completedAt: new Date('2024-02-13T10:00:00Z'),
  };

  const mockValidationResult = {
    isValid: true,
    missingSteps: [],
    recommendations: [
      {
        stepName: 'communityJoin',
        priority: 'low',
        reason: 'Joining a community can provide additional support',
      },
    ],
  };

  const mockOnboardingInsights = {
    totalUsers: 15234,
    completedOnboarding: 12456,
    completionRate: 81.7,
    averageCompletionTime: 3.2, // days
    stepCompletionRates: {
      profileSetup: 98.5,
      preAssessment: 94.2,
      therapistSelection: 87.3,
      firstSession: 76.8,
      communityJoin: 45.2,
    },
    commonDropOffPoints: [
      {
        stepName: 'therapistSelection',
        dropOffRate: 12.7,
        commonReasons: ['Too many options', 'Pricing concerns', 'Availability issues'],
      },
      {
        stepName: 'firstSession',
        dropOffRate: 10.5,
        commonReasons: ['Scheduling conflicts', 'Technical issues', 'Changed mind'],
      },
    ],
    recentTrends: {
      weeklyCompletions: [45, 52, 48, 67, 59, 71, 63],
      improvementAreas: ['therapist matching', 'scheduling flow', 'pricing clarity'],
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        {
          provide: OnboardingService,
          useValue: mockOnboardingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminAuthGuard)
      .useValue(mockAdminAuthGuard)
      .compile();

    controller = module.get<OnboardingController>(OnboardingController);
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have onboardingService injected', () => {
      expect(onboardingService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', OnboardingController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', OnboardingController);
      expect(controllerMetadata).toBe('onboarding');
    });

    it('should require admin role for admin-only endpoints', () => {
      const adminOnlyMethods = ['getUserOnboardingStatus', 'getOnboardingInsights'];
      adminOnlyMethods.forEach(method => {
        const metadata = Reflect.getMetadata(ADMIN_ONLY_KEY, controller[method]);
        expect(metadata).toBe(true);
      });
    });
  });

  describe('GET /onboarding/status', () => {
    it('should get my onboarding status successfully', async () => {
      mockOnboardingService.getOnboardingStatus.mockResolvedValue(mockOnboardingStatus);

      const result = await controller.getMyOnboardingStatus(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockOnboardingStatus);
      expect(onboardingService.getOnboardingStatus).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to retrieve onboarding status');
      mockOnboardingService.getOnboardingStatus.mockRejectedValue(serviceError);

      await expect(
        controller.getMyOnboardingStatus(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(HttpException);

      try {
        await controller.getMyOnboardingStatus(TEST_USER_IDS.CLIENT);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.message).toContain('Failed to retrieve onboarding status');
      }
    });

    it('should validate onboarding status structure', async () => {
      mockOnboardingService.getOnboardingStatus.mockResolvedValue(mockOnboardingStatus);

      const result = await controller.getMyOnboardingStatus(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('isCompleted');
      expect(result).toHaveProperty('completionPercentage');
      expect(result).toHaveProperty('steps');
      expect(result).toHaveProperty('nextSteps');
      expect(result).toHaveProperty('startedAt');
      expect(result).toHaveProperty('lastUpdatedAt');

      expect(typeof result.isCompleted).toBe('boolean');
      expect(typeof result.completionPercentage).toBe('number');
      expect(result.completionPercentage).toBeGreaterThanOrEqual(0);
      expect(result.completionPercentage).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.nextSteps)).toBe(true);
    });

    it('should handle completed onboarding status', async () => {
      mockOnboardingService.getOnboardingStatus.mockResolvedValue(mockCompletedOnboardingStatus);

      const result = await controller.getMyOnboardingStatus(TEST_USER_IDS.CLIENT);

      expect(result.isCompleted).toBe(true);
      expect(result.completionPercentage).toBe(100);
      expect(result.nextSteps).toHaveLength(0);
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('GET /onboarding/status/:userId', () => {
    it('should get user onboarding status successfully as admin', async () => {
      mockOnboardingService.getOnboardingStatus.mockResolvedValue(mockOnboardingStatus);

      const result = await controller.getUserOnboardingStatus(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockOnboardingStatus);
      expect(onboardingService.getOnboardingStatus).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle service errors for admin requests', async () => {
      const serviceError = new Error('User not found');
      mockOnboardingService.getOnboardingStatus.mockRejectedValue(serviceError);

      await expect(
        controller.getUserOnboardingStatus(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(HttpException);
    });

    it('should pass through HTTP exceptions from service', async () => {
      const httpError = new HttpException('User not found', HttpStatus.NOT_FOUND);
      mockOnboardingService.getOnboardingStatus.mockRejectedValue(httpError);

      await expect(
        controller.getUserOnboardingStatus('nonexistent_user')
      ).rejects.toThrow(httpError);
    });

    it('should handle different user IDs', async () => {
      const userIds = [TEST_USER_IDS.CLIENT, TEST_USER_IDS.THERAPIST, 'custom_user_123'];
      
      for (const userId of userIds) {
        mockOnboardingService.getOnboardingStatus.mockResolvedValue({
          ...mockOnboardingStatus,
          userId,
        });

        const result = await controller.getUserOnboardingStatus(userId);
        expect(result.userId).toBe(userId);
      }
    });
  });

  describe('POST /onboarding/complete-step/:stepName', () => {
    it('should complete step successfully', async () => {
      const updatedStatus = {
        ...mockOnboardingStatus,
        steps: {
          ...mockOnboardingStatus.steps,
          therapistSelection: {
            completed: true,
            completedAt: new Date('2024-02-12T16:00:00Z'),
            required: true,
          },
        },
        completionPercentage: 80,
      };
      mockOnboardingService.markStepCompleted.mockResolvedValue(updatedStatus);

      const result = await controller.completeStep(TEST_USER_IDS.CLIENT, 'therapistSelection');

      expect(result).toEqual(updatedStatus);
      expect(onboardingService.markStepCompleted).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        'therapistSelection'
      );
    });

    it('should handle different step names', async () => {
      const stepNames = [
        'profileSetup',
        'preAssessment',
        'therapistSelection',
        'firstSession',
        'communityJoin',
      ];

      for (const stepName of stepNames) {
        mockOnboardingService.markStepCompleted.mockResolvedValue({
          ...mockOnboardingStatus,
          steps: {
            ...mockOnboardingStatus.steps,
            [stepName]: {
              completed: true,
              completedAt: new Date(),
              required: true,
            },
          },
        });

        const result = await controller.completeStep(TEST_USER_IDS.CLIENT, stepName);
        expect(result.steps[stepName].completed).toBe(true);
      }
    });

    it('should handle service errors during step completion', async () => {
      const serviceError = new Error('Invalid step name');
      mockOnboardingService.markStepCompleted.mockRejectedValue(serviceError);

      await expect(
        controller.completeStep(TEST_USER_IDS.CLIENT, 'invalidStep')
      ).rejects.toThrow(HttpException);

      try {
        await controller.completeStep(TEST_USER_IDS.CLIENT, 'invalidStep');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.message).toContain('Failed to complete onboarding step');
      }
    });

    it('should validate completion progress updates', async () => {
      const initialPercentage = mockOnboardingStatus.completionPercentage;
      const updatedStatus = {
        ...mockOnboardingStatus,
        completionPercentage: initialPercentage + 20,
      };
      mockOnboardingService.markStepCompleted.mockResolvedValue(updatedStatus);

      const result = await controller.completeStep(TEST_USER_IDS.CLIENT, 'therapistSelection');

      expect(result.completionPercentage).toBeGreaterThan(initialPercentage);
      expect(result.completionPercentage).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /onboarding/validate', () => {
    it('should validate onboarding successfully', async () => {
      mockOnboardingService.validateOnboardingCompleteness.mockResolvedValue(mockValidationResult);

      const result = await controller.validateOnboarding(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockValidationResult);
      expect(onboardingService.validateOnboardingCompleteness).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle validation with missing steps', async () => {
      const validationWithMissingSteps = {
        isValid: false,
        missingSteps: ['therapistSelection', 'firstSession'],
        recommendations: [
          {
            stepName: 'therapistSelection',
            priority: 'high',
            reason: 'Required step for accessing therapy services',
          },
        ],
      };
      mockOnboardingService.validateOnboardingCompleteness.mockResolvedValue(validationWithMissingSteps);

      const result = await controller.validateOnboarding(TEST_USER_IDS.CLIENT);

      expect(result.isValid).toBe(false);
      expect(result.missingSteps).toHaveLength(2);
      expect(result.recommendations).toHaveLength(1);
    });

    it('should handle service errors during validation', async () => {
      const serviceError = new Error('Validation service unavailable');
      mockOnboardingService.validateOnboardingCompleteness.mockRejectedValue(serviceError);

      await expect(
        controller.validateOnboarding(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(HttpException);

      try {
        await controller.validateOnboarding(TEST_USER_IDS.CLIENT);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.message).toContain('Failed to validate onboarding completeness');
      }
    });

    it('should validate response structure', async () => {
      mockOnboardingService.validateOnboardingCompleteness.mockResolvedValue(mockValidationResult);

      const result = await controller.validateOnboarding(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('missingSteps');
      expect(result).toHaveProperty('recommendations');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.missingSteps)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('GET /onboarding/insights', () => {
    it('should get onboarding insights successfully as admin', async () => {
      mockOnboardingService.getOnboardingInsights.mockResolvedValue(mockOnboardingInsights);

      const result = await controller.getOnboardingInsights();

      expect(result).toEqual(mockOnboardingInsights);
      expect(onboardingService.getOnboardingInsights).toHaveBeenCalled();
    });

    it('should handle service errors for insights', async () => {
      const serviceError = new Error('Analytics service unavailable');
      mockOnboardingService.getOnboardingInsights.mockRejectedValue(serviceError);

      await expect(
        controller.getOnboardingInsights()
      ).rejects.toThrow(HttpException);

      try {
        await controller.getOnboardingInsights();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.message).toContain('Failed to retrieve onboarding insights');
      }
    });

    it('should validate insights structure', async () => {
      mockOnboardingService.getOnboardingInsights.mockResolvedValue(mockOnboardingInsights);

      const result = await controller.getOnboardingInsights();

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('completedOnboarding');
      expect(result).toHaveProperty('completionRate');
      expect(result).toHaveProperty('averageCompletionTime');
      expect(result).toHaveProperty('stepCompletionRates');
      expect(result).toHaveProperty('commonDropOffPoints');
      expect(result).toHaveProperty('recentTrends');

      expect(typeof result.totalUsers).toBe('number');
      expect(typeof result.completionRate).toBe('number');
      expect(typeof result.averageCompletionTime).toBe('number');
      expect(typeof result.stepCompletionRates).toBe('object');
      expect(Array.isArray(result.commonDropOffPoints)).toBe(true);
      expect(Array.isArray(result.recentTrends.weeklyCompletions)).toBe(true);

      // Validate completion rate range
      expect(result.completionRate).toBeGreaterThanOrEqual(0);
      expect(result.completionRate).toBeLessThanOrEqual(100);
    });

    it('should validate step completion rates', async () => {
      mockOnboardingService.getOnboardingInsights.mockResolvedValue(mockOnboardingInsights);

      const result = await controller.getOnboardingInsights();

      const stepRates = result.stepCompletionRates;
      Object.values(stepRates).forEach(rate => {
        expect(typeof rate).toBe('number');
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted onboarding status', async () => {
      mockOnboardingService.getOnboardingStatus.mockResolvedValue(mockOnboardingStatus);

      const result = await controller.getMyOnboardingStatus(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('isCompleted');
      expect(result).toHaveProperty('completionPercentage');
      expect(result).toHaveProperty('steps');
      expect(result).toHaveProperty('nextSteps');
      expect(result).toHaveProperty('startedAt');
      expect(result).toHaveProperty('lastUpdatedAt');

      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.lastUpdatedAt).toBeInstanceOf(Date);
      expect(typeof result.completionPercentage).toBe('number');
    });

    it('should return properly formatted validation result', async () => {
      mockOnboardingService.validateOnboardingCompleteness.mockResolvedValue(mockValidationResult);

      const result = await controller.validateOnboarding(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('missingSteps');
      expect(result).toHaveProperty('recommendations');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.missingSteps)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should return properly formatted insights', async () => {
      mockOnboardingService.getOnboardingInsights.mockResolvedValue(mockOnboardingInsights);

      const result = await controller.getOnboardingInsights();

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('completedOnboarding');
      expect(result).toHaveProperty('completionRate');
      expect(result).toHaveProperty('stepCompletionRates');
      expect(result).toHaveProperty('commonDropOffPoints');

      expect(typeof result.totalUsers).toBe('number');
      expect(typeof result.completionRate).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockOnboardingService.getOnboardingStatus.mockRejectedValue(dbError);

      await expect(
        controller.getMyOnboardingStatus(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(HttpException);
    });

    it('should handle invalid user IDs', async () => {
      const invalidUserError = new Error('Invalid user ID format');
      mockOnboardingService.getOnboardingStatus.mockRejectedValue(invalidUserError);

      await expect(
        controller.getMyOnboardingStatus('invalid-user-id')
      ).rejects.toThrow(HttpException);
    });

    it('should handle onboarding service unavailable', async () => {
      const serviceError = new Error('Onboarding service temporarily unavailable');
      mockOnboardingService.markStepCompleted.mockRejectedValue(serviceError);

      await expect(
        controller.completeStep(TEST_USER_IDS.CLIENT, 'profileSetup')
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete onboarding workflow', async () => {
      // Get initial status
      mockOnboardingService.getOnboardingStatus.mockResolvedValue(mockOnboardingStatus);
      const initialStatus = await controller.getMyOnboardingStatus(TEST_USER_IDS.CLIENT);
      expect(initialStatus.isCompleted).toBe(false);

      // Complete a step
      const updatedStatus = {
        ...mockOnboardingStatus,
        completionPercentage: 80,
      };
      mockOnboardingService.markStepCompleted.mockResolvedValue(updatedStatus);
      const stepResult = await controller.completeStep(TEST_USER_IDS.CLIENT, 'therapistSelection');
      expect(stepResult.completionPercentage).toBeGreaterThan(initialStatus.completionPercentage);

      // Validate onboarding
      mockOnboardingService.validateOnboardingCompleteness.mockResolvedValue(mockValidationResult);
      const validationResult = await controller.validateOnboarding(TEST_USER_IDS.CLIENT);
      expect(validationResult).toHaveProperty('isValid');
    });

    it('should handle admin insights workflow', async () => {
      // Get insights as admin
      mockOnboardingService.getOnboardingInsights.mockResolvedValue(mockOnboardingInsights);
      const insights = await controller.getOnboardingInsights();
      expect(insights.totalUsers).toBeGreaterThan(0);
      expect(insights.completionRate).toBeGreaterThan(0);

      // Get specific user status as admin
      mockOnboardingService.getOnboardingStatus.mockResolvedValue(mockOnboardingStatus);
      const userStatus = await controller.getUserOnboardingStatus(TEST_USER_IDS.CLIENT);
      expect(userStatus.userId).toBe(TEST_USER_IDS.CLIENT);
    });

    it('should validate onboarding progression logic', async () => {
      // Test progression through multiple steps
      const steps = ['profileSetup', 'preAssessment', 'therapistSelection'];
      let currentPercentage = 0;

      for (let i = 0; i < steps.length; i++) {
        const newPercentage = Math.round(((i + 1) / steps.length) * 100);
        mockOnboardingService.markStepCompleted.mockResolvedValue({
          ...mockOnboardingStatus,
          completionPercentage: newPercentage,
        });

        const result = await controller.completeStep(TEST_USER_IDS.CLIENT, steps[i]);
        expect(result.completionPercentage).toBeGreaterThanOrEqual(currentPercentage);
        currentPercentage = result.completionPercentage;
      }
    });

    it('should handle edge cases in onboarding flow', async () => {
      // Test completing already completed step
      mockOnboardingService.markStepCompleted.mockResolvedValue(mockOnboardingStatus);
      const result = await controller.completeStep(TEST_USER_IDS.CLIENT, 'profileSetup');
      expect(result.steps.profileSetup.completed).toBe(true);

      // Test validation for completed onboarding
      mockOnboardingService.validateOnboardingCompleteness.mockResolvedValue({
        isValid: true,
        missingSteps: [],
        recommendations: [],
      });
      const validation = await controller.validateOnboarding(TEST_USER_IDS.CLIENT);
      expect(validation.isValid).toBe(true);
      expect(validation.missingSteps).toHaveLength(0);
    });
  });
});