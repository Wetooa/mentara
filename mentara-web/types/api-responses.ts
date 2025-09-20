/**
 * API Response types and structures
 * Used for typing API responses and request/response patterns
 */

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response wrapper
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Common response types
export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  code?: string;
}

// Authentication response types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse<T = any> {
  user: T;
  tokens: TokenPair;
  isFirstLogin?: boolean;
}

// Email response types
export interface EmailResponse {
  success: boolean;
  message: string;
  sentTo?: string;
}

// OTP response types
export interface OtpEmailData {
  email: string;
  otpCode: string;
  expiresAt: string;
}

// File upload response
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// Search response
export interface SearchResponse<T = any> {
  results: T[];
  total: number;
  query: string;
  filters?: Record<string, any>;
  executionTime: number;
}

// Statistics response
export interface StatsResponse {
  period: string;
  data: Record<string, number | string>;
  trends?: {
    field: string;
    change: number;
    period: string;
  }[];
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: string;
  version: string;
  services?: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    email: 'up' | 'down';
  };
}

// API Error class
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}