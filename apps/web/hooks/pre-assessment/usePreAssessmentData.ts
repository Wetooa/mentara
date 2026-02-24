import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
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
    queryFn: () => api.preAssessment.getUserAssessment(),
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no assessment exists yet) - this is expected for new users
      if (error?.response?.status === 404) {
        return false;
      }
      // Don't retry on 500 errors either (backend should return 404, but handle gracefully)
      if (error?.response?.status === 500 && error?.response?.data?.message?.includes('not found')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchOnWindowFocus: false,
    // Don't throw errors for 404 - it's expected when user has no assessment
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
  const { data, isLoading, error } = useUserPreAssessment();

  // 404 errors are expected when user has no assessment - don't treat as error
  const hasError = error && (error as any)?.response?.status !== 404;

  return {
    hasAssessment: !!data,
    isLoading,
    error: hasError ? error : null,
    assessment: data,
  };
}

export type UseUserPreAssessmentReturn = ReturnType<typeof useUserPreAssessment>;
export type UseCreatePreAssessmentReturn = ReturnType<typeof useCreatePreAssessment>;
export type UseHasPreAssessmentReturn = ReturnType<typeof useHasPreAssessment>;