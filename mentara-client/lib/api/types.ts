/**
 * API Types - Re-exported from mentara-commons for consistency
 * All API-related types should come from the shared commons library
 */

// Authentication Types
export type {
  // DTOs (Data Transfer Objects)
  LoginDto,
  RegisterClientDto,
  RegisterAdminDto,
  RegisterModeratorDto,
  VerifyOtpDto,
  SendOtpDto,
  ResendOtpDto,
  
  // Response Types
  ClientAuthResponse,
  AdminAuthResponse,
  TherapistAuthResponse,
  EmailResponse,
  SuccessMessageResponse,
  
  // User Types (if these exist in mentara-commons)
  // ClientUser,
  // AdminUser,
  // TherapistUser,
  // ModeratorUser,
  
  // OTP Types
  OtpType,
  OtpEmailData,
  
} from 'mentara-commons';

// API Response wrapper for consistency
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: 'success' | 'error';
}

// Error response structure
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Basic User types for Module 1 (temporary - should come from mentara-commons)
export interface ClientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client';
  emailVerified: boolean;
}