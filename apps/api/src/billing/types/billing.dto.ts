export interface CreatePaymentMethodDto {
  type: 'CARD' | 'BANK_ACCOUNT' | 'DIGITAL_WALLET' | 'GCASH' | 'MAYA' | 'INSURANCE';
  nickname?: string;
  
  // Card-specific fields
  cardholderName?: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardType?: string;
  
  // Bank account fields
  bankName?: string;
  accountHolderName?: string;
  accountType?: string;
  routingNumber?: string;
  accountNumber?: string;
  
  // Digital wallet fields
  walletProvider?: string;
  walletEmail?: string;
  walletAccountName?: string;
  
  // GCash fields
  gcashNumber?: string;
  gcashName?: string;
  gcashEmail?: string;
  
  // Maya fields
  mayaNumber?: string;
  mayaName?: string;
  mayaEmail?: string;
  
  // Insurance fields
  insuranceProviderName?: string;
  policyNumber?: string;
  memberId?: string;
  groupNumber?: string;
  coverageDetails?: {
    coverageType?: 'FULL' | 'COPAY' | 'PERCENTAGE';
    copayAmount?: number;
    coveragePercentage?: number;
  };
  
  // Address
  billingAddress?: any;
  
  // Default setting
  isDefault?: boolean;
  
  // Legacy fields for backwards compatibility
  expiryDate?: string;
  cvv?: string;
  accountName?: string;
}

export interface UpdatePaymentMethodDto {
  isDefault?: boolean;
  cardholderName?: string;
  accountName?: string;
}

export interface ProcessSessionPaymentDto {
  meetingId: string; // Changed from sessionId to match frontend
  paymentMethodId: string;
  amount: number;
  currency?: string;
  description?: string;
  // therapistId removed - will be derived from meeting
}