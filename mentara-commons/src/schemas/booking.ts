import { z } from 'zod';

// Meeting Status Schema
export const MeetingStatusSchema = z.enum([
  'scheduled',
  'confirmed', 
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
]);

// Meeting Type Schema
export const MeetingTypeSchema = z.enum([
  'video',
  'audio', 
  'phone',
  'chat',
  'in-person'
]);

// Meeting Duration Schema
export const MeetingDurationSchema = z.object({
  id: z.string().min(1, 'Duration ID is required'),
  name: z.string().min(1, 'Duration name is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 240 minutes'),
  isActive: z.boolean(),
  sortOrder: z.number().min(0)
});

// Available Slot Schema
export const AvailableSlotSchema = z.object({
  startTime: z.string().datetime('Invalid start time format'),
  availableDurations: z.array(MeetingDurationSchema).min(1, 'At least one duration must be available')
});

// Meeting Participant Schemas
export const MeetingClientSchema = z.object({
  id: z.string().min(1, 'Client ID is required'),
  user: z.object({
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string().email().nullable()
  })
});

export const MeetingTherapistSchema = z.object({
  id: z.string().min(1, 'Therapist ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  title: z.string().optional()
});

// Core Meeting Schema
export const MeetingSchema = z.object({
  id: z.string().min(1, 'Meeting ID is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  startTime: z.string().datetime('Invalid start time format'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 240 minutes'),
  status: MeetingStatusSchema,
  meetingType: MeetingTypeSchema.optional(),
  meetingUrl: z.string().url().optional(),
  notes: z.string().optional(),
  clientId: z.string().min(1, 'Client ID is required'),
  therapistId: z.string().min(1, 'Therapist ID is required'),
  client: MeetingClientSchema.optional(),
  therapist: MeetingTherapistSchema.optional(),
  durationConfig: MeetingDurationSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Create Meeting Request Schema
export const CreateMeetingRequestSchema = z.object({
  therapistId: z.string().min(1, 'Therapist ID is required'),
  startTime: z.string().datetime('Invalid start time format'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 240 minutes'),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  meetingType: MeetingTypeSchema.optional().default('video')
});

// Update Meeting Request Schema
export const UpdateMeetingRequestSchema = z.object({
  status: MeetingStatusSchema.optional(),
  notes: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  startTime: z.string().datetime('Invalid start time format').optional(),
  duration: z.number().min(15).max(240).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  meetingType: MeetingTypeSchema.optional()
});

// Booking Form Data Schema
export const BookingFormDataSchema = z.object({
  date: z.string().date('Invalid date format'),
  timeSlot: AvailableSlotSchema,
  duration: MeetingDurationSchema,
  meetingType: MeetingTypeSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required')
});

// Meeting List Parameters Schema
export const MeetingListParamsSchema = z.object({
  status: MeetingStatusSchema.optional(),
  therapistId: z.string().optional(),
  clientId: z.string().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['startTime', 'status', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Meeting List Response Schema
export const MeetingListResponseSchema = z.object({
  meetings: z.array(MeetingSchema),
  totalCount: z.number().min(0),
  page: z.number().min(1),
  pageSize: z.number().min(1),
  totalPages: z.number().min(0)
});

// Duration Schema (simplified version for duration-only operations)
export const DurationSchema = z.object({
  id: z.string().min(1),
  duration: z.number().min(15).max(240),
  name: z.string().min(1)
});

// Conflict Detection Schemas
export const TimeRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime()
});

export const ConflictResultSchema = z.object({
  hasConflict: z.boolean(),
  conflictingMeetings: z.array(z.object({
    id: z.string(),
    title: z.string().optional(),
    startTime: z.string().datetime(),
    duration: z.number(),
    status: MeetingStatusSchema
  })),
  message: z.string().optional()
});

// Slot Generation Schemas
export const SlotGenerationConfigSchema = z.object({
  therapistId: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
  workingHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
  }),
  slotDuration: z.number().min(15).max(240),
  breakDuration: z.number().min(0).max(60).default(0),
  excludeWeekends: z.boolean().default(true)
});

export const TimeSlotSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  isAvailable: z.boolean(),
  reason: z.string().optional() // Why slot is unavailable
});

// Availability Validation Schemas
export const ValidationConfigSchema = z.object({
  minimumNoticeHours: z.number().min(0).default(24),
  maximumAdvanceBookingDays: z.number().min(1).default(90),
  allowSameDayBooking: z.boolean().default(false),
  allowWeekendBooking: z.boolean().default(true)
});

// Booking Analytics Schemas
export const BookingStatsSchema = z.object({
  totalBookings: z.number().min(0),
  completedBookings: z.number().min(0),
  cancelledBookings: z.number().min(0),
  noShowBookings: z.number().min(0),
  averageDuration: z.number().min(0),
  mostPopularTimeSlots: z.array(z.object({
    hour: z.number().min(0).max(23),
    count: z.number().min(0)
  })),
  bookingsByDay: z.array(z.object({
    date: z.string().date(),
    count: z.number().min(0)
  }))
});

// Type inference exports
export type MeetingStatus = z.infer<typeof MeetingStatusSchema>;
export type MeetingType = z.infer<typeof MeetingTypeSchema>;
export type MeetingDuration = z.infer<typeof MeetingDurationSchema>;
export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;
export type Meeting = z.infer<typeof MeetingSchema>;
export type MeetingClient = z.infer<typeof MeetingClientSchema>;
export type MeetingTherapist = z.infer<typeof MeetingTherapistSchema>;
export type CreateMeetingRequest = z.infer<typeof CreateMeetingRequestSchema>;
export type UpdateMeetingRequest = z.infer<typeof UpdateMeetingRequestSchema>;
export type BookingFormData = z.infer<typeof BookingFormDataSchema>;
export type MeetingListParams = z.infer<typeof MeetingListParamsSchema>;
export type MeetingListResponse = z.infer<typeof MeetingListResponseSchema>;
export type Duration = z.infer<typeof DurationSchema>;
export type TimeRange = z.infer<typeof TimeRangeSchema>;
export type ConflictResult = z.infer<typeof ConflictResultSchema>;
export type SlotGenerationConfig = z.infer<typeof SlotGenerationConfigSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type ValidationConfig = z.infer<typeof ValidationConfigSchema>;
export type BookingStats = z.infer<typeof BookingStatsSchema>;

// Additional DTOs for BookingController endpoints
export const MeetingCreateDtoSchema = CreateMeetingRequestSchema;
export const MeetingUpdateDtoSchema = UpdateMeetingRequestSchema;

export const BookingMeetingParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid meeting ID format')
});

