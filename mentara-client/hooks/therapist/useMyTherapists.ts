import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { TherapistCardData } from "@/types/therapist";

/**
 * Hook for fetching client's active therapist connections
 * Uses the existing getAssignedTherapists API endpoint
 */
export function useMyTherapists() {
  const api = useApi();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: queryKeys.client.assignedTherapists,
    queryFn: async () => {
      const response = await api.client.getAssignedTherapists();
      // The API returns { therapists: TherapistRecommendation[] }
      return response.therapists || [];
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    data,
    therapists: data,
    isLoading,
    error,
    refetch,
  };
}

export default useMyTherapists;