import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
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
    queryKey: queryKeys.communities.stats(),
    queryFn: () => api.communities.getCommunityStats(),
    staleTime: STALE_TIME.VERY_LONG, // 15 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}