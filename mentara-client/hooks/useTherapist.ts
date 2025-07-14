import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";

interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  profileImageUrl?: string;
  hourlyRate?: number;
  patientSatisfaction?: number;
  totalPatients: number;
  province: string;
  providerType: string;
  yearsOfExperience?: number;
  illnessSpecializations: string[];
  therapeuticApproaches: string[];
  languages: string[];
  isActive: boolean;
  isVerified: boolean;
}

/**
 * Hook for managing client-therapist relationship
 * Uses React Query for better state management and caching
 */
export function useTherapist() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Query to get assigned therapist
  const {
    data: therapist,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.client.assignedTherapist(),
    queryFn: () => api.client.getAssignedTherapist(),
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: (failureCount, error: MentaraApiError) => {
      // Don't retry on 404 (no therapist assigned)
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });

  // Mutation to assign a therapist
  const assignTherapistMutation = useMutation({
    mutationFn: async (therapistId: string) => {
      // For now, use the request therapist change endpoint as assignment
      // This needs a proper assignment endpoint in the backend
      return api.client.requestTherapistChange(`Requesting assignment to therapist ${therapistId}`);
    },
    onSuccess: (data, therapistId) => {
      toast.success("Therapist assignment requested successfully!");
      // Invalidate and refetch the assigned therapist
      queryClient.invalidateQueries({ queryKey: queryKeys.client.assignedTherapist() });
      // Note: In a real implementation, this would directly assign the therapist
      // For now, it creates a change request that admin needs to approve
    },
    onError: (error: MentaraApiError) => {
      const message = error?.response?.data?.message || error?.message || "Failed to assign therapist";
      toast.error(message);
    },
  });

  // Mutation to remove/change therapist
  const removeTherapistMutation = useMutation({
    mutationFn: async (reason: string = "Client requested therapist change") => {
      return api.client.requestTherapistChange(reason);
    },
    onSuccess: () => {
      toast.success("Therapist change request submitted successfully!");
      // Invalidate the assigned therapist query
      queryClient.invalidateQueries({ queryKey: queryKeys.client.assignedTherapist() });
    },
    onError: (error: MentaraApiError) => {
      const message = error?.response?.data?.message || error?.message || "Failed to submit therapist change request";
      toast.error(message);
    },
  });

  // Helper functions for backward compatibility
  const assignTherapist = async (therapistId: string): Promise<void> => {
    await assignTherapistMutation.mutateAsync(therapistId);
  };

  const removeTherapist = async (reason?: string): Promise<void> => {
    await removeTherapistMutation.mutateAsync(reason);
  };

  return {
    therapist: therapist || null,
    loading: loading || assignTherapistMutation.isPending || removeTherapistMutation.isPending,
    error: error?.message || null,
    assignTherapist,
    removeTherapist,
    refetch: () => refetch(),
    // Expose mutation states for more granular control
    isAssigning: assignTherapistMutation.isPending,
    isRemoving: removeTherapistMutation.isPending,
    assignError: assignTherapistMutation.error,
    removeError: removeTherapistMutation.error,
  };
}

/**
 * Hook for requesting therapist assignment (simplified version)
 */
export function useTherapistAssignment() {
  const { assignTherapist, removeTherapist, isAssigning, isRemoving } = useTherapist();

  return {
    assignTherapist,
    removeTherapist,
    isAssigning,
    isRemoving,
  };
}

/**
 * Hook for just getting assigned therapist data
 */
export function useAssignedTherapist() {
  const { therapist, loading, error, refetch } = useTherapist();

  return {
    therapist,
    isLoading: loading,
    error,
    refetch,
  };
}

/**
 * Hook for getting multiple assigned therapists (for clients with multiple therapists)
 */
export function useAssignedTherapists() {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.client.assignedTherapists(),
    queryFn: () => api.client.getAssignedTherapists(),
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: (failureCount, error: MentaraApiError) => {
      // Don't retry on 404 (no therapists assigned)
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

// Export namespace for better organization
export const TherapistHooks = {
  useAssignedTherapist,
  useAssignedTherapists,
  useTherapistAssignment,
};