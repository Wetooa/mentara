"use client";

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME } from '@/lib/constants/react-query';
import { Conversation, Message } from '@/components/messages/types';
import { MessageResponseDto, SendMessageDto } from '@/types/api/messaging';
import type { MessageAttachment } from '@/types/api/messaging';

// Transform API message to UI format for backward compatibility
const transformMessageToUIFormat = (message: MessageResponseDto, currentUserId?: string): Message => {
  return {
    id: message.id,
    sender: message.authorId === currentUserId ? 'me' : 'them', // Compare against actual current user ID
    text: message.content,
    time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: message.status === 'read' ? 'read' : message.status === 'delivered' ? 'delivered' : 'sent',
    attachments: message.attachments?.map(url => ({
      id: `attachment-${message.id}`,
      type: getAttachmentTypeFromUrl(url),
      url,
      name: url.split('/').pop() || 'Attachment',
    })),
    reactions: message.reactions?.map(reaction => ({
      emoji: reaction.emoji,
      count: reaction.count,
      users: reaction.users,
    })),
    replyTo: message.replyToMessageId,
    isDeleted: false,
  } as Message;
};

const getAttachmentTypeFromUrl = (url: string): 'image' | 'document' | 'audio' | 'video' => {
  const extension = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) return 'audio';
  return 'document';
};

