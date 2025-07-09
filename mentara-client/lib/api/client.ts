import axios, { AxiosInstance } from "axios";
import { apiConfig } from "../config/api";
import { handleApiError, MentaraApiError } from "./errorHandler";

// Token provider function type
type TokenProvider = () => Promise<string | null>;

// Global token provider (will be set by the main API)
let globalTokenProvider: TokenProvider | null = null;

// Function to set the token provider
export const setTokenProvider = (provider: TokenProvider) => {
  globalTokenProvider = provider;
};

// Create the base axios client instance
export const createAxiosClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Request interceptor for authentication
  client.interceptors.request.use(
    async (config) => {
      try {
        let token: string | null = null;

        // Use the global token provider if available
        if (globalTokenProvider) {
          token = await globalTokenProvider();
        }

        // Log request in development
        if (process.env.NODE_ENV === "development") {
          console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
            hasAuth: !!token,
            params: config.params,
          });
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
  client.interceptors.response.use(
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

  return client;
};

// Export a default client instance for backward compatibility
export const axiosClient = createAxiosClient();