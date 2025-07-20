import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys, getRelatedQueryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { 
  FlaggedContent,
  ModerationAction,
  ModerationStats,
  ContentModerationFilters,
  BulkModerationRequest,
  ReportSubmission,
  ModerationReport
} from '@/types/api';

/**
 * Hook for fetching flagged content with comprehensive filtering
 */
export function useFlaggedContent(filters: ContentModerationFilters = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.contentModeration.flaggedContent(filters),
    queryFn: () => api.contentModeration.getFlaggedContent(filters),
    staleTime: 1000 * 60 * 1, // 1 minute (very dynamic data)
    select: (response) => {
      // Transform the response to include both content and metadata
      return {
        content: response.data?.content || [],
        total: response.data?.total || 0,
        stats: response.data?.stats || {
          totalReports: 0,
          pendingReports: 0,
          resolvedToday: 0,
          flaggedContent: 0,
          suspendedUsers: 0,
          averageResponseTime: 0,
          topReportReasons: []
        }
      };
    },
  });
}

/**
 * Hook for moderating individual content items
 */
export function useModerateContent() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      contentType, 
      contentId, 
      action, 
      reason, 
      note 
    }: { 
      contentType: 'post' | 'comment'; 
      contentId: string; 
      action: 'approve' | 'reject' | 'remove'; 
      reason: string; 
      note?: string 
    }) => api.contentModeration.moderateContent(contentType, contentId, action, reason, note),
    onMutate: async ({ contentId, action }) => {
      // Cancel outgoing refetches for flagged content
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.contentModeration.all 
      });
      
      // Optimistically update flagged content list
      queryClient.setQueriesData(
        { queryKey: queryKeys.contentModeration.all },
        (old: any) => {
          if (!old?.data?.content) return old;
          
          return {
            ...old,
            data: {
              ...old.data,
              content: old.data.content.filter((item: FlaggedContent) => item.id !== contentId)
            }
          };
        }
      );
      
      return { contentId, action };
    },
    onSuccess: (result, { action, contentType }) => {
      toast.success(`Content ${action}d successfully!`);
      
      // Invalidate all content moderation queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contentModeration.all 
      });
      
      // Invalidate moderator dashboard
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.dashboard() 
      });
      
      // Invalidate related content queries
      if (contentType === 'post') {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      }
    },
    onError: (error: MentaraApiError, variables, context) => {
      toast.error(error?.message || 'Failed to moderate content');
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contentModeration.all 
      });
    },
  });
}

/**
 * Hook for bulk moderation actions
 */
export function useBulkModerate() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: BulkModerationRequest) => 
      api.contentModeration.bulkModerate(request),
    onSuccess: (result) => {
      const { successful, failed, total } = result.data || result;
      
      if (failed === 0) {
        toast.success(`Successfully moderated ${successful} items`);
      } else {
        toast.warning(`Moderated ${successful}/${total} items. ${failed} failed.`);
      }
      
      // Invalidate all content moderation queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contentModeration.all 
      });
      
      // Invalidate moderator dashboard
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.dashboard() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Bulk moderation failed');
    },
  });
}

/**
 * Hook for fetching moderation reports
 */
export function useModerationReports(filters: { status?: string; type?: string; priority?: string; limit?: number; offset?: number } = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.contentModeration.reports(filters),
    queryFn: () => api.contentModeration.getReports(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for updating moderation report status
 */
export function useUpdateReport() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      reportId, 
      status, 
      resolution 
    }: { 
      reportId: string; 
      status: 'pending' | 'resolved' | 'dismissed'; 
      resolution?: string 
    }) => api.contentModeration.updateReport(reportId, status, resolution),
    onSuccess: (result, { status }) => {
      toast.success(`Report ${status} successfully!`);
      
      // Invalidate reports
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contentModeration.reports() 
      });
      
      // Invalidate stats if resolved
      if (status === 'resolved') {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.contentModeration.stats() 
        });
      }
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update report');
    },
  });
}

/**
 * Hook for submitting new moderation reports
 */
export function useSubmitReport() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (report: ReportSubmission) => 
      api.contentModeration.submitReport(report),
    onSuccess: (result) => {
      toast.success('Report submitted successfully!');
      
      // Invalidate reports lists
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contentModeration.reports() 
      });
      
      // Invalidate flagged content (new report might change priority/status)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contentModeration.flaggedContent() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to submit report');
    },
  });
}

/**
 * Hook for fetching user violations and moderation history
 */
export function useUserViolations(userId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.contentModeration.userViolations(userId || ''),
    queryFn: () => api.contentModeration.getUserViolations(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for moderating users (warn, suspend, unsuspend)
 */
export function useModerateUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      action, 
      reason, 
      duration 
    }: { 
      userId: string; 
      action: 'warn' | 'suspend' | 'unsuspend'; 
      reason: string; 
      duration?: number 
    }) => api.contentModeration.moderateUser(userId, action, reason, duration),
    onSuccess: (result, { userId, action }) => {
      const actionText = action === 'suspend' ? 'suspended' : 
                        action === 'unsuspend' ? 'unsuspended' : 'warned';
      toast.success(`User ${actionText} successfully!`);
      
      // Invalidate user violations
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contentModeration.userViolations(userId) 
      });
      
      // Invalidate user data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.detail(userId) 
      });
      
      // Invalidate moderation stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contentModeration.stats() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to moderate user');
    },
  });
}

