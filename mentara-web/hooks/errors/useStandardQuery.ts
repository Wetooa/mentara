import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { useStandardErrorHandler, ErrorContext, ErrorAction } from "@/lib/errors/standardErrorHandler";

// Standardized query configuration
export interface StandardQueryConfig<TData> {
  context: ErrorContext;
  errorMessage?: string;
  showErrorToast?: boolean;
  showErrorBoundary?: boolean;
  errorAction?: ErrorAction;
  retryable?: boolean;
  maxRetries?: number;
  silentError?: boolean; // Don't show error to user, just log
  onError?: (error: MentaraApiError) => void;
}

// Standardized query hook
export function useStandardQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: StandardQueryConfig<TData> = { context: "generic" },
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
): UseQueryResult<TData, MentaraApiError> {
  const { handleError } = useStandardErrorHandler();

  return useQuery<TData, MentaraApiError>({
    ...options,
    queryKey,
    queryFn,
    retry: config.retryable !== false ? (config.maxRetries || 3) : false,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    onError: (error) => {
      // Skip error handling for silent errors
      if (config.silentError) {
        console.warn("Silent error in query:", error);
        return;
      }

      // Use standardized error handler
      handleError(error, {
        context: config.context,
        showToast: config.showErrorToast,
        showBoundary: config.showErrorBoundary,
        customMessage: config.errorMessage,
        action: config.errorAction,
        retryable: config.retryable,
        logError: true,
      });

      // Call custom error handler
      config.onError?.(error);
      
      // Call original error handler if provided
      options?.onError?.(error);
    },
  });
}

// Specialized query hooks for common patterns

// Authentication queries
export function useAuthQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "authentication",
    errorMessage: config.errorMessage || "Failed to authenticate. Please sign in again.",
    retryable: false, // Auth queries should not auto-retry
  }, options);
}

// Billing queries
export function useBillingQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "billing",
    errorMessage: config.errorMessage || "Failed to load billing information. Please try again.",
    retryable: true,
    maxRetries: 2,
  }, options);
}

// Booking queries
export function useBookingQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "booking",
    errorMessage: config.errorMessage || "Failed to load booking information. Please try again.",
    retryable: true,
    maxRetries: 3,
  }, options);
}

// Messaging queries
export function useMessagingQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "messaging",
    errorMessage: config.errorMessage || "Failed to load messages. Please try again.",
    retryable: true,
    maxRetries: 3,
  }, options);
}

// Community queries
export function useCommunityQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "community",
    errorMessage: config.errorMessage || "Failed to load community content. Please try again.",
    retryable: true,
    maxRetries: 2,
  }, options);
}

// Worksheet queries
export function useWorksheetQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "worksheets",
    errorMessage: config.errorMessage || "Failed to load worksheet. Please try again.",
    retryable: true,
    maxRetries: 3,
  }, options);
}

// Profile queries
export function useProfileQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "profile",
    errorMessage: config.errorMessage || "Failed to load profile information. Please try again.",
    retryable: true,
    maxRetries: 2,
  }, options);
}

// Admin queries
export function useAdminQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "admin",
    errorMessage: config.errorMessage || "Failed to load admin data. Please try again.",
    retryable: true,
    maxRetries: 2,
  }, options);
}

// Meeting queries
export function useMeetingQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "meeting",
    errorMessage: config.errorMessage || "Failed to load meeting information. Please try again.",
    retryable: true,
    maxRetries: 2,
  }, options);
}

// Therapist queries
export function useTherapistQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "therapist",
    errorMessage: config.errorMessage || "Failed to load therapist information. Please try again.",
    retryable: true,
    maxRetries: 2,
  }, options);
}

// File upload queries
export function useFileQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "file_upload",
    errorMessage: config.errorMessage || "Failed to load file. Please try again.",
    retryable: true,
    maxRetries: 2,
  }, options);
}

// Notification queries
export function useNotificationQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  config: Omit<StandardQueryConfig<TData>, 'context'> = {},
  options?: Omit<UseQueryOptions<TData, MentaraApiError>, 'queryKey' | 'queryFn' | 'onError'>
) {
  return useStandardQuery(queryKey, queryFn, {
    ...config,
    context: "notification",
    errorMessage: config.errorMessage || "Failed to load notifications. Please try again.",
    retryable: true,
    maxRetries: 2,
    silentError: true, // Notifications can fail silently
  }, options);
}