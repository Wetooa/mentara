import { z } from 'zod';

// Session Schema
export const SessionSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  therapistId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(30).max(180),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']),
  type: z.enum(['video', 'audio', 'phone', 'in_person']),
  notes: z.string().optional(),
  sessionNotes: z.string().optional(),
  recordingUrl: z.string().url().optional(),
  meetingUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional()
});

// Create Session Schema
export const CreateSessionDtoSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format'),
  therapistId: z.string().uuid('Invalid therapist ID format'),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(30, 'Minimum session duration is 30 minutes').max(180, 'Maximum session duration is 180 minutes'),
  type: z.enum(['video', 'audio', 'phone', 'in_person']).default('video'),
  notes: z.string().max(1000, 'Notes too long').optional()
});

// Update Session Schema
export const UpdateSessionDtoSchema = z.object({
  scheduledAt: z.string().datetime('Invalid date format').optional(),
  duration: z.number().min(30, 'Minimum session duration is 30 minutes').max(180, 'Maximum session duration is 180 minutes').optional(),
  type: z.enum(['video', 'audio', 'phone', 'in_person']).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  sessionNotes: z.string().max(5000, 'Session notes too long').optional()
});

// Session Status Update Schema
export const UpdateSessionStatusDtoSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']),
  reason: z.string().optional(),
  notifyParticipants: z.boolean().default(true)
});

// Session Join Schema
export const JoinSessionDtoSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  userType: z.enum(['client', 'therapist'])
});

// Session Recording Schema
export const SessionRecordingSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  recordingUrl: z.string().url(),
  duration: z.number(),
  size: z.number(),
  isEncrypted: z.boolean(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional()
});

// Session Feedback Schema
export const SessionFeedbackDtoSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  feedback: z.string().max(1000, 'Feedback too long').optional(),
  wouldRecommend: z.boolean().optional(),
  technicalIssues: z.boolean().optional(),
  improvementSuggestions: z.string().max(500, 'Suggestions too long').optional()
});

// Session Query Parameters
export const SessionQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  clientId: z.string().uuid().optional(),
  therapistId: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  type: z.enum(['video', 'audio', 'phone', 'in_person']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['scheduledAt', 'createdAt', 'duration', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Session Reschedule Schema
export const RescheduleSessionDtoSchema = z.object({
  newScheduledAt: z.string().datetime('Invalid date format'),
  reason: z.string().max(500, 'Reason too long').optional(),
  notifyParticipants: z.boolean().default(true)
});

// Session Availability Schema
export const SessionAvailabilitySchema = z.object({
  therapistId: z.string().uuid(),
  date: z.string().datetime(),
  availableSlots: z.array(z.object({
    startTime: z.string(),
    endTime: z.string(),
    duration: z.number()
  }))
});

// Parameter Schemas
export const SessionIdParamSchema = z.object({
  id: z.string().uuid('Invalid session ID format')
});

export const SessionRecordingIdParamSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  recordingId: z.string().uuid('Invalid recording ID format')
});

// Export type inference helpers
export type Session = z.infer<typeof SessionSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionDtoSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionDtoSchema>;
export type UpdateSessionStatusDto = z.infer<typeof UpdateSessionStatusDtoSchema>;
export type JoinSessionDto = z.infer<typeof JoinSessionDtoSchema>;
export type SessionRecording = z.infer<typeof SessionRecordingSchema>;
export type SessionFeedbackDto = z.infer<typeof SessionFeedbackDtoSchema>;
export type SessionQuery = z.infer<typeof SessionQuerySchema>;
export type RescheduleSessionDto = z.infer<typeof RescheduleSessionDtoSchema>;
export type SessionAvailability = z.infer<typeof SessionAvailabilitySchema>;
export type SessionIdParam = z.infer<typeof SessionIdParamSchema>;
export type SessionRecordingIdParam = z.infer<typeof SessionRecordingIdParamSchema>;

// Additional DTOs for SessionsController endpoints
export const CreateSessionLogDtoSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format'),
  therapistId: z.string().uuid('Invalid therapist ID format').optional(),
  sessionType: z.enum(['INITIAL_CONSULTATION', 'REGULAR_THERAPY', 'CRISIS_INTERVENTION', 'GROUP_THERAPY', 'FAMILY_THERAPY', 'FOLLOW_UP', 'ASSESSMENT', 'SELF_GUIDED']).default('REGULAR_THERAPY'),
  meetingId: z.string().optional(),
  platform: z.string().optional(),
});

