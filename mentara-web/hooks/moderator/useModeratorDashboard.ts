import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME } from '@/lib/constants/react-query';
import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { ModeratorDashboardStats } from '@/types/api';

/**
 * Hook for fetching moderator dashboard statistics
 */
export function useModeratorDashboard() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.moderator.dashboard(),
    queryFn: () => api.moderator.getDashboardStats(),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: MentaraApiError) => {
      // Don't retry if not authorized to access moderator data
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for refreshing moderator dashboard data manually
 */
export function useRefreshModeratorDashboard() {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate all moderator dashboard-related queries
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.moderator.dashboard() 
    });
    
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.moderator.contentQueue() 
    });
    
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.moderator.users() 
    });
    
    toast.success('Dashboard refreshed!');
  };
}