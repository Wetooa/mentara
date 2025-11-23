import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { TOKEN_STORAGE_KEY } from "@/lib/constants/auth";
import { MentaraApiError } from "./errorHandler";
import { logger } from "@/lib/logger";

/**
 * Request tracking for debugging and monitoring
 */
interface RequestTracking {
  url: string;
  method: string;
  timestamp: number;
  requestId: string;
}

// In-memory request tracking (optional, for development/debugging)
const activeRequests = new Map<string, RequestTracking>();

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Setup request interceptors with tracking and enhanced auth
 */
export function setupRequestInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Generate request ID for tracking
      const requestId = generateRequestId();
      config.metadata = { requestId };

      // Get token from localStorage (client-side only)
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Track request in development mode
        if (process.env.NODE_ENV === "development") {
          const tracking: RequestTracking = {
            url: config.url || "",
            method: config.method?.toUpperCase() || "GET",
            timestamp: Date.now(),
            requestId,
          };
          activeRequests.set(requestId, tracking);
          
          // Log request in development
          logger.debug(`[API Request] ${tracking.method} ${tracking.url}`, {
            requestId,
            headers: config.headers,
          });
        }
      }

      // Add request timestamp header for debugging
      if (config.headers) {
        config.headers["X-Request-ID"] = requestId;
        config.headers["X-Request-Time"] = new Date().toISOString();
      }

      return config;
    },
    (error: AxiosError) => {
      // Handle request errors (always log errors)
      logger.error("[API Request Error]", error);
      return Promise.reject(error);
    }
  );
}

/**
 * Setup response interceptors with enhanced error handling
 */
export function setupResponseInterceptors(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => {
      // Track response in development mode
      const requestId = response.config.metadata?.requestId;
      if (process.env.NODE_ENV === "development" && requestId) {
        const tracking = activeRequests.get(requestId);
        if (tracking) {
          const duration = Date.now() - tracking.timestamp;
          logger.debug(
            `[API Response] ${tracking.method} ${tracking.url} - ${response.status} (${duration}ms)`,
            { requestId }
          );
          activeRequests.delete(requestId);
        }
      }

      // Check if response data has the backend's standardized format
      if (
        response.data &&
        typeof response.data === "object" &&
        "success" in response.data &&
        "data" in response.data
      ) {
        // If success is false, treat as an error
        if (!response.data.success) {
          const errorMessage =
            response.data.message || response.data.errors?.[0] || "Request failed";
          const error = new MentaraApiError(
            errorMessage,
            response.status,
            response.data.code,
            response.data.errors
          );
          return Promise.reject(error);
        }

        // Unwrap the data from the backend's standardized format
        response.data = response.data.data;
      }

      return response;
    },
    (error: AxiosError) => {
      // Clean up request tracking
      const requestId = error.config?.metadata?.requestId;
      if (requestId) {
        const tracking = activeRequests.get(requestId);
        if (tracking) {
          const duration = Date.now() - tracking.timestamp;
          logger.error(
            `[API Error] ${tracking.method} ${tracking.url} - ${error.response?.status || "Network Error"} (${duration}ms)`,
            { requestId, error: error.message }
          );
          if (process.env.NODE_ENV === "development") {
            activeRequests.delete(requestId);
          }
        }
      }

      // Enhanced error handling
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data as any;

        // Convert to MentaraApiError for consistent error handling
        const apiError = MentaraApiError.fromAxiosError(error);

        // Handle specific status codes
        switch (status) {
          case 401:
            // Unauthorized - handle token expiration
            handleUnauthorized(error, apiError);
            break;
          case 403:
            // Forbidden - user doesn't have permission
            logger.warn("[API] Forbidden access:", error.config?.url);
            break;
          case 404:
            // Not found
            logger.warn("[API] Resource not found:", error.config?.url);
            break;
          case 429:
            // Rate limited
            logger.warn("[API] Rate limit exceeded. Please try again later.");
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            // Server errors (always log)
            logger.error("[API] Server error:", status, error.config?.url);
            break;
        }

        return Promise.reject(apiError);
      } else if (error.request) {
        // Request made but no response received (network error)
        const baseURL = error.config?.baseURL || "unknown";
        const url = error.config?.url || "unknown";
        const fullUrl = `${baseURL}${url}`;
        
        logger.error("[API] Network error - No response received:", {
          baseURL,
          url,
          fullUrl,
          message: error.message,
          code: error.code,
        });
        
        const networkError = new MentaraApiError(
          `Network error: Unable to connect to server at ${fullUrl}. Please check that the backend is running and accessible.`,
          0,
          "NETWORK_ERROR",
          { 
            url: fullUrl,
            baseURL,
            message: error.message,
            code: error.code,
          }
        );
        return Promise.reject(networkError);
      } else {
        // Error setting up request
        return Promise.reject(
          new MentaraApiError(
            error.message || "An unknown error occurred",
            0,
            "UNKNOWN_ERROR"
          )
        );
      }
    }
  );
}

/**
 * Handle 401 unauthorized errors
 */
function handleUnauthorized(
  error: AxiosError,
  apiError: MentaraApiError
): void {
  if (typeof window === "undefined") {
    return; // Skip on server-side
  }

  const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const currentPath = window.location.pathname;

  // Only redirect if user had a token (session expired) and not already on login page
  if (currentToken && !currentPath.includes("/auth/sign-in")) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    
    // Store intended destination for redirect after login
    const redirectPath = window.location.pathname + window.location.search;
    if (redirectPath !== "/auth/sign-in") {
      sessionStorage.setItem("redirectAfterLogin", redirectPath);
    }
    
    // Redirect to login
    window.location.href = "/auth/sign-in";
  }
  // If no token or already on login page, let the error bubble up normally
  // This allows login form error handling to work properly
}

/**
 * Get active request count (for debugging)
 */
export function getActiveRequestCount(): number {
  return activeRequests.size;
}

/**
 * Clear all request tracking (for cleanup/testing)
 */
export function clearRequestTracking(): void {
  activeRequests.clear();
}

// Extend AxiosRequestConfig type to include metadata
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      requestId?: string;
      [key: string]: any;
    };
  }
}

