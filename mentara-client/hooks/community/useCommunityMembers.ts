import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

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
    queryKey: ['communities', 'members', 'byCommunity', communityId, limit, offset],
    queryFn: () => api.communities.getCommunityMembers(communityId, limit, offset),
    enabled: !!communityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
      ? ['communities', 'memberships', 'byUser', userId]
      : ['communities', 'memberships', 'my'],
    queryFn: () => userId 
      ? api.communities.getUserMemberships(userId)
      : api.communities.getMyMemberships(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    memberships: memberships || [],
    isLoading,
    error,
    refetch,
  };
}