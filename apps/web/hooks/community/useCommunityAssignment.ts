import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { useRecommendationsControllerGetCommunityRecommendations } from "api-client";
import type { CommunityRecommendationResponseDto } from "api-client";
import { useMemo, useCallback } from "react";

/**
 * Hook for managing community assignments and recommendations
 */
export function useCommunityAssignment() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get recommended communities for current user
  const {
    data: recommendationsResponse,
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useRecommendationsControllerGetCommunityRecommendations({
    query: {
      staleTime: STALE_TIME.STATIC, // 30 minutes
      gcTime: GC_TIME.EXTENDED, // 1 hour
      refetchOnWindowFocus: false,
    }
  });

  // Transform and memoize the data
  const recommendedCommunities = useMemo(() => {
    const data = (recommendationsResponse as CommunityRecommendationResponseDto)?.data;
    return data?.communities || [];
  }, [recommendationsResponse]);

  // Assign recommended communities to current user
  const assignToMeMutation = useMutation({
    mutationFn: async () => {
      const slugs = recommendedCommunities.map(c => c.slug);
      if (slugs.length === 0) return { data: { successfulJoins: [], failedJoins: [] } };
      return api.communities.joinCommunities(slugs);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.userMemberships() });
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.recommended() });
      toast.success(`Assigned to ${data.data.successfulJoins.length} communities`);
    },
    onError: () => {
      toast.error("Failed to assign communities");
    },
  });

  // Assign specific communities to current user
  const joinCommunitiesMutation = useMutation({
    mutationFn: (slugs: string[]) => api.communities.joinCommunities(slugs),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communities.userMemberships() });
      toast.success(`Joined ${data.data.successfulJoins.length} communities`);
    },
    onError: () => {
      toast.error("Failed to join communities");
    },
  });

  return {
    recommendedCommunities,
    isLoadingRecommendations,
    recommendationsError,
    refetchRecommendations: useCallback(() => refetchRecommendations(), [refetchRecommendations]),
    
    // Assignment operations
    assignToMe: () => assignToMeMutation.mutate(),
    joinCommunities: (slugs: string[]) => joinCommunitiesMutation.mutate(slugs),
    
    // Loading states
    isAssigningToMe: assignToMeMutation.isPending,
    isJoiningCommunities: joinCommunitiesMutation.isPending,
  };
}