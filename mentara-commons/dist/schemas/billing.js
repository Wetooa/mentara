"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceStatusResponseSchema = exports.TestCardsResponseSchema = exports.PlatformAnalyticsResponseSchema = exports.TherapistAnalyticsResponseSchema = exports.PaymentResponseSchema = exports.PaymentMethodResponseSchema = exports.RetryPaymentDtoSchema = exports.GetPaymentsQueryDtoSchema = exports.ProcessSessionPaymentDtoSchema = exports.UpdatePaymentMethodDtoSchema = exports.CreatePaymentMethodDtoSchema = void 0;
const zod_1 = require("zod");
// Define enums that match Prisma models
const PaymentMethodTypeSchema = zod_1.z.enum(['CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET']);
const PaymentStatusSchema = zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']);
// ===== PAYMENT METHODS =====
// Create Payment Method
exports.CreatePaymentMethodDtoSchema = zod_1.z.object({
    type: PaymentMethodTypeSchema,
    cardLast4: zod_1.z.string().length(4).optional(),
    cardBrand: zod_1.z.string().min(1).optional(),
    isDefault: zod_1.z.boolean().optional(),
});
// Update Payment Method
exports.UpdatePaymentMethodDtoSchema = zod_1.z.object({
    isDefault: zod_1.z.boolean().optional(),
});
// ===== PAYMENTS =====
// Process Session Payment
exports.ProcessSessionPaymentDtoSchema = zod_1.z.object({
    therapistId: zod_1.z.string().min(1),
    meetingId: zod_1.z.string().optional(),
    amount: zod_1.z.number().min(0.01),
    currency: zod_1.z.string().length(3).default('USD'),
    paymentMethodId: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
// Get Payments Query
exports.GetPaymentsQueryDtoSchema = zod_1.z.object({
    role: zod_1.z.enum(['client', 'therapist']).optional(),
    status: PaymentStatusSchema.optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    offset: zod_1.z.number().min(0).optional(),
});
// Retry Payment
exports.RetryPaymentDtoSchema = zod_1.z.object({
// No body needed for retry, just the payment ID in the URL
});
// Note: Analytics query schemas are defined in analytics.ts to avoid duplication
// ===== RESPONSE SCHEMAS =====
// Payment Method Response
exports.PaymentMethodResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    type: PaymentMethodTypeSchema,
    cardLast4: zod_1.z.string().optional(),
    cardBrand: zod_1.z.string().optional(),
    isDefault: zod_1.z.boolean(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Payment Response
exports.PaymentResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    amount: zod_1.z.number(),
    currency: zod_1.z.string(),
    status: PaymentStatusSchema,
    clientId: zod_1.z.string(),
    therapistId: zod_1.z.string(),
    meetingId: zod_1.z.string().optional(),
    paymentMethodId: zod_1.z.string(),
    failureReason: zod_1.z.string().optional(),
    processedAt: zod_1.z.string().datetime().optional(),
    failedAt: zod_1.z.string().datetime().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    client: zod_1.z.object({
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string(),
    }).optional(),
    therapist: zod_1.z.object({
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string(),
    }).optional(),
    paymentMethod: exports.PaymentMethodResponseSchema.optional(),
    meeting: zod_1.z.object({
        startTime: zod_1.z.string().datetime(),
        endTime: zod_1.z.string().datetime(),
        title: zod_1.z.string(),
    }).optional(),
});
// Therapist Analytics Response
exports.TherapistAnalyticsResponseSchema = zod_1.z.object({
    totalSessions: zod_1.z.number(),
    totalRevenue: zod_1.z.number(),
    averageSessionRate: zod_1.z.number(),
    platformFees: zod_1.z.number(),
    netEarnings: zod_1.z.number(),
    period: zod_1.z.object({
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
    }),
});
// Platform Analytics Response
exports.PlatformAnalyticsResponseSchema = zod_1.z.object({
    totalPayments: zod_1.z.number(),
    successfulPayments: zod_1.z.number(),
    failedPayments: zod_1.z.number(),
    successRate: zod_1.z.number(),
    totalRevenue: zod_1.z.number(),
    platformRevenue: zod_1.z.number(),
    therapistPayouts: zod_1.z.number(),
    period: zod_1.z.object({
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
    }),
});
// Test Cards Response
exports.TestCardsResponseSchema = zod_1.z.object({
    message: zod_1.z.string(),
    testCards: zod_1.z.array(zod_1.z.object({
        last4: zod_1.z.string(),
        scenario: zod_1.z.string(),
        description: zod_1.z.string(),
    })),
    notes: zod_1.z.array(zod_1.z.string()),
});
// Service Status Response
exports.ServiceStatusResponseSchema = zod_1.z.object({
    service: zod_1.z.string(),
    status: zod_1.z.string(),
    mode: zod_1.z.string(),
    features: zod_1.z.array(zod_1.z.string()),
    configuration: zod_1.z.object({
        platformFeeRate: zod_1.z.string(),
        successRate: zod_1.z.string(),
        processingDelay: zod_1.z.string(),
    }),
});
//# sourceMappingURL=billing.js.map