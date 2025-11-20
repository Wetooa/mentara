"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME } from '@/lib/constants/react-query';
import { Contact } from '@/components/messages/types';
import { ConversationResponseDto } from '@/types/api/messaging';
import { useAuth } from '@/contexts/AuthContext';

// Transform conversation to contact format for UI compatibility
const transformConversationToContact = (conversation: ConversationResponseDto, currentUserId: string): Contact => {
  // Find the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );

  if (!otherParticipant) {
    throw new Error("No other participant found in conversation");
  }

  return {
    id: conversation.id,
    name: `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`,
    status: 'offline' as const, // Will be updated via WebSocket
    lastMessage: conversation.lastMessage?.content || '',
    time: conversation.lastMessage ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    unread: conversation.unreadCount || 0,
    avatar: otherParticipant.user.avatarUrl || '/avatar-placeholder.png',
    isTyping: false,
  };
};

export function useContacts() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch contacts (derived from conversations)
  const {
    data: contacts = [],
    isLoading,
    error: queryError,
    refetch: loadContacts
  } = useQuery({
    queryKey: queryKeys.messaging.contacts(),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const conversations = await api.messaging.getConversations({
        includeArchived: false,
        limit: 100
      });
      
      return conversations.map((conv) => transformConversationToContact(conv, user.id));
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: true,
  });

  // Search contacts mutation (searches within existing conversations)
  const searchContactsMutation = useMutation({
    mutationFn: async (query: string): Promise<Contact[]> => {
      if (!query.trim() || !user?.id) return contacts;
      
      const searchResults = await api.messaging.searchMessages({
        query,
        limit: 50
      });
      
      // Extract unique conversations from search results
      const conversationIds = Array.from(new Set(searchResults.map(msg => msg.conversationId)));
      
      // Get full conversation data for each result
      const conversations = await Promise.all(
        conversationIds.map(id => api.messaging.getConversation(id))
      );
      
      return conversations.map(conv => transformConversationToContact(conv, user.id));
    },
  });

  // Add contact (start new conversation)
  const addContactMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await api.messaging.startDirectConversation(userId);
    },
    onSuccess: () => {
      // Invalidate and refetch contacts
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.contacts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations() });
    },
  });

  // Remove contact (archive conversation)
  const removeContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      return await api.messaging.archiveConversation(contactId);
    },
    onSuccess: (_, contactId) => {
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.messaging.contacts(), (oldContacts: Contact[] = []) => 
        oldContacts.filter(c => c.id !== contactId)
      );
      
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations() });
    },
  });

  const searchContacts = async (query: string): Promise<Contact[]> => {
    const result = await searchContactsMutation.mutateAsync(query);
    return result;
  };

  const addContact = async (userId: string) => {
    await addContactMutation.mutateAsync(userId);
  };

  const removeContact = async (contactId: string) => {
    await removeContactMutation.mutateAsync(contactId);
  };

  return {
    contacts,
    isLoading: isLoading || addContactMutation.isPending || removeContactMutation.isPending,
    error: queryError?.message || addContactMutation.error?.message || removeContactMutation.error?.message || null,
    loadContacts,
    searchContacts,
    addContact,
    removeContact,
  };
}