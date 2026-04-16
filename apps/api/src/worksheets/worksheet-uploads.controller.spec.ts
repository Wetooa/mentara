/**
 * Comprehensive Test Suite for WorksheetUploadsController
 * Tests file upload functionality for worksheet materials and submissions
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpException } from '@nestjs/common';
import { WorksheetUploadsController } from './worksheet-uploads.controller';
import { PrismaService } from '../providers/prisma-client.provider';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('WorksheetUploadsController', () => {
  let controller: WorksheetUploadsController;
  let prismaService: PrismaService;
  let supabaseStorageService: SupabaseStorageService;
  let module: TestingModule;

  // Mock PrismaService
  const mockPrismaService = {
    worksheet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  // Mock SupabaseStorageService
  const mockSupabaseStorageService = {
    validateFile: jest.fn(),
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileUrl: jest.fn(),
  };

  // Mock static method
  const mockGetSupportedBuckets = jest.fn().mockReturnValue({
    WORKSHEETS: 'worksheets',
    MATERIALS: 'materials',
    SUBMISSIONS: 'submissions',
  });

  // Test data
  const mockWorksheet = {
    id: 'worksheet_123456789',
    title: 'Anxiety Management Worksheet',
    description: 'Weekly exercises for managing anxiety',
    content: 'Complete the following exercises...',
    status: 'assigned',
    clientId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    materialUrls: [],
    materialNames: [],
    materialSizes: [],
    submissionUrls: [],
    submissionNames: [],
    submissionSizes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFile = {
    fieldname: 'file',
    originalname: 'worksheet-material.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('fake pdf content'),
    size: 1024000,
  } as Express.Multer.File;

  const mockUploadResult = {
    filename: 'unique-filename-123.pdf',
    url: 'https://storage.example.com/worksheets/unique-filename-123.pdf',
    size: 1024000,
    contentType: 'application/pdf',
  };

  const mockValidation = {
    isValid: true,
    error: null,
  };

  beforeEach(async () => {
    // Mock the static method
    jest.spyOn(SupabaseStorageService, 'getSupportedBuckets').mockImplementation(
      mockGetSupportedBuckets
    );

    module = await Test.createTestingModule({
      controllers: [WorksheetUploadsController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockSupabaseStorageService,
        },
      ],
    }).compile();

    controller = module.get<WorksheetUploadsController>(WorksheetUploadsController);
    prismaService = module.get<PrismaService>(PrismaService);
    supabaseStorageService = module.get<SupabaseStorageService>(SupabaseStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all services injected', () => {
      expect(prismaService).toBeDefined();
      expect(supabaseStorageService).toBeDefined();
    });
  });

  describe('POST /worksheets/upload', () => {
    beforeEach(() => {
      mockPrismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);
      mockSupabaseStorageService.validateFile.mockReturnValue(mockValidation);
      mockSupabaseStorageService.uploadFile.mockResolvedValue(mockUploadResult);
      mockPrismaService.worksheet.update.mockResolvedValue({
        ...mockWorksheet,
        materialUrls: [mockUploadResult.url],
        materialNames: [mockFile.originalname],
        materialSizes: [mockFile.size],
      });
    });

    describe('Material Upload', () => {
      it('should upload material file successfully', async () => {
        const result = await controller.uploadFile(
          mockFile,
          'worksheet_123456789',
          'material'
        );

        expect(result).toEqual({
          id: mockUploadResult.filename,
          filename: mockFile.originalname,
          url: mockUploadResult.url,
          fileSize: mockFile.size,
          fileType: mockFile.mimetype,
        });

        expect(prismaService.worksheet.findUnique).toHaveBeenCalledWith({
          where: { id: 'worksheet_123456789' },
        });

        expect(supabaseStorageService.validateFile).toHaveBeenCalledWith(
          mockFile,
          5 * 1024 * 1024,
          [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png',
          ]
        );

        expect(supabaseStorageService.uploadFile).toHaveBeenCalledWith(
          mockFile,
          'worksheets'
        );

        expect(prismaService.worksheet.update).toHaveBeenCalledWith({
          where: { id: 'worksheet_123456789' },
          data: {
            materialUrls: { push: mockUploadResult.url },
            materialNames: { push: mockFile.originalname },
            materialSizes: { push: mockFile.size },
          },
        });
      });

      it('should handle PDF file upload', async () => {
        const pdfFile = {
          ...mockFile,
          originalname: 'guide.pdf',
          mimetype: 'application/pdf',
        };

        const result = await controller.uploadFile(
          pdfFile,
          'worksheet_123456789',
          'material'
        );

        expect(result.filename).toBe('guide.pdf');
        expect(result.fileType).toBe('application/pdf');
      });

      it('should handle DOCX file upload', async () => {
        const docxFile = {
          ...mockFile,
          originalname: 'template.docx',
          mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };

        const result = await controller.uploadFile(
          docxFile,
          'worksheet_123456789',
          'material'
        );

        expect(result.filename).toBe('template.docx');
        expect(result.fileType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      });

      it('should handle image file upload', async () => {
        const imageFile = {
          ...mockFile,
          originalname: 'diagram.png',
          mimetype: 'image/png',
        };

        const result = await controller.uploadFile(
          imageFile,
          'worksheet_123456789',
          'material'
        );

        expect(result.filename).toBe('diagram.png');
        expect(result.fileType).toBe('image/png');
      });
    });

    describe('Submission Upload', () => {
      it('should upload submission file successfully', async () => {
        const submissionUpdate = {
          ...mockWorksheet,
          submissionUrls: [mockUploadResult.url],
          submissionNames: [mockFile.originalname],
          submissionSizes: [mockFile.size],
        };
        mockPrismaService.worksheet.update.mockResolvedValue(submissionUpdate);

        const result = await controller.uploadFile(
          mockFile,
          'worksheet_123456789',
          'submission'
        );

        expect(result).toEqual({
          id: mockUploadResult.filename,
          filename: mockFile.originalname,
          url: mockUploadResult.url,
          fileSize: mockFile.size,
          fileType: mockFile.mimetype,
        });

        expect(prismaService.worksheet.update).toHaveBeenCalledWith({
          where: { id: 'worksheet_123456789' },
          data: {
            submissionUrls: { push: mockUploadResult.url },
            submissionNames: { push: mockFile.originalname },
            submissionSizes: { push: mockFile.size },
          },
        });
      });

      it('should handle text file submissions', async () => {
        const textFile = {
          ...mockFile,
          originalname: 'notes.txt',
          mimetype: 'text/plain',
        };

        const result = await controller.uploadFile(
          textFile,
          'worksheet_123456789',
          'submission'
        );

        expect(result.filename).toBe('notes.txt');
        expect(result.fileType).toBe('text/plain');
      });
    });

    describe('Input Validation', () => {
      it('should throw error when no file is uploaded', async () => {
        await expect(
          controller.uploadFile(null as any, 'worksheet_123456789', 'material')
        ).rejects.toThrow(new BadRequestException('No file uploaded'));
      });

      it('should throw error when worksheetId is missing', async () => {
        await expect(
          controller.uploadFile(mockFile, '', 'material')
        ).rejects.toThrow(new BadRequestException('Worksheet ID is required'));

        await expect(
          controller.uploadFile(mockFile, null as any, 'material')
        ).rejects.toThrow(new BadRequestException('Worksheet ID is required'));
      });

      it('should throw error when type is missing', async () => {
        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', '' as any)
        ).rejects.toThrow(new BadRequestException('Type must be either "material" or "submission"'));

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', null as any)
        ).rejects.toThrow(new BadRequestException('Type must be either "material" or "submission"'));
      });

      it('should throw error when type is invalid', async () => {
        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'invalid' as any)
        ).rejects.toThrow(new BadRequestException('Type must be either "material" or "submission"'));
      });
    });

    describe('Worksheet Validation', () => {
      it('should throw error when worksheet does not exist', async () => {
        mockPrismaService.worksheet.findUnique.mockResolvedValue(null);

        await expect(
          controller.uploadFile(mockFile, 'nonexistent-worksheet', 'material')
        ).rejects.toThrow(new BadRequestException('Worksheet with ID nonexistent-worksheet not found'));
      });

      it('should handle database errors during worksheet lookup', async () => {
        const dbError = new Error('Database connection failed');
        mockPrismaService.worksheet.findUnique.mockRejectedValue(dbError);

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(HttpException);
      });
    });

    describe('File Validation', () => {
      it('should reject files that fail validation', async () => {
        const invalidValidation = {
          isValid: false,
          error: 'File size exceeds limit',
        };
        mockSupabaseStorageService.validateFile.mockReturnValue(invalidValidation);

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(new BadRequestException('File validation failed: File size exceeds limit'));
      });

      it('should reject unsupported file types', async () => {
        const unsupportedValidation = {
          isValid: false,
          error: 'Unsupported file type',
        };
        mockSupabaseStorageService.validateFile.mockReturnValue(unsupportedValidation);

        const unsupportedFile = {
          ...mockFile,
          originalname: 'malware.exe',
          mimetype: 'application/x-executable',
        };

        await expect(
          controller.uploadFile(unsupportedFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(new BadRequestException('File validation failed: Unsupported file type'));
      });

      it('should reject files that are too large', async () => {
        const oversizedValidation = {
          isValid: false,
          error: 'File size exceeds 5MB limit',
        };
        mockSupabaseStorageService.validateFile.mockReturnValue(oversizedValidation);

        const largeFile = {
          ...mockFile,
          size: 10 * 1024 * 1024, // 10MB
        };

        await expect(
          controller.uploadFile(largeFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(new BadRequestException('File validation failed: File size exceeds 5MB limit'));
      });

      it('should validate against correct mime types', async () => {
        await controller.uploadFile(mockFile, 'worksheet_123456789', 'material');

        expect(supabaseStorageService.validateFile).toHaveBeenCalledWith(
          mockFile,
          5 * 1024 * 1024, // 5MB limit
          [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png',
          ]
        );
      });
    });

    describe('Storage Upload', () => {
      it('should handle storage upload errors', async () => {
        const uploadError = new Error('Storage service unavailable');
        mockSupabaseStorageService.uploadFile.mockRejectedValue(uploadError);

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(HttpException);
      });

      it('should upload to correct bucket', async () => {
        await controller.uploadFile(mockFile, 'worksheet_123456789', 'material');

        expect(supabaseStorageService.uploadFile).toHaveBeenCalledWith(
          mockFile,
          'worksheets'
        );
      });

      it('should handle storage bucket configuration errors', async () => {
        mockGetSupportedBuckets.mockReturnValue({});

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(HttpException);
      });
    });

    describe('Database Updates', () => {
      it('should handle database update errors for materials', async () => {
        const updateError = new Error('Database update failed');
        mockPrismaService.worksheet.update.mockRejectedValue(updateError);

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(HttpException);
      });

      it('should handle database update errors for submissions', async () => {
        const updateError = new Error('Database update failed');
        mockPrismaService.worksheet.update.mockRejectedValue(updateError);

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'submission')
        ).rejects.toThrow(HttpException);
      });

      it('should update material arrays correctly', async () => {
        await controller.uploadFile(mockFile, 'worksheet_123456789', 'material');

        expect(prismaService.worksheet.update).toHaveBeenCalledWith({
          where: { id: 'worksheet_123456789' },
          data: {
            materialUrls: { push: mockUploadResult.url },
            materialNames: { push: mockFile.originalname },
            materialSizes: { push: mockFile.size },
          },
        });
      });

      it('should update submission arrays correctly', async () => {
        await controller.uploadFile(mockFile, 'worksheet_123456789', 'submission');

        expect(prismaService.worksheet.update).toHaveBeenCalledWith({
          where: { id: 'worksheet_123456789' },
          data: {
            submissionUrls: { push: mockUploadResult.url },
            submissionNames: { push: mockFile.originalname },
            submissionSizes: { push: mockFile.size },
          },
        });
      });
    });

    describe('Response Format', () => {
      it('should return properly formatted response', async () => {
        const result = await controller.uploadFile(
          mockFile,
          'worksheet_123456789',
          'material'
        );

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('filename');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('fileSize');
        expect(result).toHaveProperty('fileType');

        expect(result.id).toBe(mockUploadResult.filename);
        expect(result.filename).toBe(mockFile.originalname);
        expect(result.url).toBe(mockUploadResult.url);
        expect(result.fileSize).toBe(mockFile.size);
        expect(result.fileType).toBe(mockFile.mimetype);
      });

      it('should maintain filename integrity', async () => {
        const specialFile = {
          ...mockFile,
          originalname: 'special-chars-file_name (1).pdf',
        };

        const result = await controller.uploadFile(
          specialFile,
          'worksheet_123456789',
          'material'
        );

        expect(result.filename).toBe('special-chars-file_name (1).pdf');
      });

      it('should handle unicode filenames', async () => {
        const unicodeFile = {
          ...mockFile,
          originalname: 'مستند-عربي.pdf',
        };

        const result = await controller.uploadFile(
          unicodeFile,
          'worksheet_123456789',
          'material'
        );

        expect(result.filename).toBe('مستند-عربي.pdf');
      });
    });

    describe('Error Handling', () => {
      it('should preserve BadRequestException errors', async () => {
        const badRequestError = new BadRequestException('Custom validation error');
        mockSupabaseStorageService.validateFile.mockImplementation(() => {
          throw badRequestError;
        });

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(badRequestError);
      });

      it('should wrap other errors in HttpException', async () => {
        const genericError = new Error('Unexpected error');
        mockSupabaseStorageService.uploadFile.mockRejectedValue(genericError);

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(HttpException);

        try {
          await controller.uploadFile(mockFile, 'worksheet_123456789', 'material');
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toContain('Failed to upload file: Unexpected error');
        }
      });

      it('should handle errors without error message', async () => {
        const nonErrorObject = 'string error';
        mockSupabaseStorageService.uploadFile.mockRejectedValue(nonErrorObject);

        await expect(
          controller.uploadFile(mockFile, 'worksheet_123456789', 'material')
        ).rejects.toThrow(HttpException);

        try {
          await controller.uploadFile(mockFile, 'worksheet_123456789', 'material');
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toContain('Failed to upload file: Unknown error');
        }
      });
    });

    describe('Multiple File Types', () => {
      const fileTypes = [
        {
          name: 'PDF document',
          file: { ...mockFile, originalname: 'document.pdf', mimetype: 'application/pdf' },
        },
        {
          name: 'Word document',
          file: { ...mockFile, originalname: 'document.docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        },
        {
          name: 'Text file',
          file: { ...mockFile, originalname: 'notes.txt', mimetype: 'text/plain' },
        },
        {
          name: 'JPEG image',
          file: { ...mockFile, originalname: 'image.jpg', mimetype: 'image/jpeg' },
        },
        {
          name: 'PNG image',
          file: { ...mockFile, originalname: 'diagram.png', mimetype: 'image/png' },
        },
      ];

      fileTypes.forEach(({ name, file }) => {
        it(`should handle ${name} upload correctly`, async () => {
          const result = await controller.uploadFile(
            file,
            'worksheet_123456789',
            'material'
          );

          expect(result.filename).toBe(file.originalname);
          expect(result.fileType).toBe(file.mimetype);
        });
      });
    });

    describe('Integration Scenarios', () => {
      it('should handle complete upload workflow', async () => {
        const result = await controller.uploadFile(
          mockFile,
          'worksheet_123456789',
          'material'
        );

        // Verify the complete flow
        expect(prismaService.worksheet.findUnique).toHaveBeenCalledTimes(1);
        expect(supabaseStorageService.validateFile).toHaveBeenCalledTimes(1);
        expect(supabaseStorageService.uploadFile).toHaveBeenCalledTimes(1);
        expect(prismaService.worksheet.update).toHaveBeenCalledTimes(1);

        // Verify result format
        expect(result).toEqual({
          id: mockUploadResult.filename,
          filename: mockFile.originalname,
          url: mockUploadResult.url,
          fileSize: mockFile.size,
          fileType: mockFile.mimetype,
        });
      });

      it('should handle concurrent uploads gracefully', async () => {
        const promises = Array(3).fill(null).map(() =>
          controller.uploadFile(mockFile, 'worksheet_123456789', 'material')
        );

        const results = await Promise.all(promises);

        expect(results).toHaveLength(3);
        results.forEach(result => {
          expect(result.filename).toBe(mockFile.originalname);
        });
      });
    });
  });
});