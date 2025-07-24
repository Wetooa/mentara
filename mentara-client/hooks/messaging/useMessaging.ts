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
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  emitEvent, 
  onEvent, 
  onStateChange, 
  getConnectionState,
  recoverMessagingConnection,
  type ConnectionState 
} from '@/lib/websocket';
import type { 
  MessagingMessage, 
  MessagingConversation, 
  SendMessageDto 
} from '@/lib/api/services/messaging';
import { wsDebugger } from '@/lib/debug/websocket-debug';
import { connectionHealthMonitor } from '@/lib/monitoring/connection-health';

interface UseMessagingOptions {
  conversationId?: string;
  enableRealtime?: boolean;
  enableTypingIndicators?: boolean;
}

interface TypingUser {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

interface MessageEventData {
  message: MessagingMessage;
}

interface TypingEventData {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

interface MessageUpdatedEventData {
  messageId: string;
  content?: string;
  isDeleted?: boolean;
}

interface MessageReadEventData {
  messageId: string;
  userId: string;
  readAt: string;
}

interface MessageReactionEventData {
  messageId: string;
  userId: string;
  emoji: string;
  action: 'add' | 'remove';
}

/**
 * Simplified messaging hook
 * Handles both HTTP operations (via React Query) and real-time events (via WebSocket)
 */
export function useMessaging(options: UseMessagingOptions = {}) {
  const { 
    conversationId, 
    enableRealtime = true, 
    enableTypingIndicators = true 
  } = options;
  
  const api = useApi();
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuth();
  
  // Local state for real-time features
  const [connectionState, setConnectionState] = useState<ConnectionState>(getConnectionState());
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [healthStatus, setHealthStatus] = useState<any>(connectionHealthMonitor.getCurrentHealth());
  
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

  // Send message mutation
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
        messageType: messageData.type || 'text',
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
          // Remove both temp messages AND any existing message with the same ID to prevent duplicates
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

  // Force WebSocket connection on page load - simple and direct approach
  useEffect(() => {
    if (!enableRealtime) return;

    let isMounted = true;
    let connectionAttempted = false;

    const forceConnection = async () => {
      if (connectionAttempted) return;
      connectionAttempted = true;

      console.log('🚀 [FRONTEND] FORCE CONNECTING WebSocket on page load...');
      
      try {
        // Just call the recovery method directly - same as manual button
        const success = await recoverMessagingConnection();
        
        if (!isMounted) return;
        
        if (success) {
          console.log('✅ [FRONTEND] FORCE CONNECTION SUCCESSFUL!');
          toast.success('Connected to real-time messaging');
          
          // Join conversation if we have one
          if (conversationId) {
            console.log('🚪 [FRONTEND] Joining conversation room:', conversationId);
            setTimeout(() => {
              emitEvent('join_conversation', { conversationId });
            }, 500); // Small delay to ensure connection is ready
          }
        } else {
          console.error('❌ [FRONTEND] FORCE CONNECTION FAILED');
          toast.error('Failed to connect. Use the retry button if needed.');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('💥 [FRONTEND] FORCE CONNECTION ERROR:', error);
        toast.error('Connection error. Use the retry button if needed.');
      }
    };

    // Call immediately, but also set a backup timer
    forceConnection();
    
    // Backup attempt after 2 seconds in case the first one fails
    const backupTimer = setTimeout(() => {
      if (isMounted && !getConnectionState().isConnected) {
        console.log('🔄 [FRONTEND] Backup connection attempt...');
        forceConnection();
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(backupTimer);
      disconnectWebSocket();
    };
  }, [enableRealtime, conversationId]); // Removed user/token dependencies

  // Secondary effect for auth-dependent setup (fallback)
  useEffect(() => {
    if (!enableRealtime || !accessToken || !user) return;

    const currentState = getConnectionState();
    if (currentState.isConnected) {
      console.log('🔗 [FRONTEND] Auth effect: Already connected, skipping');
      return;
    }

    console.log('🔐 [FRONTEND] Auth effect: Attempting connection with auth token...');
    
    // Try one more time with proper auth context
    setTimeout(async () => {
      try {
        const success = await recoverMessagingConnection();
        if (success) {
          console.log('✅ [FRONTEND] Auth-based connection successful');
        }
      } catch (error) {
        console.error('❌ [FRONTEND] Auth-based connection failed:', error);
      }
    }, 1000);

  }, [accessToken, user, enableRealtime]);

  // Monitor connection state and integrate health monitoring
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribe = onStateChange((newState) => {
      // Update local state
      setConnectionState(newState);
      
      // Log detailed connection state changes
      wsDebugger.logConnectionState(newState, 'useMessaging');
      
      // Update connection health monitor with current state
      // The health monitor will automatically track this state change
      if (typeof window !== 'undefined') {
        (window as any).__wsState__ = {
          isConnected: newState.isConnected,
          lastConnected: newState.lastConnected?.toISOString(),
          error: newState.error,
          retryCount: newState.retryCount,
          transport: 'websocket', // Default transport type
        };
      }
      
      // Log specific state transitions
      if (newState.isConnected && !connectionState.isConnected) {
        console.log('🟢 [CONNECTION] WebSocket connected successfully');
        wsDebugger.logAuth('success', { 
          userId: user?.id,
          email: user?.email,
          timestamp: new Date().toISOString()
        });
      } else if (!newState.isConnected && connectionState.isConnected) {
        console.log('🔴 [CONNECTION] WebSocket disconnected');
      } else if (newState.error && newState.error !== connectionState.error) {
        console.error('💥 [CONNECTION] New error detected:', newState.error);
        wsDebugger.logAuth('failure', { 
          error: newState.error,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return unsubscribe;
  }, [enableRealtime, connectionState.isConnected, user?.id, user?.email]);

  // Monitor connection health changes
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribeHealth = connectionHealthMonitor.onHealthChange((healthResult) => {
      setHealthStatus(healthResult);
      
      // Log health status changes for debugging
      if (wsDebugger.isEnabled()) {
        console.group('🏥 [HEALTH] Connection health status changed');
        console.log('Overall:', healthResult.overall);
        console.log('WebSocket:', healthResult.websocket);
        console.log('Network:', healthResult.network);
        console.log('Quality:', healthResult.metrics.connectionQuality);
        if (healthResult.recommendations.length > 0) {
          console.log('Recommendations:', healthResult.recommendations);
        }
        console.groupEnd();
      }
      
      // Show user feedback for critical health issues
      if (healthResult.overall === 'critical' && connectionState.isConnected) {
        toast.warning('Connection quality is poor. Real-time features may be affected.');
      }
    });

    return unsubscribeHealth;
  }, [enableRealtime, connectionState.isConnected]);

  // Setup event listeners
  useEffect(() => {
    if (!enableRealtime) return;

    const eventHandlers = [
      // New message received
      onEvent('new_message', (data: MessageEventData) => {
        try {
          wsDebugger.logEvent('new_message', data, 'incoming');
          
          if (!data || !data.message) {
            console.warn('⚠️ [FRONTEND] Invalid new_message data received:', data);
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
                  console.log('📝 [FRONTEND] Message already exists, skipping:', message.id);
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
          console.error('💥 [FRONTEND] Error handling new_message event:', error, data);
          toast.error('Error processing new message');
        }
      }),

      // Message updated
      onEvent('message_updated', (data: MessageUpdatedEventData) => {
        try {
          if (!conversationId) return;
          
          if (!data || !data.messageId) {
            console.warn('⚠️ [FRONTEND] Invalid message_updated data received:', data);
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
          console.error('💥 [FRONTEND] Error handling message_updated event:', error, data);
          toast.error('Error updating message');
        }
      }),

      // Message read
      onEvent('message_read', (data: MessageReadEventData) => {
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
      onEvent('message_reaction', (data: MessageReactionEventData) => {
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
      enableTypingIndicators ? onEvent('typing_indicator', (data: TypingEventData) => {
        try {
          if (data.userId === user?.id) return; // Don't show own typing
          
          if (!data || !data.userId || !data.conversationId) {
            console.warn('⚠️ [FRONTEND] Invalid typing_indicator data received:', data);
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
          console.error('💥 [FRONTEND] Error handling typing_indicator event:', error, data);
        }
      }) : () => {},

      // User status changes
      onEvent('user_status_changed', (data: { userId: string; status: 'online' | 'offline' }) => {
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
  }, [enableRealtime, enableTypingIndicators, conversationId, user?.id, queryClient]);

  // ============ PUBLIC API ============

  const sendMessage = useCallback((
    content: string,
    options?: {
      replyToMessageId?: string;
      type?: 'text' | 'image' | 'audio' | 'video';
      attachments?: { url: string; fileName: string; fileSize: number; mimeType: string; }[];
    }
  ) => {
    if (!conversationId) {
      toast.error('No conversation selected');
      return;
    }

    const messageData: SendMessageDto = {
      content,
      type: options?.type || 'text',
      replyToMessageId: options?.replyToMessageId,
      attachments: options?.attachments,
    };

    sendMessageMutation.mutate({ conversationId, messageData });
  }, [conversationId, sendMessageMutation]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!conversationId || !enableTypingIndicators) return;

    const eventData = { conversationId, isTyping };
    wsDebugger.logEvent('typing_indicator', eventData, 'outgoing');
    emitEvent('typing_indicator', eventData);

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
  }, [conversationId, enableTypingIndicators]);

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

    // Connection state
    connectionState,
    isConnected: connectionState.isConnected,
    healthStatus,
    connectionQuality: healthStatus?.metrics?.connectionQuality || 'unknown',
    networkStatus: healthStatus?.network || 'unknown',

    // Actions
    sendMessage,
    markAsRead: (messageId: string) => markAsReadMutation.mutate(messageId),
    addReaction: (messageId: string, emoji: string) => 
      addReactionMutation.mutate({ messageId, emoji }),
    removeReaction: (messageId: string, emoji: string) => 
      api.messaging.removeReaction(messageId, emoji),
    sendTypingIndicator,
    uploadFile,
    reconnectWebSocket: useCallback(async () => {
      try {
        console.log('🔄 [FRONTEND] Manual WebSocket reconnection initiated');
        wsDebugger.logConnectionState({ isConnecting: true, error: null }, 'manual-reconnect');
        
        const success = await recoverMessagingConnection();
        if (success) {
          console.log('✅ [FRONTEND] WebSocket reconnection successful');
          wsDebugger.logConnectionState({ isConnected: true, error: null }, 'manual-reconnect-success');
          toast.success('Connection restored');
        } else {
          console.error('❌ [FRONTEND] WebSocket reconnection failed');
          wsDebugger.logConnectionState({ isConnected: false, error: 'Manual reconnection failed' }, 'manual-reconnect-failed');
          toast.error('Failed to restore connection. Please refresh the page.');
        }
        return success;
      } catch (error) {
        console.error('💥 [FRONTEND] WebSocket reconnection error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        wsDebugger.logConnectionState({ isConnected: false, error: errorMessage }, 'manual-reconnect-error');
        toast.error('Connection error. Please check your network and try again.');
        return false;
      }
    }, []),

    // Utilities
    refetchConversations,
    refetchMessages,
    
    // Health monitoring utilities
    getHealthSummary: (minutes?: number) => connectionHealthMonitor.getHealthSummary(minutes),
    forceHealthCheck: () => connectionHealthMonitor.performHealthCheck(),
    
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