export const FindSessionsQueryDtoSchema = z.object({
  clientId: z.string().uuid().optional(),
  therapistId: z.string().uuid().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'TECHNICAL_ISSUE', 'RESCHEDULED']).optional(),
  sessionType: z.enum(['INITIAL_CONSULTATION', 'REGULAR_THERAPY', 'CRISIS_INTERVENTION', 'GROUP_THERAPY', 'FAMILY_THERAPY', 'FOLLOW_UP', 'ASSESSMENT', 'SELF_GUIDED']).optional(),
});

export const SessionParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid session ID format')
});

export const UpdateSessionLogDtoSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'TECHNICAL_ISSUE', 'RESCHEDULED']).optional(),
  notes: z.string().max(2000, 'Notes too long').optional(),
  quality: z.number().min(1).max(5).optional(),
  connectionIssues: z.boolean().optional(),
  recordingUrl: z.string().optional(),
});

export const EndSessionDtoSchema = z.object({
  notes: z.string().max(2000, 'Notes too long').optional(),
  quality: z.number().min(1).max(5).optional(),
});

export const AddSessionActivityDtoSchema = z.object({
  activityType: z.enum(['SESSION_START', 'SESSION_END', 'SCREEN_SHARE', 'FILE_SHARE', 'WHITEBOARD_USE', 'CHAT_MESSAGE', 'GOAL_SETTING', 'PROGRESS_REVIEW', 'HOMEWORK_ASSIGNMENT', 'ASSESSMENT_COMPLETION', 'MOOD_CHECK_IN', 'CONNECTION_ISSUE', 'AUDIO_PROBLEM', 'VIDEO_PROBLEM', 'RECONNECTION', 'RECORDING_START', 'RECORDING_STOP']),
  description: z.string().max(500, 'Description too long').optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  metadata: z.any().optional(),
});

export const LogUserActivityDtoSchema = z.object({
  action: z.enum(['PAGE_VIEW', 'PAGE_EXIT', 'CLICK', 'SCROLL', 'SEARCH', 'POST_CREATE', 'POST_VIEW', 'POST_LIKE', 'COMMENT_CREATE', 'COMMENT_LIKE', 'THERAPIST_SEARCH', 'THERAPIST_PROFILE_VIEW', 'APPOINTMENT_BOOK', 'APPOINTMENT_CANCEL', 'MESSAGE_SEND', 'WORKSHEET_COMPLETE', 'PROFILE_UPDATE', 'SETTINGS_CHANGE', 'PASSWORD_CHANGE', 'LOGOUT']),
  page: z.string().optional(),
  component: z.string().optional(),
  metadata: z.any().optional(),
  sessionId: z.string().uuid().optional(),
  deviceInfo: z.any().optional(),
});

export const GetUserActivitiesQueryDtoSchema = z.object({
  action: z.enum(['PAGE_VIEW', 'PAGE_EXIT', 'CLICK', 'SCROLL', 'SEARCH', 'POST_CREATE', 'POST_VIEW', 'POST_LIKE', 'COMMENT_CREATE', 'COMMENT_LIKE', 'THERAPIST_SEARCH', 'THERAPIST_PROFILE_VIEW', 'APPOINTMENT_BOOK', 'APPOINTMENT_CANCEL', 'MESSAGE_SEND', 'WORKSHEET_COMPLETE', 'PROFILE_UPDATE', 'SETTINGS_CHANGE', 'PASSWORD_CHANGE', 'LOGOUT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const CreateTherapyProgressDtoSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format'),
  therapistId: z.string().uuid('Invalid therapist ID format'),
  progressScore: z.number().min(0).max(10),
  improvementAreas: z.array(z.string()).optional(),
  concernAreas: z.array(z.string()).optional(),
  goalsSet: z.any().optional(),
  goalsAchieved: z.any().optional(),
  nextMilestones: z.any().optional(),
  moodScore: z.number().min(1).max(10).optional(),
  anxietyScore: z.number().min(1).max(10).optional(),
  depressionScore: z.number().min(1).max(10).optional(),
  functionalScore: z.number().min(1).max(10).optional(),
  therapistNotes: z.string().max(2000, 'Notes too long').optional(),
  clientFeedback: z.string().max(2000, 'Feedback too long').optional(),
  recommendations: z.array(z.string()).optional(),
});

export const GetTherapyProgressQueryDtoSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format').optional(),
  therapistId: z.string().uuid('Invalid therapist ID format').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const GetSessionStatisticsQueryDtoSchema = z.object({
  clientId: z.string().uuid().optional(),
  therapistId: z.string().uuid().optional(),
});

// Session Create DTO (for frontend service)
export const SessionCreateDtoSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format'),
  therapistId: z.string().uuid('Invalid therapist ID format'),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(30, 'Minimum session duration is 30 minutes').max(180, 'Maximum session duration is 180 minutes'),
  sessionType: z.enum(['video', 'audio', 'phone', 'in_person']).default('video'),
  notes: z.string().max(1000, 'Notes too long').optional()
});

