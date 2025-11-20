import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import type { CommunityMember } from "@/types/api/communities";

/**
 * Hook for managing community members
 */
export function useCommunityMembers(communityId: string, limit = 50, offset = 0) {
  const api = useApi();

  // Get community members
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.communities.members(communityId, limit, offset),
    queryFn: () => api.communities.getCommunityMembers(communityId, limit, offset),
    enabled: !!communityId,
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    members: data?.members || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for getting user's community memberships
 */
export function useCommunityMemberships(userId?: string) {
  const api = useApi();

  // Get user's memberships (current user if no userId provided)
  const {
    data: memberships,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userId 
      ? [...queryKeys.communities.all, 'memberships', 'byUser', userId]
      : queryKeys.communities.userMemberships(),
    queryFn: () => userId 
      ? api.communities.getUserMemberships(userId)
      : api.communities.getMyMemberships(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    memberships: memberships || [],
    isLoading,
    error,
    refetch,
  };
}