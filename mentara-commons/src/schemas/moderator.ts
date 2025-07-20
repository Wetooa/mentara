import { z } from 'zod';

// Moderator Schema
export const ModeratorSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  permissions: z.array(z.string()),
  status: z.enum(['active', 'inactive', 'suspended']),
  assignedCommunities: z.array(z.string()).optional(),
  moderationLevel: z.enum(['basic', 'advanced', 'admin']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastActiveAt: z.string().datetime().optional()
});

// Moderator Dashboard Stats Schema
export const ModeratorDashboardStatsSchema = z.object({
  pendingReports: z.number().min(0),
  pendingContent: z.number().min(0),
  resolvedToday: z.number().min(0),
  flaggedUsers: z.number().min(0),
  systemAlerts: z.number().min(0)
});

// Content Moderation Parameters Schema
export const ContentModerationParamsSchema = z.object({
  type: z.enum(['post', 'comment']).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'reportCount', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// User Moderation Parameters Schema
export const UserModerationParamsSchema = z.object({
  status: z.enum(['active', 'suspended', 'flagged']).optional(),
  role: z.enum(['client', 'therapist']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional()
});

// Audit Log Parameters Schema
export const AuditLogParamsSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

// System Event Parameters Schema
export const SystemEventParamsSchema = z.object({
  eventType: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  component: z.string().optional(),
  isResolved: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

// Moderate Content Request Schema
export const ModerateContentRequestSchema = z.object({
  action: z.enum(['approve', 'reject', 'flag', 'remove']),
  reason: z.string().max(500, 'Reason too long').optional(),
  note: z.string().max(1000, 'Note too long').optional()
});

// Moderate User Request Schema
export const ModerateUserRequestSchema = z.object({
  action: z.enum(['suspend', 'warn', 'flag', 'clearFlags']),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
  duration: z.number().min(1).optional(), // in days for suspension
  note: z.string().max(1000, 'Note too long').optional()
});

// System Event Schema
export const SystemEventSchema = z.object({
  id: z.string().uuid(),
  eventType: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  component: z.string().min(1),
  message: z.string().min(1),
  metadata: z.any().optional(),
  isResolved: z.boolean().default(false),
  resolvedAt: z.string().datetime().optional(),
  resolvedBy: z.string().uuid().optional(),
  resolution: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Moderation Report Schema
export const ModerationReportSchema = z.object({
  id: z.string().uuid(),
  reporterId: z.string().uuid(),
  contentType: z.enum(['post', 'comment', 'user']),
  contentId: z.string().uuid(),
  reason: z.string().min(1),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'under_review', 'resolved', 'dismissed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedModerator: z.string().uuid().optional(),
  resolution: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional()
});

// Content Moderation Action Schema
export const ContentModerationActionSchema = z.object({
  id: z.string().uuid(),
  moderatorId: z.string().uuid(),
  contentType: z.enum(['post', 'comment']),
  contentId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'flag', 'remove']),
  reason: z.string().max(500).optional(),
  note: z.string().max(1000).optional(),
  createdAt: z.string().datetime()
});

// Flagged Content Schema
export const FlaggedContentSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['post', 'comment']),
  content: z.string().min(1),
  author: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email()
  }),
  flagCount: z.number().min(0),
  reports: z.array(ModerationReportSchema),
  createdAt: z.string().datetime(),
  lastReportedAt: z.string().datetime(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'approved', 'rejected', 'removed']),
  // For posts
  title: z.string().optional(),
  community: z.object({
    id: z.string().uuid(),
    name: z.string().min(1)
  }).optional(),
  // For comments
  postTitle: z.string().optional(),
  postId: z.string().uuid().optional()
});

// Moderation Action Schema
export const ModerationActionSchema = z.object({
  id: z.string().uuid(),
  contentType: z.enum(['post', 'comment', 'user']),
  contentId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'remove', 'flag', 'warn', 'suspend']),
  reason: z.string().min(1),
  note: z.string().optional(),
  moderatorId: z.string().uuid(),
  moderatorName: z.string().min(1),
  createdAt: z.string().datetime()
});

// Moderation Stats Schema
export const ModerationStatsSchema = z.object({
  totalReports: z.number().min(0),
  pendingReports: z.number().min(0),
  resolvedToday: z.number().min(0),
  flaggedContent: z.number().min(0),
  suspendedUsers: z.number().min(0),
  averageResponseTime: z.number().min(0), // in hours
  topReportReasons: z.array(z.object({
    reason: z.string().min(1),
    count: z.number().min(0)
  }))
});

// Content Moderation Filters Schema
export const ContentModerationFiltersSchema = z.object({
  type: z.enum(['post', 'comment']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'removed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  reportReason: z.string().optional(),
  authorId: z.string().uuid().optional(),
  communityId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'reportCount', 'priority', 'lastReportedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Bulk Moderation Request Schema
export const BulkModerationRequestSchema = z.object({
  contentIds: z.array(z.string().uuid()).min(1, 'At least one content ID is required'),
  action: z.enum(['approve', 'reject', 'remove']),
  reason: z.string().min(1, 'Reason is required'),
  note: z.string().optional()
});

// Report Submission Schema
export const ReportSubmissionSchema = z.object({
  contentType: z.enum(['post', 'comment', 'user']),
  contentId: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().min(1, 'Description is required'),
  evidence: z.array(z.string()).optional()
});

// Type exports
export type Moderator = z.infer<typeof ModeratorSchema>;
export type ModeratorDashboardStats = z.infer<typeof ModeratorDashboardStatsSchema>;
export type ContentModerationParams = z.infer<typeof ContentModerationParamsSchema>;
export type UserModerationParams = z.infer<typeof UserModerationParamsSchema>;
export type AuditLogParams = z.infer<typeof AuditLogParamsSchema>;
export type SystemEventParams = z.infer<typeof SystemEventParamsSchema>;
export type ModerateContentRequest = z.infer<typeof ModerateContentRequestSchema>;
export type ModerateUserRequest = z.infer<typeof ModerateUserRequestSchema>;
export type SystemEvent = z.infer<typeof SystemEventSchema>;
export type ModerationReport = z.infer<typeof ModerationReportSchema>;
export type ContentModerationAction = z.infer<typeof ContentModerationActionSchema>;
export type FlaggedContent = z.infer<typeof FlaggedContentSchema>;
export type ModerationAction = z.infer<typeof ModerationActionSchema>;
export type ModerationStats = z.infer<typeof ModerationStatsSchema>;
export type ContentModerationFilters = z.infer<typeof ContentModerationFiltersSchema>;
export type BulkModerationRequest = z.infer<typeof BulkModerationRequestSchema>;
export type ReportSubmission = z.infer<typeof ReportSubmissionSchema>;