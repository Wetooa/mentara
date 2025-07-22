import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { 
  CreatePreAssessmentDto, 
  UpdatePreAssessmentDto,
  PreAssessment 
} from "@/types/api/pre-assessment";

/**
 * React Query hook for fetching user's pre-assessment
 * GET /pre-assessment
 */
export function useUserPreAssessment() {
  const api = useApi();

  return useQuery({
    queryKey: ["preAssessment", "user"],
    queryFn: () => api.preAssessment.getUserAssessment(),
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no assessment exists yet)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
      queryClient.setQueryData(["preAssessment", "user"], data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["preAssessment"] });
    },
    onError: (error) => {
      console.error("Failed to create pre-assessment:", error);
    },
  });
}

/**
 * React Query hook for updating a pre-assessment
 * PUT /pre-assessment
 */
export function useUpdatePreAssessment() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreAssessmentDto) => api.preAssessment.update(data),
    onSuccess: (data: PreAssessment) => {
      // Update the user's pre-assessment cache
      queryClient.setQueryData(["preAssessment", "user"], data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["preAssessment"] });
    },
    onError: (error) => {
      console.error("Failed to update pre-assessment:", error);
    },
  });
}

/**
 * React Query hook for deleting user's pre-assessment
 * DELETE /pre-assessment
 */
export function useDeletePreAssessment() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.preAssessment.delete(),
    onSuccess: () => {
      // Clear the user's pre-assessment cache
      queryClient.removeQueries({ queryKey: ["preAssessment", "user"] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["preAssessment"] });
    },
    onError: (error) => {
      console.error("Failed to delete pre-assessment:", error);
    },
  });
}

/**
 * Hook to check if user has a pre-assessment
 */
export function useHasPreAssessment() {
  const { data, isLoading, error } = useUserPreAssessment();
  
  return {
    hasAssessment: !!data,
    isLoading,
    error,
    assessment: data,
  };
}

export type UseUserPreAssessmentReturn = ReturnType<typeof useUserPreAssessment>;
export type UseCreatePreAssessmentReturn = ReturnType<typeof useCreatePreAssessment>;
export type UseUpdatePreAssessmentReturn = ReturnType<typeof useUpdatePreAssessment>;
export type UseDeletePreAssessmentReturn = ReturnType<typeof useDeletePreAssessment>;
export type UseHasPreAssessmentReturn = ReturnType<typeof useHasPreAssessment>;