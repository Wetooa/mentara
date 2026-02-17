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
        
        // Comprehensive token logging in development
        if (process.env.NODE_ENV === "development") {
          if (token) {
            logger.debug(`[API Request] Token found (length: ${token.length}, preview: ${token.substring(0, 20)}...)`);
          } else {
            logger.warn(`[API Request] No token found in localStorage under key: ${TOKEN_STORAGE_KEY}`);
            // Check for token under alternative keys
            const altKeys = ['token', 'accessToken', 'authToken'];
            for (const key of altKeys) {
              const altToken = localStorage.getItem(key);
              if (altToken) {
                logger.warn(`[API Request] Found token under alternative key '${key}'. Consider migrating.`);
              }
            }
          }
        }
        
        if (token) {
          // Sanitize token (remove any quotes or whitespace)
          const sanitizedToken = token.trim().replace(/^["']|["']$/g, '');
          
          // Validate token format (basic JWT check - should have 3 parts separated by dots)
          const tokenParts = sanitizedToken.split('.');
          if (tokenParts.length === 3) {
            config.headers.Authorization = `Bearer ${sanitizedToken}`;
            
            if (process.env.NODE_ENV === "development") {
              logger.debug(`[API Request] Authorization header set for ${config.method?.toUpperCase()} ${config.url}`);
            }
          } else {
            logger.error(`[API Request] Invalid token format (expected JWT with 3 parts, got ${tokenParts.length} parts)`);
            // Still try to send it, but log the issue
            config.headers.Authorization = `Bearer ${sanitizedToken}`;
          }
        } else {
          // Log warning if token is missing for protected routes
          if (config.url && !config.url.includes('/auth/')) {
            logger.warn(`[API Request] No token found for ${config.method?.toUpperCase()} ${config.url} - request may fail with 401`);
          }
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
          const status = error.response?.status;
          
          // Only log full error details for server errors (5xx)
          // Client errors (4xx) are expected user errors - log minimally to avoid console spam
          if (status && status >= 500) {
            // Server errors - log as error
            logger.error(
              `[API Error] ${tracking.method} ${tracking.url} - ${status} (${duration}ms)`,
              { requestId, error: error.message }
            );
          } else if (process.env.NODE_ENV === "development") {
            // Client errors - only log in development, and use debug level
            logger.debug(
              `[API Client Error] ${tracking.method} ${tracking.url} - ${status || "Network Error"} (${duration}ms): ${error.message}`
            );
          }
          
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
        // Request made but no response received (network error or timeout)
        const baseURL = error.config?.baseURL || "unknown";
        const url = error.config?.url || "unknown";
        const fullUrl = `${baseURL}${url}`;
        const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
        const timeout = error.config?.timeout || 10000;
        const requestId = error.config?.metadata?.requestId;
        
        // Enhanced error logging
        const errorDetails = {
          errorType: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
          baseURL,
          url,
          fullUrl,
          message: error.message,
          code: error.code,
          timeout: isTimeout ? `${timeout}ms` : undefined,
          requestId,
          timestamp: new Date().toISOString(),
        };
        
        logger.error(`[API] ${isTimeout ? 'Timeout' : 'Network error'} - No response received:`, errorDetails);
        
        // Create more helpful error message
        let errorMessage: string;
        if (isTimeout) {
          errorMessage = `Request timeout: The server took longer than ${timeout / 1000}s to respond. This may indicate:
- The backend is processing a complex request (e.g., AI generation)
- The backend is overloaded
- Network connectivity issues

Please try again. If the issue persists, check if the backend is running at ${baseURL}`;
        } else {
          errorMessage = `Network error: Unable to connect to server at ${fullUrl}. 

Possible causes:
- Backend server is not running
- Network connectivity issues
- CORS configuration problems
- Firewall blocking the connection

Please check:
1. Is the backend running? (Check ${baseURL}/health)
2. Is the backend URL correct? (Current: ${baseURL})
3. Are there any network/firewall restrictions?`;
        }
        
        const networkError = new MentaraApiError(
          errorMessage,
          0,
          isTimeout ? "TIMEOUT_ERROR" : "NETWORK_ERROR",
          errorDetails
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

