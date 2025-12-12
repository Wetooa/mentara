"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { useBillingQuery } from "@/hooks/errors/useStandardQuery";
import { useBillingMutation } from "@/hooks/errors/useStandardMutation";
import { toast } from "sonner";
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
  BillingStats,
} from "@/lib/api/services/billing";

// Use centralized query keys (for backward compatibility, keep local alias)
const billingQueryKeys = {
  all: queryKeys.billing.all,
  subscription: queryKeys.billing.subscription,
  plans: () => [...queryKeys.billing.all, "plans"] as const,
  plan: (id: string) => [...queryKeys.billing.all, "plans", id] as const,
  paymentMethods: queryKeys.billing.paymentMethods,
  invoices: queryKeys.billing.invoices,
  invoice: (id: string) => [...queryKeys.billing.all, "invoice", id] as const,
  paymentIntent: (id: string) =>
    [...queryKeys.billing.all, "payment-intent", id] as const,
  stats: queryKeys.billing.stats,
};

// Subscription Hooks
export const useSubscription = () => {
  const api = useApi();

  // return useBillingQuery(
  //   billingQueryKeys.subscription(),
  //   api.billing.getSubscription,
  //   {
  //     errorMessage: "Failed to load subscription information",
  //     silentError: false,
  //   },
  //   {
  //     staleTime: 5 * 60 * 1000, // 5 minutes
  //     retry: (failureCount, error) => {
  //       // Don't retry if subscription doesn't exist
  //       if (error?.status === 404) return false;
  //       return failureCount < 2;
  //     },
  //   }
  // );
};

export const useSubscriptionPlans = () => {
  const api = useApi();

  return useBillingQuery(
    billingQueryKeys.plans(),
    api.billing.getPlans,
    {
      errorMessage: "Failed to load subscription plans",
    },
    {
      staleTime: STALE_TIME.STATIC, // 30 minutes
      gcTime: GC_TIME.EXTENDED, // 1 hour
      refetchOnWindowFocus: false,
    }
  );
};

export const useSubscriptionPlan = (planId: string) => {
  const api = useApi();

  return useQuery({
    queryKey: billingQueryKeys.plan(planId),
    queryFn: () => api.billing.getPlan(planId),
    enabled: !!planId,
    staleTime: STALE_TIME.STATIC, // 30 minutes
    gcTime: GC_TIME.EXTENDED, // 1 hour
    refetchOnWindowFocus: false,
  });
};

export const useCreateSubscription = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(
    (data: CreateSubscriptionRequest) => api.billing.createSubscription(data),
    {
      successMessage: "Subscription created successfully!",
      errorMessage: "Failed to create subscription",
      onSuccess: (subscription) => {
        queryClient.setQueryData(billingQueryKeys.subscription(), subscription);
        queryClient.invalidateQueries({
          queryKey: billingQueryKeys.invoices(),
        });
      },
    }
  );
};

export const useUpdateSubscription = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(
    (data: UpdateSubscriptionRequest) => api.billing.updateSubscription(data),
    {
      successMessage: "Subscription updated successfully!",
      errorMessage: "Failed to update subscription",
      onSuccess: (subscription) => {
        queryClient.setQueryData(billingQueryKeys.subscription(), subscription);
      },
    }
  );
};

export const useCancelSubscription = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(
    (immediately: boolean = false) =>
      api.billing.cancelSubscription(immediately),
    {
      errorMessage: "Failed to cancel subscription",
      showSuccessToast: false, // Custom success message
      onSuccess: (subscription) => {
        queryClient.setQueryData(billingQueryKeys.subscription(), subscription);
        toast.success(
          subscription.cancel_at_period_end
            ? "Subscription will be canceled at the end of the billing period"
            : "Subscription canceled successfully"
        );
      },
    }
  );
};

export const useReactivateSubscription = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(api.billing.reactivateSubscription, {
    successMessage: "Subscription reactivated successfully!",
    errorMessage: "Failed to reactivate subscription",
    onSuccess: (subscription) => {
      queryClient.setQueryData(billingQueryKeys.subscription(), subscription);
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

  return useBillingMutation(
    (data: CreatePaymentMethodRequest) => api.billing.createPaymentMethod(data),
    {
      successMessage: "Payment method added successfully!",
      errorMessage: "Failed to add payment method",
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: billingQueryKeys.paymentMethods(),
        });
      },
    }
  );
};

