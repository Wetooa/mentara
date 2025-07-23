import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useCallback, useRef, useState } from "react";
import {
  getMessagingSocket,
  connectMessagingSocket,
  disconnectSocket,
  smartReconnect,
  getConnectionStats,
  getConnectionQuality,
  monitorConnectionHealth,
} from "@/lib/socket";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { TOKEN_STORAGE_KEY } from "@/lib/constants/auth";
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

// Enhanced token validation for WebSocket connections
interface TokenValidationResult {
  isValid: boolean;
  token: string | null;
  error: string | null;
  expiresAt: Date | null;
  userId: string | null;
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

// Enhanced token validation utility
const validateAuthToken = (): TokenValidationResult => {
  try {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      return {
        isValid: false,
        token: null,
        error: "Not in browser environment",
        expiresAt: null,
        userId: null,
      };
    }

    // Get token from localStorage
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (!token) {
      return {
        isValid: false,
        token: null,
        error: "No authentication token found",
        expiresAt: null,
        userId: null,
      };
    }

    // Validate JWT structure
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return {
        isValid: false,
        token: null,
        error: "Invalid token format",
        expiresAt: null,
        userId: null,
      };
    }

    // Decode and validate JWT payload
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const now = Date.now();
      const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;
      
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 <= now) {
        return {
          isValid: false,
          token: null,
          error: "Token has expired",
          expiresAt,
          userId: payload.sub || payload.id || null,
        };
      }

      // Check if token will expire soon (within 5 minutes)
      const fiveMinutesFromNow = now + (5 * 60 * 1000);
      const willExpireSoon = payload.exp && payload.exp * 1000 <= fiveMinutesFromNow;
      
      if (willExpireSoon) {
        console.warn("⚠️ [useMessaging] Token will expire soon:", {
          expiresAt: expiresAt?.toISOString(),
          remainingMinutes: payload.exp ? Math.floor((payload.exp * 1000 - now) / 60000) : null
        });
      }

      return {
        isValid: true,
        token,
        error: null,
        expiresAt,
        userId: payload.sub || payload.id || null,
      };
    } catch (decodeError) {
      return {
        isValid: false,
        token: null,
        error: "Failed to decode token payload",
        expiresAt: null,
        userId: null,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      token: null,
      error: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      expiresAt: null,
      userId: null,
    };
  }
};

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
  const { user } = useAuth();

  // Configuration with defaults
  const config = {
    enableRealtime: true,
    enableTypingIndicators: true,
    enablePresence: true,
    ...params,
  };

  // Enhanced WebSocket state with better debugging
  const [connectionState, setConnectionState] =
    useState<WebSocketConnectionState>({
      isConnected: false,
      isReconnecting: false,
      error: null,
      lastConnected: null,
    });

  // Track connection attempts for debugging
  const connectionAttemptsRef = useRef(0);
  const lastConnectionAttemptRef = useRef<number>(0);

  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(
    new Map()
  );
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectionInProgressRef = useRef(false); // Prevent concurrent connections

  // Constants - More conservative reconnection settings
  const maxReconnectAttempts = 3; // Reduced from 5 to prevent spam
  const baseReconnectDelay = 2000; // Increased from 1s to 2s for gentler reconnect
  const maxReconnectDelay = 15000; // Reduced from 30s to 15s for faster recovery

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
    // Prevent concurrent connection attempts
    if (connectionInProgressRef.current) {
      console.log("⏭️ [useMessaging] Connection already in progress, skipping");
      return;
    }
    
    connectionInProgressRef.current = true;
    
    const attemptId = ++connectionAttemptsRef.current;
    const attemptTimestamp = Date.now();
    lastConnectionAttemptRef.current = attemptTimestamp;
    
    console.log(`🔄 [useMessaging] Connection attempt #${attemptId} starting...`);
    
    // Enhanced token validation before connection attempt
    const tokenValidation = validateAuthToken();
    
    if (!tokenValidation.isValid || !user || !config.enableRealtime) {
      console.log(
        "⏭️ [useMessaging] WebSocket connection skipped - missing auth or realtime disabled",
        {
          tokenValid: tokenValidation.isValid,
          tokenError: tokenValidation.error,
          hasUser: !!user,
          realtimeEnabled: config.enableRealtime,
          userId: tokenValidation.userId,
          tokenExpiresAt: tokenValidation.expiresAt?.toISOString()
        }
      );
      
      const errorMessage = tokenValidation.error || "Authentication or realtime disabled";
      setConnectionState({
        isConnected: false,
        isReconnecting: false,
        error: errorMessage,
        lastConnected: null,
      });
      connectionInProgressRef.current = false; // Reset flag
      return;
    }

    // Log successful token validation
    console.log("✅ [useMessaging] Token validation successful:", {
      userId: tokenValidation.userId,
      expiresAt: tokenValidation.expiresAt?.toISOString(),
      tokenLength: tokenValidation.token?.length
    });

    // Check if we already have a connected socket
    if (socketRef.current?.connected) {
      console.log("✅ [useMessaging] WebSocket already connected:", socketRef.current.id);
      setConnectionState((prev) => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        error: null,
        lastConnected: prev.lastConnected || new Date(),
      }));
      connectionInProgressRef.current = false; // Reset flag
      return;
    }

    try {
      console.log(`🔄 [useMessaging] Connecting to messaging WebSocket (attempt #${attemptId})...`);

      // Set connecting state immediately with proper reconnecting flag
      const isReconnecting = reconnectAttemptsRef.current > 0;
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isReconnecting,
        error: null,
      }));

      console.log(`📊 [useMessaging] Connection state set: { isConnected: false, isReconnecting: ${isReconnecting} }`);

      // Use the centralized socket system with validated token
      const socket = getMessagingSocket(tokenValidation.token!);

      // Setup event handlers before connecting
      setupWebSocketEventHandlers(socket);

      // Store socket reference before connection attempt
      socketRef.current = socket;

      console.log(`🎯 [useMessaging] Initiating socket connection (attempt #${attemptId})...`);
      console.log(`🔧 [useMessaging] Connection details:`, {
        url: socket.io.uri,
        hasToken: !!tokenValidation.token,
        tokenLength: tokenValidation.token?.length,
        userId: tokenValidation.userId,
        expiresIn: tokenValidation.expiresAt ? Math.round((tokenValidation.expiresAt.getTime() - Date.now()) / 1000 / 60) + ' minutes' : 'unknown'
      });
      
      // Attempt connection with timeout handling using validated token
      await connectMessagingSocket(tokenValidation.token!);

      console.log(`✅ [useMessaging] Socket connection initiated successfully (attempt #${attemptId})`);
      
      // Note: Final connection state will be set in the 'connect' event handler
      // to ensure we only mark as connected when the socket is actually ready
      // connectionInProgressRef.current will be reset in the connect event handler
      
    } catch (error) {
      console.error(`❌ [useMessaging] Connection attempt #${attemptId} failed:`, error);
      console.error(`🔍 [useMessaging] Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code || 'NO_CODE',
        stack: error instanceof Error ? error.stack : 'No stack',
        socketId: socketRef.current?.id || 'No socket ID',
        socketConnected: socketRef.current?.connected || false,
        socketDisconnected: socketRef.current?.disconnected || false
      });
      
      // Clear socket reference on connection failure
      if (socketRef.current) {
        console.log(`🧹 [useMessaging] Cleaning up failed socket ${socketRef.current.id}`);
        socketRef.current.removeAllListeners();
        socketRef.current = null;
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to connect";
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        error: errorMessage,
        isReconnecting: false,
      }));
      
      console.error(`💥 [useMessaging] Connection state updated with error: ${errorMessage}`);
      
      // Only schedule reconnect if we haven't exceeded max attempts
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        console.log(`🔄 [useMessaging] Scheduling reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        scheduleReconnect();
      } else {
        console.error(`❌ [useMessaging] Max reconnection attempts reached, not scheduling more`);
      }
      
      connectionInProgressRef.current = false; // Reset flag on error
    }
  }, [user, config.enableRealtime]); // Removed accessToken dependency since we validate token inside the function

  const setupWebSocketEventHandlers = useCallback(
    (socket: Socket) => {
      console.log("🎯 [useMessaging] Setting up WebSocket event handlers");
      
      // Remove any existing listeners to prevent duplicates
      socket.removeAllListeners();
      
      // Track event listeners for better cleanup
      const eventListeners = new Map<string, Function>();

      // Helper function to register event listeners with tracking and error handling
      const registerEventListener = (event: string, handler: Function) => {
        const wrappedHandler = (...args: any[]) => {
          try {
            handler(...args);
          } catch (error) {
            console.error(`💥 [useMessaging] Error in ${event} handler:`, error);
            console.error(`📊 [useMessaging] Handler args:`, args);
            
            // Don't let event handler errors break the entire connection
            // but do track them for debugging
            if (error instanceof Error) {
              setConnectionState((prev) => ({
                ...prev,
                error: `Event handler error: ${error.message}`,
              }));
            }
          }
        };
        
        eventListeners.set(event, wrappedHandler);
        socket.on(event, wrappedHandler as any);
        console.log(`📝 [useMessaging] Registered event listener: ${event}`);
      };

      // Connection events with enhanced state management
      registerEventListener("connect", () => {
        const connectedAt = new Date();
        console.log("✅ [useMessaging] WebSocket connected:", socket.id);
        console.log("🎯 [useMessaging] Connection details:", {
          socketId: socket.id,
          transport: socket.io.engine.transport.name,
          connected: socket.connected,
          attemptCount: connectionAttemptsRef.current
        });
        
        // Update connection state immediately and definitively
        setConnectionState({
          isConnected: true,
          isReconnecting: false,
          error: null,
          lastConnected: connectedAt,
        });
        
        // Reset reconnection attempts and connection flag
        reconnectAttemptsRef.current = 0;
        connectionInProgressRef.current = false;
        
        console.log("🎉 [useMessaging] Connection state updated to CONNECTED");

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

      registerEventListener("disconnect", (reason) => {
        console.log("❌ [useMessaging] WebSocket disconnected:", reason);
        console.log("💔 [useMessaging] Disconnect details:", {
          reason,
          socketId: socket.id,
          connected: socket.connected,
          timestamp: new Date().toISOString()
        });
        
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          isReconnecting: false,
        }));
        
        console.log("📊 [useMessaging] Connection state updated to DISCONNECTED");

        // Auto-reconnect unless it was a manual disconnect or server shutdown
        if (reason !== "io server disconnect" && reason !== "io client disconnect") {
          console.log("🔄 [useMessaging] Auto-reconnect triggered for reason:", reason);
          scheduleReconnect();
        }
      });

      registerEventListener("connect_error", (error) => {
        console.error("🚫 [useMessaging] WebSocket connection error:", error);
        console.error("💥 [useMessaging] Error details:", {
          message: error.message || 'No message',
          type: error.type || 'No type',
          description: error.description || 'No description',
          context: error.context || 'No context',
          transport: error.transport || 'No transport',
          code: error.code || 'No code',
          data: error.data || 'No data'
        });
        
        const errorMessage = error instanceof Error ? error.message : "Connection error";
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          error: errorMessage,
          isReconnecting: false,
        }));
        
        console.error(`💥 [useMessaging] Connection state updated with error: ${errorMessage}`);
        
        // Don't reconnect on authentication errors to prevent spam
        if (error.type === 'TransportError' && error.description?.includes('401')) {
          console.error("🔐 [useMessaging] Authentication error detected, not reconnecting");
          return;
        }
        
        scheduleReconnect();
      });

      // Handle authentication-specific errors from the backend
      registerEventListener("auth_error", (data) => {
        console.error("🔐 [useMessaging] Authentication error from backend:", data);
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          error: `Auth error: ${data.message || 'Authentication failed'}`,
          isReconnecting: false,
        }));
        
        // Don't auto-reconnect on auth errors - user needs to refresh token
        console.error("🔐 [useMessaging] Authentication failed, not auto-reconnecting");
      });

      registerEventListener("connection_error", (data) => {
        console.error("🔗 [useMessaging] Connection error from backend:", data);
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          error: `Connection error: ${data.message || 'Connection failed'}`,
          isReconnecting: false,
        }));
        
        scheduleReconnect();
      });

      // Message events - with proper backend event names
      registerEventListener("new_message", (data: MessageEventData) => {
        if (!data || !data.message) {
          console.error("❌ [useMessaging] Received invalid message event data:", data);
          return;
        }
        
        console.log("📨 [useMessaging] Received new message:", data.message.id);
        handleNewMessage(data.message);
      });

      registerEventListener("message_updated", (data: MessageUpdatedEventData) => {
        if (!data || !data.messageId) {
          console.error("❌ [useMessaging] Received invalid message_updated event data:", data);
          return;
        }
        
        console.log("✏️ [useMessaging] Message updated:", data.messageId);
        handleMessageUpdate(data);
      });

      registerEventListener("message_read", (data: MessageReadEventData) => {
        if (!data || !data.messageId || !data.userId) {
          console.error("❌ [useMessaging] Received invalid message_read event data:", data);
          return;
        }
        
        console.log("👁️ [useMessaging] Message read:", data.messageId);
        handleMessageRead(data);
      });

      registerEventListener("message_reaction", (data: MessageReactionEventData) => {
        if (!data || !data.messageId || !data.userId || !data.emoji) {
          console.error("❌ [useMessaging] Received invalid message_reaction event data:", data);
          return;
        }
        
        console.log("⚡ [useMessaging] Message reaction:", {
          messageId: data.messageId,
          emoji: data.emoji,
        });
        handleMessageReaction(data);
      });

      // Typing indicators
      if (config.enableTypingIndicators) {
        registerEventListener("typing_indicator", (data: TypingEventData) => {
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
        registerEventListener("user_status_changed", (data: UserStatusEventData) => {
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
      registerEventListener("conversation_joined", (data: ConversationEventData) => {
        console.log(
          "🏠 [useMessaging] Joined conversation:",
          data.conversationId
        );
      });

      registerEventListener("conversation_left", (data: ConversationEventData) => {
        console.log(
          "🚪 [useMessaging] Left conversation:",
          data.conversationId
        );
      });

      // Store cleanup function for proper event listener removal
      (socket as any)._messagingCleanup = () => {
        console.log(`🧹 [useMessaging] Cleaning up ${eventListeners.size} event listeners`);
        eventListeners.forEach((handler, event) => {
          socket.off(event, handler as any);
          console.log(`🗑️ [useMessaging] Removed event listener: ${event}`);
        });
        eventListeners.clear();
      };
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
      // Use custom cleanup function if available for better tracking
      if ((socketRef.current as any)._messagingCleanup) {
        (socketRef.current as any)._messagingCleanup();
      } else {
        console.log("🧹 [useMessaging] Using fallback cleanup (removeAllListeners)");
        socketRef.current.removeAllListeners();
      }
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
    console.log(`🔄 [useMessaging] scheduleReconnect called (current attempts: ${reconnectAttemptsRef.current})`);
    
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
      console.error("❌ [useMessaging] Max reconnection attempts reached, trying smart reconnect");
      
      // Try smart reconnect as a fallback with fewer attempts
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isReconnecting: true,
        error: "Attempting smart reconnection...",
      }));
      
      smartReconnect('/messaging', 3).then((success) => {
        if (success) {
          console.log("✅ [useMessaging] Smart reconnection successful!");
          reconnectAttemptsRef.current = 0; // Reset counter on success
          setConnectionState({
            isConnected: true,
            isReconnecting: false,
            error: null,
            lastConnected: new Date(),
          });
        } else {
          console.error("❌ [useMessaging] Smart reconnection failed");
          setConnectionState((prev) => ({
            ...prev,
            isConnected: false,
            isReconnecting: false,
            error: "All reconnection attempts failed",
          }));
        }
      }).catch((error) => {
        console.error("💥 [useMessaging] Smart reconnection error:", error);
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          isReconnecting: false,
          error: `Smart reconnection failed: ${error.message}`,
        }));
      });
      
      return;
    }

    reconnectAttemptsRef.current++;
    
    // Enhanced delay calculation with network-aware backoff
    const networkMultiplier = navigator.onLine ? 1 : 2;
    const connectionQuality = getConnectionQuality('/messaging');
    const qualityMultiplier = connectionQuality === 'poor' ? 1.5 : 1;
    
    const delay = Math.min(
      baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1) * networkMultiplier * qualityMultiplier,
      maxReconnectDelay
    );

    // Enhanced jitter with network awareness
    const jitterFactor = navigator.onLine ? 0.25 : 0.4; // More jitter when offline
    const jitter = delay * jitterFactor * (Math.random() - 0.5);
    const finalDelay = Math.max(delay + jitter, 500); // Minimum 500ms

    console.log(
      `🔄 [useMessaging] Enhanced reconnect scheduled in ${Math.round(finalDelay)}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`,
      {
        networkOnline: navigator.onLine,
        connectionQuality,
        networkMultiplier,
        qualityMultiplier,
        baseDelay: Math.round(delay),
        jitter: Math.round(jitter),
        finalDelay: Math.round(finalDelay),
        jitterFactor
      }
    );

    // Set reconnecting state immediately
    setConnectionState((prev) => ({
      ...prev,
      isConnected: false,
      isReconnecting: true,
      error: null,
    }));
    
    console.log("🔄 [useMessaging] Connection state updated to RECONNECTING");

    // Clear any existing timeout to prevent multiple reconnect attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`⏰ [useMessaging] Reconnect timeout fired, initiating connection attempt #${reconnectAttemptsRef.current}`);
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
    
    // Log current state for debugging
    console.log("📊 [useMessaging] Pre-reconnect state:", {
      isConnected: connectionState.isConnected,
      isReconnecting: connectionState.isReconnecting,
      error: connectionState.error,
      socketConnected: socketRef.current?.connected,
      socketId: socketRef.current?.id,
      attempts: reconnectAttemptsRef.current,
      lastAttempt: new Date(lastConnectionAttemptRef.current).toISOString()
    });
    
    disconnectWebSocket();
    reconnectAttemptsRef.current = 0;
    setTimeout(connectWebSocket, 1000);
  }, [connectWebSocket, disconnectWebSocket, connectionState]);

  // Connection state monitoring - helps detect stuck connections
  const monitorConnectionState = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectionAttemptRef.current;
    const isStuckConnecting = !connectionState.isConnected && 
                             !connectionState.isReconnecting && 
                             !connectionState.error &&
                             timeSinceLastAttempt > 30000; // 30 seconds
    
    if (isStuckConnecting) {
      console.warn("⚠️ [useMessaging] Connection appears stuck, forcing reconnect");
      console.warn("📊 [useMessaging] Stuck connection details:", {
        isConnected: connectionState.isConnected,
        isReconnecting: connectionState.isReconnecting,
        error: connectionState.error,
        timeSinceLastAttempt,
        socketConnected: socketRef.current?.connected,
        socketId: socketRef.current?.id
      });
      
      // Force a reconnection attempt
      reconnectWebSocket();
    }
  }, [connectionState, reconnectWebSocket]);

  // ============ EFFECTS ============

  // WebSocket lifecycle management with token change detection
  useEffect(() => {
    if (config.enableRealtime && user) {
      const tokenValidation = validateAuthToken();
      if (tokenValidation.isValid) {
        console.log("🔄 [useMessaging] Token validation passed, initiating WebSocket connection");
        connectWebSocket();
      } else {
        console.log("❌ [useMessaging] Token validation failed:", tokenValidation.error);
        setConnectionState({
          isConnected: false,
          isReconnecting: false,
          error: tokenValidation.error,
          lastConnected: null,
        });
      }
    }

    return () => {
      disconnectWebSocket();
    };
  }, [
    connectWebSocket,
    disconnectWebSocket,
    config.enableRealtime,
    user,
  ]);

  // Monitor for token changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_STORAGE_KEY) {
        console.log("🔄 [useMessaging] Token changed in localStorage, reconnecting...");
        disconnectWebSocket();
        
        // Small delay to ensure cleanup is complete
        setTimeout(() => {
          if (config.enableRealtime && user) {
            connectWebSocket();
          }
        }, 1000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [connectWebSocket, disconnectWebSocket, config.enableRealtime, user]);

  // Handle network state changes
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 [useMessaging] Device came back online, attempting reconnection");
      if (!connectionState.isConnected && config.enableRealtime && user) {
        const tokenValidation = validateAuthToken();
        if (tokenValidation.isValid) {
          reconnectAttemptsRef.current = 0; // Reset attempts when coming back online
          connectWebSocket();
        } else {
          console.log("❌ [useMessaging] Cannot reconnect - token validation failed:", tokenValidation.error);
        }
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
  }, [connectionState.isConnected, config.enableRealtime, user, connectWebSocket]);

  // Connection state monitoring effect
  useEffect(() => {
    const monitorInterval = setInterval(() => {
      monitorConnectionState();
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(monitorInterval);
    };
  }, [monitorConnectionState]);

  // Connection quality monitoring effect
  useEffect(() => {
    if (!config.enableRealtime || !connectionState.isConnected) {
      return;
    }

    const healthMonitorInterval = monitorConnectionHealth('/messaging', (stats) => {
      // Log quality changes and potential issues
      if (stats.quality === 'poor' && stats.ping > 300) {
        console.warn('⚠️ [useMessaging] Poor connection quality detected:', {
          quality: stats.quality,
          ping: stats.ping,
          transport: stats.transport,
          networkType: stats.networkInfo.effectiveType
        });
        
        // Consider triggering reconnection if quality is consistently poor
        // This is handled in the smart reconnect logic
      }
      
      // Update connection diagnostics with quality info
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [useMessaging] Connection quality check:', {
          quality: stats.quality,
          ping: stats.ping,
          transport: stats.transport,
          connected: stats.connected
        });
      }
    });

    return () => {
      if (healthMonitorInterval) {
        clearInterval(healthMonitorInterval);
      }
    };
  }, [config.enableRealtime, connectionState.isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  // ============ DEBUGGING UTILITIES ============

  const getConnectionDiagnostics = useCallback(() => {
    const tokenValidation = validateAuthToken();
    const connectionStats = getConnectionStats('/messaging');
    const connectionQuality = getConnectionQuality('/messaging');
    
    return {
      connectionState,
      socketState: {
        exists: !!socketRef.current,
        connected: socketRef.current?.connected || false,
        id: socketRef.current?.id || null,
        transport: socketRef.current?.io.engine?.transport?.name || null,
        readyState: socketRef.current?.io.engine?.readyState || null,
        ping: socketRef.current?.io.engine?.ping || 0
      },
      quality: {
        overall: connectionQuality,
        ping: connectionStats?.ping || 0,
        transport: connectionStats?.transport || 'unknown',
        stats: connectionStats
      },
      attempts: {
        total: connectionAttemptsRef.current,
        reconnect: reconnectAttemptsRef.current,
        lastAttempt: lastConnectionAttemptRef.current ? new Date(lastConnectionAttemptRef.current).toISOString() : null
      },
      authentication: {
        tokenValid: tokenValidation.isValid,
        tokenError: tokenValidation.error,
        tokenExpiresAt: tokenValidation.expiresAt?.toISOString() || null,
        tokenUserId: tokenValidation.userId,
        hasUser: !!user,
        userIdMatch: tokenValidation.userId === user?.id
      },
      config: {
        enableRealtime: config.enableRealtime,
        conversationId: config.conversationId,
        enableTypingIndicators: config.enableTypingIndicators,
        enablePresence: config.enablePresence
      },
      network: {
        online: navigator.onLine,
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
        downlink: (navigator as any).connection?.downlink || 0,
        rtt: (navigator as any).connection?.rtt || 0
      },
      performance: {
        reconnectStrategy: {
          maxAttempts: maxReconnectAttempts,
          baseDelay: baseReconnectDelay,
          maxDelay: maxReconnectDelay,
          currentAttempts: reconnectAttemptsRef.current
        }
      }
    };
  }, [connectionState, config, user]);

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
    getConnectionDiagnostics,

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
