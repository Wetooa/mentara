import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { User, UserModerationParams, ModerateUserRequest } from '@/types/api';

/**
 * Hook for fetching flagged users for moderation
 */
export function useModeratorFlaggedUsers(params: UserModerationParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['moderator', 'users', 'flagged', params],
    queryFn: () => api.moderator.users.getFlagged(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching user moderation history
 */
export function useModeratorUserHistory(userId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['moderator', 'users', 'history', userId || ''],
    queryFn: () => api.moderator.users.getHistory(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    onMutate: async ({ userId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['moderator', 'users'] 
      });
      
      // Optimistically update user status
      queryClient.setQueriesData(
        { queryKey: ['moderator', 'users'] },
        (old: any) => {
          if (!old?.users) return old;
          
          let newStatus = 'active';
          if (data.action === 'suspend') newStatus = 'suspended';
          else if (data.action === 'flag') newStatus = 'flagged';
          
          return {
            ...old,
            users: old.users.map((user: User) => 
              user.id === userId ? { ...user, status: newStatus } : user
            )
          };
        }
      );
      
      return { userId, data };
    },
    onSuccess: (result, { data }) => {
      const actionText = data.action === 'suspend' ? 'suspended' : 
                        data.action === 'warn' ? 'warned' : 
                        data.action === 'flag' ? 'flagged' : 'updated';
      toast.success(`User ${actionText} successfully!`);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['moderator', 'dashboard'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'users'] 
      });
    },
    onError: (error: MentaraApiError, variables, context) => {
      toast.error(error?.message || 'Failed to moderate user');
      
      // Revert optimistic update
      queryClient.invalidateQueries({ 
        queryKey: ['moderator', 'users'] 
      });
    },
  });
}