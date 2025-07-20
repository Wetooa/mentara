import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { ModeratorDashboardStats } from '@/types/api';

/**
 * Hook for fetching moderator dashboard statistics
 */
export function useModeratorDashboard() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['moderator', 'dashboard'],
    queryFn: () => api.moderator.getDashboardStats(),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes (dashboard data changes frequently)
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
      queryKey: ['moderator', 'dashboard'] 
    });
    
    queryClient.invalidateQueries({ 
      queryKey: ['moderator', 'content'] 
    });
    
    queryClient.invalidateQueries({ 
      queryKey: ['moderator', 'users'] 
    });
    
    toast.success('Dashboard refreshed!');
  };
}