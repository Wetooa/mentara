import { useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { useStandardErrorHandler, ErrorContext, ErrorAction } from "@/lib/errors/standardErrorHandler";
import { toast } from "sonner";

// Standardized mutation configuration
export interface StandardMutationConfig<TData, TVariables> {
  context: ErrorContext;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  errorAction?: ErrorAction;
  retryable?: boolean;
  maxRetries?: number;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: MentaraApiError, variables: TVariables) => void;
}

// Standardized mutation hook
export function useStandardMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: StandardMutationConfig<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, MentaraApiError, TVariables>, 'mutationFn' | 'onSuccess' | 'onError'>
): UseMutationResult<TData, MentaraApiError, TVariables> {
  const { handleError } = useStandardErrorHandler();

  return useMutation<TData, MentaraApiError, TVariables>({
    ...options,
    mutationFn,
    retry: config.retryable ? (config.maxRetries || 3) : false,
    onSuccess: (data, variables, context) => {
      // Show success toast if enabled
      if (config.showSuccessToast !== false && config.successMessage) {
        toast.success("Success", {
          description: config.successMessage,
          duration: 3000,
        });
      }

      // Call custom success handler
      config.onSuccess?.(data, variables);
      
      // Call original success handler if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Use standardized error handler
      handleError(error, {
        context: config.context,
        showToast: config.showErrorToast,
        customMessage: config.errorMessage,
        action: config.errorAction,
        retryable: config.retryable,
        logError: true,
      });

      // Call custom error handler
      config.onError?.(error, variables);
      
      // Call original error handler if provided
      options?.onError?.(error, variables, context);
    },
  });
}

// Specialized mutation hooks for common patterns

// Authentication mutations
export function useAuthMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "authentication",
    errorMessage: config.errorMessage || "Authentication failed. Please try again.",
  });
}

// Billing mutations
export function useBillingMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "billing",
    errorMessage: config.errorMessage || "Payment processing failed. Please check your payment details.",
    retryable: true,
    maxRetries: 2,
  });
}

// Booking mutations
export function useBookingMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "booking",
    errorMessage: config.errorMessage || "Booking operation failed. Please try again.",
    retryable: true,
    maxRetries: 3,
  });
}

// Messaging mutations
export function useMessagingMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "messaging",
    errorMessage: config.errorMessage || "Message operation failed. Please try again.",
    retryable: true,
    maxRetries: 3,
  });
}

// Community mutations
export function useCommunityMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "community",
    errorMessage: config.errorMessage || "Community operation failed. Please try again.",
    retryable: true,
    maxRetries: 2,
  });
}

// Worksheet mutations
export function useWorksheetMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "worksheets",
    errorMessage: config.errorMessage || "Worksheet operation failed. Please try again.",
    retryable: true,
    maxRetries: 3,
  });
}

// File upload mutations
export function useFileUploadMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "file_upload",
    errorMessage: config.errorMessage || "File upload failed. Please check your file and try again.",
    retryable: true,
    maxRetries: 2,
  });
}

// Profile mutations
export function useProfileMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "profile",
    errorMessage: config.errorMessage || "Profile update failed. Please try again.",
    retryable: true,
    maxRetries: 3,
  });
}

// Admin mutations
export function useAdminMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "admin",
    errorMessage: config.errorMessage || "Admin operation failed. Please try again.",
    retryable: false, // Admin operations should not auto-retry
  });
}

// Meeting mutations
export function useMeetingMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: Omit<StandardMutationConfig<TData, TVariables>, 'context'> = {}
) {
  return useStandardMutation(mutationFn, {
    ...config,
    context: "meeting",
    errorMessage: config.errorMessage || "Meeting operation failed. Please try again.",
    retryable: true,
    maxRetries: 2,
  });
}