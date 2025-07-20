"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCallStatusSchema = exports.EndVideoCallDtoSchema = exports.VideoRoomResponseSchema = exports.JoinVideoRoomDtoSchema = exports.CreateVideoRoomDtoSchema = exports.EmergencyTerminationRequestSchema = exports.MeetingStatusUpdateSchema = exports.MeetingRoomResponseSchema = exports.MeetingAnalyticsSchema = exports.MeetingSessionDataSchema = exports.SessionMeetingSchema = exports.EmergencyTerminateMeetingDtoSchema = exports.GetMeetingAnalyticsQueryDtoSchema = exports.SaveMeetingSessionDtoSchema = exports.GetUpcomingMeetingsQueryDtoSchema = exports.UpdateMeetingStatusDtoSchema = exports.MeetingParamsDtoSchema = void 0;
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
// Complex meeting data structures moved from frontend services
exports.SessionMeetingSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    status: zod_1.z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
    type: zod_1.z.enum(['video', 'audio', 'chat']),
    therapistId: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid(),
    roomUrl: zod_1.z.string().url().optional(),
    roomToken: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    therapist: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        profileImage: zod_1.z.string().url().optional()
    }).optional(),
    client: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        profileImage: zod_1.z.string().url().optional()
    }).optional()
});
exports.MeetingSessionDataSchema = zod_1.z.object({
    meetingId: zod_1.z.string().uuid(),
    duration: zod_1.z.number().min(1),
    startedAt: zod_1.z.string().datetime(),
    endedAt: zod_1.z.string().datetime(),
    participantCount: zod_1.z.number().min(1).max(10),
    quality: zod_1.z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
    issues: zod_1.z.array(zod_1.z.string()).optional(),
    sessionNotes: zod_1.z.string().max(2000).optional(),
    clientProgress: zod_1.z.object({
        mood: zod_1.z.enum(['excellent', 'good', 'neutral', 'poor', 'critical']).optional(),
        engagement: zod_1.z.enum(['high', 'medium', 'low']).optional(),
        goals: zod_1.z.array(zod_1.z.string()).optional(),
        outcomes: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    followUpActions: zod_1.z.array(zod_1.z.object({
        action: zod_1.z.string().min(1),
        priority: zod_1.z.enum(['high', 'medium', 'low']),
        dueDate: zod_1.z.string().datetime().optional()
    })).optional()
});
exports.MeetingAnalyticsSchema = zod_1.z.object({
    totalMeetings: zod_1.z.number().min(0),
    totalDuration: zod_1.z.number().min(0),
    averageDuration: zod_1.z.number().min(0),
    meetingsByType: zod_1.z.object({
        video: zod_1.z.number().min(0),
        audio: zod_1.z.number().min(0),
        chat: zod_1.z.number().min(0)
    }),
    completionRate: zod_1.z.number().min(0).max(100)
});
exports.MeetingRoomResponseSchema = zod_1.z.object({
    roomUrl: zod_1.z.string().url(),
    roomToken: zod_1.z.string().min(1),
    meetingId: zod_1.z.string().uuid(),
    expires: zod_1.z.string().datetime()
});
exports.MeetingStatusUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
    reason: zod_1.z.string().optional(),
    notifyParticipants: zod_1.z.boolean().optional()
});
exports.EmergencyTerminationRequestSchema = zod_1.z.object({
    reason: zod_1.z.enum(['technical_issues', 'emergency', 'safety_concern', 'participant_request']),
    description: zod_1.z.string().min(1),
    notifySupport: zod_1.z.boolean().optional(),
    followUpRequired: zod_1.z.boolean().optional(),
    escalateToSupervisor: zod_1.z.boolean().optional()
});
// Video Call Integration Schemas
exports.CreateVideoRoomDtoSchema = zod_1.z.object({
    meetingId: zod_1.z.string().uuid('Invalid meeting ID format'),
    roomType: zod_1.z.enum(['video', 'audio', 'screen_share']).default('video'),
    maxParticipants: zod_1.z.number().min(2).max(10).default(2),
    enableRecording: zod_1.z.boolean().default(false),
    enableChat: zod_1.z.boolean().default(true),
    recordingSettings: zod_1.z.object({
        autoStart: zod_1.z.boolean().default(false),
        layout: zod_1.z.enum(['gallery', 'speaker', 'custom']).default('speaker')
    }).optional()
});
exports.JoinVideoRoomDtoSchema = zod_1.z.object({
    meetingId: zod_1.z.string().uuid('Invalid meeting ID format'),
    participantName: zod_1.z.string().min(1, 'Participant name is required'),
    role: zod_1.z.enum(['therapist', 'client']),
    devicePreferences: zod_1.z.object({
        video: zod_1.z.boolean().default(true),
        audio: zod_1.z.boolean().default(true),
        screenShare: zod_1.z.boolean().default(false)
    }).optional()
});
exports.VideoRoomResponseSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1),
    roomUrl: zod_1.z.string().url('Invalid room URL'),
    accessToken: zod_1.z.string().min(1),
    participantToken: zod_1.z.string().min(1),
    roomConfig: zod_1.z.object({
        maxParticipants: zod_1.z.number().min(2).max(10),
        enableRecording: zod_1.z.boolean(),
        enableChat: zod_1.z.boolean(),
        recordingActive: zod_1.z.boolean()
    }),
    expiresAt: zod_1.z.string().datetime(),
    participantCount: zod_1.z.number().min(0),
    status: zod_1.z.enum(['waiting', 'active', 'ended'])
});
exports.EndVideoCallDtoSchema = zod_1.z.object({
    meetingId: zod_1.z.string().uuid('Invalid meeting ID format'),
    endReason: zod_1.z.enum(['session_complete', 'technical_issues', 'participant_left', 'emergency']).default('session_complete'),
    sessionSummary: zod_1.z.object({
        duration: zod_1.z.number().min(0), // in minutes
        participantCount: zod_1.z.number().min(1),
        connectionQuality: zod_1.z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        technicalIssues: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    nextSteps: zod_1.z.string().max(500).optional()
});
exports.VideoCallStatusSchema = zod_1.z.object({
    meetingId: zod_1.z.string().uuid(),
    roomId: zod_1.z.string().min(1),
    status: zod_1.z.enum(['waiting', 'active', 'ended', 'error']),
    participants: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(1),
        role: zod_1.z.enum(['therapist', 'client']),
        joinedAt: zod_1.z.string().datetime(),
        connectionStatus: zod_1.z.enum(['connected', 'connecting', 'disconnected'])
    })),
    startedAt: zod_1.z.string().datetime().optional(),
    endedAt: zod_1.z.string().datetime().optional(),
    duration: zod_1.z.number().min(0).optional() // in minutes
});
//# sourceMappingURL=meetings.js.map