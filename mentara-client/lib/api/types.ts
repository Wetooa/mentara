/**
 * API Types - Re-exported from local types for consistency
 * All API-related types should come from our local type system
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
  
  // User Types
  ClientUser,
  AdminUser,
  TherapistUser,
  ModeratorUser,
  
  // OTP Types
  OtpType,
  OtpEmailData,
  
} from '../../types/auth';

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

// Basic User types for Module 1 - defined locally
export interface ClientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client';
  emailVerified: boolean;
}