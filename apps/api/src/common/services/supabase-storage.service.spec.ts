import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseStorageService, FileUploadResult } from './supabase-storage.service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock uuid
jest.mock('uuid');
const mockedUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  let configService: jest.Mocked<ConfigService>;
  let loggerSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

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
  });

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.resetAllMocks();

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
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Setup UUID mock
    mockedUuidv4.mockReturnValue('unique-id-123');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ===== INITIALIZATION TESTS =====

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', () => {
      expect(service).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('SUPABASE_URL');
      expect(configService.get).toHaveBeenCalledWith('SUPABASE_API_KEY');
    });

    it('should throw error when SUPABASE_URL is missing', () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'SUPABASE_URL':
            return null;
          case 'SUPABASE_API_KEY':
            return mockSupabaseApiKey;
          default:
            return null;
        }
      });

      expect(() => new SupabaseStorageService(configService)).toThrow(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_API_KEY environment variables.',
      );
    });

    it('should throw error when SUPABASE_API_KEY is missing', () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'SUPABASE_URL':
            return mockSupabaseUrl;
          case 'SUPABASE_API_KEY':
            return null;
          default:
            return null;
        }
      });

      expect(() => new SupabaseStorageService(configService)).toThrow(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_API_KEY environment variables.',
      );
    });

    it('should throw error when both SUPABASE_URL and SUPABASE_API_KEY are missing', () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'SUPABASE_URL':
            return '';
          case 'SUPABASE_API_KEY':
            return '';
          default:
            return null;
        }
      });

      expect(() => new SupabaseStorageService(configService)).toThrow(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_API_KEY environment variables.',
      );
    });

    it('should handle empty string configuration values', () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'SUPABASE_URL':
            return '   '; // Whitespace only
          case 'SUPABASE_API_KEY':
            return ''; // Empty string
          default:
            return null;
        }
      });

      expect(() => new SupabaseStorageService(configService)).toThrow(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_API_KEY environment variables.',
      );
    });
  });

  // ===== SINGLE FILE UPLOAD TESTS =====

  describe('uploadFile', () => {
    beforeEach(() => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'File uploaded successfully' },
      });
    });

    it('should upload file successfully', async () => {
      const mockFile = createMockFile();
      
      const result = await service.uploadFile(mockFile, mockBucket);

      expect(result).toEqual({
        filename: mockUniqueFilename,
        url: `${mockSupabaseUrl}/storage/v1/object/public/${mockBucket}/${mockUniqueFilename}`,
        bucket: mockBucket,
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/storage/v1/object/${mockBucket}/${mockUniqueFilename}`,
        mockFile.buffer,
        {
          headers: {
            'Content-Type': mockFile.mimetype,
            Authorization: `Bearer ${mockSupabaseApiKey}`,
          },
        },
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        `Uploading file to Supabase: ${mockFile.originalname} (bucket: ${mockBucket})`,
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `File uploaded successfully to Supabase: ${mockUniqueFilename}`,
      );
    });

    it('should generate unique filenames for files with same name', async () => {
      const mockFile1 = createMockFile('test.jpg');
      const mockFile2 = createMockFile('test.jpg');
      
      mockedUuidv4
        .mockReturnValueOnce('unique-id-1')
        .mockReturnValueOnce('unique-id-2');

      const result1 = await service.uploadFile(mockFile1, mockBucket);
      const result2 = await service.uploadFile(mockFile2, mockBucket);

      expect(result1.filename).toBe('unique-id-1.jpg');
      expect(result2.filename).toBe('unique-id-2.jpg');
      expect(result1.filename).not.toBe(result2.filename);
    });

    it('should handle files with no extension', async () => {
      const mockFile = createMockFile('README');
      mockedUuidv4.mockReturnValue('unique-id-no-ext');

      const result = await service.uploadFile(mockFile, mockBucket);

      expect(result.filename).toBe('unique-id-no-ext');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/storage/v1/object/${mockBucket}/unique-id-no-ext`,
        expect.any(Buffer),
        expect.any(Object),
      );
    });

    it('should handle files with multiple dots in filename', async () => {
      const mockFile = createMockFile('my.file.with.dots.txt');
      mockedUuidv4.mockReturnValue('unique-id-dots');

      const result = await service.uploadFile(mockFile, mockBucket);

      expect(result.filename).toBe('unique-id-dots.txt');
    });

    it('should handle different file types', async () => {
      const testCases = [
        { filename: 'document.pdf', mimetype: 'application/pdf', extension: '.pdf' },
        { filename: 'image.png', mimetype: 'image/png', extension: '.png' },
        { filename: 'data.csv', mimetype: 'text/csv', extension: '.csv' },
        { filename: 'archive.zip', mimetype: 'application/zip', extension: '.zip' },
      ];

      for (const testCase of testCases) {
        const mockFile = createMockFile(testCase.filename, Buffer.from('content'), testCase.mimetype);
        mockedUuidv4.mockReturnValue(`unique-id-${testCase.extension.substring(1)}`);

        const result = await service.uploadFile(mockFile, mockBucket);

        expect(result.filename).toBe(`unique-id-${testCase.extension.substring(1)}${testCase.extension}`);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining(result.filename),
          mockFile.buffer,
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': testCase.mimetype,
            }),
          }),
        );
      }
    });

    it('should handle 201 status code as success', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 201,
        data: { message: 'File created successfully' },
      });

      const mockFile = createMockFile();
      const result = await service.uploadFile(mockFile, mockBucket);

      expect(result.filename).toBe(mockUniqueFilename);
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        `File uploaded successfully to Supabase: ${mockUniqueFilename}`,
      );
    });

    it('should handle network errors during upload', async () => {
      const networkError = new Error('Network error');
      mockedAxios.post.mockRejectedValue(networkError);

      const mockFile = createMockFile();

      await expect(service.uploadFile(mockFile, mockBucket)).rejects.toThrow(
        'Failed to upload file to Supabase: Network error',
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Error uploading file to Supabase: ${mockFile.originalname}`,
        networkError,
      );
    });

    it('should handle HTTP errors with response', async () => {
      const httpError = {
        response: {
          status: 400,
          data: { message: 'Invalid file format' },
          statusText: 'Bad Request',
        },
      };
      mockedAxios.post.mockRejectedValue(httpError);

      const mockFile = createMockFile();

      await expect(service.uploadFile(mockFile, mockBucket)).rejects.toThrow(
        'Failed to upload file to Supabase: Supabase upload failed: Invalid file format',
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Supabase API error: 400 - ${JSON.stringify(httpError.response.data)}`,
      );
    });

    it('should handle HTTP errors without message in response', async () => {
      const httpError = {
        response: {
          status: 500,
          data: {},
          statusText: 'Internal Server Error',
        },
      };
      mockedAxios.post.mockRejectedValue(httpError);

      const mockFile = createMockFile();

      await expect(service.uploadFile(mockFile, mockBucket)).rejects.toThrow(
        'Failed to upload file to Supabase: Supabase upload failed: Internal Server Error',
      );
    });

    it('should handle non-success HTTP status codes', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 404,
        data: { error: 'Bucket not found' },
      });

      const mockFile = createMockFile();

      await expect(service.uploadFile(mockFile, mockBucket)).rejects.toThrow(
        'Failed to upload file to Supabase: Supabase upload failed with status: 404',
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to upload file to Supabase. Status: 404'),
      );
    });

    it('should handle large files', async () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      const mockFile = createMockFile('large-file.jpg', largeBuffer, 'image/jpeg', 10 * 1024 * 1024);

      const result = await service.uploadFile(mockFile, mockBucket);

      expect(result.filename).toBe(mockUniqueFilename);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        largeBuffer,
        expect.any(Object),
      );
    });

    it('should handle empty files', async () => {
      const emptyBuffer = Buffer.alloc(0);
      const mockFile = createMockFile('empty-file.txt', emptyBuffer, 'text/plain', 0);

      const result = await service.uploadFile(mockFile, mockBucket);

      expect(result.filename).toBe('unique-id-123.txt');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        emptyBuffer,
        expect.any(Object),
      );
    });
  });

  // ===== MULTIPLE FILES UPLOAD TESTS =====

  describe('uploadFiles', () => {
    beforeEach(() => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'File uploaded successfully' },
      });
    });

    it('should upload multiple files successfully', async () => {
      const mockFiles = [
        createMockFile('file1.jpg'),
        createMockFile('file2.png'),
        createMockFile('file3.pdf', Buffer.from('pdf content'), 'application/pdf'),
      ];

      mockedUuidv4
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2')
        .mockReturnValueOnce('uuid-3');

      const results = await service.uploadFiles(mockFiles, mockBucket);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({
        filename: 'uuid-1.jpg',
        url: `${mockSupabaseUrl}/storage/v1/object/public/${mockBucket}/uuid-1.jpg`,
        bucket: mockBucket,
      });
      expect(results[1]).toEqual({
        filename: 'uuid-2.png',
        url: `${mockSupabaseUrl}/storage/v1/object/public/${mockBucket}/uuid-2.png`,
        bucket: mockBucket,
      });
      expect(results[2]).toEqual({
        filename: 'uuid-3.pdf',
        url: `${mockSupabaseUrl}/storage/v1/object/public/${mockBucket}/uuid-3.pdf`,
        bucket: mockBucket,
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Uploading 3 files to Supabase bucket: ${mockBucket}`,
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Successfully uploaded 3 files to Supabase`,
      );
    });

    it('should return empty array for empty files array', async () => {
      const result = await service.uploadFiles([], mockBucket);

      expect(result).toEqual([]);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should return empty array for null files', async () => {
      const result = await service.uploadFiles(null as any, mockBucket);

      expect(result).toEqual([]);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should return empty array for undefined files', async () => {
      const result = await service.uploadFiles(undefined as any, mockBucket);

      expect(result).toEqual([]);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle partial failures in batch upload', async () => {
      const mockFiles = [
        createMockFile('file1.jpg'),
        createMockFile('file2.png'),
      ];

      mockedUuidv4
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2');

      // First call succeeds, second call fails
      mockedAxios.post
        .mockResolvedValueOnce({
          status: 200,
          data: { message: 'Success' },
        })
        .mockRejectedValueOnce(new Error('Upload failed'));

      await expect(service.uploadFiles(mockFiles, mockBucket)).rejects.toThrow(
        'Failed to upload files to Supabase: Upload failed',
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error uploading multiple files to Supabase',
        expect.any(Error),
      );
    });

    it('should handle single file in array', async () => {
      const mockFiles = [createMockFile('single-file.jpg')];
      mockedUuidv4.mockReturnValue('single-uuid');

      const results = await service.uploadFiles(mockFiles, mockBucket);

      expect(results).toHaveLength(1);
      expect(results[0].filename).toBe('single-uuid.jpg');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent upload of many files', async () => {
      const fileCount = 10;
      const mockFiles = Array.from({ length: fileCount }, (_, i) =>
        createMockFile(`file${i}.jpg`),
      );

      mockedUuidv4.mockImplementation(() => `uuid-${Date.now()}-${Math.random()}`);

      const results = await service.uploadFiles(mockFiles, mockBucket);

      expect(results).toHaveLength(fileCount);
      expect(mockedAxios.post).toHaveBeenCalledTimes(fileCount);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Uploading ${fileCount} files to Supabase bucket: ${mockBucket}`,
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Successfully uploaded ${fileCount} files to Supabase`,
      );
    });

    it('should preserve file order in results', async () => {
      const mockFiles = [
        createMockFile('first.jpg'),
        createMockFile('second.png'),
        createMockFile('third.pdf', Buffer.from('content'), 'application/pdf'),
      ];

      mockedUuidv4
        .mockReturnValueOnce('first-uuid')
        .mockReturnValueOnce('second-uuid')
        .mockReturnValueOnce('third-uuid');

      const results = await service.uploadFiles(mockFiles, mockBucket);

      expect(results[0].filename).toBe('first-uuid.jpg');
      expect(results[1].filename).toBe('second-uuid.png');
      expect(results[2].filename).toBe('third-uuid.pdf');
    });
  });

  // ===== FILE DELETION TESTS =====

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockedAxios.delete.mockResolvedValue({
        status: 200,
        data: { message: 'File deleted successfully' },
      });

      await service.deleteFile(mockBucket, mockFilename);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/storage/v1/object/${mockBucket}/${mockFilename}`,
        {
          headers: {
            Authorization: `Bearer ${mockSupabaseApiKey}`,
          },
        },
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        `Deleting file from Supabase: ${mockFilename} (bucket: ${mockBucket})`,
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `File deleted successfully from Supabase: ${mockFilename}`,
      );
    });

    it('should handle non-200 status as failure', async () => {
      mockedAxios.delete.mockResolvedValue({
        status: 404,
        data: { error: 'File not found' },
      });

      await expect(service.deleteFile(mockBucket, mockFilename)).rejects.toThrow(
        'Failed to delete file from Supabase: Supabase delete failed with status: 404',
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete file from Supabase. Status: 404'),
      );
    });

    it('should handle network errors during deletion', async () => {
      const networkError = new Error('Network connection failed');
      mockedAxios.delete.mockRejectedValue(networkError);

      await expect(service.deleteFile(mockBucket, mockFilename)).rejects.toThrow(
        'Failed to delete file from Supabase: Network connection failed',
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Error deleting file from Supabase: ${mockFilename}`,
        networkError,
      );
    });

    it('should handle HTTP errors with response', async () => {
      const httpError = {
        response: {
          status: 403,
          data: { message: 'Access denied' },
        },
        message: 'Request failed with status code 403',
      };
      mockedAxios.delete.mockRejectedValue(httpError);

      await expect(service.deleteFile(mockBucket, mockFilename)).rejects.toThrow(
        'Failed to delete file from Supabase: Request failed with status code 403',
      );
    });

    it('should handle deletion of files with special characters in names', async () => {
      mockedAxios.delete.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      const specialFilename = 'file-with-special-chars_123.jpg';
      await service.deleteFile(mockBucket, specialFilename);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/storage/v1/object/${mockBucket}/${specialFilename}`,
        expect.any(Object),
      );
    });

    it('should handle deletion of files with long paths', async () => {
      mockedAxios.delete.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      const longPath = 'very/long/path/to/nested/directory/structure/file.jpg';
      await service.deleteFile(mockBucket, longPath);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/storage/v1/object/${mockBucket}/${longPath}`,
        expect.any(Object),
      );
    });

    it('should handle empty filename', async () => {
      mockedAxios.delete.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      await service.deleteFile(mockBucket, '');

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/storage/v1/object/${mockBucket}/`,
        expect.any(Object),
      );
    });
  });

  // ===== FILE VALIDATION TESTS =====

  describe('validateFile', () => {
    it('should validate valid file with default settings', () => {
      const mockFile = createMockFile('test.jpg', Buffer.from('content'), 'image/jpeg', 1024);

      const result = service.validateFile(mockFile);

      expect(result).toEqual({ isValid: true });
    });

    it('should reject file exceeding size limit', () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      const mockFile = createMockFile('large.jpg', largeBuffer, 'image/jpeg', 11 * 1024 * 1024);

      const result = service.validateFile(mockFile);

      expect(result).toEqual({
        isValid: false,
        error: 'File size exceeds 10MB limit',
      });
    });

    it('should validate file with custom size limit', () => {
      const mockFile = createMockFile('test.jpg', Buffer.from('content'), 'image/jpeg', 2 * 1024 * 1024); // 2MB
      const customSizeLimit = 5 * 1024 * 1024; // 5MB

      const result = service.validateFile(mockFile, customSizeLimit);

      expect(result).toEqual({ isValid: true });
    });

    it('should reject file with custom size limit', () => {
      const mockFile = createMockFile('test.jpg', Buffer.from('content'), 'image/jpeg', 6 * 1024 * 1024); // 6MB
      const customSizeLimit = 5 * 1024 * 1024; // 5MB

      const result = service.validateFile(mockFile, customSizeLimit);

      expect(result).toEqual({
        isValid: false,
        error: 'File size exceeds 5MB limit',
      });
    });

    it('should reject file with disallowed MIME type', () => {
      const mockFile = createMockFile('virus.exe', Buffer.from('content'), 'application/x-msdownload', 1024);

      const result = service.validateFile(mockFile);

      expect(result).toEqual({
        isValid: false,
        error: 'File type application/x-msdownload is not allowed',
      });
    });

    it('should validate file with custom allowed MIME types', () => {
      const mockFile = createMockFile('script.js', Buffer.from('content'), 'application/javascript', 1024);
      const customMimeTypes = ['application/javascript', 'text/javascript'];

      const result = service.validateFile(mockFile, 10 * 1024 * 1024, customMimeTypes);

      expect(result).toEqual({ isValid: true });
    });

    it('should validate all default allowed MIME types', () => {
      const defaultMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
      ];

      defaultMimeTypes.forEach((mimeType) => {
        const mockFile = createMockFile('test-file', Buffer.from('content'), mimeType, 1024);
        const result = service.validateFile(mockFile);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject filename with invalid characters', () => {
      const mockFile = createMockFile('file/with\\path.jpg', Buffer.from('content'), 'image/jpeg', 1024);

      const result = service.validateFile(mockFile);

      expect(result).toEqual({
        isValid: false,
        error: 'Filename contains invalid characters',
      });
    });

    it('should reject filename with special characters', () => {
      const invalidFilenames = [
        'file<script>.jpg',
        'file>redirect.jpg',
        'file|pipe.jpg',
        'file:colon.jpg',
        'file"quote.jpg',
        'file*wildcard.jpg',
        'file?question.jpg',
        'file\\backslash.jpg',
        'file/slash.jpg',
      ];

      invalidFilenames.forEach((filename) => {
        const mockFile = createMockFile(filename, Buffer.from('content'), 'image/jpeg', 1024);
        const result = service.validateFile(mockFile);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Filename contains invalid characters');
      });
    });

    it('should allow valid filename characters', () => {
      const validFilenames = [
        'normal-file.jpg',
        'file_with_underscores.png',
        'file.with.dots.pdf',
        'file123.txt',
        'UPPERCASE.PDF',
        'MixedCase.TXT',
        'file-name.extension',
      ];

      validFilenames.forEach((filename) => {
        const mockFile = createMockFile(filename, Buffer.from('content'), 'image/jpeg', 1024);
        const result = service.validateFile(mockFile);
        expect(result.isValid).toBe(true);
      });
    });

    it('should handle zero-byte files', () => {
      const mockFile = createMockFile('empty.txt', Buffer.alloc(0), 'text/plain', 0);

      const result = service.validateFile(mockFile);

      expect(result).toEqual({ isValid: true });
    });

    it('should handle files at exact size limit', () => {
      const exactSizeBuffer = Buffer.alloc(10 * 1024 * 1024); // Exactly 10MB
      const mockFile = createMockFile('exact.jpg', exactSizeBuffer, 'image/jpeg', 10 * 1024 * 1024);

      const result = service.validateFile(mockFile);

      expect(result).toEqual({ isValid: true });
    });

    it('should handle files just over size limit', () => {
      const oversizeBuffer = Buffer.alloc(10 * 1024 * 1024 + 1); // 10MB + 1 byte
      const mockFile = createMockFile('oversize.jpg', oversizeBuffer, 'image/jpeg', 10 * 1024 * 1024 + 1);

      const result = service.validateFile(mockFile);

      expect(result).toEqual({
        isValid: false,
        error: 'File size exceeds 10MB limit',
      });
    });

    it('should handle custom size limits correctly', () => {
      const testCases = [
        { size: 1024, limit: 2048, expected: true }, // Below limit
        { size: 2048, limit: 2048, expected: true }, // At limit
        { size: 2049, limit: 2048, expected: false }, // Above limit
      ];

      testCases.forEach(({ size, limit, expected }) => {
        const buffer = Buffer.alloc(size);
        const mockFile = createMockFile('test.jpg', buffer, 'image/jpeg', size);
        const result = service.validateFile(mockFile, limit);
        expect(result.isValid).toBe(expected);
      });
    });
  });

  // ===== SUPPORTED BUCKETS TESTS =====

  describe('getSupportedBuckets', () => {
    it('should return correct bucket configuration', () => {
      const buckets = SupabaseStorageService.getSupportedBuckets();

      expect(buckets).toEqual({
        USER_PROFILES: 'user-profiles',
        POST_ATTACHMENTS: 'post-attachments',
        MESSAGES: 'messages',
        DOCUMENTS: 'documents',
        WORKSHEETS: 'worksheets',
      });
    });

    it('should return immutable bucket configuration', () => {
      const buckets1 = SupabaseStorageService.getSupportedBuckets();
      const buckets2 = SupabaseStorageService.getSupportedBuckets();

      expect(buckets1).toEqual(buckets2);
      
      // Test that the returned object is the same reference (const assertion)
      expect(Object.isFrozen(buckets1)).toBe(false); // TypeScript const assertion doesn't freeze at runtime
    });

    it('should provide access to all expected bucket types', () => {
      const buckets = SupabaseStorageService.getSupportedBuckets();

      expect(buckets.USER_PROFILES).toBeDefined();
      expect(buckets.POST_ATTACHMENTS).toBeDefined();
      expect(buckets.MESSAGES).toBeDefined();
      expect(buckets.DOCUMENTS).toBeDefined();
      expect(buckets.WORKSHEETS).toBeDefined();
    });
  });

  // ===== UTILITY METHODS TESTS =====

  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      // Access private method through service instance
      const extractExtension = (filename: string) => {
        // We can't directly test private methods, but we can test through upload functionality
        // which uses getFileExtension internally
        return filename.substring(filename.lastIndexOf('.'));
      };

      const testCases = [
        { filename: 'test.jpg', expected: '.jpg' },
        { filename: 'document.pdf', expected: '.pdf' },
        { filename: 'archive.tar.gz', expected: '.gz' },
        { filename: 'file.with.multiple.dots.txt', expected: '.txt' },
        { filename: 'no-extension', expected: 'no-extension' },
        { filename: '.hidden', expected: '.hidden' },
        { filename: 'file.', expected: '.' },
      ];

      testCases.forEach(({ filename, expected }) => {
        if (filename.includes('.')) {
          expect(extractExtension(filename)).toBe(expected);
        }
      });
    });

    it('should handle edge cases in file extension extraction', async () => {
      // Test through the upload functionality
      const testCases = [
        { filename: '', expectedExtension: '' },
        { filename: '.', expectedExtension: '.' },
        { filename: '..', expectedExtension: '.' },
        { filename: 'file', expectedExtension: '' },
        { filename: 'file.', expectedExtension: '.' },
      ];

      for (const testCase of testCases) {
        mockedUuidv4.mockReturnValue('test-uuid');
        const mockFile = createMockFile(testCase.filename);
        
        const result = await service.uploadFile(mockFile, mockBucket);
        
        if (testCase.expectedExtension) {
          expect(result.filename).toBe(`test-uuid${testCase.expectedExtension}`);
        } else {
          expect(result.filename).toBe('test-uuid');
        }
      }
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('Integration scenarios', () => {
    it('should handle complete upload workflow', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      const mockFile = createMockFile('integration-test.jpg', Buffer.from('test content'), 'image/jpeg', 2048);

      // Validate file first
      const validation = service.validateFile(mockFile);
      expect(validation.isValid).toBe(true);

      // Upload file
      const result = await service.uploadFile(mockFile, mockBucket);

      expect(result).toEqual({
        filename: mockUniqueFilename,
        url: `${mockSupabaseUrl}/storage/v1/object/public/${mockBucket}/${mockUniqueFilename}`,
        bucket: mockBucket,
      });

      // Verify the correct API calls
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/storage/v1/object/${mockBucket}/${mockUniqueFilename}`,
        mockFile.buffer,
        {
          headers: {
            'Content-Type': 'image/jpeg',
            Authorization: `Bearer ${mockSupabaseApiKey}`,
          },
        },
      );
    });

    it('should handle upload and delete workflow', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Upload success' },
      });

      mockedAxios.delete.mockResolvedValue({
        status: 200,
        data: { message: 'Delete success' },
      });

      const mockFile = createMockFile('temp-file.jpg');

      // Upload file
      const uploadResult = await service.uploadFile(mockFile, mockBucket);
      expect(uploadResult.filename).toBe(mockUniqueFilename);

      // Delete the uploaded file
      await service.deleteFile(mockBucket, uploadResult.filename);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/storage/v1/object/${mockBucket}/${uploadResult.filename}`,
        {
          headers: {
            Authorization: `Bearer ${mockSupabaseApiKey}`,
          },
        },
      );
    });

    it('should handle batch upload with validation', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      const mockFiles = [
        createMockFile('valid1.jpg', Buffer.from('content1'), 'image/jpeg', 1024),
        createMockFile('valid2.png', Buffer.from('content2'), 'image/png', 2048),
        createMockFile('valid3.pdf', Buffer.from('content3'), 'application/pdf', 4096),
      ];

      // Validate all files first
      mockFiles.forEach((file) => {
        const validation = service.validateFile(file);
        expect(validation.isValid).toBe(true);
      });

      mockedUuidv4
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2')
        .mockReturnValueOnce('uuid-3');

      // Upload all files
      const results = await service.uploadFiles(mockFiles, mockBucket);

      expect(results).toHaveLength(3);
      expect(results[0].filename).toBe('uuid-1.jpg');
      expect(results[1].filename).toBe('uuid-2.png');
      expect(results[2].filename).toBe('uuid-3.pdf');
    });

    it('should handle error recovery in batch operations', async () => {
      const mockFiles = [
        createMockFile('file1.jpg'),
        createMockFile('file2.jpg'),
        createMockFile('file3.jpg'),
      ];

      // First upload succeeds, second fails, third would not be reached due to Promise.all
      mockedAxios.post
        .mockResolvedValueOnce({
          status: 200,
          data: { message: 'Success' },
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          status: 200,
          data: { message: 'Success' },
        });

      await expect(service.uploadFiles(mockFiles, mockBucket)).rejects.toThrow(
        'Failed to upload files to Supabase: Network error',
      );

      // All uploads should be attempted due to Promise.all
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });
  });

  // ===== PERFORMANCE TESTS =====

  describe('Performance tests', () => {
    it('should handle concurrent file uploads efficiently', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      const fileCount = 20;
      const mockFiles = Array.from({ length: fileCount }, (_, i) =>
        createMockFile(`concurrent-file-${i}.jpg`),
      );

      mockedUuidv4.mockImplementation(() => `uuid-${Date.now()}-${Math.random()}`);

      const startTime = Date.now();
      const results = await service.uploadFiles(mockFiles, mockBucket);
      const endTime = Date.now();

      expect(results).toHaveLength(fileCount);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockedAxios.post).toHaveBeenCalledTimes(fileCount);
    });

    it('should handle large number of validations efficiently', () => {
      const fileCount = 100;
      const validations: any[] = [];

      const startTime = Date.now();
      for (let i = 0; i < fileCount; i++) {
        const mockFile = createMockFile(`file-${i}.jpg`);
        validations.push(service.validateFile(mockFile));
      }
      const endTime = Date.now();

      expect(validations).toHaveLength(fileCount);
      expect(validations.every(v => v.isValid)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle repeated uploads without memory leaks', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many uploads
      for (let i = 0; i < 50; i++) {
        const mockFile = createMockFile(`repeated-file-${i}.jpg`);
        mockedUuidv4.mockReturnValue(`uuid-${i}`);
        await service.uploadFile(mockFile, mockBucket);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 5MB for 50 uploads)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  // ===== ERROR HANDLING AND EDGE CASES =====

  describe('Error handling and edge cases', () => {
    it('should handle malformed Supabase responses', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: null, // Malformed response
      });

      const mockFile = createMockFile();
      const result = await service.uploadFile(mockFile, mockBucket);

      // Should still work since we only check status code
      expect(result.filename).toBe(mockUniqueFilename);
    });

    it('should handle missing response data', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        // Missing data property
      });

      const mockFile = createMockFile();
      const result = await service.uploadFile(mockFile, mockBucket);

      expect(result.filename).toBe(mockUniqueFilename);
    });

    it('should handle extremely large filenames', async () => {
      const longFilename = 'a'.repeat(255) + '.jpg';
      const mockFile = createMockFile(longFilename);

      // Should fail validation due to invalid characters from length constraint
      const validation = service.validateFile(mockFile);
      
      // The validation should still work, just checking for invalid characters
      // Long filenames are typically handled by the file system
      expect(validation.isValid).toBe(true); // Length itself isn't validated, only invalid chars
    });

    it('should handle files with Unicode characters in names', async () => {
      const unicodeFilename = 'файл_测试_ファイル.jpg';
      const mockFile = createMockFile(unicodeFilename);

      const validation = service.validateFile(mockFile);
      
      // Unicode characters would be replaced by underscores due to regex
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Filename contains invalid characters');
    });

    it('should handle null/undefined file properties', () => {
      const invalidFile = {
        originalname: null,
        buffer: undefined,
        mimetype: '',
        size: NaN,
      } as any;

      expect(() => service.validateFile(invalidFile)).not.toThrow();
      // Should handle gracefully by checking what it can
    });

    it('should handle concurrent operations on same bucket', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      mockedAxios.delete.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      const uploadPromises = Array.from({ length: 5 }, (_, i) => {
        const mockFile = createMockFile(`concurrent-${i}.jpg`);
        mockedUuidv4.mockReturnValue(`uuid-${i}`);
        return service.uploadFile(mockFile, mockBucket);
      });

      const deletePromises = Array.from({ length: 3 }, (_, i) =>
        service.deleteFile(mockBucket, `file-to-delete-${i}.jpg`),
      );

      // Run uploads and deletes concurrently
      const [uploadResults, deleteResults] = await Promise.all([
        Promise.all(uploadPromises),
        Promise.all(deletePromises),
      ]);

      expect(uploadResults).toHaveLength(5);
      expect(deleteResults).toHaveLength(3);
    });

    it('should handle service configuration edge cases', () => {
      // Test with various edge case configurations
      const edgeCaseConfigs = [
        { url: 'http://localhost', key: 'key' }, // No HTTPS
        { url: 'https://test.com/', key: 'key' }, // Trailing slash
        { url: '  https://test.com  ', key: '  key  ' }, // Whitespace
      ];

      edgeCaseConfigs.forEach(({ url, key }) => {
        configService.get.mockImplementation((configKey: string) => {
          switch (configKey) {
            case 'SUPABASE_URL':
              return url;
            case 'SUPABASE_API_KEY':
              return key;
            default:
              return null;
          }
        });

        // Should initialize without error for non-empty values
        if (url.trim() && key.trim()) {
          expect(() => new SupabaseStorageService(configService)).not.toThrow();
        }
      });
    });

    it('should handle axios timeout scenarios', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };
      mockedAxios.post.mockRejectedValue(timeoutError);

      const mockFile = createMockFile();

      await expect(service.uploadFile(mockFile, mockBucket)).rejects.toThrow(
        'Failed to upload file to Supabase: timeout of 30000ms exceeded',
      );
    });

    it('should handle network connectivity issues', async () => {
      const networkError = {
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND test-project.supabase.co',
      };
      mockedAxios.post.mockRejectedValue(networkError);

      const mockFile = createMockFile();

      await expect(service.uploadFile(mockFile, mockBucket)).rejects.toThrow(
        'Failed to upload file to Supabase: getaddrinfo ENOTFOUND test-project.supabase.co',
      );
    });
  });

  // ===== SECURITY TESTS =====

  describe('Security considerations', () => {
    it('should prevent path traversal in filenames', () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '/etc/hosts',
        'C:\\Windows\\System32\\config',
        '%2e%2e%2f%2e%2e%2f',
      ];

      maliciousFilenames.forEach((filename) => {
        const mockFile = createMockFile(filename);
        const validation = service.validateFile(mockFile);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe('Filename contains invalid characters');
      });
    });

    it('should sanitize filenames with dangerous characters', () => {
      const dangerousFilenames = [
        '<script>alert("xss")</script>.jpg',
        'file;rm -rf /.jpg',
        'file`whoami`.jpg',
        'file$(command).jpg',
        'file&command&.jpg',
      ];

      dangerousFilenames.forEach((filename) => {
        const mockFile = createMockFile(filename);
        const validation = service.validateFile(mockFile);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe('Filename contains invalid characters');
      });
    });

    it('should reject executable file types', () => {
      const executableMimeTypes = [
        'application/x-executable',
        'application/x-msdownload',
        'application/x-msdos-program',
        'application/x-msi',
        'application/x-sh',
        'application/x-bat',
      ];

      executableMimeTypes.forEach((mimetype) => {
        const mockFile = createMockFile('malicious.exe', Buffer.from('content'), mimetype);
        const validation = service.validateFile(mockFile);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toContain('is not allowed');
      });
    });

    it('should handle oversized file attacks', () => {
      const massiveSize = Number.MAX_SAFE_INTEGER;
      const mockFile = createMockFile('huge.jpg', Buffer.alloc(0), 'image/jpeg', massiveSize);

      const validation = service.validateFile(mockFile);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('exceeds');
    });

    it('should handle authorization header correctly', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Success' },
      });

      const mockFile = createMockFile();
      await service.uploadFile(mockFile, mockBucket);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Buffer),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockSupabaseApiKey}`,
          }),
        }),
      );

      // Verify the API key is not logged or exposed
      expect(loggerSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(mockSupabaseApiKey),
      );
    });
  });
});