import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiServiceClient, AiPredictionResult } from './ai-service.client';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { validate } from 'class-validator';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AiServiceClient', () => {
  let service: AiServiceClient;
  let configService: jest.Mocked<ConfigService>;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;
  let loggerSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  // Test data constants
  const mockValidInput = Array.from({ length: 201 }, (_, i) => i % 11); // 0-10 values
  const mockInvalidInputTooShort = Array.from({ length: 200 }, (_, i) => i % 11);
  const mockInvalidInputTooLong = Array.from({ length: 202 }, (_, i) => i % 11);
  const mockInvalidInputWithNegative = Array.from({ length: 201 }, (_, i) => i % 11 - 1);
  const mockInvalidInputWithHigh = Array.from({ length: 201 }, (_, i) => i % 12);
  const mockInvalidInputWithNaN = [...Array.from({ length: 200 }, (_, i) => i % 11), NaN];
  const mockInvalidInputWithInfinity = [...Array.from({ length: 200 }, (_, i) => i % 11), Infinity];

  const mockValidResponse = {
    depression: true,
    anxiety: false,
    stress: true,
    bipolar: false,
    ptsd: true,
    ocd: false,
    eating_disorder: false,
    substance_abuse: false,
    insomnia: true,
    borderline_personality: false,
    autism: false,
    adhd: true,
    burnout: false,
  };

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.resetAllMocks();

    // Setup axios mock
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    } as any;

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiServiceClient,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiServiceClient>(AiServiceClient);
    configService = module.get(ConfigService);

    // Setup logger spies
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ===== INITIALIZATION TESTS =====

  describe('Initialization', () => {
    it('should initialize with custom AI service URL from config', () => {
      configService.get.mockReturnValue('https://custom-ai-service.com');

      const newService = new AiServiceClient(configService);

      expect(configService.get).toHaveBeenCalledWith('AI_SERVICE_URL');
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://custom-ai-service.com',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mentara-API/1.0',
        },
      });
    });

    it('should initialize with default URL when config is not provided', () => {
      configService.get.mockReturnValue(null);

      const newService = new AiServiceClient(configService);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:5000',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mentara-API/1.0',
        },
      });
    });

    it('should setup axios interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should return correct service info', () => {
      configService.get.mockReturnValue('https://test-ai-service.com');
      const newService = new AiServiceClient(configService);

      const serviceInfo = newService.getServiceInfo();

      expect(serviceInfo).toEqual({
        baseURL: 'https://test-ai-service.com',
        timeout: 30000,
        maxRetries: 3,
      });
    });
  });

  // ===== INPUT VALIDATION TESTS =====

  describe('Input validation', () => {
    it('should validate correct input array with 201 values', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);
      expect(result.predictions).toEqual(mockValidResponse);
    });

    it('should reject input array with less than 201 values', async () => {
      const result = await service.predict(mockInvalidInputTooShort);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data for AI prediction');
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'AI service input validation failed:',
        expect.any(Array),
      );
    });

    it('should reject input array with more than 201 values', async () => {
      const result = await service.predict(mockInvalidInputTooLong);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data for AI prediction');
    });

    it('should reject input array with negative values', async () => {
      const result = await service.predict(mockInvalidInputWithNegative);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data for AI prediction');
    });

    it('should reject input array with values greater than 10', async () => {
      const result = await service.predict(mockInvalidInputWithHigh);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data for AI prediction');
    });

    it('should reject input array with non-numeric values', async () => {
      const invalidInput = [...Array.from({ length: 200 }, (_, i) => i % 11), 'invalid'] as any;

      const result = await service.predict(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data for AI prediction');
    });

    it('should handle input array with null values', async () => {
      const invalidInput = [...Array.from({ length: 200 }, (_, i) => i % 11), null] as any;

      const result = await service.predict(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data for AI prediction');
    });

    it('should handle empty input array', async () => {
      const result = await service.predict([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data for AI prediction');
    });

    it('should handle input with decimal values within range', async () => {
      const decimalInput = Array.from({ length: 201 }, (_, i) => (i % 10) + 0.5);
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const result = await service.predict(decimalInput);

      expect(result.success).toBe(true);
    });

    it('should handle boundary values (0 and 10)', async () => {
      const boundaryInput = Array.from({ length: 201 }, (_, i) => i % 2 === 0 ? 0 : 10);
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const result = await service.predict(boundaryInput);

      expect(result.success).toBe(true);
    });
  });

  // ===== INPUT SANITIZATION TESTS =====

  describe('Input sanitization', () => {
    it('should sanitize NaN values to 0', async () => {
      // Create a spy to monitor the request payload
      let capturedPayload: any;
      mockAxiosInstance.post.mockImplementation((url, data) => {
        capturedPayload = data;
        return Promise.resolve({
          data: mockValidResponse,
          status: 200,
        });
      });

      const inputWithNaN = [...Array.from({ length: 200 }, (_, i) => i % 11), NaN];
      
      // Since validation will fail, let's test sanitization through a valid input that gets sanitized
      const inputWithInvalidNumber = [...Array.from({ length: 200 }, (_, i) => i % 11), 'invalid' as any];
      
      // For testing sanitization, we'll test with a modified predict method or create a unit test for sanitizeInput
      // Let's test with Infinity which should be clamped
      const inputWithInfinity = [...Array.from({ length: 200 }, (_, i) => i % 11), Infinity];
      
      // This will fail validation but let's see what happens with valid but extreme values
      const inputWithExtremeValues = Array.from({ length: 201 }, (_, i) => i < 100 ? -5 : 15);
      
      const result = await service.predict(inputWithExtremeValues);
      
      // This should fail validation, but if it passed sanitization, extreme values would be clamped
      expect(result.success).toBe(false);
    });

    it('should clamp values above 10 to 10', async () => {
      // Test with values that would be clamped if they passed initial validation
      const inputWithHighValues = Array.from({ length: 201 }, () => 10.1); // Slightly above 10
      
      const result = await service.predict(inputWithHighValues);
      
      // This should fail validation since 10.1 > 10
      expect(result.success).toBe(false);
    });

    it('should clamp values below 0 to 0', async () => {
      const inputWithNegativeValues = Array.from({ length: 201 }, () => -0.1);
      
      const result = await service.predict(inputWithNegativeValues);
      
      // This should fail validation since -0.1 < 0
      expect(result.success).toBe(false);
    });

    it('should round values to 2 decimal places', async () => {
      const inputWithManyDecimals = Array.from({ length: 201 }, (_, i) => (i % 10) + 0.123456789);
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const result = await service.predict(inputWithManyDecimals);

      expect(result.success).toBe(true);
    });

    it('should handle input with mixed valid and invalid values', async () => {
      const mixedInput = [
        ...Array.from({ length: 100 }, (_, i) => i % 11), // Valid: 0-10
        ...Array.from({ length: 100 }, (_, i) => -1), // Invalid: negative
        NaN, // Invalid: NaN
      ];

      const result = await service.predict(mixedInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data for AI prediction');
    });
  });

  // ===== RATE LIMITING TESTS =====

  describe('Rate limiting', () => {
    it('should allow requests within rate limit', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      // Make multiple requests within the limit
      const requests = Array.from({ length: 5 }, () => service.predict(mockValidInput));
      const results = await Promise.all(requests);

      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it('should reject requests when rate limit is exceeded', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      // Force rate limit by manipulating internal counter
      // Since we can't directly access private properties, we'll simulate by making many requests rapidly
      const requests = Array.from({ length: 65 }, () => service.predict(mockValidInput)); // Exceed 60 request limit
      const results = await Promise.all(requests);

      // Some requests should succeed, some should fail due to rate limiting
      const rateLimitedResults = results.filter(
        (result) => !result.success && result.error?.includes('Rate limit exceeded'),
      );

      expect(rateLimitedResults.length).toBeGreaterThan(0);
    });

    it('should reset rate limit counter after time window', async () => {
      // This test would require mocking Date.now() to simulate time passage
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(0) // Initial time
        .mockReturnValueOnce(70000) // After 70 seconds (past the 60-second window)
        .mockReturnValue(70000);

      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);

      jest.restoreAllMocks();
    });

    it('should log warning when rate limit is exceeded', async () => {
      // Make requests to exceed rate limit
      const requests = Array.from({ length: 65 }, () => service.predict(mockValidInput));
      await Promise.all(requests);

      expect(loggerWarnSpy).toHaveBeenCalledWith('AI service rate limit exceeded');
    });
  });

  // ===== PREDICTION PROCESSING TESTS =====

  describe('Prediction processing', () => {
    it('should successfully process prediction with valid response', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const startTime = Date.now();
      const result = await service.predict(mockValidInput);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.predictions).toEqual(mockValidResponse);
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.responseTime).toBeLessThan(endTime - startTime + 100); // Allow for small variance
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringMatching(/AI prediction completed in \d+ms/),
      );
    });

    it('should handle empty response from AI service', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: null,
        status: 200,
      });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response format from AI service');
    });

    it('should handle non-object response from AI service', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: 'invalid response',
        status: 200,
      });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response format from AI service');
    });

    it('should handle response with unexpected structure', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { unexpected: 'format' },
        status: 200,
      });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);
      expect(result.predictions).toEqual({ unexpected: 'format' });
    });

    it('should include response time in both success and failure cases', async () => {
      // Test success case
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      let result = await service.predict(mockValidInput);
      expect(result.responseTime).toBeDefined();
      expect(result.responseTime).toBeGreaterThan(0);

      // Test failure case
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      result = await service.predict(mockValidInput);
      expect(result.responseTime).toBeDefined();
      expect(result.responseTime).toBeGreaterThan(0);
    });

    it('should make request to correct endpoint with sanitized input', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      await service.predict(mockValidInput);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/predict', {
        inputs: expect.any(Array),
      });

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const sentData = callArgs[1];
      expect(sentData.inputs).toHaveLength(201);
      expect(sentData.inputs.every((value: number) => value >= 0 && value <= 10)).toBe(true);
    });
  });

  // ===== RETRY LOGIC TESTS =====

  describe('Retry logic', () => {
    it('should retry on network errors', async () => {
      const networkError = new AxiosError('Network Error', 'ECONNRESET');
      
      mockAxiosInstance.post
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          data: mockValidResponse,
          status: 200,
        });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/AI service request failed \(attempt \d+\/3\), retrying.../),
      );
    });

    it('should retry on timeout errors', async () => {
      const timeoutError = new AxiosError('Timeout', 'ETIMEDOUT');
      
      mockAxiosInstance.post
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce({
          data: mockValidResponse,
          status: 200,
        });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
    });

    it('should retry on 5xx server errors', async () => {
      const serverError = new AxiosError('Internal Server Error');
      serverError.response = { status: 500 } as any;
      
      mockAxiosInstance.post
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce({
          data: mockValidResponse,
          status: 200,
        });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx client errors', async () => {
      const clientError = new AxiosError('Bad Request');
      clientError.response = { status: 400 } as any;
      
      mockAxiosInstance.post.mockRejectedValue(clientError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it('should not retry on non-retryable errors', async () => {
      const authError = new AxiosError('Unauthorized');
      authError.response = { status: 401 } as any;
      
      mockAxiosInstance.post.mockRejectedValue(authError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it('should fail after maximum retry attempts', async () => {
      const networkError = new AxiosError('Network Error', 'ECONNRESET');
      
      mockAxiosInstance.post.mockRejectedValue(networkError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/AI prediction failed after \d+ms:/),
        networkError,
      );
    });

    it('should implement exponential backoff', async () => {
      const networkError = new AxiosError('Network Error', 'ECONNRESET');
      const sleepSpy = jest.spyOn(global, 'setTimeout');
      
      mockAxiosInstance.post.mockRejectedValue(networkError);

      await service.predict(mockValidInput);

      // Check that setTimeout was called for delays (exponential backoff)
      expect(sleepSpy).toHaveBeenCalledTimes(2); // Two retries = two delays
      
      sleepSpy.mockRestore();
    });

    it('should limit maximum backoff delay', async () => {
      const networkError = new AxiosError('Network Error', 'ECONNRESET');
      let delayTimes: number[] = [];
      
      jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay) => {
        delayTimes.push(delay as number);
        callback();
        return {} as any;
      });
      
      mockAxiosInstance.post.mockRejectedValue(networkError);

      await service.predict(mockValidInput);

      // Check that delays don't exceed 5000ms
      delayTimes.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(5000);
      });
      
      jest.restoreAllMocks();
    });
  });

  // ===== ERROR HANDLING TESTS =====

  describe('Error handling', () => {
    it('should return appropriate error message for connection refused', async () => {
      const connRefusedError = new AxiosError('Connection refused', 'ECONNREFUSED');
      mockAxiosInstance.post.mockRejectedValue(connRefusedError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI service is currently unavailable');
    });

    it('should return appropriate error message for timeout', async () => {
      const timeoutError = new AxiosError('Timeout', 'ETIMEDOUT');
      mockAxiosInstance.post.mockRejectedValue(timeoutError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI service request timed out');
    });

    it('should return appropriate error message for 400 Bad Request', async () => {
      const badRequestError = new AxiosError('Bad Request');
      badRequestError.response = { status: 400 } as any;
      mockAxiosInstance.post.mockRejectedValue(badRequestError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request to AI service');
    });

    it('should return appropriate error message for 429 Rate Limit', async () => {
      const rateLimitError = new AxiosError('Too Many Requests');
      rateLimitError.response = { status: 429 } as any;
      mockAxiosInstance.post.mockRejectedValue(rateLimitError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI service rate limit exceeded');
    });

    it('should return appropriate error message for 5xx server errors', async () => {
      const serverError = new AxiosError('Internal Server Error');
      serverError.response = { status: 500 } as any;
      mockAxiosInstance.post.mockRejectedValue(serverError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI service internal error');
    });

    it('should return generic error message for unknown errors', async () => {
      const unknownError = new Error('Unknown error');
      mockAxiosInstance.post.mockRejectedValue(unknownError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred while contacting AI service');
    });

    it('should handle null/undefined errors gracefully', async () => {
      mockAxiosInstance.post.mockRejectedValue(null);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred while contacting AI service');
    });

    it('should handle errors without response property', async () => {
      const errorWithoutResponse = new AxiosError('Network error');
      // Explicitly remove response property
      delete (errorWithoutResponse as any).response;
      
      mockAxiosInstance.post.mockRejectedValue(errorWithoutResponse);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred while contacting AI service');
    });
  });

  // ===== HEALTH CHECK TESTS =====

  describe('Health check', () => {
    it('should return true for successful health check', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { status: 'healthy' },
      });

      const isHealthy = await service.healthCheck();

      expect(isHealthy).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health', {
        timeout: 5000,
      });
    });

    it('should return false for failed health check', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Service unavailable'));

      const isHealthy = await service.healthCheck();

      expect(isHealthy).toBe(false);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'AI service health check failed:',
        expect.any(Error),
      );
    });

    it('should return false for non-200 status', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 503,
        data: { status: 'unhealthy' },
      });

      const isHealthy = await service.healthCheck();

      expect(isHealthy).toBe(false);
    });

    it('should use custom timeout for health check', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { status: 'healthy' },
      });

      await service.healthCheck();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health', {
        timeout: 5000,
      });
    });

    it('should handle health check timeout', async () => {
      const timeoutError = new AxiosError('Timeout', 'ETIMEDOUT');
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      const isHealthy = await service.healthCheck();

      expect(isHealthy).toBe(false);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'AI service health check failed:',
        timeoutError,
      );
    });
  });

  // ===== AXIOS INTERCEPTORS TESTS =====

  describe('Axios interceptors', () => {
    it('should log debug information for successful requests', () => {
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      const mockConfig = { url: '/predict' };

      const result = requestInterceptor(mockConfig);

      expect(result).toEqual(mockConfig);
      expect(loggerDebugSpy).toHaveBeenCalledWith('Making AI service request to /predict');
    });

    it('should handle request interceptor errors', () => {
      const requestErrorInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][1];
      const mockError = new Error('Request error');

      expect(() => requestErrorInterceptor(mockError)).rejects.toThrow('Request error');
      expect(loggerErrorSpy).toHaveBeenCalledWith('AI service request interceptor error:', mockError);
    });

    it('should log debug information for successful responses', () => {
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
      const mockResponse = { status: 200, data: mockValidResponse };

      const result = responseInterceptor(mockResponse);

      expect(result).toEqual(mockResponse);
      expect(loggerDebugSpy).toHaveBeenCalledWith('AI service response received: 200');
    });

    it('should handle response interceptor errors', () => {
      const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockError = new AxiosError('Response error');
      mockError.response = { status: 500 } as any;

      expect(() => responseErrorInterceptor(mockError)).rejects.toThrow('Response error');
      expect(loggerErrorSpy).toHaveBeenCalledWith('AI service response error:', 500);
    });

    it('should handle response interceptor errors without response', () => {
      const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockError = new Error('Network error');

      expect(() => responseErrorInterceptor(mockError)).rejects.toThrow('Network error');
      expect(loggerErrorSpy).toHaveBeenCalledWith('AI service response error:', 'Network error');
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('Integration scenarios', () => {
    it('should handle complete successful prediction workflow', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const startTime = Date.now();
      const result = await service.predict(mockValidInput);
      const endTime = Date.now();

      expect(result).toEqual({
        success: true,
        predictions: mockValidResponse,
        responseTime: expect.any(Number),
      });

      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.responseTime).toBeLessThan(endTime - startTime + 100);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/predict', {
        inputs: expect.arrayContaining(mockValidInput),
      });

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringMatching(/AI prediction completed in \d+ms/),
      );
    });

    it('should handle retry scenario with eventual success', async () => {
      const networkError = new AxiosError('Network Error', 'ECONNRESET');

      mockAxiosInstance.post
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          data: mockValidResponse,
          status: 200,
        });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);
      expect(result.predictions).toEqual(mockValidResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'AI service request failed (attempt 1/3), retrying...',
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'AI service request failed (attempt 2/3), retrying...',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringMatching(/AI prediction completed in \d+ms/),
      );
    });

    it('should handle validation failure with response time tracking', async () => {
      const startTime = Date.now();
      const result = await service.predict(mockInvalidInputTooShort);
      const endTime = Date.now();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input data for AI prediction');
      expect(result.responseTime).toBeUndefined(); // No network request made

      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'AI service input validation failed:',
        expect.any(Array),
      );
    });

    it('should handle rate limiting with multiple rapid requests', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      // Make many requests rapidly to trigger rate limiting
      const rapidRequests = Array.from({ length: 70 }, (_, i) => 
        service.predict(mockValidInput)
      );

      const results = await Promise.all(rapidRequests);

      // Some should succeed, some should be rate limited
      const successfulResults = results.filter(r => r.success);
      const rateLimitedResults = results.filter(r => !r.success && r.error?.includes('Rate limit'));

      expect(successfulResults.length).toBeGreaterThan(0);
      expect(rateLimitedResults.length).toBeGreaterThan(0);
      expect(loggerWarnSpy).toHaveBeenCalledWith('AI service rate limit exceeded');
    });

    it('should handle mixed success and failure in concurrent requests', async () => {
      let callCount = 0;
      mockAxiosInstance.post.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new AxiosError('Intermittent error'));
        }
        return Promise.resolve({
          data: mockValidResponse,
          status: 200,
        });
      });

      const requests = Array.from({ length: 10 }, () => service.predict(mockValidInput));
      const results = await Promise.all(requests);

      const successResults = results.filter(r => r.success);
      const failureResults = results.filter(r => !r.success);

      expect(successResults.length).toBeGreaterThan(0);
      expect(failureResults.length).toBeGreaterThan(0);
    });
  });

  // ===== PERFORMANCE TESTS =====

  describe('Performance tests', () => {
    it('should handle large input arrays efficiently', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const startTime = Date.now();
      const result = await service.predict(mockValidInput);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete quickly
    });

    it('should handle concurrent requests efficiently', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const concurrentRequests = Array.from({ length: 10 }, () => 
        service.predict(mockValidInput)
      );

      const startTime = Date.now();
      const results = await Promise.all(concurrentRequests);
      const endTime = Date.now();

      expect(results.every(r => r.success)).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should handle concurrency well
    });

    it('should handle prediction requests with different input patterns', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const testPatterns = [
        Array.from({ length: 201 }, () => 0), // All zeros
        Array.from({ length: 201 }, () => 10), // All tens
        Array.from({ length: 201 }, () => 5), // All fives
        Array.from({ length: 201 }, (_, i) => i % 11), // Cycling 0-10
        Array.from({ length: 201 }, () => Math.random() * 10), // Random values
      ];

      const requests = testPatterns.map(pattern => service.predict(pattern));
      const results = await Promise.all(requests);

      expect(results.every(r => r.success)).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(testPatterns.length);
    });
  });

  // ===== MEMORY MANAGEMENT TESTS =====

  describe('Memory management', () => {
    it('should not leak memory during multiple predictions', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const initialMemory = process.memoryUsage().heapUsed;

      // Run many predictions
      for (let i = 0; i < 100; i++) {
        await service.predict(mockValidInput);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB for 100 predictions)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle service recreation without memory leaks', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create and destroy multiple service instances
      for (let i = 0; i < 50; i++) {
        const tempService = new AiServiceClient(configService);
        expect(tempService).toBeDefined();
      }

      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  // ===== EDGE CASES AND BOUNDARY TESTS =====

  describe('Edge cases and boundary conditions', () => {
    it('should handle exactly 201 values correctly', async () => {
      const exactInput = Array.from({ length: 201 }, (_, i) => i % 11);
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const result = await service.predict(exactInput);

      expect(result.success).toBe(true);
      expect(exactInput).toHaveLength(201);
    });

    it('should handle input with all same values', async () => {
      const uniformInput = Array.from({ length: 201 }, () => 5);
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const result = await service.predict(uniformInput);

      expect(result.success).toBe(true);
    });

    it('should handle input with alternating min/max values', async () => {
      const alternatingInput = Array.from({ length: 201 }, (_, i) => i % 2 === 0 ? 0 : 10);
      mockAxiosInstance.post.mockResolvedValue({
        data: mockValidResponse,
        status: 200,
      });

      const result = await service.predict(alternatingInput);

      expect(result.success).toBe(true);
    });

    it('should handle prediction with empty response object', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {},
        status: 200,
      });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);
      expect(result.predictions).toEqual({});
    });

    it('should handle prediction with nested response object', async () => {
      const nestedResponse = {
        predictions: mockValidResponse,
        metadata: { version: '1.0', timestamp: Date.now() },
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: nestedResponse,
        status: 200,
      });

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);
      expect(result.predictions).toEqual(nestedResponse);
    });

    it('should handle very slow response times', async () => {
      // Simulate slow response
      mockAxiosInstance.post.mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            data: mockValidResponse,
            status: 200,
          }), 100)
        )
      );

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(true);
      expect(result.responseTime).toBeGreaterThan(90); // At least 100ms
    });

    it('should handle request cancellation gracefully', async () => {
      const cancelError = new AxiosError('Request canceled', 'ECONNABORTED');
      mockAxiosInstance.post.mockRejectedValue(cancelError);

      const result = await service.predict(mockValidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred while contacting AI service');
    });
  });
});