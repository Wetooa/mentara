import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import type { AdminDashboardResponseDto } from 'mentara-commons';

/**
 * Hook for fetching admin-specific dashboard data
 */
export function useAdminDashboard() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => api.dashboard?.getAdminDashboard?.() || Promise.resolve({} as AdminDashboardResponseDto),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if not authorized
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!api.dashboard?.getAdminDashboard, // Only if dashboard service is available
  });
}

/**
 * Hook for fetching platform analytics and system stats
 */
export function usePlatformAnalytics() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'admin', 'analytics'],
    queryFn: () => api.dashboard?.getPlatformAnalytics?.() || Promise.resolve({}),
    staleTime: 1000 * 60 * 5, // Analytics data changes less frequently
    enabled: !!api.dashboard?.getPlatformAnalytics,
  });
}

/**
 * Hook for fetching user management data
 */
export function useUserManagement() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'admin', 'users'],
    queryFn: () => api.dashboard?.getUserManagement?.() || Promise.resolve([]),
    staleTime: 1000 * 60 * 3, // User data changes moderately
    enabled: !!api.dashboard?.getUserManagement,
  });
}

/**
 * Hook for fetching system health and performance
 */
export function useSystemHealth() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'admin', 'health'],
    queryFn: () => api.dashboard?.getSystemHealth?.() || Promise.resolve({}),
    staleTime: 1000 * 30, // System health should be fresh
    refetchInterval: 1000 * 60, // Auto-refresh every minute
    enabled: !!api.dashboard?.getSystemHealth,
  });
}

/**
 * Hook for fetching financial overview and revenue
 */
export function useFinancialOverview() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'admin', 'financial'],
    queryFn: () => api.dashboard?.getFinancialOverview?.() || Promise.resolve({}),
    staleTime: 1000 * 60 * 10, // Financial data changes slowly
    enabled: !!api.dashboard?.getFinancialOverview,
  });
}