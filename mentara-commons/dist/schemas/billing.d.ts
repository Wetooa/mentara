import { z } from 'zod';
export declare const CreateSubscriptionDtoSchema: z.ZodObject<{
    planId: z.ZodString;
    billingCycle: z.ZodOptional<z.ZodEnum<["MONTHLY", "QUARTERLY", "YEARLY"]>>;
    defaultPaymentMethodId: z.ZodOptional<z.ZodString>;
    trialStart: z.ZodOptional<z.ZodString>;
    trialEnd: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planId: string;
    billingCycle?: "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined;
    defaultPaymentMethodId?: string | undefined;
    trialStart?: string | undefined;
    trialEnd?: string | undefined;
}, {
    planId: string;
    billingCycle?: "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined;
    defaultPaymentMethodId?: string | undefined;
    trialStart?: string | undefined;
    trialEnd?: string | undefined;
}>;
export declare const UpdateSubscriptionDtoSchema: z.ZodObject<{
    planId: z.ZodOptional<z.ZodString>;
    billingCycle: z.ZodOptional<z.ZodEnum<["MONTHLY", "QUARTERLY", "YEARLY"]>>;
    defaultPaymentMethodId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planId?: string | undefined;
    billingCycle?: "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined;
    defaultPaymentMethodId?: string | undefined;
}, {
    planId?: string | undefined;
    billingCycle?: "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined;
    defaultPaymentMethodId?: string | undefined;
}>;
export declare const CancelSubscriptionDtoSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export declare const ChangeSubscriptionPlanDtoSchema: z.ZodObject<{
    newPlanId: z.ZodString;
    billingCycle: z.ZodOptional<z.ZodEnum<["MONTHLY", "QUARTERLY", "YEARLY"]>>;
    prorationBehavior: z.ZodOptional<z.ZodEnum<["create_prorations", "none", "always_invoice"]>>;
    effectiveDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    newPlanId: string;
    billingCycle?: "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined;
    prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
    effectiveDate?: string | undefined;
}, {
    newPlanId: string;
    billingCycle?: "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined;
    prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
    effectiveDate?: string | undefined;
}>;
export declare const PauseSubscriptionDtoSchema: z.ZodObject<{
    pauseUntil: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
    pauseUntil?: string | undefined;
}, {
    reason?: string | undefined;
    pauseUntil?: string | undefined;
}>;
export declare const ScheduleSubscriptionCancellationDtoSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
    feedback: z.ZodOptional<z.ZodString>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
    feedback?: string | undefined;
    cancelAtPeriodEnd?: boolean | undefined;
}, {
    reason?: string | undefined;
    feedback?: string | undefined;
    cancelAtPeriodEnd?: boolean | undefined;
}>;
export declare const ReactivateSubscriptionDtoSchema: z.ZodObject<{
    newPaymentMethodId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    newPaymentMethodId?: string | undefined;
}, {
    newPaymentMethodId?: string | undefined;
}>;
export declare const ApplyDiscountDtoSchema: z.ZodObject<{
    discountCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    discountCode: string;
}, {
    discountCode: string;
}>;
export declare const SubscriptionUsageAnalyticsQueryDtoSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const GetPlansQueryDtoSchema: z.ZodObject<{
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
}, {
    isActive?: boolean | undefined;
}>;
export declare const CreatePlanDtoSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    tier: z.ZodEnum<["FREE", "BASIC", "PREMIUM", "PROFESSIONAL", "ENTERPRISE"]>;
    monthlyPrice: z.ZodNumber;
    yearlyPrice: z.ZodOptional<z.ZodNumber>;
    features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    limits: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    trialDays: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    tier: "FREE" | "BASIC" | "PREMIUM" | "PROFESSIONAL" | "ENTERPRISE";
    monthlyPrice: number;
    features: Record<string, unknown>;
    limits: Record<string, unknown>;
    description?: string | undefined;
    yearlyPrice?: number | undefined;
    trialDays?: number | undefined;
}, {
    name: string;
    tier: "FREE" | "BASIC" | "PREMIUM" | "PROFESSIONAL" | "ENTERPRISE";
    monthlyPrice: number;
    description?: string | undefined;
    yearlyPrice?: number | undefined;
    features?: Record<string, unknown> | undefined;
    limits?: Record<string, unknown> | undefined;
    trialDays?: number | undefined;
}>;
export declare const UpdatePlanDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    monthlyPrice: z.ZodOptional<z.ZodNumber>;
    yearlyPrice: z.ZodOptional<z.ZodNumber>;
    features: z.ZodOptional<z.ZodAny>;
    limits: z.ZodOptional<z.ZodAny>;
    trialDays: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
    monthlyPrice?: number | undefined;
    yearlyPrice?: number | undefined;
    features?: any;
    limits?: any;
    trialDays?: number | undefined;
}, {
    description?: string | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
    monthlyPrice?: number | undefined;
    yearlyPrice?: number | undefined;
    features?: any;
    limits?: any;
    trialDays?: number | undefined;
}>;
export declare const CreatePaymentMethodDtoSchema: z.ZodObject<{
    type: z.ZodEnum<["CARD", "BANK_ACCOUNT", "DIGITAL_WALLET", "CRYPTO"]>;
    cardLast4: z.ZodOptional<z.ZodString>;
    cardBrand: z.ZodOptional<z.ZodString>;
    cardExpMonth: z.ZodOptional<z.ZodNumber>;
    cardExpYear: z.ZodOptional<z.ZodNumber>;
    stripePaymentMethodId: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET" | "CRYPTO";
    cardLast4?: string | undefined;
    cardBrand?: string | undefined;
    cardExpMonth?: number | undefined;
    cardExpYear?: number | undefined;
    stripePaymentMethodId?: string | undefined;
    isDefault?: boolean | undefined;
}, {
    type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET" | "CRYPTO";
    cardLast4?: string | undefined;
    cardBrand?: string | undefined;
    cardExpMonth?: number | undefined;
    cardExpYear?: number | undefined;
    stripePaymentMethodId?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const UpdatePaymentMethodDtoSchema: z.ZodObject<{
    isDefault: z.ZodOptional<z.ZodBoolean>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    isDefault?: boolean | undefined;
}, {
    isActive?: boolean | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const CreatePaymentDtoSchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    subscriptionId: z.ZodOptional<z.ZodString>;
    invoiceId: z.ZodOptional<z.ZodString>;
    meetingId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    providerPaymentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency: string;
    meetingId?: string | undefined;
    description?: string | undefined;
    paymentMethodId?: string | undefined;
    subscriptionId?: string | undefined;
    invoiceId?: string | undefined;
    providerPaymentId?: string | undefined;
}, {
    amount: number;
    meetingId?: string | undefined;
    description?: string | undefined;
    currency?: string | undefined;
    paymentMethodId?: string | undefined;
    subscriptionId?: string | undefined;
    invoiceId?: string | undefined;
    providerPaymentId?: string | undefined;
}>;
export declare const GetPaymentsQueryDtoSchema: z.ZodObject<{
    subscriptionId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "CANCELED", "REFUNDED", "PARTIALLY_REFUNDED", "REQUIRES_ACTION"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "REQUIRES_ACTION" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    subscriptionId?: string | undefined;
}, {
    status?: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "REQUIRES_ACTION" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    subscriptionId?: string | undefined;
}>;
export declare const UpdatePaymentStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "CANCELED", "REFUNDED", "PARTIALLY_REFUNDED", "REQUIRES_ACTION"]>;
    metadata: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "REQUIRES_ACTION";
    metadata?: any;
}, {
    status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "REQUIRES_ACTION";
    metadata?: any;
}>;
export declare const CreateInvoiceDtoSchema: z.ZodObject<{
    subscriptionId: z.ZodString;
    subtotal: z.ZodNumber;
    taxAmount: z.ZodOptional<z.ZodNumber>;
    discountAmount: z.ZodOptional<z.ZodNumber>;
    dueDate: z.ZodString;
    billingAddress: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    dueDate: string;
    subscriptionId: string;
    subtotal: number;
    taxAmount?: number | undefined;
    discountAmount?: number | undefined;
    billingAddress?: any;
}, {
    dueDate: string;
    subscriptionId: string;
    subtotal: number;
    taxAmount?: number | undefined;
    discountAmount?: number | undefined;
    billingAddress?: any;
}>;
export declare const GetInvoicesQueryDtoSchema: z.ZodObject<{
    subscriptionId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "OPEN", "PAID", "UNCOLLECTIBLE", "VOID"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "OPEN" | "PAID" | "UNCOLLECTIBLE" | "VOID" | undefined;
    subscriptionId?: string | undefined;
}, {
    status?: "DRAFT" | "OPEN" | "PAID" | "UNCOLLECTIBLE" | "VOID" | undefined;
    subscriptionId?: string | undefined;
}>;
export declare const MarkInvoiceAsPaidDtoSchema: z.ZodObject<{
    paymentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    paymentId: string;
}, {
    paymentId: string;
}>;
export declare const CreateDiscountDtoSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["PERCENTAGE", "FIXED_AMOUNT", "FREE_TRIAL_EXTENSION"]>;
    percentOff: z.ZodOptional<z.ZodNumber>;
    amountOff: z.ZodOptional<z.ZodNumber>;
    validFrom: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodOptional<z.ZodString>;
    maxUses: z.ZodOptional<z.ZodNumber>;
    maxUsesPerUser: z.ZodOptional<z.ZodNumber>;
    applicableTiers: z.ZodOptional<z.ZodArray<z.ZodEnum<["FREE", "BASIC", "PREMIUM", "PROFESSIONAL", "ENTERPRISE"]>, "many">>;
    minAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_TRIAL_EXTENSION";
    name: string;
    code?: string | undefined;
    description?: string | undefined;
    percentOff?: number | undefined;
    amountOff?: number | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
    maxUses?: number | undefined;
    maxUsesPerUser?: number | undefined;
    applicableTiers?: ("FREE" | "BASIC" | "PREMIUM" | "PROFESSIONAL" | "ENTERPRISE")[] | undefined;
    minAmount?: number | undefined;
}, {
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_TRIAL_EXTENSION";
    name: string;
    code?: string | undefined;
    description?: string | undefined;
    percentOff?: number | undefined;
    amountOff?: number | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
    maxUses?: number | undefined;
    maxUsesPerUser?: number | undefined;
    applicableTiers?: ("FREE" | "BASIC" | "PREMIUM" | "PROFESSIONAL" | "ENTERPRISE")[] | undefined;
    minAmount?: number | undefined;
}>;
export declare const ValidateDiscountDtoSchema: z.ZodObject<{
    code: z.ZodString;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    code: string;
    amount: number;
}, {
    code: string;
    amount: number;
}>;
export declare const RedeemDiscountDtoSchema: z.ZodObject<{
    amountSaved: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amountSaved: number;
}, {
    amountSaved: number;
}>;
export declare const RecordUsageDtoSchema: z.ZodObject<{
    subscriptionId: z.ZodString;
    feature: z.ZodString;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    usageDate: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    subscriptionId: string;
    feature: string;
    quantity: number;
    unit: string;
    metadata?: any;
    usageDate?: string | undefined;
}, {
    subscriptionId: string;
    feature: string;
    quantity: number;
    unit: string;
    metadata?: any;
    usageDate?: string | undefined;
}>;
export declare const GetUsageRecordsQueryDtoSchema: z.ZodObject<{
    feature: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    feature?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    feature?: string | undefined;
}>;
export declare const GetBillingStatisticsQueryDtoSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const PaymentMethodSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["card", "bank_account", "paypal"]>;
    last4: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    expiryMonth: z.ZodOptional<z.ZodNumber>;
    expiryYear: z.ZodOptional<z.ZodNumber>;
    isDefault: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "card" | "bank_account" | "paypal";
    id: string;
    isDefault: boolean;
    last4?: string | undefined;
    brand?: string | undefined;
    expiryMonth?: number | undefined;
    expiryYear?: number | undefined;
}, {
    type: "card" | "bank_account" | "paypal";
    id: string;
    isDefault: boolean;
    last4?: string | undefined;
    brand?: string | undefined;
    expiryMonth?: number | undefined;
    expiryYear?: number | undefined;
}>;
export declare const InvoiceSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["pending", "paid", "failed", "cancelled"]>;
    description: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    paidAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "cancelled" | "failed" | "paid";
    id: string;
    createdAt: string;
    userId: string;
    description: string;
    amount: number;
    currency: string;
    sessionId?: string | undefined;
    paidAt?: string | undefined;
}, {
    status: "pending" | "cancelled" | "failed" | "paid";
    id: string;
    createdAt: string;
    userId: string;
    description: string;
    amount: number;
    currency: string;
    sessionId?: string | undefined;
    paidAt?: string | undefined;
}>;
export declare const CreatePaymentIntentDtoSchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency: string;
    sessionId?: string | undefined;
    paymentMethodId?: string | undefined;
}, {
    amount: number;
    currency: string;
    sessionId?: string | undefined;
    paymentMethodId?: string | undefined;
}>;
export declare const BillingQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["pending", "paid", "failed", "cancelled"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["createdAt", "amount", "status"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "cancelled" | "failed" | "paid" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "createdAt" | "amount" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    status?: "pending" | "cancelled" | "failed" | "paid" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "createdAt" | "amount" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export declare const InvoiceIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const PaymentMethodIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
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
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type CreatePaymentIntentDto = z.infer<typeof CreatePaymentIntentDtoSchema>;
export type BillingQuery = z.infer<typeof BillingQuerySchema>;
export type InvoiceIdParam = z.infer<typeof InvoiceIdParamSchema>;
export type PaymentMethodIdParam = z.infer<typeof PaymentMethodIdParamSchema>;
export declare const SubscriptionPlanSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    currency: z.ZodString;
    interval: z.ZodEnum<["month", "year"]>;
    interval_count: z.ZodNumber;
    features: z.ZodArray<z.ZodString, "many">;
    is_popular: z.ZodBoolean;
    trial_period_days: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    name: string;
    features: string[];
    currency: string;
    price: number;
    interval: "month" | "year";
    interval_count: number;
    is_popular: boolean;
    metadata?: Record<string, any> | undefined;
    trial_period_days?: number | undefined;
}, {
    id: string;
    description: string;
    name: string;
    features: string[];
    currency: string;
    price: number;
    interval: "month" | "year";
    interval_count: number;
    is_popular: boolean;
    metadata?: Record<string, any> | undefined;
    trial_period_days?: number | undefined;
}>;
export declare const SubscriptionSchema: z.ZodObject<{
    id: z.ZodString;
    plan: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        price: z.ZodNumber;
        currency: z.ZodString;
        interval: z.ZodEnum<["month", "year"]>;
        interval_count: z.ZodNumber;
        features: z.ZodArray<z.ZodString, "many">;
        is_popular: z.ZodBoolean;
        trial_period_days: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        name: string;
        features: string[];
        currency: string;
        price: number;
        interval: "month" | "year";
        interval_count: number;
        is_popular: boolean;
        metadata?: Record<string, any> | undefined;
        trial_period_days?: number | undefined;
    }, {
        id: string;
        description: string;
        name: string;
        features: string[];
        currency: string;
        price: number;
        interval: "month" | "year";
        interval_count: number;
        is_popular: boolean;
        metadata?: Record<string, any> | undefined;
        trial_period_days?: number | undefined;
    }>;
    status: z.ZodEnum<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"]>;
    current_period_start: z.ZodString;
    current_period_end: z.ZodString;
    trial_start: z.ZodOptional<z.ZodString>;
    trial_end: z.ZodOptional<z.ZodString>;
    cancel_at_period_end: z.ZodBoolean;
    canceled_at: z.ZodOptional<z.ZodString>;
    payment_method: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["card", "bank_account", "paypal"]>;
        last4: z.ZodOptional<z.ZodString>;
        brand: z.ZodOptional<z.ZodString>;
        expiryMonth: z.ZodOptional<z.ZodNumber>;
        expiryYear: z.ZodOptional<z.ZodNumber>;
        isDefault: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        type: "card" | "bank_account" | "paypal";
        id: string;
        isDefault: boolean;
        last4?: string | undefined;
        brand?: string | undefined;
        expiryMonth?: number | undefined;
        expiryYear?: number | undefined;
    }, {
        type: "card" | "bank_account" | "paypal";
        id: string;
        isDefault: boolean;
        last4?: string | undefined;
        brand?: string | undefined;
        expiryMonth?: number | undefined;
        expiryYear?: number | undefined;
    }>>;
    latest_invoice: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        amount: z.ZodNumber;
        currency: z.ZodString;
        status: z.ZodEnum<["pending", "paid", "failed", "cancelled"]>;
        description: z.ZodString;
        sessionId: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        paidAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "cancelled" | "failed" | "paid";
        id: string;
        createdAt: string;
        userId: string;
        description: string;
        amount: number;
        currency: string;
        sessionId?: string | undefined;
        paidAt?: string | undefined;
    }, {
        status: "pending" | "cancelled" | "failed" | "paid";
        id: string;
        createdAt: string;
        userId: string;
        description: string;
        amount: number;
        currency: string;
        sessionId?: string | undefined;
        paidAt?: string | undefined;
    }>>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid";
    id: string;
    plan: {
        id: string;
        description: string;
        name: string;
        features: string[];
        currency: string;
        price: number;
        interval: "month" | "year";
        interval_count: number;
        is_popular: boolean;
        metadata?: Record<string, any> | undefined;
        trial_period_days?: number | undefined;
    };
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
    trial_start?: string | undefined;
    trial_end?: string | undefined;
    canceled_at?: string | undefined;
    payment_method?: {
        type: "card" | "bank_account" | "paypal";
        id: string;
        isDefault: boolean;
        last4?: string | undefined;
        brand?: string | undefined;
        expiryMonth?: number | undefined;
        expiryYear?: number | undefined;
    } | undefined;
    latest_invoice?: {
        status: "pending" | "cancelled" | "failed" | "paid";
        id: string;
        createdAt: string;
        userId: string;
        description: string;
        amount: number;
        currency: string;
        sessionId?: string | undefined;
        paidAt?: string | undefined;
    } | undefined;
}, {
    status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid";
    id: string;
    plan: {
        id: string;
        description: string;
        name: string;
        features: string[];
        currency: string;
        price: number;
        interval: "month" | "year";
        interval_count: number;
        is_popular: boolean;
        metadata?: Record<string, any> | undefined;
        trial_period_days?: number | undefined;
    };
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
    trial_start?: string | undefined;
    trial_end?: string | undefined;
    canceled_at?: string | undefined;
    payment_method?: {
        type: "card" | "bank_account" | "paypal";
        id: string;
        isDefault: boolean;
        last4?: string | undefined;
        brand?: string | undefined;
        expiryMonth?: number | undefined;
        expiryYear?: number | undefined;
    } | undefined;
    latest_invoice?: {
        status: "pending" | "cancelled" | "failed" | "paid";
        id: string;
        createdAt: string;
        userId: string;
        description: string;
        amount: number;
        currency: string;
        sessionId?: string | undefined;
        paidAt?: string | undefined;
    } | undefined;
}>;
export declare const InvoiceLineItemSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit_amount: z.ZodNumber;
    amount: z.ZodNumber;
    currency: z.ZodString;
    period: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    amount: number;
    currency: string;
    quantity: number;
    unit_amount: number;
    period?: {
        start: string;
        end: string;
    } | undefined;
}, {
    id: string;
    description: string;
    amount: number;
    currency: string;
    quantity: number;
    unit_amount: number;
    period?: {
        start: string;
        end: string;
    } | undefined;
}>;
export declare const PaymentIntentSchema: z.ZodObject<{
    id: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["requires_payment_method", "requires_confirmation", "requires_action", "processing", "requires_capture", "canceled", "succeeded"]>;
    client_secret: z.ZodString;
    payment_method: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["card", "bank_account", "paypal"]>;
        last4: z.ZodOptional<z.ZodString>;
        brand: z.ZodOptional<z.ZodString>;
        expiryMonth: z.ZodOptional<z.ZodNumber>;
        expiryYear: z.ZodOptional<z.ZodNumber>;
        isDefault: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        type: "card" | "bank_account" | "paypal";
        id: string;
        isDefault: boolean;
        last4?: string | undefined;
        brand?: string | undefined;
        expiryMonth?: number | undefined;
        expiryYear?: number | undefined;
    }, {
        type: "card" | "bank_account" | "paypal";
        id: string;
        isDefault: boolean;
        last4?: string | undefined;
        brand?: string | undefined;
        expiryMonth?: number | undefined;
        expiryYear?: number | undefined;
    }>>;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "processing" | "canceled" | "requires_payment_method" | "requires_confirmation" | "requires_action" | "requires_capture" | "succeeded";
    id: string;
    amount: number;
    currency: string;
    created_at: string;
    client_secret: string;
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
    payment_method?: {
        type: "card" | "bank_account" | "paypal";
        id: string;
        isDefault: boolean;
        last4?: string | undefined;
        brand?: string | undefined;
        expiryMonth?: number | undefined;
        expiryYear?: number | undefined;
    } | undefined;
}, {
    status: "processing" | "canceled" | "requires_payment_method" | "requires_confirmation" | "requires_action" | "requires_capture" | "succeeded";
    id: string;
    amount: number;
    currency: string;
    created_at: string;
    client_secret: string;
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
    payment_method?: {
        type: "card" | "bank_account" | "paypal";
        id: string;
        isDefault: boolean;
        last4?: string | undefined;
        brand?: string | undefined;
        expiryMonth?: number | undefined;
        expiryYear?: number | undefined;
    } | undefined;
}>;
export declare const BillingPortalSessionSchema: z.ZodObject<{
    url: z.ZodString;
    return_url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    return_url: string;
}, {
    url: string;
    return_url: string;
}>;
export declare const UsageRecordSchema: z.ZodObject<{
    id: z.ZodString;
    subscription_item_id: z.ZodString;
    quantity: z.ZodNumber;
    timestamp: z.ZodString;
    action: z.ZodEnum<["increment", "set"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    action: "set" | "increment";
    timestamp: string;
    quantity: number;
    subscription_item_id: string;
}, {
    id: string;
    action: "set" | "increment";
    timestamp: string;
    quantity: number;
    subscription_item_id: string;
}>;
export declare const BillingStatsSchema: z.ZodObject<{
    total_revenue: z.ZodNumber;
    monthly_revenue: z.ZodNumber;
    active_subscriptions: z.ZodNumber;
    canceled_subscriptions: z.ZodNumber;
    trial_subscriptions: z.ZodNumber;
    revenue_growth_rate: z.ZodNumber;
    churn_rate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total_revenue: number;
    monthly_revenue: number;
    active_subscriptions: number;
    canceled_subscriptions: number;
    trial_subscriptions: number;
    revenue_growth_rate: number;
    churn_rate: number;
}, {
    total_revenue: number;
    monthly_revenue: number;
    active_subscriptions: number;
    canceled_subscriptions: number;
    trial_subscriptions: number;
    revenue_growth_rate: number;
    churn_rate: number;
}>;
export declare const CreatePaymentMethodRequestSchema: z.ZodObject<{
    type: z.ZodEnum<["card", "bank_account"]>;
    card: z.ZodOptional<z.ZodObject<{
        number: z.ZodString;
        exp_month: z.ZodNumber;
        exp_year: z.ZodNumber;
        cvc: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
    }, {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
    }>>;
    bank_account: z.ZodOptional<z.ZodObject<{
        account_number: z.ZodString;
        routing_number: z.ZodString;
        account_type: z.ZodEnum<["checking", "savings"]>;
    }, "strip", z.ZodTypeAny, {
        account_number: string;
        routing_number: string;
        account_type: "checking" | "savings";
    }, {
        account_number: string;
        routing_number: string;
        account_type: "checking" | "savings";
    }>>;
    billing_details: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodObject<{
            line1: z.ZodOptional<z.ZodString>;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postal_code: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            line1?: string | undefined;
            line2?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postal_code?: string | undefined;
            country?: string | undefined;
        }, {
            line1?: string | undefined;
            line2?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postal_code?: string | undefined;
            country?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        address?: {
            line1?: string | undefined;
            line2?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postal_code?: string | undefined;
            country?: string | undefined;
        } | undefined;
        phone?: string | undefined;
        name?: string | undefined;
    }, {
        email?: string | undefined;
        address?: {
            line1?: string | undefined;
            line2?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postal_code?: string | undefined;
            country?: string | undefined;
        } | undefined;
        phone?: string | undefined;
        name?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "card" | "bank_account";
    card?: {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
    } | undefined;
    bank_account?: {
        account_number: string;
        routing_number: string;
        account_type: "checking" | "savings";
    } | undefined;
    billing_details?: {
        email?: string | undefined;
        address?: {
            line1?: string | undefined;
            line2?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postal_code?: string | undefined;
            country?: string | undefined;
        } | undefined;
        phone?: string | undefined;
        name?: string | undefined;
    } | undefined;
}, {
    type: "card" | "bank_account";
    card?: {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
    } | undefined;
    bank_account?: {
        account_number: string;
        routing_number: string;
        account_type: "checking" | "savings";
    } | undefined;
    billing_details?: {
        email?: string | undefined;
        address?: {
            line1?: string | undefined;
            line2?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postal_code?: string | undefined;
            country?: string | undefined;
        } | undefined;
        phone?: string | undefined;
        name?: string | undefined;
    } | undefined;
}>;
export declare const CreateSubscriptionRequestSchema: z.ZodObject<{
    plan_id: z.ZodString;
    payment_method_id: z.ZodOptional<z.ZodString>;
    trial_period_days: z.ZodOptional<z.ZodNumber>;
    coupon: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    plan_id: string;
    metadata?: Record<string, any> | undefined;
    trial_period_days?: number | undefined;
    payment_method_id?: string | undefined;
    coupon?: string | undefined;
}, {
    plan_id: string;
    metadata?: Record<string, any> | undefined;
    trial_period_days?: number | undefined;
    payment_method_id?: string | undefined;
    coupon?: string | undefined;
}>;
export declare const UpdateSubscriptionRequestSchema: z.ZodObject<{
    plan_id: z.ZodOptional<z.ZodString>;
    payment_method_id: z.ZodOptional<z.ZodString>;
    cancel_at_period_end: z.ZodOptional<z.ZodBoolean>;
    proration_behavior: z.ZodOptional<z.ZodEnum<["create_prorations", "none", "always_invoice"]>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, any> | undefined;
    cancel_at_period_end?: boolean | undefined;
    plan_id?: string | undefined;
    payment_method_id?: string | undefined;
    proration_behavior?: "create_prorations" | "none" | "always_invoice" | undefined;
}, {
    metadata?: Record<string, any> | undefined;
    cancel_at_period_end?: boolean | undefined;
    plan_id?: string | undefined;
    payment_method_id?: string | undefined;
    proration_behavior?: "create_prorations" | "none" | "always_invoice" | undefined;
}>;
export declare const CreatePaymentIntentRequestSchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    payment_method_id: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    automatic_payment_methods: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
    }, {
        enabled: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency: string;
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
    payment_method_id?: string | undefined;
    automatic_payment_methods?: {
        enabled: boolean;
    } | undefined;
}, {
    amount: number;
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
    currency?: string | undefined;
    payment_method_id?: string | undefined;
    automatic_payment_methods?: {
        enabled: boolean;
    } | undefined;
}>;
export declare const BillingApiResponseSchema: z.ZodObject<{
    data: z.ZodAny;
    meta: z.ZodOptional<z.ZodObject<{
        total_count: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
        per_page: z.ZodOptional<z.ZodNumber>;
        has_more: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        page?: number | undefined;
        total_count?: number | undefined;
        per_page?: number | undefined;
        has_more?: boolean | undefined;
    }, {
        page?: number | undefined;
        total_count?: number | undefined;
        per_page?: number | undefined;
        has_more?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    data?: any;
    meta?: {
        page?: number | undefined;
        total_count?: number | undefined;
        per_page?: number | undefined;
        has_more?: boolean | undefined;
    } | undefined;
}, {
    data?: any;
    meta?: {
        page?: number | undefined;
        total_count?: number | undefined;
        per_page?: number | undefined;
        has_more?: boolean | undefined;
    } | undefined;
}>;
export declare const BillingListOptionsSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodString>;
    starting_after: z.ZodOptional<z.ZodString>;
    ending_before: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    starting_after?: string | undefined;
    ending_before?: string | undefined;
}, {
    status?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    starting_after?: string | undefined;
    ending_before?: string | undefined;
}>;
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
export type BillingApiResponse<T = any> = z.infer<typeof BillingApiResponseSchema> & {
    data: T;
};
export type BillingListOptions = z.infer<typeof BillingListOptionsSchema>;
//# sourceMappingURL=billing.d.ts.map