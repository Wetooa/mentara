import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  usePreAssessmentControllerCreatePreAssessment,
  preAssessmentControllerGetPreAssessment,
  PreAssessmentDto
} from "api-client";
import { AxiosError } from "axios";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";

/**
 * React Query hook for fetching user's pre-assessment
 * GET /pre-assessment
 */
export function useUserPreAssessment() {
  return useQuery<PreAssessmentDto | null>({
    queryKey: queryKeys.preAssessment.responses({ user: true }),
    queryFn: async ({ signal }) => {
      try {
        return await preAssessmentControllerGetPreAssessment(signal);
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        // If it's a 404, return null instead of throwing
        if (axiosError.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: unknown) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      
      // Don't retry on 404 (no assessment exists yet)
      if (status === 404) {
        return false;
      }
      
      // Don't retry on 500 errors if they indicate "not found" (common in some parts of this system)
      if (status === 500 && axiosError.response?.data?.message?.includes('not found')) {
        return false;
      }

      return failureCount < 3;
    },
  });
}




/**
 * React Query hook for creating a pre-assessment
 * POST /pre-assessment
 */
export function useCreatePreAssessment() {
  const queryClient = useQueryClient();

  return usePreAssessmentControllerCreatePreAssessment({
    mutation: {
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: queryKeys.preAssessment.all });
      },
      onError: (error) => {
        console.error("Failed to create pre-assessment:", error);
      },
    }
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