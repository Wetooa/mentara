/**
 * Simple Error Handler for API responses
 * Temporary implementation for Module 1
 */

export class MentaraApiError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, status: number = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'MentaraApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromAxiosError(error: {
    response?: {
      status: number;
      data?: {
        message?: string;
        error?: string | { message?: string };
        code?: string;
        errors?: string[];
      };
    };
    request?: unknown;
    message?: string;
  }): MentaraApiError {
    if (error.response) {
      // Extract message from various response formats
      const message = 
        error.response.data?.message || 
        error.response.data?.error?.message ||
        error.response.data?.error ||
        (Array.isArray(error.response.data?.errors) && error.response.data.errors[0]) ||
        'An error occurred';
      
      return new MentaraApiError(
        message,
        error.response.status,
        error.response.data?.code,
        error.response.data
      );
    } else if (error.request) {
      return new MentaraApiError('Network error: No response received', 0, 'NETWORK_ERROR');
    } else {
      return new MentaraApiError(error.message || 'An unknown error occurred', 0, 'UNKNOWN_ERROR');
    }
  }
}

/**
 * Extract user-friendly error message from various error formats
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof MentaraApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message) {
      return err.message;
    }
  }
  
  return 'An unexpected error occurred';
}

// Export for backwards compatibility
export { MentaraApiError as ApiError };