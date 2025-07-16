"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingListOptionsSchema = exports.BillingApiResponseSchema = exports.CreatePaymentIntentRequestSchema = exports.UpdateSubscriptionRequestSchema = exports.CreateSubscriptionRequestSchema = exports.CreatePaymentMethodRequestSchema = exports.BillingStatsSchema = exports.UsageRecordSchema = exports.BillingPortalSessionSchema = exports.PaymentIntentSchema = exports.InvoiceLineItemSchema = exports.SubscriptionSchema = exports.SubscriptionPlanSchema = exports.PaymentMethodIdParamSchema = exports.InvoiceIdParamSchema = exports.BillingQuerySchema = exports.CreatePaymentIntentDtoSchema = exports.InvoiceSchema = exports.PaymentMethodSchema = exports.GetBillingStatisticsQueryDtoSchema = exports.GetUsageRecordsQueryDtoSchema = exports.RecordUsageDtoSchema = exports.RedeemDiscountDtoSchema = exports.ValidateDiscountDtoSchema = exports.CreateDiscountDtoSchema = exports.MarkInvoiceAsPaidDtoSchema = exports.GetInvoicesQueryDtoSchema = exports.CreateInvoiceDtoSchema = exports.UpdatePaymentStatusDtoSchema = exports.GetPaymentsQueryDtoSchema = exports.CreatePaymentDtoSchema = exports.UpdatePaymentMethodDtoSchema = exports.CreatePaymentMethodDtoSchema = exports.UpdatePlanDtoSchema = exports.CreatePlanDtoSchema = exports.GetPlansQueryDtoSchema = exports.SubscriptionUsageAnalyticsQueryDtoSchema = exports.ApplyDiscountDtoSchema = exports.ReactivateSubscriptionDtoSchema = exports.ScheduleSubscriptionCancellationDtoSchema = exports.PauseSubscriptionDtoSchema = exports.ChangeSubscriptionPlanDtoSchema = exports.CancelSubscriptionDtoSchema = exports.UpdateSubscriptionDtoSchema = exports.CreateSubscriptionDtoSchema = void 0;
const zod_1 = require("zod");
// Define enums from Prisma client
const BillingCycleSchema = zod_1.z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']);
const SubscriptionTierSchema = zod_1.z.enum(['FREE', 'BASIC', 'PREMIUM', 'PROFESSIONAL', 'ENTERPRISE']);
const PaymentMethodTypeSchema = zod_1.z.enum(['CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'CRYPTO']);
const PaymentStatusSchema = zod_1.z.enum(['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'REQUIRES_ACTION']);
const InvoiceStatusSchema = zod_1.z.enum(['DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID']);
const DiscountTypeSchema = zod_1.z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL_EXTENSION']);
// ===== SUBSCRIPTION MANAGEMENT =====
// Create Subscription
exports.CreateSubscriptionDtoSchema = zod_1.z.object({
    planId: zod_1.z.string().min(1),
    billingCycle: BillingCycleSchema.optional(),
    defaultPaymentMethodId: zod_1.z.string().optional(),
    trialStart: zod_1.z.string().datetime().optional(),
    trialEnd: zod_1.z.string().datetime().optional(),
});
// Update Subscription
exports.UpdateSubscriptionDtoSchema = zod_1.z.object({
    planId: zod_1.z.string().optional(),
    billingCycle: BillingCycleSchema.optional(),
    defaultPaymentMethodId: zod_1.z.string().optional(),
});
// Cancel Subscription
exports.CancelSubscriptionDtoSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
});
// Change Subscription Plan
exports.ChangeSubscriptionPlanDtoSchema = zod_1.z.object({
    newPlanId: zod_1.z.string().min(1),
    billingCycle: BillingCycleSchema.optional(),
    prorationBehavior: zod_1.z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
    effectiveDate: zod_1.z.string().datetime().optional(),
});
// Pause Subscription
exports.PauseSubscriptionDtoSchema = zod_1.z.object({
    pauseUntil: zod_1.z.string().datetime().optional(),
    reason: zod_1.z.string().optional(),
});
// Schedule Subscription Cancellation
exports.ScheduleSubscriptionCancellationDtoSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
    feedback: zod_1.z.string().optional(),
    cancelAtPeriodEnd: zod_1.z.boolean().optional(),
});
// Reactivate Subscription
exports.ReactivateSubscriptionDtoSchema = zod_1.z.object({
    newPaymentMethodId: zod_1.z.string().optional(),
});
// Apply Discount to Subscription
exports.ApplyDiscountDtoSchema = zod_1.z.object({
    discountCode: zod_1.z.string().min(1),
});
// Subscription Usage Analytics Query
exports.SubscriptionUsageAnalyticsQueryDtoSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// ===== SUBSCRIPTION PLANS =====
// Get Plans Query
exports.GetPlansQueryDtoSchema = zod_1.z.object({
    isActive: zod_1.z.boolean().optional(),
});
// Create Plan
exports.CreatePlanDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    tier: SubscriptionTierSchema,
    monthlyPrice: zod_1.z.number().min(0),
    yearlyPrice: zod_1.z.number().min(0).optional(),
    features: zod_1.z.record(zod_1.z.unknown()).default({}),
    limits: zod_1.z.record(zod_1.z.unknown()).default({}),
    trialDays: zod_1.z.number().min(0).optional(),
});
// Update Plan
exports.UpdatePlanDtoSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    monthlyPrice: zod_1.z.number().min(0).optional(),
    yearlyPrice: zod_1.z.number().min(0).optional(),
    features: zod_1.z.any().optional(),
    limits: zod_1.z.any().optional(),
    trialDays: zod_1.z.number().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
