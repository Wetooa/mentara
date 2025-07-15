'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { toast } from 'sonner';
import type {
  Subscription,
  SubscriptionPlan,
  PaymentMethod,
  Invoice,
  PaymentIntent,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  CreatePaymentIntentRequest,
  BillingListOptions,
  BillingPortalSession,
  BillingStats
} from '@/lib/api/services/billing';

// Query Keys
export const billingQueryKeys = {
  all: ['billing'] as const,
  subscription: () => [...billingQueryKeys.all, 'subscription'] as const,
  plans: () => [...billingQueryKeys.all, 'plans'] as const,
  plan: (id: string) => [...billingQueryKeys.plans(), id] as const,
  paymentMethods: () => [...billingQueryKeys.all, 'payment-methods'] as const,
  invoices: (options?: BillingListOptions) => [...billingQueryKeys.all, 'invoices', options] as const,
  invoice: (id: string) => [...billingQueryKeys.all, 'invoice', id] as const,
  paymentIntent: (id: string) => [...billingQueryKeys.all, 'payment-intent', id] as const,
  stats: (period: string) => [...billingQueryKeys.all, 'stats', period] as const,
};

// Subscription Hooks
export const useSubscription = () => {
  const api = useApi();
  
  return useQuery({
    queryKey: billingQueryKeys.subscription(),
    queryFn: api.billing.getSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if subscription doesn't exist
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

export const useSubscriptionPlans = () => {
  const api = useApi();
  
  return useQuery({
    queryKey: billingQueryKeys.plans(),
    queryFn: api.billing.getPlans,
    staleTime: 30 * 60 * 1000, // 30 minutes (plans don't change often)
  });
};

export const useSubscriptionPlan = (planId: string) => {
  const api = useApi();
  
  return useQuery({
    queryKey: billingQueryKeys.plan(planId),
    queryFn: () => api.billing.getPlan(planId),
    enabled: !!planId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCreateSubscription = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => api.billing.createSubscription(data),
    onSuccess: (subscription) => {
      queryClient.setQueryData(billingQueryKeys.subscription(), subscription);
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoices() });
      toast.success('Subscription created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create subscription');
    },
  });
};

export const useUpdateSubscription = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateSubscriptionRequest) => api.billing.updateSubscription(data),
    onSuccess: (subscription) => {
      queryClient.setQueryData(billingQueryKeys.subscription(), subscription);
      toast.success('Subscription updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update subscription');
    },
  });
};

export const useCancelSubscription = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (immediately: boolean = false) => api.billing.cancelSubscription(immediately),
    onSuccess: (subscription) => {
      queryClient.setQueryData(billingQueryKeys.subscription(), subscription);
      toast.success(
        subscription.cancel_at_period_end 
          ? 'Subscription will be canceled at the end of the billing period'
          : 'Subscription canceled successfully'
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel subscription');
    },
  });
};

export const useReactivateSubscription = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.billing.reactivateSubscription,
    onSuccess: (subscription) => {
      queryClient.setQueryData(billingQueryKeys.subscription(), subscription);
      toast.success('Subscription reactivated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reactivate subscription');
    },
  });
};

// Payment Methods Hooks
export const usePaymentMethods = () => {
  const api = useApi();
  
  return useQuery({
    queryKey: billingQueryKeys.paymentMethods(),
    queryFn: api.billing.getPaymentMethods,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePaymentMethod = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePaymentMethodRequest) => api.billing.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.paymentMethods() });
      toast.success('Payment method added successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add payment method');
    },
  });
};

export const useAttachPaymentMethod = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentMethodId: string) => api.billing.attachPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.paymentMethods() });
      toast.success('Payment method attached successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to attach payment method');
    },
  });
};

export const useDetachPaymentMethod = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentMethodId: string) => api.billing.detachPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.paymentMethods() });
      toast.success('Payment method removed successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove payment method');
    },
  });
};

export const useSetDefaultPaymentMethod = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentMethodId: string) => api.billing.setDefaultPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.paymentMethods() });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.subscription() });
      toast.success('Default payment method updated!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to set default payment method');
    },
  });
};

