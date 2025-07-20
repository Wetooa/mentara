import { z } from 'zod';

// Define enums that match Prisma models
const PaymentMethodTypeSchema = z.enum(['CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET']);
const PaymentStatusSchema = z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']);

// ===== PAYMENT METHODS =====

// Create Payment Method
export const CreatePaymentMethodDtoSchema = z.object({
  type: PaymentMethodTypeSchema,
  cardLast4: z.string().length(4).optional(),
  cardBrand: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
});

// Update Payment Method
export const UpdatePaymentMethodDtoSchema = z.object({
  isDefault: z.boolean().optional(),
});

// ===== PAYMENTS =====

// Process Session Payment
export const ProcessSessionPaymentDtoSchema = z.object({
  therapistId: z.string().min(1),
  meetingId: z.string().optional(),
  amount: z.number().min(0.01),
  currency: z.string().length(3).default('USD'),
  paymentMethodId: z.string().min(1),
  description: z.string().optional(),
});

// Get Payments Query
export const GetPaymentsQueryDtoSchema = z.object({
  role: z.enum(['client', 'therapist']).optional(),
  status: PaymentStatusSchema.optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Retry Payment
export const RetryPaymentDtoSchema = z.object({
  // No body needed for retry, just the payment ID in the URL
});

// Note: Analytics query schemas are defined in analytics.ts to avoid duplication

// ===== RESPONSE SCHEMAS =====

// Payment Method Response
export const PaymentMethodResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: PaymentMethodTypeSchema,
  cardLast4: z.string().optional(),
  cardBrand: z.string().optional(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Payment Response
export const PaymentResponseSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: PaymentStatusSchema,
  clientId: z.string(),
  therapistId: z.string(),
  meetingId: z.string().optional(),
  paymentMethodId: z.string(),
  failureReason: z.string().optional(),
  processedAt: z.string().datetime().optional(),
  failedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  client: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }).optional(),
  therapist: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }).optional(),
  paymentMethod: PaymentMethodResponseSchema.optional(),
  meeting: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    title: z.string(),
  }).optional(),
});

// Therapist Analytics Response
export const TherapistAnalyticsResponseSchema = z.object({
  totalSessions: z.number(),
  totalRevenue: z.number(),
  averageSessionRate: z.number(),
  platformFees: z.number(),
  netEarnings: z.number(),
  period: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Platform Analytics Response
export const PlatformAnalyticsResponseSchema = z.object({
  totalPayments: z.number(),
  successfulPayments: z.number(),
  failedPayments: z.number(),
  successRate: z.number(),
  totalRevenue: z.number(),
  platformRevenue: z.number(),
  therapistPayouts: z.number(),
  period: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Test Cards Response
export const TestCardsResponseSchema = z.object({
  message: z.string(),
  testCards: z.array(z.object({
    last4: z.string(),
    scenario: z.string(),
    description: z.string(),
  })),
  notes: z.array(z.string()),
});

// Service Status Response
export const ServiceStatusResponseSchema = z.object({
  service: z.string(),
  status: z.string(),
  mode: z.string(),
  features: z.array(z.string()),
  configuration: z.object({
    platformFeeRate: z.string(),
    successRate: z.string(),
    processingDelay: z.string(),
  }),
});

// ===== TYPE EXPORTS =====

// DTO Types
export type CreatePaymentMethodDto = z.infer<typeof CreatePaymentMethodDtoSchema>;
export type UpdatePaymentMethodDto = z.infer<typeof UpdatePaymentMethodDtoSchema>;
export type ProcessSessionPaymentDto = z.infer<typeof ProcessSessionPaymentDtoSchema>;
export type GetPaymentsQueryDto = z.infer<typeof GetPaymentsQueryDtoSchema>;
export type RetryPaymentDto = z.infer<typeof RetryPaymentDtoSchema>;
// Note: TherapistAnalyticsQueryDto and PlatformAnalyticsQueryDto are exported from analytics.ts

// Response Types
export type PaymentMethodResponse = z.infer<typeof PaymentMethodResponseSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
export type TherapistAnalyticsResponse = z.infer<typeof TherapistAnalyticsResponseSchema>;
export type PlatformAnalyticsResponse = z.infer<typeof PlatformAnalyticsResponseSchema>;
export type TestCardsResponse = z.infer<typeof TestCardsResponseSchema>;
export type ServiceStatusResponse = z.infer<typeof ServiceStatusResponseSchema>;

// Enum Types
export type PaymentMethodType = z.infer<typeof PaymentMethodTypeSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;