export const useAttachPaymentMethod = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(
    (paymentMethodId: string) =>
      api.billing.attachPaymentMethod(paymentMethodId),
    {
      successMessage: "Payment method attached successfully!",
      errorMessage: "Failed to attach payment method",
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: billingQueryKeys.paymentMethods(),
        });
      },
    }
  );
};

export const useDetachPaymentMethod = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(
    (paymentMethodId: string) =>
      api.billing.detachPaymentMethod(paymentMethodId),
    {
      successMessage: "Payment method removed successfully!",
      errorMessage: "Failed to remove payment method",
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: billingQueryKeys.paymentMethods(),
        });
      },
    }
  );
};

export const useSetDefaultPaymentMethod = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(
    (paymentMethodId: string) =>
      api.billing.setDefaultPaymentMethod(paymentMethodId),
    {
      successMessage: "Default payment method updated!",
      errorMessage: "Failed to set default payment method",
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: billingQueryKeys.paymentMethods(),
        });
        queryClient.invalidateQueries({
          queryKey: billingQueryKeys.subscription(),
        });
      },
    }
  );
};

export const useVerifyInsurance = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(
    (paymentMethodId: string) => api.billing.verifyInsurance(paymentMethodId),
    {
      successMessage: "Insurance verified successfully!",
      errorMessage: "Failed to verify insurance",
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: billingQueryKeys.paymentMethods(),
        });
      },
    }
  );
};