// Invoice Hooks
export const useInvoices = (options: BillingListOptions = {}) => {
  const api = useApi();
  
  return useQuery({
    queryKey: billingQueryKeys.invoices(options),
    queryFn: () => api.billing.getInvoices(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useInvoice = (invoiceId: string) => {
  const api = useApi();
  
  return useQuery({
    queryKey: billingQueryKeys.invoice(invoiceId),
    queryFn: () => api.billing.getInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDownloadInvoice = () => {
  const api = useApi();
  
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const blob = await api.billing.downloadInvoice(invoiceId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      toast.success('Invoice downloaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to download invoice');
    },
  });
};

export const usePayInvoice = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, paymentMethodId }: { invoiceId: string; paymentMethodId?: string }) =>
      api.billing.payInvoice(invoiceId, paymentMethodId),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoices() });
      queryClient.setQueryData(billingQueryKeys.invoice(invoice.id), invoice);
      toast.success('Invoice paid successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to pay invoice');
    },
  });
};

// Payment Intent Hooks (for one-time payments)
export const useCreatePaymentIntent = () => {
  const api = useApi();
  
  return useMutation({
    mutationFn: (data: CreatePaymentIntentRequest) => api.billing.createPaymentIntent(data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create payment intent');
    },
  });
};

export const useConfirmPaymentIntent = () => {
  const api = useApi();
  
  return useMutation({
    mutationFn: ({ paymentIntentId, paymentMethodId }: { paymentIntentId: string; paymentMethodId?: string }) =>
      api.billing.confirmPaymentIntent(paymentIntentId, paymentMethodId),
    onSuccess: () => {
      toast.success('Payment completed successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Payment failed');
    },
  });
};

export const usePaymentIntent = (paymentIntentId: string) => {
  const api = useApi();
  
  return useQuery({
    queryKey: billingQueryKeys.paymentIntent(paymentIntentId),
    queryFn: () => api.billing.getPaymentIntent(paymentIntentId),
    enabled: !!paymentIntentId,
    refetchInterval: (data) => {
      // Poll for status updates if payment is in progress
      const needsPolling = ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing'];
      return data?.status && needsPolling.includes(data.status) ? 2000 : false;
    },
  });
};

// Billing Portal Hook
export const useCreatePortalSession = () => {
  const api = useApi();
  
  return useMutation({
    mutationFn: (returnUrl: string) => api.billing.createPortalSession(returnUrl),
    onSuccess: (session) => {
      // Redirect to billing portal
      window.location.href = session.url;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to open billing portal');
    },
  });
};

// Coupon Hooks
export const useValidateCoupon = () => {
  const api = useApi();
  
  return useMutation({
    mutationFn: (couponCode: string) => api.billing.validateCoupon(couponCode),
  });
};

export const useApplyCoupon = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (couponCode: string) => api.billing.applyCoupon(couponCode),
    onSuccess: (result) => {
      if (result.valid) {
        queryClient.invalidateQueries({ queryKey: billingQueryKeys.subscription() });
        toast.success('Coupon applied successfully!');
      } else {
        toast.error('Invalid coupon code');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to apply coupon');
    },
  });
};

// Billing Stats Hook (for admin/analytics)
export const useBillingStats = (period: 'month' | 'quarter' | 'year' = 'month') => {
  const api = useApi();
  
  return useQuery({
    queryKey: billingQueryKeys.stats(period),
    queryFn: () => api.billing.getBillingStats(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Tax Calculation Hook
export const useCalculateTax = () => {
  const api = useApi();
  
  return useMutation({
    mutationFn: ({ amount, currency, customerLocation }: { 
      amount: number; 
      currency: string; 
      customerLocation?: string 
    }) => api.billing.calculateTax(amount, currency, customerLocation),
  });
};

// Subscription Status Helpers
export const useSubscriptionStatus = () => {
  const { data: subscription, isLoading } = useSubscription();
  
  const isActive = subscription?.status === 'active';
  const isTrial = subscription?.status === 'trialing';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';
  const willCancel = subscription?.cancel_at_period_end;
  const hasPaymentIssue = isPastDue || subscription?.status === 'incomplete';
  
  return {
    subscription,
    isLoading,
    isActive,
    isTrial,
    isPastDue,
    isCanceled,
    willCancel,
    hasPaymentIssue,
    needsPaymentMethod: !subscription?.payment_method && subscription?.status !== 'canceled',
  };
};

// Billing Summary Hook
export const useBillingSummary = () => {
  const { data: subscription } = useSubscription();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: invoices } = useInvoices({ limit: 5 });
  
  const defaultPaymentMethod = paymentMethods?.find(pm => pm.is_default);
  const unpaidInvoices = invoices?.filter(invoice => invoice.status === 'open') || [];
  const lastInvoice = invoices?.[0];
  
  return {
    subscription,
    defaultPaymentMethod,
    paymentMethods: paymentMethods || [],
    unpaidInvoices,
    lastInvoice,
    hasUnpaidInvoices: unpaidInvoices.length > 0,
    totalUnpaid: unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount_remaining, 0),
  };
};