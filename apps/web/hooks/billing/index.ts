// Main billing hooks exports
export {
  // Query Keys
  billingQueryKeys,
  
  // Subscription Hooks
  useSubscription,
  useSubscriptionPlans,
  useSubscriptionPlan,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
  useReactivateSubscription,
  useSubscriptionPreview,
  
  // Payment Method Hooks
  usePaymentMethods,
  useCreatePaymentMethod,
  useAttachPaymentMethod,
  useDetachPaymentMethod,
  useSetDefaultPaymentMethod,
  useVerifyInsurance,
  
  // Invoice Hooks
  useInvoices,
  useInvoice,
  useDownloadInvoice,
  usePayInvoice,
  
  // Payment Intent Hooks (One-time payments)
  useCreatePaymentIntent,
  useConfirmPaymentIntent,
  usePaymentIntent,
  
  // Billing Portal
  useCreatePortalSession,
  
  // Coupons
  useValidateCoupon,
  useApplyCoupon,
  
  // Analytics & Stats
  useBillingStats,
  
  // Tax Calculations
  useCalculateTax,
  
  // Helper Hooks
  useSubscriptionStatus,
  useBillingSummary,
} from './useBilling';

// Re-export billing types for convenience
export type {
  Subscription,
  SubscriptionPlan,
  PaymentMethod,
  Invoice,
  PaymentIntent,
  BillingPortalSession,
  BillingStats,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  CreatePaymentIntentRequest,
  BillingListOptions,
} from '@/lib/api/services/billing';