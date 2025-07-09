import axios, { AxiosInstance } from "axios";

import { apiConfig } from "../config/api";
import { handleApiError, MentaraApiError } from "./errorHandler";

// Create the main axios client instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Log request in development (no authentication in base client)
      if (process.env.NODE_ENV === "development") {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
          hasAuth: false,
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
apiClient.interceptors.response.use(
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

export default apiClient;
