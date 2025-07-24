/**
 * Simplified messaging hook - replaces the complex 1300+ line useMessaging.ts
 * Uses React Query for HTTP operations + simple WebSocket for real-time events
 * Following the pattern: hooks > lib/api axios > REST > backend controller
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/lib/api';
import type { 
  MessagingMessage, 
  MessagingConversation, 
  SendMessageDto 
} from '@/lib/api/services/messaging';
import { useWebSocket } from '@/contexts/WebSocketContext';

export function useMessaging(options: UseMessagingOptions = {}) {
  const { 
    conversationId, 
    enableRealtime = true, 
    enableTypingIndicators = true 
  } = options;
  
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { 
    isConnected, 
    connectionState, 
    emit, 
    on, 
    reconnect 
  } = useWebSocket();
  
  // Local state for real-time features
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  // Refs for cleanup
  const eventUnsubscribers = useRef<(() => void)[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Query keys for React Query
  const queryKeys = {
    conversations: ['messaging', 'conversations'] as const,
    messages: (convId: string) => ['messaging', 'messages', convId] as const,
  };

  // ============ HTTP OPERATIONS (React Query) ============

  // Get conversations
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => api.messaging.getConversations(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get messages for current conversation
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: conversationId ? queryKeys.messages(conversationId) : [],
    queryFn: () => conversationId ? api.messaging.getMessages(conversationId) : Promise.resolve([]),
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Send message mutation with acknowledgment support
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, messageData }: { 
      conversationId: string; 
      messageData: SendMessageDto; 
    }) => {
      return api.messaging.sendMessage(conversationId, messageData);
    },
    onMutate: async ({ conversationId, messageData }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.messages(conversationId) });
      
      const previousMessages = queryClient.getQueryData<MessagingMessage[]>(
        queryKeys.messages(conversationId)
      );

      // Add optimistic message
      const tempMessage: MessagingMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: user?.id || '',
        content: messageData.content,
        messageType: messageData.type || 'TEXT',
        attachmentUrls: [],
        attachmentNames: [],
        attachmentSizes: [],
        replyToId: messageData.replyToMessageId || null,
        isEdited: false,
        isDeleted: false,
        editedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: user?.id || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          role: user?.role || 'client',
        },
        replyTo: null,
        reactions: [],
        readReceipts: [],
      };

      queryClient.setQueryData<MessagingMessage[]>(
        queryKeys.messages(conversationId),
        old => old ? [...old, tempMessage] : [tempMessage]
      );

      return { previousMessages, conversationId };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context) {
        queryClient.setQueryData(
          queryKeys.messages(context.conversationId),
          context.previousMessages
        );
      }
      toast.error('Failed to send message');
    },
    onSuccess: (newMessage, { conversationId }) => {
      // Replace temp message with real message
      queryClient.setQueryData<MessagingMessage[]>(
        queryKeys.messages(conversationId),
        old => {
          if (!old) return [newMessage];
          // Remove temp messages and prevent duplicates
          const filtered = old.filter(msg => 
            !msg.id.startsWith('temp-') && msg.id !== newMessage.id
          );
          return [...filtered, newMessage];
        }
      );

      // Update conversations list
      queryClient.setQueryData<MessagingConversation[]>(
        queryKeys.conversations,
        old => {
          if (!old) return old;
          return old.map(conv => 
            conv.id === conversationId 
              ? { ...conv, lastMessage: newMessage }
              : conv
          );
        }
      );
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => api.messaging.markMessageAsRead(messageId),
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      api.messaging.addReaction(messageId, emoji),
  });

  // ============ WEBSOCKET REAL-TIME EVENTS ============

  // Join conversation room when conversationId changes
  useEffect(() => {
    if (!enableRealtime || !conversationId || !isConnected) return;

    console.log('🚪 Joining conversation room:', conversationId);
    emit('join_conversation', { conversationId });

    return () => {
      console.log('🚪 Leaving conversation room:', conversationId);
      emit('leave_conversation', { conversationId });
    };
  }, [conversationId, isConnected, enableRealtime, emit]);

  // Setup event listeners
  useEffect(() => {
    if (!enableRealtime) return;

    const eventHandlers = [
      // New message received
      on('new_message', (data: MessageEventData) => {
        try {
          console.log('📨 New message received:', data);
          
          if (!data || !data.message) {
            console.warn('⚠️ Invalid new_message data received:', data);
            return;
          }
          
          const { message } = data;
          
          // Add to current conversation messages (avoid duplicates)
          if (message.conversationId === conversationId) {
            queryClient.setQueryData<MessagingMessage[]>(
              queryKeys.messages(message.conversationId),
              old => {
                if (!old) return [message];
                // Check if message already exists to prevent duplicates
                const messageExists = old.some(existingMsg => existingMsg.id === message.id);
                if (messageExists) {
                  console.log('📝 Message already exists, skipping:', message.id);
                  return old;
                }
                return [...old, message];
              }
            );
          }

          // Update conversations list
          queryClient.setQueryData<MessagingConversation[]>(
            queryKeys.conversations,
            old => {
              if (!old) return old;
              return old.map(conv => 
                conv.id === message.conversationId 
                  ? { ...conv, lastMessage: message }
                  : conv
              );
            }
          );

          // Show toast for messages from others (not in current conversation)
          if (message.senderId !== user?.id && message.conversationId !== conversationId) {
            toast('New message', {
              description: message.content.length > 50 
                ? message.content.substring(0, 50) + '...' 
                : message.content,
            });
          }
        } catch (error) {
          console.error('💥 Error handling new_message event:', error, data);
          toast.error('Error processing new message');
        }
      }),

      // Message updated
      on('message_updated', (data: MessageUpdatedEventData) => {
        try {
          if (!conversationId) return;
          
          if (!data || !data.messageId) {
            console.warn('⚠️ Invalid message_updated data received:', data);
            return;
          }
          
          queryClient.setQueryData<MessagingMessage[]>(
            queryKeys.messages(conversationId),
            old => {
              if (!old) return old;
              return old.map(msg => 
                msg.id === data.messageId
                  ? {
                      ...msg,
                      content: data.content ?? msg.content,
                      isDeleted: data.isDeleted ?? msg.isDeleted,
                      isEdited: true,
                      updatedAt: new Date().toISOString(),
                    }
                  : msg
              );
            }
          );
        } catch (error) {
          console.error('💥 Error handling message_updated event:', error, data);
          toast.error('Error updating message');
        }
      }),

      // Message read
      on('message_read', (data: MessageReadEventData) => {
        if (!conversationId) return;
        
        queryClient.setQueryData<MessagingMessage[]>(
          queryKeys.messages(conversationId),
          old => {
            if (!old) return old;
            return old.map(msg => 
              msg.id === data.messageId
                ? {
                    ...msg,
                    readReceipts: [
                      ...(msg.readReceipts || []).filter(r => r.userId !== data.userId),
                      {
                        id: `${data.messageId}-${data.userId}`,
                        messageId: data.messageId,
                        userId: data.userId,
                        readAt: data.readAt,
                      },
                    ],
                  }
                : msg
            );
          }
        );
      }),

      // Message reaction
      on('message_reaction', (data: MessageReactionEventData) => {
        if (!conversationId) return;
        
        queryClient.setQueryData<MessagingMessage[]>(
          queryKeys.messages(conversationId),
          old => {
            if (!old) return old;
            return old.map(msg => {
              if (msg.id !== data.messageId) return msg;

              const reactions = msg.reactions || [];
              if (data.action === 'add') {
                return {
                  ...msg,
                  reactions: [
                    ...reactions.filter(r => !(r.userId === data.userId && r.emoji === data.emoji)),
                    {
                      id: `${data.messageId}-${data.userId}-${data.emoji}`,
                      messageId: data.messageId,
                      userId: data.userId,
                      emoji: data.emoji,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                };
              } else {
                return {
                  ...msg,
                  reactions: reactions.filter(r => !(r.userId === data.userId && r.emoji === data.emoji)),
                };
              }
            });
          }
        );
      }),

      // Typing indicators
      enableTypingIndicators ? on('user_typing', (data: TypingEventData) => {
        try {
          if (data.userId === user?.id) return; // Don't show own typing
          
          if (!data || !data.userId || !data.conversationId) {
            console.warn('⚠️ Invalid typing_indicator data received:', data);
            return;
          }
          
          setTypingUsers(prev => {
            if (data.isTyping) {
              const filtered = prev.filter(t => t.userId !== data.userId);
              return [...filtered, {
                userId: data.userId,
                conversationId: data.conversationId,
                isTyping: true,
              }];
            } else {
              return prev.filter(t => t.userId !== data.userId);
            }
          });
        } catch (error) {
          console.error('💥 Error handling typing_indicator event:', error, data);
        }
      }) : () => {},

      // User status changes
      on('user_status_changed', (data: { userId: string; status: 'online' | 'offline' }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (data.status === 'online') {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }),
    ];

    // Store unsubscribers for cleanup
    eventUnsubscribers.current = eventHandlers;

    return () => {
      eventUnsubscribers.current.forEach(unsubscribe => unsubscribe());
      eventUnsubscribers.current = [];
    };
  }, [enableRealtime, enableTypingIndicators, conversationId, user?.id, queryClient, on]);

  // ============ PUBLIC API ============

  const sendMessage = useCallback((
    content: string,
    options?: {
      replyToMessageId?: string;
      type?: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO';
      attachments?: { url: string; fileName: string; fileSize: number; mimeType: string; }[];
    }
  ) => {
    if (!conversationId) {
      toast.error('No conversation selected');
      return;
    }

    const messageData: SendMessageDto = {
      content,
      type: options?.type || 'TEXT',
      replyToMessageId: options?.replyToMessageId,
      attachments: options?.attachments,
    };

    sendMessageMutation.mutate({ conversationId, messageData });
  }, [conversationId, sendMessageMutation]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!conversationId || !enableTypingIndicators || !isConnected) return;

    const eventData = { conversationId, isTyping };
    console.log('⌨️ Sending typing indicator:', eventData);
    emit(isTyping ? 'typing_start' : 'typing_stop', eventData);

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 3000);
    } else if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId, enableTypingIndicators, isConnected, emit]);

  const uploadFile = useCallback(async (file: File) => {
    try {
      return await api.messaging.uploadMessageFile(file);
    } catch (error) {
      toast.error('Failed to upload file');
      throw error;
    }
  }, [api.messaging]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    conversations,
    messages,
    typingUsers,
    onlineUsers,

    // Loading states
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage: sendMessageMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
    isAddingReaction: addReactionMutation.isPending,

    // Error states
    conversationsError,
    messagesError,
    sendMessageError: sendMessageMutation.error,

    // Connection state (from WebSocket context)
    connectionState,
    isConnected,

    // Actions
    sendMessage,
    markAsRead: (messageId: string) => markAsReadMutation.mutate(messageId),
    addReaction: (messageId: string, emoji: string) => 
      addReactionMutation.mutate({ messageId, emoji }),
    removeReaction: (messageId: string, emoji: string) => 
      api.messaging.removeReaction(messageId, emoji),
    sendTypingIndicator,
    uploadFile,
    reconnectWebSocket: reconnect, // Use the centralized reconnect from context

    // Utilities
    refetchConversations,
    refetchMessages,
    
    // Advanced features (HTTP only, no WebSocket complexity)
    searchMessages: (query: string) => 
      api.messaging.searchMessages({ query, conversationId }),
    blockUser: (userId: string, reason?: string) => 
      api.messaging.blockUser({ userId, reason }),
    createConversation: (participantIds: string[]) => 
      api.messaging.createConversation({ participantIds }),
  };
}

export type UseMessagingReturn = ReturnType<typeof useMessaging>;