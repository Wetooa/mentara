import { z } from 'zod';

// Admin Creation and Update Schemas
export const CreateAdminDtoSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  permissions: z.array(z.string()).optional(),
  adminLevel: z.string().optional()
});

export const UpdateAdminDtoSchema = z.object({
  permissions: z.array(z.string()).optional(),
  adminLevel: z.string().optional()
});

// Admin Response Schema (updated from class-validator interface)
export const AdminResponseDtoSchema = z.object({
  userId: z.string(),
  permissions: z.array(z.string()).optional(),
  adminLevel: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Admin Query Parameters
export const AdminQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  adminLevel: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'adminLevel']).optional()
});

// Admin User Management Query Parameters
export const AdminUserQuerySchema = z.object({
  role: z.enum(['client', 'therapist', 'moderator', 'admin']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'email', 'role']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Admin ID Parameter Schema
export const AdminIdParamSchema = z.object({
  id: z.string().uuid('Invalid admin ID format')
});

// Admin Therapist Management Schemas
export const ApproveTherapistDtoSchema = z.object({
  approvalMessage: z.string().min(10, 'Approval message must be at least 10 characters').optional(),
  verifyLicense: z.boolean().default(false),
  grantSpecialPermissions: z.array(z.string()).optional(),
});

export const RejectTherapistDtoSchema = z.object({
  rejectionReason: z.enum([
    'incomplete_documentation',
    'invalid_license',
    'failed_verification',
    'policy_violation',
    'other'
  ]),
  rejectionMessage: z.string().min(20, 'Rejection message must be at least 20 characters'),
  allowReapplication: z.boolean().default(true),
});

export const UpdateTherapistStatusDtoSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended', 'under_review']),
  reason: z.string().min(10, 'Status change reason required').optional(),
});

export const PendingTherapistFiltersDtoSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  province: z.string().optional(),
  submittedAfter: z.string().datetime().optional(),
  processedBy: z.string().optional(),
  providerType: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

// Export type inference helpers
export type CreateAdminDto = z.infer<typeof CreateAdminDtoSchema>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminDtoSchema>;
export type AdminResponseDto = z.infer<typeof AdminResponseDtoSchema>;
export type AdminQuery = z.infer<typeof AdminQuerySchema>;
export type AdminUserQuery = z.infer<typeof AdminUserQuerySchema>;
export type AdminIdParam = z.infer<typeof AdminIdParamSchema>;

// Admin Analytics Query Schema
export const AdminAnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Admin User Management DTOs
export const AdminUserListParamsDtoSchema = z.object({
  role: z.enum(['client', 'therapist', 'moderator', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'email', 'role']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const AdminUserGrowthParamsDtoSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day')
});

export const AdminEngagementParamsDtoSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day')
});

export const AdminModerationReportParamsDtoSchema = z.object({
  type: z.string().optional(),
  status: z.enum(['pending', 'resolved', 'dismissed']).optional(),
  assignedTo: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

export const AdminTherapistApplicationParamsDtoSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

export const AdminTherapistApplicationFiltersDtoSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  province: z.string().optional(),
  submittedAfter: z.string().datetime().optional(),
  processedBy: z.string().optional(),
  providerType: z.string().optional(),
  limit: z.number().min(1).max(100).default(50)
});

export const AdminMatchingPerformanceParamsDtoSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const AdminFlaggedContentParamsDtoSchema = z.object({
  type: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50)
});

// Admin Therapist Management Types
export type ApproveTherapistDto = z.infer<typeof ApproveTherapistDtoSchema>;
export type RejectTherapistDto = z.infer<typeof RejectTherapistDtoSchema>;
export type UpdateTherapistStatusDto = z.infer<typeof UpdateTherapistStatusDtoSchema>;
export type PendingTherapistFiltersDto = z.infer<typeof PendingTherapistFiltersDtoSchema>;
export type AdminAnalyticsQuery = z.infer<typeof AdminAnalyticsQuerySchema>;
export type AdminUserListParamsDto = z.infer<typeof AdminUserListParamsDtoSchema>;
export type AdminUserGrowthParamsDto = z.infer<typeof AdminUserGrowthParamsDtoSchema>;
export type AdminEngagementParamsDto = z.infer<typeof AdminEngagementParamsDtoSchema>;
export type AdminModerationReportParamsDto = z.infer<typeof AdminModerationReportParamsDtoSchema>;
export type AdminTherapistApplicationParamsDto = z.infer<typeof AdminTherapistApplicationParamsDtoSchema>;
export type AdminTherapistApplicationFiltersDto = z.infer<typeof AdminTherapistApplicationFiltersDtoSchema>;
export type AdminMatchingPerformanceParamsDto = z.infer<typeof AdminMatchingPerformanceParamsDtoSchema>;
export type AdminFlaggedContentParamsDto = z.infer<typeof AdminFlaggedContentParamsDtoSchema>;

