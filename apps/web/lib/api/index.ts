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
  createClientService,
  type ClientService,
} from "./services/client";
import {
  createCommunityService,
  type CommunityService,
} from "./services/communities";
import {
  createDashboardService,
  type DashboardService,
} from "./services/dashboard";
import {
  createGroupSessionsService,
  type GroupSessionsService,
} from "./services/group-sessions";
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
import {
  createWorksheetService,
  type WorksheetsService,
} from "./services/worksheets";
import {
  createBillingService,
  type BillingService,
} from "./services/billing";
import {
  createVideoCallService,
  type VideoCallService,
} from "./services/video-calls";
import {
  createJournalService,
  type JournalService,
} from "./services/journal";
import {
  createAuditLogsService,
  type AuditLogsService,
} from "./services/audit-logs";
import {
  createPackagesService,
  type PackagesService,
} from "./services/packages";

export type { ApiError, ApiResponse } from "@/types/api";

// Export client utilities
export { apiClient, createApiClient };

// Export service creators
export { createAdminService, createAuthService, createBookingService, createClientService, createCommunityService, createDashboardService, createFilesService, createGroupSessionsService, createMeetingsService, createMessagingService, createNotificationService, createPreAssessmentService, createProfileService, createSearchService, createTherapistService, createWorksheetService, createBillingService, createVideoCallService, createJournalService, createAuditLogsService, createPackagesService, type AdminService, type AuthService, type BookingService, type ClientService, type CommunityService, type DashboardService, type FilesService, type GroupSessionsService, type MeetingsService, type MessagingService, type NotificationService, type PreAssessmentService, type PublicProfileResponse, type SearchService, type TherapistService, type UpdateProfileRequest, type UpdateProfileResponse, type WorksheetsService, type BillingService, type VideoCallService, type JournalService, type AuditLogsService, type PackagesService };

// Create service instances
const authService = createAuthService(apiClient);
const clientService = createClientService(apiClient);
const dashboardService = createDashboardService(apiClient);
const therapistService = createTherapistService(apiClient);
const communityService = createCommunityService(apiClient);
const groupSessionsService = createGroupSessionsService(apiClient);
const meetingsService = createMeetingsService(apiClient);
const bookingService = createBookingService(apiClient);
const notificationService = createNotificationService(apiClient);
const searchService = createSearchService(apiClient);
const messagingService = createMessagingService(apiClient);
const filesService = createFilesService(apiClient);
const adminService = createAdminService(apiClient);
const profileService = createProfileService(apiClient);
const preAssessmentService = createPreAssessmentService(apiClient);
const worksheetService = createWorksheetService(apiClient);
const billingService = createBillingService(apiClient);
const videoCallService = createVideoCallService(apiClient);
const journalService = createJournalService(apiClient);
const auditLogsService = createAuditLogsService(apiClient);
const packagesService = createPackagesService(apiClient);

// Create and export the main API instance with backwards compatible structure
export const api = {
  // New unified structure
  auth: authService,
  client: clientService,
  dashboard: dashboardService,
  therapists: therapistService,
  communities: communityService,
  groupSessions: groupSessionsService,
  meetings: meetingsService,
  booking: bookingService,
  notifications: notificationService,
  search: searchService,
  messaging: messagingService,
  files: filesService,
  admin: adminService,
  profile: profileService,
  preAssessment: preAssessmentService,
  worksheets: worksheetService,
  billing: billingService, // Stub billing service for backwards compatibility
  videoCalls: videoCallService,
  journal: journalService,
  auditLogs: auditLogsService,
  packages: packagesService,

  therapistAuth: authService.therapist, // Backwards compatibility
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
