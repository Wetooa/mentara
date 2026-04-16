import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import {
  CreatePreAssessmentDto,
  PreAssessment
} from "@/types/api/pre-assessment";

/**
 * React Query hook for fetching user's pre-assessment
 * GET /pre-assessment
 */
export function useUserPreAssessment() {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.preAssessment.responses({ user: true }),
    queryFn: async () => {
      try {
        return await api.preAssessment.getUserAssessment();
      } catch (error: unknown) {
        // If it's a 404, return null instead of throwing
        // This allows React Query to cache the "no assessment" state as successful data
        if (error instanceof MentaraApiError && error.status === 404) {
          return null;
        }
        // For other errors, throw so they can be handled/retried
        throw error;
      }
    },
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 (no assessment exists yet)
      if (error instanceof MentaraApiError && error.status === 404) {
        return false;
      }
      // Don't retry on 500 errors either
      if (error instanceof MentaraApiError && error.status === 500 && error.message?.includes('not found')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchOnWindowFocus: false,
    // Don't throw errors for 404 (already handled in queryFn)
    throwOnError: false,
  });
}

/**
 * React Query hook for creating a pre-assessment
 * POST /pre-assessment
 */
export function useCreatePreAssessment() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePreAssessmentDto) => api.preAssessment.create(data),
    onSuccess: (data: PreAssessment) => {
      // Update the user's pre-assessment cache
      queryClient.setQueryData(queryKeys.preAssessment.responses({ user: true }), data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.preAssessment.all });
    },
    onError: (error) => {
      console.error("Failed to create pre-assessment:", error);
    },
  });
}


/**
 * Hook to check if user has a pre-assessment
 * This hook is optimized to not throw errors when no assessment exists (404 is expected)
 */
export function useHasPreAssessment() {
  const { data, isLoading, error, isFetching } = useUserPreAssessment();

  return {
    hasAssessment: !!data,
    isLoading: isLoading || (isFetching && !data), // Maintain loading state while fetching initial state
    error,
    assessment: data,
  };
}

export type UseUserPreAssessmentReturn = ReturnType<typeof useUserPreAssessment>;
export type UseCreatePreAssessmentReturn = ReturnType<typeof useCreatePreAssessment>;
export type UseHasPreAssessmentReturn = ReturnType<typeof useHasPreAssessment>;