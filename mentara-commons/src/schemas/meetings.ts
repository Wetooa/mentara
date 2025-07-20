import { z } from 'zod';

// Meeting DTOs for MeetingsController
export const MeetingParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid meeting ID format')
});

export const UpdateMeetingStatusDtoSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  reason: z.string().max(500, 'Reason too long').optional(),
  notifyParticipants: z.boolean().default(true)
});

export const GetUpcomingMeetingsQueryDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format').optional(),
  therapistId: z.string().uuid('Invalid therapist ID format').optional(),
  clientId: z.string().uuid('Invalid client ID format').optional(),
  days: z.number().min(1).max(30).default(7), // Next N days
  limit: z.number().min(1).max(100).default(20),
  includeDetails: z.boolean().default(true)
});

export const SaveMeetingSessionDtoSchema = z.object({
  sessionData: z.object({
    duration: z.number().min(1), // actual duration in minutes
    startedAt: z.string().datetime(),
    endedAt: z.string().datetime(),
    participantCount: z.number().min(1).max(10),
    quality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
    issues: z.array(z.string()).optional()
  }),
  sessionNotes: z.string().max(2000, 'Session notes too long').optional(),
  clientProgress: z.object({
    mood: z.enum(['excellent', 'good', 'neutral', 'poor', 'critical']).optional(),
    engagement: z.enum(['high', 'medium', 'low']).optional(),
    goals: z.array(z.string()).optional(),
    outcomes: z.array(z.string()).optional()
  }).optional(),
  followUpActions: z.array(z.object({
    action: z.string().min(1, 'Action is required'),
    priority: z.enum(['high', 'medium', 'low']).default('medium'),
    dueDate: z.string().datetime().optional()
  })).optional()
});

export const GetMeetingAnalyticsQueryDtoSchema = z.object({
  therapistId: z.string().uuid('Invalid therapist ID format').optional(),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeComparisons: z.boolean().default(true),
  metrics: z.array(z.enum(['completion_rate', 'cancellation_rate', 'average_duration', 'client_satisfaction'])).optional()
});

export const EmergencyTerminateMeetingDtoSchema = z.object({
  reason: z.enum(['technical_issues', 'emergency', 'safety_concern', 'participant_request']),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  notifySupport: z.boolean().default(true),
  followUpRequired: z.boolean().default(false),
  escalateToSupervisor: z.boolean().default(false)
});

// Type exports
export type MeetingParamsDto = z.infer<typeof MeetingParamsDtoSchema>;
export type UpdateMeetingStatusDto = z.infer<typeof UpdateMeetingStatusDtoSchema>;
export type GetUpcomingMeetingsQueryDto = z.infer<typeof GetUpcomingMeetingsQueryDtoSchema>;
export type SaveMeetingSessionDto = z.infer<typeof SaveMeetingSessionDtoSchema>;
export type GetMeetingAnalyticsQueryDto = z.infer<typeof GetMeetingAnalyticsQueryDtoSchema>;
export type EmergencyTerminateMeetingDto = z.infer<typeof EmergencyTerminateMeetingDtoSchema>;

// Complex meeting data structures moved from frontend services
export const SessionMeetingSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  type: z.enum(['video', 'audio', 'chat']),
  therapistId: z.string().uuid(),
  clientId: z.string().uuid(),
  roomUrl: z.string().url().optional(),
  roomToken: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  therapist: z.object({
    id: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    profileImage: z.string().url().optional()
  }).optional(),
  client: z.object({
    id: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    profileImage: z.string().url().optional()
  }).optional()
});

export const MeetingSessionDataSchema = z.object({
  meetingId: z.string().uuid(),
  duration: z.number().min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  participantCount: z.number().min(1).max(10),
  quality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  issues: z.array(z.string()).optional(),
  sessionNotes: z.string().max(2000).optional(),
  clientProgress: z.object({
    mood: z.enum(['excellent', 'good', 'neutral', 'poor', 'critical']).optional(),
    engagement: z.enum(['high', 'medium', 'low']).optional(),
    goals: z.array(z.string()).optional(),
    outcomes: z.array(z.string()).optional()
  }).optional(),
  followUpActions: z.array(z.object({
    action: z.string().min(1),
    priority: z.enum(['high', 'medium', 'low']),
    dueDate: z.string().datetime().optional()
  })).optional()
});

