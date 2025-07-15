"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSessionStatisticsQueryDtoSchema = exports.GetTherapyProgressQueryDtoSchema = exports.CreateTherapyProgressDtoSchema = exports.GetUserActivitiesQueryDtoSchema = exports.LogUserActivityDtoSchema = exports.AddSessionActivityDtoSchema = exports.EndSessionDtoSchema = exports.UpdateSessionLogDtoSchema = exports.SessionParamsDtoSchema = exports.FindSessionsQueryDtoSchema = exports.CreateSessionLogDtoSchema = exports.SessionRecordingIdParamSchema = exports.SessionIdParamSchema = exports.SessionAvailabilitySchema = exports.RescheduleSessionDtoSchema = exports.SessionQuerySchema = exports.SessionFeedbackDtoSchema = exports.SessionRecordingSchema = exports.JoinSessionDtoSchema = exports.UpdateSessionStatusDtoSchema = exports.UpdateSessionDtoSchema = exports.CreateSessionDtoSchema = exports.SessionSchema = void 0;
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
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format'),
    sessionType: zod_1.z.enum(['individual', 'group', 'emergency']).default('individual'),
    startTime: zod_1.z.string().datetime('Invalid start time format'),
    plannedDuration: zod_1.z.number().min(15).max(180),
    notes: zod_1.z.string().max(2000, 'Notes too long').optional(),
    mood: zod_1.z.enum(['excellent', 'good', 'neutral', 'poor', 'critical']).optional(),
    goals: zod_1.z.array(zod_1.z.string()).optional()
});
exports.FindSessionsQueryDtoSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    clientId: zod_1.z.string().uuid().optional(),
    therapistId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    sessionType: zod_1.z.enum(['individual', 'group', 'emergency']).optional(),
    sortBy: zod_1.z.enum(['startTime', 'createdAt', 'duration']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
exports.SessionParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid session ID format')
});
exports.UpdateSessionLogDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
    notes: zod_1.z.string().max(2000, 'Notes too long').optional(),
    mood: zod_1.z.enum(['excellent', 'good', 'neutral', 'poor', 'critical']).optional(),
    actualDuration: zod_1.z.number().min(1).optional(),
    endTime: zod_1.z.string().datetime().optional(),
    goals: zod_1.z.array(zod_1.z.string()).optional(),
    outcomes: zod_1.z.array(zod_1.z.string()).optional()
});
exports.EndSessionDtoSchema = zod_1.z.object({
    endTime: zod_1.z.string().datetime('Invalid end time format'),
    actualDuration: zod_1.z.number().min(1, 'Duration must be at least 1 minute'),
    sessionSummary: zod_1.z.string().max(2000, 'Summary too long').optional(),
    clientProgress: zod_1.z.enum(['significant', 'moderate', 'minimal', 'none']).optional(),
    nextSessionRecommendation: zod_1.z.string().max(500, 'Recommendation too long').optional()
});
exports.AddSessionActivityDtoSchema = zod_1.z.object({
    activityType: zod_1.z.enum(['discussion', 'exercise', 'assignment', 'assessment', 'break']),
    description: zod_1.z.string().min(1, 'Description is required').max(500, 'Description too long'),
    duration: zod_1.z.number().min(1, 'Duration must be at least 1 minute'),
    notes: zod_1.z.string().max(1000, 'Notes too long').optional(),
    effectiveness: zod_1.z.enum(['very_effective', 'effective', 'somewhat_effective', 'not_effective']).optional()
});
exports.LogUserActivityDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    activityType: zod_1.z.enum(['login', 'logout', 'page_view', 'interaction', 'session_join', 'session_leave']),
    details: zod_1.z.record(zod_1.z.any()).optional(),
    timestamp: zod_1.z.string().datetime('Invalid timestamp format').optional(),
    sessionId: zod_1.z.string().uuid().optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional()
});
exports.GetUserActivitiesQueryDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format').optional(),
    activityType: zod_1.z.enum(['login', 'logout', 'page_view', 'interaction', 'session_join', 'session_leave']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    sortBy: zod_1.z.enum(['timestamp', 'activityType']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
exports.CreateTherapyProgressDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client ID format'),
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format'),
    sessionId: zod_1.z.string().uuid('Invalid session ID format').optional(),
    progressType: zod_1.z.enum(['goal_achievement', 'symptom_improvement', 'skill_development', 'behavior_change']),
    description: zod_1.z.string().min(1, 'Description is required').max(1000, 'Description too long'),
    progressLevel: zod_1.z.number().min(1).max(10), // 1-10 scale
    notes: zod_1.z.string().max(2000, 'Notes too long').optional(),
    nextSteps: zod_1.z.array(zod_1.z.string()).optional()
});
exports.GetTherapyProgressQueryDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client ID format').optional(),
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format').optional(),
    progressType: zod_1.z.enum(['goal_achievement', 'symptom_improvement', 'skill_development', 'behavior_change']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional()
});
exports.GetSessionStatisticsQueryDtoSchema = zod_1.z.object({
    therapistId: zod_1.z.string().uuid().optional(),
    clientId: zod_1.z.string().uuid().optional(),
    timeframe: zod_1.z.enum(['week', 'month', 'quarter', 'year']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    includeProgress: zod_1.z.boolean().default(false),
    includeActivities: zod_1.z.boolean().default(false)
});
//# sourceMappingURL=sessions.js.map