/**
 * Hook for fetching moderation statistics
 */
export function useModerationStats(dateFrom?: string, dateTo?: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.contentModeration.stats(dateFrom, dateTo),
    queryFn: () => api.contentModeration.getModerationStats(dateFrom, dateTo),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for fetching moderation history/actions
 */
export function useModerationHistory(filters: { moderatorId?: string; limit?: number; offset?: number } = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.contentModeration.history(filters),
    queryFn: () => api.contentModeration.getModerationHistory(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for fetching automated moderation rules
 */
export function useAutoModerationRules() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.contentModeration.autoRules(),
    queryFn: () => api.contentModeration.getAutoModerationRules(),
    staleTime: 1000 * 60 * 10, // 10 minutes (rules don't change often)
  });
}

/**
 * Hook for updating automated moderation rules
 */
export function useUpdateAutoModerationRules() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rules: any[]) => 
      api.contentModeration.updateAutoModerationRules(rules),
    onSuccess: () => {
      toast.success('Auto-moderation rules updated successfully!');
      
      // Invalidate auto-moderation rules
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contentModeration.autoRules() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update auto-moderation rules');
    },
  });
}

/**
 * Hook for fetching content preview for moderation
 */
export function useContentPreview(contentType: 'post' | 'comment' | null, contentId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.contentModeration.preview(contentType || '', contentId || ''),
    queryFn: () => api.contentModeration.getContentPreview(contentType!, contentId!),
    enabled: !!(contentType && contentId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for smart content filtering based on priority and type
 */
export function useSmartContentFilter() {
  const queryClient = useQueryClient();
  
  const getHighPriorityContent = (filters: ContentModerationFilters = {}) => {
    return useQuery({
      queryKey: [...queryKeys.contentModeration.flaggedContent(filters), 'highPriority'],
      queryFn: () => api.contentModeration.getFlaggedContent({
        ...filters,
        priority: 'high',
        sortBy: 'priority',
        sortOrder: 'desc',
        limit: 10
      }),
      staleTime: 1000 * 30, // 30 seconds for high priority
    });
  };
  
  const getRecentContent = (filters: ContentModerationFilters = {}) => {
    return useQuery({
      queryKey: [...queryKeys.contentModeration.flaggedContent(filters), 'recent'],
      queryFn: () => api.contentModeration.getFlaggedContent({
        ...filters,
        sortBy: 'lastReportedAt',
        sortOrder: 'desc',
        limit: 20
      }),
      staleTime: 1000 * 60, // 1 minute for recent content
    });
  };
  
  return {
    getHighPriorityContent,
    getRecentContent,
  };
}

/**
 * Hook for moderation workflow automation
 */
export function useModerationWorkflow() {
  const queryClient = useQueryClient();
  const moderateContent = useModerateContent();
  const moderateUser = useModerateUser();
  
  const processViolation = useMutation({
    mutationFn: async ({ 
      contentId, 
      contentType, 
      userId, 
      violationType, 
      severity 
    }: {
      contentId: string;
      contentType: 'post' | 'comment';
      userId: string;
      violationType: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }) => {
      // Workflow logic based on severity
      let contentAction: 'approve' | 'reject' | 'remove' = 'remove';
      let userAction: 'warn' | 'suspend' | 'unsuspend' | null = null;
      let suspensionDuration = 0;
      
      switch (severity) {
        case 'low':
          contentAction = 'reject';
          userAction = 'warn';
          break;
        case 'medium':
          contentAction = 'remove';
          userAction = 'warn';
          break;
        case 'high':
          contentAction = 'remove';
          userAction = 'suspend';
          suspensionDuration = 7; // 7 days
          break;
        case 'critical':
          contentAction = 'remove';
          userAction = 'suspend';
          suspensionDuration = 30; // 30 days
          break;
      }
      
      // Execute content moderation
      await moderateContent.mutateAsync({
        contentType,
        contentId,
        action: contentAction,
        reason: `Automated workflow: ${violationType} violation (${severity})`,
        note: 'Processed via automated moderation workflow'
      });
      
      // Execute user moderation if needed
      if (userAction && userAction !== 'unsuspend') {
        await moderateUser.mutateAsync({
          userId,
          action: userAction,
          reason: `${violationType} violation (${severity})`,
          duration: suspensionDuration > 0 ? suspensionDuration : undefined
        });
      }
      
      return { contentAction, userAction, severity };
    },
    onSuccess: ({ contentAction, userAction, severity }) => {
      toast.success(`Violation processed: content ${contentAction}d, user ${userAction || 'no action'}`);
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.contentModeration.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.moderator.dashboard() });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to process violation');
    },
  });
  
  return {
    processViolation,
    isProcessing: processViolation.isPending,
  };
}