// Standardized Error Handling System
// This module provides unified error handling across the Mentara application

// Core error handler
export { 
  StandardErrorHandler, 
  handleError, 
  useStandardErrorHandler 
} from "./standardErrorHandler";

// Error types and interfaces
export type { 
  ErrorContext, 
  ErrorSeverity, 
  ErrorAction, 
  ErrorHandlerConfig 
} from "./standardErrorHandler";

// Standardized hooks
export { 
  useStandardMutation,
  useAuthMutation,
  useBillingMutation,
  useBookingMutation,
  useMessagingMutation,
  useCommunityMutation,
  useWorksheetMutation,
  useFileUploadMutation,
  useProfileMutation,
  useAdminMutation,
  useMeetingMutation,
} from "../hooks/errors/useStandardMutation";

export type { 
  StandardMutationConfig 
} from "../hooks/errors/useStandardMutation";

export { 
  useStandardQuery,
  useAuthQuery,
  useBillingQuery,
  useBookingQuery,
  useMessagingQuery,
  useCommunityQuery,
  useWorksheetQuery,
  useProfileQuery,
  useAdminQuery,
  useMeetingQuery,
  useTherapistQuery,
  useFileQuery,
  useNotificationQuery,
} from "../hooks/errors/useStandardQuery";

export type { 
  StandardQueryConfig 
} from "../hooks/errors/useStandardQuery";

// Error boundaries
export { 
  StandardErrorBoundary,
  AuthErrorBoundary,
  BillingErrorBoundary,
  BookingErrorBoundary,
  MessagingErrorBoundary,
  CommunityErrorBoundary,
  WorksheetErrorBoundary,
  MeetingErrorBoundary,
  AdminErrorBoundary,
  GenericErrorBoundary,
} from "../components/errors/StandardErrorBoundary";

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