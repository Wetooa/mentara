import axios, { AxiosInstance, AxiosError } from "axios";
import { TOKEN_STORAGE_KEY } from "@/lib/constants/auth";

/**
 * Create and configure the main API client
 * Simple axios instance with basic configuration
 */
export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - add auth token if available
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage (client-side only)
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle common errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle 401 errors (unauthorized) - but only for authenticated requests
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
          const currentPath = window.location.pathname;
          
          // Only redirect if user had a token (session expired) and not already on login page
          if (currentToken && !currentPath.includes("/auth/sign-in")) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            window.location.href = "/auth/sign-in";
          }
          // If no token or already on login page, let the error bubble up normally
          // This allows login form error handling to work properly
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

// Export the default client instance
export const apiClient = createApiClient();
