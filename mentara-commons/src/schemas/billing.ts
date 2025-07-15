import { z } from 'zod';

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

// Create Payment Method Schema
export const CreatePaymentMethodDtoSchema = z.object({
  type: z.enum(['card', 'bank_account', 'paypal']),
  token: z.string().min(1, 'Payment token is required'),
  isDefault: z.boolean().optional()
});

// Update Payment Method Schema
export const UpdatePaymentMethodDtoSchema = z.object({
  isDefault: z.boolean().optional()
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

// Create Invoice Schema
export const CreateInvoiceDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  description: z.string().min(1, 'Description is required'),
  sessionId: z.string().uuid().optional()
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
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type CreatePaymentMethodDto = z.infer<typeof CreatePaymentMethodDtoSchema>;
export type UpdatePaymentMethodDto = z.infer<typeof UpdatePaymentMethodDtoSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceDtoSchema>;
export type CreatePaymentIntentDto = z.infer<typeof CreatePaymentIntentDtoSchema>;
export type BillingQuery = z.infer<typeof BillingQuerySchema>;
export type InvoiceIdParam = z.infer<typeof InvoiceIdParamSchema>;
export type PaymentMethodIdParam = z.infer<typeof PaymentMethodIdParamSchema>;