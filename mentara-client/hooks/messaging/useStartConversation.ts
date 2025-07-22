import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { MessagingConversation } from '@/lib/api/services/messaging';

interface StartConversationParams {
  targetUserId: string;
  navigateOnSuccess?: boolean;
}

interface StartConversationOptions {
  onSuccess?: (conversation: MessagingConversation) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for starting direct conversations with other users
 * Handles finding existing conversations or creating new ones
 * Supports navigation to messages page with conversation context
 */
export function useStartConversation(options: StartConversationOptions = {}) {
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  const startConversationMutation = useMutation({
    mutationFn: async (params: StartConversationParams) => {
      const { targetUserId } = params;

      // Validate input parameters
      if (!targetUserId) {
        throw new Error('Target user ID is required');
      }

      if (!targetUserId.trim()) {
        throw new Error('Invalid target user ID');
      }

      // Validate: prevent self-chat
      if (targetUserId === user?.id) {
        throw new Error('Cannot start conversation with yourself');
      }

      // Validate: user must be authenticated
      if (!user?.id) {
        throw new Error('You must be logged in to start conversations');
      }

      // Role-based validation: ensure current user can initiate conversations
      if (user.role && !['client', 'therapist', 'moderator', 'admin'].includes(user.role)) {
        throw new Error('Your account type cannot initiate conversations');
      }

      // Call the API to find or create direct conversation
      return await api.messaging.startDirectConversation(targetUserId);
    },
    onMutate: async () => {
      // Show loading state
      toast.loading('Starting conversation...', { id: 'start-conversation' });
    },
    onSuccess: (conversation, params) => {
      // Dismiss loading toast
      toast.dismiss('start-conversation');
      
      // Update conversations cache with the new/existing conversation
      queryClient.setQueryData<MessagingConversation[]>(
        queryKeys.messaging.conversations,
        old => {
          if (!old) return [conversation];
          
          // Check if conversation already exists in cache
          const existingIndex = old.findIndex(conv => conv.id === conversation.id);
          
          if (existingIndex >= 0) {
            // Update existing conversation
            const updated = [...old];
            updated[existingIndex] = conversation;
            return updated;
          } else {
            // Add new conversation to the beginning
            return [conversation, ...old];
          }
        }
      );

      // Navigate to messages page with the conversation context
      if (params.navigateOnSuccess !== false) {
        const messagesPath = user?.role === 'client' 
          ? `/client/messages?userId=${params.targetUserId}`
          : user?.role === 'therapist'
          ? `/therapist/messages?userId=${params.targetUserId}`
          : `/messages?userId=${params.targetUserId}`;
        
        router.push(messagesPath);
      }

      // Call custom success handler
      options.onSuccess?.(conversation);
      
      toast.success('Conversation started successfully');
    },
    onError: (error: Error, params) => {
      // Dismiss loading toast
      toast.dismiss('start-conversation');
      
      // Handle specific error cases with more detailed messages
      let errorMessage = 'Failed to start conversation';
      
      if (error.message.includes('yourself')) {
        errorMessage = 'Cannot start conversation with yourself';
      } else if (error.message.includes('logged in') || error.message.includes('authenticated')) {
        errorMessage = 'Please log in to start conversations';
      } else if (error.message.includes('account type') || error.message.includes('role')) {
        errorMessage = 'Your account type cannot start conversations';
      } else if (error.message.includes('Target user ID is required')) {
        errorMessage = 'Invalid user selected for conversation';
      } else if (error.message.includes('Invalid target user ID')) {
        errorMessage = 'Invalid user selected for conversation';
      } else if (error.message.includes('blocked')) {
        errorMessage = 'Cannot start conversation with this user';
      } else if (error.message.includes('permission')) {
        errorMessage = 'You do not have permission to message this user';
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        errorMessage = 'User not found or may no longer be available';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = 'Access denied - you cannot message this user';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Session expired - please log in again';
      } else if (error.message.includes('500') || error.message.includes('server')) {
        errorMessage = 'Server error - please try again later';
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorMessage = 'Connection error - please check your internet';
      }

      toast.error(errorMessage);
      
      // Call custom error handler
      options.onError?.(error);
      
      console.error('Failed to start conversation:', {
        error: error.message,
        targetUserId: params.targetUserId,
        currentUserId: user?.id,
        userRole: user?.role
      });
    },
  });

  /**
   * Start a direct conversation with another user
   * @param targetUserId - The user ID to start conversation with
   * @param navigateOnSuccess - Whether to navigate to messages page after success (default: true)
   */
  const startConversation = (targetUserId: string, navigateOnSuccess: boolean = true) => {
    startConversationMutation.mutate({ targetUserId, navigateOnSuccess });
  };

  return {
    startConversation,
    isStarting: startConversationMutation.isPending,
    error: startConversationMutation.error,
    data: startConversationMutation.data,
    reset: startConversationMutation.reset,
  };
}

/**
 * Simple hook for one-off conversation starts without state management
 * Useful for buttons that just need to trigger conversation creation
 */
export function useStartConversationSimple() {
  const { startConversation, isStarting } = useStartConversation();
  
  return {
    startConversation: (targetUserId: string) => startConversation(targetUserId, true),
    isStarting,
  };
}