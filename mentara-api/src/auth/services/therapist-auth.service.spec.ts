import { Test, TestingModule } from '@nestjs/testing';
import { TherapistAuthService } from './therapist-auth.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TokenService } from './token.service';
import { EmailVerificationService } from './email-verification.service';
import { EmailService } from '../../email/email.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { TherapistApplicationService } from '../../therapist/therapist-application.service';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { TherapistApplicationCreateDto } from 'mentara-commons';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('TherapistAuthService', () => {
  let service: TherapistAuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let tokenService: jest.Mocked<TokenService>;
  let emailVerificationService: jest.Mocked<EmailVerificationService>;
  let emailService: jest.Mocked<EmailService>;
  let supabaseStorageService: jest.Mocked<SupabaseStorageService>;
  let therapistApplicationService: jest.Mocked<TherapistApplicationService>;

  const mockTherapistUser = {
    id: 'therapist-user-123',
    email: 'therapist@example.com',
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    role: 'therapist',
    emailVerified: false,
    password: 'hashed-password',
    failedLoginCount: 0,
    lockoutUntil: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTherapist = {
    id: 'therapist-123',
    userId: 'therapist-user-123',
    status: 'pending',
    mobile: '',
    province: '',
    providerType: '',
    professionalLicenseType: '',
    isPRCLicensed: '',
    prcLicenseNumber: '',
    expirationDateOfLicense: new Date(),
    practiceStartDate: new Date(),
    sessionLength: '60 minutes',
    hourlyRate: 0,
    providedOnlineTherapyBefore: false,
    comfortableUsingVideoConferencing: false,
    compliesWithDataPrivacyAct: false,
    willingToAbideByPlatformGuidelines: false,
    treatmentSuccessRates: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    expiresIn: '1h',
  };

  const mockApplicationDto: TherapistApplicationCreateDto = {
    userId: 'therapist-user-123',
    mobile: '+1234567890',
    province: 'Metro Manila',
    providerType: 'Licensed Psychologist',
    professionalLicenseType: 'Psychologist',
    isPRCLicensed: 'Yes',
    prcLicenseNumber: 'PRC123456',
    expirationDateOfLicense: new Date('2025-12-31'),
    practiceStartDate: new Date('2015-01-01'),
    sessionLength: '60 minutes',
    hourlyRate: 2000,
    providedOnlineTherapyBefore: true,
    comfortableUsingVideoConferencing: true,
    compliesWithDataPrivacyAct: true,
    willingToAbideByPlatformGuidelines: true,
    treatmentSuccessRates: { depression: 85, anxiety: 90 },
    specializations: ['Cognitive Behavioral Therapy', 'Trauma Therapy'],
    educationalBackground: 'PhD in Clinical Psychology',
    yearsOfExperience: 8,
    currentWorkplace: 'Private Practice',
    bio: 'Experienced therapist specializing in anxiety and depression.',
    availableSlots: ['09:00-10:00', '10:00-11:00'],
    professionalReferences: ['Dr. John Doe', 'Dr. Jane Doe'],
    emergencyContact: 'Emergency Contact Name',
    emergencyContactNumber: '+1234567890',
    willingToProvideEmergencySupport: true,
    hasLiabilityInsurance: true,
    insuranceProvider: 'Insurance Company',
    insurancePolicyNumber: 'INS123456',
  };

  const mockFiles: Express.Multer.File[] = [
    {
      fieldname: 'license',
      originalname: 'license.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      destination: '/tmp',
      filename: 'license.pdf',
      path: '/tmp/license.pdf',
      buffer: Buffer.from('mock file content'),
    } as Express.Multer.File,
  ];

  const mockFileTypeMap = {
    'license.pdf': 'professional_license',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TherapistAuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            therapist: {
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokenPair: jest.fn(),
          },
        },
        {
          provide: EmailVerificationService,
          useValue: {
            sendVerificationEmail: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendGenericEmail: jest.fn(),
          },
        },
        {
          provide: SupabaseStorageService,
          useValue: {
            uploadFile: jest.fn(),
            getFileUrl: jest.fn(),
          },
        },
        {
          provide: TherapistApplicationService,
          useValue: {
            createApplicationWithDocuments: jest.fn(),
            getAllApplications: jest.fn(),
            getApplicationById: jest.fn(),
            updateApplicationStatus: jest.fn(),
            getApplicationFiles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TherapistAuthService>(TherapistAuthService);
    prismaService = module.get(PrismaService);
    tokenService = module.get(TokenService);
    emailVerificationService = module.get(EmailVerificationService);
    emailService = module.get(EmailService);
    supabaseStorageService = module.get(SupabaseStorageService);
    therapistApplicationService = module.get(TherapistApplicationService);

    // Setup bcrypt mock
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerTherapist', () => {
    it('should register therapist successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockTherapistUser),
          },
          therapist: {
            create: jest.fn().mockResolvedValue(mockTherapist),
          },
        };
        return callback(tx);
      });
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);
      emailVerificationService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await service.registerTherapist(
        'therapist@example.com',
        'password123',
        'Dr. Jane',
        'Smith',
      );

      expect(result).toEqual({
        user: mockTherapistUser,
        tokens: mockTokens,
        message: 'Therapist registration successful. Please complete your application and submit required documents.',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'therapist@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(tokenService.generateTokenPair).toHaveBeenCalledWith(
        mockTherapistUser.id,
        mockTherapistUser.email,
        mockTherapistUser.role,
      );
      expect(emailVerificationService.sendVerificationEmail).toHaveBeenCalledWith(
        mockTherapistUser.id,
      );
    });

    it('should throw BadRequestException for existing user', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockTherapistUser);

      await expect(
        service.registerTherapist(
          'therapist@example.com',
          'password123',
          'Dr. Jane',
          'Smith',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle transaction failure', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.registerTherapist(
          'therapist@example.com',
          'password123',
          'Dr. Jane',
          'Smith',
        ),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('loginTherapist', () => {
    const mockTherapistWithProfile = {
      ...mockTherapistUser,
      therapist: mockTherapist,
    };

    it('should login therapist successfully', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockTherapistWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockTherapistUser);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.loginTherapist(
        'therapist@example.com',
        'password123',
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result).toEqual({
        user: mockTherapistWithProfile,
        tokens: mockTokens,
      });

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'therapist@example.com',
          role: 'therapist',
        },
        include: {
          therapist: true,
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockTherapistUser.password);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockTherapistUser.id },
        data: {
          failedLoginCount: 0,
          lockoutUntil: null,
          lastLoginAt: expect.any(Date),
        },
      });
    });

    it('should throw UnauthorizedException for non-existent therapist', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.loginTherapist('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const lockedTherapist = {
        ...mockTherapistWithProfile,
        lockoutUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      };

      prismaService.user.findFirst.mockResolvedValue(lockedTherapist);

      await expect(
        service.loginTherapist('therapist@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for therapist without password', async () => {
      const therapistWithoutPassword = {
        ...mockTherapistWithProfile,
        password: null,
      };

      prismaService.user.findFirst.mockResolvedValue(therapistWithoutPassword);

      await expect(
        service.loginTherapist('therapist@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle failed login and increment failed count', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockTherapistWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 2 });
      prismaService.user.update.mockResolvedValue(mockTherapistUser);

      await expect(
        service.loginTherapist('therapist@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockTherapistUser.id },
        data: {
          failedLoginCount: 3,
        },
      });
    });
  });

  describe('getTherapistProfile', () => {
    it('should get therapist profile successfully', async () => {
      const mockTherapistWithProfile = {
        ...mockTherapistUser,
        therapist: {
          ...mockTherapist,
          assignedClients: [
            {
              id: 'assignment-123',
              client: {
                id: 'client-123',
                user: {
                  id: 'client-user-123',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'client@example.com',
                  avatarUrl: 'https://example.com/client-avatar.jpg',
                },
              },
            },
          ],
        },
      };

      prismaService.user.findUnique.mockResolvedValue(mockTherapistWithProfile);

      const result = await service.getTherapistProfile('therapist-user-123');

      expect(result).toEqual(mockTherapistWithProfile);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'therapist-user-123' },
        include: {
          therapist: {
            include: {
              assignedClients: {
                include: {
                  client: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          email: true,
                          avatarUrl: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getTherapistProfile('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-therapist user', async () => {
      const nonTherapistUser = {
        ...mockTherapistUser,
        role: 'client',
      };

      prismaService.user.findUnique.mockResolvedValue(nonTherapistUser);

      await expect(service.getTherapistProfile('therapist-user-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Application Management Methods', () => {
    it('should create application with documents', async () => {
      const expectedResponse = {
        id: 'application-123',
        success: true,
        message: 'Application created successfully',
      };

      therapistApplicationService.createApplicationWithDocuments.mockResolvedValue(
        expectedResponse,
      );

      const result = await service.createApplicationWithDocuments(
        mockApplicationDto,
        mockFiles,
        mockFileTypeMap,
      );

      expect(result).toEqual(expectedResponse);
      expect(therapistApplicationService.createApplicationWithDocuments).toHaveBeenCalledWith(
        mockApplicationDto,
        mockFiles,
        mockFileTypeMap,
      );
    });

    it('should get all applications', async () => {
      const params = { status: 'pending', page: 1, limit: 10 };
      const expectedResponse = {
        applications: [{ id: 'app-1', status: 'pending' }],
        totalCount: 1,
        page: 1,
        totalPages: 1,
      };

      therapistApplicationService.getAllApplications.mockResolvedValue(expectedResponse);

      const result = await service.getAllApplications(params);

      expect(result).toEqual(expectedResponse);
      expect(therapistApplicationService.getAllApplications).toHaveBeenCalledWith(params);
    });

    it('should get application by ID', async () => {
      const applicationId = 'application-123';
      const expectedResponse = {
        id: applicationId,
        status: 'pending',
        createdAt: new Date(),
      };

      therapistApplicationService.getApplicationById.mockResolvedValue(expectedResponse);

      const result = await service.getApplicationById(applicationId);

      expect(result).toEqual(expectedResponse);
      expect(therapistApplicationService.getApplicationById).toHaveBeenCalledWith(
        applicationId,
      );
    });

    it('should update application status', async () => {
      const applicationId = 'application-123';
      const updateData = { status: 'approved', reviewedBy: 'admin-123' };
      const expectedResponse = {
        success: true,
        message: 'Application approved successfully',
        credentials: { email: 'therapist@example.com', password: 'temp-password' },
      };

      therapistApplicationService.updateApplicationStatus.mockResolvedValue(expectedResponse);

      const result = await service.updateApplicationStatus(applicationId, updateData);

      expect(result).toEqual(expectedResponse);
      expect(therapistApplicationService.updateApplicationStatus).toHaveBeenCalledWith(
        applicationId,
        updateData,
      );
    });

    it('should get application files', async () => {
      const applicationId = 'application-123';
      const expectedResponse = [
        {
          id: 'file-1',
          fileName: 'license.pdf',
          fileUrl: 'https://example.com/license.pdf',
          uploadedAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      therapistApplicationService.getApplicationFiles.mockResolvedValue(expectedResponse);

      const result = await service.getApplicationFiles(applicationId);

      expect(result).toEqual(expectedResponse);
      expect(therapistApplicationService.getApplicationFiles).toHaveBeenCalledWith(
        applicationId,
      );
    });
  });

  describe('handleFailedLogin (private method)', () => {
    it('should increment failed login count for therapist with existing failed attempts', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 2 });
      prismaService.user.update.mockResolvedValue(mockTherapistUser);

      await (service as any).handleFailedLogin('therapist-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'therapist-user-123' },
        data: {
          failedLoginCount: 3,
        },
      });
    });

    it('should lock account when max attempts reached', async () => {
      prismaService.user.findUnique.mockResolvedValue({ failedLoginCount: 4 });
      prismaService.user.update.mockResolvedValue(mockTherapistUser);

      await (service as any).handleFailedLogin('therapist-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'therapist-user-123' },
        data: {
          failedLoginCount: 5,
          lockoutUntil: expect.any(Date),
        },
      });
    });

    it('should handle user not found during failed login', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.update.mockResolvedValue(mockTherapistUser);

      await (service as any).handleFailedLogin('therapist-user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'therapist-user-123' },
        data: {
          failedLoginCount: 1,
        },
      });
    });
  });

  describe('bcrypt integration', () => {
    it('should use bcrypt.hash for password hashing', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockTherapistUser),
          },
          therapist: {
            create: jest.fn().mockResolvedValue(mockTherapist),
          },
        };
        return callback(tx);
      });
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);
      emailVerificationService.sendVerificationEmail.mockResolvedValue(undefined);

      await service.registerTherapist(
        'therapist@example.com',
        'password123',
        'Dr. Jane',
        'Smith',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should use bcrypt.compare for password verification', async () => {
      const mockTherapistWithProfile = {
        ...mockTherapistUser,
        therapist: mockTherapist,
      };

      prismaService.user.findFirst.mockResolvedValue(mockTherapistWithProfile);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockTherapistUser);
      tokenService.generateTokenPair.mockResolvedValue(mockTokens);

      await service.loginTherapist('therapist@example.com', 'password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockTherapistUser.password);
    });
  });

  describe('dependency injection and service delegation', () => {
    it('should properly delegate to TherapistApplicationService', () => {
      expect(service).toBeDefined();
      expect(therapistApplicationService).toBeDefined();
      
      // Verify that the service methods are properly wired
      expect(typeof service.createApplicationWithDocuments).toBe('function');
      expect(typeof service.getAllApplications).toBe('function');
      expect(typeof service.getApplicationById).toBe('function');
      expect(typeof service.updateApplicationStatus).toBe('function');
      expect(typeof service.getApplicationFiles).toBe('function');
    });
  });
});