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
client.interceptors.request.use(
  async (config) => {
    try {
      let token: string | null = null;

      // Priority 1: Use the provided getToken function if available
      if (getToken) {
        try {
          token = await getToken();
        } catch (error) {
          console.warn("Failed to get token from provided getter:", error);
        }
      }

      // Priority 2: Client-side fallback: try to get token from global Clerk instance
      if (
        !token &&
        typeof window !== "undefined" &&
        (window as any).Clerk?.session
      ) {
        try {
          token = await (window as any).Clerk.session.getToken();
        } catch (error) {
          console.warn("Failed to get client-side token:", error);
        }
      }

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
client.interceptors.response.use(
  (response: AxiosResponse) => {
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

    // Handle wrapped API responses from NestJS ResponseInterceptor
    // Backend wraps responses in: { success: true, data: actualData, timestamp, path, statusCode }
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      "data" in response.data
    ) {
      return response.data.data; // Return the actual data from the wrapper
    }

    // Return just the data for successful responses (fallback for non-wrapped responses)
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
