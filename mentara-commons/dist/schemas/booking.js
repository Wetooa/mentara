"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAvailableSlotsQueryDtoSchema = exports.AvailabilityParamsDtoSchema = exports.TherapistAvailabilityUpdateDtoSchema = exports.TherapistAvailabilityCreateDtoSchema = exports.BookingMeetingParamsDtoSchema = exports.MeetingUpdateDtoSchema = exports.MeetingCreateDtoSchema = exports.BookingStatsSchema = exports.ValidationConfigSchema = exports.TimeSlotSchema = exports.SlotGenerationConfigSchema = exports.ConflictResultSchema = exports.TimeRangeSchema = exports.DurationSchema = exports.MeetingListResponseSchema = exports.MeetingListParamsSchema = exports.BookingFormDataSchema = exports.UpdateMeetingRequestSchema = exports.CreateMeetingRequestSchema = exports.MeetingSchema = exports.MeetingTherapistSchema = exports.MeetingClientSchema = exports.AvailableSlotSchema = exports.MeetingDurationSchema = exports.MeetingTypeSchema = exports.MeetingStatusSchema = void 0;
const zod_1 = require("zod");
// Meeting Status Schema
exports.MeetingStatusSchema = zod_1.z.enum([
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
]);
// Meeting Type Schema
exports.MeetingTypeSchema = zod_1.z.enum([
    'video',
    'audio',
    'phone',
    'chat',
    'in-person'
]);
// Meeting Duration Schema
exports.MeetingDurationSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Duration ID is required'),
    name: zod_1.z.string().min(1, 'Duration name is required'),
    duration: zod_1.z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 240 minutes'),
    isActive: zod_1.z.boolean(),
    sortOrder: zod_1.z.number().min(0)
});
// Available Slot Schema
exports.AvailableSlotSchema = zod_1.z.object({
    startTime: zod_1.z.string().datetime('Invalid start time format'),
    availableDurations: zod_1.z.array(exports.MeetingDurationSchema).min(1, 'At least one duration must be available')
});
// Meeting Participant Schemas
exports.MeetingClientSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Client ID is required'),
    user: zod_1.z.object({
        firstName: zod_1.z.string().nullable(),
        lastName: zod_1.z.string().nullable(),
        email: zod_1.z.string().email().nullable()
    })
});
exports.MeetingTherapistSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Therapist ID is required'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    title: zod_1.z.string().optional()
});
// Core Meeting Schema
exports.MeetingSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Meeting ID is required'),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime('Invalid start time format'),
    duration: zod_1.z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 240 minutes'),
    status: exports.MeetingStatusSchema,
    meetingType: exports.MeetingTypeSchema.optional(),
    meetingUrl: zod_1.z.string().url().optional(),
    notes: zod_1.z.string().optional(),
    clientId: zod_1.z.string().min(1, 'Client ID is required'),
    therapistId: zod_1.z.string().min(1, 'Therapist ID is required'),
    client: exports.MeetingClientSchema.optional(),
    therapist: exports.MeetingTherapistSchema.optional(),
    durationConfig: exports.MeetingDurationSchema.optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Create Meeting Request Schema
