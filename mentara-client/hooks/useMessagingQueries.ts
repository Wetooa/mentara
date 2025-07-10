import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys, getRelatedQueryKeys } from '@/lib/queryKeys';
import { Contact, Conversation, Message } from '@/components/messages/types';
import { toast } from 'sonner';

// Hook to fetch current user (for messaging context)
export function useCurrentUser() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.messaging.currentUser(),
    queryFn: () => api.messaging.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

// Hook to fetch contacts (conversations as contacts)
export function useMessagingContacts() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.messaging.contacts.all(),
    queryFn: async () => {
      try {
        const currentUser = await api.messaging.getCurrentUser();
        const conversations = await api.messaging.getConversations();
        
        // Ensure conversations is an array
        if (!Array.isArray(conversations)) {
          console.warn('getConversations returned non-array:', conversations);
          return [];
        }
        
        return (conversations || []).map((conv: any) => {
          // Find the other participant (not the current user)
          const otherParticipant = conv.participants?.find(
            (p: any) => p.userId !== currentUser.id
          );
          
          if (!otherParticipant) {
            console.warn('No other participant found in conversation:', conv.id);
            return null;
          }
          
          const lastMessage = conv.messages?.[0];
          
          const contact: Contact = {
            id: conv.id, // Use conversation ID as contact ID
            name: `${otherParticipant.user?.firstName || ''} ${otherParticipant.user?.lastName || ''}`.trim() || 'Unknown User',
            status: "offline" as const, // Will be updated via WebSocket
            lastMessage: lastMessage?.content || "",
            time: lastMessage?.createdAt || conv.updatedAt,
            unread: conv._count?.messages || 0,
            avatar: otherParticipant.user?.avatarUrl || "/avatar-placeholder.png",
            isTyping: false,
          };
          
          return contact;
        }).filter((contact): contact is Contact => contact !== null); // Remove null entries
      } catch (error) {
        console.error('Error fetching messaging contacts:', error);
        // Return empty array on error to prevent app crashes
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors (401, 403)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook to fetch messages for a specific conversation
export function useConversation(conversationId: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.messaging.messages.byConversation(conversationId),
    queryFn: async () => {
      const currentUser = await api.messaging.getCurrentUser();
      const messages = await api.messaging.getConversationMessages(conversationId);
      
      const convertedMessages: Message[] = (messages || []).map((msg: any) => ({
        id: msg.id,
        sender: msg.senderId === currentUser.id ? 'me' : 'them',
        text: msg.content,
        time: msg.createdAt,
        status: 'delivered' as const, // Could be enhanced based on read receipts
        attachments: msg.attachmentUrl ? [{
          id: `attachment-${msg.id}`,
          type: msg.messageType === 'IMAGE' ? 'image' : 'document',
          url: msg.attachmentUrl,
          name: msg.attachmentName || 'Attachment',
          size: msg.attachmentSize || 0,
        }] : undefined,
        reactions: msg.reactions?.map((r: any) => ({
          emoji: r.emoji,
          count: 1,
          users: [r.userId],
        })) || [],
      }));
      
      const conversation: Conversation = {
        id: conversationId,
        contactId: conversationId,
        messages: convertedMessages,
        lastReadMessageId: undefined, // TODO: Implement based on read receipts
      };
      
      return conversation;
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
    retry: 2,
  });
}

// Hook to send a message
export function useSendMessage() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      content, 
      attachments 
    }: {
      conversationId: string;
      content: string;
      attachments?: { name: string; url: string; type: string }[];
    }) => {
      const messageData = {
        content,
        messageType: 'TEXT' as const,
        ...(attachments?.[0] && {
          attachmentUrl: attachments[0].url,
          attachmentName: attachments[0].name,
          attachmentSize: 0, // TODO: Calculate actual size
        }),
      };
      
      return api.messaging.sendMessage(conversationId, messageData);
    },
    onMutate: async ({ conversationId, content }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.messaging.messages.byConversation(conversationId) 
      });
      
      // Snapshot the previous value
      const previousConversation = queryClient.getQueryData(
        queryKeys.messaging.messages.byConversation(conversationId)
      );
      
      // Optimistically update the conversation
      queryClient.setQueryData(
        queryKeys.messaging.messages.byConversation(conversationId),
        (old: any) => {
          if (!old) return old;
          
          const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            sender: 'me',
            text: content,
            time: new Date().toISOString(),
            status: 'sent',
          };
          
          return {
            ...old,
            messages: [...old.messages, optimisticMessage],
          };
        }
      );
      
      return { previousConversation };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousConversation) {
        queryClient.setQueryData(
          queryKeys.messaging.messages.byConversation(variables.conversationId),
          context.previousConversation
        );
      }
      
      console.error('Error sending message:', err);
      toast.error('Failed to send message. Please try again.');
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch conversation
      queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.messages.byConversation(variables.conversationId)
      });
      
      // Invalidate contacts to update last message
      queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.contacts.all()
      });
    },
  });
}

// Hook to mark message as read
export function useMarkMessageAsRead() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: string) => api.messaging.markMessageAsRead(messageId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.all
      });
    },
    onError: (err) => {
      console.error('Error marking message as read:', err);
    },
  });
}

// Hook to add message reaction
export function useAddMessageReaction() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) => 
      api.messaging.addMessageReaction(messageId, { emoji }),
    onSuccess: () => {
      // Invalidate message queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.messages.all()
      });
    },
    onError: (err) => {
      console.error('Error adding reaction:', err);
      toast.error('Failed to add reaction');
    },
  });
}

// Hook to remove message reaction
export function useRemoveMessageReaction() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) => 
      api.messaging.removeMessageReaction(messageId, emoji),
    onSuccess: () => {
      // Invalidate message queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.messages.all()
      });
    },
    onError: (err) => {
      console.error('Error removing reaction:', err);
      toast.error('Failed to remove reaction');
    },
  });
}

// Hook to search messages
export function useSearchMessages(query: string, conversationId?: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.messaging.messages.search(query, conversationId),
    queryFn: async () => {
      const currentUser = await api.messaging.getCurrentUser();
      const messages = await api.messaging.searchMessages({ query, conversationId });
      
      return (messages || []).map((msg: any): Message => ({
        id: msg.id,
        sender: msg.senderId === currentUser.id ? 'me' : 'them',
        text: msg.content,
        time: msg.createdAt,
        status: 'delivered' as const,
        attachments: msg.attachmentUrl ? [{
          id: `attachment-${msg.id}`,
          type: msg.messageType === 'IMAGE' ? 'image' : 'document',
          url: msg.attachmentUrl,
          name: msg.attachmentName || 'Attachment',
          size: msg.attachmentSize || 0,
        }] : undefined,
        reactions: msg.reactions?.map((r: any) => ({
          emoji: r.emoji,
          count: 1,
          users: [r.userId],
        })) || [],
      }));
    },
    enabled: !!query && query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

// Hook to block user
export function useBlockUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => 
      api.messaging.blockUser({ userId, reason }),
    onSuccess: () => {
      // Invalidate contacts to remove blocked user
      queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.contacts.all()
      });
      
      toast.success('User blocked successfully');
    },
    onError: (err) => {
      console.error('Error blocking user:', err);
      toast.error('Failed to block user');
    },
  });
}

// Hook to unblock user
export function useUnblockUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => api.messaging.unblockUser(userId),
    onSuccess: () => {
      // Invalidate contacts to potentially add unblocked user back
      queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.contacts.all()
      });
      
      toast.success('User unblocked successfully');
    },
    onError: (err) => {
      console.error('Error unblocking user:', err);
      toast.error('Failed to unblock user');
    },
  });
}