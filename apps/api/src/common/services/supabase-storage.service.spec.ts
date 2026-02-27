import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseStorageService } from './supabase-storage.service';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase SDK
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock uuid
jest.mock('uuid');
const mockedUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  let configService: jest.Mocked<ConfigService>;
  let loggerSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  // Supabase Client Mocks
  let mockSupabaseClient: any;
  let mockStorageFrom: any;
  let mockUpload: any;
  let mockRemove: any;
  let mockGetPublicUrl: any;

  // Test data constants
  const mockSupabaseUrl = 'https://test-project.supabase.co';
  const mockSupabaseApiKey = 'test-api-key-123';
  const mockBucket = 'test-bucket';
  const mockFilename = 'test-file.jpg';
  const mockUniqueFilename = 'unique-id-123.jpg';

  const createMockFile = (
    originalname: string = 'test-file.jpg',
    buffer: Buffer = Buffer.from('test file content'),
    mimetype: string = 'image/jpeg',
    size: number = 1024,
  ): Express.Multer.File => ({
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    mimetype,
    buffer,
    size,
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  } as any);

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup Supabase Client Mocks
    mockUpload = jest.fn().mockResolvedValue({ data: {}, error: null });
    mockRemove = jest.fn().mockResolvedValue({ data: {}, error: null });
    mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: `${mockSupabaseUrl}/storage/v1/object/public/${mockBucket}/${mockUniqueFilename}` },
    });

    mockStorageFrom = {
      upload: mockUpload,
      remove: mockRemove,
      getPublicUrl: mockGetPublicUrl,
    };

    mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue(mockStorageFrom),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseStorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    configService = module.get(ConfigService);
    
    // Setup default config values
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'SUPABASE_URL':
          return mockSupabaseUrl;
        case 'SUPABASE_API_KEY':
          return mockSupabaseApiKey;
        default:
          return null;
      }
    });

    service = module.get<SupabaseStorageService>(SupabaseStorageService);

    // Setup logger spies
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Setup UUID mock
    mockedUuidv4.mockReturnValue('unique-id-123');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', () => {
      expect(service).toBeDefined();
      expect(createClient).toHaveBeenCalledWith(mockSupabaseUrl, mockSupabaseApiKey);
    });

    it('should throw error when configuration is missing', () => {
      configService.get.mockReturnValue(null);
      expect(() => new SupabaseStorageService(configService)).toThrow(
        'Supabase configuration is missing',
      );
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockFile = createMockFile();
      
      const result = await service.uploadFile(mockFile, mockBucket);

      expect(result).toEqual({
        filename: mockUniqueFilename,
        url: `${mockSupabaseUrl}/storage/v1/object/public/${mockBucket}/${mockUniqueFilename}`,
        bucket: mockBucket,
      });

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(mockBucket);
      expect(mockUpload).toHaveBeenCalledWith(
        mockUniqueFilename,
        mockFile.buffer,
        { contentType: mockFile.mimetype, upsert: false }
      );
    });

    it('should handle upload error from Supabase SDK', async () => {
      const mockError = { message: 'Supabase error' };
      mockUpload.mockResolvedValueOnce({ data: null, error: mockError });

      const mockFile = createMockFile();
      await expect(service.uploadFile(mockFile, mockBucket)).rejects.toThrow(
        'Failed to upload file to Supabase: Supabase error',
      );
    });

    it('should catch and rethrow general errors', async () => {
      mockUpload.mockRejectedValueOnce(new Error('Network error'));

      const mockFile = createMockFile();
      await expect(service.uploadFile(mockFile, mockBucket)).rejects.toThrow(
        'Failed to upload file to Supabase: Network error',
      );
    });
  });

  describe('uploadFiles', () => {
    it('should upload multiple files successfully', async () => {
      const mockFiles = [
        createMockFile('file1.jpg'),
        createMockFile('file2.png'),
      ];

      mockedUuidv4
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2');
      
      mockGetPublicUrl
        .mockReturnValueOnce({ data: { publicUrl: 'url-1' } })
        .mockReturnValueOnce({ data: { publicUrl: 'url-2' } });

      const results = await service.uploadFiles(mockFiles, mockBucket);

      expect(results).toHaveLength(2);
      expect(mockUpload).toHaveBeenCalledTimes(2);
    });

    it('should return empty array for empty inputs', async () => {
      expect(await service.uploadFiles([], mockBucket)).toEqual([]);
      expect(await service.uploadFiles(null as any, mockBucket)).toEqual([]);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      await service.deleteFile(mockBucket, mockFilename);

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(mockBucket);
      expect(mockRemove).toHaveBeenCalledWith([mockFilename]);
      expect(loggerSpy).toHaveBeenCalledWith(
        `File deleted successfully from Supabase: ${mockFilename}`,
      );
    });

    it('should handle deletion error from Supabase SDK', async () => {
      const mockError = { message: 'Delete error' };
      mockRemove.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(service.deleteFile(mockBucket, mockFilename)).rejects.toThrow(
        'Failed to delete file from Supabase: Delete error',
      );
    });
  });

  describe('validateFile', () => {
    it('should validate valid file', () => {
      const mockFile = createMockFile();
      expect(service.validateFile(mockFile)).toEqual({ isValid: true });
    });

    it('should reject file exceeding size limit', () => {
      const mockFile = createMockFile('large.jpg', Buffer.alloc(11 * 1024 * 1024), 'image/jpeg', 11 * 1024 * 1024);
      expect(service.validateFile(mockFile)).toEqual({
        isValid: false,
        error: 'File size exceeds 10MB limit',
      });
    });

    it('should reject file with disallowed MIME type', () => {
      const mockFile = createMockFile('virus.exe', Buffer.from('content'), 'application/x-msdownload');
      const result = service.validateFile(mockFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('is not allowed');
    });

    it('should reject filename with invalid characters', () => {
      const invalidFilenames = ['file/slash.jpg', 'file:colon.jpg', 'file<script>.jpg'];
      invalidFilenames.forEach(filename => {
        const mockFile = createMockFile(filename);
        expect(service.validateFile(mockFile).isValid).toBe(false);
      });
    });
  });

  describe('getSupportedBuckets', () => {
    it('should return correct bucket configuration', () => {
      expect(SupabaseStorageService.getSupportedBuckets()).toEqual({
        USER_PROFILES: 'user-profiles',
        POST_ATTACHMENTS: 'post-attachments',
        MESSAGES: 'messages',
        DOCUMENTS: 'documents',
        WORKSHEETS: 'worksheets',
      });
    });
  });
});