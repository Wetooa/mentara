// Stub billing service to prevent import errors
// Subscriptions are outdated and this is just to prevent crashes

import { AxiosInstance } from "axios";

// Stub types
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

export interface PaymentMethod {
  id: string;
  is_default?: boolean;
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

export interface CreatePaymentMethodRequest {
  type: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
}

export interface BillingListOptions {
  limit?: number;
}

/**
 * Billing service stub - subscriptions are outdated
 * This service provides dummy implementations to prevent import errors
 */
export function createBillingService(axios: AxiosInstance) {
  return {
    // Stub methods that return empty/default data
    async getSubscription(): Promise<Subscription | null> {
      console.warn('getSubscription called - subscriptions are outdated');
      return null;
    },

    async getPlans(): Promise<SubscriptionPlan[]> {
      console.warn('getPlans called - subscriptions are outdated');
      return [];
    },

    async getPlan(planId: string): Promise<SubscriptionPlan | null> {
      console.warn('getPlan called - subscriptions are outdated');
      return null;
    },

    async createSubscription(data: CreateSubscriptionRequest): Promise<Subscription> {
      console.warn('createSubscription called - subscriptions are outdated');
      throw new Error('Subscriptions are no longer supported');
    },

    async updateSubscription(data: UpdateSubscriptionRequest): Promise<Subscription> {
      console.warn('updateSubscription called - subscriptions are outdated');
      throw new Error('Subscriptions are no longer supported');
    },

    async cancelSubscription(immediately?: boolean): Promise<Subscription> {
      console.warn('cancelSubscription called - subscriptions are outdated');
      throw new Error('Subscriptions are no longer supported');
    },

    async reactivateSubscription(): Promise<Subscription> {
      console.warn('reactivateSubscription called - subscriptions are outdated');
      throw new Error('Subscriptions are no longer supported');
    },

    async getPaymentMethods(): Promise<PaymentMethod[]> {
      console.warn('getPaymentMethods called - subscriptions are outdated');
      return [];
    },

    async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
      console.warn('createPaymentMethod called - subscriptions are outdated');
      throw new Error('Payment methods are no longer supported');
    },

    async attachPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
      console.warn('attachPaymentMethod called - subscriptions are outdated');
      throw new Error('Payment methods are no longer supported');
    },

    async detachPaymentMethod(paymentMethodId: string): Promise<void> {
      console.warn('detachPaymentMethod called - subscriptions are outdated');
      throw new Error('Payment methods are no longer supported');
    },

    async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
      console.warn('setDefaultPaymentMethod called - subscriptions are outdated');
      throw new Error('Payment methods are no longer supported');
    },

    async getInvoices(options?: BillingListOptions): Promise<Invoice[]> {
      console.warn('getInvoices called - subscriptions are outdated');
      return [];
    },

    async getInvoice(invoiceId: string): Promise<Invoice | null> {
      console.warn('getInvoice called - subscriptions are outdated');
      return null;
    },

    async downloadInvoice(invoiceId: string): Promise<Blob> {
      console.warn('downloadInvoice called - subscriptions are outdated');
      throw new Error('Invoices are no longer supported');
    },

    async payInvoice(invoiceId: string, paymentMethodId: string): Promise<Invoice> {
      console.warn('payInvoice called - subscriptions are outdated');
      throw new Error('Invoices are no longer supported');
    },

    async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
      console.warn('createPaymentIntent called - subscriptions are outdated');
      throw new Error('Payment intents are no longer supported');
    },

    async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
      console.warn('confirmPaymentIntent called - subscriptions are outdated');
      throw new Error('Payment intents are no longer supported');
    },

    async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
      console.warn('getPaymentIntent called - subscriptions are outdated');
      return null;
    },

    async createPortalSession(returnUrl?: string): Promise<BillingPortalSession> {
      console.warn('createPortalSession called - subscriptions are outdated');
      throw new Error('Billing portal is no longer supported');
    },

    async validateCoupon(couponCode: string): Promise<{ valid: boolean }> {
      console.warn('validateCoupon called - subscriptions are outdated');
      return { valid: false };
    },

    async applyCoupon(couponCode: string): Promise<{ valid: boolean }> {
      console.warn('applyCoupon called - subscriptions are outdated');
      return { valid: false };
    },

    async getBillingStats(period: string): Promise<BillingStats> {
      console.warn('getBillingStats called - subscriptions are outdated');
      return { total_revenue: 0 };
    },

    async calculateTax(amount: number, location?: string): Promise<{ tax: number; total: number }> {
      console.warn('calculateTax called - subscriptions are outdated');
      return { tax: 0, total: amount };
    },
  };
}

export type BillingService = ReturnType<typeof createBillingService>;