exports.CreateMeetingRequestSchema = zod_1.z.object({
    therapistId: zod_1.z.string().min(1, 'Therapist ID is required'),
    startTime: zod_1.z.string().datetime('Invalid start time format'),
    duration: zod_1.z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 240 minutes'),
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    description: zod_1.z.string().optional(),
    meetingType: exports.MeetingTypeSchema.optional().default('video')
});
// Update Meeting Request Schema
exports.UpdateMeetingRequestSchema = zod_1.z.object({
    status: exports.MeetingStatusSchema.optional(),
    notes: zod_1.z.string().optional(),
    meetingUrl: zod_1.z.string().url().optional(),
    startTime: zod_1.z.string().datetime('Invalid start time format').optional(),
    duration: zod_1.z.number().min(15).max(240).optional(),
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    meetingType: exports.MeetingTypeSchema.optional()
});
// Booking Form Data Schema
exports.BookingFormDataSchema = zod_1.z.object({
    date: zod_1.z.string().date('Invalid date format'),
    timeSlot: exports.AvailableSlotSchema,
    duration: exports.MeetingDurationSchema,
    meetingType: exports.MeetingTypeSchema,
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required')
});
// Meeting List Parameters Schema
exports.MeetingListParamsSchema = zod_1.z.object({
    status: exports.MeetingStatusSchema.optional(),
    therapistId: zod_1.z.string().optional(),
    clientId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().date().optional(),
    endDate: zod_1.z.string().date().optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    sortBy: zod_1.z.enum(['startTime', 'status', 'createdAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Meeting List Response Schema
exports.MeetingListResponseSchema = zod_1.z.object({
    meetings: zod_1.z.array(exports.MeetingSchema),
    totalCount: zod_1.z.number().min(0),
    page: zod_1.z.number().min(1),
    pageSize: zod_1.z.number().min(1),
    totalPages: zod_1.z.number().min(0)
});
// Duration Schema (simplified version for duration-only operations)
exports.DurationSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    duration: zod_1.z.number().min(15).max(240),
    name: zod_1.z.string().min(1)
});
// Conflict Detection Schemas
exports.TimeRangeSchema = zod_1.z.object({
    start: zod_1.z.string().datetime(),
    end: zod_1.z.string().datetime()
});
exports.ConflictResultSchema = zod_1.z.object({
    hasConflict: zod_1.z.boolean(),
    conflictingMeetings: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().optional(),
        startTime: zod_1.z.string().datetime(),
        duration: zod_1.z.number(),
        status: exports.MeetingStatusSchema
    })),
    message: zod_1.z.string().optional()
});
// Slot Generation Schemas
exports.SlotGenerationConfigSchema = zod_1.z.object({
    therapistId: zod_1.z.string().min(1),
    startDate: zod_1.z.string().date(),
    endDate: zod_1.z.string().date(),
    workingHours: zod_1.z.object({
        start: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
        end: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
    }),
    slotDuration: zod_1.z.number().min(15).max(240),
    breakDuration: zod_1.z.number().min(0).max(60).default(0),
    excludeWeekends: zod_1.z.boolean().default(true)
});
exports.TimeSlotSchema = zod_1.z.object({
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    isAvailable: zod_1.z.boolean(),
    reason: zod_1.z.string().optional() // Why slot is unavailable
});
// Availability Validation Schemas
exports.ValidationConfigSchema = zod_1.z.object({
    minimumNoticeHours: zod_1.z.number().min(0).default(24),
    maximumAdvanceBookingDays: zod_1.z.number().min(1).default(90),
    allowSameDayBooking: zod_1.z.boolean().default(false),
    allowWeekendBooking: zod_1.z.boolean().default(true)
});
// Booking Analytics Schemas
exports.BookingStatsSchema = zod_1.z.object({
    totalBookings: zod_1.z.number().min(0),
    completedBookings: zod_1.z.number().min(0),
    cancelledBookings: zod_1.z.number().min(0),
    noShowBookings: zod_1.z.number().min(0),
    averageDuration: zod_1.z.number().min(0),
    mostPopularTimeSlots: zod_1.z.array(zod_1.z.object({
        hour: zod_1.z.number().min(0).max(23),
        count: zod_1.z.number().min(0)
    })),
    bookingsByDay: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string().date(),
        count: zod_1.z.number().min(0)
    }))
});
// Additional DTOs for BookingController endpoints
exports.MeetingCreateDtoSchema = exports.CreateMeetingRequestSchema;
exports.MeetingUpdateDtoSchema = exports.UpdateMeetingRequestSchema;
exports.BookingMeetingParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid meeting ID format')
});
exports.TherapistAvailabilityCreateDtoSchema = zod_1.z.object({
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format'),
    dayOfWeek: zod_1.z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
    startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    isAvailable: zod_1.z.boolean().default(true),
    timezone: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
exports.TherapistAvailabilityUpdateDtoSchema = zod_1.z.object({
    dayOfWeek: zod_1.z.number().min(0).max(6).optional(),
    startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    isAvailable: zod_1.z.boolean().optional(),
    timezone: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
exports.AvailabilityParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid availability ID format')
});
exports.GetAvailableSlotsQueryDtoSchema = zod_1.z.object({
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format'),
    date: zod_1.z.string().date('Invalid date format (YYYY-MM-DD)'),
    duration: zod_1.z.number().min(15).max(240).optional()
});
//# sourceMappingURL=booking.js.map