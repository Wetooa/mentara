import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { TherapistCardData } from "@/types/therapist";
import { toast } from "sonner";

/**
 * Hook for fetching client's active therapist connections
 * Uses the existing getAssignedTherapists API endpoint
 */
export function useMyTherapists() {
  const api = useApi();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: queryKeys.client.assignedTherapists(),
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

/**
 * Hook for disconnecting from a specific therapist
 */
export function useDisconnectTherapist() {
  const api = useApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (therapistId: string) => {
      return await api.client.disconnectTherapist(therapistId);
    },
    onSuccess: () => {
      // Invalidate therapist queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: queryKeys.client.assignedTherapists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.client.assignedTherapist(),
      });
      toast.success("Disconnected from therapist successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to disconnect from therapist";
      toast.error("Disconnect Failed", {
        description: errorMessage,
      });
    },
  });

  return {
    disconnectTherapist: mutation.mutate,
    disconnectTherapistAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

export default useMyTherapists;