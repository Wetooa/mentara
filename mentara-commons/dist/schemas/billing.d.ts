import { z } from 'zod';
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
export declare const CreatePaymentMethodDtoSchema: z.ZodObject<{
    type: z.ZodEnum<["card", "bank_account", "paypal"]>;
    token: z.ZodString;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "card" | "bank_account" | "paypal";
    token: string;
    isDefault?: boolean | undefined;
}, {
    type: "card" | "bank_account" | "paypal";
    token: string;
    isDefault?: boolean | undefined;
}>;
export declare const UpdatePaymentMethodDtoSchema: z.ZodObject<{
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isDefault?: boolean | undefined;
}, {
    isDefault?: boolean | undefined;
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
export declare const CreateInvoiceDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodString;
    description: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    currency: string;
    description: string;
    amount: number;
    sessionId?: string | undefined;
}, {
    userId: string;
    currency: string;
    description: string;
    amount: number;
    sessionId?: string | undefined;
}>;
export declare const CreatePaymentIntentDtoSchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    amount: number;
    sessionId?: string | undefined;
    paymentMethodId?: string | undefined;
}, {
    currency: string;
    amount: number;
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
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type CreatePaymentMethodDto = z.infer<typeof CreatePaymentMethodDtoSchema>;
export type UpdatePaymentMethodDto = z.infer<typeof UpdatePaymentMethodDtoSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceDtoSchema>;
export type CreatePaymentIntentDto = z.infer<typeof CreatePaymentIntentDtoSchema>;
export type BillingQuery = z.infer<typeof BillingQuerySchema>;
export type InvoiceIdParam = z.infer<typeof InvoiceIdParamSchema>;
export type PaymentMethodIdParam = z.infer<typeof PaymentMethodIdParamSchema>;
//# sourceMappingURL=billing.d.ts.map