// Additional admin types moved from frontend services
export const SystemStatsSchema = z.object({
  totalUsers: z.number().min(0),
  totalClients: z.number().min(0),
  totalTherapists: z.number().min(0),
  pendingApplications: z.number().min(0),
  totalCommunities: z.number().min(0),
  totalPosts: z.number().min(0),
  totalSessions: z.number().min(0),
  growth: z.object({
    usersGrowth: z.number(),
    clientsGrowth: z.number(),
    therapistsGrowth: z.number(),
    sessionsGrowth: z.number()
  })
});

export const UserGrowthDataSchema = z.object({
  date: z.string().datetime(),
  totalUsers: z.number().min(0),
  newUsers: z.number().min(0),
  activeUsers: z.number().min(0),
  userType: z.string().min(1)
});

export const EngagementDataSchema = z.object({
  date: z.string().datetime(),
  pageViews: z.number().min(0),
  uniqueVisitors: z.number().min(0),
  sessionDuration: z.number().min(0),
  bounceRate: z.number().min(0).max(100)
});

export const AdminModerationReportSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  status: z.enum(['pending', 'resolved', 'dismissed']),
  reportedBy: z.string().min(1),
  contentId: z.string().min(1),
  contentType: z.enum(['post', 'comment', 'user', 'message']),
  reason: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const UpdateModerationReportRequestSchema = z.object({
  status: z.enum(['pending', 'resolved', 'dismissed']).optional(),
  assignedTo: z.string().optional(),
  moderatorNotes: z.string().optional()
});

export const SystemConfigSchema = z.object({
  siteName: z.string().min(1),
  siteUrl: z.string().url(),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  emailVerificationRequired: z.boolean(),
  maxFileSize: z.number().min(0),
  allowedFileTypes: z.array(z.string().min(1)),
  rateLimit: z.object({
    enabled: z.boolean(),
    requests: z.number().min(1),
    windowMs: z.number().min(1)
  })
});

export const FeatureFlagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100),
  conditions: z.record(z.any()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const UpdateFeatureFlagRequestSchema = z.object({
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  conditions: z.record(z.any()).optional()
});

export const AdminUserCreateRequestSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['client', 'therapist', 'moderator', 'admin']),
  password: z.string().min(8)
});

export const AdminUserUpdateRequestSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['client', 'therapist', 'moderator', 'admin']).optional(),
  isActive: z.boolean().optional()
});

export const UserRoleUpdateRequestSchema = z.object({
  role: z.enum(['client', 'therapist', 'moderator', 'admin']),
  reason: z.string().optional()
});

export const UserSuspendRequestSchema = z.object({
  reason: z.string().min(1),
  duration: z.number().min(0).optional(),
  sendNotification: z.boolean().optional()
});

// Export type inference helpers for new schemas
export type SystemStats = z.infer<typeof SystemStatsSchema>;
export type UserGrowthData = z.infer<typeof UserGrowthDataSchema>;
export type EngagementData = z.infer<typeof EngagementDataSchema>;
export type AdminModerationReport = z.infer<typeof AdminModerationReportSchema>;
export type UpdateModerationReportRequest = z.infer<typeof UpdateModerationReportRequestSchema>;
export type SystemConfig = z.infer<typeof SystemConfigSchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type UpdateFeatureFlagRequest = z.infer<typeof UpdateFeatureFlagRequestSchema>;
export type AdminUserCreateRequest = z.infer<typeof AdminUserCreateRequestSchema>;
export type AdminUserUpdateRequest = z.infer<typeof AdminUserUpdateRequestSchema>;
export type UserRoleUpdateRequest = z.infer<typeof UserRoleUpdateRequestSchema>;
export type UserSuspendRequest = z.infer<typeof UserSuspendRequestSchema>;