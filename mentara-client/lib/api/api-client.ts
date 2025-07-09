import { useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { apiConfig } from '../config/api';
import { handleApiError, MentaraApiError } from './errorHandler';
import { createApiServices, ApiServices } from './services';

// Hook to use the API client in React components
export const useApi = (): ApiServices => {
  const { getToken } = useAuth();
  
  // Create authenticated axios client with memoization
  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Request interceptor for authentication
    instance.interceptors.request.use(
      async (config) => {
        try {
          // Get token from Clerk auth hook
          const token = await getToken();

          // Add auth header if token is available
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          // Log request in development
          if (process.env.NODE_ENV === "development") {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
              hasAuth: !!token,
              params: config.params,
            });
          }

          return config;
        } catch (error) {
          console.error("Request interceptor error:", error);
          return config;
        }
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and data extraction
    instance.interceptors.response.use(
      (response) => {
        // Log response in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            `📥 ${response.config.method?.toUpperCase()} ${response.config.url}`,
            {
              status: response.status,
              dataType: typeof response.data,
            }
          );
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
            console.warn(
              "Unauthorized request detected. User may need to re-authenticate."
            );
          }
        }

        return Promise.reject(mentaraError);
      }
    );

    return instance;
  }, [getToken]);

  // Return all services using the authenticated client
  return createApiServices(client);
};

// For use outside of React components (server-side, utilities, etc.)
export const createStandaloneApiClient = (): ApiServices => {
  // For standalone use without React context, create a basic client
  // This will be used for public endpoints or server-side operations
  const instance = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const apiError = handleApiError(error);
      const mentaraError = new MentaraApiError(apiError);
      return Promise.reject(mentaraError);
    }
  );

  return createApiServices(instance);
};

// Default API client (same as useApi but for consistency)
export const publicApi = createApiServices(apiClient);

// Export types for TypeScript support
export type { ApiServices };
export * from './services';