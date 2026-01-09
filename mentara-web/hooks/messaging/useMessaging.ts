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
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME } from '@/lib/constants/react-query';
import type { 
  MessagingMessage, 
  MessagingConversation, 
  SendMessageDto 
} from '@/lib/api/services/messaging';
import { useMessagingWebSocket } from '@/hooks/messaging/useWebSocket';
import { onEvent } from '@/lib/websocket';

// Type definitions for WebSocket events
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

interface TypingData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

interface UserStatusData {
  userId: string;
  status: "online" | "offline";
  timestamp: string;
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
    joinConversation: joinConversationWS,
    leaveConversation: leaveConversationWS,
    sendTypingIndicator: sendTypingIndicatorWS,
    subscribeToMessages,
    subscribeToTyping,
    subscribeToUserStatus
  } = useMessagingWebSocket();
  
  // Local state for real-time features
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============ HTTP OPERATIONS (React Query) ============

  // Get conversations
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: queryKeys.messaging.conversations(user?.id || ''),
    queryFn: () => api.messaging.getConversations(),
    enabled: !!user?.id,
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: true, // Refetch on focus for messaging
  });

  // Get messages for current conversation with retry logic for 403 errors
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: conversationId && user?.id ? queryKeys.messaging.messages(user.id, conversationId) : [],
    queryFn: async () => {
      if (!conversationId) return [];
      
      // Validate conversation exists and user is participant before fetching
      try {
        const conversation = await api.messaging.getConversation(conversationId);
        const isParticipant = conversation.participants.some(
          (p) => p.userId === user?.id
        );
        
        if (!isParticipant) {
          const error = new Error('NOT_PARTICIPANT') as Error & { isParticipantError?: boolean };
          error.isParticipantError = true;
          throw error;
        }
        
        return api.messaging.getMessages(conversationId);
      } catch (error: unknown) {
        // Check if this is a participant verification error
        const isParticipantError = 
          (error as any)?.isParticipantError ||
          (error as any)?.response?.status === 403 ||
          (error as Error)?.message?.includes('participant') ||
          (error as Error)?.message?.includes('Forbidden') ||
          (error as Error)?.message === 'NOT_PARTICIPANT';
        
        if (isParticipantError) {
          const participantError = new Error('NOT_PARTICIPANT') as Error & { isParticipantError?: boolean };
          participantError.isParticipantError = true;
          throw participantError;
        }
        throw error;
      }
    },
    enabled: !!conversationId && !!user?.id,
    staleTime: 1000 * 30, // 30 seconds (real-time messaging needs very short stale time)
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: true, // Refetch messages on focus
    retry: (failureCount, error: unknown) => {
      // Only retry on 403 errors (not a participant) with exponential backoff
      // This handles race conditions where conversation is created but user isn't yet recognized as participant
      const err = error as Error & { isParticipantError?: boolean; response?: { status?: number } };
      const isParticipantError = 
        err?.isParticipantError ||
        err?.message === 'NOT_PARTICIPANT' ||
        err?.response?.status === 403 ||
        err?.message?.includes('participant') ||
        err?.message?.includes('Forbidden');
      
      if (isParticipantError && failureCount < 3) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        const delay = Math.min(500 * Math.pow(2, failureCount), 2000);
        console.log(
          `🔄 [MESSAGING] Retrying message fetch (attempt ${failureCount + 1}/3) after ${delay}ms due to participant verification error`
        );
        return true;
      }
      
      // Don't retry other errors
      return false;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 500ms, 1000ms, 2000ms
      return Math.min(500 * Math.pow(2, attemptIndex), 2000);
    },
  });

  // Send message mutation with acknowledgment support
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, messageData }: { 
      conversationId: string; 
      messageData: SendMessageDto; 
    }) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:190',message:'sendMessage mutationFn called',data:{conversationId,contentLength:messageData.content?.length,isConnected,hasJoinedRoom:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      return api.messaging.sendMessage(conversationId, messageData);
    },
    onMutate: async ({ conversationId, messageData }) => {
      // Optimistic update
      if (!user?.id) return { previousMessages: null, conversationId };
      await queryClient.cancelQueries({ queryKey: queryKeys.messaging.messages(user.id, conversationId) });
      
      const previousMessages = queryClient.getQueryData<MessagingMessage[]>(
        queryKeys.messaging.messages(user.id, conversationId)
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

      if (user?.id) {
        queryClient.setQueryData<MessagingMessage[]>(
          queryKeys.messaging.messages(user.id, conversationId),
          old => old ? [...old, tempMessage] : [tempMessage]
        );
      }

      return { previousMessages, conversationId };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context && user?.id) {
        queryClient.setQueryData(
          queryKeys.messaging.messages(user.id, context.conversationId),
          context.previousMessages
        );
      }
      toast.error('Failed to send message');
    },
    onSuccess: (newMessage, { conversationId }) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:245',message:'sendMessage onSuccess - message sent to backend',data:{messageId:newMessage.id,conversationId,isConnected,expectingWebSocketEvent:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      // Replace temp message with real message
      if (user?.id) {
        queryClient.setQueryData<MessagingMessage[]>(
          queryKeys.messaging.messages(user.id, conversationId),
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
          queryKeys.messaging.conversations(user.id),
          old => {
            if (!old) return old;
            return old.map(conv => 
              conv.id === conversationId 
                ? { ...conv, lastMessage: newMessage }
                : conv
            );
          }
        );
      }
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

  // Join conversation room when conversationId changes OR when connection is restored
  // This ensures we re-join rooms after reconnection
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:294',message:'useEffect for joinConversation triggered',data:{enableRealtime,conversationId,isConnected,connectionState:JSON.stringify(connectionState)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    if (!enableRealtime || !conversationId || !isConnected) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:298',message:'Skipping join - conditions not met',data:{enableRealtime,conversationId,isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Add a small delay to ensure socket is fully ready after connection
    // This is especially important after reconnection
    const joinTimeout = setTimeout(() => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:305',message:'Calling joinConversationWS after delay',data:{conversationId,isConnected,delay:100},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      console.log('🚪 Joining conversation room:', conversationId);
      joinConversationWS(conversationId);
    }, 100); // Small delay to ensure socket is ready

    return () => {
      clearTimeout(joinTimeout);
      console.log('🚪 Leaving conversation room:', conversationId);
      leaveConversationWS(conversationId);
    };
  }, [conversationId, isConnected, enableRealtime, joinConversationWS, leaveConversationWS, connectionState]);

  // Setup event listeners using subscription functions
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:301',message:'useEffect for event listeners triggered',data:{enableRealtime,conversationId,isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!enableRealtime) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:302',message:'Skipping event listeners - realtime disabled',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return;
    }

    const unsubscribers: (() => void)[] = [];

    // Subscribe to new messages using the specific subscription function
    const unsubscribeMessages = subscribeToMessages((message: MessagingMessage) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:307',message:'subscribeToMessages callback executed - NEW MESSAGE RECEIVED',data:{messageId:message.id,conversationId:message.conversationId,currentConversationId:conversationId,matches:message.conversationId===conversationId,senderId:message.senderId,currentUserId:user?.id,isOwnMessage:message.senderId===user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      try {
        console.log('📨 New message received:', message);
        
        // Populate sender object if missing (WebSocket messages have sender: null)
        if (!message.sender && message.senderId && user?.id) {
          // Get conversation from cache to find sender in participants
          const conversation = queryClient.getQueryData<MessagingConversation>(
            queryKeys.messaging.conversation(user.id, message.conversationId)
          ) || conversations.find(conv => conv.id === message.conversationId);
          
          if (conversation?.participants) {
            const senderParticipant = conversation.participants.find(
              p => p.userId === message.senderId
            );
            
            if (senderParticipant?.user) {
              // Populate sender object from participant's user info
              // Note: participant.user may not have all User fields, so we provide defaults
              message.sender = {
                id: senderParticipant.user.id,
                firstName: senderParticipant.user.firstName,
                lastName: senderParticipant.user.lastName,
                email: senderParticipant.user.email,
                avatarUrl: senderParticipant.user.avatarUrl,
                role: (senderParticipant.user as any).role || user?.role || 'client',
                isEmailVerified: (senderParticipant.user as any).isEmailVerified ?? true,
                createdAt: (senderParticipant.user as any).createdAt || new Date().toISOString(),
                updatedAt: (senderParticipant.user as any).updatedAt || new Date().toISOString(),
              } as any; // Type assertion needed since participant.user may not have all User fields
              console.log('✅ Populated sender from conversation participants:', {
                id: message.sender.id,
                name: `${message.sender.firstName} ${message.sender.lastName}`,
                senderId: message.senderId
              });
            } else {
              // Fallback: create minimal sender object
              console.warn('⚠️ Sender participant not found for senderId:', message.senderId, 'in conversation:', message.conversationId);
              message.sender = {
                id: message.senderId,
                firstName: 'Unknown',
                lastName: 'User',
                email: '',
                avatarUrl: undefined,
                role: 'client' as any,
                isEmailVerified: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as any;
            }
          } else {
            // Fallback: conversation not found or has no participants
            console.warn('⚠️ Conversation not found or has no participants for conversationId:', message.conversationId);
            // Use fallback immediately
            message.sender = {
              id: message.senderId,
              firstName: 'Unknown',
              lastName: 'User',
              email: '',
              avatarUrl: undefined,
              role: 'client' as any,
              isEmailVerified: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as any;
            
            // Try to fetch conversation async and update message in cache if found
            (async () => {
              try {
                const conv = await api.messaging.getConversation(message.conversationId);
                if (conv?.participants) {
                  const senderParticipant = conv.participants.find(p => p.userId === message.senderId);
                  if (senderParticipant?.user) {
                    const correctSender = {
                      id: senderParticipant.user.id,
                      firstName: senderParticipant.user.firstName,
                      lastName: senderParticipant.user.lastName,
                      email: senderParticipant.user.email,
                      avatarUrl: senderParticipant.user.avatarUrl,
                      role: (senderParticipant.user as any).role || 'client',
                      isEmailVerified: (senderParticipant.user as any).isEmailVerified ?? true,
                      createdAt: (senderParticipant.user as any).createdAt || new Date().toISOString(),
                      updatedAt: (senderParticipant.user as any).updatedAt || new Date().toISOString(),
                    } as any;
                    
                    // Update the message in cache with correct sender
                    if (user?.id) {
                      queryClient.setQueryData<MessagingMessage[]>(
                        queryKeys.messaging.messages(user.id, message.conversationId),
                        old => {
                          if (!old) return old;
                          return old.map(msg => 
                            msg.id === message.id 
                              ? { ...msg, sender: correctSender }
                              : msg
                          );
                        }
                      );
                    }
                    console.log('✅ Updated message sender in cache after fetching conversation');
                  }
                }
              } catch (error) {
                console.error('❌ Failed to fetch conversation for sender lookup:', error);
              }
            })();
          }
        }
        
        // Add to current conversation messages (avoid duplicates)
        if (message.conversationId === conversationId && user?.id) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:313',message:'Updating query client with new message',data:{messageId:message.id,conversationId:message.conversationId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          queryClient.setQueryData<MessagingMessage[]>(
            queryKeys.messaging.messages(user.id, message.conversationId),
            old => {
              if (!old) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:316',message:'Query data was empty - creating new array',data:{messageId:message.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                return [message];
              }
              // Check if message already exists to prevent duplicates
              const messageExists = old.some(existingMsg => existingMsg.id === message.id);
              if (messageExists) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:320',message:'Message already exists - skipping duplicate',data:{messageId:message.id,oldCount:old.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                console.log('📝 Message already exists, skipping:', message.id);
                return old;
              }
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessaging.ts:323',message:'Adding new message to query data',data:{messageId:message.id,oldCount:old.length,newCount:old.length+1},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion
              return [...old, message];
            }
          );
        }

        // Update conversations list
        if (user?.id) {
          queryClient.setQueryData<MessagingConversation[]>(
            queryKeys.messaging.conversations(user.id),
            old => {
              if (!old) return old;
              return old.map(conv => 
                conv.id === message.conversationId 
                  ? { ...conv, lastMessage: message }
                  : conv
              );
            }
          );
        }

        // Validate message has senderId before processing
        if (!message.senderId) {
          console.warn('Received message without senderId:', message.id);
          return;
        }
        
        // Show toast for messages from others (not in current conversation)
        // Always use message.senderId as source of truth
        if (message.senderId !== user?.id && message.conversationId !== conversationId) {
          toast('New message', {
            description: message.content.length > 50 
              ? message.content.substring(0, 50) + '...' 
              : message.content,
          });
        }
      } catch (error) {
        console.error('💥 Error handling new message:', error, message);
        toast.error('Error processing new message');
      }
    });
    unsubscribers.push(unsubscribeMessages);

    // Subscribe to additional events using onEvent
    const unsubscribeMessageUpdated = onEvent('message_updated', (data: MessageUpdatedEventData) => {
      try {
        if (!conversationId) return;
        
        if (!data || !data.messageId) {
          console.warn('⚠️ Invalid message_updated data received:', data);
          return;
        }
        
        if (user?.id) {
          queryClient.setQueryData<MessagingMessage[]>(
            queryKeys.messaging.messages(user.id, conversationId),
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
        }
      } catch (error) {
        console.error('💥 Error handling message_updated event:', error, data);
        toast.error('Error updating message');
      }
    });
    unsubscribers.push(unsubscribeMessageUpdated);

    const unsubscribeMessageRead = onEvent('message_read', (data: MessageReadEventData) => {
      if (!conversationId || !user?.id) return;
      
      queryClient.setQueryData<MessagingMessage[]>(
        queryKeys.messaging.messages(user.id, conversationId),
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
    });
    unsubscribers.push(unsubscribeMessageRead);

    const unsubscribeMessageReaction = onEvent('message_reaction', (data: MessageReactionEventData) => {
      if (!conversationId || !user?.id) return;
      
      queryClient.setQueryData<MessagingMessage[]>(
        queryKeys.messaging.messages(user.id, conversationId),
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
    });
    unsubscribers.push(unsubscribeMessageReaction);

    // Subscribe to typing indicators using the specific subscription function
    if (enableTypingIndicators) {
      const unsubscribeTyping = subscribeToTyping((data: TypingData) => {
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
      });
      unsubscribers.push(unsubscribeTyping);
    }

    // Subscribe to user status changes using the specific subscription function
    const unsubscribeUserStatus = subscribeToUserStatus((data: UserStatusData) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.status === 'online') {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });
    unsubscribers.push(unsubscribeUserStatus);

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [enableRealtime, enableTypingIndicators, conversationId, user?.id, queryClient, 
      subscribeToMessages, subscribeToTyping, subscribeToUserStatus]);

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

    console.log('⌨️ Sending typing indicator:', { conversationId, isTyping });
    sendTypingIndicatorWS(conversationId, isTyping);

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
  }, [conversationId, enableTypingIndicators, isConnected, sendTypingIndicatorWS]);

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
    // Note: Reconnection is handled automatically by lib/websocket.ts

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