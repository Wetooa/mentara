/**
 * Main API Entry Point
 * Simple, unified interface for all API operations
 */

import { apiClient, createApiClient } from "./client";
import {
  createAdminService,
  type AdminService,
} from "./services/admin";
import { createAuthService, type AuthService } from "./services/auth";
import {
  createBookingService,
  type BookingService,
} from "./services/booking";
import {
  createCommunityService,
  type CommunityService,
} from "./services/communities";
import {
  createDashboardService,
  type DashboardService,
} from "./services/dashboard";
import {
  createFilesService,
  type FilesService,
} from "./services/files";
import {
  createMeetingsService,
  type MeetingsService,
} from "./services/meetings";
import {
  createMessagingService,
  type MessagingService,
} from "./services/messaging";
import {
  createNotificationService,
  type NotificationService,
} from "./services/notifications";
import {
  createPreAssessmentService,
  type PreAssessmentService,
} from "./services/pre-assessment";
import {
  createProfileService,
  type PublicProfileResponse,
  type UpdateProfileRequest,
  type UpdateProfileResponse,
} from "./services/profile";
import {
  createSearchService,
  type SearchService,
} from "./services/search";
import {
  createTherapistService,
  type TherapistService,
} from "./services/therapists";
export type { ApiError, ApiResponse } from "@/types/api";

// Export client utilities
export { apiClient, createApiClient };

// Export service creators
export { createAdminService, createAuthService, createBookingService, createCommunityService, createDashboardService, createFilesService, createMeetingsService, createMessagingService, createNotificationService, createPreAssessmentService, createProfileService, createSearchService, createTherapistService, type AdminService, type AuthService, type BookingService, type CommunityService, type DashboardService, type FilesService, type MeetingsService, type MessagingService, type NotificationService, type PreAssessmentService, type PublicProfileResponse, type SearchService, type TherapistService, type UpdateProfileRequest, type UpdateProfileResponse };

// Create service instances
const authService = createAuthService(apiClient);
const dashboardService = createDashboardService(apiClient);
const therapistService = createTherapistService(apiClient);
const communityService = createCommunityService(apiClient);
const meetingsService = createMeetingsService(apiClient);
const bookingService = createBookingService(apiClient);
const notificationService = createNotificationService(apiClient);
const searchService = createSearchService(apiClient);
const messagingService = createMessagingService(apiClient);
const filesService = createFilesService(apiClient);
const adminService = createAdminService(apiClient);
const profileService = createProfileService(apiClient);
const preAssessmentService = createPreAssessmentService(apiClient);

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
  messaging: messagingService,
  files: filesService,
  admin: adminService,
  profile: profileService,
  preAssessment: preAssessmentService,
};

// Export the main API type
export type MainApi = typeof api;

// Hook for React components to use the API
export function useApi() {
  return api;
}

// Re-export commonly used types from centralized type definitions
export type {
  AdminAuthResponse, ClientAuthResponse, ClientUser, EmailResponse, LoginDto, RegisterAdminDto, RegisterClientDto, RegisterModeratorDto, ResendOtpDto, SendOtpDto, SuccessMessageResponse, TherapistAuthResponse, VerifyOtpDto
} from "@/types/auth";

export type { ApiError, ApiResponse } from "@/types/api";
