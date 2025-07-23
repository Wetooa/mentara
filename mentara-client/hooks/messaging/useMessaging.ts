import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useCallback, useRef, useState } from "react";
import {
  getMessagingSocket,
  connectMessagingSocket,
  disconnectSocket,
} from "@/lib/socket";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import type {
  MessagingConversation,
  MessagingMessage,
  SendMessageDto,
} from "@/lib/api/services/messaging";

// WebSocket connection state interface
interface WebSocketConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
}

// Typing status interface
interface TypingStatus {
  conversationId: string;
  userId: string;
  userName?: string;
  isTyping: boolean;
}

// WebSocket event data interfaces
interface MessageEventData {
  message: MessagingMessage;
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
  action: "add" | "remove";
}

interface TypingEventData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

interface UserStatusEventData {
  userId: string;
  status: "online" | "offline";
  timestamp: string;
}

interface ConversationEventData {
  conversationId: string;
  userId?: string;
}

/**
 * Unified messaging hook with WebSocket integration
 * Consolidates all messaging functionality with proper React Query cache management
 * Fixes type mismatches and environment variable issues
 */
export function useMessaging(
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

  // WebSocket state
  const [connectionState, setConnectionState] =
    useState<WebSocketConnectionState>({
      isConnected: false,
      isReconnecting: false,
      error: null,
      lastConnected: null,
    });

  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(
    new Map()
  );
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Constants
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // Start with 1 second
  const maxReconnectDelay = 30000; // Max 30 seconds

  // Query keys for consistent cache management
  const queryKeys = {
    conversations: ["messaging", "conversations"] as const,
    messages: (conversationId: string) =>
      ["messaging", "messages", conversationId] as const,
    conversationDetails: (conversationId: string) =>
      ["messaging", "conversation", conversationId] as const,
  };

  // ============ REACT QUERY QUERIES ============

  // Get all conversations
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: queryKeys.conversations,
    queryFn: async () => {
      console.log("🔄 [useMessaging] Fetching conversations...");
      const result = await api.messaging.getConversations();
      console.log(
        "✅ [useMessaging] Fetched",
        result?.length || 0,
        "conversations"
      );
      return result;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes cache time
  });

  // Get messages for specific conversation
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: config.conversationId
      ? queryKeys.messages(config.conversationId)
      : [],
    queryFn: () => {
      if (!config.conversationId) return Promise.resolve([]);
      console.log(
        "🔄 [useMessaging] Fetching messages for conversation:",
        config.conversationId
      );
      return api.messaging.getMessages(config.conversationId);
    },
    enabled: !!config.conversationId,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes cache time
  });

  // ============ MUTATIONS ============

  // Send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      messageData,
    }: {
      conversationId: string;
      messageData: SendMessageDto;
    }) => {
      console.log("📤 [useMessaging] Sending message:", {
        conversationId,
        messageData,
      });
      return api.messaging.sendMessage(conversationId, messageData);
    },
    onMutate: async ({ conversationId, messageData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages(conversationId),
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<MessagingMessage[]>(
        queryKeys.messages(conversationId)
      );

      // Optimistically update with temporary message
      const tempMessage: MessagingMessage = {
        id: `temp-${Date.now()}`,
        senderId: user?.id || "", // Use senderId to match backend
        content: messageData.content,
        messageType: messageData.type || "text", // Use messageType to match backend
        conversationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRead: false,
        isEdited: false,
        isDeleted: false,
        replyToId: messageData.replyToMessageId, // Use replyToId to match backend
        attachmentUrls: [],
        attachmentNames: [],
        attachmentSizes: [],
        editedAt: null,
        sender: {
          id: user?.id || "",
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          role: user?.role || "client"
        },
        replyTo: null,
        reactions: [],
        readReceipts: [],
      };

      queryClient.setQueryData<MessagingMessage[]>(
        queryKeys.messages(conversationId),
        (old) => (old ? [...old, tempMessage] : [tempMessage])
      );

      return { previousMessages, conversationId };
    },
    onError: (err, variables, context) => {
      console.error("❌ [useMessaging] Failed to send message:", err);
      // Rollback on error
      if (context) {
        queryClient.setQueryData(
          queryKeys.messages(context.conversationId),
          context.previousMessages
        );
      }
      toast.error("Failed to send message");
    },
    onSuccess: (newMessage, { conversationId }) => {
      console.log(
        "✅ [useMessaging] Message sent successfully:",
        newMessage.id
      );

      // Replace temp message with real message
      queryClient.setQueryData<MessagingMessage[]>(
        queryKeys.messages(conversationId),
        (old) => {
          if (!old) return [newMessage];
          // Remove temp messages and add the real one
          const filtered = old.filter((msg) => !msg.id.startsWith("temp-"));
          return [...filtered, newMessage];
        }
      );

      // Update conversations list with latest message
      queryClient.setQueryData<MessagingConversation[]>(
        queryKeys.conversations,
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

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) =>
      api.messaging.markMessageAsRead(messageId),
    onSuccess: (_, messageId) => {
      console.log("✅ [useMessaging] Marked message as read:", messageId);
    },
    onError: (error) => {
      console.error("❌ [useMessaging] Failed to mark message as read:", error);
      toast.error("Failed to mark message HAHA as read");
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      api.messaging.addReaction(messageId, emoji),
    onSuccess: (_, { messageId, emoji }) => {
      console.log("✅ [useMessaging] Added reaction:", { messageId, emoji });
    },
    onError: (error) => {
      console.error("❌ [useMessaging] Failed to add reaction:", error);
      toast.error("Failed to add reaction");
    },
  });

  // ============ WEBSOCKET CONNECTION MANAGEMENT ============

  const connectWebSocket = useCallback(async () => {
    if (!accessToken || !user || !config.enableRealtime) {
      console.log(
        "⏭️ [useMessaging] WebSocket connection skipped - missing auth or realtime disabled"
      );
      setConnectionState({
        isConnected: false,
        isReconnecting: false,
        error: null,
        lastConnected: null,
      });
      return;
    }

    if (socketRef.current?.connected) {
      console.log("✅ [useMessaging] WebSocket already connected");
      setConnectionState((prev) => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        error: null,
        lastConnected: prev.lastConnected || new Date(),
      }));
      return;
    }

    try {
      console.log("🔄 [useMessaging] Connecting to messaging WebSocket...");

      // Set connecting state (not reconnecting for first attempt)
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isReconnecting: reconnectAttemptsRef.current > 0,
        error: null,
      }));

      // Use the centralized socket system with proper namespace
      const socket = getMessagingSocket(accessToken);

      // Setup event handlers before connecting
      setupWebSocketEventHandlers(socket);

      // Store socket reference before connection attempt
      socketRef.current = socket;

      // Attempt connection with timeout handling
      await connectMessagingSocket(accessToken);

      console.log("✅ [useMessaging] WebSocket connection initiated successfully");
      
      // Note: Final connection state will be set in the 'connect' event handler
      // to ensure we only mark as connected when the socket is actually ready
      
    } catch (error) {
      console.error("❌ [useMessaging] Failed to connect WebSocket:", error);
      
      // Clear socket reference on connection failure
      socketRef.current = null;
      
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error.message : "Failed to connect",
        isReconnecting: false,
      }));
      
      scheduleReconnect();
    }
  }, [accessToken, user, config.enableRealtime]);

  const setupWebSocketEventHandlers = useCallback(
    (socket: Socket) => {
      // Remove any existing listeners to prevent duplicates
      socket.removeAllListeners();

      // Connection events
      socket.on("connect", () => {
        console.log("✅ [useMessaging] WebSocket connected:", socket.id);
        setConnectionState({
          isConnected: true,
          isReconnecting: false,
          error: null,
          lastConnected: new Date(),
        });
        reconnectAttemptsRef.current = 0;

        // Join conversation room if specified
        if (config.conversationId) {
          console.log(
            "🏠 [useMessaging] Joining conversation room:",
            config.conversationId
          );
          socket.emit("join_conversation", {
            conversationId: config.conversationId,
          });
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ [useMessaging] WebSocket disconnected:", reason);
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          isReconnecting: false,
        }));

        // Auto-reconnect unless it was a manual disconnect or server shutdown
        if (reason !== "io server disconnect" && reason !== "io client disconnect") {
          console.log("🔄 [useMessaging] Auto-reconnect triggered for reason:", reason);
          scheduleReconnect();
        }
      });

      socket.on("connect_error", (error) => {
        console.error("🚫 [useMessaging] WebSocket connection error:", error);
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          error: error instanceof Error ? error.message : "Connection error",
          isReconnecting: false,
        }));
        scheduleReconnect();
      });

      // Message events - with proper backend event names
      socket.on("new_message", (data: MessageEventData) => {
        console.log("📨 [useMessaging] Received new message:", data.message.id);
        handleNewMessage(data.message);
      });

      socket.on("message_updated", (data: MessageUpdatedEventData) => {
        console.log("✏️ [useMessaging] Message updated:", data.messageId);
        handleMessageUpdate(data);
      });

      socket.on("message_read", (data: MessageReadEventData) => {
        console.log("👁️ [useMessaging] Message read:", data.messageId);
        handleMessageRead(data);
      });

      socket.on("message_reaction", (data: MessageReactionEventData) => {
        console.log("⚡ [useMessaging] Message reaction:", {
          messageId: data.messageId,
          emoji: data.emoji,
        });
        handleMessageReaction(data);
      });

      // Typing indicators
      if (config.enableTypingIndicators) {
        socket.on("typing_indicator", (data: TypingEventData) => {
          console.log("✏️ [useMessaging] Typing indicator:", data);
          if (data.userId !== user?.id) {
            if (data.isTyping) {
              setTypingUsers((prev) =>
                new Map(prev).set(data.userId, {
                  conversationId: data.conversationId,
                  userId: data.userId,
                  isTyping: data.isTyping,
                })
              );
            } else {
              setTypingUsers((prev) => {
                const newMap = new Map(prev);
                newMap.delete(data.userId);
                return newMap;
              });
            }
          }
        });
      }

      // Presence events
      if (config.enablePresence) {
        socket.on("user_status_changed", (data: UserStatusEventData) => {
          console.log("👤 [useMessaging] User status changed:", data);
          if (data.status === "online") {
            setOnlineUsers((prev) => new Set(prev).add(data.userId));
          } else {
            setOnlineUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }
        });
      }

      // Conversation events
      socket.on("conversation_joined", (data: ConversationEventData) => {
        console.log(
          "🏠 [useMessaging] Joined conversation:",
          data.conversationId
        );
      });

      socket.on("conversation_left", (data: ConversationEventData) => {
        console.log(
          "🚪 [useMessaging] Left conversation:",
          data.conversationId
        );
      });
    },
    [
      config.conversationId,
      config.enableTypingIndicators,
      config.enablePresence,
      user?.id,
    ]
  );

  const disconnectWebSocket = useCallback(() => {
    console.log("🔌 [useMessaging] Disconnecting WebSocket...");

    // Clear all timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Remove event listeners from current socket before disconnecting
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
    }

    // Disconnect the socket
    disconnectSocket("/messaging");
    socketRef.current = null;

    // Reset reconnection attempts
    reconnectAttemptsRef.current = 0;

    // Clear all state
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
    // Don't reconnect if offline
    if (!navigator.onLine) {
      console.log("🌐 [useMessaging] Device is offline, skipping reconnection attempt");
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isReconnecting: false,
        error: "Device is offline",
      }));
      return;
    }

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error("❌ [useMessaging] Max reconnection attempts reached");
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isReconnecting: false,
        error: "Max reconnection attempts reached",
      }));
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = Math.min(
      baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1),
      maxReconnectDelay
    );

    // Add jitter to prevent thundering herd (±25% random variance)
    const jitter = delay * 0.25 * (Math.random() - 0.5);
    const finalDelay = Math.max(delay + jitter, 500); // Minimum 500ms

    console.log(
      `🔄 [useMessaging] Scheduling reconnect in ${Math.round(finalDelay)}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}) with jitter`
    );

    // Set reconnecting state immediately
    setConnectionState((prev) => ({
      ...prev,
      isConnected: false,
      isReconnecting: true,
      error: null,
    }));

    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
    }, finalDelay);
  }, [connectWebSocket]);

  // ============ WEBSOCKET EVENT HANDLERS ============

  const handleNewMessage = useCallback(
    (message: MessagingMessage) => {
      // Add message to the cache
      if (message.conversationId === config.conversationId) {
        queryClient.setQueryData<MessagingMessage[]>(
          queryKeys.messages(message.conversationId),
          (old) => (old ? [...old, message] : [message])
        );
      }

      // Update conversations list
      queryClient.setQueryData<MessagingConversation[]>(
        queryKeys.conversations,
        (old) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === message.conversationId
              ? { ...conv, lastMessage: message }
              : conv
          );
        }
      );

      // Show toast for new messages from others (not in current conversation)
      if (
        message.senderId !== user?.id &&
        message.conversationId !== config.conversationId
      ) {
        toast("New message", {
          description:
            message.content.length > 50
              ? message.content.substring(0, 50) + "..."
              : message.content,
        });
      }
    },
    [queryClient, user?.id, config.conversationId]
  );

  const handleMessageUpdate = useCallback(
    (data: MessageUpdatedEventData) => {
      if (!config.conversationId) return;

      queryClient.setQueryData<MessagingMessage[]>(
        queryKeys.messages(config.conversationId),
        (old) => {
          if (!old) return old;
          return old.map((msg) =>
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
    },
    [queryClient, config.conversationId]
  );

  const handleMessageRead = useCallback(
    (data: MessageReadEventData) => {
      if (!config.conversationId) return;

      queryClient.setQueryData<MessagingMessage[]>(
        queryKeys.messages(config.conversationId),
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
    (data: MessageReactionEventData) => {
      if (!config.conversationId) return;

      queryClient.setQueryData<MessagingMessage[]>(
        queryKeys.messages(config.conversationId),
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

  // ============ PUBLIC ACTIONS ============

  const sendMessage = useCallback(
    (
      content: string,
      options?: {
        replyToMessageId?: string;
        type?: "text" | "image" | "audio" | "video";
        attachments?: {
          url: string;
          fileName: string;
          fileSize: number;
          mimeType: string;
        }[];
      }
    ) => {
      if (!config.conversationId) {
        toast.error("No conversation selected");
        return;
      }

      const messageData: SendMessageDto = {
        content,
        type: options?.type || "text",
        replyToMessageId: options?.replyToMessageId,
        attachments: options?.attachments,
      };

      sendMessageMutation.mutate({
        conversationId: config.conversationId,
        messageData,
      });
    },
    [config.conversationId, sendMessageMutation]
  );

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (
        !socketRef.current?.connected ||
        !config.conversationId ||
        !config.enableTypingIndicators
      ) {
        return;
      }

      console.log("✏️ [useMessaging] Sending typing indicator:", {
        conversationId: config.conversationId,
        isTyping,
      });

      socketRef.current.emit("typing_indicator", {
        conversationId: config.conversationId,
        isTyping,
      });

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
    },
    [config.conversationId, config.enableTypingIndicators]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        console.log("📎 [useMessaging] Uploading file:", file.name);
        return await api.messaging.uploadMessageFile(file);
      } catch (error) {
        console.error("❌ [useMessaging] Failed to upload file:", error);
        toast.error("Failed to upload file");
        throw error;
      }
    },
    [api.messaging]
  );

  const reconnectWebSocket = useCallback(() => {
    console.log("🔄 [useMessaging] Manual reconnection requested");
    disconnectWebSocket();
    reconnectAttemptsRef.current = 0;
    setTimeout(connectWebSocket, 1000);
  }, [connectWebSocket, disconnectWebSocket]);

  // ============ EFFECTS ============

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

  // Handle network state changes
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 [useMessaging] Device came back online, attempting reconnection");
      if (!connectionState.isConnected && config.enableRealtime && accessToken && user) {
        reconnectAttemptsRef.current = 0; // Reset attempts when coming back online
        connectWebSocket();
      }
    };

    const handleOffline = () => {
      console.log("🌐 [useMessaging] Device went offline");
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isReconnecting: false,
        error: "Device is offline",
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionState.isConnected, config.enableRealtime, accessToken, user, connectWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  // ============ RETURN API ============

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
    isConnected: connectionState.isConnected,

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
