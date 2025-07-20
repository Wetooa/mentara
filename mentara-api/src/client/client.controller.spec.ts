/**
 * Comprehensive Test Suite for ClientController
 * Tests all client management endpoints with security, validation, and error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('ClientController', () => {
  let controller: ClientController;
  let clientService: ClientService;
  let module: TestingModule;

  // Mock ClientService
  const mockClientService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    needsTherapistRecommendations: jest.fn(),
    markTherapistRecommendationsSeen: jest.fn(),
    getAssignedTherapist: jest.fn(),
    assignTherapist: jest.fn(),
    removeTherapist: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockClientProfile = TestDataGenerator.createUser({
    id: TEST_USER_IDS.CLIENT,
    email: TEST_EMAILS.CLIENT,
    role: 'client',
    firstName: 'John',
    lastName: 'Doe',
  });

  const mockTherapistRecommendation = {
    id: TEST_USER_IDS.THERAPIST,
    email: TEST_EMAILS.THERAPIST,
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    bio: 'Experienced therapist specializing in anxiety and depression',
    providerType: 'Licensed Clinical Psychologist',
    areasOfExpertise: ['anxiety', 'depression'],
    hourlyRate: 150.0,
    rating: 4.8,
    reviewCount: 25,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: mockClientService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ClientController>(ClientController);
    clientService = module.get<ClientService>(ClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have clientService injected', () => {
      expect(clientService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', ClientController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', ClientController);
      expect(controllerMetadata).toBe('client');
    });
  });

  describe('GET /client/profile', () => {
    it('should retrieve client profile successfully', async () => {
      mockClientService.getProfile.mockResolvedValue(mockClientProfile);

      const result = await controller.getProfile(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockClientProfile);
      expect(clientService.getProfile).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle service errors with proper HTTP exceptions', async () => {
      const serviceError = new Error('Database connection failed');
      mockClientService.getProfile.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getProfile(TEST_USER_IDS.CLIENT),
        HttpException,
        'Failed to fetch client profile: Database connection failed',
      );
    });

    it('should handle unknown errors gracefully', async () => {
      mockClientService.getProfile.mockRejectedValue('Unknown error');

      await TestAssertions.expectToThrowNestException(
        () => controller.getProfile(TEST_USER_IDS.CLIENT),
        HttpException,
        'Failed to fetch client profile: Unknown error',
      );
    });
  });

  describe('PUT /client/profile', () => {
    const updateData = {
      firstName: 'Updated John',
      lastName: 'Updated Doe',
      bio: 'Updated bio',
    };

    it('should update client profile successfully', async () => {
      const updatedProfile = { ...mockClientProfile, ...updateData };
      mockClientService.updateProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateProfile(TEST_USER_IDS.CLIENT, updateData);

      expect(result).toEqual(updatedProfile);
      expect(clientService.updateProfile).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, updateData);
    });

    it('should handle service errors with proper HTTP exceptions', async () => {
      const serviceError = new Error('Validation failed');
      mockClientService.updateProfile.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.updateProfile(TEST_USER_IDS.CLIENT, updateData),
        HttpException,
        'Failed to update client profile: Validation failed',
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {};
      mockClientService.updateProfile.mockResolvedValue(mockClientProfile);

      const result = await controller.updateProfile(TEST_USER_IDS.CLIENT, invalidData);

      expect(result).toEqual(mockClientProfile);
      expect(clientService.updateProfile).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, invalidData);
    });
  });

  describe('GET /client/needs-therapist-recommendations', () => {
    it('should return true when client needs therapist recommendations', async () => {
      mockClientService.needsTherapistRecommendations.mockResolvedValue(true);

      const result = await controller.needsTherapistRecommendations(TEST_USER_IDS.CLIENT);

      expect(result).toEqual({ needsTherapistRecommendations: true });
      expect(clientService.needsTherapistRecommendations).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should return false when client does not need therapist recommendations', async () => {
      mockClientService.needsTherapistRecommendations.mockResolvedValue(false);

      const result = await controller.needsTherapistRecommendations(TEST_USER_IDS.CLIENT);

      expect(result).toEqual({ needsTherapistRecommendations: false });
    });

    it('should handle service errors with proper HTTP exceptions', async () => {
      const serviceError = new Error('Database query failed');
      mockClientService.needsTherapistRecommendations.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.needsTherapistRecommendations(TEST_USER_IDS.CLIENT),
        HttpException,
        'Failed to check therapist recommendations: Database query failed',
      );
    });
  });

  describe('PUT /client/mark-therapist-recommendations-seen', () => {
    it('should mark therapist recommendations as seen successfully', async () => {
      mockClientService.markTherapistRecommendationsSeen.mockResolvedValue(undefined);

      const result = await controller.markTherapistRecommendationsSeen(TEST_USER_IDS.CLIENT);

      expect(result).toEqual({ success: true });
      expect(clientService.markTherapistRecommendationsSeen).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle service errors with proper HTTP exceptions', async () => {
      const serviceError = new Error('Update failed');
      mockClientService.markTherapistRecommendationsSeen.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.markTherapistRecommendationsSeen(TEST_USER_IDS.CLIENT),
        HttpException,
        'Failed to mark therapist recommendations as seen: Update failed',
      );
    });
  });

  describe('GET /client/therapist', () => {
    it('should return assigned therapist when one exists', async () => {
      mockClientService.getAssignedTherapist.mockResolvedValue(mockTherapistRecommendation);

      const result = await controller.getAssignedTherapist(TEST_USER_IDS.CLIENT);

      expect(result).toEqual({ therapist: mockTherapistRecommendation });
      expect(clientService.getAssignedTherapist).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should return null when no therapist is assigned', async () => {
      mockClientService.getAssignedTherapist.mockResolvedValue(null);

      const result = await controller.getAssignedTherapist(TEST_USER_IDS.CLIENT);

      expect(result).toEqual({ therapist: null });
    });

    it('should handle service errors with proper HTTP exceptions', async () => {
      const serviceError = new Error('Database query failed');
      mockClientService.getAssignedTherapist.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getAssignedTherapist(TEST_USER_IDS.CLIENT),
        HttpException,
        'Failed to fetch assigned therapist: Database query failed',
      );
    });
  });

  describe('POST /client/therapist', () => {
    const assignData = { therapistId: TEST_USER_IDS.THERAPIST };

    it('should assign therapist successfully', async () => {
      mockClientService.assignTherapist.mockResolvedValue(mockTherapistRecommendation);

      const result = await controller.assignTherapist(TEST_USER_IDS.CLIENT, assignData);

      expect(result).toEqual({ therapist: mockTherapistRecommendation });
      expect(clientService.assignTherapist).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, assignData.therapistId);
    });

    it('should handle not found errors with 404 status', async () => {
      const serviceError = new Error('Therapist not found');
      mockClientService.assignTherapist.mockRejectedValue(serviceError);

      let thrownError: any = null;
      try {
        await controller.assignTherapist(TEST_USER_IDS.CLIENT, assignData);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(HttpException);
      expect(thrownError.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(thrownError.message).toContain('Failed to assign therapist: Therapist not found');
    });

    it('should handle general service errors with 500 status', async () => {
      const serviceError = new Error('Database connection failed');
      mockClientService.assignTherapist.mockRejectedValue(serviceError);

      let thrownError: any = null;
      try {
        await controller.assignTherapist(TEST_USER_IDS.CLIENT, assignData);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(HttpException);
      expect(thrownError.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(thrownError.message).toContain('Failed to assign therapist: Database connection failed');
    });

    it('should validate therapist assignment data', async () => {
      const invalidData = { therapistId: '' };
      mockClientService.assignTherapist.mockRejectedValue(new Error('Invalid therapist ID'));

      await TestAssertions.expectToThrowNestException(
        () => controller.assignTherapist(TEST_USER_IDS.CLIENT, invalidData),
        HttpException,
        'Failed to assign therapist: Invalid therapist ID',
      );
    });
  });

  describe('DELETE /client/therapist', () => {
    it('should remove therapist successfully', async () => {
      mockClientService.removeTherapist.mockResolvedValue(undefined);

      const result = await controller.removeTherapist(TEST_USER_IDS.CLIENT);

      expect(result).toEqual({ success: true });
      expect(clientService.removeTherapist).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle not found errors with 404 status', async () => {
      const serviceError = new Error('Therapist assignment not found');
      mockClientService.removeTherapist.mockRejectedValue(serviceError);

      let thrownError: any = null;
      try {
        await controller.removeTherapist(TEST_USER_IDS.CLIENT);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(HttpException);
      expect(thrownError.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(thrownError.message).toContain('Failed to remove therapist: Therapist assignment not found');
    });

    it('should handle general service errors with 500 status', async () => {
      const serviceError = new Error('Database update failed');
      mockClientService.removeTherapist.mockRejectedValue(serviceError);

      let thrownError: any = null;
      try {
        await controller.removeTherapist(TEST_USER_IDS.CLIENT);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(HttpException);
      expect(thrownError.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(thrownError.message).toContain('Failed to remove therapist: Database update failed');
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete client workflow', async () => {
      // Step 1: Get client profile
      mockClientService.getProfile.mockResolvedValue(mockClientProfile);
      const profile = await controller.getProfile(TEST_USER_IDS.CLIENT);
      expect(profile).toEqual(mockClientProfile);

      // Step 2: Check if needs therapist recommendations
      mockClientService.needsTherapistRecommendations.mockResolvedValue(true);
      const needsRecs = await controller.needsTherapistRecommendations(TEST_USER_IDS.CLIENT);
      expect(needsRecs.needsTherapistRecommendations).toBe(true);

      // Step 3: Assign therapist
      mockClientService.assignTherapist.mockResolvedValue(mockTherapistRecommendation);
      const assignResult = await controller.assignTherapist(TEST_USER_IDS.CLIENT, { therapistId: TEST_USER_IDS.THERAPIST });
      expect(assignResult.therapist).toEqual(mockTherapistRecommendation);

      // Step 4: Mark recommendations as seen
      mockClientService.markTherapistRecommendationsSeen.mockResolvedValue(undefined);
      const markResult = await controller.markTherapistRecommendationsSeen(TEST_USER_IDS.CLIENT);
      expect(markResult.success).toBe(true);

      // Step 5: Get assigned therapist
      mockClientService.getAssignedTherapist.mockResolvedValue(mockTherapistRecommendation);
      const assignedTherapist = await controller.getAssignedTherapist(TEST_USER_IDS.CLIENT);
      expect(assignedTherapist.therapist).toEqual(mockTherapistRecommendation);

      // Verify all service calls were made
      expect(clientService.getProfile).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(clientService.needsTherapistRecommendations).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(clientService.assignTherapist).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, TEST_USER_IDS.THERAPIST);
      expect(clientService.markTherapistRecommendationsSeen).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(clientService.getAssignedTherapist).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should handle therapist reassignment workflow', async () => {
      // Step 1: Remove current therapist
      mockClientService.removeTherapist.mockResolvedValue(undefined);
      const removeResult = await controller.removeTherapist(TEST_USER_IDS.CLIENT);
      expect(removeResult.success).toBe(true);

      // Step 2: Assign new therapist
      const newTherapistId = 'new-therapist-id';
      mockClientService.assignTherapist.mockResolvedValue(mockTherapistRecommendation);
      const assignResult = await controller.assignTherapist(TEST_USER_IDS.CLIENT, { therapistId: newTherapistId });
      expect(assignResult.therapist).toEqual(mockTherapistRecommendation);

      // Verify service calls
      expect(clientService.removeTherapist).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(clientService.assignTherapist).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, newTherapistId);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockClientService.getProfile.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getProfile(TEST_USER_IDS.CLIENT),
        HttpException,
        'Failed to fetch client profile: Service temporarily unavailable',
      );
    });

    it('should handle concurrent access issues', async () => {
      const concurrencyError = new Error('Resource is locked');
      mockClientService.assignTherapist.mockRejectedValue(concurrencyError);

      await TestAssertions.expectToThrowNestException(
        () => controller.assignTherapist(TEST_USER_IDS.CLIENT, { therapistId: TEST_USER_IDS.THERAPIST }),
        HttpException,
        'Failed to assign therapist: Resource is locked',
      );
    });

    it('should handle malformed request data', async () => {
      const malformedData = { invalid: 'data' };
      mockClientService.updateProfile.mockResolvedValue(mockClientProfile);

      const result = await controller.updateProfile(TEST_USER_IDS.CLIENT, malformedData as any);

      expect(result).toEqual(mockClientProfile);
      expect(clientService.updateProfile).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, malformedData);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted profile response', async () => {
      mockClientService.getProfile.mockResolvedValue(mockClientProfile);

      const result = await controller.getProfile(TEST_USER_IDS.CLIENT);

      TestAssertions.expectValidEntity(result, ['id', 'email', 'firstName', 'lastName', 'role']);
    });

    it('should return properly formatted therapist assignment response', async () => {
      mockClientService.assignTherapist.mockResolvedValue(mockTherapistRecommendation);

      const result = await controller.assignTherapist(TEST_USER_IDS.CLIENT, { therapistId: TEST_USER_IDS.THERAPIST });

      expect(result).toHaveProperty('therapist');
      expect(result.therapist).toEqual(mockTherapistRecommendation);
    });

    it('should return properly formatted boolean responses', async () => {
      mockClientService.needsTherapistRecommendations.mockResolvedValue(true);

      const result = await controller.needsTherapistRecommendations(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('needsTherapistRecommendations');
      expect(typeof result.needsTherapistRecommendations).toBe('boolean');
    });

    it('should return properly formatted success responses', async () => {
      mockClientService.markTherapistRecommendationsSeen.mockResolvedValue(undefined);

      const result = await controller.markTherapistRecommendationsSeen(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });
  });
});