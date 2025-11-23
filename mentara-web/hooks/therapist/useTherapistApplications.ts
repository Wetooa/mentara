import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import type {
  TherapistApplication,
  ApplicationListParams,
  UpdateApplicationRequest,
  CreateApplicationRequest,
} from "../../types/domain";
import { UpdateTherapistStatusDto } from "@/types";

/**
 * Shared retry logic for authentication and error handling
 */
const getApplicationsRetryConfig = (
  failureCount: number,
  error: MentaraApiError
) => {
  // Don't retry on auth errors (401, 403)
  if (error?.status === 401 || error?.status === 403) {
    return false;
  }
  // Retry up to 2 times for other errors
  return failureCount < 2;
};

/**
 * Enhanced retry logic for application details that also excludes 404 errors
 */
const getApplicationDetailRetryConfig = (
  failureCount: number,
  error: MentaraApiError
) => {
  // Don't retry on auth errors or if application doesn't exist
  if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
    return false;
  }
  // Retry up to 2 times for other errors
  return failureCount < 2;
};

/**
 * Hook for fetching therapist applications list (admin functionality)
 * Uses the admin endpoint for comprehensive application data
 */
export function useTherapistApplications(params: ApplicationListParams = {}) {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapists.applications.list(params),
    queryFn: () => api.therapists.getApplications(params),
    select: (response) => {
      // Transform axios response structure: response.data.applications -> applications
      return response.data?.applications || [];
    },
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    retry: getApplicationsRetryConfig,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching therapist applications list with full response metadata (admin functionality)
 * Returns the complete response including pagination data
 */
export function useTherapistApplicationsWithMetadata(
  params: ApplicationListParams = {}
) {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapists.applications.list({ ...params, metadata: true }),
    queryFn: () => api.therapists.getApplications(params),
    select: (response) => {
      // Return the full response data structure for pagination
      return (
        response.data || {
          applications: [],
          totalCount: 0,
          page: 1,
          totalPages: 1,
        }
      );
    },
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    retry: getApplicationsRetryConfig,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching a specific therapist application by ID
 */
export function useTherapistApplication(applicationId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapists.applications.byId(applicationId || ""),
    queryFn: () => api.therapists.application.getById(applicationId!),
    enabled: !!applicationId,
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    retry: getApplicationDetailRetryConfig,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching the current user's therapist application
 */
export function useMyTherapistApplication() {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapists.applications.my(),
    queryFn: () => api.therapists.application.getMy(),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    retry: getApplicationDetailRetryConfig,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for submitting a new therapist application
 */
export function useSubmitTherapistApplication() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationRequest) =>
      api.therapists.application.submit(data),
    onSuccess: (data) => {
      toast.success("Application submitted successfully!");

      // Invalidate and refetch my application
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapists.applications.my(),
      });

      // Invalidate applications list for admin
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapists.applications.list(),
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || "Failed to submit application");
    },
  });
}

/**
 * Hook for updating therapist application status (admin functionality)
 */
export function useUpdateTherapistApplicationStatus() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: UpdateTherapistStatusDto;
    }) => api.admin.updateTherapistStatus(applicationId, data),
    onMutate: async ({ applicationId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.therapists.applications.byId(applicationId),
      });

      // Snapshot the previous value
      const previousApplication = queryClient.getQueryData(
        queryKeys.therapists.applications.byId(applicationId)
      );

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.therapists.applications.byId(applicationId),
        (old: TherapistApplication | undefined) =>
          old ? { ...old, ...data, reviewedAt: new Date().toISOString() } : old
      );

      return { previousApplication, applicationId };
    },
    onError: (error: MentaraApiError, { applicationId }, context) => {
      // Rollback to previous value on error
      if (context?.previousApplication) {
        queryClient.setQueryData(
          queryKeys.therapists.applications.byId(applicationId),
          context.previousApplication
        );
      }
      toast.error(error?.message || "Failed to update application status");
    },
    onSuccess: (data, { applicationId, data: updateData }) => {
      const statusText =
        updateData.status === "approved"
          ? "approved"
          : updateData.status === "rejected"
            ? "rejected"
            : "updated";
      toast.success(`Application ${statusText} successfully!`);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapists.applications.list(),
      });

      // If approved, also invalidate therapist-related queries
      if (updateData.status === "approved") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.therapists.all,
        });
      }
    },
    onSettled: () => {
      // Always refetch applications list
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapists.applications.list(),
      });
    },
  });
}

/**
 * Hook for bulk actions on therapist applications (admin functionality)
 */
export function useBulkUpdateApplications() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationIds,
      data,
    }: {
      applicationIds: string[];
      data: UpdateApplicationRequest;
    }) => {
      // Execute updates in parallel
      const results = await Promise.allSettled(
        applicationIds.map((id) => api.therapists.application.update(id, data))
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return { successful, failed, total: applicationIds.length };
    },
    onSuccess: ({ successful, failed, total }) => {
      if (failed === 0) {
        toast.success(`Successfully updated ${successful} applications`);
      } else {
        toast.warning(`Updated ${successful} applications, ${failed} failed`);
      }

      // Invalidate all applications queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapists.applications.list(),
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || "Bulk update failed");
    },
  });
}

/**
 * Hook for prefetching application details
 */
export function usePrefetchTherapistApplication() {
  const queryClient = useQueryClient();
  const api = useApi();

  return (applicationId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.therapists.applications.byId(applicationId),
      queryFn: () => api.therapists.application.getById(applicationId),
      staleTime: STALE_TIME.MEDIUM, // 5 minutes
      gcTime: GC_TIME.MEDIUM, // 10 minutes
    });
  };
}
