"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { TherapistRecommendation } from "@/types/api/therapist";

// Types for hook return values
export interface UseTherapistRequestsReturn {
  // Pending requests data
  pendingRequests: TherapistRecommendation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;

  // Actions
  sendRequest: (therapistId: string) => Promise<void>;
  cancelRequest: (therapistId: string) => Promise<void>;

  // Loading states
  isSendingRequest: boolean;
  isCancelingRequest: boolean;
}

/**
 * Comprehensive hook for managing therapist connection requests
 * Includes fetching pending requests, sending new requests, and canceling requests
 */
export function useTherapistRequests(): UseTherapistRequestsReturn {
  const api = useApi();
  const queryClient = useQueryClient();

  // Query for pending therapist requests
  const {
    data: pendingRequestsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.client.therapistRequests.pending(),
    queryFn: async () => {
      const response = await api.client.getPendingTherapistRequests();
      return response.requests;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for sending therapist requests
  const sendRequestMutation = useMutation({
    mutationFn: async (therapistId: string) => {
      return await api.client.requestTherapist(therapistId);
    },
    onSuccess: (data, therapistId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.client.therapistRequests.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.client.assignedTherapists,
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.therapists.all 
      });

      toast.success(
        `Request sent to ${data.therapist.firstName} ${data.therapist.lastName}`,
        {
          description: "They will be notified and can respond to your request.",
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
      } else if (errorMessage.includes("already sent") || errorMessage.includes("Request already sent")) {
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

  // Mutation for canceling therapist requests
  const cancelRequestMutation = useMutation({
    mutationFn: async (therapistId: string) => {
      await api.client.cancelTherapistRequest(therapistId);
      return therapistId;
    },
    onMutate: async (therapistId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.client.therapistRequests.pending(),
      });

      // Get the current pending requests
      const previousRequests = queryClient.getQueryData<TherapistRecommendation[]>(
        queryKeys.client.therapistRequests.pending()
      );

      // Optimistically update to remove the canceled request
      if (previousRequests) {
        queryClient.setQueryData(
          queryKeys.client.therapistRequests.pending(),
          previousRequests.filter((request) => request.id !== therapistId)
        );
      }

      // Return context for rollback
      return { previousRequests };
    },
    onSuccess: (therapistId) => {
      // Find the therapist name for the toast
      const therapistName = pendingRequestsData?.find(
        (request) => request.id === therapistId
      );

      toast.success(
        `Request canceled${therapistName ? ` for ${therapistName.firstName} ${therapistName.lastName}` : ""}`,
        {
          description: "Your connection request has been withdrawn.",
        }
      );

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.client.therapistRequests.all(),
      });
    },
    onError: (error: any, therapistId, context) => {
      // Rollback the optimistic update
      if (context?.previousRequests) {
        queryClient.setQueryData(
          queryKeys.client.therapistRequests.pending(),
          context.previousRequests
        );
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel request";

      toast.error("Cancel Failed", {
        description: errorMessage,
      });
    },
  });

  // Callback functions
  const sendRequest = useCallback(
    async (therapistId: string) => {
      await sendRequestMutation.mutateAsync(therapistId);
    },
    [sendRequestMutation]
  );

  const cancelRequest = useCallback(
    async (therapistId: string) => {
      await cancelRequestMutation.mutateAsync(therapistId);
    },
    [cancelRequestMutation]
  );

  return {
    // Data
    pendingRequests: pendingRequestsData || [],
    isLoading,
    error: error as Error | null,
    refetch,

    // Actions
    sendRequest,
    cancelRequest,

    // Loading states
    isSendingRequest: sendRequestMutation.isPending,
    isCancelingRequest: cancelRequestMutation.isPending,
  };
}

/**
 * Hook specifically for sending therapist requests (lightweight version)
 * Use this when you only need to send requests without managing pending state
 */
export function useCreateTherapistRequest() {
  const api = useApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (therapistId: string) => {
      return await api.client.requestTherapist(therapistId);
    },
    onSuccess: (data, therapistId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.client.therapistRequests.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.client.assignedTherapists,
      });

      toast.success(
        `Request sent to ${data.therapist.firstName} ${data.therapist.lastName}`,
        {
          description: "They will be notified and can respond to your request.",
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
    requestTherapistAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * Hook specifically for canceling therapist requests (lightweight version)
 * Use this when you only need to cancel requests without managing pending state
 */
export function useCancelTherapistRequest() {
  const api = useApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (therapistId: string) => {
      await api.client.cancelTherapistRequest(therapistId);
      return therapistId;
    },
    onSuccess: (therapistId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.client.therapistRequests.all(),
      });

      toast.success("Request canceled", {
        description: "Your connection request has been withdrawn.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel request";

      toast.error("Cancel Failed", {
        description: errorMessage,
      });
    },
  });

  return {
    cancelRequest: mutation.mutate,
    cancelRequestAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}