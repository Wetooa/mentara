import { z } from 'zod';

// Define enums from Prisma client
const BillingCycleSchema = z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']);
const SubscriptionTierSchema = z.enum(['FREE', 'BASIC', 'PREMIUM', 'PROFESSIONAL', 'ENTERPRISE']);
const PaymentMethodTypeSchema = z.enum(['CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'CRYPTO']);
const PaymentStatusSchema = z.enum(['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'REQUIRES_ACTION']);
const InvoiceStatusSchema = z.enum(['DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID']);
const DiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL_EXTENSION']);

// ===== SUBSCRIPTION MANAGEMENT =====

// Create Subscription
export const CreateSubscriptionDtoSchema = z.object({
  planId: z.string().min(1),
  billingCycle: BillingCycleSchema.optional(),
  defaultPaymentMethodId: z.string().optional(),
  trialStart: z.string().datetime().optional(),
  trialEnd: z.string().datetime().optional(),
});

// Update Subscription
export const UpdateSubscriptionDtoSchema = z.object({
  planId: z.string().optional(),
  billingCycle: BillingCycleSchema.optional(),
  defaultPaymentMethodId: z.string().optional(),
});

// Cancel Subscription
export const CancelSubscriptionDtoSchema = z.object({
  reason: z.string().optional(),
});

// Change Subscription Plan
export const ChangeSubscriptionPlanDtoSchema = z.object({
  newPlanId: z.string().min(1),
  billingCycle: BillingCycleSchema.optional(),
  prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
  effectiveDate: z.string().datetime().optional(),
});

// Pause Subscription
export const PauseSubscriptionDtoSchema = z.object({
  pauseUntil: z.string().datetime().optional(),
  reason: z.string().optional(),
});

// Schedule Subscription Cancellation
export const ScheduleSubscriptionCancellationDtoSchema = z.object({
  reason: z.string().optional(),
  feedback: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

// Reactivate Subscription
export const ReactivateSubscriptionDtoSchema = z.object({
  newPaymentMethodId: z.string().optional(),
});

// Apply Discount to Subscription
export const ApplyDiscountDtoSchema = z.object({
  discountCode: z.string().min(1),
});

// Subscription Usage Analytics Query
export const SubscriptionUsageAnalyticsQueryDtoSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ===== SUBSCRIPTION PLANS =====

// Get Plans Query
export const GetPlansQueryDtoSchema = z.object({
  isActive: z.boolean().optional(),
});

// Create Plan
export const CreatePlanDtoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tier: SubscriptionTierSchema,
  monthlyPrice: z.number().min(0),
  yearlyPrice: z.number().min(0).optional(),
  features: z.record(z.unknown()).default({}),
  limits: z.record(z.unknown()).default({}),
  trialDays: z.number().min(0).optional(),
});

// Update Plan
export const UpdatePlanDtoSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0).optional(),
  yearlyPrice: z.number().min(0).optional(),
  features: z.any().optional(),
  limits: z.any().optional(),
  trialDays: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ===== PAYMENT METHODS =====

// Create Payment Method
export const CreatePaymentMethodDtoSchema = z.object({
  type: PaymentMethodTypeSchema,
  cardLast4: z.string().optional(),
  cardBrand: z.string().optional(),
  cardExpMonth: z.number().min(1).max(12).optional(),
  cardExpYear: z.number().optional(),
  stripePaymentMethodId: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// Update Payment Method
export const UpdatePaymentMethodDtoSchema = z.object({
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ===== PAYMENTS =====

// Create Payment
export const CreatePaymentDtoSchema = z.object({
  amount: z.number().min(0.01),
  currency: z.string().length(3).default('USD'),
  paymentMethodId: z.string().optional(),
  subscriptionId: z.string().optional(),
  invoiceId: z.string().optional(),
  meetingId: z.string().optional(),
  description: z.string().optional(),
  providerPaymentId: z.string().optional(),
});

// Get Payments Query
export const GetPaymentsQueryDtoSchema = z.object({
  subscriptionId: z.string().optional(),
  status: PaymentStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Update Payment Status
export const UpdatePaymentStatusDtoSchema = z.object({
  status: PaymentStatusSchema,
  metadata: z.any().optional(),
});

// ===== INVOICES =====

// Create Invoice
export const CreateInvoiceDtoSchema = z.object({
  subscriptionId: z.string().min(1),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  dueDate: z.string().datetime(),
  billingAddress: z.any().optional(),
});

// Get Invoices Query
export const GetInvoicesQueryDtoSchema = z.object({
  subscriptionId: z.string().optional(),
  status: InvoiceStatusSchema.optional(),
});

// Mark Invoice as Paid
export const MarkInvoiceAsPaidDtoSchema = z.object({
  paymentId: z.string().min(1),
});

// ===== DISCOUNTS =====

// Create Discount
export const CreateDiscountDtoSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: DiscountTypeSchema,
  percentOff: z.number().min(0).max(100).optional(),
  amountOff: z.number().min(0).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  maxUses: z.number().min(1).optional(),
  maxUsesPerUser: z.number().min(1).optional(),
  applicableTiers: z.array(SubscriptionTierSchema).optional(),
  minAmount: z.number().min(0).optional(),
});

// Validate Discount
export const ValidateDiscountDtoSchema = z.object({
  code: z.string().min(1),
  amount: z.number().min(0),
});

// Redeem Discount
export const RedeemDiscountDtoSchema = z.object({
  amountSaved: z.number().min(0),
});

// ===== USAGE RECORDS =====

// Record Usage
export const RecordUsageDtoSchema = z.object({
  subscriptionId: z.string().min(1),
  feature: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  usageDate: z.string().datetime().optional(),
  metadata: z.any().optional(),
});

// Get Usage Records Query
export const GetUsageRecordsQueryDtoSchema = z.object({
  feature: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ===== STATISTICS =====

// Get Billing Statistics Query
export const GetBillingStatisticsQueryDtoSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ===== LEGACY SCHEMAS (Keep for backward compatibility) =====

// Payment Method Schema
export const PaymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'bank_account', 'paypal']),
  last4: z.string().optional(),
  brand: z.string().optional(),
  expiryMonth: z.number().min(1).max(12).optional(),
  expiryYear: z.number().optional(),
  isDefault: z.boolean()
});

// Invoice Schema
export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().length(3),
  status: z.enum(['pending', 'paid', 'failed', 'cancelled']),
  description: z.string(),
  sessionId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  paidAt: z.string().datetime().optional()
});

// Payment Intent Schema
export const CreatePaymentIntentDtoSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  paymentMethodId: z.string().optional(),
  sessionId: z.string().uuid().optional()
});

// Billing Query Parameters
export const BillingQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  status: z.enum(['pending', 'paid', 'failed', 'cancelled']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'status']).optional()
});

