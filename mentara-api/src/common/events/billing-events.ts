import {
  BaseDomainEvent,
  EventMetadata,
} from './interfaces/domain-event.interface';

// ===== PAYMENT EVENTS =====

export interface PaymentSucceededData {
  paymentId: string;
  clientId: string;
  therapistId: string;
  amount: number;
  currency: string;
  platformFee: number;
  therapistAmount: number;
  meetingId?: string;
  paymentMethodId: string;
}

export class PaymentSucceededEvent extends BaseDomainEvent<PaymentSucceededData> {
  constructor(data: PaymentSucceededData, metadata?: EventMetadata) {
    super(data.paymentId, 'Payment', data, metadata);
  }
}

export interface PaymentFailedData {
  paymentId: string;
  clientId: string;
  therapistId: string;
  amount: number;
  currency: string;
  failureReason: string;
  meetingId?: string;
  paymentMethodId: string;
}

export class PaymentFailedEvent extends BaseDomainEvent<PaymentFailedData> {
  constructor(data: PaymentFailedData, metadata?: EventMetadata) {
    super(data.paymentId, 'Payment', data, metadata);
  }
}

export interface PaymentInitiatedData {
  paymentId: string;
  clientId: string;
  therapistId: string;
  amount: number;
  currency: string;
  meetingId?: string;
  paymentMethodId: string;
  description?: string;
}

export class PaymentInitiatedEvent extends BaseDomainEvent<PaymentInitiatedData> {
  constructor(data: PaymentInitiatedData, metadata?: EventMetadata) {
    super(data.paymentId, 'Payment', data, metadata);
  }
}

// ===== PAYMENT METHOD EVENTS =====

export interface PaymentMethodCreatedData {
  paymentMethodId: string;
  userId: string;
  type: 'CARD' | 'BANK_ACCOUNT' | 'DIGITAL_WALLET';
  cardLast4?: string;
  cardBrand?: string;
  isDefault: boolean;
}

export class PaymentMethodCreatedEvent extends BaseDomainEvent<PaymentMethodCreatedData> {
  constructor(data: PaymentMethodCreatedData, metadata?: EventMetadata) {
    super(data.paymentMethodId, 'PaymentMethod', data, metadata);
  }
}

export interface PaymentMethodDeletedData {
  paymentMethodId: string;
  userId: string;
}

export class PaymentMethodDeletedEvent extends BaseDomainEvent<PaymentMethodDeletedData> {
  constructor(data: PaymentMethodDeletedData, metadata?: EventMetadata) {
    super(data.paymentMethodId, 'PaymentMethod', data, metadata);
  }
}

// ===== THERAPIST PAYOUT EVENTS =====

export interface TherapistPayoutCalculatedData {
  therapistId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalSessions: number;
  totalRevenue: number;
  platformFees: number;
  netEarnings: number;
  averageSessionRate: number;
}

export class TherapistPayoutCalculatedEvent extends BaseDomainEvent<TherapistPayoutCalculatedData> {
  constructor(data: TherapistPayoutCalculatedData, metadata?: EventMetadata) {
    super(data.therapistId, 'TherapistPayout', data, metadata);
  }
}

// ===== ANALYTICS EVENTS =====

export interface PaymentAnalyticsRequestedData {
  userId: string;
  userRole: 'client' | 'therapist' | 'admin';
  analyticsType: 'therapist' | 'platform';
  period: {
    startDate?: Date;
    endDate?: Date;
  };
}

export class PaymentAnalyticsRequestedEvent extends BaseDomainEvent<PaymentAnalyticsRequestedData> {
  constructor(data: PaymentAnalyticsRequestedData, metadata?: EventMetadata) {
    super(data.userId, 'Analytics', data, metadata);
  }
}

// ===== PLATFORM EVENTS =====

export interface PlatformFeeCollectedData {
  paymentId: string;
  therapistId: string;
  clientId: string;
  totalAmount: number;
  feeAmount: number;
  feePercentage: number;
  currency: string;
}

export class PlatformFeeCollectedEvent extends BaseDomainEvent<PlatformFeeCollectedData> {
  constructor(data: PlatformFeeCollectedData, metadata?: EventMetadata) {
    super(data.paymentId, 'PlatformFee', data, metadata);
  }
}

// ===== EDUCATIONAL EVENTS =====

export interface MockPaymentProcessedData {
  paymentId: string;
  scenario: 'success' | 'decline' | 'insufficient_funds' | 'expired_card';
  testCardLast4?: string;
  processingTime: number; // milliseconds
  isEducational: true;
}

export class MockPaymentProcessedEvent extends BaseDomainEvent<MockPaymentProcessedData> {
  constructor(data: MockPaymentProcessedData, metadata?: EventMetadata) {
    super(data.paymentId, 'MockPayment', data, metadata);
  }
}