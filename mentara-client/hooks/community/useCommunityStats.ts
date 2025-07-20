import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

import type { CommunityStats } from "@/types/api/communities";

/**
 * Hook for getting community statistics
 */
export function useCommunityStats() {
  const api = useApi();

  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['communities', 'stats'],
    queryFn: () => api.communities.getCommunityStats(),
    staleTime: 1000 * 60 * 15, // 15 minutes - stats don't change frequently
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}