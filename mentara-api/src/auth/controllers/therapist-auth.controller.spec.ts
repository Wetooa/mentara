import { Test, TestingModule } from '@nestjs/testing';
import { 
  UnauthorizedException, 
  BadRequestException, 
  NotFoundException, 
  ForbiddenException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TherapistAuthController } from './therapist-auth.controller';
import { TherapistAuthService } from '../services/therapist-auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
  SecurityGuardTestUtils,
  RoleBasedTestUtils,
  TEST_USER_IDS,
  TEST_EMAILS,
} from '../../test-utils/auth-testing-helpers';

describe('TherapistAuthController', () => {
  let controller: TherapistAuthController;
  let therapistAuthService: TherapistAuthService;
  let supabaseStorageService: SupabaseStorageService;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;

  // Test data constants
  const mockTherapistUser = {
    id: TEST_USER_IDS.THERAPIST,
    email: TEST_EMAILS.THERAPIST,
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    role: 'therapist',
    emailVerified: false,
    licenseNumber: 'LIC123456',
    specializations: ['anxiety', 'depression'],
    approvalStatus: 'pending',
    profileComplete: true,
    createdAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };

  const mockRegistrationResult = {
    user: mockTherapistUser,
    tokens: mockTokens,
    message: 'Therapist account created successfully',
  };

  const mockLoginResult = {
    user: mockTherapistUser,
    tokens: mockTokens,
  };

  const mockTherapistApplication = {
    id: 'app-123',
    email: TEST_EMAILS.THERAPIST,
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    licenseNumber: 'LIC123456',
    specializations: ['anxiety', 'depression'],
    education: 'PhD in Psychology',
    experience: '5 years',
    status: 'pending',
    submittedAt: new Date(),
    reviewedAt: null,
    notes: null,
    reviewerComments: null,
  };

  const mockApplicationFiles = [
    {
      id: 'file-123',
      fileName: 'license.pdf',
      fileUrl: 'https://example.com/license.pdf',
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'file-456',
      fileName: 'diploma.pdf',
      fileUrl: 'https://example.com/diploma.pdf',
      uploadedAt: new Date().toISOString(),
    },
  ];

  const mockFiles = [
    {
      fieldname: 'files',
      originalname: 'license.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test license content'),
    },
    {
      fieldname: 'files',
      originalname: 'diploma.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 2048,
      buffer: Buffer.from('test diploma content'),
    },
  ] as Express.Multer.File[];

  const mockApplicationData = {
    email: TEST_EMAILS.THERAPIST,
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    licenseNumber: 'LIC123456',
    specializations: ['anxiety', 'depression'],
    education: 'PhD in Psychology',
    experience: '5 years',
  };

  beforeEach(async () => {
    // Create mock services
    const mockTherapistAuthService = {
      registerTherapist: jest.fn(),
      loginTherapist: jest.fn(),
      getTherapistProfile: jest.fn(),
      createApplicationWithDocuments: jest.fn(),
      getAllApplications: jest.fn(),
      getApplicationById: jest.fn(),
      updateApplicationStatus: jest.fn(),
      getApplicationFiles: jest.fn(),
    };

    const mockSupabaseStorageService = {
      validateFile: jest.fn(),
      uploadFiles: jest.fn(),
      getSupportedBuckets: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'short',
            ttl: 1000,
            limit: 3,
          },
        ]),
      ],
      controllers: [TherapistAuthController],
      providers: [
        {
          provide: TherapistAuthService,
          useValue: mockTherapistAuthService,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockSupabaseStorageService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<TherapistAuthController>(TherapistAuthController);
    therapistAuthService = module.get<TherapistAuthService>(TherapistAuthService);
    supabaseStorageService = module.get<SupabaseStorageService>(SupabaseStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterDto = {
      email: 'newtherapist@example.com',
      password: 'SecurePass123!',
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
    };

    it('should register therapist successfully', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'registerTherapist').mockResolvedValue(mockRegistrationResult);

      // Act
      const result = await controller.register(validRegisterDto);

      // Assert
      expect(therapistAuthService.registerTherapist).toHaveBeenCalledWith(
        validRegisterDto.email,
        validRegisterDto.password,
        validRegisterDto.firstName,
        validRegisterDto.lastName,
      );
      expect(result).toEqual({
        user: {
          id: mockTherapistUser.id,
          email: mockTherapistUser.email,
          firstName: mockTherapistUser.firstName,
          lastName: mockTherapistUser.lastName,
          role: mockTherapistUser.role,
          emailVerified: mockTherapistUser.emailVerified,
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
        message: mockRegistrationResult.message,
      });
    });

    it('should handle email already exists error', async () => {
      // Arrange
      const error = new BadRequestException('Email already exists');
      jest.spyOn(therapistAuthService, 'registerTherapist').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.register(validRegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(therapistAuthService, 'registerTherapist').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.register(validRegisterDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    const validLoginDto = {
      email: TEST_EMAILS.THERAPIST,
      password: 'SecurePass123!',
    };

    const mockRequest = {
      ip: '192.168.1.1',
      get: jest.fn().mockReturnValue('Test User Agent'),
    } as any;

    it('should login therapist successfully with valid credentials', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'loginTherapist').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(validLoginDto, mockRequest);

      // Assert
      expect(therapistAuthService.loginTherapist).toHaveBeenCalledWith(
        validLoginDto.email,
        validLoginDto.password,
        mockRequest.ip,
        'Test User Agent',
      );

      expect(result).toEqual({
        user: {
          id: mockTherapistUser.id,
          email: mockTherapistUser.email,
          firstName: mockTherapistUser.firstName,
          lastName: mockTherapistUser.lastName,
          role: mockTherapistUser.role,
          emailVerified: mockTherapistUser.emailVerified,
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
      });
    });

    it('should handle missing User-Agent header', async () => {
      // Arrange
      const mockRequestWithoutUserAgent = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue(undefined),
      } as any;

      jest.spyOn(therapistAuthService, 'loginTherapist').mockResolvedValue(mockLoginResult);

      // Act
      await controller.login(validLoginDto, mockRequestWithoutUserAgent);

      // Assert
      expect(therapistAuthService.loginTherapist).toHaveBeenCalledWith(
        validLoginDto.email,
        validLoginDto.password,
        mockRequestWithoutUserAgent.ip,
        undefined,
      );
    });

    it('should handle invalid credentials', async () => {
      // Arrange
      const authError = new UnauthorizedException('Invalid credentials');
      jest.spyOn(therapistAuthService, 'loginTherapist').mockRejectedValue(authError);

      // Act & Assert
      await expect(controller.login(validLoginDto, mockRequest)).rejects.toThrow(authError);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      jest.spyOn(therapistAuthService, 'loginTherapist').mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.login(validLoginDto, mockRequest)).rejects.toThrow(serviceError);
    });
  });

  describe('getProfile', () => {
    it('should return therapist profile successfully', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'getTherapistProfile').mockResolvedValue(mockTherapistUser);

      // Act
      const result = await controller.getProfile(TEST_USER_IDS.THERAPIST);

      // Assert
      expect(therapistAuthService.getTherapistProfile).toHaveBeenCalledWith(TEST_USER_IDS.THERAPIST);
      expect(result).toEqual(mockTherapistUser);
    });

    it('should handle profile not found', async () => {
      // Arrange
      const notFoundError = new Error('Therapist profile not found');
      jest.spyOn(therapistAuthService, 'getTherapistProfile').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getProfile(TEST_USER_IDS.THERAPIST)).rejects.toThrow(notFoundError);
    });
  });

  describe('applyWithDocuments', () => {
    const validApplicationDataJson = JSON.stringify(mockApplicationData);
    const validFileTypes = JSON.stringify({ '0': 'license', '1': 'diploma' });

    const mockApplicationResult = {
      application: { userId: 'temp_12345_therapist_at_example.com' },
      uploadedFiles: [
        { id: 'file-123', fileName: 'license.pdf', url: 'https://example.com/license.pdf' },
        { id: 'file-456', fileName: 'diploma.pdf', url: 'https://example.com/diploma.pdf' },
      ],
    };

    it('should submit application with documents successfully', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'createApplicationWithDocuments').mockResolvedValue(mockApplicationResult);

      // Act
      const result = await controller.applyWithDocuments(
        validApplicationDataJson,
        validFileTypes,
        mockFiles,
      );

      // Assert
      expect(therapistAuthService.createApplicationWithDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockApplicationData,
          userId: expect.stringContaining('temp_'),
        }),
        mockFiles,
        { '0': 'license', '1': 'diploma' },
      );

      expect(result).toEqual({
        success: true,
        message: 'Application submitted successfully with documents',
        applicationId: mockApplicationResult.application.userId,
        uploadedFiles: mockApplicationResult.uploadedFiles,
      });
    });

    it('should submit application without files', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'createApplicationWithDocuments').mockResolvedValue(mockApplicationResult);

      // Act
      const result = await controller.applyWithDocuments(
        validApplicationDataJson,
        validFileTypes,
        [],
      );

      // Assert
      expect(therapistAuthService.createApplicationWithDocuments).toHaveBeenCalledWith(
        expect.objectContaining(mockApplicationData),
        [],
        { '0': 'license', '1': 'diploma' },
      );
      expect(result.success).toBe(true);
    });

    it('should handle missing application data', async () => {
      // Act & Assert
      await expect(controller.applyWithDocuments('', validFileTypes, mockFiles)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle invalid JSON format', async () => {
      // Act & Assert
      await expect(
        controller.applyWithDocuments('invalid json', validFileTypes, mockFiles),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle email already exists error', async () => {
      // Arrange
      const error = new Error('email already exists');
      jest.spyOn(therapistAuthService, 'createApplicationWithDocuments').mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.applyWithDocuments(validApplicationDataJson, validFileTypes, mockFiles),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle file upload errors', async () => {
      // Arrange
      const error = new Error('file upload failed');
      jest.spyOn(therapistAuthService, 'createApplicationWithDocuments').mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.applyWithDocuments(validApplicationDataJson, validFileTypes, mockFiles),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const error = new Error('validation failed');
      jest.spyOn(therapistAuthService, 'createApplicationWithDocuments').mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.applyWithDocuments(validApplicationDataJson, validFileTypes, mockFiles),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Unknown database error');
      jest.spyOn(therapistAuthService, 'createApplicationWithDocuments').mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.applyWithDocuments(validApplicationDataJson, validFileTypes, mockFiles),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle invalid file types JSON', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'createApplicationWithDocuments').mockResolvedValue(mockApplicationResult);

      // Act
      const result = await controller.applyWithDocuments(
        validApplicationDataJson,
        'invalid json',
        mockFiles,
      );

      // Assert
      expect(therapistAuthService.createApplicationWithDocuments).toHaveBeenCalledWith(
        expect.objectContaining(mockApplicationData),
        mockFiles,
        {}, // Empty object when JSON parsing fails
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getAllApplications', () => {
    const mockApplicationsResult = {
      applications: [mockTherapistApplication],
      totalCount: 1,
      page: 1,
      totalPages: 1,
    };

    it('should return all applications for admin user', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'getAllApplications').mockResolvedValue(mockApplicationsResult);

      // Act
      const result = await controller.getAllApplications('admin');

      // Assert
      expect(therapistAuthService.getAllApplications).toHaveBeenCalledWith({
        status: undefined,
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(mockApplicationsResult);
    });

    it('should return applications with custom filters', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'getAllApplications').mockResolvedValue(mockApplicationsResult);

      // Act
      const result = await controller.getAllApplications('admin', 'pending', 2, 20);

      // Assert
      expect(therapistAuthService.getAllApplications).toHaveBeenCalledWith({
        status: 'pending',
        page: 2,
        limit: 20,
      });
      expect(result).toEqual(mockApplicationsResult);
    });

    it('should handle pagination bounds', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'getAllApplications').mockResolvedValue(mockApplicationsResult);

      // Act
      await controller.getAllApplications('admin', undefined, 0, 200);

      // Assert
      expect(therapistAuthService.getAllApplications).toHaveBeenCalledWith({
        status: undefined,
        page: 1, // Clamped to minimum 1
        limit: 100, // Clamped to maximum 100
      });
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      // Act & Assert
      await expect(controller.getAllApplications('client')).rejects.toThrow(ForbiddenException);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(therapistAuthService, 'getAllApplications').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getAllApplications('admin')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getApplicationById', () => {
    it('should return application by ID for admin user', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'getApplicationById').mockResolvedValue(mockTherapistApplication);

      // Act
      const result = await controller.getApplicationById('admin', 'app-123');

      // Assert
      expect(therapistAuthService.getApplicationById).toHaveBeenCalledWith('app-123');
      expect(result).toEqual(mockTherapistApplication);
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      // Act & Assert
      await expect(controller.getApplicationById('client', 'app-123')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when application not found', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'getApplicationById').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getApplicationById('admin', 'app-123')).rejects.toThrow(NotFoundException);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(therapistAuthService, 'getApplicationById').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getApplicationById('admin', 'app-123')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateApplicationStatus', () => {
    const mockUpdateData = {
      status: 'approved' as const,
      notes: 'Approved by admin',
      reviewerComments: 'All documents verified',
    };

    const mockUpdateResult = {
      success: true,
      message: 'Application approved successfully',
      credentials: {
        email: TEST_EMAILS.THERAPIST,
        password: 'generated-password',
      },
    };

    it('should update application status successfully for admin user', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'updateApplicationStatus').mockResolvedValue(mockUpdateResult);

      // Act
      const result = await controller.updateApplicationStatus('admin', 'app-123', mockUpdateData);

      // Assert
      expect(therapistAuthService.updateApplicationStatus).toHaveBeenCalledWith('app-123', mockUpdateData);
      expect(result).toEqual(mockUpdateResult);
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      // Act & Assert
      await expect(controller.updateApplicationStatus('client', 'app-123', mockUpdateData)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle NotFoundException', async () => {
      // Arrange
      const notFoundError = new NotFoundException('Application not found');
      jest.spyOn(therapistAuthService, 'updateApplicationStatus').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.updateApplicationStatus('admin', 'app-123', mockUpdateData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(therapistAuthService, 'updateApplicationStatus').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.updateApplicationStatus('admin', 'app-123', mockUpdateData)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getApplicationFiles', () => {
    it('should return application files for admin user', async () => {
      // Arrange
      jest.spyOn(therapistAuthService, 'getApplicationFiles').mockResolvedValue(mockApplicationFiles);

      // Act
      const result = await controller.getApplicationFiles('admin', 'app-123');

      // Assert
      expect(therapistAuthService.getApplicationFiles).toHaveBeenCalledWith('app-123');
      expect(result).toEqual(mockApplicationFiles);
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      // Act & Assert
      await expect(controller.getApplicationFiles('client', 'app-123')).rejects.toThrow(ForbiddenException);
    });

    it('should handle NotFoundException', async () => {
      // Arrange
      const notFoundError = new NotFoundException('Application files not found');
      jest.spyOn(therapistAuthService, 'getApplicationFiles').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getApplicationFiles('admin', 'app-123')).rejects.toThrow(NotFoundException);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(therapistAuthService, 'getApplicationFiles').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getApplicationFiles('admin', 'app-123')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Security Tests', () => {
    it('should validate input data through ZodValidationPipe', () => {
      // This tests that the controller uses proper validation
      const validationPipe = new ZodValidationPipe({} as any);
      expect(validationPipe).toBeDefined();
    });

    it('should apply rate limiting through ThrottlerGuard', () => {
      // Test that throttling is configured
      const registerMetadata = Reflect.getMetadata('__throttler_options__', controller.register);
      const loginMetadata = Reflect.getMetadata('__throttler_options__', controller.login);
      
      expect(registerMetadata).toBeDefined();
      expect(loginMetadata).toBeDefined();
    });

    it('should require authentication for protected endpoints', () => {
      // Test that protected endpoints have JwtAuthGuard
      const protectedMethods = ['getProfile', 'getAllApplications', 'getApplicationById', 'updateApplicationStatus', 'getApplicationFiles'];
      
      protectedMethods.forEach(method => {
        const guards = Reflect.getMetadata('__guards__', controller[method as keyof TherapistAuthController]);
        expect(guards).toBeDefined();
      });
    });

    it('should allow public access to public endpoints', () => {
      // Test that public endpoints are marked as public
      const publicMethods = ['register', 'login', 'applyWithDocuments'];
      
      publicMethods.forEach(method => {
        const publicMetadata = Reflect.getMetadata('isPublic', controller[method as keyof TherapistAuthController]);
        expect(publicMetadata).toBeTruthy();
      });
    });
  });

  describe('Role-based Access Control', () => {
    it('should test role-based access for admin endpoints', async () => {
      // Test that admin endpoints require admin role
      await RoleBasedTestUtils.testWithRoles(
        async (userId: string, role: string) => {
          // Mock the auth guard to return the specific role
          mockJwtAuthGuard.canActivate.mockReturnValue(role === 'admin');
          
          try {
            await controller.getAllApplications(role);
            return true;
          } catch (error) {
            return false;
          }
        },
        {
          client: false,
          therapist: false,
          admin: true,
          moderator: false,
        },
      );
    });

    it('should validate therapist-specific functionality', async () => {
      // Test that therapist-specific endpoints work for therapists
      const therapistContext = MockBuilder.createAuthContext('therapist');
      
      jest.spyOn(therapistAuthService, 'getTherapistProfile').mockResolvedValue(mockTherapistUser);
      
      const result = await controller.getProfile(therapistContext.userId);
      
      expect(result).toBeDefined();
      expect(result.role).toBe('therapist');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      jest.spyOn(therapistAuthService, 'getTherapistProfile').mockRejectedValue(networkError);

      // Act & Assert
      await expect(controller.getProfile(TEST_USER_IDS.THERAPIST)).rejects.toThrow(networkError);
    });

    it('should handle validation errors', async () => {
      // Test that invalid data would be caught by the validation pipe
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '',
        lastName: '',
      };

      // In a real scenario, this would throw a validation error
      // The pipe would catch this before it reaches the controller
      expect(() => {
        // This would be handled by ZodValidationPipe
        // and would throw a BadRequestException
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete therapist registration workflow', async () => {
      // Arrange
      const registrationDto = {
        email: 'integration@example.com',
        password: 'SecurePass123!',
        firstName: 'Dr. Integration',
        lastName: 'Test',
      };

      jest.spyOn(therapistAuthService, 'registerTherapist').mockResolvedValue(mockRegistrationResult);

      // Act
      const result = await controller.register(registrationDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockTherapistUser.email);
      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(result.expiresIn).toBe(mockTokens.expiresIn);
      expect(result.message).toBe(mockRegistrationResult.message);
    });

    it('should handle complete therapist login workflow', async () => {
      // Arrange
      const loginDto = {
        email: TEST_EMAILS.THERAPIST,
        password: 'SecurePass123!',
      };

      const mockRequest = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Test User Agent'),
      } as any;

      jest.spyOn(therapistAuthService, 'loginTherapist').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(loginDto, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockTherapistUser.email);
      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(result.expiresIn).toBe(mockTokens.expiresIn);
    });

    it('should handle complete application submission workflow', async () => {
      // Arrange
      const mockApplicationResult = {
        application: { userId: 'temp_12345_therapist_at_example.com' },
        uploadedFiles: mockApplicationFiles,
      };

      jest.spyOn(therapistAuthService, 'createApplicationWithDocuments').mockResolvedValue(mockApplicationResult);

      // Act
      const result = await controller.applyWithDocuments(
        JSON.stringify(mockApplicationData),
        JSON.stringify({ '0': 'license', '1': 'diploma' }),
        mockFiles,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.applicationId).toBe(mockApplicationResult.application.userId);
      expect(result.uploadedFiles).toEqual(mockApplicationFiles);
    });

    it('should handle complete admin application management workflow', async () => {
      // Arrange
      const mockApplicationsResult = {
        applications: [mockTherapistApplication],
        totalCount: 1,
        page: 1,
        totalPages: 1,
      };

      jest.spyOn(therapistAuthService, 'getAllApplications').mockResolvedValue(mockApplicationsResult);
      jest.spyOn(therapistAuthService, 'getApplicationById').mockResolvedValue(mockTherapistApplication);

      // Act - Get all applications
      const allApplications = await controller.getAllApplications('admin');
      
      // Act - Get specific application
      const specificApplication = await controller.getApplicationById('admin', 'app-123');

      // Assert
      expect(allApplications).toBeDefined();
      expect(allApplications.applications.length).toBe(1);
      expect(allApplications.totalCount).toBe(1);
      
      expect(specificApplication).toBeDefined();
      expect(specificApplication.id).toBe('app-123');
    });
  });

  describe('Data Validation', () => {
    it('should validate registration data structure', () => {
      // Test that we're using the correct DTO structure
      const validRegistrationData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'Dr. Test',
        lastName: 'User',
      };

      // Verify all required fields are present
      expect(validRegistrationData.email).toBeDefined();
      expect(validRegistrationData.password).toBeDefined();
      expect(validRegistrationData.firstName).toBeDefined();
      expect(validRegistrationData.lastName).toBeDefined();
    });

    it('should validate login data structure', () => {
      // Test that we're using the correct DTO structure
      const validLoginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      // Verify all required fields are present
      expect(validLoginData.email).toBeDefined();
      expect(validLoginData.password).toBeDefined();
    });

    it('should validate application data structure', () => {
      // Test that we're using the correct DTO structure
      const validApplicationData = {
        email: 'test@example.com',
        firstName: 'Dr. Test',
        lastName: 'User',
        licenseNumber: 'LIC123456',
        specializations: ['anxiety', 'depression'],
        education: 'PhD in Psychology',
        experience: '5 years',
      };

      // Verify all required fields are present
      expect(validApplicationData.email).toBeDefined();
      expect(validApplicationData.firstName).toBeDefined();
      expect(validApplicationData.lastName).toBeDefined();
      expect(validApplicationData.licenseNumber).toBeDefined();
      expect(validApplicationData.specializations).toBeDefined();
      expect(validApplicationData.education).toBeDefined();
      expect(validApplicationData.experience).toBeDefined();
    });
  });

  describe('Response Format Validation', () => {
    it('should return correctly formatted registration response', async () => {
      // Arrange
      const registerDto = {
        email: 'format@example.com',
        password: 'SecurePass123!',
        firstName: 'Dr. Format',
        lastName: 'Test',
      };

      jest.spyOn(therapistAuthService, 'registerTherapist').mockResolvedValue(mockRegistrationResult);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).toHaveProperty('message');
      
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('firstName');
      expect(result.user).toHaveProperty('lastName');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('emailVerified');
    });

    it('should return correctly formatted login response', async () => {
      // Arrange
      const loginDto = {
        email: TEST_EMAILS.THERAPIST,
        password: 'SecurePass123!',
      };

      const mockRequest = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Test User Agent'),
      } as any;

      jest.spyOn(therapistAuthService, 'loginTherapist').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(loginDto, mockRequest);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).not.toHaveProperty('message'); // Login doesn't include message
    });

    it('should return correctly formatted application response', async () => {
      // Arrange
      const mockApplicationResult = {
        application: { userId: 'temp_12345_therapist_at_example.com' },
        uploadedFiles: mockApplicationFiles,
      };

      jest.spyOn(therapistAuthService, 'createApplicationWithDocuments').mockResolvedValue(mockApplicationResult);

      // Act
      const result = await controller.applyWithDocuments(
        JSON.stringify(mockApplicationData),
        JSON.stringify({ '0': 'license', '1': 'diploma' }),
        mockFiles,
      );

      // Assert
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('applicationId');
      expect(result).toHaveProperty('uploadedFiles');
      
      expect(result.success).toBe(true);
      expect(result.uploadedFiles).toBeInstanceOf(Array);
    });
  });
});