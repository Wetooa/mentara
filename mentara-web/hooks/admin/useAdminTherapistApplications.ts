/**
 * Admin Therapist Application Management Hooks
 * 
 * This module provides a comprehensive set of React Query hooks for managing
 * therapist applications in the admin panel. All hooks are synchronized with
 * the backend AdminTherapistController and implement modern patterns including
 * optimistic updates, proper error handling, and intelligent caching.
 * 
 * Key Features:
 * - Query hooks for fetching applications, details, and metrics
 * - Mutation hooks with optimistic updates and rollback
 * - Bulk operations for efficient batch processing
 * - Query key factory for consistent cache management
 * - Comprehensive error handling with typed responses
 * - Toast notifications for user feedback
 * 
 * Query Hooks:
 * - usePendingTherapistApplications: Fetch pending applications with filters
 * - useAllTherapistApplications: Fetch all applications regardless of status
 * - useTherapistApplicationDetails: Fetch detailed application information
 * - useTherapistApplicationMetrics: Fetch application metrics and statistics
 * 
 * Mutation Hooks:
 * - useApproveTherapist: Approve individual therapist applications
 * - useRejectTherapist: Reject individual therapist applications
 * - useUpdateTherapistStatus: Update therapist status (suspend, reactivate, etc.)
 * - useBulkApproveTherapists: Bulk approve multiple applications
 * - useBulkRejectTherapists: Bulk reject multiple applications
 * 
 * Usage Example:
 * ```typescript
 * const { data: applications, isLoading } = usePendingTherapistApplications({
 *   status: 'pending',
 *   limit: 50
 * });
 * 
 * const approveMutation = useApproveTherapist();
 * approveMutation.mutate({
 *   therapistId: '123',
 *   data: { approvalMessage: 'Application approved' }
 * });
 * ```
 * 
 * @version 2.0.0
 * @lastUpdated 2025-01-22 - Full type synchronization and optimistic updates
 * @maintainer Frontend Architecture Team
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME, REFETCH_INTERVAL } from "@/lib/constants/react-query";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { toast } from "sonner";
import type {
  PendingTherapistFiltersDto,
  ApproveTherapistDto,
  RejectTherapistDto,
  UpdateTherapistStatusDto,
  TherapistListResponse,
  TherapistApplicationDetailsResponse,
  TherapistActionResponse,
  TherapistApplicationMetricsResponse,
  TherapistApplication,
} from "@/types/api/admin";

// =============================
// QUERY KEY FACTORY (use centralized keys)
// =============================

// Use centralized query keys for consistency
const getAdminTherapistQueryKeys = () => ({
  all: queryKeys.admin.therapistApplications.list(),
  applications: (filters?: PendingTherapistFiltersDto) => 
    queryKeys.admin.therapistApplications.list(filters),
  pending: (filters?: PendingTherapistFiltersDto) => 
    [...queryKeys.admin.therapistApplications.list(), 'pending', filters] as const,
  details: (id: string) => 
    queryKeys.admin.therapistApplications.byId(id),
  metrics: (startDate?: string, endDate?: string) => 
    [...queryKeys.admin.therapistApplications.list(), 'metrics', { startDate, endDate }] as const,
});

export const adminTherapistQueryKeys = getAdminTherapistQueryKeys();

// =============================
// QUERY HOOKS
// =============================

/**
 * Get pending therapist applications with filters and proper error handling
 */
