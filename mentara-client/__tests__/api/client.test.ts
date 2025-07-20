import axios from 'axios';
import { createAxiosClient } from '@/lib/api/client';
import { MentaraApiError } from '@/lib/api/errorHandler';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Axios Client', () => {
  let mockCreate: jest.MockedFunction<typeof axios.create>;
  let mockClient: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock axios.create to return a mock client
    mockClient = {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      request: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
    
    mockCreate = mockedAxios.create as jest.MockedFunction<typeof axios.create>;
    mockCreate.mockReturnValue(mockClient);
  });

  describe('createAxiosClient', () => {
    it('should create axios client with correct configuration', () => {
      const client = createAxiosClient();

      expect(mockCreate).toHaveBeenCalledWith({
        baseURL: 'http://localhost:5000/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
    });

    it('should create client with custom token getter', () => {
      const getToken = jest.fn().mockResolvedValue('test-token');
      const client = createAxiosClient(getToken);

      expect(mockCreate).toHaveBeenCalled();
      expect(mockClient.interceptors.request.use).toHaveBeenCalled();
      expect(mockClient.interceptors.response.use).toHaveBeenCalled();
    });

    it('should add request interceptor for authentication', () => {
      const client = createAxiosClient();

      expect(mockClient.interceptors.request.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should add response interceptor for error handling', () => {
      const client = createAxiosClient();

      expect(mockClient.interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe('Request Interceptor', () => {
    it('should add authorization header when token is available', async () => {
      const getToken = jest.fn().mockResolvedValue('test-token');
      const client = createAxiosClient(getToken);

      // Get the request interceptor function
      const requestInterceptor = mockClient.interceptors.request.use.mock.calls[0][0];

      const config = {
        headers: {},
        method: 'GET',
        url: '/test',
      };

      const result = await requestInterceptor(config);

      expect(getToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add authorization header when token is not available', async () => {
      const getToken = jest.fn().mockResolvedValue(null);
      const client = createAxiosClient(getToken);

      const requestInterceptor = mockClient.interceptors.request.use.mock.calls[0][0];

      const config = {
        headers: {},
        method: 'GET',
        url: '/test',
      };

      const result = await requestInterceptor(config);

      expect(getToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should return response data on success', () => {
      const client = createAxiosClient();

      const responseInterceptor = mockClient.interceptors.response.use.mock.calls[0][0];

      const response = {
        data: { message: 'success' },
        status: 200,
        config: { method: 'GET', url: '/test' },
      };

      const result = responseInterceptor(response);

      expect(result).toEqual({ message: 'success' });
    });

    it('should transform axios errors to MentaraApiError', () => {
      const client = createAxiosClient();

      const errorInterceptor = mockClient.interceptors.response.use.mock.calls[0][1];

      const axiosError = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
        message: 'Request failed',
        config: { url: '/test', method: 'GET' },
      };

      expect(() => errorInterceptor(axiosError)).rejects.toThrow(MentaraApiError);
    });
  });
});