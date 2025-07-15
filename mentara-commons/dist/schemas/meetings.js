"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyTerminateMeetingDtoSchema = exports.GetMeetingAnalyticsQueryDtoSchema = exports.SaveMeetingSessionDtoSchema = exports.GetUpcomingMeetingsQueryDtoSchema = exports.UpdateMeetingStatusDtoSchema = exports.MeetingParamsDtoSchema = void 0;
const zod_1 = require("zod");
// Meeting DTOs for MeetingsController
exports.MeetingParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid meeting ID format')
});
exports.UpdateMeetingStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
    reason: zod_1.z.string().max(500, 'Reason too long').optional(),
    notifyParticipants: zod_1.z.boolean().default(true)
});
exports.GetUpcomingMeetingsQueryDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format').optional(),
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format').optional(),
    clientId: zod_1.z.string().uuid('Invalid client ID format').optional(),
    days: zod_1.z.number().min(1).max(30).default(7), // Next N days
    limit: zod_1.z.number().min(1).max(100).default(20),
    includeDetails: zod_1.z.boolean().default(true)
});
exports.SaveMeetingSessionDtoSchema = zod_1.z.object({
    sessionData: zod_1.z.object({
        duration: zod_1.z.number().min(1), // actual duration in minutes
        startedAt: zod_1.z.string().datetime(),
        endedAt: zod_1.z.string().datetime(),
        participantCount: zod_1.z.number().min(1).max(10),
        quality: zod_1.z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        issues: zod_1.z.array(zod_1.z.string()).optional()
    }),
    sessionNotes: zod_1.z.string().max(2000, 'Session notes too long').optional(),
    clientProgress: zod_1.z.object({
        mood: zod_1.z.enum(['excellent', 'good', 'neutral', 'poor', 'critical']).optional(),
        engagement: zod_1.z.enum(['high', 'medium', 'low']).optional(),
        goals: zod_1.z.array(zod_1.z.string()).optional(),
        outcomes: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    followUpActions: zod_1.z.array(zod_1.z.object({
        action: zod_1.z.string().min(1, 'Action is required'),
        priority: zod_1.z.enum(['high', 'medium', 'low']).default('medium'),
        dueDate: zod_1.z.string().datetime().optional()
    })).optional()
});
exports.GetMeetingAnalyticsQueryDtoSchema = zod_1.z.object({
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format').optional(),
    timeframe: zod_1.z.enum(['week', 'month', 'quarter', 'year']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    includeComparisons: zod_1.z.boolean().default(true),
    metrics: zod_1.z.array(zod_1.z.enum(['completion_rate', 'cancellation_rate', 'average_duration', 'client_satisfaction'])).optional()
});
exports.EmergencyTerminateMeetingDtoSchema = zod_1.z.object({
    reason: zod_1.z.enum(['technical_issues', 'emergency', 'safety_concern', 'participant_request']),
    description: zod_1.z.string().min(1, 'Description is required').max(1000, 'Description too long'),
    notifySupport: zod_1.z.boolean().default(true),
    followUpRequired: zod_1.z.boolean().default(false),
    escalateToSupervisor: zod_1.z.boolean().default(false)
});
//# sourceMappingURL=meetings.js.map