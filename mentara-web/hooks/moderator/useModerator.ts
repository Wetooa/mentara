import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

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
    queryKey: ['moderator', 'dashboard'],
    queryFn: () => api.moderator.getDashboardStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes (dashboard data changes frequently)
  });
}

/**
 * Hook for fetching content moderation queue
 */
export function useContentModerationQueue(params: ContentModerationParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['moderator', 'content', 'queue', params],
    queryFn: () => api.moderator.content.getQueue(params),
    staleTime: 1000 * 60 * 1, // 1 minute (moderation queue is very dynamic)
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
        queryKey: ['moderator', 'content'] 
      });
      
      // Invalidate content moderation data
      queryClient.invalidateQueries({ 
        queryKey: ['contentModeration'] 
      });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ 
        queryKey: ['moderator', 'dashboard'] 
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
    queryKey: ['moderator', 'content', 'reports', params],
    queryFn: () => api.moderator.content.getReports(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
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
        queryKey: ['moderator', 'content'] 
      });
      
      // Invalidate dashboard if resolved
      if (data.status === 'resolved') {
        queryClient.invalidateQueries({ 
          queryKey: ['moderator', 'dashboard'] 
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
    queryKey: ['moderator', 'users', 'flagged', params],
    queryFn: () => api.moderator.users.getFlagged(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
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
        queryKey: ['moderator', 'users'] 
      });
      
      // Invalidate specific user data
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'users', 'detail', userId] 
      });
      
      // Invalidate content moderation if user was suspended
      if (data.action === 'suspend') {
        queryClient.invalidateQueries({ 
          queryKey: ['contentModeration', 'userViolations', userId] 
        });
      }
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ 
        queryKey: ['moderator', 'dashboard'] 
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
    queryKey: ['moderator', 'users', 'history', userId || ''],
    queryFn: () => api.moderator.users.getHistory(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for searching audit logs
 */
export function useAuditLogsSearch(params: AuditLogParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['moderator', 'auditLogs', 'search', params],
    queryFn: () => api.moderator.auditLogs.search(params),
    staleTime: 1000 * 60 * 5, // 5 minutes (audit logs are relatively stable)
  });
}

/**
 * Hook for fetching audit logs statistics
 */
export function useAuditLogsStats() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['moderator', 'auditLogs', 'stats'],
    queryFn: () => api.moderator.auditLogs.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for fetching system events
 */
export function useSystemEvents(params: SystemEventParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['moderator', 'systemEvents', 'list', params],
    queryFn: () => api.moderator.systemEvents.getList(params),
    staleTime: 1000 * 60 * 2, // 2 minutes (system events are dynamic)
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
        queryKey: ['moderator', 'systemEvents'] 
      });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ 
        queryKey: ['moderator', 'dashboard'] 
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
    queryKey: ['moderator', 'profile'],
    queryFn: () => api.moderator.profile.get(),
    staleTime: 1000 * 60 * 10, // 10 minutes
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
        queryKey: ['moderator', 'profile'] 
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
    queryKey: ['moderator', 'activity'],
    queryFn: () => api.moderator.profile.getActivity(),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
        staleTime: 1000 * 60 * 5,
      });
    } else {
      queryClient.prefetchQuery({
        queryKey: ['comments', 'detail', contentId],
        queryFn: () => api.comments.getById(contentId),
        staleTime: 1000 * 60 * 5,
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
        queryKey: ['moderator', 'content'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['contentModeration'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['moderator', 'dashboard'] 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Bulk moderation failed');
    },
  });
}