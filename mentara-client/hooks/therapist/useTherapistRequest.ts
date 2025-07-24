import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

/**
 * Hook for sending therapist connection requests
 */
export function useTherapistRequest() {
  const api = useApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (therapistId: string) => {
      return await api.client.requestTherapist(therapistId);
    },
    onSuccess: (data, therapistId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.client.assignedTherapists,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.therapists.all });

      toast.success(
        `Connection request sent to ${data.therapist.firstName} ${data.therapist.lastName}`,
        {
          description:
            "They will be notified of your request and can accept or decline.",
        }
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send request";

      if (errorMessage.includes("already connected")) {
        toast.error("Already Connected", {
          description: "You are already connected to this therapist.",
        });
      } else if (errorMessage.includes("already sent")) {
        toast.error("Request Already Sent", {
          description: "You have already sent a request to this therapist.",
        });
      } else if (errorMessage.includes("not approved")) {
        toast.error("Therapist Not Available", {
          description: "This therapist is not currently accepting new clients.",
        });
      } else {
        toast.error("Request Failed", {
          description: errorMessage,
        });
      }
    },
  });

  return {
    requestTherapist: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

export default useTherapistRequest;