// Invoice Hooks
export const useInvoices = (options: BillingListOptions = {}) => {
  const api = useApi();

  return useBillingQuery(
    billingQueryKeys.invoices(options),
    () => api.billing.getInvoices(options),
    {
      errorMessage: "Failed to load invoices",
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
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

  return useBillingMutation(
    async (invoiceId: string) => {
      const blob = await api.billing.downloadInvoice(invoiceId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    {
      successMessage: "Invoice downloaded successfully!",
      errorMessage: "Failed to download invoice",
    }
  );
};

export const usePayInvoice = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(
    ({
      invoiceId,
      paymentMethodId,
    }: {
      invoiceId: string;
      paymentMethodId?: string;
    }) => api.billing.payInvoice(invoiceId, paymentMethodId),
    {
      successMessage: "Invoice paid successfully!",
      errorMessage: "Failed to pay invoice",
      onSuccess: (invoice) => {
        queryClient.invalidateQueries({
          queryKey: billingQueryKeys.invoices(),
        });
        queryClient.setQueryData(billingQueryKeys.invoice(invoice.id), invoice);
      },
    }
  );
};

// Payment Intent Hooks (for one-time payments)
export const useCreatePaymentIntent = () => {
  const api = useApi();

  return useBillingMutation(
    (data: CreatePaymentIntentRequest) => api.billing.createPaymentIntent(data),
    {
      errorMessage: "Failed to create payment intent",
      showSuccessToast: false, // No success toast for payment intents
    }
  );
};

export const useConfirmPaymentIntent = () => {
  const api = useApi();

  return useBillingMutation(
    ({
      paymentIntentId,
      paymentMethodId,
    }: {
      paymentIntentId: string;
      paymentMethodId?: string;
    }) => api.billing.confirmPaymentIntent(paymentIntentId, paymentMethodId),
    {
      successMessage: "Payment completed successfully!",
      errorMessage: "Payment failed",
    }
  );
};

export const usePaymentIntent = (paymentIntentId: string) => {
  const api = useApi();

  return useQuery({
    queryKey: billingQueryKeys.paymentIntent(paymentIntentId),
    queryFn: () => api.billing.getPaymentIntent(paymentIntentId),
    enabled: !!paymentIntentId,
    refetchInterval: (data) => {
      // Poll for status updates if payment is in progress
      const needsPolling = [
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
        "processing",
      ];
      return data?.status && needsPolling.includes(data.status) ? 2000 : false;
    },
  });
};

// Billing Portal Hook
export const useCreatePortalSession = () => {
  const api = useApi();

  return useBillingMutation(
    (returnUrl: string) => api.billing.createPortalSession(returnUrl),
    {
      errorMessage: "Failed to open billing portal",
      showSuccessToast: false, // No success toast since we're redirecting
      onSuccess: (session) => {
        // Redirect to billing portal
        window.location.href = session.url;
      },
    }
  );
};

// Coupon Hooks
export const useValidateCoupon = () => {
  const api = useApi();

  return useBillingMutation(
    (couponCode: string) => api.billing.validateCoupon(couponCode),
    {
      showSuccessToast: false,
      showErrorToast: false,
    }
  );
};

export const useApplyCoupon = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useBillingMutation(
    (couponCode: string) => api.billing.applyCoupon(couponCode),
    {
      errorMessage: "Failed to apply coupon",
      showSuccessToast: false, // Custom success handling
      onSuccess: (result) => {
        if (result.valid) {
          queryClient.invalidateQueries({
            queryKey: billingQueryKeys.subscription(),
          });
          toast.success("Coupon applied successfully!");
        } else {
          toast.error("Invalid coupon code");
        }
      },
    }
  );
};

// Billing Stats Hook (for admin/analytics)
export const useBillingStats = (
  period: "month" | "quarter" | "year" = "month"
) => {
  const api = useApi();

  return useBillingQuery(
    billingQueryKeys.stats(period),
    () => api.billing.getBillingStats(period),
    {
      errorMessage: "Failed to load billing statistics",
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

// Tax Calculation Hook
export const useCalculateTax = () => {
  const api = useApi();

  return useBillingMutation(
    ({
      amount,
      currency,
      customerLocation,
    }: {
      amount: number;
      currency: string;
      customerLocation?: string;
    }) => api.billing.calculateTax(amount, currency, customerLocation),
    {
      errorMessage: "Failed to calculate tax",
      showSuccessToast: false, // Tax calculation doesn't need success toast
    }
  );
};

// Subscription Status Helpers
export const useSubscriptionStatus = () => {
  const { data: subscription, isLoading } = useSubscription();

  const isActive = subscription?.status === "active";
  const isTrial = subscription?.status === "trialing";
  const isPastDue = subscription?.status === "past_due";
  const isCanceled = subscription?.status === "canceled";
  const willCancel = subscription?.cancel_at_period_end;
  const hasPaymentIssue = isPastDue || subscription?.status === "incomplete";

  return {
    subscription,
    isLoading,
    isActive,
    isTrial,
    isPastDue,
    isCanceled,
    willCancel,
    hasPaymentIssue,
    needsPaymentMethod:
      !subscription?.payment_method && subscription?.status !== "canceled",
  };
};

// Billing Summary Hook
export const useBillingSummary = () => {
  const { data: subscription } = useSubscription();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: invoices } = useInvoices({ limit: 5 });

  const defaultPaymentMethod = paymentMethods?.find((pm) => pm.is_default);
  const unpaidInvoices =
    invoices?.filter((invoice) => invoice.status === "open") || [];
  const lastInvoice = invoices?.[0];

  return {
    subscription,
    defaultPaymentMethod,
    paymentMethods: paymentMethods || [],
    unpaidInvoices,
    lastInvoice,
    hasUnpaidInvoices: unpaidInvoices.length > 0,
    totalUnpaid: unpaidInvoices.reduce(
      (sum, invoice) => sum + invoice.amount_remaining,
      0
    ),
  };
};

// Subscription Preview Hook (for previewing subscription changes)
export const useSubscriptionPreview = () => {
  const api = useApi();

  return useBillingMutation(
    (data: { planId: string; prorationBehavior?: string }) => {
      // TODO: Implement preview endpoint when available
      // For now, return a promise that resolves with mock data
      return Promise.resolve({
        amount: 0,
        currency: "usd",
        proration: 0,
      });
    },
    {
      errorMessage: "Failed to preview subscription changes",
      showSuccessToast: false,
    }
  );
};

// Export billingQueryKeys for external use
export { billingQueryKeys };
