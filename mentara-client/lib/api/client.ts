import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { auth } from "@clerk/nextjs/server";
import { apiConfig } from '../config/api';
import { handleApiError, MentaraApiError } from './errorHandler';

// Types for token getters
type TokenGetter = () => Promise<string | null>;

// Create axios instance factory
export const createAxiosClient = (getToken?: TokenGetter): AxiosInstance => {
  const client = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Include credentials for cross-origin requests
  });

  // Request interceptor for authentication
  client.interceptors.request.use(
    async (config) => {
      try {
        let token: string | null = null;

        if (getToken) {
          // Use provided token getter (for client-side)
          token = await getToken();
        } else if (typeof window === "undefined") {
          // Server-side: use Clerk's server auth
          try {
            const { getToken: serverGetToken } = await auth();
            token = await serverGetToken();
          } catch (error) {
            console.warn("Failed to get server-side token:", error);
          }
        } else {
          // Client-side fallback: try to get token from global Clerk instance
          if (typeof window !== "undefined" && (window as any).Clerk?.session) {
            try {
              token = await (window as any).Clerk.session.getToken();
            } catch (error) {
              console.warn("Failed to get client-side token:", error);
            }
          }
        }

        // Add auth header if token is available
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
            hasAuth: !!token,
            params: config.params,
          });
        }

        return config;
      } catch (error) {
        console.error('Request interceptor error:', error);
        return config;
      }
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and data extraction
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          dataType: typeof response.data,
        });
      }

      // Return just the data for successful responses
      return response.data;
    },
    (error) => {
      // Handle and transform errors
      const apiError = handleApiError(error);
      const mentaraError = new MentaraApiError(apiError);

      // Handle specific error cases
      if (apiError.status === 401) {
        // Unauthorized - potentially redirect to login
        if (typeof window !== "undefined") {
          // Only redirect on client-side
          console.warn('Unauthorized request detected. User may need to re-authenticate.');
          // You could dispatch a global auth event here
        }
      }

      return Promise.reject(mentaraError);
    }
  );

  return client;
};

// Default client instance (without specific token getter)
export const apiClient = createAxiosClient();

// Client factory for use with custom token getters
export const createApiClientWithAuth = (getToken: TokenGetter) => {
  return createAxiosClient(getToken);
};

// Helper function to create a request with automatic retry logic
export const createRetryableRequest = <T = any>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  maxRetries: number = apiConfig.maxRetries
): Promise<T> => {
  const makeRequest = async (attempt: number = 1): Promise<T> => {
    try {
      const response = await client.request<T>(config);
      return response as T; // Response interceptor already extracts data
    } catch (error: any) {
      // Check if we should retry
      if (attempt < maxRetries && error.status && error.status >= 500) {
        const delay = apiConfig.retryDelay(attempt - 1);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Retrying request in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest(attempt + 1);
      }
      
      throw error;
    }
  };

  return makeRequest();
};

export default apiClient;