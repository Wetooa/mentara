import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME, REFETCH_INTERVAL } from '@/lib/constants/react-query';
import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { Post, Comment, ContentModerationParams, ModerateContentRequest } from '@/types/api';

/**
 * Hook for fetching content moderation queue
 */
export function useModeratorContentQueue(params: ContentModerationParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.moderator.contentQueue(params),
    queryFn: () => api.moderator.content.getQueue(params),
    staleTime: STALE_TIME.VERY_SHORT, // 30 seconds
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchInterval: REFETCH_INTERVAL.FREQUENT, // Auto-refresh every minute
    refetchOnWindowFocus: true, // Refetch on focus for moderation queue
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
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
    onMutate: async ({ contentId }) => {
      // Cancel outgoing refetches for content queue
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.moderator.contentQueue() 
      });
      
      // Optimistically remove item from queue
      queryClient.setQueriesData(
        { queryKey: queryKeys.moderator.contentQueue() },
        (old: any) => {
          if (!old?.content) return old;
          return {
            ...old,
            content: old.content.filter((item: any) => item.id !== contentId),
            total: Math.max(0, (old.total || 0) - 1)
          };
        }
      );
      
      return { contentId };
    },
    onSuccess: (result, { data }) => {
      toast.success(`Content ${data.action}d successfully!`);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.dashboard() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.flaggedContent() 
      });
    },
    onError: (error: MentaraApiError, variables, context) => {
      toast.error(error?.message || 'Failed to moderate content');
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.contentQueue() 
      });
    },
  });
}