export function usePendingTherapistApplications(
  filters?: PendingTherapistFiltersDto,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) {
  const api = useApi();

  return useQuery({
    queryKey: adminTherapistQueryKeys.pending(filters),
    queryFn: () => api.admin.getPendingTherapistApplications(filters),
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval ?? REFETCH_INTERVAL.OCCASIONAL, // 15 minutes (default)
    staleTime: options?.staleTime ?? STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof MentaraApiError && 
          (error.status === 401 || error.status === 403)) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

/**
 * Get all therapist applications (not just pending)
 */
export function useAllTherapistApplications(
  filters?: PendingTherapistFiltersDto,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) {
  const api = useApi();

  return useQuery({
    queryKey: adminTherapistQueryKeys.applications(filters),
    queryFn: () => api.admin.getAllTherapistApplications(filters),
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval ?? 30000,
    staleTime: options?.staleTime ?? STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof MentaraApiError && 
          (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Get detailed therapist application by ID
 */
export function useTherapistApplicationDetails(
  applicationId: string | null,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const api = useApi();

  return useQuery({
    queryKey: adminTherapistQueryKeys.details(applicationId || ''),
    queryFn: () => api.admin.getTherapistApplicationDetails(applicationId!),
    enabled: !!applicationId && (options?.enabled !== false),
    staleTime: options?.staleTime ?? STALE_TIME.VERY_LONG, // 15 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 404 or auth errors
      if (error instanceof MentaraApiError && 
          [401, 403, 404].includes(error.status)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Get therapist application metrics
 */
export function useTherapistApplicationMetrics(
  startDate?: string,
  endDate?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) {
  const api = useApi();

  return useQuery({
    queryKey: adminTherapistQueryKeys.metrics(startDate, endDate),
    queryFn: () => api.admin.getTherapistApplicationMetrics(startDate, endDate),
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval ?? REFETCH_INTERVAL.MODERATE, // 5 minutes
    staleTime: options?.staleTime ?? STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof MentaraApiError && 
          (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// =============================
// MUTATION HOOKS
// =============================

/**
 * Approve therapist application with optimistic updates
 */
export function useApproveTherapist() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      therapistId,
      data,
    }: {
      therapistId: string;
      data: ApproveTherapistDto;
    }) => api.admin.approveTherapist(therapistId, data),

    onMutate: async ({ therapistId }) => {
      // Cancel outgoing refetches to prevent optimistic update conflicts
      await queryClient.cancelQueries({ 
        queryKey: adminTherapistQueryKeys.all 
      });

      // Snapshot previous values for rollback
      const previousPending = queryClient.getQueryData(
        adminTherapistQueryKeys.pending()
      );
      const previousAll = queryClient.getQueryData(
        adminTherapistQueryKeys.applications()
      );

      // Optimistically update to approved status
      const updateApplication = (old: TherapistListResponse | undefined) => {
        if (!old?.therapists) return old;
        return {
          ...old,
          therapists: old.therapists.map((app: TherapistApplication) =>
            app.userId === therapistId
              ? { 
                  ...app, 
                  status: "APPROVED" as const, 
                  processingDate: new Date().toISOString() 
                }
              : app
          ),
        };
      };

      // Apply optimistic updates to all relevant queries
      queryClient.setQueryData(adminTherapistQueryKeys.pending(), updateApplication);
      queryClient.setQueryData(adminTherapistQueryKeys.applications(), updateApplication);

      return { previousPending, previousAll, therapistId };
    },

    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousPending) {
        queryClient.setQueryData(
          adminTherapistQueryKeys.pending(),
          context.previousPending
        );
      }
      if (context?.previousAll) {
        queryClient.setQueryData(
          adminTherapistQueryKeys.applications(),
          context.previousAll
        );
      }

      // Show error toast with specific message
      const errorMessage = error instanceof MentaraApiError 
        ? error.message 
        : "Failed to approve therapist application";
      toast.error(errorMessage);
    },

    onSuccess: (data, variables) => {
      // Invalidate and refetch all therapist queries
      queryClient.invalidateQueries({ 
        queryKey: adminTherapistQueryKeys.all 
      });
      
      // Show success toast
      toast.success("Therapist application approved successfully");
    },
  });
}

/**
 * Reject therapist application with optimistic updates
 */
export function useRejectTherapist() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      therapistId,
      data,
    }: {
      therapistId: string;
      data: RejectTherapistDto;
    }) => api.admin.rejectTherapist(therapistId, data),

    onMutate: async ({ therapistId }) => {
      await queryClient.cancelQueries({ 
        queryKey: adminTherapistQueryKeys.all 
      });

      const previousPending = queryClient.getQueryData(
        adminTherapistQueryKeys.pending()
      );
      const previousAll = queryClient.getQueryData(
        adminTherapistQueryKeys.applications()
      );

      const updateApplication = (old: TherapistListResponse | undefined) => {
        if (!old?.therapists) return old;
        return {
          ...old,
          therapists: old.therapists.map((app: TherapistApplication) =>
            app.userId === therapistId
              ? { 
                  ...app, 
                  status: "REJECTED" as const, 
                  processingDate: new Date().toISOString() 
                }
              : app
          ),
        };
      };

      queryClient.setQueryData(adminTherapistQueryKeys.pending(), updateApplication);
      queryClient.setQueryData(adminTherapistQueryKeys.applications(), updateApplication);

      return { previousPending, previousAll, therapistId };
    },

    onError: (error, variables, context) => {
      if (context?.previousPending) {
        queryClient.setQueryData(
          adminTherapistQueryKeys.pending(),
          context.previousPending
        );
      }
      if (context?.previousAll) {
        queryClient.setQueryData(
          adminTherapistQueryKeys.applications(),
          context.previousAll
        );
      }

      const errorMessage = error instanceof MentaraApiError 
        ? error.message 
        : "Failed to reject therapist application";
      toast.error(errorMessage);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: adminTherapistQueryKeys.all 
      });
      toast.success("Therapist application rejected");
    },
  });
}

