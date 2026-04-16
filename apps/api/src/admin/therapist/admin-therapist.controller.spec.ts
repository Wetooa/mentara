/**
 * Comprehensive Test Suite for AdminTherapistController
 * Tests admin functionality for managing therapist applications and status
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { AdminTherapistController } from './admin-therapist.controller';
import { AdminTherapistService } from '../services/admin-therapist.service';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/core/guards/admin-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('AdminTherapistController', () => {
  let controller: AdminTherapistController;
  let adminTherapistService: AdminTherapistService;
  let module: TestingModule;

  // Mock AdminTherapistService
  const mockAdminTherapistService = {
    getPendingApplications: jest.fn(),
    getApplicationDetails: jest.fn(),
    approveTherapist: jest.fn(),
    rejectTherapist: jest.fn(),
    updateTherapistStatus: jest.fn(),
    getTherapistApplicationMetrics: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockAdminAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockTherapistApplication = {
    id: 'therapist_application_123456789',
    userId: TEST_USER_IDS.THERAPIST,
    email: TEST_EMAILS.THERAPIST,
    firstName: 'Dr. Sarah',
    lastName: 'Smith',
    status: 'pending',
    licenseNumber: 'PSY123456',
    licenseState: 'California',
    licenseExpiry: new Date('2025-12-31'),
    specializations: ['anxiety', 'depression', 'trauma'],
    yearsOfExperience: 8,
    education: 'PhD in Clinical Psychology',
    certifications: ['Licensed Clinical Psychologist', 'Trauma-Informed Care'],
    bio: 'Experienced therapist specializing in anxiety and trauma treatment',
    hourlyRate: 150,
    availableHours: 40,
    preferredClientTypes: ['adults', 'teens'],
    treatmentApproaches: ['CBT', 'DBT', 'EMDR'],
    applicationDate: new Date('2024-01-15'),
    documents: [
      {
        type: 'license',
        url: 'https://storage.example.com/license.pdf',
        verified: false,
      },
      {
        type: 'cv',
        url: 'https://storage.example.com/cv.pdf',
        verified: false,
      },
    ],
    adminNotes: '',
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockApplicationsList = [
    mockTherapistApplication,
    {
      ...mockTherapistApplication,
      id: 'therapist_application_987654321',
      firstName: 'Dr. John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      status: 'approved',
      reviewedBy: TEST_USER_IDS.ADMIN,
      reviewedAt: new Date(),
    },
  ];

  const mockApplicationMetrics = {
    totalApplications: 125,
    pendingApplications: 23,
    approvedApplications: 89,
    rejectedApplications: 13,
    averageProcessingTime: 5.2, // days
    monthlyApplications: [
      { month: '2024-01', total: 12, approved: 8, rejected: 2, pending: 2 },
      { month: '2024-02', total: 15, approved: 11, rejected: 1, pending: 3 },
    ],
    specializations: [
      { name: 'anxiety', count: 45 },
      { name: 'depression', count: 38 },
      { name: 'trauma', count: 29 },
    ],
    averageExperience: 6.8,
    topStates: [
      { state: 'California', count: 28 },
      { state: 'New York', count: 19 },
      { state: 'Texas', count: 15 },
    ],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AdminTherapistController],
      providers: [
        {
          provide: AdminTherapistService,
          useValue: mockAdminTherapistService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminAuthGuard)
      .useValue(mockAdminAuthGuard)
      .compile();

    controller = module.get<AdminTherapistController>(AdminTherapistController);
    adminTherapistService = module.get<AdminTherapistService>(AdminTherapistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have adminTherapistService injected', () => {
      expect(adminTherapistService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard and AdminAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AdminTherapistController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(AdminAuthGuard);
    });

    it('should have AdminOnly decorator', () => {
      const metadata = Reflect.getMetadata('admin_only', AdminTherapistController);
      expect(metadata).toBeTruthy();
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', AdminTherapistController);
      expect(controllerMetadata).toBe('admin/therapists');
    });
  });

  describe('GET /admin/therapists/pending', () => {
    const mockFilters = {
      status: 'pending' as const,
      specialization: 'anxiety',
      state: 'California',
      experienceMin: 3,
      experienceMax: 10,
      page: 1,
      limit: 20,
    };

    it('should get pending applications successfully', async () => {
      const pendingApplications = mockApplicationsList.filter(app => app.status === 'pending');
      mockAdminTherapistService.getPendingApplications.mockResolvedValue({
        applications: pendingApplications,
        pagination: {
          page: 1,
          limit: 20,
          total: pendingApplications.length,
          totalPages: 1,
        },
      });

      const result = await controller.getPendingApplications(mockFilters, TEST_USER_IDS.ADMIN);

      expect(result.applications).toEqual(pendingApplications);
      expect(adminTherapistService.getPendingApplications).toHaveBeenCalledWith(mockFilters);
    });

    it('should get pending applications without filters', async () => {
      const emptyFilters = {};
      mockAdminTherapistService.getPendingApplications.mockResolvedValue({
        applications: mockApplicationsList,
        pagination: {
          page: 1,
          limit: 20,
          total: mockApplicationsList.length,
          totalPages: 1,
        },
      });

      const result = await controller.getPendingApplications(emptyFilters, TEST_USER_IDS.ADMIN);

      expect(result.applications).toEqual(mockApplicationsList);
      expect(adminTherapistService.getPendingApplications).toHaveBeenCalledWith(emptyFilters);
    });

    it('should handle pagination correctly', async () => {
      const paginatedFilters = { ...mockFilters, page: 2, limit: 10 };
      const paginatedResult = {
        applications: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 50,
          totalPages: 5,
        },
      };
      mockAdminTherapistService.getPendingApplications.mockResolvedValue(paginatedResult);

      const result = await controller.getPendingApplications(paginatedFilters, TEST_USER_IDS.ADMIN);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle specialization filters', async () => {
      const specializationFilters = { specialization: 'trauma' };
      const traumaApplications = mockApplicationsList.filter(app => 
        app.specializations.includes('trauma')
      );
      mockAdminTherapistService.getPendingApplications.mockResolvedValue({
        applications: traumaApplications,
        pagination: { page: 1, limit: 20, total: traumaApplications.length, totalPages: 1 },
      });

      const result = await controller.getPendingApplications(specializationFilters, TEST_USER_IDS.ADMIN);

      expect(result.applications).toEqual(traumaApplications);
    });

    it('should handle empty results', async () => {
      mockAdminTherapistService.getPendingApplications.mockResolvedValue({
        applications: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const result = await controller.getPendingApplications(mockFilters, TEST_USER_IDS.ADMIN);

      expect(result.applications).toEqual([]);
      expect(result.applications).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockAdminTherapistService.getPendingApplications.mockRejectedValue(serviceError);

      await expect(controller.getPendingApplications(mockFilters, TEST_USER_IDS.ADMIN)).rejects.toThrow(serviceError);
    });
  });

  describe('GET /admin/therapists/applications', () => {
    const mockFilters = { status: 'all' as const, page: 1, limit: 20 };

    it('should get all applications successfully', async () => {
      mockAdminTherapistService.getPendingApplications.mockResolvedValue({
        applications: mockApplicationsList,
        pagination: {
          page: 1,
          limit: 20,
          total: mockApplicationsList.length,
          totalPages: 1,
        },
      });

      const result = await controller.getAllApplications(mockFilters, TEST_USER_IDS.ADMIN);

      expect(result.applications).toEqual(mockApplicationsList);
      expect(adminTherapistService.getPendingApplications).toHaveBeenCalledWith(mockFilters);
    });

    it('should handle different status filters', async () => {
      const statusFilters = ['pending', 'approved', 'rejected', 'all'] as const;
      
      for (const status of statusFilters) {
        const filters = { status, page: 1, limit: 20 };
        const filteredApps = status === 'all' 
          ? mockApplicationsList 
          : mockApplicationsList.filter(app => app.status === status);
        
        mockAdminTherapistService.getPendingApplications.mockResolvedValue({
          applications: filteredApps,
          pagination: { page: 1, limit: 20, total: filteredApps.length, totalPages: 1 },
        });

        const result = await controller.getAllApplications(filters, TEST_USER_IDS.ADMIN);

        expect(result.applications).toEqual(filteredApps);
      }
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockAdminTherapistService.getPendingApplications.mockRejectedValue(serviceError);

      await expect(controller.getAllApplications(mockFilters, TEST_USER_IDS.ADMIN)).rejects.toThrow(serviceError);
    });
  });

  describe('GET /admin/therapists/:id/details', () => {
    const therapistId = 'therapist_application_123456789';

    it('should get application details successfully', async () => {
      mockAdminTherapistService.getApplicationDetails.mockResolvedValue(mockTherapistApplication);

      const result = await controller.getApplicationDetails(therapistId, TEST_USER_IDS.ADMIN);

      expect(result).toEqual(mockTherapistApplication);
      expect(adminTherapistService.getApplicationDetails).toHaveBeenCalledWith(therapistId);
    });

    it('should handle application not found', async () => {
      const notFoundError = new NotFoundException('Therapist application not found');
      mockAdminTherapistService.getApplicationDetails.mockRejectedValue(notFoundError);

      await expect(
        controller.getApplicationDetails('non-existent-id', TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(notFoundError);
    });

    it('should return complete application details', async () => {
      const detailedApplication = {
        ...mockTherapistApplication,
        additionalInfo: {
          backgroundCheck: { status: 'completed', date: new Date() },
          references: [
            { name: 'Dr. Jane Smith', contact: 'jane@example.com', verified: true },
            { name: 'Dr. Bob Johnson', contact: 'bob@example.com', verified: true },
          ],
          interview: { scheduled: true, date: new Date(), notes: 'Positive interview' },
        },
      };
      mockAdminTherapistService.getApplicationDetails.mockResolvedValue(detailedApplication);

      const result = await controller.getApplicationDetails(therapistId, TEST_USER_IDS.ADMIN);

      expect(result.additionalInfo).toBeDefined();
      expect(result.additionalInfo.backgroundCheck).toBeDefined();
      expect(result.additionalInfo.references).toHaveLength(2);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockAdminTherapistService.getApplicationDetails.mockRejectedValue(serviceError);

      await expect(
        controller.getApplicationDetails(therapistId, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /admin/therapists/:id/approve', () => {
    const therapistId = 'therapist_application_123456789';
    const approvalDto = {
      specializations: ['anxiety', 'depression'],
      hourlyRate: 150,
      maxClients: 20,
      adminNotes: 'Excellent qualifications and experience',
      onboardingScheduled: true,
    };

    it('should approve therapist successfully', async () => {
      const approvedApplication = {
        ...mockTherapistApplication,
        status: 'approved',
        reviewedBy: TEST_USER_IDS.ADMIN,
        reviewedAt: new Date(),
        adminNotes: approvalDto.adminNotes,
      };
      mockAdminTherapistService.approveTherapist.mockResolvedValue(approvedApplication);

      const result = await controller.approveTherapist(therapistId, approvalDto, TEST_USER_IDS.ADMIN);

      expect(result).toEqual(approvedApplication);
      expect(result.status).toBe('approved');
      expect(adminTherapistService.approveTherapist).toHaveBeenCalledWith(
        therapistId,
        TEST_USER_IDS.ADMIN,
        approvalDto,
      );
    });

    it('should handle different approval configurations', async () => {
      const configurations = [
        { ...approvalDto, maxClients: 15, hourlyRate: 120 },
        { ...approvalDto, specializations: ['trauma', 'PTSD'], maxClients: 25 },
        { ...approvalDto, onboardingScheduled: false },
      ];

      for (const config of configurations) {
        const approvedApp = {
          ...mockTherapistApplication,
          status: 'approved',
          reviewedBy: TEST_USER_IDS.ADMIN,
          reviewedAt: new Date(),
        };
        mockAdminTherapistService.approveTherapist.mockResolvedValue(approvedApp);

        const result = await controller.approveTherapist(therapistId, config, TEST_USER_IDS.ADMIN);

        expect(result.status).toBe('approved');
        expect(adminTherapistService.approveTherapist).toHaveBeenCalledWith(
          therapistId,
          TEST_USER_IDS.ADMIN,
          config,
        );
      }
    });

    it('should handle application not found', async () => {
      const notFoundError = new NotFoundException('Therapist application not found');
      mockAdminTherapistService.approveTherapist.mockRejectedValue(notFoundError);

      await expect(
        controller.approveTherapist('non-existent-id', approvalDto, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle already approved application', async () => {
      const alreadyApprovedError = new BadRequestException('Application already approved');
      mockAdminTherapistService.approveTherapist.mockRejectedValue(alreadyApprovedError);

      await expect(
        controller.approveTherapist(therapistId, approvalDto, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(alreadyApprovedError);
    });

    it('should handle validation errors', async () => {
      const validationError = new BadRequestException('Invalid hourly rate');
      mockAdminTherapistService.approveTherapist.mockRejectedValue(validationError);

      await expect(
        controller.approveTherapist(therapistId, { ...approvalDto, hourlyRate: -50 }, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(validationError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Email service unavailable');
      mockAdminTherapistService.approveTherapist.mockRejectedValue(serviceError);

      await expect(
        controller.approveTherapist(therapistId, approvalDto, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /admin/therapists/:id/reject', () => {
    const therapistId = 'therapist_application_123456789';
    const rejectionDto = {
      reason: 'Insufficient experience for specialization requirements',
      feedback: 'Please gain more experience and reapply in 2 years',
      allowReapplication: true,
      reapplicationDate: new Date('2026-01-01'),
    };

    it('should reject therapist successfully', async () => {
      const rejectedApplication = {
        ...mockTherapistApplication,
        status: 'rejected',
        reviewedBy: TEST_USER_IDS.ADMIN,
        reviewedAt: new Date(),
        adminNotes: rejectionDto.reason,
      };
      mockAdminTherapistService.rejectTherapist.mockResolvedValue(rejectedApplication);

      const result = await controller.rejectTherapist(therapistId, rejectionDto, TEST_USER_IDS.ADMIN);

      expect(result).toEqual(rejectedApplication);
      expect(result.status).toBe('rejected');
      expect(adminTherapistService.rejectTherapist).toHaveBeenCalledWith(
        therapistId,
        TEST_USER_IDS.ADMIN,
        rejectionDto,
      );
    });

    it('should handle different rejection reasons', async () => {
      const rejectionReasons = [
        'License verification failed',
        'Background check issues',
        'Insufficient qualifications',
        'Application incomplete',
        'Does not meet state requirements',
      ];

      for (const reason of rejectionReasons) {
        const dto = { ...rejectionDto, reason };
        const rejectedApp = {
          ...mockTherapistApplication,
          status: 'rejected',
          reviewedBy: TEST_USER_IDS.ADMIN,
          reviewedAt: new Date(),
          adminNotes: reason,
        };
        mockAdminTherapistService.rejectTherapist.mockResolvedValue(rejectedApp);

        const result = await controller.rejectTherapist(therapistId, dto, TEST_USER_IDS.ADMIN);

        expect(result.status).toBe('rejected');
        expect(result.adminNotes).toBe(reason);
      }
    });

    it('should handle rejection with no reapplication allowed', async () => {
      const permanentRejectionDto = {
        ...rejectionDto,
        allowReapplication: false,
        reapplicationDate: null,
      };
      const rejectedApp = {
        ...mockTherapistApplication,
        status: 'rejected',
        reviewedBy: TEST_USER_IDS.ADMIN,
        reviewedAt: new Date(),
      };
      mockAdminTherapistService.rejectTherapist.mockResolvedValue(rejectedApp);

      const result = await controller.rejectTherapist(therapistId, permanentRejectionDto, TEST_USER_IDS.ADMIN);

      expect(result.status).toBe('rejected');
      expect(adminTherapistService.rejectTherapist).toHaveBeenCalledWith(
        therapistId,
        TEST_USER_IDS.ADMIN,
        permanentRejectionDto,
      );
    });

    it('should handle application not found', async () => {
      const notFoundError = new NotFoundException('Therapist application not found');
      mockAdminTherapistService.rejectTherapist.mockRejectedValue(notFoundError);

      await expect(
        controller.rejectTherapist('non-existent-id', rejectionDto, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle already processed application', async () => {
      const alreadyProcessedError = new BadRequestException('Application already processed');
      mockAdminTherapistService.rejectTherapist.mockRejectedValue(alreadyProcessedError);

      await expect(
        controller.rejectTherapist(therapistId, rejectionDto, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(alreadyProcessedError);
    });
  });

  describe('PUT /admin/therapists/:id/status', () => {
    const therapistId = 'therapist_application_123456789';
    const statusDto = {
      status: 'active' as const,
      reason: 'Regular status update',
      effectiveDate: new Date(),
    };

    it('should update therapist status successfully', async () => {
      const updatedTherapist = {
        ...mockTherapistApplication,
        status: 'active',
        updatedBy: TEST_USER_IDS.ADMIN,
        updatedAt: new Date(),
      };
      mockAdminTherapistService.updateTherapistStatus.mockResolvedValue(updatedTherapist);

      const result = await controller.updateTherapistStatus(therapistId, statusDto, TEST_USER_IDS.ADMIN);

      expect(result).toEqual(updatedTherapist);
      expect(result.status).toBe('active');
      expect(adminTherapistService.updateTherapistStatus).toHaveBeenCalledWith(
        therapistId,
        TEST_USER_IDS.ADMIN,
        statusDto,
      );
    });

    it('should handle all valid status transitions', async () => {
      const statuses = ['active', 'inactive', 'suspended', 'terminated'] as const;
      
      for (const status of statuses) {
        const dto = { ...statusDto, status };
        const updatedTherapist = {
          ...mockTherapistApplication,
          status,
          updatedBy: TEST_USER_IDS.ADMIN,
          updatedAt: new Date(),
        };
        mockAdminTherapistService.updateTherapistStatus.mockResolvedValue(updatedTherapist);

        const result = await controller.updateTherapistStatus(therapistId, dto, TEST_USER_IDS.ADMIN);

        expect(result.status).toBe(status);
      }
    });

    it('should handle therapist not found', async () => {
      const notFoundError = new NotFoundException('Therapist not found');
      mockAdminTherapistService.updateTherapistStatus.mockRejectedValue(notFoundError);

      await expect(
        controller.updateTherapistStatus('non-existent-id', statusDto, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle invalid status transitions', async () => {
      const invalidTransitionError = new BadRequestException('Invalid status transition');
      mockAdminTherapistService.updateTherapistStatus.mockRejectedValue(invalidTransitionError);

      await expect(
        controller.updateTherapistStatus(therapistId, statusDto, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(invalidTransitionError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database update failed');
      mockAdminTherapistService.updateTherapistStatus.mockRejectedValue(serviceError);

      await expect(
        controller.updateTherapistStatus(therapistId, statusDto, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /admin/therapists/metrics', () => {
    it('should get therapist application metrics successfully', async () => {
      mockAdminTherapistService.getTherapistApplicationMetrics.mockResolvedValue(mockApplicationMetrics);

      const result = await controller.getTherapistApplicationMetrics(undefined, undefined, TEST_USER_IDS.ADMIN);

      expect(result).toEqual(mockApplicationMetrics);
      expect(adminTherapistService.getTherapistApplicationMetrics).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should get metrics with date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-02-29';
      const dateRangeMetrics = {
        ...mockApplicationMetrics,
        totalApplications: 27,
        monthlyApplications: mockApplicationMetrics.monthlyApplications.slice(0, 2),
      };
      mockAdminTherapistService.getTherapistApplicationMetrics.mockResolvedValue(dateRangeMetrics);

      const result = await controller.getTherapistApplicationMetrics(startDate, endDate, TEST_USER_IDS.ADMIN);

      expect(result).toEqual(dateRangeMetrics);
      expect(adminTherapistService.getTherapistApplicationMetrics).toHaveBeenCalledWith(startDate, endDate);
    });

    it('should handle empty metrics', async () => {
      const emptyMetrics = {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        averageProcessingTime: 0,
        monthlyApplications: [],
        specializations: [],
        averageExperience: 0,
        topStates: [],
      };
      mockAdminTherapistService.getTherapistApplicationMetrics.mockResolvedValue(emptyMetrics);

      const result = await controller.getTherapistApplicationMetrics(undefined, undefined, TEST_USER_IDS.ADMIN);

      expect(result).toEqual(emptyMetrics);
      expect(result.totalApplications).toBe(0);
    });

    it('should validate metrics response structure', async () => {
      mockAdminTherapistService.getTherapistApplicationMetrics.mockResolvedValue(mockApplicationMetrics);

      const result = await controller.getTherapistApplicationMetrics(undefined, undefined, TEST_USER_IDS.ADMIN);

      expect(result).toHaveProperty('totalApplications');
      expect(result).toHaveProperty('pendingApplications');
      expect(result).toHaveProperty('approvedApplications');
      expect(result).toHaveProperty('rejectedApplications');
      expect(result).toHaveProperty('averageProcessingTime');
      expect(Array.isArray(result.monthlyApplications)).toBe(true);
      expect(Array.isArray(result.specializations)).toBe(true);
      expect(Array.isArray(result.topStates)).toBe(true);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Analytics service unavailable');
      mockAdminTherapistService.getTherapistApplicationMetrics.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistApplicationMetrics(undefined, undefined, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockAdminTherapistService.getPendingApplications.mockRejectedValue(serviceError);

      await expect(controller.getPendingApplications({}, TEST_USER_IDS.ADMIN)).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockAdminTherapistService.getApplicationDetails.mockRejectedValue(dbError);

      await expect(
        controller.getApplicationDetails('therapist_123', TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(dbError);
    });

    it('should handle validation errors', async () => {
      const validationError = new BadRequestException('Invalid application data');
      mockAdminTherapistService.approveTherapist.mockRejectedValue(validationError);

      await expect(
        controller.approveTherapist('therapist_123', {} as any, TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(validationError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted application list response', async () => {
      mockAdminTherapistService.getPendingApplications.mockResolvedValue({
        applications: mockApplicationsList,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      });

      const result = await controller.getPendingApplications({}, TEST_USER_IDS.ADMIN);

      expect(result).toHaveProperty('applications');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.applications)).toBe(true);
      result.applications.forEach((app) => {
        TestAssertions.expectValidEntity(app, ['id', 'email', 'firstName', 'lastName', 'status']);
        expect(['pending', 'approved', 'rejected']).toContain(app.status);
      });
    });

    it('should return properly formatted application details response', async () => {
      mockAdminTherapistService.getApplicationDetails.mockResolvedValue(mockTherapistApplication);

      const result = await controller.getApplicationDetails('therapist_123', TEST_USER_IDS.ADMIN);

      TestAssertions.expectValidEntity(result, ['id', 'email', 'firstName', 'lastName', 'status']);
      expect(Array.isArray(result.specializations)).toBe(true);
      expect(Array.isArray(result.documents)).toBe(true);
      expect(typeof result.yearsOfExperience).toBe('number');
      expect(typeof result.hourlyRate).toBe('number');
    });

    it('should return properly formatted metrics response', async () => {
      mockAdminTherapistService.getTherapistApplicationMetrics.mockResolvedValue(mockApplicationMetrics);

      const result = await controller.getTherapistApplicationMetrics(undefined, undefined, TEST_USER_IDS.ADMIN);

      expect(typeof result.totalApplications).toBe('number');
      expect(typeof result.averageProcessingTime).toBe('number');
      expect(typeof result.averageExperience).toBe('number');
      expect(Array.isArray(result.monthlyApplications)).toBe(true);
      expect(Array.isArray(result.specializations)).toBe(true);
      expect(Array.isArray(result.topStates)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete application approval workflow', async () => {
      // Get application details
      mockAdminTherapistService.getApplicationDetails.mockResolvedValue(mockTherapistApplication);
      const details = await controller.getApplicationDetails('therapist_123', TEST_USER_IDS.ADMIN);
      expect(details).toBeDefined();

      // Approve application
      const approvalDto = {
        specializations: ['anxiety', 'depression'],
        hourlyRate: 150,
        maxClients: 20,
        adminNotes: 'Approved',
        onboardingScheduled: true,
      };
      const approvedApp = { ...mockTherapistApplication, status: 'approved' };
      mockAdminTherapistService.approveTherapist.mockResolvedValue(approvedApp);
      const approval = await controller.approveTherapist('therapist_123', approvalDto, TEST_USER_IDS.ADMIN);
      expect(approval.status).toBe('approved');

      // Update status to active
      const statusDto = { status: 'active' as const, reason: 'Onboarding completed' };
      const activeTherapist = { ...approvedApp, status: 'active' };
      mockAdminTherapistService.updateTherapistStatus.mockResolvedValue(activeTherapist);
      const statusUpdate = await controller.updateTherapistStatus('therapist_123', statusDto, TEST_USER_IDS.ADMIN);
      expect(statusUpdate.status).toBe('active');
    });

    it('should handle complete application rejection workflow', async () => {
      // Get application details
      mockAdminTherapistService.getApplicationDetails.mockResolvedValue(mockTherapistApplication);
      const details = await controller.getApplicationDetails('therapist_123', TEST_USER_IDS.ADMIN);
      expect(details).toBeDefined();

      // Reject application
      const rejectionDto = {
        reason: 'Insufficient experience',
        feedback: 'Please gain more experience',
        allowReapplication: true,
        reapplicationDate: new Date('2026-01-01'),
      };
      const rejectedApp = { ...mockTherapistApplication, status: 'rejected' };
      mockAdminTherapistService.rejectTherapist.mockResolvedValue(rejectedApp);
      const rejection = await controller.rejectTherapist('therapist_123', rejectionDto, TEST_USER_IDS.ADMIN);
      expect(rejection.status).toBe('rejected');
    });
  });
});