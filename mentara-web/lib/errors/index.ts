// Standardized Error Handling System
// This module provides unified error handling across the Mentara application

// Core error handler
;

// Error types and interfaces
;

// Standardized hooks
;

;

;

;

// Error boundaries
export { 
  
  AuthErrorBoundary,
  
  
  
  
  
  
  
  
} from "../../components/errors/StandardErrorBoundary";

// Usage Examples:
//
// 1. Basic error handling:
//    const { handleError } = useStandardErrorHandler();
//    handleError(error, { context: "billing", showToast: true });
//
// 2. Standardized mutation:
//    const mutation = useBillingMutation(paymentFn, {
//      successMessage: "Payment processed successfully",
//      onSuccess: (data) => { /* handle success */ }
//    });
//
// 3. Standardized query:
//    const query = useBookingQuery(
//      ["bookings", userId],
//      () => api.bookings.list(userId),
//      { errorMessage: "Failed to load bookings" }
//    );
//
// 4. Error boundary:
//    <BillingErrorBoundary>
//      <PaymentComponent />
//    </BillingErrorBoundary>
//
// 5. Custom error boundary:
//    <StandardErrorBoundary 
//      context="billing"
//      fallbackTitle="Payment Error"
//      showRetryButton={true}
//      onRetry={retryPayment}
//    >
//      <PaymentComponent />
//    </StandardErrorBoundary>