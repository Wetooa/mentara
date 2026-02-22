import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME, REFETCH_INTERVAL } from '@/lib/constants/react-query';
import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { 
  Moderator,
  SystemEvent,
  AuditLog,
  User,
  Post,
  Comment,
  ModerationReport,
  ModeratorDashboardStats,
  ContentModerationParams,
  UserModerationParams,
  AuditLogParams,
  SystemEventParams,
  ModerateContentRequest,
  ModerateUserRequest
} from '@/types/api';

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
  });
}

/**
 * Hook for fetching content moderation queue
 */
export function useContentModerationQueue(params: ContentModerationParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.moderator.contentQueue(params),
    queryFn: () => api.moderator.content.getQueue(params),
    staleTime: STALE_TIME.VERY_SHORT, // 30 seconds
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchInterval: REFETCH_INTERVAL.FREQUENT, // Auto-refresh every minute
    refetchOnWindowFocus: true, // Refetch on focus for moderation queue
  });
}

/**
 * Hook for moderating content (approve, reject, flag, remove)
 */
export function useModerateContent() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      contentType, 
      contentId, 
      data 
    }: { 
      contentType: 'post' | 'comment'; 
      contentId: string; 
      data: ModerateContentRequest 
    }) => api.moderator.content.moderate(contentType, contentId, data),
    onSuccess: (result, { contentType, data }) => {
      toast.success(`Content ${data.action}d successfully!`);
      
      // Invalidate moderation queues
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.contentQueue() 
      });
      
      // Invalidate content moderation data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.flaggedContent() 
      });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.dashboard() 
      });
      
      // Invalidate related content queries
      if (contentType === 'post') {
        queryClient.invalidateQueries({ 
          queryKey: ['posts'] 
        });
      } else {
        queryClient.invalidateQueries({ 
          queryKey: ['comments'] 
        });
      }
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to moderate content');
    },
  });
}

/**
 * Hook for fetching content moderation reports
 */
export function useContentModerationReports(params: { type?: string; status?: string; limit?: number; offset?: number } = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.reporting.all, 'moderator', params],
    queryFn: () => api.moderator.content.getReports(params),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for updating moderation report status
 */
export function useUpdateModerationReport() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      reportId, 
      data 
    }: { 
      reportId: string; 
      data: { status: string; resolution?: string } 
    }) => api.moderator.content.updateReport(reportId, data),
    onSuccess: (result, { reportId, data }) => {
      toast.success(`Report ${data.status} successfully!`);
      
      // Invalidate reports
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reporting.all 
      });
      
      // Invalidate dashboard if resolved
      if (data.status === 'resolved') {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.moderator.dashboard() 
        });
      }
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update report');
    },
  });
}

/**
 * Hook for fetching flagged users for moderation
 */
export function useFlaggedUsers(params: UserModerationParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.moderator.users(), 'flagged', params],
    queryFn: () => api.moderator.users.getFlagged(params),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for moderating users (suspend, warn, flag, clearFlags)
 */
export function useModerateUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      data 
    }: { 
      userId: string; 
      data: ModerateUserRequest 
    }) => api.moderator.users.moderate(userId, data),
    onSuccess: (result, { userId, data }) => {
      const actionText = data.action === 'suspend' ? 'suspended' : 
                        data.action === 'warn' ? 'warned' : 
                        data.action === 'flag' ? 'flagged' : 'updated';
      toast.success(`User ${actionText} successfully!`);
      
      // Invalidate user moderation data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.users() 
      });
      
      // Invalidate specific user data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.byId(userId) 
      });
      
      // Invalidate content moderation if user was suspended
      if (data.action === 'suspend') {
        queryClient.invalidateQueries({ 
          queryKey: [...queryKeys.moderator.flaggedContent(), 'userViolations', userId] 
        });
      }
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.dashboard() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to moderate user');
    },
  });
}

/**
 * Hook for fetching user moderation history
 */
export function useUserModerationHistory(userId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.moderator.users(), 'history', userId || ''],
    queryFn: () => api.moderator.users.getHistory(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for searching audit logs
 */
export function useAuditLogsSearch(params: AuditLogParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.moderator.auditLogs(params),
    queryFn: () => api.moderator.auditLogs.search(params),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching audit logs statistics
 */
export function useAuditLogsStats() {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.moderator.auditLogs(), 'stats'],
    queryFn: () => api.moderator.auditLogs.getStats(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching system events
 */
export function useSystemEvents(params: SystemEventParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.moderator.all, 'systemEvents', 'list', params],
    queryFn: () => api.moderator.systemEvents.getList(params),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchInterval: REFETCH_INTERVAL.MODERATE, // Auto-refresh every 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus for system events
  });
}

/**
 * Hook for resolving system events
 */
export function useResolveSystemEvent() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      eventId, 
      resolution 
    }: { 
      eventId: string; 
      resolution: string 
    }) => api.moderator.systemEvents.resolve(eventId, resolution),
    onSuccess: (result, { eventId }) => {
      toast.success('System event resolved successfully!');
      
      // Invalidate system events
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.moderator.all, 'systemEvents'] 
      });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.dashboard() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to resolve system event');
    },
  });
}

/**
 * Hook for fetching moderator profile
 */
export function useModeratorProfile() {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.profile.all, 'moderator'],
    queryFn: () => api.moderator.profile.get(),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for updating moderator profile
 */
export function useUpdateModeratorProfile() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Moderator>) => api.moderator.profile.update(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      
      // Invalidate profile cache
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.profile.all, 'moderator'] 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update profile');
    },
  });
}

/**
 * Hook for fetching moderator activity statistics
 */
export function useModeratorActivity() {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.moderator.all, 'activity'],
    queryFn: () => api.moderator.profile.getActivity(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for prefetching content for moderation
 */
export function usePrefetchContentForModeration() {
  const queryClient = useQueryClient();
  const api = useApi();
  
  return (contentType: 'post' | 'comment', contentId: string) => {
    // Prefetch content details for faster moderation
    if (contentType === 'post') {
      queryClient.prefetchQuery({
        queryKey: ['posts', 'detail', contentId],
        queryFn: () => api.posts.getById(contentId),
        staleTime: STALE_TIME.MEDIUM, // 5 minutes
        gcTime: GC_TIME.MEDIUM, // 10 minutes
      });
    } else {
      queryClient.prefetchQuery({
        queryKey: ['comments', 'detail', contentId],
        queryFn: () => api.comments.getById(contentId),
        staleTime: STALE_TIME.MEDIUM, // 5 minutes
        gcTime: GC_TIME.MEDIUM, // 10 minutes
      });
    }
  };
}

/**
 * Hook for bulk moderation actions
 */
export function useBulkModeration() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      items, 
      action, 
      reason 
    }: { 
      items: { type: 'post' | 'comment'; id: string }[]; 
      action: 'approve' | 'reject' | 'flag' | 'remove'; 
      reason?: string 
    }) => {
      // Execute moderation actions in parallel
      const results = await Promise.allSettled(
        items.map(item => 
          api.moderator.content.moderate(item.type, item.id, { 
            action, 
            reason, 
            note: 'Bulk moderation action' 
          })
        )
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return { successful, failed, total: items.length };
    },
    onSuccess: ({ successful, failed, total }) => {
      if (failed === 0) {
        toast.success(`Successfully processed ${successful} items`);
      } else {
        toast.warning(`Processed ${successful} items, ${failed} failed`);
      }
      
      // Invalidate all moderation-related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.contentQueue() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.flaggedContent() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.dashboard() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Bulk moderation failed');
    },
  });
}