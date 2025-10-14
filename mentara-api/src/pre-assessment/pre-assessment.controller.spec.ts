/**
 * Comprehensive Test Suite for PreAssessmentController
 * Tests pre-assessment functionality and AI service integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/core/guards/admin-auth.guard';
import { PreAssessment } from '@prisma/client';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('PreAssessmentController', () => {
  let controller: PreAssessmentController;
  let preAssessmentService: PreAssessmentService;
  let aiServiceClient: AiServiceClient;
  let module: TestingModule;

  // Mock PreAssessmentService
  const mockPreAssessmentService = {
    createPreAssessment: jest.fn(),
    getPreAssessmentByUserId: jest.fn(),
    updatePreAssessment: jest.fn(),
    deletePreAssessment: jest.fn(),
  };

  // Mock AiServiceClient
  const mockAiServiceClient = {
    healthCheck: jest.fn(),
    getServiceInfo: jest.fn(),
    processAssessment: jest.fn(),
    getAssessmentResults: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockAdminAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockPreAssessment: PreAssessment = {
    id: 'assessment_123456789',
    userId: TEST_USER_IDS.CLIENT,
    scores: {
      anxiety: 6.8,
      depression: 4.2,
      stress: 7.5,
      ptsd: 2.1,
      bipolar: 1.8,
      ocd: 3.4,
      eating_disorders: 2.9,
      substance_abuse: 1.2,
      adhd: 5.7,
      autism: 2.3,
      personality_disorders: 3.1,
      sleep_disorders: 6.3,
      anger_management: 4.8,
    },
    responses: {
      demographics: {
        age: 28,
        gender: 'female',
        location: 'New York, NY',
        education: 'bachelors',
        employment: 'full_time',
        relationship_status: 'single',
      },
      mental_health_history: {
        previous_therapy: true,
        previous_medication: false,
        family_history: true,
        current_symptoms: ['anxiety', 'stress', 'sleep_issues'],
        symptom_duration: '6_months_to_1_year',
        severity_level: 'moderate',
      },
      preferences: {
        therapist_gender: 'no_preference',
        session_type: 'video',
        frequency: 'weekly',
        goals: ['manage_anxiety', 'improve_sleep', 'stress_reduction'],
        communication_style: 'direct',
      },
      questionnaire_responses: [
        { question_id: 'anx_1', response: 3, category: 'anxiety' },
        { question_id: 'anx_2', response: 4, category: 'anxiety' },
        { question_id: 'dep_1', response: 2, category: 'depression' },
        // ... more responses would be here in real data
      ],
    },
    completedAt: new Date('2024-02-14T10:00:00Z'),
    createdAt: new Date('2024-02-14T09:00:00Z'),
    updatedAt: new Date('2024-02-14T10:00:00Z'),
  };

  const createPreAssessmentDto = {
    responses: {
      demographics: {
        age: 25,
        gender: 'male',
        location: 'Los Angeles, CA',
        education: 'masters',
        employment: 'full_time',
        relationship_status: 'married',
      },
      mental_health_history: {
        previous_therapy: false,
        previous_medication: true,
        family_history: false,
        current_symptoms: ['stress', 'work_pressure'],
        symptom_duration: '3_to_6_months',
        severity_level: 'mild',
      },
      preferences: {
        therapist_gender: 'male',
        session_type: 'in_person',
        frequency: 'bi_weekly',
        goals: ['stress_management', 'work_life_balance'],
        communication_style: 'supportive',
      },
      questionnaire_responses: [
        { question_id: 'stress_1', response: 4, category: 'stress' },
        { question_id: 'stress_2', response: 3, category: 'stress' },
        { question_id: 'anx_1', response: 2, category: 'anxiety' },
      ],
    },
  };

  const mockAiServiceInfo = {
    name: 'Mentara AI Assessment Service',
    version: '2.1.4',
    endpoint: 'http://localhost:5000',
    model_version: '1.3.2',
    supported_assessments: [
      'anxiety', 'depression', 'stress', 'ptsd', 'bipolar',
      'ocd', 'eating_disorders', 'substance_abuse', 'adhd',
      'autism', 'personality_disorders', 'sleep_disorders', 'anger_management'
    ],
    last_updated: '2024-02-01T00:00:00Z',
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [PreAssessmentController],
      providers: [
        {
          provide: PreAssessmentService,
          useValue: mockPreAssessmentService,
        },
        {
          provide: AiServiceClient,
          useValue: mockAiServiceClient,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminAuthGuard)
      .useValue(mockAdminAuthGuard)
      .compile();

    controller = module.get<PreAssessmentController>(PreAssessmentController);
    preAssessmentService = module.get<PreAssessmentService>(PreAssessmentService);
    aiServiceClient = module.get<AiServiceClient>(AiServiceClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all services injected', () => {
      expect(preAssessmentService).toBeDefined();
      expect(aiServiceClient).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', PreAssessmentController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', PreAssessmentController);
      expect(controllerMetadata).toBe('pre-assessment');
    });

    it('should have AdminOnly decorator on health check endpoint', () => {
      const adminOnlyMetadata = Reflect.getMetadata('admin_only', controller.checkAiServiceHealth);
      expect(adminOnlyMetadata).toBeTruthy();
    });
  });

  describe('POST /pre-assessment', () => {
    it('should create pre-assessment successfully', async () => {
      const expectedAssessment = {
        ...mockPreAssessment,
        responses: createPreAssessmentDto.responses,
        scores: {
          anxiety: 2.5,
          depression: 1.8,
          stress: 6.2,
          ptsd: 1.1,
          bipolar: 1.0,
          ocd: 2.1,
          eating_disorders: 1.5,
          substance_abuse: 1.0,
          adhd: 3.2,
          autism: 1.4,
          personality_disorders: 2.1,
          sleep_disorders: 4.1,
          anger_management: 3.8,
        },
      };
      mockPreAssessmentService.createPreAssessment.mockResolvedValue(expectedAssessment);

      const result = await controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto);

      expect(result).toEqual(expectedAssessment);
      expect(preAssessmentService.createPreAssessment).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        createPreAssessmentDto,
      );
    });

    it('should handle different response patterns', async () => {
      const responseVariations = [
        {
          // High anxiety, low depression
          questionnaire_responses: [
            { question_id: 'anx_1', response: 5, category: 'anxiety' },
            { question_id: 'anx_2', response: 4, category: 'anxiety' },
            { question_id: 'dep_1', response: 1, category: 'depression' },
          ],
        },
        {
          // Moderate depression, high stress
          questionnaire_responses: [
            { question_id: 'dep_1', response: 4, category: 'depression' },
            { question_id: 'stress_1', response: 5, category: 'stress' },
            { question_id: 'stress_2', response: 4, category: 'stress' },
          ],
        },
        {
          // Multiple conditions indicated
          questionnaire_responses: [
            { question_id: 'anx_1', response: 3, category: 'anxiety' },
            { question_id: 'dep_1', response: 3, category: 'depression' },
            { question_id: 'ptsd_1', response: 4, category: 'ptsd' },
            { question_id: 'adhd_1', response: 4, category: 'adhd' },
          ],
        },
      ];

      for (const responses of responseVariations) {
        const dto = {
          ...createPreAssessmentDto,
          responses: { ...createPreAssessmentDto.responses, ...responses },
        };
        const assessment = { ...mockPreAssessment, responses: dto.responses };
        mockPreAssessmentService.createPreAssessment.mockResolvedValue(assessment);

        const result = await controller.createPreAssessment(TEST_USER_IDS.CLIENT, dto);

        expect(result.responses).toEqual(dto.responses);
      }
    });

    it('should handle different demographic profiles', async () => {
      const demographicVariations = [
        {
          age: 18,
          gender: 'non_binary',
          education: 'high_school',
          employment: 'student',
          relationship_status: 'single',
        },
        {
          age: 45,
          gender: 'female',
          education: 'doctorate',
          employment: 'self_employed',
          relationship_status: 'divorced',
        },
        {
          age: 67,
          gender: 'male',
          education: 'some_college',
          employment: 'retired',
          relationship_status: 'widowed',
        },
      ];

      for (const demographics of demographicVariations) {
        const dto = {
          ...createPreAssessmentDto,
          responses: {
            ...createPreAssessmentDto.responses,
            demographics,
          },
        };
        const assessment = { ...mockPreAssessment, responses: dto.responses };
        mockPreAssessmentService.createPreAssessment.mockResolvedValue(assessment);

        const result = await controller.createPreAssessment(TEST_USER_IDS.CLIENT, dto);

        expect(result.responses.demographics).toEqual(demographics);
      }
    });

    it('should handle various therapy preferences', async () => {
      const preferenceVariations = [
        {
          therapist_gender: 'female',
          session_type: 'phone',
          frequency: 'monthly',
          goals: ['depression_management'],
          communication_style: 'gentle',
        },
        {
          therapist_gender: 'no_preference',
          session_type: 'video',
          frequency: 'weekly',
          goals: ['trauma_recovery', 'relationship_issues'],
          communication_style: 'direct',
        },
        {
          therapist_gender: 'male',
          session_type: 'in_person',
          frequency: 'bi_weekly',
          goals: ['anger_management', 'communication_skills'],
          communication_style: 'challenging',
        },
      ];

      for (const preferences of preferenceVariations) {
        const dto = {
          ...createPreAssessmentDto,
          responses: {
            ...createPreAssessmentDto.responses,
            preferences,
          },
        };
        const assessment = { ...mockPreAssessment, responses: dto.responses };
        mockPreAssessmentService.createPreAssessment.mockResolvedValue(assessment);

        const result = await controller.createPreAssessment(TEST_USER_IDS.CLIENT, dto);

        expect(result.responses.preferences).toEqual(preferences);
      }
    });

    it('should handle service errors gracefully', async () => {
      const serviceError = new Error('Assessment processing failed');
      mockPreAssessmentService.createPreAssessment.mockRejectedValue(serviceError);

      await expect(
        controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto)
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto)
      ).rejects.toThrow('Assessment processing failed');
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid assessment data format');
      mockPreAssessmentService.createPreAssessment.mockRejectedValue(validationError);

      await expect(
        controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle non-Error exceptions', async () => {
      const stringError = 'String error message';
      mockPreAssessmentService.createPreAssessment.mockRejectedValue(stringError);

      await expect(
        controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto)
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto)
      ).rejects.toThrow(stringError);
    });
  });

  describe('GET /pre-assessment', () => {
    it('should get pre-assessment successfully', async () => {
      mockPreAssessmentService.getPreAssessmentByUserId.mockResolvedValue(mockPreAssessment);

      const result = await controller.getPreAssessment(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockPreAssessment);
      expect(preAssessmentService.getPreAssessmentByUserId).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should validate complete assessment structure', async () => {
      mockPreAssessmentService.getPreAssessmentByUserId.mockResolvedValue(mockPreAssessment);

      const result = await controller.getPreAssessment(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('responses');
      expect(result).toHaveProperty('completedAt');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');

      // Validate scores structure
      expect(result.scores).toHaveProperty('anxiety');
      expect(result.scores).toHaveProperty('depression');
      expect(result.scores).toHaveProperty('stress');
      expect(typeof result.scores.anxiety).toBe('number');

      // Validate responses structure
      expect(result.responses).toHaveProperty('demographics');
      expect(result.responses).toHaveProperty('mental_health_history');
      expect(result.responses).toHaveProperty('preferences');
      expect(result.responses).toHaveProperty('questionnaire_responses');
    });

    it('should handle assessment not found', async () => {
      const notFoundError = new Error('Pre-assessment not found for user');
      mockPreAssessmentService.getPreAssessmentByUserId.mockRejectedValue(notFoundError);

      await expect(
        controller.getPreAssessment('non-existent-user')
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.getPreAssessment('non-existent-user')
      ).rejects.toThrow('Pre-assessment not found for user');
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockPreAssessmentService.getPreAssessmentByUserId.mockRejectedValue(serviceError);

      await expect(
        controller.getPreAssessment(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.getPreAssessment(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('PUT /pre-assessment', () => {
    const updateData = {
      responses: {
        preferences: {
          therapist_gender: 'female',
          frequency: 'weekly',
          goals: ['anxiety_management', 'sleep_improvement'],
        },
        questionnaire_responses: [
          { question_id: 'anx_1', response: 2, category: 'anxiety' },
          { question_id: 'sleep_1', response: 4, category: 'sleep_disorders' },
        ],
      },
    };

    it('should update pre-assessment successfully', async () => {
      const updatedAssessment = {
        ...mockPreAssessment,
        responses: {
          ...mockPreAssessment.responses,
          ...updateData.responses,
        },
        scores: {
          ...mockPreAssessment.scores,
          anxiety: 4.2, // Updated based on new responses
          sleep_disorders: 7.1,
        },
        updatedAt: new Date(),
      };
      mockPreAssessmentService.updatePreAssessment.mockResolvedValue(updatedAssessment);

      const result = await controller.updatePreAssessment(TEST_USER_IDS.CLIENT, updateData);

      expect(result).toEqual(updatedAssessment);
      expect(preAssessmentService.updatePreAssessment).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        updateData,
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdates = [
        { responses: { preferences: { frequency: 'bi_weekly' } } },
        { responses: { demographics: { age: 29 } } },
        { responses: { mental_health_history: { current_symptoms: ['anxiety', 'panic'] } } },
      ];

      for (const partialUpdate of partialUpdates) {
        const updatedAssessment = {
          ...mockPreAssessment,
          responses: { ...mockPreAssessment.responses, ...partialUpdate.responses },
          updatedAt: new Date(),
        };
        mockPreAssessmentService.updatePreAssessment.mockResolvedValue(updatedAssessment);

        const result = await controller.updatePreAssessment(TEST_USER_IDS.CLIENT, partialUpdate);

        expect(result.updatedAt).toBeDefined();
        expect(preAssessmentService.updatePreAssessment).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          partialUpdate,
        );
      }
    });

    it('should handle updating specific questionnaire responses', async () => {
      const responseUpdates = [
        [
          { question_id: 'anx_1', response: 1, category: 'anxiety' },
          { question_id: 'anx_2', response: 2, category: 'anxiety' },
        ],
        [
          { question_id: 'dep_1', response: 4, category: 'depression' },
          { question_id: 'dep_2', response: 3, category: 'depression' },
        ],
        [
          { question_id: 'stress_1', response: 5, category: 'stress' },
          { question_id: 'sleep_1', response: 4, category: 'sleep_disorders' },
        ],
      ];

      for (const responses of responseUpdates) {
        const updateWithResponses = {
          responses: { questionnaire_responses: responses },
        };
        const updatedAssessment = {
          ...mockPreAssessment,
          responses: {
            ...mockPreAssessment.responses,
            questionnaire_responses: responses,
          },
        };
        mockPreAssessmentService.updatePreAssessment.mockResolvedValue(updatedAssessment);

        const result = await controller.updatePreAssessment(TEST_USER_IDS.CLIENT, updateWithResponses);

        expect(result.responses.questionnaire_responses).toEqual(responses);
      }
    });

    it('should handle assessment not found during update', async () => {
      const notFoundError = new Error('Pre-assessment not found for user');
      mockPreAssessmentService.updatePreAssessment.mockRejectedValue(notFoundError);

      await expect(
        controller.updatePreAssessment('non-existent-user', updateData)
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.updatePreAssessment('non-existent-user', updateData)
      ).rejects.toThrow('Pre-assessment not found for user');
    });

    it('should handle service errors during update', async () => {
      const serviceError = new Error('Update failed due to database constraint');
      mockPreAssessmentService.updatePreAssessment.mockRejectedValue(serviceError);

      await expect(
        controller.updatePreAssessment(TEST_USER_IDS.CLIENT, updateData)
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.updatePreAssessment(TEST_USER_IDS.CLIENT, updateData)
      ).rejects.toThrow('Update failed due to database constraint');
    });
  });

  describe('DELETE /pre-assessment', () => {
    it('should delete pre-assessment successfully', async () => {
      mockPreAssessmentService.deletePreAssessment.mockResolvedValue(null);

      const result = await controller.deletePreAssessment(TEST_USER_IDS.CLIENT);

      expect(result).toBeNull();
      expect(preAssessmentService.deletePreAssessment).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle assessment not found during deletion', async () => {
      const notFoundError = new Error('Pre-assessment not found for user');
      mockPreAssessmentService.deletePreAssessment.mockRejectedValue(notFoundError);

      await expect(
        controller.deletePreAssessment('non-existent-user')
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.deletePreAssessment('non-existent-user')
      ).rejects.toThrow('Pre-assessment not found for user');
    });

    it('should handle service errors during deletion', async () => {
      const serviceError = new Error('Deletion failed due to database error');
      mockPreAssessmentService.deletePreAssessment.mockRejectedValue(serviceError);

      await expect(
        controller.deletePreAssessment(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.deletePreAssessment(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow('Deletion failed due to database error');
    });

    it('should handle cascade deletion implications', async () => {
      const cascadeError = new Error('Cannot delete assessment with active recommendations');
      mockPreAssessmentService.deletePreAssessment.mockRejectedValue(cascadeError);

      await expect(
        controller.deletePreAssessment(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.deletePreAssessment(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow('Cannot delete assessment with active recommendations');
    });
  });

  describe('GET /pre-assessment/ai-service/health', () => {
    beforeEach(() => {
      mockAiServiceClient.getServiceInfo.mockReturnValue(mockAiServiceInfo);
    });

    it('should check AI service health successfully', async () => {
      mockAiServiceClient.healthCheck.mockResolvedValue(true);

      const result = await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);

      expect(result).toEqual({
        status: 'healthy',
        healthy: true,
        serviceInfo: mockAiServiceInfo,
        timestamp: expect.any(String),
      });
      expect(aiServiceClient.healthCheck).toHaveBeenCalledWith();
      expect(aiServiceClient.getServiceInfo).toHaveBeenCalledWith();
    });

    it('should handle unhealthy AI service', async () => {
      mockAiServiceClient.healthCheck.mockResolvedValue(false);

      const result = await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);

      expect(result).toEqual({
        status: 'unhealthy',
        healthy: false,
        serviceInfo: mockAiServiceInfo,
        timestamp: expect.any(String),
      });
    });

    it('should handle AI service errors gracefully', async () => {
      const healthCheckError = new Error('Connection timeout');
      mockAiServiceClient.healthCheck.mockRejectedValue(healthCheckError);

      const result = await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);

      expect(result).toEqual({
        status: 'error',
        healthy: false,
        serviceInfo: mockAiServiceInfo,
        timestamp: expect.any(String),
      });
    });

    it('should validate timestamp format', async () => {
      mockAiServiceClient.healthCheck.mockResolvedValue(true);

      const result = await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should include comprehensive service info', async () => {
      mockAiServiceClient.healthCheck.mockResolvedValue(true);

      const result = await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);

      expect(result.serviceInfo).toHaveProperty('name');
      expect(result.serviceInfo).toHaveProperty('version');
      expect(result.serviceInfo).toHaveProperty('endpoint');
      expect(result.serviceInfo).toHaveProperty('model_version');
      expect(result.serviceInfo).toHaveProperty('supported_assessments');
      expect(Array.isArray(result.serviceInfo.supported_assessments)).toBe(true);
    });

    it('should log admin actions', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockAiServiceClient.healthCheck.mockResolvedValue(true);

      await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);

      expect(logSpy).toHaveBeenCalledWith(`Admin ${TEST_USER_IDS.ADMIN} checking AI service health`);
    });

    it('should log errors when health check fails', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'error');
      const healthCheckError = new Error('Service unavailable');
      mockAiServiceClient.healthCheck.mockRejectedValue(healthCheckError);

      await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);

      expect(logSpy).toHaveBeenCalledWith('AI service health check failed:', healthCheckError);
    });

    it('should handle different error types during health check', async () => {
      const errorTypes = [
        new Error('Network timeout'),
        new Error('Service not found'),
        new Error('Authentication failed'),
        'String error',
        { message: 'Object error' },
      ];

      for (const error of errorTypes) {
        mockAiServiceClient.healthCheck.mockRejectedValue(error);

        const result = await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);

        expect(result.status).toBe('error');
        expect(result.healthy).toBe(false);
      }
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted assessment creation response', async () => {
      mockPreAssessmentService.createPreAssessment.mockResolvedValue(mockPreAssessment);

      const result = await controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto);

      TestAssertions.expectValidEntity(result, ['id', 'userId', 'scores', 'responses']);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(typeof result.scores).toBe('object');
      expect(typeof result.responses).toBe('object');
    });

    it('should return properly formatted assessment retrieval response', async () => {
      mockPreAssessmentService.getPreAssessmentByUserId.mockResolvedValue(mockPreAssessment);

      const result = await controller.getPreAssessment(TEST_USER_IDS.CLIENT);

      expect(result.userId).toBe(TEST_USER_IDS.CLIENT);
      expect(Object.keys(result.scores)).toHaveLength(13); // All assessment categories
      expect(result.responses).toHaveProperty('demographics');
      expect(result.responses).toHaveProperty('mental_health_history');
      expect(result.responses).toHaveProperty('preferences');
      expect(result.responses).toHaveProperty('questionnaire_responses');
    });

    it('should return properly formatted health check response', async () => {
      mockAiServiceClient.healthCheck.mockResolvedValue(true);

      const result = await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('healthy');
      expect(result).toHaveProperty('serviceInfo');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.status).toBe('string');
      expect(typeof result.healthy).toBe('boolean');
      expect(typeof result.serviceInfo).toBe('object');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should validate score ranges in assessment response', async () => {
      mockPreAssessmentService.createPreAssessment.mockResolvedValue(mockPreAssessment);

      const result = await controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto);

      Object.values(result.scores).forEach((score) => {
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10); // Assuming 0-10 scale
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Pre-assessment service temporarily unavailable');
      mockPreAssessmentService.getPreAssessmentByUserId.mockRejectedValue(serviceError);

      await expect(
        controller.getPreAssessment(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPreAssessmentService.createPreAssessment.mockRejectedValue(dbError);

      await expect(
        controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle AI service integration errors', async () => {
      const aiError = new Error('AI service processing failed');
      mockPreAssessmentService.createPreAssessment.mockRejectedValue(aiError);

      await expect(
        controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto)
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.createPreAssessment(TEST_USER_IDS.CLIENT, createPreAssessmentDto)
      ).rejects.toThrow('AI service processing failed');
    });

    it('should handle validation errors consistently', async () => {
      const validationError = new Error('Invalid assessment format');
      mockPreAssessmentService.updatePreAssessment.mockRejectedValue(validationError);

      await expect(
        controller.updatePreAssessment(TEST_USER_IDS.CLIENT, {})
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        controller.updatePreAssessment(TEST_USER_IDS.CLIENT, {})
      ).rejects.toThrow('Invalid assessment format');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete assessment lifecycle', async () => {
      // Create assessment
      mockPreAssessmentService.createPreAssessment.mockResolvedValue(mockPreAssessment);
      const createResult = await controller.createPreAssessment(
        TEST_USER_IDS.CLIENT,
        createPreAssessmentDto,
      );
      expect(createResult.id).toBeDefined();

      // Retrieve assessment
      mockPreAssessmentService.getPreAssessmentByUserId.mockResolvedValue(mockPreAssessment);
      const getResult = await controller.getPreAssessment(TEST_USER_IDS.CLIENT);
      expect(getResult.id).toBe(createResult.id);

      // Update assessment
      const updatedAssessment = { ...mockPreAssessment, updatedAt: new Date() };
      mockPreAssessmentService.updatePreAssessment.mockResolvedValue(updatedAssessment);
      const updateResult = await controller.updatePreAssessment(
        TEST_USER_IDS.CLIENT,
        { responses: { preferences: { frequency: 'weekly' } } },
      );
      expect(updateResult.updatedAt).toBeInstanceOf(Date);

      // Delete assessment
      mockPreAssessmentService.deletePreAssessment.mockResolvedValue(null);
      const deleteResult = await controller.deletePreAssessment(TEST_USER_IDS.CLIENT);
      expect(deleteResult).toBeNull();
    });

    it('should handle admin monitoring workflow', async () => {
      // Check AI service health
      mockAiServiceClient.healthCheck.mockResolvedValue(true);
      const healthResult = await controller.checkAiServiceHealth(TEST_USER_IDS.ADMIN);
      expect(healthResult.healthy).toBe(true);

      // Verify service info is comprehensive
      expect(healthResult.serviceInfo.supported_assessments).toContain('anxiety');
      expect(healthResult.serviceInfo.supported_assessments).toContain('depression');
      expect(healthResult.timestamp).toBeDefined();
    });

    it('should handle multiple user assessments', async () => {
      const userIds = [TEST_USER_IDS.CLIENT, 'user_2', 'user_3'];
      const assessments = userIds.map((userId) => ({
        ...mockPreAssessment,
        id: `assessment_${userId}`,
        userId,
      }));

      for (let i = 0; i < userIds.length; i++) {
        mockPreAssessmentService.getPreAssessmentByUserId.mockResolvedValue(assessments[i]);

        const result = await controller.getPreAssessment(userIds[i]);

        expect(result.userId).toBe(userIds[i]);
        expect(result.id).toBe(`assessment_${userIds[i]}`);
      }
    });
  });
});