export function useConversations() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Get conversations with messages
  const getConversationQuery = (conversationId: string) =>
    useQuery({
      queryKey: queryKeys.messaging.conversation(user?.id || '', conversationId),
      queryFn: async () => {
        const [conversation, messages] = await Promise.all([
          api.messaging.getConversation(conversationId),
          api.messaging.getMessages(conversationId, { limit: 50 })
        ]);

        const transformedMessages = messages.map(msg => transformMessageToUIFormat(msg, user?.id));
        
        return {
          id: conversationId,
          contactId: conversationId,
          messages: transformedMessages,
          lastMessage: transformedMessages[transformedMessages.length - 1] || null,
          unreadCount: conversation.unreadCount || 0,
          isTyping: false,
        } as Conversation;
      },
      enabled: !!conversationId && !!user?.id,
      staleTime: 1000 * 30, // 30 seconds for active conversations
      gcTime: GC_TIME.MEDIUM, // 10 minutes
      refetchOnWindowFocus: true,
    });

  // Currently selected conversation
  const selectedConversationQuery = selectedContactId ? getConversationQuery(selectedContactId) : null;

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, text, attachments }: { 
      conversationId: string; 
      text: string; 
      attachments?: MessageAttachment[] 
    }) => {
      const messageData: SendMessageDto = {
        content: text,
        type: 'text',
        ...(attachments?.[0] && {
          attachments: [attachments[0].url],
          attachmentName: attachments[0].fileName,
          attachmentSize: attachments[0].fileSize,
        }),
      };

      return await api.messaging.sendMessage(conversationId, messageData);
    },
    onSuccess: (newMessage, { conversationId }) => {
      // Optimistically update the conversation cache
      if (!user?.id) return;
      queryClient.setQueryData(
        queryKeys.messaging.conversation(user.id, conversationId),
        (oldConversation: Conversation | undefined) => {
          if (!oldConversation) return oldConversation;

          const transformedMessage = transformMessageToUIFormat(newMessage, user?.id);
          return {
            ...oldConversation,
            messages: [...oldConversation.messages, transformedMessage],
            lastMessage: transformedMessage,
          };
        }
      );

      // Also invalidate contacts to update last message
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messaging.contacts(user.id) });
      }
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => api.messaging.markMessageAsRead(messageId),
    onSuccess: (_, messageId) => {
      // Update all conversations that might contain this message
      queryClient.setQueriesData(
        { queryKey: queryKeys.messaging.all },
        (oldConversation: Conversation | undefined) => {
          if (!oldConversation) return oldConversation;

          const updatedMessages = oldConversation.messages.map(msg =>
            msg.id === messageId ? { ...msg, status: 'read' as const } : msg
          );

          return {
            ...oldConversation,
            messages: updatedMessages,
            unreadCount: Math.max(0, oldConversation.unreadCount - 1),
          };
        }
      );
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      api.messaging.addReaction(messageId, emoji),
    onSuccess: (_, { messageId, emoji }) => {
      // Update the message in all conversations
      queryClient.setQueriesData(
        { queryKey: ['messaging', 'conversation'] },
        (oldConversation: Conversation | undefined) => {
          if (!oldConversation) return oldConversation;

          const updatedMessages = oldConversation.messages.map(msg => {
            if (msg.id !== messageId) return msg;

            const reactions = msg.reactions || [];
            const existingReaction = reactions.find(r => r.emoji === emoji);

            if (existingReaction) {
              // Update existing reaction
              return {
                ...msg,
                reactions: reactions.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count + 1, users: [...r.users, user?.id || 'current-user'] }
                    : r
                ),
              };
            } else {
              // Add new reaction
              return {
                ...msg,
                reactions: [...reactions, { emoji, count: 1, users: [user?.id || 'current-user'] }],
              };
            }
          });

          return { ...oldConversation, messages: updatedMessages };
        }
      );
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      api.messaging.removeReaction(messageId, emoji),
    onSuccess: (_, { messageId, emoji }) => {
      // Update the message in all conversations
      queryClient.setQueriesData(
        { queryKey: ['messaging', 'conversation'] },
        (oldConversation: Conversation | undefined) => {
          if (!oldConversation) return oldConversation;

          const updatedMessages = oldConversation.messages.map(msg => {
            if (msg.id !== messageId) return msg;

            const reactions = (msg.reactions || [])
              .map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== user?.id) }
                  : r
              )
              .filter(r => r.count > 0);

            return { ...msg, reactions };
          });

          return { ...oldConversation, messages: updatedMessages };
        }
      );
    },
  });

  // Search messages mutation
  const searchMessagesMutation = useMutation({
    mutationFn: (query: string) => api.messaging.searchMessages({ query, limit: 100 }),
  });

  // Create conversations map from cached data
  const conversations = new Map<string, Conversation>();
  if (selectedContactId && selectedConversationQuery?.data) {
    conversations.set(selectedContactId, selectedConversationQuery.data);
  }

  // Hook methods
  const selectContact = useCallback(async (contactId: string) => {
    setSelectedContactId(contactId);
    
    // Prefetch conversation data
    if (!user?.id) return;
    queryClient.prefetchQuery({
      queryKey: queryKeys.messaging.conversation(user.id, contactId),
      queryFn: async () => {
        const [conversation, messages] = await Promise.all([
          api.messaging.getConversation(contactId),
          api.messaging.getMessages(contactId, { limit: 50 })
        ]);

        const transformedMessages = messages.map(msg => transformMessageToUIFormat(msg, user?.id));
        
        return {
          id: contactId,
          contactId,
          messages: transformedMessages,
          lastMessage: transformedMessages[transformedMessages.length - 1] || null,
          unreadCount: conversation.unreadCount || 0,
          isTyping: false,
        } as Conversation;
      },
    });
  }, [api.messaging, queryClient, user?.id]);

  const sendMessage = useCallback(async (text: string, attachments?: MessageAttachment[]) => {
    if (!selectedContactId) throw new Error('No conversation selected');
    
    await sendMessageMutation.mutateAsync({ 
      conversationId: selectedContactId, 
      text, 
      attachments 
    });
  }, [selectedContactId, sendMessageMutation]);

  const markAsRead = useCallback(async (messageId: string) => {
    await markAsReadMutation.mutateAsync(messageId);
  }, [markAsReadMutation]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    await addReactionMutation.mutateAsync({ messageId, emoji });
  }, [addReactionMutation]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    await removeReactionMutation.mutateAsync({ messageId, emoji });
  }, [removeReactionMutation]);

  const searchMessages = useCallback(async (query: string): Promise<Message[]> => {
    const results = await searchMessagesMutation.mutateAsync(query);
    return results.map(msg => transformMessageToUIFormat(msg, user?.id));
  }, [searchMessagesMutation, user?.id]);

  return {
    conversations,
    selectedContactId,
    isLoadingMessages: selectedConversationQuery?.isLoading || false,
    error: selectedConversationQuery?.error?.message || 
           sendMessageMutation.error?.message || 
           markAsReadMutation.error?.message || 
           addReactionMutation.error?.message || 
           removeReactionMutation.error?.message || 
           null,
    selectContact,
    sendMessage,
    markAsRead,
    addReaction,
    removeReaction,
    searchMessages,
  };
}