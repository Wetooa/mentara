import {
  BaseDomainEvent,
  EventMetadata,
} from './interfaces/domain-event.interface';

// Payment & Billing Events

export interface PaymentProcessedData {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod:
    | 'credit_card'
    | 'debit_card'
    | 'bank_transfer'
    | 'paypal'
    | 'insurance';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionId: string;
  invoiceId?: string;
  sessionId?: string;
  therapistId?: string;
}

export class PaymentProcessedEvent extends BaseDomainEvent<PaymentProcessedData> {
  constructor(data: PaymentProcessedData, metadata?: EventMetadata) {
    super(data.paymentId, 'Payment', data, metadata);
  }
}

export interface PaymentFailedData {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  failureReason: string;
  errorCode: string;
  paymentMethod: string;
  retryAttempt: number;
  maxRetries: number;
}

export class PaymentFailedEvent extends BaseDomainEvent<PaymentFailedData> {
  constructor(data: PaymentFailedData, metadata?: EventMetadata) {
    super(data.paymentId, 'Payment', data, metadata);
  }
}

export interface RefundProcessedData {
  refundId: string;
  originalPaymentId: string;
  userId: string;
  amount: number;
  currency: string;
  refundReason: string;
  processedBy: string;
  refundMethod: 'original_payment_method' | 'bank_transfer' | 'store_credit';
}

export class RefundProcessedEvent extends BaseDomainEvent<RefundProcessedData> {
  constructor(data: RefundProcessedData, metadata?: EventMetadata) {
    super(data.refundId, 'Refund', data, metadata);
  }
}

export interface InvoiceGeneratedData {
  invoiceId: string;
  userId: string;
  therapistId?: string;
  amount: number;
  currency: string;
  dueDate: Date;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  taxAmount?: number;
  discountAmount?: number;
}

export class InvoiceGeneratedEvent extends BaseDomainEvent<InvoiceGeneratedData> {
  constructor(data: InvoiceGeneratedData, metadata?: EventMetadata) {
    super(data.invoiceId, 'Invoice', data, metadata);
  }
}

export interface SubscriptionCreatedData {
  subscriptionId: string;
  userId: string;
  planType: 'basic' | 'premium' | 'therapy_plus';
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
  startDate: Date;
  nextBillingDate: Date;
  trialPeriod?: number; // in days
}

export class SubscriptionCreatedEvent extends BaseDomainEvent<SubscriptionCreatedData> {
  constructor(data: SubscriptionCreatedData, metadata?: EventMetadata) {
    super(data.subscriptionId, 'Subscription', data, metadata);
  }
}

export interface SubscriptionCancelledData {
  subscriptionId: string;
  userId: string;
  cancelledAt: Date;
  cancellationReason: string;
  effectiveDate: Date;
  refundEligible: boolean;
  subscriptionDuration: number; // in days
}

export class SubscriptionCancelledEvent extends BaseDomainEvent<SubscriptionCancelledData> {
  constructor(data: SubscriptionCancelledData, metadata?: EventMetadata) {
    super(data.subscriptionId, 'Subscription', data, metadata);
  }
}

export interface TherapistPayoutData {
  payoutId: string;
  therapistId: string;
  amount: number;
  currency: string;
  payoutMethod: 'bank_transfer' | 'paypal' | 'stripe';
  sessionCount: number;
  periodStart: Date;
  periodEnd: Date;
  commissionRate: number;
  grossAmount: number;
  platformFee: number;
}

export class TherapistPayoutEvent extends BaseDomainEvent<TherapistPayoutData> {
  constructor(data: TherapistPayoutData, metadata?: EventMetadata) {
    super(data.payoutId, 'Payout', data, metadata);
  }
}

export interface InsuranceClaimData {
  claimId: string;
  userId: string;
  therapistId: string;
  sessionId: string;
  insuranceProvider: string;
  claimAmount: number;
  currency: string;
  claimStatus: 'submitted' | 'approved' | 'denied' | 'pending';
  submittedAt: Date;
  diagnosisCodes: string[];
  procedureCodes: string[];
}

export class InsuranceClaimEvent extends BaseDomainEvent<InsuranceClaimData> {
  constructor(data: InsuranceClaimData, metadata?: EventMetadata) {
    super(data.claimId, 'InsuranceClaim', data, metadata);
  }
}

export interface BillingReminderData {
  userId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  dueDate: Date;
  reminderType: 'first' | 'second' | 'final' | 'overdue';
  daysOverdue?: number;
}

export class BillingReminderEvent extends BaseDomainEvent<BillingReminderData> {
  constructor(data: BillingReminderData, metadata?: EventMetadata) {
    super(data.invoiceId, 'Invoice', data, metadata);
  }
}
