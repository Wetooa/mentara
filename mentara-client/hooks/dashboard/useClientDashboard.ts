import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import type { ClientDashboardResponseDto } from "@/types/api/dashboard";

/**
 * Hook for fetching client-specific dashboard data
 */
export function useClientDashboard() {
  const api = useApi();

  return useQuery({
    queryKey: ["dashboard", "client"],
    queryFn: () =>
      api.dashboard?.getClientDashboard?.() ||
      Promise.resolve({} as ClientDashboardResponseDto),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if not authorized
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!api.dashboard?.getClientDashboard, // Only if dashboard service is available
  });
}

/**
 * Hook for fetching client session summary
 */
export function useClientSessions() {
  const api = useApi();

  return useQuery({
    queryKey: ["dashboard", "client", "sessions"],
    queryFn: () => api.dashboard?.getClientSessions?.() || Promise.resolve([]),
    staleTime: 1000 * 60 * 5, // Sessions data changes less frequently
    enabled: !!api.dashboard?.getClientSessions,
  });
}

/**
 * Hook for fetching client progress data
 */
export function useClientProgress() {
  const api = useApi();

  return useQuery({
    queryKey: ["dashboard", "client", "progress"],
    queryFn: () => api.dashboard?.getClientProgress?.() || Promise.resolve({}),
    staleTime: 1000 * 60 * 10, // Progress data changes slowly
    enabled: !!api.dashboard?.getClientProgress,
  });
}

/**
 * Hook for fetching client wellness metrics
 */
export function useClientWellness() {
  const api = useApi();

  return useQuery({
    queryKey: ["dashboard", "client", "wellness"],
    queryFn: () => api.dashboard?.getClientWellness?.() || Promise.resolve({}),
    staleTime: 1000 * 60 * 15, // Wellness metrics change slowly
    enabled: !!api.dashboard?.getClientWellness,
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
export function useNotifications(options?: { limit?: number; isRead?: boolean }) {
  const api = useApi();

  return useQuery({
    queryKey: ["notifications", options?.limit, options?.isRead],
    queryFn: () => api.notifications?.getNotifications?.(options) || Promise.resolve([]),
    staleTime: 1000 * 60 * 1, // Notifications are time-sensitive
    enabled: !!api.notifications?.getNotifications,
  });
}

/**
 * Hook for fetching recent communications
 */
export function useRecentCommunications() {
  const api = useApi();

  return useQuery({
    queryKey: ["dashboard", "communications", "recent"],
    queryFn: () => api.messaging?.getRecentCommunications?.() || Promise.resolve([]),
    staleTime: 1000 * 60 * 2, // Communications change moderately
    enabled: !!api.messaging?.getRecentCommunications,
  });
}