// ===== PAYMENT METHODS =====
// Create Payment Method
exports.CreatePaymentMethodDtoSchema = zod_1.z.object({
    type: PaymentMethodTypeSchema,
    cardLast4: zod_1.z.string().optional(),
    cardBrand: zod_1.z.string().optional(),
    cardExpMonth: zod_1.z.number().min(1).max(12).optional(),
    cardExpYear: zod_1.z.number().optional(),
    stripePaymentMethodId: zod_1.z.string().optional(),
    isDefault: zod_1.z.boolean().optional(),
});
// Update Payment Method
exports.UpdatePaymentMethodDtoSchema = zod_1.z.object({
    isDefault: zod_1.z.boolean().optional(),
    isActive: zod_1.z.boolean().optional(),
});
// ===== PAYMENTS =====
// Create Payment
exports.CreatePaymentDtoSchema = zod_1.z.object({
    amount: zod_1.z.number().min(0.01),
    currency: zod_1.z.string().length(3).default('USD'),
    paymentMethodId: zod_1.z.string().optional(),
    subscriptionId: zod_1.z.string().optional(),
    invoiceId: zod_1.z.string().optional(),
    meetingId: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    providerPaymentId: zod_1.z.string().optional(),
});
// Get Payments Query
exports.GetPaymentsQueryDtoSchema = zod_1.z.object({
    subscriptionId: zod_1.z.string().optional(),
    status: PaymentStatusSchema.optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// Update Payment Status
exports.UpdatePaymentStatusDtoSchema = zod_1.z.object({
    status: PaymentStatusSchema,
    metadata: zod_1.z.any().optional(),
});
// ===== INVOICES =====
// Create Invoice
exports.CreateInvoiceDtoSchema = zod_1.z.object({
    subscriptionId: zod_1.z.string().min(1),
    subtotal: zod_1.z.number().min(0),
    taxAmount: zod_1.z.number().min(0).optional(),
    discountAmount: zod_1.z.number().min(0).optional(),
    dueDate: zod_1.z.string().datetime(),
    billingAddress: zod_1.z.any().optional(),
});
// Get Invoices Query
exports.GetInvoicesQueryDtoSchema = zod_1.z.object({
    subscriptionId: zod_1.z.string().optional(),
    status: InvoiceStatusSchema.optional(),
});
// Mark Invoice as Paid
exports.MarkInvoiceAsPaidDtoSchema = zod_1.z.object({
    paymentId: zod_1.z.string().min(1),
});
// ===== DISCOUNTS =====
// Create Discount
exports.CreateDiscountDtoSchema = zod_1.z.object({
    code: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    type: DiscountTypeSchema,
    percentOff: zod_1.z.number().min(0).max(100).optional(),
    amountOff: zod_1.z.number().min(0).optional(),
    validFrom: zod_1.z.string().datetime().optional(),
    validUntil: zod_1.z.string().datetime().optional(),
    maxUses: zod_1.z.number().min(1).optional(),
    maxUsesPerUser: zod_1.z.number().min(1).optional(),
    applicableTiers: zod_1.z.array(SubscriptionTierSchema).optional(),
    minAmount: zod_1.z.number().min(0).optional(),
});
// Validate Discount
exports.ValidateDiscountDtoSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    amount: zod_1.z.number().min(0),
});
// Redeem Discount
exports.RedeemDiscountDtoSchema = zod_1.z.object({
    amountSaved: zod_1.z.number().min(0),
});
// ===== USAGE RECORDS =====
// Record Usage
exports.RecordUsageDtoSchema = zod_1.z.object({
    subscriptionId: zod_1.z.string().min(1),
    feature: zod_1.z.string().min(1),
    quantity: zod_1.z.number().min(0),
    unit: zod_1.z.string().min(1),
    usageDate: zod_1.z.string().datetime().optional(),
    metadata: zod_1.z.any().optional(),
});
// Get Usage Records Query
exports.GetUsageRecordsQueryDtoSchema = zod_1.z.object({
    feature: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// ===== STATISTICS =====
// Get Billing Statistics Query
exports.GetBillingStatisticsQueryDtoSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// ===== LEGACY SCHEMAS (Keep for backward compatibility) =====
// Payment Method Schema
exports.PaymentMethodSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['card', 'bank_account', 'paypal']),
    last4: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    expiryMonth: zod_1.z.number().min(1).max(12).optional(),
    expiryYear: zod_1.z.number().optional(),
    isDefault: zod_1.z.boolean()
});
// Invoice Schema
exports.InvoiceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().min(0),
    currency: zod_1.z.string().length(3),
    status: zod_1.z.enum(['pending', 'paid', 'failed', 'cancelled']),
    description: zod_1.z.string(),
    sessionId: zod_1.z.string().uuid().optional(),
    createdAt: zod_1.z.string().datetime(),
    paidAt: zod_1.z.string().datetime().optional()
});
// Payment Intent Schema
exports.CreatePaymentIntentDtoSchema = zod_1.z.object({
    amount: zod_1.z.number().min(0.01, 'Amount must be greater than 0'),
    currency: zod_1.z.string().length(3, 'Currency must be 3 characters'),
    paymentMethodId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().uuid().optional()
});
// Billing Query Parameters
exports.BillingQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    status: zod_1.z.enum(['pending', 'paid', 'failed', 'cancelled']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'amount', 'status']).optional()
});
// Parameter Schemas
exports.InvoiceIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid invoice ID format')
});
exports.PaymentMethodIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Payment method ID is required')
});
// Extended interfaces for complex billing data structures moved from frontend services
exports.SubscriptionPlanSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    price: zod_1.z.number().min(0),
    currency: zod_1.z.string().length(3),
    interval: zod_1.z.enum(['month', 'year']),
    interval_count: zod_1.z.number().min(1),
    features: zod_1.z.array(zod_1.z.string()),
    is_popular: zod_1.z.boolean(),
    trial_period_days: zod_1.z.number().min(0).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.SubscriptionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    plan: exports.SubscriptionPlanSchema,
    status: zod_1.z.enum(['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid']),
    current_period_start: zod_1.z.string().datetime(),
    current_period_end: zod_1.z.string().datetime(),
    trial_start: zod_1.z.string().datetime().optional(),
    trial_end: zod_1.z.string().datetime().optional(),
    cancel_at_period_end: zod_1.z.boolean(),
    canceled_at: zod_1.z.string().datetime().optional(),
    payment_method: exports.PaymentMethodSchema.optional(),
    latest_invoice: exports.InvoiceSchema.optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime()
});
exports.InvoiceLineItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().min(1),
    unit_amount: zod_1.z.number().min(0),
    amount: zod_1.z.number().min(0),
    currency: zod_1.z.string().length(3),
    period: zod_1.z.object({
        start: zod_1.z.string().datetime(),
        end: zod_1.z.string().datetime()
    }).optional()
});
exports.PaymentIntentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    amount: zod_1.z.number().min(0),
    currency: zod_1.z.string().length(3),
    status: zod_1.z.enum(['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'canceled', 'succeeded']),
    client_secret: zod_1.z.string().min(1),
    payment_method: exports.PaymentMethodSchema.optional(),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    created_at: zod_1.z.string().datetime()
});
exports.BillingPortalSessionSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    return_url: zod_1.z.string().url()
});
exports.UsageRecordSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    subscription_item_id: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().min(0),
    timestamp: zod_1.z.string().datetime(),
    action: zod_1.z.enum(['increment', 'set'])
});
exports.BillingStatsSchema = zod_1.z.object({
    total_revenue: zod_1.z.number().min(0),
    monthly_revenue: zod_1.z.number().min(0),
    active_subscriptions: zod_1.z.number().min(0),
    canceled_subscriptions: zod_1.z.number().min(0),
    trial_subscriptions: zod_1.z.number().min(0),
    revenue_growth_rate: zod_1.z.number(),
    churn_rate: zod_1.z.number().min(0).max(100)
});
exports.CreatePaymentMethodRequestSchema = zod_1.z.object({
    type: zod_1.z.enum(['card', 'bank_account']),
    card: zod_1.z.object({
        number: zod_1.z.string().min(1),
        exp_month: zod_1.z.number().min(1).max(12),
        exp_year: zod_1.z.number().min(2024),
        cvc: zod_1.z.string().min(3).max(4)
    }).optional(),
    bank_account: zod_1.z.object({
        account_number: zod_1.z.string().min(1),
        routing_number: zod_1.z.string().min(1),
        account_type: zod_1.z.enum(['checking', 'savings'])
    }).optional(),
    billing_details: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.object({
            line1: zod_1.z.string().optional(),
            line2: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            state: zod_1.z.string().optional(),
            postal_code: zod_1.z.string().optional(),
            country: zod_1.z.string().optional()
        }).optional()
    }).optional()
});
exports.CreateSubscriptionRequestSchema = zod_1.z.object({
    plan_id: zod_1.z.string().uuid(),
    payment_method_id: zod_1.z.string().uuid().optional(),
    trial_period_days: zod_1.z.number().min(0).optional(),
    coupon: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.UpdateSubscriptionRequestSchema = zod_1.z.object({
    plan_id: zod_1.z.string().uuid().optional(),
    payment_method_id: zod_1.z.string().uuid().optional(),
    cancel_at_period_end: zod_1.z.boolean().optional(),
    proration_behavior: zod_1.z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.CreatePaymentIntentRequestSchema = zod_1.z.object({
    amount: zod_1.z.number().min(0.01),
    currency: zod_1.z.string().length(3).default('USD'),
    payment_method_id: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    automatic_payment_methods: zod_1.z.object({
        enabled: zod_1.z.boolean()
    }).optional()
});
exports.BillingApiResponseSchema = zod_1.z.object({
    data: zod_1.z.any(),
    meta: zod_1.z.object({
        total_count: zod_1.z.number().optional(),
        page: zod_1.z.number().optional(),
        per_page: zod_1.z.number().optional(),
        has_more: zod_1.z.boolean().optional()
    }).optional()
});
exports.BillingListOptionsSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    status: zod_1.z.string().optional(),
    starting_after: zod_1.z.string().optional(),
    ending_before: zod_1.z.string().optional()
});
//# sourceMappingURL=billing.js.map