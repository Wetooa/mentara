import { z } from 'zod';

export const MeetingCreateDtoSchema = z.object({
  therapistId: z.string().min(1, "Therapist ID is required"),
  dateTime: z.coerce.date(),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(180, "Duration cannot exceed 3 hours"),
  notes: z.string().optional(),
  meetingType: z.enum(['online', 'in-person']),
});

export const MeetingUpdateDtoSchema = z.object({
  dateTime: z.coerce.date().optional(),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(180, "Duration cannot exceed 3 hours").optional(),
  notes: z.string().optional(),
  meetingType: z.enum(['online', 'in-person']).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']).optional(),
});

export const BookingMeetingParamsDtoSchema = z.object({
  id: z.string().min(1, "Meeting ID is required"),
});

export const TherapistAvailabilityCreateDtoSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  isRecurring: z.boolean(),
  specificDate: z.coerce.date().optional(),
});

export const TherapistAvailabilityUpdateDtoSchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  isRecurring: z.boolean().optional(),
  specificDate: z.coerce.date().optional(),
});

export const AvailabilityParamsDtoSchema = z.object({
  id: z.string().min(1, "Availability ID is required"),
});

export const GetAvailableSlotsQueryDtoSchema = z.object({
  therapistId: z.string().min(1, "Therapist ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});