/**
 * Update therapist status (including suspension) with optimistic updates
 */
export function useUpdateTherapistStatus() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      therapistId,
      data,
    }: {
      therapistId: string;
      data: UpdateTherapistStatusDto;
    }) => api.admin.updateTherapistStatus(therapistId, data),

    onMutate: async ({ therapistId, data }) => {
      await queryClient.cancelQueries({ 
        queryKey: adminTherapistQueryKeys.all 
      });

      const previousPending = queryClient.getQueryData(
        adminTherapistQueryKeys.pending()
      );
      const previousAll = queryClient.getQueryData(
        adminTherapistQueryKeys.applications()
      );

      const updateApplication = (old: TherapistListResponse | undefined) => {
        if (!old?.therapists) return old;
        return {
          ...old,
          therapists: old.therapists.map((app: TherapistApplication) =>
            app.userId === therapistId
              ? { 
                  ...app, 
                  status: data.status, 
                  processingDate: new Date().toISOString() 
                }
              : app
          ),
        };
      };

      queryClient.setQueryData(adminTherapistQueryKeys.pending(), updateApplication);
      queryClient.setQueryData(adminTherapistQueryKeys.applications(), updateApplication);

      return { previousPending, previousAll, therapistId, newStatus: data.status };
    },

    onError: (error, variables, context) => {
      if (context?.previousPending) {
        queryClient.setQueryData(
          adminTherapistQueryKeys.pending(),
          context.previousPending
        );
      }
      if (context?.previousAll) {
        queryClient.setQueryData(
          adminTherapistQueryKeys.applications(),
          context.previousAll
        );
      }

      const errorMessage = error instanceof MentaraApiError 
        ? error.message 
        : "Failed to update therapist status";
      toast.error(errorMessage);
    },

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ 
        queryKey: adminTherapistQueryKeys.all 
      });
      toast.success(`Therapist status updated to ${context?.newStatus}`);
    },
  });
}

// =============================
// BULK OPERATIONS
// =============================

/**
 * Bulk approve multiple therapist applications
 */
export function useBulkApproveTherapists() {
  const approveTherapist = useApproveTherapist();
  
  return useMutation({
    mutationFn: async ({
      therapistIds,
      data,
    }: {
      therapistIds: string[];
      data: ApproveTherapistDto;
    }) => {
      // Execute all approvals in parallel
      const promises = therapistIds.map(therapistId =>
        approveTherapist.mutateAsync({ therapistId, data })
      );
      
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return { successful, failed, total: therapistIds.length };
    },

    onSuccess: ({ successful, failed, total }) => {
      if (failed === 0) {
        toast.success(`Successfully approved ${successful} therapist applications`);
      } else {
        toast.warning(`Approved ${successful} applications, ${failed} failed out of ${total}`);
      }
    },

    onError: (error) => {
      const errorMessage = error instanceof MentaraApiError 
        ? error.message 
        : "Bulk approval operation failed";
      toast.error(errorMessage);
    },
  });
}

/**
 * Bulk reject multiple therapist applications
 */
export function useBulkRejectTherapists() {
  const rejectTherapist = useRejectTherapist();
  
  return useMutation({
    mutationFn: async ({
      therapistIds,
      data,
    }: {
      therapistIds: string[];
      data: RejectTherapistDto;
    }) => {
      const promises = therapistIds.map(therapistId =>
        rejectTherapist.mutateAsync({ therapistId, data })
      );
      
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return { successful, failed, total: therapistIds.length };
    },

    onSuccess: ({ successful, failed, total }) => {
      if (failed === 0) {
        toast.success(`Successfully rejected ${successful} therapist applications`);
      } else {
        toast.warning(`Rejected ${successful} applications, ${failed} failed out of ${total}`);
      }
    },

    onError: (error) => {
      const errorMessage = error instanceof MentaraApiError 
        ? error.message 
        : "Bulk rejection operation failed";
      toast.error(errorMessage);
    },
  });
}