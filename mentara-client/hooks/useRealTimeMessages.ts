"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealTimeEvents } from "./useRealTimeEvents";
import { useMessagingWebSocket } from "./messaging/useWebSocket";

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
  attachmentUrls?: string[];
  attachmentNames?: string[];
  attachmentSizes?: number[];
  replyToId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Extended fields for UI
  senderName?: string;
  senderRole?: string;
  isRead?: boolean;
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
  
  // Use the new standardized real-time events system
  const realTimeEvents = useRealTimeEvents({
    namespace: "/messaging",
    enableToasts,
    subscriptions: conversationId ? [`conversation:${conversationId}`] : [],
    toastFilter: (event) => {
      // Only show message toasts for other users
      return event.type.startsWith("message_") && event.data?.senderId !== userId;
    },
  });
  
  // Keep the existing WebSocket for typing indicators and user status
  const webSocket = useMessagingWebSocket();

  const handleNewMessage = useCallback((message: Message) => {
    setLastActivity(Date.now());
    // Message handling is now done by the RealTimeEventManager
    // This callback is kept for backward compatibility
  }, []);

  const handleTypingIndicator = useCallback((data: { conversationId: string; userId: string; isTyping: boolean }) => {
    if (!enableTypingIndicators || data.userId === userId) return;

    setLastActivity(Date.now());
    
    if (data.isTyping) {
      setTypingUsers(prev => {
        const filtered = prev.filter(
          t => !(t.conversationId === data.conversationId && t.userId === data.userId)
        );
        return [
          ...filtered,
          {
            conversationId: data.conversationId,
            userId: data.userId,
            userName: data.userId, // TODO: Get actual username
            timestamp: Date.now(),
          },
        ];
      });
    } else {
      setTypingUsers(prev =>
        prev.filter(
          t => !(t.conversationId === data.conversationId && t.userId === data.userId)
        )
      );
    }
  }, [userId, enableTypingIndicators]);

  const handleUserStatusChange = useCallback((data: { userId: string; status: "online" | "offline" }) => {
    setLastActivity(Date.now());
    
    if (data.status === "online") {
      setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
    } else {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    }
  }, []);

  // Set up WebSocket event subscriptions for non-standardized events
  useEffect(() => {
    const unsubscribeTyping = webSocket.subscribeToTyping(handleTypingIndicator);
    const unsubscribeStatus = webSocket.subscribeToUserStatus(handleUserStatusChange);

    return () => {
      unsubscribeTyping?.();
      unsubscribeStatus?.();
    };
  }, [webSocket, handleTypingIndicator, handleUserStatusChange]);

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
      webSocket.joinConversation(conversationId);

      return () => {
        webSocket.leaveConversation(conversationId);
      };
    }
  }, [webSocket.isConnected, conversationId, webSocket]);

  const sendTypingStart = useCallback(() => {
    if (conversationId && enableTypingIndicators) {
      webSocket.sendTypingIndicator(conversationId, true);
    }
  }, [conversationId, enableTypingIndicators, webSocket]);

  const sendTypingStop = useCallback(() => {
    if (conversationId && enableTypingIndicators) {
      webSocket.sendTypingIndicator(conversationId, false);
    }
  }, [conversationId, enableTypingIndicators, webSocket]);

  const markMessageAsRead = useCallback((messageId: string) => {
    if (conversationId && enableReadReceipts) {
      // TODO: Implement read receipts via WebSocket
      // This would require adding a markMessageAsRead method to the WebSocket service
    }
  }, [conversationId, enableReadReceipts]);

  const getTypingUsersForConversation = useCallback((convId: string) => {
    return typingUsers.filter(t => t.conversationId === convId);
  }, [typingUsers]);

  return {
    // Connection state (using standardized real-time events)
    isConnected: realTimeEvents.isConnected,
    isConnecting: !realTimeEvents.isConnected,
    connectionState: realTimeEvents.isConnected ? 'connected' : 'disconnected',
    lastError: null, // TODO: Get error from standardized system
    lastActivity,
    
    // Real-time data
    typingUsers,
    onlineUsers,
    
    // Actions
    sendTypingStart,
    sendTypingStop,
    markMessageAsRead,
    reconnect: realTimeEvents.connect,
    
    // Helpers
    getTypingUsersForConversation,
    
    // Standardized real-time events access
    realTimeEvents,
  };
}