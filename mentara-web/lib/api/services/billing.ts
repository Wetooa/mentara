import { AxiosInstance } from "axios";

// Core PaymentMethod types matching backend schema
export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'CARD' | 'BANK_ACCOUNT' | 'DIGITAL_WALLET' | 'GCASH' | 'MAYA';
  nickname?: string;
  isDefault: boolean;
  isActive: boolean;
  lastUsed?: string;
  
  // Card-specific fields
  cardLast4?: string;
  cardBrand?: string;
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
  accountLast4?: string;
  
  // Digital wallet fields
  walletProvider?: string;
  walletEmail?: string;
  walletAccountName?: string;
  
  // GCash fields
  gcashNumber?: string;
  gcashName?: string;
  isVerified?: boolean;
  gcashEmail?: string;
  
  // Maya fields
  mayaNumber?: string;
  mayaName?: string;
  mayaVerified?: boolean;
  mayaEmail?: string;
  
  // Address
  billingAddress?: any;
  
  createdAt: string;
  updatedAt: string;
  
  // Legacy field for backwards compatibility
  is_default?: boolean;
  last4?: string;
}

export interface CreatePaymentMethodRequest {
  type: 'CARD' | 'BANK_ACCOUNT' | 'DIGITAL_WALLET' | 'GCASH' | 'MAYA';
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
  
  // Address
  billingAddress?: any;
  
  // Default setting
  isDefault?: boolean;
}

// Legacy/Stub types for backwards compatibility
export interface Subscription {
  id: string;
  status: string;
  cancel_at_period_end?: boolean;
  payment_method?: any;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
}

export interface Invoice {
  id: string;
  status: string;
  amount_remaining: number;
}

export interface PaymentIntent {
  id: string;
  status: string;
}

export interface BillingPortalSession {
  url: string;
}

export interface BillingStats {
  total_revenue: number;
}

export interface CreateSubscriptionRequest {
  planId: string;
}

export interface UpdateSubscriptionRequest {
  planId: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
}

export interface BillingListOptions {
  limit?: number;
}

/**
 * Real Billing Service Implementation
 * Connects to backend NestJS billing endpoints
 */
export function createBillingService(axios: AxiosInstance) {
  return {
    // ===== PAYMENT METHODS (WORKING) =====
    
    /**
     * Get all payment methods for the current user
     * GET /billing/payment-methods
     */
    async getPaymentMethods(): Promise<PaymentMethod[]> {
      const response = await axios.get('/billing/payment-methods');
      return response.data;
    },

    /**
     * Create a new payment method
     * POST /billing/payment-methods
     */
    async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
      const response = await axios.post('/billing/payment-methods', data);
      return response.data;
    },

    /**
     * Set a payment method as default
     * PATCH /billing/payment-methods/:id
     */
    async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
      const response = await axios.patch(`/billing/payment-methods/${paymentMethodId}`, {
        isDefault: true
      });
      return response.data;
    },

    /**
     * Delete a payment method
     * DELETE /billing/payment-methods/:id
     */
    async detachPaymentMethod(paymentMethodId: string): Promise<void> {
      await axios.delete(`/billing/payment-methods/${paymentMethodId}`);
    },

    /**
     * Update payment method (currently only supports isDefault)
     * PATCH /billing/payment-methods/:id
     */
    async attachPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
      const response = await axios.patch(`/billing/payment-methods/${paymentMethodId}`, {
        isActive: true
      });
      return response.data;
    },

    // ===== LEGACY/STUB METHODS (For backwards compatibility) =====
    
    async getSubscription(): Promise<Subscription | null> {
      console.warn('getSubscription called - subscriptions are not implemented');
      return null;
    },

    async getPlans(): Promise<SubscriptionPlan[]> {
      console.warn('getPlans called - subscriptions are not implemented');
      return [];
    },

    async getPlan(planId: string): Promise<SubscriptionPlan | null> {
      console.warn('getPlan called - subscriptions are not implemented');
      return null;
    },

    async createSubscription(data: CreateSubscriptionRequest): Promise<Subscription> {
      console.warn('createSubscription called - subscriptions are not implemented');
      throw new Error('Subscriptions are not implemented yet');
    },

    async updateSubscription(data: UpdateSubscriptionRequest): Promise<Subscription> {
      console.warn('updateSubscription called - subscriptions are not implemented');
      throw new Error('Subscriptions are not implemented yet');
    },

    async cancelSubscription(immediately?: boolean): Promise<Subscription> {
      console.warn('cancelSubscription called - subscriptions are not implemented');
      throw new Error('Subscriptions are not implemented yet');
    },

    async reactivateSubscription(): Promise<Subscription> {
      console.warn('reactivateSubscription called - subscriptions are not implemented');
      throw new Error('Subscriptions are not implemented yet');
    },

    async getInvoices(options?: BillingListOptions): Promise<Invoice[]> {
      console.warn('getInvoices called - invoices are not implemented');
      return [];
    },

    async getInvoice(invoiceId: string): Promise<Invoice | null> {
      console.warn('getInvoice called - invoices are not implemented');
      return null;
    },

    async downloadInvoice(invoiceId: string): Promise<Blob> {
      console.warn('downloadInvoice called - invoices are not implemented');
      throw new Error('Invoices are not implemented yet');
    },

    async payInvoice(invoiceId: string, paymentMethodId: string): Promise<Invoice> {
      console.warn('payInvoice called - invoices are not implemented');
      throw new Error('Invoices are not implemented yet');
    },

    async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
      console.warn('createPaymentIntent called - payment intents are not implemented');
      throw new Error('Payment intents are not implemented yet');
    },

    async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
      console.warn('confirmPaymentIntent called - payment intents are not implemented');
      throw new Error('Payment intents are not implemented yet');
    },

    async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
      console.warn('getPaymentIntent called - payment intents are not implemented');
      return null;
    },

    async createPortalSession(returnUrl?: string): Promise<BillingPortalSession> {
      console.warn('createPortalSession called - billing portal is not implemented');
      throw new Error('Billing portal is not implemented yet');
    },

    async validateCoupon(couponCode: string): Promise<{ valid: boolean }> {
      console.warn('validateCoupon called - coupons are not implemented');
      return { valid: false };
    },

    async applyCoupon(couponCode: string): Promise<{ valid: boolean }> {
      console.warn('applyCoupon called - coupons are not implemented');
      return { valid: false };
    },

    async getBillingStats(period: string): Promise<BillingStats> {
      console.warn('getBillingStats called - billing stats are not implemented');
      return { total_revenue: 0 };
    },

    async calculateTax(amount: number, location?: string): Promise<{ tax: number; total: number }> {
      console.warn('calculateTax called - tax calculation is not implemented');
      return { tax: 0, total: amount };
    },
  };
}

export type BillingService = ReturnType<typeof createBillingService>;