export interface CreatePaymentMethodDto {
  type: 'CARD' | 'BANK_ACCOUNT' | 'DIGITAL_WALLET';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountName?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodDto {
  isDefault?: boolean;
  cardholderName?: string;
  accountName?: string;
}

export interface ProcessSessionPaymentDto {
  sessionId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  description?: string;
  therapistId: string; // Required by billing service
}