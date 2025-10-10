/**
 * Simple Error Handler for API responses
 * Temporary implementation for Module 1
 */

export class MentaraApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'MentaraApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromAxiosError(error: any): MentaraApiError {
    if (error.response) {
      return new MentaraApiError(
        error.response.data?.message || 'An error occurred',
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

// Export for backwards compatibility
export { MentaraApiError as ApiError };