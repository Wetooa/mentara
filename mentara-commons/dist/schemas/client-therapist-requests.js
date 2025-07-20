"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestStatisticsSchema = exports.TherapistRequestResponseSchema = exports.ClientRequestResponseSchema = exports.BulkTherapistActionDtoSchema = exports.TherapistRequestFiltersDtoSchema = exports.TherapistRequestResponseDtoSchema = exports.CancelClientRequestDtoSchema = exports.ClientRequestFiltersDtoSchema = exports.SendMultipleTherapistRequestsDtoSchema = exports.SendTherapistRequestDtoSchema = exports.RequestPrioritySchema = exports.ClientRequestStatusSchema = void 0;
const zod_1 = require("zod");
// Enums matching the Prisma schema
exports.ClientRequestStatusSchema = zod_1.z.enum([
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED',
    'CANCELLED',
    'WITHDRAWN',
]);
exports.RequestPrioritySchema = zod_1.z.enum([
    'LOW',
    'NORMAL',
    'HIGH',
    'URGENT',
]);
// ===== CLIENT REQUEST SCHEMAS =====
// Schema for sending a therapist request
exports.SendTherapistRequestDtoSchema = zod_1.z.object({
    message: zod_1.z.string()
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message cannot exceed 1000 characters')
        .optional(),
    priority: exports.RequestPrioritySchema.default('NORMAL'),
    recommendationRank: zod_1.z.number().min(1).optional(),
    matchScore: zod_1.z.number().min(0).max(1).optional(),
});
// Schema for sending multiple therapist requests
exports.SendMultipleTherapistRequestsDtoSchema = zod_1.z.object({
    therapistIds: zod_1.z.array(zod_1.z.string().uuid('Invalid therapist ID format'))
        .min(1, 'At least one therapist ID is required')
        .max(10, 'Cannot send requests to more than 10 therapists at once'),
    message: zod_1.z.string()
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message cannot exceed 1000 characters')
        .optional(),
    priority: exports.RequestPrioritySchema.default('NORMAL'),
});
// Schema for filtering client requests
exports.ClientRequestFiltersDtoSchema = zod_1.z.object({
    status: exports.ClientRequestStatusSchema.optional(),
    priority: exports.RequestPrioritySchema.optional(),
    therapistId: zod_1.z.string().uuid().optional(),
    requestedAfter: zod_1.z.string().datetime().optional(),
    requestedBefore: zod_1.z.string().datetime().optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['requestedAt', 'respondedAt', 'priority', 'status']).default('requestedAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Schema for cancelling a client request
exports.CancelClientRequestDtoSchema = zod_1.z.object({
    reason: zod_1.z.string()
        .min(5, 'Cancellation reason must be at least 5 characters')
        .max(500, 'Reason cannot exceed 500 characters')
        .optional(),
});
// ===== THERAPIST REQUEST SCHEMAS =====
// Schema for therapist response to client request
exports.TherapistRequestResponseDtoSchema = zod_1.z.object({
    response: zod_1.z.string()
        .min(10, 'Response message must be at least 10 characters')
        .max(1000, 'Response cannot exceed 1000 characters'),
    schedulingMessage: zod_1.z.string()
        .min(5, 'Scheduling message must be at least 5 characters')
        .max(500, 'Scheduling message cannot exceed 500 characters')
        .optional(),
    acceptNewClients: zod_1.z.boolean().default(true),
    preferredContactMethod: zod_1.z.enum(['platform', 'email', 'phone']).default('platform'),
});
// Schema for filtering therapist requests
exports.TherapistRequestFiltersDtoSchema = zod_1.z.object({
    status: exports.ClientRequestStatusSchema.optional(),
    priority: exports.RequestPrioritySchema.optional(),
    clientId: zod_1.z.string().uuid().optional(),
    requestedAfter: zod_1.z.string().datetime().optional(),
    requestedBefore: zod_1.z.string().datetime().optional(),
    respondedAfter: zod_1.z.string().datetime().optional(),
    respondedBefore: zod_1.z.string().datetime().optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['requestedAt', 'respondedAt', 'priority', 'status']).default('requestedAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    includeExpired: zod_1.z.boolean().default(false),
});
// Schema for bulk therapist actions
exports.BulkTherapistActionDtoSchema = zod_1.z.object({
    requestIds: zod_1.z.array(zod_1.z.string().uuid('Invalid request ID format'))
        .min(1, 'At least one request ID is required')
        .max(50, 'Cannot process more than 50 requests at once'),
    action: zod_1.z.enum(['accept', 'decline', 'mark_reviewed']),
    response: zod_1.z.string()
        .min(10, 'Response message must be at least 10 characters')
        .max(1000, 'Response cannot exceed 1000 characters')
        .optional(),
});
// ===== RESPONSE SCHEMAS =====
// Schema for client request response
exports.ClientRequestResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid(),
    therapistId: zod_1.z.string().uuid(),
    status: exports.ClientRequestStatusSchema,
    priority: exports.RequestPrioritySchema,
    requestedAt: zod_1.z.date(),
    respondedAt: zod_1.z.date().nullable(),
    expiresAt: zod_1.z.date().nullable(),
    clientMessage: zod_1.z.string().nullable(),
    therapistResponse: zod_1.z.string().nullable(),
    recommendationRank: zod_1.z.number().nullable(),
    matchScore: zod_1.z.number().nullable(),
    therapist: zod_1.z.object({
        userId: zod_1.z.string().uuid(),
        user: zod_1.z.object({
            firstName: zod_1.z.string(),
            lastName: zod_1.z.string(),
            avatarUrl: zod_1.z.string().nullable(),
        }),
        specializations: zod_1.z.array(zod_1.z.string()).optional(),
        averageRating: zod_1.z.number().nullable(),
        hourlyRate: zod_1.z.number(),
    }).optional(),
});
// Schema for therapist request response
exports.TherapistRequestResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid(),
    therapistId: zod_1.z.string().uuid(),
    status: exports.ClientRequestStatusSchema,
    priority: exports.RequestPrioritySchema,
    requestedAt: zod_1.z.date(),
    respondedAt: zod_1.z.date().nullable(),
    expiresAt: zod_1.z.date().nullable(),
    clientMessage: zod_1.z.string().nullable(),
    therapistResponse: zod_1.z.string().nullable(),
    recommendationRank: zod_1.z.number().nullable(),
    matchScore: zod_1.z.number().nullable(),
    client: zod_1.z.object({
        userId: zod_1.z.string().uuid(),
        user: zod_1.z.object({
            firstName: zod_1.z.string(),
            lastName: zod_1.z.string(),
            avatarUrl: zod_1.z.string().nullable(),
        }),
        hasSeenTherapistRecommendations: zod_1.z.boolean(),
    }).optional(),
});
// Schema for request statistics
exports.RequestStatisticsSchema = zod_1.z.object({
    totalSent: zod_1.z.number(),
    totalReceived: zod_1.z.number(),
    pending: zod_1.z.number(),
    accepted: zod_1.z.number(),
    declined: zod_1.z.number(),
    expired: zod_1.z.number(),
    cancelled: zod_1.z.number(),
    acceptanceRate: zod_1.z.number(),
    averageResponseTime: zod_1.z.number(), // in hours
    lastRequestAt: zod_1.z.date().nullable(),
    lastResponseAt: zod_1.z.date().nullable(),
});
//# sourceMappingURL=client-therapist-requests.js.map