export const MeetingAnalyticsSchema = z.object({
  totalMeetings: z.number().min(0),
  totalDuration: z.number().min(0),
  averageDuration: z.number().min(0),
  meetingsByType: z.object({
    video: z.number().min(0),
    audio: z.number().min(0),
    chat: z.number().min(0)
  }),
  completionRate: z.number().min(0).max(100)
});

export const MeetingRoomResponseSchema = z.object({
  roomUrl: z.string().url(),
  roomToken: z.string().min(1),
  meetingId: z.string().uuid(),
  expires: z.string().datetime()
});

export const MeetingStatusUpdateSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  reason: z.string().optional(),
  notifyParticipants: z.boolean().optional()
});

export const EmergencyTerminationRequestSchema = z.object({
  reason: z.enum(['technical_issues', 'emergency', 'safety_concern', 'participant_request']),
  description: z.string().min(1),
  notifySupport: z.boolean().optional(),
  followUpRequired: z.boolean().optional(),
  escalateToSupervisor: z.boolean().optional()
});

// Video Call Integration Schemas
export const CreateVideoRoomDtoSchema = z.object({
  meetingId: z.string().uuid('Invalid meeting ID format'),
  roomType: z.enum(['video', 'audio', 'screen_share']).default('video'),
  maxParticipants: z.number().min(2).max(10).default(2),
  enableRecording: z.boolean().default(false),
  enableChat: z.boolean().default(true),
  recordingSettings: z.object({
    autoStart: z.boolean().default(false),
    layout: z.enum(['gallery', 'speaker', 'custom']).default('speaker')
  }).optional()
});

export const JoinVideoRoomDtoSchema = z.object({
  meetingId: z.string().uuid('Invalid meeting ID format'),
  participantName: z.string().min(1, 'Participant name is required'),
  role: z.enum(['therapist', 'client']),
  devicePreferences: z.object({
    video: z.boolean().default(true),
    audio: z.boolean().default(true),
    screenShare: z.boolean().default(false)
  }).optional()
});

export const VideoRoomResponseSchema = z.object({
  roomId: z.string().min(1),
  roomUrl: z.string().url('Invalid room URL'),
  accessToken: z.string().min(1),
  participantToken: z.string().min(1),
  roomConfig: z.object({
    maxParticipants: z.number().min(2).max(10),
    enableRecording: z.boolean(),
    enableChat: z.boolean(),
    recordingActive: z.boolean()
  }),
  expiresAt: z.string().datetime(),
  participantCount: z.number().min(0),
  status: z.enum(['waiting', 'active', 'ended'])
});

export const EndVideoCallDtoSchema = z.object({
  meetingId: z.string().uuid('Invalid meeting ID format'),
  endReason: z.enum(['session_complete', 'technical_issues', 'participant_left', 'emergency']).default('session_complete'),
  sessionSummary: z.object({
    duration: z.number().min(0), // in minutes
    participantCount: z.number().min(1),
    connectionQuality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
    technicalIssues: z.array(z.string()).optional()
  }).optional(),
  nextSteps: z.string().max(500).optional()
});

export const VideoCallStatusSchema = z.object({
  meetingId: z.string().uuid(),
  roomId: z.string().min(1),
  status: z.enum(['waiting', 'active', 'ended', 'error']),
  participants: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    role: z.enum(['therapist', 'client']),
    joinedAt: z.string().datetime(),
    connectionStatus: z.enum(['connected', 'connecting', 'disconnected'])
  })),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  duration: z.number().min(0).optional() // in minutes
});

// Export type inference helpers for new schemas
export type SessionMeeting = z.infer<typeof SessionMeetingSchema>;
export type MeetingSessionData = z.infer<typeof MeetingSessionDataSchema>;
export type MeetingAnalytics = z.infer<typeof MeetingAnalyticsSchema>;
export type MeetingRoomResponse = z.infer<typeof MeetingRoomResponseSchema>;
export type MeetingStatusUpdate = z.infer<typeof MeetingStatusUpdateSchema>;
export type EmergencyTerminationRequest = z.infer<typeof EmergencyTerminationRequestSchema>;

// Video Call Types
export type CreateVideoRoomDto = z.infer<typeof CreateVideoRoomDtoSchema>;
export type JoinVideoRoomDto = z.infer<typeof JoinVideoRoomDtoSchema>;
export type VideoRoomResponse = z.infer<typeof VideoRoomResponseSchema>;
export type EndVideoCallDto = z.infer<typeof EndVideoCallDtoSchema>;
export type VideoCallStatus = z.infer<typeof VideoCallStatusSchema>;