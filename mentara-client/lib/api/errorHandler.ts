import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: Date;
}

export class MentaraApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "MentaraApiError";
    this.status = apiError.status;
    this.code = apiError.code;
    this.details = apiError.details;
    this.timestamp = apiError.timestamp;

    // Maintain proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MentaraApiError);
    }
  }
}

export const handleApiError = (error: AxiosError): ApiError => {
  const apiError: ApiError = {
    message: "An unexpected error occurred",
    status: error.response?.status || 500,
    code: error.code,
    details: error.response?.data,
    timestamp: new Date(),
  };

  // Handle specific error cases
  switch (error.response?.status) {
    case 401:
      apiError.message = "Authentication required. Please sign in.";
      break;
    case 403:
      apiError.message =
        "Permission denied. You don't have access to this resource.";
      break;
    case 404:
      apiError.message = "Resource not found.";
      break;
    case 408:
      apiError.message = "Request timeout. Please try again.";
      break;
    case 409:
      apiError.message =
        "Conflict occurred. The resource may have been modified.";
      break;
    case 422:
      apiError.message = "Validation failed. Please check your input.";
      break;
    case 429:
      apiError.message =
        "Too many requests. Please wait a moment and try again.";
      break;
    case 500:
      apiError.message = "Server error occurred. Please try again later.";
      break;
    case 502:
    case 503:
    case 504:
      apiError.message =
        "Service temporarily unavailable. Please try again later.";
      break;
    default:
      // Try to extract message from response data
      if (error.response?.data) {
        const responseData = error.response.data as any;
        apiError.message =
          responseData.message || responseData.error || apiError.message;
      } else if (error.message) {
        apiError.message = error.message;
      }
  }

  // Log error for monitoring (in development only to avoid log pollution)
  if (process.env.NODE_ENV === "development") {
    console.log("API Error:", {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: apiError.status,
      message: apiError.message,
      details: apiError.details,
      timestamp: apiError.timestamp,
    });
  }

  return apiError;
};

// Helper function to determine if an error should trigger a retry
export const shouldRetryRequest = (
  error: AxiosError,
  attemptNumber: number
): boolean => {
  // Don't retry if we've exceeded max attempts
  if (attemptNumber >= 3) return false;

  // Don't retry on client errors (4xx) except for specific cases
  const status = error.response?.status;
  if (status && status >= 400 && status < 500) {
    // Only retry on timeout (408) and rate limit (429)
    return [408, 429].includes(status);
  }

  // Retry on network errors and 5xx server errors
  return !status || status >= 500;
};

// Helper function to check if error is retryable
export const isRetryableError = (error: any): boolean => {
  // Network errors (no response)
  if (!error.response) return true;

  // Server errors (5xx)
  if (error.response.status >= 500) return true;

  // Specific retryable client errors
  return [408, 429].includes(error.response.status);
};
