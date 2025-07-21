import type { ApiResponse, PaginatedResponse, PaginationMeta } from '../../types';

/**
 * Standard API Response wrapper for all endpoints
 */
export class ApiResponseDto<T> implements ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field?: string;
    code: string;
    message: string;
  }>;

  constructor(data?: T, message?: string, success: boolean = true) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  static success<T>(data?: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto(data, message, true);
  }

  static error<T>(message: string, errors?: Array<{ field?: string; code: string; message: string }>): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>(undefined, message, false);
    response.errors = errors;
    return response;
  }
}

/**
 * Paginated API Response wrapper for list endpoints
 */
export class PaginatedResponseDto<T> implements PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
  errors?: Array<{
    field?: string;
    code: string;
    message: string;
  }>;

  constructor(
    data: T[],
    pagination: PaginationMeta,
    message?: string,
    success: boolean = true
  ) {
    this.success = success;
    this.data = data;
    this.pagination = pagination;
    this.message = message;
  }

  static success<T>(
    data: T[],
    pagination: PaginationMeta,
    message?: string
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(data, pagination, message, true);
  }

  static error<T>(
    message: string,
    errors?: Array<{ field?: string; code: string; message: string }>
  ): PaginatedResponseDto<T> {
    const response = new PaginatedResponseDto<T>([], {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }, message, false);
    response.errors = errors;
    return response;
  }
}

/**
 * Simple success message response
 */
export class SuccessMessageDto {
  success: boolean = true;
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

/**
 * Utility function to create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}