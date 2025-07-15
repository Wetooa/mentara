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