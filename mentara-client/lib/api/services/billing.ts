import { AxiosInstance } from 'axios';

// Stripe-related types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'sepa_debit';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: 'credit' | 'debit' | 'prepaid';
    country: string;
  };
  bank_account?: {
    bank_name: string;
    last4: string;
    account_type: 'checking' | 'savings';
    routing_number: string;
  };
  billing_details: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
  is_default: boolean;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  interval_count: number;
  features: string[];
  is_popular: boolean;
  trial_period_days?: number;
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  payment_method?: PaymentMethod;
  latest_invoice?: Invoice;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  description?: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  payment_intent_id?: string;
  subscription_id?: string;
  line_items: InvoiceLineItem[];
  period_start: string;
  period_end: string;
  due_date?: string;
  created_at: string;
  paid_at?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_amount: number;
  amount: number;
  currency: string;
  period?: {
    start: string;
    end: string;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  client_secret: string;
  payment_method?: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface BillingPortalSession {
  url: string;
  return_url: string;
}

export interface UsageRecord {
  id: string;
  subscription_item_id: string;
  quantity: number;
  timestamp: string;
  action: 'increment' | 'set';
}

export interface BillingStats {
  total_revenue: number;
  monthly_revenue: number;
  active_subscriptions: number;
  canceled_subscriptions: number;
  trial_subscriptions: number;
  revenue_growth_rate: number;
  churn_rate: number;
}

// API Request/Response types
export interface CreatePaymentMethodRequest {
  type: 'card' | 'bank_account';
  card?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  bank_account?: {
    account_number: string;
    routing_number: string;
    account_type: 'checking' | 'savings';
  };
  billing_details?: PaymentMethod['billing_details'];
}

export interface CreateSubscriptionRequest {
  plan_id: string;
  payment_method_id?: string;
  trial_period_days?: number;
  coupon?: string;
  metadata?: Record<string, any>;
}

export interface UpdateSubscriptionRequest {
  plan_id?: string;
  payment_method_id?: string;
  cancel_at_period_end?: boolean;
  proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
  metadata?: Record<string, any>;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  payment_method_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  automatic_payment_methods?: {
    enabled: boolean;
  };
}

export interface BillingApiResponse<T> {
  data: T;
  meta?: {
    total_count?: number;
    page?: number;
    per_page?: number;
    has_more?: boolean;
  };
}

export interface BillingListOptions {
  page?: number;
  limit?: number;
  status?: string;
  starting_after?: string;
  ending_before?: string;
}

// Factory function to create billing service
export const createBillingService = (apiClient: AxiosInstance) => ({
  // Subscription Plans
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get<BillingApiResponse<SubscriptionPlan[]>>('/billing/plans');
    return response.data.data;
  },

  getPlan: async (planId: string): Promise<SubscriptionPlan> => {
    const response = await apiClient.get<BillingApiResponse<SubscriptionPlan>>(`/billing/plans/${planId}`);
    return response.data.data;
  },

  // Subscriptions
  getSubscription: async (): Promise<Subscription | null> => {
    try {
      const response = await apiClient.get<BillingApiResponse<Subscription>>('/billing/subscription');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createSubscription: async (data: CreateSubscriptionRequest): Promise<Subscription> => {
    const response = await apiClient.post<BillingApiResponse<Subscription>>('/billing/subscription', data);
    return response.data.data;
  },

  updateSubscription: async (data: UpdateSubscriptionRequest): Promise<Subscription> => {
    const response = await apiClient.patch<BillingApiResponse<Subscription>>('/billing/subscription', data);
    return response.data.data;
  },

  cancelSubscription: async (immediately: boolean = false): Promise<Subscription> => {
    const response = await apiClient.delete<BillingApiResponse<Subscription>>('/billing/subscription', {
      data: { immediately }
    });
    return response.data.data;
  },

  reactivateSubscription: async (): Promise<Subscription> => {
    const response = await apiClient.post<BillingApiResponse<Subscription>>('/billing/subscription/reactivate');
    return response.data.data;
  },

  // Payment Methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<BillingApiResponse<PaymentMethod[]>>('/billing/payment-methods');
    return response.data.data;
  },

  createPaymentMethod: async (data: CreatePaymentMethodRequest): Promise<PaymentMethod> => {
    const response = await apiClient.post<BillingApiResponse<PaymentMethod>>('/billing/payment-methods', data);
    return response.data.data;
  },

  attachPaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
    const response = await apiClient.post<BillingApiResponse<PaymentMethod>>(
      `/billing/payment-methods/${paymentMethodId}/attach`
    );
    return response.data.data;
  },

  detachPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await apiClient.delete(`/billing/payment-methods/${paymentMethodId}`);
  },

  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
    const response = await apiClient.post<BillingApiResponse<PaymentMethod>>(
      `/billing/payment-methods/${paymentMethodId}/default`
    );
    return response.data.data;
  },

  // Invoices
  getInvoices: async (options: BillingListOptions = {}): Promise<Invoice[]> => {
    const response = await apiClient.get<BillingApiResponse<Invoice[]>>('/billing/invoices', {
      params: options
    });
    return response.data.data;
  },

  getInvoice: async (invoiceId: string): Promise<Invoice> => {
    const response = await apiClient.get<BillingApiResponse<Invoice>>(`/billing/invoices/${invoiceId}`);
    return response.data.data;
  },

  downloadInvoice: async (invoiceId: string): Promise<Blob> => {
    const response = await apiClient.get(`/billing/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  payInvoice: async (invoiceId: string, paymentMethodId?: string): Promise<Invoice> => {
    const response = await apiClient.post<BillingApiResponse<Invoice>>(
      `/billing/invoices/${invoiceId}/pay`,
      { payment_method_id: paymentMethodId }
    );
    return response.data.data;
  },

  // Payment Intents (for one-time payments)
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<PaymentIntent> => {
    const response = await apiClient.post<BillingApiResponse<PaymentIntent>>('/billing/payment-intents', data);
    return response.data.data;
  },

  confirmPaymentIntent: async (paymentIntentId: string, paymentMethodId?: string): Promise<PaymentIntent> => {
    const response = await apiClient.post<BillingApiResponse<PaymentIntent>>(
      `/billing/payment-intents/${paymentIntentId}/confirm`,
      { payment_method_id: paymentMethodId }
    );
    return response.data.data;
  },

  getPaymentIntent: async (paymentIntentId: string): Promise<PaymentIntent> => {
    const response = await apiClient.get<BillingApiResponse<PaymentIntent>>(
      `/billing/payment-intents/${paymentIntentId}`
    );
    return response.data.data;
  },

  // Billing Portal
  createPortalSession: async (returnUrl: string): Promise<BillingPortalSession> => {
    const response = await apiClient.post<BillingApiResponse<BillingPortalSession>>('/billing/portal', {
      return_url: returnUrl
    });
    return response.data.data;
  },

  // Usage-based billing
  reportUsage: async (subscriptionItemId: string, quantity: number, timestamp?: string): Promise<UsageRecord> => {
    const response = await apiClient.post<BillingApiResponse<UsageRecord>>(
      `/billing/usage/${subscriptionItemId}`,
      {
        quantity,
        timestamp: timestamp || new Date().toISOString(),
        action: 'increment'
      }
    );
    return response.data.data;
  },

  getUsageRecords: async (subscriptionItemId: string, options: BillingListOptions = {}): Promise<UsageRecord[]> => {
    const response = await apiClient.get<BillingApiResponse<UsageRecord[]>>(
      `/billing/usage/${subscriptionItemId}`,
      { params: options }
    );
    return response.data.data;
  },

  // Coupons and Discounts
  applyCoupon: async (couponCode: string): Promise<{ valid: boolean; discount?: any }> => {
    const response = await apiClient.post<BillingApiResponse<{ valid: boolean; discount?: any }>>(
      '/billing/coupons/apply',
      { code: couponCode }
    );
    return response.data.data;
  },

  validateCoupon: async (couponCode: string): Promise<{ valid: boolean; discount?: any }> => {
    const response = await apiClient.get<BillingApiResponse<{ valid: boolean; discount?: any }>>(
      `/billing/coupons/validate/${couponCode}`
    );
    return response.data.data;
  },

  // Billing Analytics (for admin/business intelligence)
  getBillingStats: async (period: 'month' | 'quarter' | 'year' = 'month'): Promise<BillingStats> => {
    const response = await apiClient.get<BillingApiResponse<BillingStats>>('/billing/stats', {
      params: { period }
    });
    return response.data.data;
  },

  // Tax calculations
  calculateTax: async (amount: number, currency: string, customerLocation?: string): Promise<{
    tax_amount: number;
    tax_rate: number;
    total_amount: number;
  }> => {
    const response = await apiClient.post('/billing/tax/calculate', {
      amount,
      currency,
      customer_location: customerLocation
    });
    return response.data.data;
  },

  // Webhooks (for handling Stripe webhooks)
  verifyWebhookSignature: async (payload: string, signature: string): Promise<boolean> => {
    const response = await apiClient.post<BillingApiResponse<{ valid: boolean }>>('/billing/webhooks/verify', {
      payload,
      signature
    });
    return response.data.data.valid;
  }
});

export type BillingService = ReturnType<typeof createBillingService>;