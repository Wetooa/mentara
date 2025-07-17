"use client";

import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket, WebSocketMessage } from "./useWebSocket";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  conversationId: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  messageType: "text" | "file" | "system";
  replyTo?: string;
}

interface MessageEvent {
  type: "message_sent" | "message_updated" | "message_deleted" | "typing_start" | "typing_stop" | "message_read";
  conversationId: string;
  message?: Message;
  userId?: string;
  userName?: string;
  messageId?: string;
}

interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  timestamp: number;
}

interface UseRealTimeMessagesConfig {
  conversationId?: string;
  userId: string;
  enableTypingIndicators?: boolean;
  enableReadReceipts?: boolean;
  enableToasts?: boolean;
}

export function useRealTimeMessages({
  conversationId,
  userId,
  enableTypingIndicators = true,
  enableReadReceipts = true,
  enableToasts = true,
}: UseRealTimeMessagesConfig) {
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  const queryClient = useQueryClient();

  const handleWebSocketMessage = useCallback((wsMessage: WebSocketMessage) => {
    const event = wsMessage.data as MessageEvent;
    
    setLastActivity(Date.now());

    switch (event.type) {
      case "message_sent":
        if (event.message) {
          // Add new message to cache
          queryClient.setQueryData(
            queryKeys.messages.conversation(event.conversationId),
            (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                data: [...(oldData.data || []), event.message],
              };
            }
          );

          // Show toast for new messages (not from current user)
          if (enableToasts && event.message.senderId !== userId) {
            toast.info(`New message from ${event.message.senderName}`);
          }

          // Update conversation list
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.conversations.list() 
          });
        }
        break;

      case "message_updated":
        if (event.message) {
          // Update message in cache
          queryClient.setQueryData(
            queryKeys.messages.conversation(event.conversationId),
            (oldData: any) => {
              if (!oldData?.data) return oldData;
              return {
                ...oldData,
                data: oldData.data.map((msg: Message) =>
                  msg.id === event.message!.id ? event.message : msg
                ),
              };
            }
          );
        }
        break;

      case "message_deleted":
        if (event.messageId) {
          // Remove message from cache
          queryClient.setQueryData(
            queryKeys.messages.conversation(event.conversationId),
            (oldData: any) => {
              if (!oldData?.data) return oldData;
              return {
                ...oldData,
                data: oldData.data.filter((msg: Message) => msg.id !== event.messageId),
              };
            }
          );
        }
        break;

      case "typing_start":
        if (enableTypingIndicators && event.userId !== userId) {
          setTypingUsers(prev => {
            const filtered = prev.filter(
              t => !(t.conversationId === event.conversationId && t.userId === event.userId)
            );
            return [
              ...filtered,
              {
                conversationId: event.conversationId,
                userId: event.userId!,
                userName: event.userName!,
                timestamp: Date.now(),
              },
            ];
          });
        }
        break;

      case "typing_stop":
        if (enableTypingIndicators && event.userId !== userId) {
          setTypingUsers(prev =>
            prev.filter(
              t => !(t.conversationId === event.conversationId && t.userId === event.userId)
            )
          );
        }
        break;

      case "message_read":
        if (enableReadReceipts && event.messageId) {
          // Update read status in cache
          queryClient.setQueryData(
            queryKeys.messages.conversation(event.conversationId),
            (oldData: any) => {
              if (!oldData?.data) return oldData;
              return {
                ...oldData,
                data: oldData.data.map((msg: Message) =>
                  msg.id === event.messageId ? { ...msg, isRead: true } : msg
                ),
              };
            }
          );
        }
        break;
    }
  }, [queryClient, userId, enableTypingIndicators, enableReadReceipts, enableToasts]);

  const webSocket = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
    enableLogging: process.env.NODE_ENV === "development",
    autoReconnect: true,
    heartbeatInterval: 30000,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      // Join conversation room if specified
      if (conversationId) {
        webSocket.sendMessage({
          type: "join_conversation",
          data: { conversationId, userId },
        });
      }
    },
  });

  // Clean up old typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev =>
        prev.filter(t => now - t.timestamp < 5000) // Remove after 5 seconds
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Join/leave conversation room when conversationId changes
  useEffect(() => {
    if (webSocket.isConnected && conversationId) {
      webSocket.sendMessage({
        type: "join_conversation",
        data: { conversationId, userId },
      });

      return () => {
        webSocket.sendMessage({
          type: "leave_conversation",
          data: { conversationId, userId },
        });
      };
    }
  }, [webSocket.isConnected, conversationId, userId, webSocket]);

  const sendTypingStart = useCallback(() => {
    if (conversationId && enableTypingIndicators) {
      webSocket.sendMessage({
        type: "typing_start",
        data: { conversationId, userId },
      });
    }
  }, [conversationId, userId, enableTypingIndicators, webSocket]);

  const sendTypingStop = useCallback(() => {
    if (conversationId && enableTypingIndicators) {
      webSocket.sendMessage({
        type: "typing_stop",
        data: { conversationId, userId },
      });
    }
  }, [conversationId, userId, enableTypingIndicators, webSocket]);

  const markMessageAsRead = useCallback((messageId: string) => {
    if (conversationId && enableReadReceipts) {
      webSocket.sendMessage({
        type: "message_read",
        data: { conversationId, messageId, userId },
      });
    }
  }, [conversationId, userId, enableReadReceipts, webSocket]);

  const getTypingUsersForConversation = useCallback((convId: string) => {
    return typingUsers.filter(t => t.conversationId === convId);
  }, [typingUsers]);

  return {
    // Connection state
    isConnected: webSocket.isConnected,
    isConnecting: webSocket.isConnecting,
    connectionState: webSocket.connectionState,
    lastError: webSocket.lastError,
    lastActivity,
    
    // Real-time data
    typingUsers,
    onlineUsers,
    
    // Actions
    sendTypingStart,
    sendTypingStop,
    markMessageAsRead,
    reconnect: webSocket.reconnect,
    
    // Helpers
    getTypingUsersForConversation,
  };
}