// Parameter Schemas
export const InvoiceIdParamSchema = z.object({
  id: z.string().uuid('Invalid invoice ID format')
});

export const PaymentMethodIdParamSchema = z.object({
  id: z.string().min(1, 'Payment method ID is required')
});

// Export type inference helpers
export type CreateSubscriptionDto = z.infer<typeof CreateSubscriptionDtoSchema>;
export type UpdateSubscriptionDto = z.infer<typeof UpdateSubscriptionDtoSchema>;
export type CancelSubscriptionDto = z.infer<typeof CancelSubscriptionDtoSchema>;
export type ChangeSubscriptionPlanDto = z.infer<typeof ChangeSubscriptionPlanDtoSchema>;
export type PauseSubscriptionDto = z.infer<typeof PauseSubscriptionDtoSchema>;
export type ScheduleSubscriptionCancellationDto = z.infer<typeof ScheduleSubscriptionCancellationDtoSchema>;
export type ReactivateSubscriptionDto = z.infer<typeof ReactivateSubscriptionDtoSchema>;
export type ApplyDiscountDto = z.infer<typeof ApplyDiscountDtoSchema>;
export type SubscriptionUsageAnalyticsQueryDto = z.infer<typeof SubscriptionUsageAnalyticsQueryDtoSchema>;

export type GetPlansQueryDto = z.infer<typeof GetPlansQueryDtoSchema>;
export type CreatePlanDto = z.infer<typeof CreatePlanDtoSchema>;
export type UpdatePlanDto = z.infer<typeof UpdatePlanDtoSchema>;

export type CreatePaymentMethodDto = z.infer<typeof CreatePaymentMethodDtoSchema>;
export type UpdatePaymentMethodDto = z.infer<typeof UpdatePaymentMethodDtoSchema>;

export type CreatePaymentDto = z.infer<typeof CreatePaymentDtoSchema>;
export type GetPaymentsQueryDto = z.infer<typeof GetPaymentsQueryDtoSchema>;
export type UpdatePaymentStatusDto = z.infer<typeof UpdatePaymentStatusDtoSchema>;

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceDtoSchema>;
export type GetInvoicesQueryDto = z.infer<typeof GetInvoicesQueryDtoSchema>;
export type MarkInvoiceAsPaidDto = z.infer<typeof MarkInvoiceAsPaidDtoSchema>;

export type CreateDiscountDto = z.infer<typeof CreateDiscountDtoSchema>;
export type ValidateDiscountDto = z.infer<typeof ValidateDiscountDtoSchema>;
export type RedeemDiscountDto = z.infer<typeof RedeemDiscountDtoSchema>;

export type RecordUsageDto = z.infer<typeof RecordUsageDtoSchema>;
export type GetUsageRecordsQueryDto = z.infer<typeof GetUsageRecordsQueryDtoSchema>;

export type GetBillingStatisticsQueryDto = z.infer<typeof GetBillingStatisticsQueryDtoSchema>;

