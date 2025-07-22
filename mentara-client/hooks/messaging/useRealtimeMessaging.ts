import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useCallback, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import type {
  MessagingConversation,
  MessagingMessage,
  SendMessageDto,
  GetConversationsParams,
  GetMessagesParams,
} from "@/lib/api/services/messaging";

interface WebSocketConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
}

interface TypingStatus {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface MessageEvent {
  type:
    | "new_message"
    | "message_updated"
    | "message_deleted"
    | "message_read"
    | "message_reaction";
  data: MessagingMessage;
}

interface TypingEvent {
  type: "typing_start" | "typing_stop";
  data: TypingStatus;
}

interface PresenceEvent {
  type:
    | "user_online"
    | "user_offline"
    | "user_joined_conversation"
    | "user_left_conversation";
  data: {
    userId: string;
    conversationId?: string;
    timestamp: string;
  };
}

/**
 * Comprehensive messaging hook with real-time WebSocket integration
 * Provides messenger-like functionality with read receipts, reactions, and typing indicators
 */
export function useRealtimeMessaging(
  params: {
    conversationId?: string;
    enableRealtime?: boolean;
    enableTypingIndicators?: boolean;
    enablePresence?: boolean;
  } = {}
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuth();

  // Configuration with defaults
  const config = {
    enableRealtime: true,
    enableTypingIndicators: true,
    enablePresence: true,
    ...params,
  };

  // WebSocket connection state
  const [connectionState, setConnectionState] =
    useState<WebSocketConnectionState>({
      isConnected: false,
      isReconnecting: false,
      error: null,
      lastConnected: null,
    });

  // Typing indicators state
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(
    new Map()
  );

  // Online users state
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // Use centralized query keys

  // Get conversations
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["messaging", "conversations"],
    queryFn: async () => {
      console.log(
        "🔄 [FRONTEND] useRealtimeMessaging - calling getConversations API"
      );
      console.log("👤 [USER CONTEXT]", {
        userId: user?.id,
        email: user?.email,
        role: user?.role,
      });
      console.log("🔑 [AUTH]", { hasAccessToken: !!accessToken });

      try {
        const result = await api.messaging.getConversations();
        console.log("✅ [FRONTEND] getConversations API response:", result);
        console.log("📊 [CONVERSATION COUNT]", result?.length || 0);
        console.log(
          "📝 [CONVERSATION DETAILS]:",
          result?.map((conv) => ({
            id: conv.id,
            type: conv.type,
            title: conv.title,
            participantCount: conv.participants?.length || 0,
          }))
        );
        return result;
      } catch (error) {
        console.error("❌ [FRONTEND] getConversations API error:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get specific conversation messages
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: config.conversationId
      ? ["messaging", "conversations", config.conversationId]
      : [],
    queryFn: () =>
      config.conversationId
        ? api.messaging.getMessages(config.conversationId)
        : Promise.resolve([]),
    enabled: !!config.conversationId,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      messageData,
    }: {
      conversationId: string;
      messageData: SendMessageDto;
    }) => api.messaging.sendMessage(conversationId, messageData),
    onMutate: async ({ conversationId, messageData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["messaging", "messages", conversationId],
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<MessagingMessage[]>([
        "messaging",
        "messages",
        conversationId,
      ]);

      // Optimistically update with temporary message
      const tempMessage: MessagingMessage = {
        id: `temp-${Date.now()}`,
        senderId: user?.id || "",
        content: messageData.content,
        messageType: messageData.messageType || "TEXT",
        conversationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRead: false,
        isEdited: false,
        isDeleted: false,
        replyToId: messageData.replyToId,
        attachments: messageData.attachments || [],
        reactions: [],
        readReceipts: [],
      };

      queryClient.setQueryData<MessagingMessage[]>(
        ["messaging", "messages", conversationId],
        (old) => (old ? [...old, tempMessage] : [tempMessage])
      );

      // Return context for rollback
      return { previousMessages, conversationId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(
          ["messaging", "messages", context.conversationId],
          context.previousMessages
        );
      }
      toast.error("Failed to send message");
    },
    onSuccess: (newMessage, { conversationId }) => {
      // Replace temp message with real message
      queryClient.setQueryData<MessagingMessage[]>(
        ["messaging", "messages", conversationId],
        (old) => {
          if (!old) return [newMessage];
          // Replace the last message (temp message) with the real one
          const filtered = old.filter((msg) => !msg.id.startsWith("temp-"));
          return [...filtered, newMessage];
        }
      );

      // Update conversations list with latest message
      queryClient.setQueryData<MessagingConversation[]>(
        ["messaging", "conversations"],
        (old) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === conversationId
              ? { ...conv, lastMessage: newMessage }
              : conv
          );
        }
      );
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) =>
      api.messaging.markMessageAsRead(messageId),
    onMutate: async (messageId) => {
      if (!config.conversationId) return;

      // Optimistically update message as read
      queryClient.setQueryData<MessagingMessage[]>(
        ["messaging", "conversations", config.conversationId],
        (old) => {
          if (!old) return old;
          return old.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  isRead: true,
                  readReceipts: [
                    ...(msg.readReceipts || []),
                    {
                      id: "temp",
                      messageId,
                      userId: user?.id || "",
                      readAt: new Date().toISOString(),
                    },
                  ],
                }
              : msg
          );
        }
      );
    },
    onError: () => {
      toast.error("Failed to mark message as read");
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      api.messaging.addReaction(messageId, emoji),
    onMutate: async ({ messageId, emoji }) => {
      if (!config.conversationId) return;

      // Optimistically add reaction
      queryClient.setQueryData<MessagingMessage[]>(
        ["messaging", "conversations", config.conversationId],
        (old) => {
          if (!old) return old;
          return old.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  reactions: [
                    ...(msg.reactions || []),
                    {
                      id: "temp",
                      messageId,
                      userId: user?.id || "",
                      emoji,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : msg
          );
        }
      );
    },
    onError: () => {
      toast.error("Failed to add reaction");
    },
  });

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!accessToken || !user || !config.enableRealtime) return;
    if (socketRef.current?.connected) return;

    try {
      setConnectionState((prev) => ({
        ...prev,
        isReconnecting: true,
        error: null,
      }));

      // Connect to messaging namespace
      const socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/messaging`, {
        auth: { token: accessToken },
        transports: ["websocket", "polling"],
        timeout: 10000,
      });

      socket.on("connect", () => {
        console.log("Messaging WebSocket connected");
        setConnectionState({
          isConnected: true,
          isReconnecting: false,
          error: null,
          lastConnected: new Date(),
        });
        reconnectAttemptsRef.current = 0;

        // Join user room for global messaging events
        socket.emit("join_user_room", { userId: user.id });

        // Join specific conversation room if provided
        if (config.conversationId) {
          socket.emit("join_conversation", {
            conversationId: config.conversationId,
          });
        }
      });

      // Message events
      socket.on("new_message", (data: MessagingMessage) => {
        handleNewMessage(data);
      });

      socket.on("message_updated", (data: MessagingMessage) => {
        handleMessageUpdate(data);
      });

      socket.on(
        "message_read",
        (data: { messageId: string; userId: string; readAt: string }) => {
          handleMessageRead(data);
        }
      );

      socket.on(
        "message_reaction",
        (data: {
          messageId: string;
          userId: string;
          emoji: string;
          action: "add" | "remove";
        }) => {
          handleMessageReaction(data);
        }
      );

      // Typing indicators
      if (config.enableTypingIndicators) {
        socket.on("typing_start", (data: TypingStatus) => {
          if (data.userId !== user.id) {
            setTypingUsers((prev) => new Map(prev).set(data.userId, data));
          }
        });

        socket.on("typing_stop", (data: TypingStatus) => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
          });
        });
      }

      // Presence events
      if (config.enablePresence) {
        socket.on("user_online", (data: { userId: string }) => {
          setOnlineUsers((prev) => new Set(prev).add(data.userId));
        });

        socket.on("user_offline", (data: { userId: string }) => {
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        });
      }

      socket.on("disconnect", (reason) => {
        console.log("Messaging WebSocket disconnected:", reason);
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          isReconnecting: false,
        }));

        if (reason === "io server disconnect" || reason === "transport error") {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            scheduleReconnect();
          }
        }
      });

      socket.on("connect_error", (error) => {
        console.error("Messaging WebSocket connection error:", error);
        setConnectionState((prev) => ({
          ...prev,
          error: "Connection error",
          isReconnecting: false,
        }));
        scheduleReconnect();
      });

      socketRef.current = socket;
    } catch (error) {
      console.error("Failed to connect to messaging WebSocket:", error);
      setConnectionState((prev) => ({
        ...prev,
        error: "Failed to connect",
        isReconnecting: false,
      }));
      scheduleReconnect();
    }
  }, [
    accessToken,
    user,
    config.enableRealtime,
    config.conversationId,
    config.enableTypingIndicators,
    config.enablePresence,
  ]);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setConnectionState({
      isConnected: false,
      isReconnecting: false,
      error: null,
      lastConnected: null,
    });

    setTypingUsers(new Map());
    setOnlineUsers(new Set());
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setConnectionState((prev) => ({
        ...prev,
        error: "Max reconnection attempts reached",
      }));
      return;
    }

    reconnectAttemptsRef.current++;
    const delay =
      reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
    }, delay);
  }, [connectWebSocket]);

  // WebSocket event handlers
  const handleNewMessage = useCallback(
    (message: MessagingMessage) => {
      // Add message to conversation
      queryClient.setQueryData<MessagingMessage[]>(
        ["messaging", "conversations", config.conversationId],
        (old) => (old ? [...old, message] : [message])
      );

      // Update conversation last message
      queryClient.setQueryData<MessagingConversation[]>(
        ["messaging", "conversations"],
        (old) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === message.conversationId
              ? { ...conv, lastMessage: message }
              : conv
          );
        }
      );

      // Show toast for new messages from others
      if (
        message.senderId !== user?.id &&
        message.conversationId !== config.conversationId
      ) {
        toast(`New message`, {
          description:
            message.content.length > 50
              ? message.content.substring(0, 50) + "..."
              : message.content,
          action: {
            label: "View",
            onClick: () => {
              // Navigate to conversation
              window.location.href = `/messages?conversation=${message.conversationId}`;
            },
          },
        });
      }
    },
    [queryClient, user?.id, config.conversationId]
  );

  const handleMessageUpdate = useCallback(
    (message: MessagingMessage) => {
      queryClient.setQueryData<MessagingMessage[]>(
        ["messaging", "conversations", config.conversationId],
        (old) => {
          if (!old) return old;
          return old.map((msg) => (msg.id === message.id ? message : msg));
        }
      );
    },
    [queryClient, config.conversationId]
  );

  const handleMessageRead = useCallback(
    (data: { messageId: string; userId: string; readAt: string }) => {
      if (!config.conversationId) return;

      queryClient.setQueryData<MessagingMessage[]>(
        ["messaging", "conversations", config.conversationId],
        (old) => {
          if (!old) return old;
          return old.map((msg) =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  readReceipts: [
                    ...(msg.readReceipts || []).filter(
                      (r) => r.userId !== data.userId
                    ),
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
    },
    [queryClient, config.conversationId]
  );

  const handleMessageReaction = useCallback(
    (data: {
      messageId: string;
      userId: string;
      emoji: string;
      action: "add" | "remove";
    }) => {
      if (!config.conversationId) return;

      queryClient.setQueryData<MessagingMessage[]>(
        ["messaging", "conversations", config.conversationId],
        (old) => {
          if (!old) return old;
          return old.map((msg) => {
            if (msg.id !== data.messageId) return msg;

            const reactions = msg.reactions || [];
            if (data.action === "add") {
              return {
                ...msg,
                reactions: [
                  ...reactions.filter(
                    (r) => !(r.userId === data.userId && r.emoji === data.emoji)
                  ),
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
                reactions: reactions.filter(
                  (r) => !(r.userId === data.userId && r.emoji === data.emoji)
                ),
              };
            }
          });
        }
      );
    },
    [queryClient, config.conversationId]
  );

  // Typing indicator management
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (
        !socketRef.current?.connected ||
        !config.conversationId ||
        !config.enableTypingIndicators
      )
        return;

      if (isTyping) {
        socketRef.current.emit("typing_start", {
          conversationId: config.conversationId,
        });

        // Auto-stop typing after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          if (socketRef.current?.connected) {
            socketRef.current.emit("typing_stop", {
              conversationId: config.conversationId,
            });
          }
        }, 3000);
      } else {
        socketRef.current.emit("typing_stop", {
          conversationId: config.conversationId,
        });
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    },
    [config.conversationId, config.enableTypingIndicators]
  );

  // WebSocket lifecycle management
  useEffect(() => {
    if (config.enableRealtime && accessToken && user) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [
    connectWebSocket,
    disconnectWebSocket,
    config.enableRealtime,
    accessToken,
    user,
  ]);

  // Manual reconnection
  const reconnectWebSocket = useCallback(() => {
    disconnectWebSocket();
    reconnectAttemptsRef.current = 0;
    setTimeout(connectWebSocket, 1000);
  }, [connectWebSocket, disconnectWebSocket]);

  // Enhanced send message function
  const sendMessage = useCallback(
    (
      content: string,
      options?: {
        replyToId?: string;
        messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO";
        attachments?: {
          url: string;
          fileName: string;
          fileSize: number;
          mimeType: string;
        }[];
      }
    ) => {
      if (!config.conversationId) return;

      const messageData: SendMessageDto = {
        content,
        messageType: options?.messageType || "TEXT",
        replyToId: options?.replyToId,
        attachments: options?.attachments,
      };

      sendMessageMutation.mutate({
        conversationId: config.conversationId,
        messageData,
      });
    },
    [config.conversationId, sendMessageMutation]
  );

  // File upload helper
  const uploadFile = useCallback(
    async (file: File) => {
      try {
        return await api.messaging.uploadMessageFile(file);
      } catch (error) {
        toast.error("Failed to upload file");
        throw error;
      }
    },
    [api.messaging]
  );

  return {
    // Data
    conversations: conversations || [],
    messages: messages || [],
    typingUsers: Array.from(typingUsers.values()),
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

    // Actions
    sendMessage,
    markAsRead: (messageId: string) => markAsReadMutation.mutate(messageId),
    addReaction: (messageId: string, emoji: string) =>
      addReactionMutation.mutate({ messageId, emoji }),
    removeReaction: (messageId: string, emoji: string) =>
      api.messaging.removeReaction(messageId, emoji),
    sendTypingIndicator,
    uploadFile,

    // Utilities
    refetchConversations,
    refetchMessages,
    reconnectWebSocket,

    // Advanced features
    searchMessages: (query: string) =>
      api.messaging.searchMessages({
        query,
        conversationId: config.conversationId,
      }),
    blockUser: (userId: string, reason?: string) =>
      api.messaging.blockUser({ userId, reason }),
    createConversation: (participantIds: string[]) =>
      api.messaging.createConversation({ participantIds }),
  };
}
