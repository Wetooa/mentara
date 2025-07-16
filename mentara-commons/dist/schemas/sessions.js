"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStatsSchema = exports.SessionListResponseSchema = exports.SessionListParamsSchema = exports.SessionUpdateDtoSchema = exports.SessionCreateDtoSchema = exports.GetSessionStatisticsQueryDtoSchema = exports.GetTherapyProgressQueryDtoSchema = exports.CreateTherapyProgressDtoSchema = exports.GetUserActivitiesQueryDtoSchema = exports.LogUserActivityDtoSchema = exports.AddSessionActivityDtoSchema = exports.EndSessionDtoSchema = exports.UpdateSessionLogDtoSchema = exports.SessionParamsDtoSchema = exports.FindSessionsQueryDtoSchema = exports.CreateSessionLogDtoSchema = exports.SessionRecordingIdParamSchema = exports.SessionIdParamSchema = exports.SessionAvailabilitySchema = exports.RescheduleSessionDtoSchema = exports.SessionQuerySchema = exports.SessionFeedbackDtoSchema = exports.SessionRecordingSchema = exports.JoinSessionDtoSchema = exports.UpdateSessionStatusDtoSchema = exports.UpdateSessionDtoSchema = exports.CreateSessionDtoSchema = exports.SessionSchema = void 0;
const zod_1 = require("zod");
// Session Schema
exports.SessionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid(),
    therapistId: zod_1.z.string().uuid(),
    scheduledAt: zod_1.z.string().datetime(),
    duration: zod_1.z.number().min(30).max(180),
    status: zod_1.z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']),
    type: zod_1.z.enum(['video', 'audio', 'phone', 'in_person']),
    notes: zod_1.z.string().optional(),
    sessionNotes: zod_1.z.string().optional(),
    recordingUrl: zod_1.z.string().url().optional(),
    meetingUrl: zod_1.z.string().url().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    startedAt: zod_1.z.string().datetime().optional(),
    endedAt: zod_1.z.string().datetime().optional()
});
// Create Session Schema
exports.CreateSessionDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client ID format'),
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format'),
    scheduledAt: zod_1.z.string().datetime('Invalid date format'),
    duration: zod_1.z.number().min(30, 'Minimum session duration is 30 minutes').max(180, 'Maximum session duration is 180 minutes'),
    type: zod_1.z.enum(['video', 'audio', 'phone', 'in_person']).default('video'),
    notes: zod_1.z.string().max(1000, 'Notes too long').optional()
});
// Update Session Schema
exports.UpdateSessionDtoSchema = zod_1.z.object({
    scheduledAt: zod_1.z.string().datetime('Invalid date format').optional(),
    duration: zod_1.z.number().min(30, 'Minimum session duration is 30 minutes').max(180, 'Maximum session duration is 180 minutes').optional(),
    type: zod_1.z.enum(['video', 'audio', 'phone', 'in_person']).optional(),
    notes: zod_1.z.string().max(1000, 'Notes too long').optional(),
    sessionNotes: zod_1.z.string().max(5000, 'Session notes too long').optional()
});
// Session Status Update Schema
exports.UpdateSessionStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']),
    reason: zod_1.z.string().optional(),
    notifyParticipants: zod_1.z.boolean().default(true)
});
// Session Join Schema
exports.JoinSessionDtoSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid('Invalid session ID format'),
    userType: zod_1.z.enum(['client', 'therapist'])
});
// Session Recording Schema
exports.SessionRecordingSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid(),
    recordingUrl: zod_1.z.string().url(),
    duration: zod_1.z.number(),
    size: zod_1.z.number(),
    isEncrypted: zod_1.z.boolean(),
    createdAt: zod_1.z.string().datetime(),
    expiresAt: zod_1.z.string().datetime().optional()
});
// Session Feedback Schema
exports.SessionFeedbackDtoSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    feedback: zod_1.z.string().max(1000, 'Feedback too long').optional(),
    wouldRecommend: zod_1.z.boolean().optional(),
    technicalIssues: zod_1.z.boolean().optional(),
    improvementSuggestions: zod_1.z.string().max(500, 'Suggestions too long').optional()
});
// Session Query Parameters
exports.SessionQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    clientId: zod_1.z.string().uuid().optional(),
    therapistId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
    type: zod_1.z.enum(['video', 'audio', 'phone', 'in_person']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['scheduledAt', 'createdAt', 'duration', 'status']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Session Reschedule Schema
exports.RescheduleSessionDtoSchema = zod_1.z.object({
    newScheduledAt: zod_1.z.string().datetime('Invalid date format'),
    reason: zod_1.z.string().max(500, 'Reason too long').optional(),
    notifyParticipants: zod_1.z.boolean().default(true)
});
// Session Availability Schema
exports.SessionAvailabilitySchema = zod_1.z.object({
    therapistId: zod_1.z.string().uuid(),
    date: zod_1.z.string().datetime(),
    availableSlots: zod_1.z.array(zod_1.z.object({
        startTime: zod_1.z.string(),
        endTime: zod_1.z.string(),
        duration: zod_1.z.number()
    }))
});
// Parameter Schemas
exports.SessionIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid session ID format')
});
exports.SessionRecordingIdParamSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid('Invalid session ID format'),
    recordingId: zod_1.z.string().uuid('Invalid recording ID format')
});
// Additional DTOs for SessionsController endpoints
exports.CreateSessionLogDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client ID format'),
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format').optional(),
    sessionType: zod_1.z.enum(['INITIAL_CONSULTATION', 'REGULAR_THERAPY', 'CRISIS_INTERVENTION', 'GROUP_THERAPY', 'FAMILY_THERAPY', 'FOLLOW_UP', 'ASSESSMENT', 'SELF_GUIDED']).default('REGULAR_THERAPY'),
    meetingId: zod_1.z.string().optional(),
    platform: zod_1.z.string().optional(),
});
exports.FindSessionsQueryDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid().optional(),
    therapistId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'TECHNICAL_ISSUE', 'RESCHEDULED']).optional(),
    sessionType: zod_1.z.enum(['INITIAL_CONSULTATION', 'REGULAR_THERAPY', 'CRISIS_INTERVENTION', 'GROUP_THERAPY', 'FAMILY_THERAPY', 'FOLLOW_UP', 'ASSESSMENT', 'SELF_GUIDED']).optional(),
});
exports.SessionParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid session ID format')
});
exports.UpdateSessionLogDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'TECHNICAL_ISSUE', 'RESCHEDULED']).optional(),
    notes: zod_1.z.string().max(2000, 'Notes too long').optional(),
    quality: zod_1.z.number().min(1).max(5).optional(),
    connectionIssues: zod_1.z.boolean().optional(),
    recordingUrl: zod_1.z.string().optional(),
});
exports.EndSessionDtoSchema = zod_1.z.object({
    notes: zod_1.z.string().max(2000, 'Notes too long').optional(),
    quality: zod_1.z.number().min(1).max(5).optional(),
});
exports.AddSessionActivityDtoSchema = zod_1.z.object({
    activityType: zod_1.z.enum(['SESSION_START', 'SESSION_END', 'SCREEN_SHARE', 'FILE_SHARE', 'WHITEBOARD_USE', 'CHAT_MESSAGE', 'GOAL_SETTING', 'PROGRESS_REVIEW', 'HOMEWORK_ASSIGNMENT', 'ASSESSMENT_COMPLETION', 'MOOD_CHECK_IN', 'CONNECTION_ISSUE', 'AUDIO_PROBLEM', 'VIDEO_PROBLEM', 'RECONNECTION', 'RECORDING_START', 'RECORDING_STOP']),
    description: zod_1.z.string().max(500, 'Description too long').optional(),
    duration: zod_1.z.number().min(1, 'Duration must be at least 1 minute').optional(),
    metadata: zod_1.z.any().optional(),
});
exports.LogUserActivityDtoSchema = zod_1.z.object({
    action: zod_1.z.enum(['PAGE_VIEW', 'PAGE_EXIT', 'CLICK', 'SCROLL', 'SEARCH', 'POST_CREATE', 'POST_VIEW', 'POST_LIKE', 'COMMENT_CREATE', 'COMMENT_LIKE', 'THERAPIST_SEARCH', 'THERAPIST_PROFILE_VIEW', 'APPOINTMENT_BOOK', 'APPOINTMENT_CANCEL', 'MESSAGE_SEND', 'WORKSHEET_COMPLETE', 'PROFILE_UPDATE', 'SETTINGS_CHANGE', 'PASSWORD_CHANGE', 'LOGOUT']),
    page: zod_1.z.string().optional(),
    component: zod_1.z.string().optional(),
    metadata: zod_1.z.any().optional(),
    sessionId: zod_1.z.string().uuid().optional(),
    deviceInfo: zod_1.z.any().optional(),
});
exports.GetUserActivitiesQueryDtoSchema = zod_1.z.object({
    action: zod_1.z.enum(['PAGE_VIEW', 'PAGE_EXIT', 'CLICK', 'SCROLL', 'SEARCH', 'POST_CREATE', 'POST_VIEW', 'POST_LIKE', 'COMMENT_CREATE', 'COMMENT_LIKE', 'THERAPIST_SEARCH', 'THERAPIST_PROFILE_VIEW', 'APPOINTMENT_BOOK', 'APPOINTMENT_CANCEL', 'MESSAGE_SEND', 'WORKSHEET_COMPLETE', 'PROFILE_UPDATE', 'SETTINGS_CHANGE', 'PASSWORD_CHANGE', 'LOGOUT']).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.CreateTherapyProgressDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client ID format'),
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format'),
    progressScore: zod_1.z.number().min(0).max(10),
    improvementAreas: zod_1.z.array(zod_1.z.string()).optional(),
    concernAreas: zod_1.z.array(zod_1.z.string()).optional(),
    goalsSet: zod_1.z.any().optional(),
    goalsAchieved: zod_1.z.any().optional(),
    nextMilestones: zod_1.z.any().optional(),
    moodScore: zod_1.z.number().min(1).max(10).optional(),
    anxietyScore: zod_1.z.number().min(1).max(10).optional(),
    depressionScore: zod_1.z.number().min(1).max(10).optional(),
    functionalScore: zod_1.z.number().min(1).max(10).optional(),
    therapistNotes: zod_1.z.string().max(2000, 'Notes too long').optional(),
    clientFeedback: zod_1.z.string().max(2000, 'Feedback too long').optional(),
    recommendations: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.GetTherapyProgressQueryDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client ID format').optional(),
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format').optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.GetSessionStatisticsQueryDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid().optional(),
    therapistId: zod_1.z.string().uuid().optional(),
});
// Session Create DTO (for frontend service)
exports.SessionCreateDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client ID format'),
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format'),
    scheduledAt: zod_1.z.string().datetime('Invalid date format'),
    duration: zod_1.z.number().min(30, 'Minimum session duration is 30 minutes').max(180, 'Maximum session duration is 180 minutes'),
    sessionType: zod_1.z.enum(['video', 'audio', 'phone', 'in_person']).default('video'),
    notes: zod_1.z.string().max(1000, 'Notes too long').optional()
});
// Session Update DTO (for frontend service)
exports.SessionUpdateDtoSchema = zod_1.z.object({
    scheduledAt: zod_1.z.string().datetime('Invalid date format').optional(),
    duration: zod_1.z.number().min(30, 'Minimum session duration is 30 minutes').max(180, 'Maximum session duration is 180 minutes').optional(),
    sessionType: zod_1.z.enum(['video', 'audio', 'phone', 'in_person']).optional(),
    notes: zod_1.z.string().max(1000, 'Notes too long').optional(),
    sessionNotes: zod_1.z.string().max(5000, 'Session notes too long').optional()
});
// Session List Parameters Schema
exports.SessionListParamsSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid().optional(),
    therapistId: zod_1.z.string().uuid().optional(),
    sessionType: zod_1.z.enum(['video', 'audio', 'phone', 'in_person']).optional(),
    status: zod_1.z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
    sortBy: zod_1.z.enum(['scheduledAt', 'createdAt', 'duration', 'status']).default('scheduledAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// Session List Response Schema
exports.SessionListResponseSchema = zod_1.z.object({
    sessions: zod_1.z.array(exports.SessionSchema),
    total: zod_1.z.number().min(0),
    page: zod_1.z.number().min(1),
    limit: zod_1.z.number().min(1),
    hasMore: zod_1.z.boolean()
});
// Session Stats Schema
exports.SessionStatsSchema = zod_1.z.object({
    totalSessions: zod_1.z.number().min(0),
    completedSessions: zod_1.z.number().min(0),
    cancelledSessions: zod_1.z.number().min(0),
    noShowSessions: zod_1.z.number().min(0),
    averageDuration: zod_1.z.number().min(0),
    totalDuration: zod_1.z.number().min(0),
    completionRate: zod_1.z.number().min(0).max(100),
    noShowRate: zod_1.z.number().min(0).max(100),
    cancellationRate: zod_1.z.number().min(0).max(100),
    sessionsByType: zod_1.z.record(zod_1.z.number().min(0)),
    sessionsByStatus: zod_1.z.record(zod_1.z.number().min(0)),
    monthlyStats: zod_1.z.array(zod_1.z.object({
        month: zod_1.z.string(),
        totalSessions: zod_1.z.number().min(0),
        completedSessions: zod_1.z.number().min(0),
        averageDuration: zod_1.z.number().min(0)
    }))
});
//# sourceMappingURL=sessions.js.map