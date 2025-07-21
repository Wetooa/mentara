/**
 * Main API Entry Point
 * Simple, unified interface for all API operations
 */

import { apiClient, createApiClient } from "./client";
import { createAuthService, type AuthService } from "./auth";
import {
  createDashboardService,
  type DashboardService,
} from "./services/dashboard";
import {
  createTherapistService,
  type TherapistService,
} from "./services/therapists";
import {
  createCommunityService,
  type CommunityService,
} from "./services/communities";
import {
  createMeetingsService,
  type MeetingsService,
} from "./services/meetings";
import {
  createBookingService,
  type BookingService,
} from "./services/booking";
import {
  createNotificationService,
  type NotificationService,
} from "./services/notifications";
import {
  createSearchService,
  type SearchService,
} from "./services/search";
export type { ApiResponse, ApiError } from "./types";

// Export client utilities
export { apiClient, createApiClient };

// Export service creators
export { createAuthService, type AuthService };
export { createDashboardService, type DashboardService };
export { createTherapistService, type TherapistService };
export { createCommunityService, type CommunityService };
export { createMeetingsService, type MeetingsService };
export { createBookingService, type BookingService };
export { createNotificationService, type NotificationService };
export { createSearchService, type SearchService };

// Create service instances
const authService = createAuthService(apiClient);
const dashboardService = createDashboardService(apiClient);
const therapistService = createTherapistService(apiClient);
const communityService = createCommunityService(apiClient);
const meetingsService = createMeetingsService(apiClient);
const bookingService = createBookingService(apiClient);
const notificationService = createNotificationService(apiClient);
const searchService = createSearchService(apiClient);

// Create and export the main API instance with backwards compatible structure
export const api = {
  // New unified structure
  auth: authService,
  dashboard: dashboardService,
  therapists: therapistService,
  communities: communityService,
  meetings: meetingsService,
  booking: bookingService,
  notifications: notificationService,
  search: searchService,

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
} from "./types";
