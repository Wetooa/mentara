import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import type { DashboardResponse } from '@/lib/api/services/dashboard';

/**
 * Hook for fetching complete user dashboard data
 */
export function useDashboardData() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.dashboard.user(),
    queryFn: () => api.dashboard.getUserDashboard(),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes (dashboard data changes frequently)
    retry: (failureCount, error: any) => {
      // Don't retry if not authorized
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching user notifications
 */
export function useNotifications(params: { 
  limit?: number; 
  offset?: number; 
  isRead?: boolean 
} = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.notifications.my(params),
    queryFn: () => api.notifications.getMy(params),
    staleTime: 1000 * 60 * 1, // Notifications change frequently
    keepPreviousData: true, // For pagination
  });
}

/**
 * Hook for fetching unread notifications count
 */
export function useUnreadNotificationsCount() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => api.notifications.getUnreadCount(),
    staleTime: 1000 * 30, // Refresh every 30 seconds
    refetchInterval: 1000 * 60, // Auto-refresh every minute
  });
}

/**
 * Hook for fetching recent conversations/communications
 */
export function useRecentCommunications() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['messaging', 'conversations', 'recent'],
    queryFn: async () => {
      // Get conversations and return limited recent ones
      const conversations = await api.messaging?.getConversations?.({ limit: 5 }) || [];
      return conversations;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!api.messaging?.getConversations, // Only if messaging service is available
  });
}

/**
 * Hook for marking notification as read
 */
export function useMarkNotificationAsRead() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => api.notifications.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.notifications.all 
      });
      
      // Optimistically update notification status
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.all },
        (oldData: any) => {
          if (Array.isArray(oldData)) {
            return oldData.map(notification => 
              notification.id === notificationId 
                ? { ...notification, read: true } 
                : notification
            );
          }
          return oldData;
        }
      );
      
      // Update unread count
      queryClient.setQueryData(
        queryKeys.notifications.unreadCount(),
        (oldCount: { count: number } | undefined) => 
          oldCount ? { count: Math.max(0, oldCount.count - 1) } : { count: 0 }
      );
    },
    onError: (error: any, notificationId) => {
      toast.error('Failed to mark notification as read');
      
      // Invalidate queries to revert optimistic update
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all 
      });
    },
    onSuccess: () => {
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all 
      });
    },
  });
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.notifications.all 
      });
      
      // Optimistically update all notifications as read
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.all },
        (oldData: any) => {
          if (Array.isArray(oldData)) {
            return oldData.map(notification => ({ ...notification, read: true }));
          }
          return oldData;
        }
      );
      
      // Set unread count to 0
      queryClient.setQueryData(
        queryKeys.notifications.unreadCount(),
        { count: 0 }
      );
    },
    onError: (error: any) => {
      toast.error('Failed to mark all notifications as read');
      
      // Invalidate queries to revert optimistic update
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all 
      });
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all 
      });
    },
  });
}

/**
 * Hook for refreshing dashboard data manually
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate all dashboard-related queries
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.dashboard.all 
    });
    
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.notifications.all 
    });
    
    queryClient.invalidateQueries({
      queryKey: ['messaging', 'conversations']
    });
    
    toast.success('Dashboard refreshed!');
  };
}

/**
 * Hook for prefetching dashboard data (for performance optimization)
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();
  const api = useApi();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.user(),
      queryFn: () => api.dashboard.getUserDashboard(),
      staleTime: 1000 * 60 * 2,
    });
  };
}