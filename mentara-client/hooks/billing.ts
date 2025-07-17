"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

// Types for billing operations
export interface Subscription {
  id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "incomplete_expired";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  plan: {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    interval: "month" | "year";
    interval_count: number;
    features: string[];
    is_popular?: boolean;
  };
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_account";
  is_default: boolean;
  created_at: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: string;
  };
  bank_account?: {
    bank_name: string;
    last4: string;
    account_type: string;
    routing_number: string;
  };
}

export interface Invoice {
  id: string;
  number: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  amount_due: number;
  amount_paid: number;
  currency: string;
  created_at: string;
  due_date?: string;
  paid_at?: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  description?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  interval_count: number;
  features: string[];
  is_popular?: boolean;
  trial_period_days?: number;
}

export interface CreatePaymentMethodDto {
  id: string;
  type: "card" | "bank_account";
  billing_details?: {
    name: string;
    email?: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  card?: any;
  bank_account?: {
    account_number: string;
    routing_number: string;
    account_type: "checking" | "savings";
  };
}

// Subscription hooks
export function useSubscriptionStatus() {
  const api = useApi();
  
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: queryKeys.billing.subscription(),
    queryFn: () => api.billing.getSubscription(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    subscription,
    isLoading,
    error,
    isActive: subscription?.status === "active",
    isPastDue: subscription?.status === "past_due",
    isCanceled: subscription?.status === "canceled",
    willCancel: subscription?.cancel_at_period_end,
    hasPaymentIssue: subscription?.status === "past_due" || subscription?.status === "incomplete",
  };
}

export function useSubscriptionPlans() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.billing.plans(),
    queryFn: () => api.billing.getPlans(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCreateSubscription() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { planId: string; paymentMethodId?: string; trialDays?: number }) =>
      api.billing.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
      toast.success("Subscription created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create subscription");
    },
  });
}

export function useCancelSubscription() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (immediately: boolean = false) =>
      api.billing.cancelSubscription({ immediately }),
    onSuccess: (_, immediately) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
      toast.success(
        immediately
          ? "Subscription canceled immediately"
          : "Subscription will cancel at the end of the billing period"
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel subscription");
    },
  });
}

export function useReactivateSubscription() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.billing.reactivateSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
      toast.success("Subscription reactivated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reactivate subscription");
    },
  });
}

export function useUpdateSubscription() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { planId: string; prorationBehavior?: "create_prorations" | "none" }) =>
      api.billing.updateSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
      toast.success("Subscription updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update subscription");
    },
  });
}

// Payment method hooks
export function usePaymentMethods() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.billing.paymentMethods(),
    queryFn: () => api.billing.getPaymentMethods(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreatePaymentMethod() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CreatePaymentMethodDto, "id">) =>
      api.billing.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.paymentMethods() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add payment method");
    },
  });
}

export function useDetachPaymentMethod() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      api.billing.detachPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.paymentMethods() });
      toast.success("Payment method removed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to remove payment method");
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      api.billing.setDefaultPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.paymentMethods() });
      toast.success("Default payment method updated");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update default payment method");
    },
  });
}

// Invoice hooks
export function useInvoices(options?: { limit?: number; status?: string }) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.billing.invoices(options),
    queryFn: () => api.billing.getInvoices(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useInvoice(invoiceId: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.billing.invoice(invoiceId),
    queryFn: () => api.billing.getInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePayInvoice() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { invoiceId: string; paymentMethodId?: string }) =>
      api.billing.payInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.invoices() });
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
      toast.success("Invoice paid successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to pay invoice");
    },
  });
}

export function useDownloadInvoice() {
  const api = useApi();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await api.billing.downloadInvoice(invoiceId);
      
      // Create a blob and download the file
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      toast.success("Invoice downloaded successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to download invoice");
    },
  });
}

// Billing portal hook
export function useCreatePortalSession() {
  const api = useApi();

  return useMutation({
    mutationFn: async (returnUrl: string) => {
      const response = await api.billing.createPortalSession({ returnUrl });
      
      // Redirect to the portal URL
      if (response.url) {
        window.location.href = response.url;
      }
      
      return response;
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to open billing portal");
    },
  });
}

// Combined billing summary hook
export function useBillingSummary() {
  const { data: paymentMethods } = usePaymentMethods();
  const { data: invoices } = useInvoices({ status: "open" });
  
  const defaultPaymentMethod = paymentMethods?.find(pm => pm.is_default);
  const unpaidInvoices = invoices?.filter(invoice => invoice.status === "open") || [];
  const hasUnpaidInvoices = unpaidInvoices.length > 0;
  const totalUnpaid = unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount_due, 0);

  return {
    defaultPaymentMethod,
    unpaidInvoices,
    hasUnpaidInvoices,
    totalUnpaid,
  };
}

// Usage analytics for billing
export function useBillingUsage() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.billing.usage(),
    queryFn: () => api.billing.getUsage(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Promo code hooks
export function useApplyPromoCode() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promoCode: string) => api.billing.applyPromoCode({ code: promoCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
      toast.success("Promo code applied successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Invalid or expired promo code");
    },
  });
}

// Subscription preview hook (for plan changes)
export function useSubscriptionPreview() {
  const api = useApi();

  return useMutation({
    mutationFn: (data: { planId: string; prorationBehavior?: string }) =>
      api.billing.previewSubscriptionChange(data),
    onError: (error: any) => {
      toast.error(error?.message || "Failed to preview subscription change");
    },
  });
}