import { AxiosInstance } from 'axios';
import { createUserService } from './users';
import { createTherapistService } from './therapists';
import { createReviewsService } from './reviews';
import { createBookingService } from './booking';
import { createCommunityService } from './communities';
import { createClientService } from './client';
import { createAuthService } from './auth';
import { createAdminService } from './admin';
import { createSearchService } from './search';
import { createFilesService } from './files';
import { createNotificationsService } from './notifications';
import { createMessagingService } from './messaging';
import { createPostsService } from './posts';
import { createCommentsService } from './comments';
import { createWorksheetsService } from './worksheets';
import { createPreAssessmentService } from './pre-assessment';
import { createTherapistApplicationService } from './therapist-application';
import { createSessionsService } from './sessions';
import { createAnalyticsService } from './analytics';
import { createAuditLogService } from './audit-logs';

// Main service factory that creates all services
export const createApiServices = (client: AxiosInstance) => ({
  auth: createAuthService(client),
  users: createUserService(client),
  therapists: createTherapistService(client),
  reviews: createReviewsService(client),
  booking: createBookingService(client),
  communities: createCommunityService(client),
  client: createClientService(client),
  admin: createAdminService(client),
  search: createSearchService(client),
  files: createFilesService(client),
  notifications: createNotificationsService(client),
  messaging: createMessagingService(client),
  posts: createPostsService(client),
  comments: createCommentsService(client),
  worksheets: createWorksheetsService(client),
  preAssessment: createPreAssessmentService(client),
  therapistApplication: createTherapistApplicationService(client),
  sessions: createSessionsService(client),
  analytics: createAnalyticsService(client),
  auditLogs: createAuditLogService(client),
});

export type ApiServices = ReturnType<typeof createApiServices>;

// Export individual service types
export type { AuthService } from './auth';
export type { UserService } from './users';
export type { TherapistService } from './therapists';
export type { ReviewsService } from './reviews';
export type { BookingService } from './booking';
export type { CommunityService } from './communities';
export type { ClientService } from './client';
export type { AdminService } from './admin';
export type { SearchService } from './search';
export type { FilesService } from './files';
export type { NotificationsService } from './notifications';
export type { MessagingService } from './messaging';
export type { PostsService } from './posts';
export type { CommentsService } from './comments';
export type { WorksheetsService } from './worksheets';
export type { PreAssessmentService } from './pre-assessment';
export type { TherapistApplicationService } from './therapist-application';
export type { SessionService } from './sessions';
export type { AnalyticsService } from './analytics';
export type { AuditLogService } from './audit-logs';

// Export all types
export * from './auth';
export * from './users';
export * from './therapists';
export * from './reviews';
export * from './booking';
export * from './communities';
export * from './client';
export * from './admin';
export * from './search';
export * from './files';
export * from './notifications';
export * from './messaging';
export * from './posts';
export * from './comments';
export * from './worksheets';
export * from './pre-assessment';
export * from './therapist-application';
export * from './sessions';
export * from './analytics';
export * from './audit-logs';