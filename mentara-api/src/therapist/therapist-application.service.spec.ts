import { Test, TestingModule } from '@nestjs/testing';
import { TherapistApplicationService } from './therapist-application.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EmailService } from '../services/email.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  FileStatus,
  AttachmentEntityType,
  AttachmentPurpose,
} from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('TherapistApplicationService', () => {
  let service: TherapistApplicationService;
  let prismaService: any;
  let emailService: any;

  // Mock data
  const mockUser = {
    id: 'user-123',
    email: 'therapist@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'client',
    isActive: false,
    createdAt: new Date('2024-01-15T00:00:00Z'),
    updatedAt: new Date('2024-01-15T00:00:00Z'),
  };

  const mockTherapistApplication = {
    userId: 'user-123',
    mobile: '+1234567890',
    province: 'Ontario',
    status: 'pending',
    providerType: 'Registered Psychologist',
    professionalLicenseType: 'Registered Psychologist',
    isPRCLicensed: true,
    prcLicenseNumber: 'RP12345',
    practiceStartDate: new Date('2020-01-01T00:00:00Z'),
    areasOfExpertise: ['anxiety', 'depression'],
    assessmentTools: ['GAD-7', 'PHQ-9'],
    therapeuticApproachesUsedList: ['CBT', 'DBT'],
    languagesOffered: ['English', 'French'],
    providedOnlineTherapyBefore: true,
    comfortableUsingVideoConferencing: true,
    privateConfidentialSpace: 'yes',
    compliesWithDataPrivacyAct: true,
    professionalLiabilityInsurance: 'yes',
    complaintsOrDisciplinaryActions: 'no',
    willingToAbideByPlatformGuidelines: true,
    sessionLength: '50 minutes',
    hourlyRate: 120,
    submissionDate: new Date('2024-01-15T00:00:00Z'),
    processingDate: new Date('2024-01-15T00:00:00Z'),
    expirationDateOfLicense: new Date('2025-01-01T00:00:00Z'),
    licenseVerified: false,
    acceptsInsurance: false,
    acceptedInsuranceTypes: [],
    specialCertifications: [],
    expertise: ['anxiety', 'depression'],
    approaches: ['CBT', 'DBT'],
    languages: ['English', 'French'],
    illnessSpecializations: [],
    acceptTypes: ['individual', 'couples'],
    treatmentSuccessRates: {},
    preferredSessionLength: [30, 45, 60],
    user: mockUser,
  };

  const mockApplicationDto = {
    userId: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'therapist@example.com',
    mobile: '+1234567890',
    province: 'Ontario',
    providerType: 'Registered Psychologist',
    professionalLicenseType: 'Registered Psychologist',
    isPRCLicensed: 'yes',
    prcLicenseNumber: 'RP12345',
    practiceStartDate: '2020-01-01',
    areasOfExpertise: ['anxiety', 'depression'],
    assessmentTools: ['GAD-7', 'PHQ-9'],
    therapeuticApproachesUsedList: ['CBT', 'DBT'],
    languagesOffered: ['English', 'French'],
    providedOnlineTherapyBefore: true,
    comfortableUsingVideoConferencing: true,
    privateConfidentialSpace: true,
    compliesWithDataPrivacyAct: true,
    weeklyAvailability: '20 hours',
    preferredSessionLength: '50 minutes',
    accepts: ['individual', 'couples'],
    professionalLiabilityInsurance: 'yes',
    complaintsOrDisciplinaryActions: 'no',
    willingToAbideByPlatformGuidelines: true,
    hourlyRate: 120,
  };

  const mockFile = {
    originalname: 'license.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('fake file content'),
  } as Express.Multer.File;

  const mockFileRecord = {
    id: 'file-123',
    filename: 'license.pdf',
    displayName: 'license.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    storagePath: 'uploads/therapist-documents/123456-license.pdf',
    uploadedBy: 'user-123',
    status: FileStatus.UPLOADED,
    createdAt: new Date('2024-01-15T00:00:00Z'),
  };

  const mockFileAttachment = {
    id: 'attachment-123',
    fileId: 'file-123',
    entityType: AttachmentEntityType.THERAPIST_APPLICATION,
    entityId: 'user-123',
    purpose: AttachmentPurpose.LICENSE,
    createdAt: new Date('2024-01-15T00:00:00Z'),
    file: mockFileRecord,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      therapist: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      file: {
        create: jest.fn(),
      },
      fileAttachment: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockEmailService = {
      sendTherapistWelcomeEmail: jest.fn(),
      sendTherapistRejectionEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TherapistApplicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<TherapistApplicationService>(
      TherapistApplicationService,
    );
    prismaService = module.get(PrismaService);
    emailService = module.get(EmailService);

    // Mock fs operations
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApplication', () => {
    beforeEach(() => {
      prismaService.therapist.findUnique.mockResolvedValue(null);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.therapist.create.mockResolvedValue(
        mockTherapistApplication,
      );
    });

    it('should create application successfully for authenticated user', async () => {
      const result = await service.createApplication(mockApplicationDto);

      expect(prismaService.therapist.findUnique).toHaveBeenCalledWith({
        where: { userId: mockApplicationDto.userId },
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockApplicationDto.userId },
      });
      expect(prismaService.therapist.create).toHaveBeenCalled();
      expect(result).toEqual(mockTherapistApplication);
    });

    it('should create application for public user with temp ID', async () => {
      const publicApplicationDto = {
        ...mockApplicationDto,
        userId: 'temp_12345',
      };

      prismaService.therapist.findFirst.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);

      await service.createApplication(publicApplicationDto);

      expect(prismaService.therapist.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { user: { email: publicApplicationDto.email } },
            {
              userId: {
                contains: publicApplicationDto.email.replace('@', '_at_'),
              },
            },
          ],
        },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          id: publicApplicationDto.userId,
          email: publicApplicationDto.email,
          firstName: publicApplicationDto.firstName,
          lastName: publicApplicationDto.lastName,
          role: 'client',
          isActive: false,
        },
      });
    });

    it('should throw BadRequestException if user already has application', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );

      await expect(
        service.createApplication(mockApplicationDto),
      ).rejects.toThrow(
        new BadRequestException('User already has a therapist application'),
      );
    });

    it('should throw NotFoundException if authenticated user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createApplication(mockApplicationDto),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw BadRequestException if public user email already exists', async () => {
      const publicApplicationDto = {
        ...mockApplicationDto,
        userId: 'temp_12345',
      };

      prismaService.therapist.findFirst.mockResolvedValue(
        mockTherapistApplication,
      );

      await expect(
        service.createApplication(publicApplicationDto),
      ).rejects.toThrow(
        new BadRequestException(
          'An application with this email already exists',
        ),
      );
    });

    it('should handle missing optional fields', async () => {
      const minimalDto = {
        ...mockApplicationDto,
        hourlyRate: undefined,
        prcLicenseNumber: undefined,
        expirationDateOfLicense: undefined,
      };

      await service.createApplication(minimalDto);

      expect(prismaService.therapist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            hourlyRate: 0,
            prcLicenseNumber: '',
          }),
        }),
      );
    });

    it('should handle database errors during creation', async () => {
      prismaService.therapist.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.createApplication(mockApplicationDto),
      ).rejects.toThrow(
        new BadRequestException('Failed to create application'),
      );
    });

    it('should convert date strings to Date objects', async () => {
      await service.createApplication(mockApplicationDto);

      expect(prismaService.therapist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            practiceStartDate: expect.any(Date),
            expirationDateOfLicense: expect.any(Date),
          }),
        }),
      );
    });

    it('should set default expiration date if not provided', async () => {
      const applicationWithoutExpiration = {
        ...mockApplicationDto,
        expirationDateOfLicense: undefined,
      };

      await service.createApplication(applicationWithoutExpiration);

      expect(prismaService.therapist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expirationDateOfLicense: expect.any(Date),
          }),
        }),
      );
    });

    it('should convert boolean privateConfidentialSpace to string', async () => {
      await service.createApplication(mockApplicationDto);

      expect(prismaService.therapist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            privateConfidentialSpace: 'yes',
          }),
        }),
      );
    });

    it('should set default values for required fields', async () => {
      await service.createApplication(mockApplicationDto);

      expect(prismaService.therapist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'pending',
            licenseVerified: false,
            acceptsInsurance: false,
            acceptedInsuranceTypes: [],
            specialCertifications: [],
            illnessSpecializations: [],
            treatmentSuccessRates: {},
            preferredSessionLength: [30, 45, 60],
          }),
        }),
      );
    });
  });

  describe('getAllApplications', () => {
    const mockApplicationsList = [mockTherapistApplication];

    beforeEach(() => {
      prismaService.therapist.findMany.mockResolvedValue(mockApplicationsList);
      prismaService.therapist.count.mockResolvedValue(1);
      jest.spyOn(service, 'getApplicationFiles').mockResolvedValue([
        {
          id: 'file-123',
          fileName: 'license.pdf',
          fileUrl: '/api/files/serve/file-123',
          uploadedAt: '2024-01-15T00:00:00.000Z',
        },
      ]);
    });

    it('should get all applications with pagination', async () => {
      const options = { page: 1, limit: 10 };

      const result = await service.getAllApplications(options);

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith({
        where: {},
        include: { user: true },
        skip: 0,
        take: 10,
        orderBy: { submissionDate: 'desc' },
      });
      expect(prismaService.therapist.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        applications: expect.any(Array),
        totalCount: 1,
        page: 1,
        totalPages: 1,
      });
    });

    it('should filter applications by status', async () => {
      const options = { status: 'approved', page: 1, limit: 10 };

      await service.getAllApplications(options);

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith({
        where: { status: 'approved' },
        include: { user: true },
        skip: 0,
        take: 10,
        orderBy: { submissionDate: 'desc' },
      });
    });

    it('should calculate pagination correctly', async () => {
      prismaService.therapist.count.mockResolvedValue(25);
      const options = { page: 3, limit: 10 };

      const result = await service.getAllApplications(options);

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
      expect(result.totalPages).toBe(3);
    });

    it('should transform applications to response format', async () => {
      const options = { page: 1, limit: 10 };

      const result = await service.getAllApplications(options);

      expect(result.applications[0]).toEqual(
        expect.objectContaining({
          id: mockTherapistApplication.userId,
          status: mockTherapistApplication.status,
          submissionDate: expect.any(String),
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          files: expect.any(Array),
        }),
      );
    });

    it('should handle empty user names', async () => {
      const applicationWithNullNames = {
        ...mockTherapistApplication,
        user: { ...mockUser, firstName: null, lastName: null },
      };
      prismaService.therapist.findMany.mockResolvedValue([
        applicationWithNullNames,
      ]);

      const result = await service.getAllApplications({ page: 1, limit: 10 });

      expect(result.applications[0].firstName).toBe('');
      expect(result.applications[0].lastName).toBe('');
    });

    it('should convert boolean values to strings in response', async () => {
      const result = await service.getAllApplications({ page: 1, limit: 10 });

      expect(result.applications[0].providedOnlineTherapyBefore).toBe('yes');
      expect(result.applications[0].comfortableUsingVideoConferencing).toBe(
        'yes',
      );
    });

    it('should handle hourly rate conversion', async () => {
      const result = await service.getAllApplications({ page: 1, limit: 10 });

      expect(typeof result.applications[0].hourlyRate).toBe('number');
    });
  });

  describe('getApplicationById', () => {
    beforeEach(() => {
      jest.spyOn(service, 'getApplicationFiles').mockResolvedValue([]);
    });

    it('should get application by ID successfully', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );

      const result = await service.getApplicationById('user-123');

      expect(prismaService.therapist.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { user: true },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: mockUser.email,
        }),
      );
    });

    it('should return null if application not found', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(null);

      const result = await service.getApplicationById('nonexistent');

      expect(result).toBeNull();
    });

    it('should include application files', async () => {
      const mockFiles = [
        {
          id: 'file-123',
          fileName: 'license.pdf',
          fileUrl: '/api/files/serve/file-123',
          uploadedAt: '2024-01-15T00:00:00.000Z',
        },
      ];
      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      jest.spyOn(service, 'getApplicationFiles').mockResolvedValue(mockFiles);

      const result = await service.getApplicationById('user-123');

      expect(service.getApplicationFiles).toHaveBeenCalledWith('user-123');
      expect(result?.files).toEqual(mockFiles);
    });
  });

  describe('updateApplicationStatus', () => {
    beforeEach(() => {
      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.therapist.update.mockResolvedValue(
        mockTherapistApplication,
      );
      emailService.sendTherapistWelcomeEmail.mockResolvedValue(undefined);
      emailService.sendTherapistRejectionEmail.mockResolvedValue(undefined);
    });

    it('should update application status successfully', async () => {
      const updateData = { status: 'pending' as const };

      const result = await service.updateApplicationStatus(
        'user-123',
        updateData,
      );

      expect(prismaService.therapist.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: {
          status: 'pending',
          processingDate: expect.any(Date),
        },
      });
      expect(result).toEqual({
        success: true,
        message: 'Application pending successfully',
      });
    });

    it('should throw NotFoundException if application not found', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(null);

      await expect(
        service.updateApplicationStatus('nonexistent', { status: 'approved' }),
      ).rejects.toThrow(new NotFoundException('Application not found'));
    });

    it('should handle approval status with credentials generation', async () => {
      const updateData = { status: 'approved' as const };

      const result = await service.updateApplicationStatus(
        'user-123',
        updateData,
      );

      expect(result).toEqual({
        success: true,
        message:
          'Application approved successfully. Therapist account credentials generated.',
        credentials: {
          email: mockUser.email,
          password: expect.any(String),
        },
      });
      expect(emailService.sendTherapistWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        'John Doe',
        expect.objectContaining({
          email: mockUser.email,
          password: expect.any(String),
        }),
      );
    });

    it('should handle rejection status with admin notes', async () => {
      const updateData = {
        status: 'rejected' as const,
        adminNotes: 'Incomplete documentation',
      };

      const result = await service.updateApplicationStatus(
        'user-123',
        updateData,
      );

      expect(result.success).toBe(true);
      expect(emailService.sendTherapistRejectionEmail).toHaveBeenCalledWith(
        mockUser.email,
        'John Doe',
        'Incomplete documentation',
      );
    });

    it('should continue if email sending fails', async () => {
      emailService.sendTherapistWelcomeEmail.mockRejectedValue(
        new Error('Email error'),
      );
      const updateData = { status: 'approved' as const };

      const result = await service.updateApplicationStatus(
        'user-123',
        updateData,
      );

      expect(result.success).toBe(true);
    });

    it('should handle user with missing names', async () => {
      const applicationWithNullNames = {
        ...mockTherapistApplication,
        user: { ...mockUser, firstName: null, lastName: null },
      };
      prismaService.therapist.findUnique.mockResolvedValue(
        applicationWithNullNames,
      );

      const updateData = { status: 'approved' as const };

      await service.updateApplicationStatus('user-123', updateData);

      expect(emailService.sendTherapistWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        'Therapist',
        expect.any(Object),
      );
    });

    it('should handle database errors during update', async () => {
      prismaService.therapist.update.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.updateApplicationStatus('user-123', { status: 'approved' }),
      ).rejects.toThrow(
        new BadRequestException('Failed to update application status'),
      );
    });
  });

  describe('uploadDocuments', () => {
    beforeEach(() => {
      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.file.create.mockResolvedValue(mockFileRecord);
      prismaService.fileAttachment.create.mockResolvedValue(mockFileAttachment);
    });

    it('should upload documents successfully', async () => {
      const files = [mockFile];
      const fileTypeMap = { 'license.pdf': 'license' };

      const result = await service.uploadDocuments(
        'user-123',
        files,
        fileTypeMap,
      );

      expect(prismaService.therapist.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(prismaService.file.create).toHaveBeenCalledWith({
        data: {
          filename: mockFile.originalname,
          displayName: mockFile.originalname,
          mimeType: mockFile.mimetype,
          size: mockFile.size,
          storagePath: expect.stringContaining('uploads/therapist-documents/'),
          uploadedBy: 'user-123',
          status: FileStatus.UPLOADED,
        },
      });
      expect(result).toEqual([
        {
          id: mockFileRecord.id,
          fileName: mockFile.originalname,
          url: `/api/files/serve/${mockFileRecord.id}`,
        },
      ]);
    });

    it('should throw NotFoundException if application not found', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(null);

      await expect(
        service.uploadDocuments('nonexistent', [mockFile]),
      ).rejects.toThrow(
        new NotFoundException('Therapist application not found'),
      );
    });

    it('should create uploads directory if it does not exist', async () => {
      await service.uploadDocuments('user-123', [mockFile]);

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('uploads/therapist-documents'),
        { recursive: true },
      );
    });

    it('should map file types to attachment purposes', async () => {
      const fileTypeMap = { 'license.pdf': 'license' };

      await service.uploadDocuments('user-123', [mockFile], fileTypeMap);

      expect(prismaService.fileAttachment.create).toHaveBeenCalledWith({
        data: {
          fileId: mockFileRecord.id,
          entityType: AttachmentEntityType.THERAPIST_APPLICATION,
          entityId: 'user-123',
          purpose: AttachmentPurpose.LICENSE,
        },
      });
    });

    it('should continue uploading other files if one fails', async () => {
      const files = [
        mockFile,
        { ...mockFile, originalname: 'certificate.pdf' },
      ];
      prismaService.file.create
        .mockRejectedValueOnce(new Error('File error'))
        .mockResolvedValueOnce(mockFileRecord);

      const result = await service.uploadDocuments('user-123', files);

      expect(result).toHaveLength(1);
      expect(prismaService.file.create).toHaveBeenCalledTimes(2);
    });

    it('should handle default file type mapping', async () => {
      await service.uploadDocuments('user-123', [mockFile]);

      expect(prismaService.fileAttachment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          purpose: AttachmentPurpose.DOCUMENT, // Default purpose
        }),
      });
    });
  });

  describe('getApplicationFiles', () => {
    beforeEach(() => {
      prismaService.fileAttachment.findMany.mockResolvedValue([
        mockFileAttachment,
      ]);
    });

    it('should get application files successfully', async () => {
      const result = await service.getApplicationFiles('user-123');

      expect(prismaService.fileAttachment.findMany).toHaveBeenCalledWith({
        where: {
          entityType: AttachmentEntityType.THERAPIST_APPLICATION,
          entityId: 'user-123',
        },
        include: { file: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([
        {
          id: mockFileRecord.id,
          fileName: mockFileRecord.filename,
          fileUrl: `/api/files/serve/${mockFileRecord.id}`,
          uploadedAt: mockFileRecord.createdAt.toISOString(),
        },
      ]);
    });

    it('should return empty array if no files found', async () => {
      prismaService.fileAttachment.findMany.mockResolvedValue([]);

      const result = await service.getApplicationFiles('user-123');

      expect(result).toEqual([]);
    });

    it('should order files by creation date descending', async () => {
      await service.getApplicationFiles('user-123');

      expect(prismaService.fileAttachment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('createApplicationWithDocuments', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation((callback) =>
        callback(prismaService),
      );
      prismaService.therapist.findUnique.mockResolvedValue(null);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.therapist.create.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.file.create.mockResolvedValue(mockFileRecord);
      prismaService.fileAttachment.create.mockResolvedValue(mockFileAttachment);
    });

    it('should create application with documents in transaction', async () => {
      const files = [mockFile];
      const fileTypeMap = { 'license.pdf': 'license' };

      const result = await service.createApplicationWithDocuments(
        mockApplicationDto,
        files,
        fileTypeMap,
      );

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        application: mockTherapistApplication,
        uploadedFiles: [
          {
            id: mockFileRecord.id,
            fileName: mockFile.originalname,
            url: `/api/files/serve/${mockFileRecord.id}`,
          },
        ],
      });
    });

    it('should create application without files', async () => {
      const result = await service.createApplicationWithDocuments(
        mockApplicationDto,
        [],
      );

      expect(result).toEqual({
        application: mockTherapistApplication,
        uploadedFiles: [],
      });
    });

    it('should handle file upload errors in transaction', async () => {
      const files = [mockFile];
      prismaService.file.create.mockRejectedValue(
        new Error('File upload error'),
      );

      await expect(
        service.createApplicationWithDocuments(mockApplicationDto, files),
      ).rejects.toThrow(
        new BadRequestException('Failed to upload file: license.pdf'),
      );
    });

    it('should validate application data before creating user', async () => {
      const publicApplicationDto = {
        ...mockApplicationDto,
        userId: 'temp_12345',
      };

      prismaService.therapist.findFirst.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);

      await service.createApplicationWithDocuments(publicApplicationDto, []);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          id: publicApplicationDto.userId,
          email: publicApplicationDto.email,
          firstName: publicApplicationDto.firstName,
          lastName: publicApplicationDto.lastName,
          role: 'client',
          isActive: false,
        },
      });
    });

    it('should rollback transaction if application creation fails', async () => {
      prismaService.therapist.create.mockRejectedValue(
        new Error('Application error'),
      );

      await expect(
        service.createApplicationWithDocuments(mockApplicationDto, []),
      ).rejects.toThrow('Application error');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle malformed application data', async () => {
      const malformedData = {
        ...mockApplicationDto,
        practiceStartDate: 'invalid-date',
        hourlyRate: 'not-a-number',
      } as any;

      prismaService.therapist.findUnique.mockResolvedValue(null);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.therapist.create.mockRejectedValue(
        new Error('Invalid date format'),
      );

      // The service should catch database errors and throw BadRequestException
      await expect(service.createApplication(malformedData)).rejects.toThrow(
        new BadRequestException('Failed to create application'),
      );
    });

    it('should handle email service failures gracefully', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.therapist.update.mockResolvedValue(
        mockTherapistApplication,
      );
      emailService.sendTherapistWelcomeEmail.mockRejectedValue(
        new Error('SMTP error'),
      );

      const result = await service.updateApplicationStatus('user-123', {
        status: 'approved',
      });

      expect(result.success).toBe(true);
    });

    it('should handle concurrent application submissions', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(null);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.therapist.create
        .mockResolvedValueOnce(mockTherapistApplication)
        .mockRejectedValueOnce(new Error('Unique constraint violation'));

      const promises = [
        service.createApplication(mockApplicationDto),
        service.createApplication(mockApplicationDto),
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });

    it('should handle file system errors during document upload', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Disk full');
      });

      const result = await service.uploadDocuments('user-123', [mockFile]);

      expect(result).toEqual([]);
    });

    it('should handle missing file extensions', async () => {
      const fileWithoutExtension = {
        ...mockFile,
        originalname: 'document',
      };

      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.file.create.mockResolvedValue(mockFileRecord);

      const result = await service.uploadDocuments('user-123', [
        fileWithoutExtension,
      ]);

      expect(result).toHaveLength(1);
    });

    it('should handle very large file uploads', async () => {
      const largeFile = {
        ...mockFile,
        size: 100 * 1024 * 1024, // 100MB
      };

      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.file.create.mockResolvedValue({
        ...mockFileRecord,
        size: largeFile.size,
      });

      const result = await service.uploadDocuments('user-123', [largeFile]);

      expect(result).toHaveLength(1);
    });
  });

  describe('Performance and scaling', () => {
    it('should handle bulk document uploads efficiently', async () => {
      const manyFiles = Array(20)
        .fill(mockFile)
        .map((file, i) => ({
          ...file,
          originalname: `document-${i}.pdf`,
        }));

      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.file.create.mockResolvedValue(mockFileRecord);
      prismaService.fileAttachment.create.mockResolvedValue(mockFileAttachment);

      const result = await service.uploadDocuments('user-123', manyFiles);

      expect(result).toHaveLength(20);
      expect(prismaService.file.create).toHaveBeenCalledTimes(20);
    });

    it('should handle pagination for large application lists', async () => {
      const manyApplications = Array(100).fill(mockTherapistApplication);
      prismaService.therapist.findMany.mockResolvedValue(manyApplications);
      prismaService.therapist.count.mockResolvedValue(100);
      jest.spyOn(service, 'getApplicationFiles').mockResolvedValue([]);

      const result = await service.getAllApplications({ page: 1, limit: 50 });

      expect(result.applications).toHaveLength(100);
      expect(result.totalPages).toBe(2);
    });

    it('should handle concurrent status updates', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.therapist.update.mockResolvedValue(
        mockTherapistApplication,
      );

      const promises = Array(5)
        .fill(null)
        .map(() =>
          service.updateApplicationStatus('user-123', { status: 'pending' }),
        );

      const results = await Promise.allSettled(promises);

      expect(results.every((result) => result.status === 'fulfilled')).toBe(
        true,
      );
    });
  });

  describe('Business logic validation', () => {
    it('should generate secure temporary passwords', async () => {
      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.therapist.update.mockResolvedValue(
        mockTherapistApplication,
      );

      const result = await service.updateApplicationStatus('user-123', {
        status: 'approved',
      });

      expect(result.credentials?.password).toHaveLength(12);
      expect(result.credentials?.password).toMatch(/[A-Za-z0-9@#$%]/);
    });

    it('should map file types to appropriate purposes', async () => {
      const testCases = [
        { fileType: 'license', expected: AttachmentPurpose.LICENSE },
        { fileType: 'certificate', expected: AttachmentPurpose.CERTIFICATE },
        { fileType: 'resume', expected: AttachmentPurpose.DOCUMENT },
        { fileType: 'unknown', expected: AttachmentPurpose.DOCUMENT },
      ];

      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.file.create.mockResolvedValue(mockFileRecord);

      for (const testCase of testCases) {
        const fileTypeMap = { [mockFile.originalname]: testCase.fileType };

        await service.uploadDocuments('user-123', [mockFile], fileTypeMap);

        expect(prismaService.fileAttachment.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            purpose: testCase.expected,
          }),
        });

        jest.clearAllMocks();
        prismaService.therapist.findUnique.mockResolvedValue(
          mockTherapistApplication,
        );
        prismaService.file.create.mockResolvedValue(mockFileRecord);
      }
    });

    it('should validate public application email patterns', async () => {
      const publicApplicationDto = {
        ...mockApplicationDto,
        userId: 'temp_test_example.com',
        email: 'test@example.com',
      };

      prismaService.therapist.findFirst.mockResolvedValue(null);

      await service.createApplication(publicApplicationDto);

      expect(prismaService.therapist.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { user: { email: 'test@example.com' } },
            { userId: { contains: 'test_at_example.com' } },
          ],
        },
      });
    });

    it('should handle application status transitions correctly', async () => {
      const statuses = ['pending', 'approved', 'rejected'] as const;

      prismaService.therapist.findUnique.mockResolvedValue(
        mockTherapistApplication,
      );
      prismaService.therapist.update.mockResolvedValue(
        mockTherapistApplication,
      );

      for (const status of statuses) {
        const result = await service.updateApplicationStatus('user-123', {
          status,
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain(status);
      }
    });
  });
});