export const TherapistAvailabilityCreateDtoSchema = z.object({
  therapistId: z.string().uuid('Invalid therapist ID format'),
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  isAvailable: z.boolean().default(true),
  timezone: z.string().optional(),
  notes: z.string().optional()
});

export const TherapistAvailabilityUpdateDtoSchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  isAvailable: z.boolean().optional(),
  timezone: z.string().optional(),
  notes: z.string().optional()
});

export const AvailabilityParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid availability ID format')
});

export const GetAvailableSlotsQueryDtoSchema = z.object({
  therapistId: z.string().uuid('Invalid therapist ID format'),
  date: z.string().date('Invalid date format (YYYY-MM-DD)'),
  duration: z.number().min(15).max(240).optional()
});

// Type exports for new DTOs
export type MeetingCreateDto = z.infer<typeof MeetingCreateDtoSchema>;
export type MeetingUpdateDto = z.infer<typeof MeetingUpdateDtoSchema>;
export type BookingMeetingParamsDto = z.infer<typeof BookingMeetingParamsDtoSchema>;
export type TherapistAvailabilityCreateDto = z.infer<typeof TherapistAvailabilityCreateDtoSchema>;
export type TherapistAvailabilityUpdateDto = z.infer<typeof TherapistAvailabilityUpdateDtoSchema>;
export type AvailabilityParamsDto = z.infer<typeof AvailabilityParamsDtoSchema>;
export type GetAvailableSlotsQueryDto = z.infer<typeof GetAvailableSlotsQueryDtoSchema>;