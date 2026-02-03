/**
 * API Response types and structures
 * Used for typing API responses and request/response patterns
 */

// Generic API response wrapper
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Pagination metadata
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response wrapper
interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Common response types
interface SuccessResponse {
  success: boolean;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  code?: string;
}

// Authentication response types
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse<T = any> {
  user: T;
  tokens: TokenPair;
  isFirstLogin?: boolean;
}

// Email response types
interface EmailResponse {
  success: boolean;
  message: string;
  sentTo?: string;
}

// OTP response types
interface OtpEmailData {
  email: string;
  otpCode: string;
  expiresAt: string;
}

// File upload response
interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// Search response
interface SearchResponse<T = any> {
  results: T[];
  total: number;
  query: string;
  filters?: Record<string, any>;
  executionTime: number;
}

// Statistics response
interface StatsResponse {
  period: string;
  data: Record<string, number | string>;
  trends?: {
    field: string;
    change: number;
    period: string;
  }[];
}

// Health check response
interface HealthCheckResponse {
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
class ApiError extends Error {
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