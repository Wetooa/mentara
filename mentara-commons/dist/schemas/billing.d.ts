import { z } from 'zod';
declare const PaymentMethodTypeSchema: z.ZodEnum<["CARD", "BANK_ACCOUNT", "DIGITAL_WALLET"]>;
declare const PaymentStatusSchema: z.ZodEnum<["PENDING", "COMPLETED", "FAILED", "REFUNDED"]>;
export declare const CreatePaymentMethodDtoSchema: z.ZodObject<{
    type: z.ZodEnum<["CARD", "BANK_ACCOUNT", "DIGITAL_WALLET"]>;
    cardLast4: z.ZodOptional<z.ZodString>;
    cardBrand: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET";
    cardLast4?: string | undefined;
    cardBrand?: string | undefined;
    isDefault?: boolean | undefined;
}, {
    type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET";
    cardLast4?: string | undefined;
    cardBrand?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const UpdatePaymentMethodDtoSchema: z.ZodObject<{
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isDefault?: boolean | undefined;
}, {
    isDefault?: boolean | undefined;
}>;
export declare const ProcessSessionPaymentDtoSchema: z.ZodObject<{
    therapistId: z.ZodString;
    meetingId: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    paymentMethodId: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    therapistId: string;
    amount: number;
    currency: string;
    paymentMethodId: string;
    meetingId?: string | undefined;
    description?: string | undefined;
}, {
    therapistId: string;
    amount: number;
    paymentMethodId: string;
    meetingId?: string | undefined;
    description?: string | undefined;
    currency?: string | undefined;
}>;
export declare const GetPaymentsQueryDtoSchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<["client", "therapist"]>>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "COMPLETED", "FAILED", "REFUNDED"]>>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | undefined;
    role?: "client" | "therapist" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | undefined;
    role?: "client" | "therapist" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const RetryPaymentDtoSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const PaymentMethodResponseSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    type: z.ZodEnum<["CARD", "BANK_ACCOUNT", "DIGITAL_WALLET"]>;
    cardLast4: z.ZodOptional<z.ZodString>;
    cardBrand: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET";
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    isDefault: boolean;
    cardLast4?: string | undefined;
    cardBrand?: string | undefined;
}, {
    type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET";
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    isDefault: boolean;
    cardLast4?: string | undefined;
    cardBrand?: string | undefined;
}>;
export declare const PaymentResponseSchema: z.ZodObject<{
    id: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["PENDING", "COMPLETED", "FAILED", "REFUNDED"]>;
    clientId: z.ZodString;
    therapistId: z.ZodString;
    meetingId: z.ZodOptional<z.ZodString>;
    paymentMethodId: z.ZodString;
    failureReason: z.ZodOptional<z.ZodString>;
    processedAt: z.ZodOptional<z.ZodString>;
    failedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    client: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
    }, {
        email: string;
        firstName: string;
        lastName: string;
    }>>;
    therapist: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
    }, {
        email: string;
        firstName: string;
        lastName: string;
    }>>;
    paymentMethod: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        type: z.ZodEnum<["CARD", "BANK_ACCOUNT", "DIGITAL_WALLET"]>;
        cardLast4: z.ZodOptional<z.ZodString>;
        cardBrand: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET";
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        isDefault: boolean;
        cardLast4?: string | undefined;
        cardBrand?: string | undefined;
    }, {
        type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET";
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        isDefault: boolean;
        cardLast4?: string | undefined;
        cardBrand?: string | undefined;
    }>>;
    meeting: z.ZodOptional<z.ZodObject<{
        startTime: z.ZodString;
        endTime: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        startTime: string;
        endTime: string;
    }, {
        title: string;
        startTime: string;
        endTime: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    id: string;
    createdAt: string;
    therapistId: string;
    updatedAt: string;
    clientId: string;
    amount: number;
    currency: string;
    paymentMethodId: string;
    client?: {
        email: string;
        firstName: string;
        lastName: string;
    } | undefined;
    therapist?: {
        email: string;
        firstName: string;
        lastName: string;
    } | undefined;
    meetingId?: string | undefined;
    failureReason?: string | undefined;
    processedAt?: string | undefined;
    failedAt?: string | undefined;
    paymentMethod?: {
        type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET";
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        isDefault: boolean;
        cardLast4?: string | undefined;
        cardBrand?: string | undefined;
    } | undefined;
    meeting?: {
        title: string;
        startTime: string;
        endTime: string;
    } | undefined;
}, {
    status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    id: string;
    createdAt: string;
    therapistId: string;
    updatedAt: string;
    clientId: string;
    amount: number;
    currency: string;
    paymentMethodId: string;
    client?: {
        email: string;
        firstName: string;
        lastName: string;
    } | undefined;
    therapist?: {
        email: string;
        firstName: string;
        lastName: string;
    } | undefined;
    meetingId?: string | undefined;
    failureReason?: string | undefined;
    processedAt?: string | undefined;
    failedAt?: string | undefined;
    paymentMethod?: {
        type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET";
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        isDefault: boolean;
        cardLast4?: string | undefined;
        cardBrand?: string | undefined;
    } | undefined;
    meeting?: {
        title: string;
        startTime: string;
        endTime: string;
    } | undefined;
}>;
export declare const TherapistAnalyticsResponseSchema: z.ZodObject<{
    totalSessions: z.ZodNumber;
    totalRevenue: z.ZodNumber;
    averageSessionRate: z.ZodNumber;
    platformFees: z.ZodNumber;
    netEarnings: z.ZodNumber;
    period: z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    period: {
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
    totalSessions: number;
    totalRevenue: number;
    averageSessionRate: number;
    platformFees: number;
    netEarnings: number;
}, {
    period: {
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
    totalSessions: number;
    totalRevenue: number;
    averageSessionRate: number;
    platformFees: number;
    netEarnings: number;
}>;
export declare const PlatformAnalyticsResponseSchema: z.ZodObject<{
    totalPayments: z.ZodNumber;
    successfulPayments: z.ZodNumber;
    failedPayments: z.ZodNumber;
    successRate: z.ZodNumber;
    totalRevenue: z.ZodNumber;
    platformRevenue: z.ZodNumber;
    therapistPayouts: z.ZodNumber;
    period: z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    period: {
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
    totalRevenue: number;
    successRate: number;
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    platformRevenue: number;
    therapistPayouts: number;
}, {
    period: {
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
    totalRevenue: number;
    successRate: number;
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    platformRevenue: number;
    therapistPayouts: number;
}>;
export declare const TestCardsResponseSchema: z.ZodObject<{
    message: z.ZodString;
    testCards: z.ZodArray<z.ZodObject<{
        last4: z.ZodString;
        scenario: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        last4: string;
        scenario: string;
    }, {
        description: string;
        last4: string;
        scenario: string;
    }>, "many">;
    notes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    message: string;
    notes: string[];
    testCards: {
        description: string;
        last4: string;
        scenario: string;
    }[];
}, {
    message: string;
    notes: string[];
    testCards: {
        description: string;
        last4: string;
        scenario: string;
    }[];
}>;
export declare const ServiceStatusResponseSchema: z.ZodObject<{
    service: z.ZodString;
    status: z.ZodString;
    mode: z.ZodString;
    features: z.ZodArray<z.ZodString, "many">;
    configuration: z.ZodObject<{
        platformFeeRate: z.ZodString;
        successRate: z.ZodString;
        processingDelay: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        successRate: string;
        platformFeeRate: string;
        processingDelay: string;
    }, {
        successRate: string;
        platformFeeRate: string;
        processingDelay: string;
    }>;
}, "strip", z.ZodTypeAny, {
    status: string;
    configuration: {
        successRate: string;
        platformFeeRate: string;
        processingDelay: string;
    };
    service: string;
    mode: string;
    features: string[];
}, {
    status: string;
    configuration: {
        successRate: string;
        platformFeeRate: string;
        processingDelay: string;
    };
    service: string;
    mode: string;
    features: string[];
}>;
export type CreatePaymentMethodDto = z.infer<typeof CreatePaymentMethodDtoSchema>;
export type UpdatePaymentMethodDto = z.infer<typeof UpdatePaymentMethodDtoSchema>;
export type ProcessSessionPaymentDto = z.infer<typeof ProcessSessionPaymentDtoSchema>;
export type GetPaymentsQueryDto = z.infer<typeof GetPaymentsQueryDtoSchema>;
export type RetryPaymentDto = z.infer<typeof RetryPaymentDtoSchema>;
export type PaymentMethodResponse = z.infer<typeof PaymentMethodResponseSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
export type TherapistAnalyticsResponse = z.infer<typeof TherapistAnalyticsResponseSchema>;
export type PlatformAnalyticsResponse = z.infer<typeof PlatformAnalyticsResponseSchema>;
export type TestCardsResponse = z.infer<typeof TestCardsResponseSchema>;
export type ServiceStatusResponse = z.infer<typeof ServiceStatusResponseSchema>;
export type PaymentMethodType = z.infer<typeof PaymentMethodTypeSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export {};
//# sourceMappingURL=billing.d.ts.map