// Session Update DTO (for frontend service)
export const SessionUpdateDtoSchema = z.object({
  scheduledAt: z.string().datetime('Invalid date format').optional(),
  duration: z.number().min(30, 'Minimum session duration is 30 minutes').max(180, 'Maximum session duration is 180 minutes').optional(),
  sessionType: z.enum(['video', 'audio', 'phone', 'in_person']).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  sessionNotes: z.string().max(5000, 'Session notes too long').optional()
});

// Session List Parameters Schema
export const SessionListParamsSchema = z.object({
  clientId: z.string().uuid().optional(),
  therapistId: z.string().uuid().optional(),
  sessionType: z.enum(['video', 'audio', 'phone', 'in_person']).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['scheduledAt', 'createdAt', 'duration', 'status']).default('scheduledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Session List Response Schema
export const SessionListResponseSchema = z.object({
  sessions: z.array(SessionSchema),
  total: z.number().min(0),
  page: z.number().min(1),
  limit: z.number().min(1),
  hasMore: z.boolean()
});

// Session Stats Schema
export const SessionStatsSchema = z.object({
  totalSessions: z.number().min(0),
  completedSessions: z.number().min(0),
  cancelledSessions: z.number().min(0),
  noShowSessions: z.number().min(0),
  averageDuration: z.number().min(0),
  totalDuration: z.number().min(0),
  completionRate: z.number().min(0).max(100),
  noShowRate: z.number().min(0).max(100),
  cancellationRate: z.number().min(0).max(100),
  sessionsByType: z.record(z.number().min(0)),
  sessionsByStatus: z.record(z.number().min(0)),
  monthlyStats: z.array(z.object({
    month: z.string(),
    totalSessions: z.number().min(0),
    completedSessions: z.number().min(0),
    averageDuration: z.number().min(0)
  }))
});

// Type exports for new DTOs
export type CreateSessionLogDto = z.infer<typeof CreateSessionLogDtoSchema>;
export type FindSessionsQueryDto = z.infer<typeof FindSessionsQueryDtoSchema>;
export type SessionParamsDto = z.infer<typeof SessionParamsDtoSchema>;
export type UpdateSessionLogDto = z.infer<typeof UpdateSessionLogDtoSchema>;
export type EndSessionDto = z.infer<typeof EndSessionDtoSchema>;
export type AddSessionActivityDto = z.infer<typeof AddSessionActivityDtoSchema>;
export type LogUserActivityDto = z.infer<typeof LogUserActivityDtoSchema>;
export type GetUserActivitiesQueryDto = z.infer<typeof GetUserActivitiesQueryDtoSchema>;
export type CreateTherapyProgressDto = z.infer<typeof CreateTherapyProgressDtoSchema>;
export type GetTherapyProgressQueryDto = z.infer<typeof GetTherapyProgressQueryDtoSchema>;
export type GetSessionStatisticsQueryDto = z.infer<typeof GetSessionStatisticsQueryDtoSchema>;
export type SessionCreateDto = z.infer<typeof SessionCreateDtoSchema>;
export type SessionUpdateDto = z.infer<typeof SessionUpdateDtoSchema>;
export type SessionListParams = z.infer<typeof SessionListParamsSchema>;
export type SessionListResponse = z.infer<typeof SessionListResponseSchema>;
export type SessionStats = z.infer<typeof SessionStatsSchema>;