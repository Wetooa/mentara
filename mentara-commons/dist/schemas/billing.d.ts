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
    isActive?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    monthlyPrice?: number | undefined;
    yearlyPrice?: number | undefined;
    features?: any;
    limits?: any;
    trialDays?: number | undefined;
}, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
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
    currency: string;
    amount: number;
    description?: string | undefined;
    meetingId?: string | undefined;
    paymentMethodId?: string | undefined;
    subscriptionId?: string | undefined;
    invoiceId?: string | undefined;
    providerPaymentId?: string | undefined;
}, {
    amount: number;
    currency?: string | undefined;
    description?: string | undefined;
    meetingId?: string | undefined;
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
    id: string;
    type: "card" | "bank_account" | "paypal";
    isDefault: boolean;
    last4?: string | undefined;
    brand?: string | undefined;
    expiryMonth?: number | undefined;
    expiryYear?: number | undefined;
}, {
    id: string;
    type: "card" | "bank_account" | "paypal";
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
    id: string;
    createdAt: string;
    status: "cancelled" | "pending" | "paid" | "failed";
    userId: string;
    currency: string;
    description: string;
    amount: number;
    sessionId?: string | undefined;
    paidAt?: string | undefined;
}, {
    id: string;
    createdAt: string;
    status: "cancelled" | "pending" | "paid" | "failed";
    userId: string;
    currency: string;
    description: string;
    amount: number;
    sessionId?: string | undefined;
    paidAt?: string | undefined;
}>;
export declare const CreatePaymentIntentDtoSchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    amount: number;
    paymentMethodId?: string | undefined;
    sessionId?: string | undefined;
}, {
    currency: string;
    amount: number;
    paymentMethodId?: string | undefined;
    sessionId?: string | undefined;
}>;
export declare const BillingQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["pending", "paid", "failed", "cancelled"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["createdAt", "amount", "status"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "cancelled" | "pending" | "paid" | "failed" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "status" | "amount" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    status?: "cancelled" | "pending" | "paid" | "failed" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "status" | "amount" | undefined;
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
//# sourceMappingURL=billing.d.ts.map