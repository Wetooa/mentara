import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import type { ClientDashboardResponseDto } from "@/types/api/dashboard";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook for fetching client-specific dashboard data
 */
export function useClientDashboard() {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.dashboard.client(),
    queryFn: () =>
      api.dashboard?.getClientDashboard?.() ||
      Promise.resolve({} as ClientDashboardResponseDto),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if not authorized
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!api.dashboard?.getClientDashboard, // Only if dashboard service is available
    refetchOnWindowFocus: false, // Don't refetch on window focus for dashboard
  });
}

/**
 * Hook for fetching client session summary
 */
export function useClientSessions() {
  const api = useApi();

  return useQuery({
    queryKey: [...queryKeys.dashboard.client(), "sessions"],
    queryFn: () => api.dashboard?.getClientSessions?.() || Promise.resolve([]),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.LONG, // 15 minutes
    enabled: !!api.dashboard?.getClientSessions,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching client progress data
 */
export function useClientProgress() {
  const api = useApi();

  return useQuery({
    queryKey: [...queryKeys.dashboard.client(), "progress"],
    queryFn: () => api.dashboard?.getClientProgress?.() || Promise.resolve({}),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    enabled: !!api.dashboard?.getClientProgress,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching client wellness metrics
 */
export function useClientWellness() {
  const api = useApi();

  return useQuery({
    queryKey: [...queryKeys.dashboard.client(), "wellness"],
    queryFn: () => api.dashboard?.getClientWellness?.() || Promise.resolve({}),
    staleTime: STALE_TIME.VERY_LONG, // 15 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    enabled: !!api.dashboard?.getClientWellness,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching dashboard data (alias for useClientDashboard)
 * This is the main dashboard data hook used by the dashboard page
 */
export function useDashboardData() {
  return useClientDashboard();
}

/**
 * Hook for fetching user notifications
 */


/**
 * Hook for fetching recent communications
 */
export function useRecentCommunications() {
  const api = useApi();
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.messaging.recent(user?.id || '', 5),
    queryFn: () => api.messaging?.getRecentCommunications?.(5) || Promise.resolve([]),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.SHORT, // 5 minutes
    enabled: !!api.messaging?.getRecentCommunications,
    refetchOnWindowFocus: true, // Refetch communications on focus
  });
}
