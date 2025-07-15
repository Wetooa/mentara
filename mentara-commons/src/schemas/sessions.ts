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
  therapistId: z.string().uuid('Invalid therapist ID format'),
  sessionType: z.enum(['individual', 'group', 'emergency']).default('individual'),
  startTime: z.string().datetime('Invalid start time format'),
  plannedDuration: z.number().min(15).max(180),
  notes: z.string().max(2000, 'Notes too long').optional(),
  mood: z.enum(['excellent', 'good', 'neutral', 'poor', 'critical']).optional(),
  goals: z.array(z.string()).optional()
});

export const FindSessionsQueryDtoSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  clientId: z.string().uuid().optional(),
  therapistId: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sessionType: z.enum(['individual', 'group', 'emergency']).optional(),
  sortBy: z.enum(['startTime', 'createdAt', 'duration']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const SessionParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid session ID format')
});

export const UpdateSessionLogDtoSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  notes: z.string().max(2000, 'Notes too long').optional(),
  mood: z.enum(['excellent', 'good', 'neutral', 'poor', 'critical']).optional(),
  actualDuration: z.number().min(1).optional(),
  endTime: z.string().datetime().optional(),
  goals: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional()
});

export const EndSessionDtoSchema = z.object({
  endTime: z.string().datetime('Invalid end time format'),
  actualDuration: z.number().min(1, 'Duration must be at least 1 minute'),
  sessionSummary: z.string().max(2000, 'Summary too long').optional(),
  clientProgress: z.enum(['significant', 'moderate', 'minimal', 'none']).optional(),
  nextSessionRecommendation: z.string().max(500, 'Recommendation too long').optional()
});

export const AddSessionActivityDtoSchema = z.object({
  activityType: z.enum(['discussion', 'exercise', 'assignment', 'assessment', 'break']),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  effectiveness: z.enum(['very_effective', 'effective', 'somewhat_effective', 'not_effective']).optional()
});

export const LogUserActivityDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  activityType: z.enum(['login', 'logout', 'page_view', 'interaction', 'session_join', 'session_leave']),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime('Invalid timestamp format').optional(),
  sessionId: z.string().uuid().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

export const GetUserActivitiesQueryDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format').optional(),
  activityType: z.enum(['login', 'logout', 'page_view', 'interaction', 'session_join', 'session_leave']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['timestamp', 'activityType']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const CreateTherapyProgressDtoSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format'),
  therapistId: z.string().uuid('Invalid therapist ID format'),
  sessionId: z.string().uuid('Invalid session ID format').optional(),
  progressType: z.enum(['goal_achievement', 'symptom_improvement', 'skill_development', 'behavior_change']),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  progressLevel: z.number().min(1).max(10), // 1-10 scale
  notes: z.string().max(2000, 'Notes too long').optional(),
  nextSteps: z.array(z.string()).optional()
});

export const GetTherapyProgressQueryDtoSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format').optional(),
  therapistId: z.string().uuid('Invalid therapist ID format').optional(),
  progressType: z.enum(['goal_achievement', 'symptom_improvement', 'skill_development', 'behavior_change']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
});

export const GetSessionStatisticsQueryDtoSchema = z.object({
  therapistId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeProgress: z.boolean().default(false),
  includeActivities: z.boolean().default(false)
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