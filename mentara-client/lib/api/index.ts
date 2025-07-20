/**
 * Main API Entry Point
 * Simple, unified interface for all API operations
 */

import { apiClient, createApiClient } from './client';
import { createAuthService, type AuthService } from './auth';
export type { ApiResponse, ApiError } from './types';

// Export client utilities
export { apiClient, createApiClient };

// Export auth service creator
export { createAuthService, type AuthService };

// Create auth service instance
const authService = createAuthService(apiClient);

// Create and export the main API instance with backwards compatible structure
export const api = {
  // New unified structure
  auth: authService,
  
  // Backwards compatible structure for existing hooks
  clientAuth: authService.client,
  adminAuth: authService.admin,
  moderatorAuth: authService.moderator,
  therapistAuth: authService.therapist,
};

// Export the main API type
export type MainApi = typeof api;

// Hook for React components to use the API
export function useApi() {
  return api;
}

// For backwards compatibility with hooks that might expect this pattern
export function createAuthServiceInstance() {
  return createAuthService(apiClient);
}

// Re-export commonly used types from mentara-commons and local types
export type {
  LoginDto,
  RegisterClientDto,
  RegisterAdminDto,
  RegisterModeratorDto,
  VerifyOtpDto,
  SendOtpDto,
  ResendOtpDto,
  ClientAuthResponse,
  AdminAuthResponse,
  TherapistAuthResponse,
  EmailResponse,
  SuccessMessageResponse,
  ClientUser,
  ApiResponse,
  ApiError,
} from './types';