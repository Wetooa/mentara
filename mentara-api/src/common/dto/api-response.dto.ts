/**
 * Error detail interface for structured error information
 */
export interface ErrorDetail {
  field?: string;
  code: string;
  message: string;
}

/**
 * Consolidated API Response interface - single source of truth
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ErrorDetail[];
  timestamp?: string;
  path?: string;
  statusCode?: number;
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated API Response interface
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * Standard API Response wrapper for all endpoints
 */
export class ApiResponseDto<T> implements ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ErrorDetail[];
  timestamp?: string;
  path?: string;
  statusCode?: number;

  constructor(data?: T, message?: string, success: boolean = true) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data?: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto(data, message, true);
  }

  static error<T>(
    message: string, 
    errors?: ErrorDetail[], 
    statusCode?: number, 
    path?: string
  ): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>(undefined, message, false);
    response.errors = errors;
    response.statusCode = statusCode;
    response.path = path;
    return response;
  }

  /**
   * Helper method to convert legacy string[] errors to ErrorDetail[]
   */
  static convertStringErrorsToDetails(errors: string[]): ErrorDetail[] {
    return errors.map(error => ({
      code: 'GENERIC',
      message: error
    }));
  }
}

/**
 * Paginated API Response wrapper for list endpoints
 */
export class PaginatedResponseDto<T> implements PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  message?: string;
  errors?: ErrorDetail[];
  timestamp?: string;
  path?: string;
  statusCode?: number;

  constructor(
    data: T[],
    meta: PaginationMeta,
    message?: string,
    success: boolean = true
  ) {
    this.success = success;
    this.data = data;
    this.meta = meta;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(
    data: T[],
    meta: PaginationMeta,
    message?: string
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(data, meta, message, true);
  }

  static error<T>(
    message: string,
    errors?: ErrorDetail[],
    statusCode?: number,
    path?: string
  ): PaginatedResponseDto<T> {
    const response = new PaginatedResponseDto<T>([], {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }, message, false);
    response.errors = errors;
    response.statusCode = statusCode;
    response.path = path;
    return response;
  }
}

/**
 * Helper function to create pagination meta
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Success response DTO for endpoints that only return a message
 */
export class SuccessMessageDto implements ApiResponse<never> {
  success: boolean = true;
  message: string;
  timestamp: string;

  constructor(message: string) {
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}

// Note: Types are already exported above as interfaces, no need to re-export