// Legacy types (Keep for backward compatibility)
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type CreatePaymentIntentDto = z.infer<typeof CreatePaymentIntentDtoSchema>;
export type BillingQuery = z.infer<typeof BillingQuerySchema>;
export type InvoiceIdParam = z.infer<typeof InvoiceIdParamSchema>;
export type PaymentMethodIdParam = z.infer<typeof PaymentMethodIdParamSchema>;

// Extended interfaces for complex billing data structures moved from frontend services
export const SubscriptionPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  currency: z.string().length(3),
  interval: z.enum(['month', 'year']),
  interval_count: z.number().min(1),
  features: z.array(z.string()),
  is_popular: z.boolean(),
  trial_period_days: z.number().min(0).optional(),
  metadata: z.record(z.any()).optional()
});

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  plan: SubscriptionPlanSchema,
  status: z.enum(['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid']),
  current_period_start: z.string().datetime(),
  current_period_end: z.string().datetime(),
  trial_start: z.string().datetime().optional(),
  trial_end: z.string().datetime().optional(),
  cancel_at_period_end: z.boolean(),
  canceled_at: z.string().datetime().optional(),
  payment_method: PaymentMethodSchema.optional(),
  latest_invoice: InvoiceSchema.optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const InvoiceLineItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1),
  quantity: z.number().min(1),
  unit_amount: z.number().min(0),
  amount: z.number().min(0),
  currency: z.string().length(3),
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional()
});

export const PaymentIntentSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().length(3),
  status: z.enum(['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'canceled', 'succeeded']),
  client_secret: z.string().min(1),
  payment_method: PaymentMethodSchema.optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime()
});

export const BillingPortalSessionSchema = z.object({
  url: z.string().url(),
  return_url: z.string().url()
});

export const UsageRecordSchema = z.object({
  id: z.string().uuid(),
  subscription_item_id: z.string().uuid(),
  quantity: z.number().min(0),
  timestamp: z.string().datetime(),
  action: z.enum(['increment', 'set'])
});

export const BillingStatsSchema = z.object({
  total_revenue: z.number().min(0),
  monthly_revenue: z.number().min(0),
  active_subscriptions: z.number().min(0),
  canceled_subscriptions: z.number().min(0),
  trial_subscriptions: z.number().min(0),
  revenue_growth_rate: z.number(),
  churn_rate: z.number().min(0).max(100)
});

export const CreatePaymentMethodRequestSchema = z.object({
  type: z.enum(['card', 'bank_account']),
  card: z.object({
    number: z.string().min(1),
    exp_month: z.number().min(1).max(12),
    exp_year: z.number().min(2024),
    cvc: z.string().min(3).max(4)
  }).optional(),
  bank_account: z.object({
    account_number: z.string().min(1),
    routing_number: z.string().min(1),
    account_type: z.enum(['checking', 'savings'])
  }).optional(),
  billing_details: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional()
    }).optional()
  }).optional()
});

export const CreateSubscriptionRequestSchema = z.object({
  plan_id: z.string().uuid(),
  payment_method_id: z.string().uuid().optional(),
  trial_period_days: z.number().min(0).optional(),
  coupon: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export const UpdateSubscriptionRequestSchema = z.object({
  plan_id: z.string().uuid().optional(),
  payment_method_id: z.string().uuid().optional(),
  cancel_at_period_end: z.boolean().optional(),
  proration_behavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
  metadata: z.record(z.any()).optional()
});

export const CreatePaymentIntentRequestSchema = z.object({
  amount: z.number().min(0.01),
  currency: z.string().length(3).default('USD'),
  payment_method_id: z.string().uuid().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  automatic_payment_methods: z.object({
    enabled: z.boolean()
  }).optional()
});

export const BillingApiResponseSchema = z.object({
  data: z.any(),
  meta: z.object({
    total_count: z.number().optional(),
    page: z.number().optional(),
    per_page: z.number().optional(),
    has_more: z.boolean().optional()
  }).optional()
});

export const BillingListOptionsSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  status: z.string().optional(),
  starting_after: z.string().optional(),
  ending_before: z.string().optional()
});

// Export type inference helpers for new schemas
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;
export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;
export type BillingPortalSession = z.infer<typeof BillingPortalSessionSchema>;
export type UsageRecord = z.infer<typeof UsageRecordSchema>;
export type BillingStats = z.infer<typeof BillingStatsSchema>;
export type CreatePaymentMethodRequest = z.infer<typeof CreatePaymentMethodRequestSchema>;
export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionRequestSchema>;
export type UpdateSubscriptionRequest = z.infer<typeof UpdateSubscriptionRequestSchema>;
export type CreatePaymentIntentRequest = z.infer<typeof CreatePaymentIntentRequestSchema>;
export type BillingApiResponse<T = any> = z.infer<typeof BillingApiResponseSchema> & { data: T };
export type BillingListOptions = z.infer<typeof BillingListOptionsSchema>;