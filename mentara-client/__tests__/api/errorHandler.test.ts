import { handleApiError, MentaraApiError, shouldRetryRequest } from '@/lib/api/errorHandler';
import { AxiosError } from 'axios';

describe('Error Handler', () => {
  describe('handleApiError', () => {
    it('should handle 401 unauthorized errors', () => {
      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        message: 'Request failed',
        config: {},
        code: 'UNAUTHORIZED',
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result.status).toBe(401);
      expect(result.message).toBe('Authentication required. Please sign in.');
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.details).toEqual({ message: 'Unauthorized' });
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle 404 not found errors', () => {
      const axiosError = {
        response: {
          status: 404,
          data: {},
        },
        message: 'Not found',
        config: {},
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result.status).toBe(404);
      expect(result.message).toBe('Resource not found.');
    });

    it('should handle 500 server errors', () => {
      const axiosError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
        message: 'Server error',
        config: {},
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result.status).toBe(500);
      expect(result.message).toBe('Server error occurred. Please try again later.');
    });

    it('should handle network errors without response', () => {
      const axiosError = {
        message: 'Network Error',
        config: {},
        code: 'NETWORK_ERROR',
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result.status).toBe(500);
      expect(result.message).toBe('Network Error');
      expect(result.code).toBe('NETWORK_ERROR');
    });

    it('should extract custom error message from response data', () => {
      const axiosError = {
        response: {
          status: 422,
          data: { message: 'Custom validation error' },
        },
        message: 'Validation failed',
        config: {},
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result.status).toBe(422);
      expect(result.message).toBe('Custom validation error');
    });
  });

  describe('MentaraApiError', () => {
    it('should create error with all properties', () => {
      const apiError = {
        message: 'Test error',
        status: 400,
        code: 'TEST_ERROR',
        details: { field: 'validation error' },
        timestamp: new Date(),
      };

      const error = new MentaraApiError(apiError);

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('MentaraApiError');
      expect(error.status).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'validation error' });
      expect(error.timestamp).toBe(apiError.timestamp);
    });
  });

  describe('shouldRetryRequest', () => {
    it('should not retry after max attempts', () => {
      const axiosError = {
        response: { status: 500 },
      } as AxiosError;

      const result = shouldRetryRequest(axiosError, 3);
      expect(result).toBe(false);
    });

    it('should retry on 500 server errors', () => {
      const axiosError = {
        response: { status: 500 },
      } as AxiosError;

      const result = shouldRetryRequest(axiosError, 1);
      expect(result).toBe(true);
    });

    it('should not retry on 400 client errors', () => {
      const axiosError = {
        response: { status: 400 },
      } as AxiosError;

      const result = shouldRetryRequest(axiosError, 1);
      expect(result).toBe(false);
    });

    it('should retry on 408 timeout errors', () => {
      const axiosError = {
        response: { status: 408 },
      } as AxiosError;

      const result = shouldRetryRequest(axiosError, 1);
      expect(result).toBe(true);
    });

    it('should retry on 429 rate limit errors', () => {
      const axiosError = {
        response: { status: 429 },
      } as AxiosError;

      const result = shouldRetryRequest(axiosError, 1);
      expect(result).toBe(true);
    });

    it('should retry on network errors', () => {
      const axiosError = {} as AxiosError; // No response = network error

      const result = shouldRetryRequest(axiosError, 1);
      expect(result).toBe(true);
    });
  });
});