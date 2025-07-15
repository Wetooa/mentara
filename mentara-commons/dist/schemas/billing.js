"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodIdParamSchema = exports.InvoiceIdParamSchema = exports.BillingQuerySchema = exports.CreatePaymentIntentDtoSchema = exports.CreateInvoiceDtoSchema = exports.InvoiceSchema = exports.UpdatePaymentMethodDtoSchema = exports.CreatePaymentMethodDtoSchema = exports.PaymentMethodSchema = void 0;
const zod_1 = require("zod");
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
// Create Payment Method Schema
exports.CreatePaymentMethodDtoSchema = zod_1.z.object({
    type: zod_1.z.enum(['card', 'bank_account', 'paypal']),
    token: zod_1.z.string().min(1, 'Payment token is required'),
    isDefault: zod_1.z.boolean().optional()
});
// Update Payment Method Schema
exports.UpdatePaymentMethodDtoSchema = zod_1.z.object({
    isDefault: zod_1.z.boolean().optional()
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
// Create Invoice Schema
exports.CreateInvoiceDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    amount: zod_1.z.number().min(0.01, 'Amount must be greater than 0'),
    currency: zod_1.z.string().length(3, 'Currency must be 3 characters'),
    description: zod_1.z.string().min(1, 'Description is required'),
    sessionId: zod_1.z.string().uuid().optional()
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
//# sourceMappingURL=billing.js.map