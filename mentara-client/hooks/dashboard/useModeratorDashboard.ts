import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import type { ModeratorDashboardResponseDto } from 'mentara-commons';

/**
 * Hook for fetching moderator-specific dashboard data
 */
export function useModeratorDashboard() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'moderator'],
    queryFn: () => api.dashboard?.getModeratorDashboard?.() || Promise.resolve({} as ModeratorDashboardResponseDto),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if not authorized
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!api.dashboard?.getModeratorDashboard, // Only if dashboard service is available
  });
}

/**
 * Hook for fetching content moderation queue
 */
export function useModerationQueue() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'moderator', 'queue'],
    queryFn: () => api.dashboard?.getModerationQueue?.() || Promise.resolve([]),
    staleTime: 1000 * 60 * 1, // Queue changes frequently
    refetchInterval: 1000 * 60 * 2, // Auto-refresh every 2 minutes
    enabled: !!api.dashboard?.getModerationQueue,
  });
}

/**
 * Hook for fetching moderator-specific community stats and health
 */
export function useModeratorCommunityStats() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'moderator', 'communities', 'stats'],
    queryFn: () => api.dashboard?.getCommunityStats?.() || Promise.resolve({}),
    staleTime: 1000 * 60 * 15, // Community stats change less frequently
    enabled: !!api.dashboard?.getCommunityStats,
  });
}

/**
 * Hook for fetching reported content and violations
 */
export function useReportedContent() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'moderator', 'reports'],
    queryFn: () => api.dashboard?.getReportedContent?.() || Promise.resolve([]),
    staleTime: 1000 * 60 * 2, // Reports change moderately
    enabled: !!api.dashboard?.getReportedContent,
  });
}

/**
 * Hook for fetching moderation activity and performance
 */
export function useModerationActivity() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'moderator', 'activity'],
    queryFn: () => api.dashboard?.getModerationActivity?.() || Promise.resolve({}),
    staleTime: 1000 * 60 * 10, // Activity data changes slowly
    enabled: !!api.dashboard?.getModerationActivity,
  });
}