import { AxiosInstance } from 'axios';
import {
  // Subscription Management
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  
  // Plans
  GetPlansQueryDto,
  
  // Payment Methods
  CreatePaymentMethodDto,
  PaymentMethod,
  
  // Invoices
  Invoice,
  
  // Usage
  RecordUsageDto,
  
  // Statistics
  GetBillingStatisticsQueryDto,
  
  // Legacy types for backward compatibility
  CreatePaymentIntentDto,
  
  // Complex billing data structures
  SubscriptionPlan,
  Subscription,
  PaymentIntent,
  BillingPortalSession,
  UsageRecord,
  BillingStats,
  CreatePaymentMethodRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentIntentRequest,
  BillingApiResponse,
  BillingListOptions,
} from 'mentara-commons';

// All billing types are now imported from mentara-commons

// Additional local types for complex billing structures
interface CouponDiscount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  amount: number;
  currency?: string;
  description?: string;
  validUntil?: string;
  maxRedemptions?: number;
  currentRedemptions?: number;
}

// Re-export commons types for backward compatibility
export type {
  SubscriptionPlan,
  Subscription,
  InvoiceLineItem,
  PaymentIntent,
  BillingPortalSession,
  UsageRecord,
  BillingStats,
  CreatePaymentMethodRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentIntentRequest,
  BillingApiResponse,
  BillingListOptions,
};

// Factory function to create billing service
export const createBillingService = (apiClient: AxiosInstance) => ({
  // Subscription Plans
  getPlans: async (query?: GetPlansQueryDto): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get<BillingApiResponse<SubscriptionPlan[]>>('/billing/plans', {
      params: query
    });
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
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createSubscription: async (data: CreateSubscriptionDto): Promise<Subscription> => {
    const response = await apiClient.post<BillingApiResponse<Subscription>>('/billing/subscription', data);
    return response.data.data;
  },

  updateSubscription: async (data: UpdateSubscriptionDto): Promise<Subscription> => {
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

  createPaymentMethod: async (data: CreatePaymentMethodDto): Promise<PaymentMethod> => {
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
  createPaymentIntent: async (data: CreatePaymentIntentDto): Promise<PaymentIntent> => {
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
  reportUsage: async (subscriptionItemId: string, data: RecordUsageDto): Promise<UsageRecord> => {
    const response = await apiClient.post<BillingApiResponse<UsageRecord>>(
      `/billing/usage/${subscriptionItemId}`,
      data
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
  applyCoupon: async (couponCode: string): Promise<{ valid: boolean; discount?: CouponDiscount }> => {
    const response = await apiClient.post<BillingApiResponse<{ valid: boolean; discount?: CouponDiscount }>>(
      '/billing/coupons/apply',
      { code: couponCode }
    );
    return response.data.data;
  },

  validateCoupon: async (couponCode: string): Promise<{ valid: boolean; discount?: CouponDiscount }> => {
    const response = await apiClient.get<BillingApiResponse<{ valid: boolean; discount?: CouponDiscount }>>(
      `/billing/coupons/validate/${couponCode}`
    );
    return response.data.data;
  },

  // Billing Analytics (for admin/business intelligence)
  getBillingStats: async (query?: GetBillingStatisticsQueryDto): Promise<BillingStats> => {
    const response = await apiClient.get<BillingApiResponse<BillingStats>>('/billing/stats', {
      params: query
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
  },

  // Payment Failure Recovery
  getFailedPayments: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<BillingApiResponse<PaymentMethod[]>>('/billing/payments/failed');
    return response.data.data;
  },

  retryPayment: async (paymentId: string, paymentMethodId?: string): Promise<PaymentMethod> => {
    const response = await apiClient.post<BillingApiResponse<PaymentMethod>>(`/billing/payments/${paymentId}/retry`, {
      payment_method_id: paymentMethodId
    });
    return response.data.data;
  },

  getPaymentStatus: async (paymentId: string): Promise<PaymentMethod> => {
    const response = await apiClient.get<BillingApiResponse<PaymentMethod>>(`/billing/payments/${paymentId}/status`);
    return response.data.data;
  },

  handlePaymentFailure: async (paymentId: string, options?: {
    sendNotification?: boolean;
    applyGracePeriod?: boolean;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<BillingApiResponse<{ success: boolean; message: string }>>(
      `/billing/payments/${paymentId}/handle-failure`,
      options
    );
    return response.data.data;
  }
});

export type BillingService = ReturnType<typeof createBillingService>;