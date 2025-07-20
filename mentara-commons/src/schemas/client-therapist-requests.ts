import { z } from 'zod';

// Enums matching the Prisma schema
export const ClientRequestStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
  'WITHDRAWN',
]);

export const RequestPrioritySchema = z.enum([
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
]);

// ===== CLIENT REQUEST SCHEMAS =====

// Schema for sending a therapist request
export const SendTherapistRequestDtoSchema = z.object({
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters')
    .optional(),
  priority: RequestPrioritySchema.default('NORMAL'),
  recommendationRank: z.number().min(1).optional(),
  matchScore: z.number().min(0).max(1).optional(),
});

// Schema for sending multiple therapist requests
export const SendMultipleTherapistRequestsDtoSchema = z.object({
  therapistIds: z.array(z.string().uuid('Invalid therapist ID format'))
    .min(1, 'At least one therapist ID is required')
    .max(10, 'Cannot send requests to more than 10 therapists at once'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters')
    .optional(),
  priority: RequestPrioritySchema.default('NORMAL'),
});

// Schema for filtering client requests
export const ClientRequestFiltersDtoSchema = z.object({
  status: ClientRequestStatusSchema.optional(),
  priority: RequestPrioritySchema.optional(),
  therapistId: z.string().uuid().optional(),
  requestedAfter: z.string().datetime().optional(),
  requestedBefore: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['requestedAt', 'respondedAt', 'priority', 'status']).default('requestedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema for cancelling a client request
export const CancelClientRequestDtoSchema = z.object({
  reason: z.string()
    .min(5, 'Cancellation reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
});

// ===== THERAPIST REQUEST SCHEMAS =====

// Schema for therapist response to client request
export const TherapistRequestResponseDtoSchema = z.object({
  response: z.string()
    .min(10, 'Response message must be at least 10 characters')
    .max(1000, 'Response cannot exceed 1000 characters'),
  schedulingMessage: z.string()
    .min(5, 'Scheduling message must be at least 5 characters')
    .max(500, 'Scheduling message cannot exceed 500 characters')
    .optional(),
  acceptNewClients: z.boolean().default(true),
  preferredContactMethod: z.enum(['platform', 'email', 'phone']).default('platform'),
});

// Schema for filtering therapist requests
export const TherapistRequestFiltersDtoSchema = z.object({
  status: ClientRequestStatusSchema.optional(),
  priority: RequestPrioritySchema.optional(),
  clientId: z.string().uuid().optional(),
  requestedAfter: z.string().datetime().optional(),
  requestedBefore: z.string().datetime().optional(),
  respondedAfter: z.string().datetime().optional(),
  respondedBefore: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['requestedAt', 'respondedAt', 'priority', 'status']).default('requestedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeExpired: z.boolean().default(false),
});

// Schema for bulk therapist actions
export const BulkTherapistActionDtoSchema = z.object({
  requestIds: z.array(z.string().uuid('Invalid request ID format'))
    .min(1, 'At least one request ID is required')
    .max(50, 'Cannot process more than 50 requests at once'),
  action: z.enum(['accept', 'decline', 'mark_reviewed']),
  response: z.string()
    .min(10, 'Response message must be at least 10 characters')
    .max(1000, 'Response cannot exceed 1000 characters')
    .optional(),
});

// ===== RESPONSE SCHEMAS =====

// Schema for client request response
export const ClientRequestResponseSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  therapistId: z.string().uuid(),
  status: ClientRequestStatusSchema,
  priority: RequestPrioritySchema,
  requestedAt: z.date(),
  respondedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  clientMessage: z.string().nullable(),
  therapistResponse: z.string().nullable(),
  recommendationRank: z.number().nullable(),
  matchScore: z.number().nullable(),
  therapist: z.object({
    userId: z.string().uuid(),
    user: z.object({
      firstName: z.string(),
      lastName: z.string(),
      avatarUrl: z.string().nullable(),
    }),
    specializations: z.array(z.string()).optional(),
    averageRating: z.number().nullable(),
    hourlyRate: z.number(),
  }).optional(),
});

// Schema for therapist request response
export const TherapistRequestResponseSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  therapistId: z.string().uuid(),
  status: ClientRequestStatusSchema,
  priority: RequestPrioritySchema,
  requestedAt: z.date(),
  respondedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  clientMessage: z.string().nullable(),
  therapistResponse: z.string().nullable(),
  recommendationRank: z.number().nullable(),
  matchScore: z.number().nullable(),
  client: z.object({
    userId: z.string().uuid(),
    user: z.object({
      firstName: z.string(),
      lastName: z.string(),
      avatarUrl: z.string().nullable(),
    }),
    hasSeenTherapistRecommendations: z.boolean(),
  }).optional(),
});

// Schema for request statistics
export const RequestStatisticsSchema = z.object({
  totalSent: z.number(),
  totalReceived: z.number(),
  pending: z.number(),
  accepted: z.number(),
  declined: z.number(),
  expired: z.number(),
  cancelled: z.number(),
  acceptanceRate: z.number(),
  averageResponseTime: z.number(), // in hours
  lastRequestAt: z.date().nullable(),
  lastResponseAt: z.date().nullable(),
});

// ===== TYPE EXPORTS =====

// Client request types
export type SendTherapistRequestDto = z.infer<typeof SendTherapistRequestDtoSchema>;
export type SendMultipleTherapistRequestsDto = z.infer<typeof SendMultipleTherapistRequestsDtoSchema>;
export type ClientRequestFiltersDto = z.infer<typeof ClientRequestFiltersDtoSchema>;
export type CancelClientRequestDto = z.infer<typeof CancelClientRequestDtoSchema>;

// Therapist request types
export type TherapistRequestResponseDto = z.infer<typeof TherapistRequestResponseDtoSchema>;
export type TherapistRequestFiltersDto = z.infer<typeof TherapistRequestFiltersDtoSchema>;
export type BulkTherapistActionDto = z.infer<typeof BulkTherapistActionDtoSchema>;

// Response types
export type ClientRequestResponse = z.infer<typeof ClientRequestResponseSchema>;
export type TherapistRequestResponse = z.infer<typeof TherapistRequestResponseSchema>;
export type RequestStatistics = z.infer<typeof RequestStatisticsSchema>;

// Enum types
export type ClientRequestStatus = z.infer<typeof ClientRequestStatusSchema>;
export type RequestPriority = z.infer<typeof RequestPrioritySchema>;