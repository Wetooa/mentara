/**
 * Comprehensive Test Suite for TherapistProfileController
 * Tests all therapist profile management endpoints with security, validation, and error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TherapistProfileController } from './therapist-profile.controller';
import { TherapistManagementService } from '../therapist-management.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('TherapistProfileController', () => {
  let controller: TherapistProfileController;
  let therapistManagementService: TherapistManagementService;
  let module: TestingModule;

  // Mock TherapistManagementService
  const mockTherapistManagementService = {
    getTherapistProfile: jest.fn(),
    updateTherapistProfile: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockTherapistProfile = {
    id: TEST_USER_IDS.THERAPIST,
    userId: TEST_USER_IDS.THERAPIST,
    email: TEST_EMAILS.THERAPIST,
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    bio: 'Experienced therapist specializing in anxiety and depression',
    providerType: 'Licensed Clinical Psychologist',
    professionalLicenseType: 'LCP',
    isPRCLicensed: true,
    prcLicenseNumber: 'LCP-12345',
    practiceStartDate: new Date('2020-01-01'),
    areasOfExpertise: ['anxiety', 'depression', 'trauma'],
    therapeuticApproachesUsedList: ['CBT', 'DBT', 'EMDR'],
    languagesOffered: ['English', 'Spanish'],
    assessmentTools: ['GAD-7', 'PHQ-9', 'PCL-5'],
    hourlyRate: 150.0,
    isActive: true,
    isVerified: true,
    availableForNewClients: true,
    maxClientsPerWeek: 20,
    preferredSessionLength: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProfileUpdateData = {
    bio: 'Updated bio with new information',
    hourlyRate: 175.0,
    availableForNewClients: false,
    maxClientsPerWeek: 15,
    preferredSessionLength: 90,
  };

  const mockSpecializationsUpdateData = {
    areasOfExpertise: ['anxiety', 'depression', 'trauma', 'addiction'],
    therapeuticApproachesUsedList: ['CBT', 'DBT', 'EMDR', 'ACT'],
    assessmentTools: ['GAD-7', 'PHQ-9', 'PCL-5', 'AUDIT'],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [TherapistProfileController],
      providers: [
        {
          provide: TherapistManagementService,
          useValue: mockTherapistManagementService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<TherapistProfileController>(TherapistProfileController);
    therapistManagementService = module.get<TherapistManagementService>(TherapistManagementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have therapistManagementService injected', () => {
      expect(therapistManagementService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', TherapistProfileController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', TherapistProfileController);
      expect(controllerMetadata).toBe('therapist/profile');
    });
  });

  describe('GET /therapist/profile', () => {
    it('should get therapist profile successfully', async () => {
      mockTherapistManagementService.getTherapistProfile.mockResolvedValue(mockTherapistProfile);

      const result = await controller.getTherapistProfile(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(mockTherapistProfile);
      expect(therapistManagementService.getTherapistProfile).toHaveBeenCalledWith(TEST_USER_IDS.THERAPIST);
    });

    it('should handle profile not found', async () => {
      const notFoundError = new Error('Therapist profile not found');
      mockTherapistManagementService.getTherapistProfile.mockRejectedValue(notFoundError);

      await expect(
        controller.getTherapistProfile(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(notFoundError);
    });

    it('should handle unauthorized access', async () => {
      const unauthorizedError = new Error('Unauthorized access');
      mockTherapistManagementService.getTherapistProfile.mockRejectedValue(unauthorizedError);

      await expect(
        controller.getTherapistProfile('unauthorized-therapist-id'),
      ).rejects.toThrow(unauthorizedError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockTherapistManagementService.getTherapistProfile.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistProfile(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });

    it('should handle incomplete profile data', async () => {
      const incompleteProfile = {
        id: TEST_USER_IDS.THERAPIST,
        userId: TEST_USER_IDS.THERAPIST,
        email: TEST_EMAILS.THERAPIST,
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        // Missing many fields
      };
      mockTherapistManagementService.getTherapistProfile.mockResolvedValue(incompleteProfile);

      const result = await controller.getTherapistProfile(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(incompleteProfile);
      expect(result.id).toBe(TEST_USER_IDS.THERAPIST);
      expect(result.firstName).toBe('Dr. Jane');
    });
  });

  describe('PUT /therapist/profile', () => {
    it('should update therapist profile successfully', async () => {
      const updatedProfile = { ...mockTherapistProfile, ...mockProfileUpdateData };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        mockProfileUpdateData,
      );

      expect(result).toEqual(updatedProfile);
      expect(therapistManagementService.updateTherapistProfile).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        mockProfileUpdateData,
      );
    });

    it('should handle partial profile updates', async () => {
      const partialUpdate = { bio: 'Updated bio only' };
      const partiallyUpdatedProfile = { ...mockTherapistProfile, ...partialUpdate };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(partiallyUpdatedProfile);

      const result = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        partialUpdate,
      );

      expect(result).toEqual(partiallyUpdatedProfile);
      expect(therapistManagementService.updateTherapistProfile).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        partialUpdate,
      );
    });

    it('should handle empty update data', async () => {
      const emptyUpdate = {};
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(mockTherapistProfile);

      const result = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        emptyUpdate,
      );

      expect(result).toEqual(mockTherapistProfile);
      expect(therapistManagementService.updateTherapistProfile).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        emptyUpdate,
      );
    });

    it('should handle validation errors', async () => {
      const invalidData = { hourlyRate: -50 }; // Invalid negative rate
      const validationError = new Error('Validation failed: hourlyRate must be positive');
      mockTherapistManagementService.updateTherapistProfile.mockRejectedValue(validationError);

      await expect(
        controller.updateTherapistProfile(TEST_USER_IDS.THERAPIST, invalidData),
      ).rejects.toThrow(validationError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database update failed');
      mockTherapistManagementService.updateTherapistProfile.mockRejectedValue(serviceError);

      await expect(
        controller.updateTherapistProfile(TEST_USER_IDS.THERAPIST, mockProfileUpdateData),
      ).rejects.toThrow(serviceError);
    });

    it('should handle unauthorized updates', async () => {
      const unauthorizedError = new Error('Unauthorized profile update');
      mockTherapistManagementService.updateTherapistProfile.mockRejectedValue(unauthorizedError);

      await expect(
        controller.updateTherapistProfile('unauthorized-therapist-id', mockProfileUpdateData),
      ).rejects.toThrow(unauthorizedError);
    });

    it('should handle complex profile updates', async () => {
      const complexUpdate = {
        bio: 'Comprehensive bio update with detailed information',
        hourlyRate: 200.0,
        availableForNewClients: true,
        maxClientsPerWeek: 25,
        preferredSessionLength: 45,
        areasOfExpertise: ['anxiety', 'depression', 'trauma', 'addiction', 'relationship'],
        therapeuticApproachesUsedList: ['CBT', 'DBT', 'EMDR', 'ACT', 'IFS'],
        languagesOffered: ['English', 'Spanish', 'French'],
        assessmentTools: ['GAD-7', 'PHQ-9', 'PCL-5', 'AUDIT', 'DASS-21'],
      };
      const complexUpdatedProfile = { ...mockTherapistProfile, ...complexUpdate };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(complexUpdatedProfile);

      const result = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        complexUpdate,
      );

      expect(result).toEqual(complexUpdatedProfile);
      expect(result.bio).toBe(complexUpdate.bio);
      expect(result.hourlyRate).toBe(complexUpdate.hourlyRate);
      expect(result.areasOfExpertise).toEqual(complexUpdate.areasOfExpertise);
    });
  });

  describe('PUT /therapist/profile/specializations', () => {
    it('should update therapist specializations successfully', async () => {
      const updatedProfile = { ...mockTherapistProfile, ...mockSpecializationsUpdateData };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateTherapistSpecializations(
        TEST_USER_IDS.THERAPIST,
        mockSpecializationsUpdateData,
      );

      expect(result).toEqual(updatedProfile);
      expect(therapistManagementService.updateTherapistProfile).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        mockSpecializationsUpdateData,
      );
    });

    it('should handle single specialization updates', async () => {
      const singleSpecializationUpdate = {
        areasOfExpertise: ['anxiety', 'depression', 'trauma', 'bipolar'],
      };
      const updatedProfile = { ...mockTherapistProfile, ...singleSpecializationUpdate };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateTherapistSpecializations(
        TEST_USER_IDS.THERAPIST,
        singleSpecializationUpdate,
      );

      expect(result).toEqual(updatedProfile);
      expect(result.areasOfExpertise).toEqual(singleSpecializationUpdate.areasOfExpertise);
    });

    it('should handle therapeutic approaches updates', async () => {
      const approachesUpdate = {
        therapeuticApproachesUsedList: ['CBT', 'DBT', 'EMDR', 'ACT', 'IFS', 'Somatic'],
      };
      const updatedProfile = { ...mockTherapistProfile, ...approachesUpdate };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateTherapistSpecializations(
        TEST_USER_IDS.THERAPIST,
        approachesUpdate,
      );

      expect(result).toEqual(updatedProfile);
      expect(result.therapeuticApproachesUsedList).toEqual(approachesUpdate.therapeuticApproachesUsedList);
    });

    it('should handle assessment tools updates', async () => {
      const assessmentToolsUpdate = {
        assessmentTools: ['GAD-7', 'PHQ-9', 'PCL-5', 'AUDIT', 'DASS-21', 'BDI-II'],
      };
      const updatedProfile = { ...mockTherapistProfile, ...assessmentToolsUpdate };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateTherapistSpecializations(
        TEST_USER_IDS.THERAPIST,
        assessmentToolsUpdate,
      );

      expect(result).toEqual(updatedProfile);
      expect(result.assessmentTools).toEqual(assessmentToolsUpdate.assessmentTools);
    });

    it('should handle empty specializations update', async () => {
      const emptyUpdate = {};
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(mockTherapistProfile);

      const result = await controller.updateTherapistSpecializations(
        TEST_USER_IDS.THERAPIST,
        emptyUpdate,
      );

      expect(result).toEqual(mockTherapistProfile);
      expect(therapistManagementService.updateTherapistProfile).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        emptyUpdate,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Specializations update failed');
      mockTherapistManagementService.updateTherapistProfile.mockRejectedValue(serviceError);

      await expect(
        controller.updateTherapistSpecializations(TEST_USER_IDS.THERAPIST, mockSpecializationsUpdateData),
      ).rejects.toThrow(serviceError);
    });

    it('should handle validation errors for specializations', async () => {
      const invalidSpecializations = {
        areasOfExpertise: [], // Empty array might be invalid
      };
      const validationError = new Error('Validation failed: areasOfExpertise cannot be empty');
      mockTherapistManagementService.updateTherapistProfile.mockRejectedValue(validationError);

      await expect(
        controller.updateTherapistSpecializations(TEST_USER_IDS.THERAPIST, invalidSpecializations),
      ).rejects.toThrow(validationError);
    });

    it('should handle unauthorized specializations updates', async () => {
      const unauthorizedError = new Error('Unauthorized specializations update');
      mockTherapistManagementService.updateTherapistProfile.mockRejectedValue(unauthorizedError);

      await expect(
        controller.updateTherapistSpecializations('unauthorized-therapist-id', mockSpecializationsUpdateData),
      ).rejects.toThrow(unauthorizedError);
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete profile management workflow', async () => {
      // Step 1: Get current profile
      mockTherapistManagementService.getTherapistProfile.mockResolvedValue(mockTherapistProfile);
      const currentProfile = await controller.getTherapistProfile(TEST_USER_IDS.THERAPIST);
      expect(currentProfile).toEqual(mockTherapistProfile);

      // Step 2: Update general profile
      const updatedProfile = { ...mockTherapistProfile, ...mockProfileUpdateData };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(updatedProfile);
      const profileUpdateResult = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        mockProfileUpdateData,
      );
      expect(profileUpdateResult).toEqual(updatedProfile);

      // Step 3: Update specializations
      const specializationsUpdated = { ...updatedProfile, ...mockSpecializationsUpdateData };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(specializationsUpdated);
      const specializationsUpdateResult = await controller.updateTherapistSpecializations(
        TEST_USER_IDS.THERAPIST,
        mockSpecializationsUpdateData,
      );
      expect(specializationsUpdateResult).toEqual(specializationsUpdated);

      // Verify all service calls were made
      expect(therapistManagementService.getTherapistProfile).toHaveBeenCalledWith(TEST_USER_IDS.THERAPIST);
      expect(therapistManagementService.updateTherapistProfile).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple profile updates in sequence', async () => {
      // First update: Bio and rate
      const firstUpdate = { bio: 'First update', hourlyRate: 160.0 };
      const firstUpdatedProfile = { ...mockTherapistProfile, ...firstUpdate };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(firstUpdatedProfile);
      
      const firstResult = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        firstUpdate,
      );
      expect(firstResult.bio).toBe('First update');
      expect(firstResult.hourlyRate).toBe(160.0);

      // Second update: Availability
      const secondUpdate = { availableForNewClients: false, maxClientsPerWeek: 10 };
      const secondUpdatedProfile = { ...firstUpdatedProfile, ...secondUpdate };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(secondUpdatedProfile);
      
      const secondResult = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        secondUpdate,
      );
      expect(secondResult.availableForNewClients).toBe(false);
      expect(secondResult.maxClientsPerWeek).toBe(10);

      // Third update: Specializations
      const thirdUpdate = { areasOfExpertise: ['anxiety', 'depression', 'trauma', 'ptsd'] };
      const thirdUpdatedProfile = { ...secondUpdatedProfile, ...thirdUpdate };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(thirdUpdatedProfile);
      
      const thirdResult = await controller.updateTherapistSpecializations(
        TEST_USER_IDS.THERAPIST,
        thirdUpdate,
      );
      expect(thirdResult.areasOfExpertise).toEqual(['anxiety', 'depression', 'trauma', 'ptsd']);

      // Verify all service calls were made
      expect(therapistManagementService.updateTherapistProfile).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockTherapistManagementService.getTherapistProfile.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistProfile(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });

    it('should handle concurrent update issues', async () => {
      const concurrencyError = new Error('Profile is being updated by another process');
      mockTherapistManagementService.updateTherapistProfile.mockRejectedValue(concurrencyError);

      await expect(
        controller.updateTherapistProfile(TEST_USER_IDS.THERAPIST, mockProfileUpdateData),
      ).rejects.toThrow(concurrencyError);
    });

    it('should handle malformed profile data', async () => {
      const malformedData = { invalid: 'data', nested: { invalid: 'structure' } };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(mockTherapistProfile);

      const result = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        malformedData,
      );

      expect(therapistManagementService.updateTherapistProfile).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        malformedData,
      );
    });

    it('should handle null or undefined profile data', async () => {
      const nullData = null;
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(mockTherapistProfile);

      const result = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        nullData,
      );

      expect(therapistManagementService.updateTherapistProfile).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        nullData,
      );
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection lost');
      mockTherapistManagementService.getTherapistProfile.mockRejectedValue(dbError);

      await expect(
        controller.getTherapistProfile(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(dbError);
    });

    it('should handle profile not found scenarios', async () => {
      const notFoundError = new Error('Therapist profile not found');
      mockTherapistManagementService.getTherapistProfile.mockRejectedValue(notFoundError);

      await expect(
        controller.getTherapistProfile('non-existent-therapist-id'),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted profile response', async () => {
      mockTherapistManagementService.getTherapistProfile.mockResolvedValue(mockTherapistProfile);

      const result = await controller.getTherapistProfile(TEST_USER_IDS.THERAPIST);

      TestAssertions.expectValidEntity(result, ['id', 'userId', 'email', 'firstName', 'lastName']);
      expect(result.id).toBe(TEST_USER_IDS.THERAPIST);
      expect(result.email).toBe(TEST_EMAILS.THERAPIST);
    });

    it('should return properly formatted update response', async () => {
      const updatedProfile = { ...mockTherapistProfile, ...mockProfileUpdateData };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateTherapistProfile(
        TEST_USER_IDS.THERAPIST,
        mockProfileUpdateData,
      );

      TestAssertions.expectValidEntity(result, ['id', 'userId', 'email', 'firstName', 'lastName']);
      expect(result.bio).toBe(mockProfileUpdateData.bio);
      expect(result.hourlyRate).toBe(mockProfileUpdateData.hourlyRate);
    });

    it('should return properly formatted specializations response', async () => {
      const updatedProfile = { ...mockTherapistProfile, ...mockSpecializationsUpdateData };
      mockTherapistManagementService.updateTherapistProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateTherapistSpecializations(
        TEST_USER_IDS.THERAPIST,
        mockSpecializationsUpdateData,
      );

      TestAssertions.expectValidEntity(result, ['id', 'userId', 'areasOfExpertise']);
      expect(Array.isArray(result.areasOfExpertise)).toBe(true);
      expect(Array.isArray(result.therapeuticApproachesUsedList)).toBe(true);
      expect(Array.isArray(result.assessmentTools)).toBe(true);
    });

    it('should maintain profile data integrity', async () => {
      mockTherapistManagementService.getTherapistProfile.mockResolvedValue(mockTherapistProfile);

      const result = await controller.getTherapistProfile(TEST_USER_IDS.THERAPIST);

      expect(result.isActive).toBe(true);
      expect(result.isVerified).toBe(true);
      expect(typeof result.hourlyRate).toBe('number');
      expect(typeof result.availableForNewClients).toBe('boolean');
      expect(typeof result.maxClientsPerWeek).toBe('number');
      expect(typeof result.preferredSessionLength).toBe('number');
    });
  });
});