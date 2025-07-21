import { User } from '@prisma/client';

// Re-export User for external modules
export type { User };

/**
 * Global types used across multiple modules in the application
 */

// JWT Payload interface
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extended Express Request interface  
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      user?: User | undefined;
    }
  }
}

// Import UserRole from enums
import { UserRole } from './enums';

// Re-export UserRole for external modules
export type { UserRole };

// Common query parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterQuery {
  userId?: string;
  therapistId?: string;
  communityId?: string;
  postId?: string;
  type?: string;
  difficulty?: string;
  status?: string;
}

// API Response wrappers
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

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
}

// Request User type (for authenticated requests)
export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}