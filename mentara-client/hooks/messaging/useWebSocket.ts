"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from '@/lib/constants/auth';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  emitEvent, 
  onEvent, 
  onStateChange, 
  getConnectionState,
  type ConnectionState 
} from '@/lib/websocket';
import type { Message } from '@/components/messages/types';

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

/**
 * Simplified WebSocket hook for messaging
 * Uses the new simple WebSocket client instead of complex useSocketConnection
 */
export function useMessagingWebSocket() {
  const { isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>(getConnectionState());
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    const token = getAuthToken();
    if (connectionState.isConnected || !token) return;

    try {
      setError(null);
      await connectWebSocket(token);
    } catch (err) {
      setError('Failed to connect to messaging service');
    }
  }, [connectionState.isConnected]);

  const disconnect = useCallback(() => {
    disconnectWebSocket();
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    emitEvent('join_conversation', { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    emitEvent('leave_conversation', { conversationId });
  }, []);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean = true) => {
    emitEvent('typing_indicator', { conversationId, isTyping });
  }, []);

  const subscribeToMessages = useCallback((callback: (message: Message) => void) => {
    return onEvent('new_message', (data: { message: Message }) => {
      callback(data.message);
    });
  }, []);

  const subscribeToTyping = useCallback((callback: (data: TypingData) => void) => {
    return onEvent('typing_indicator', callback);
  }, []);

  const subscribeToUserStatus = useCallback((callback: (data: UserStatusData) => void) => {
    return onEvent('user_status_changed', callback);
  }, []);

  // Monitor connection state
  useEffect(() => {
    const unsubscribe = onStateChange(setConnectionState);
    return unsubscribe;
  }, []);

  // Auto-connect when authenticated and not connected
  useEffect(() => {
    if (isAuthenticated && !connectionState.isConnected) {
      connect();
    }
  }, [isAuthenticated, connectionState.isConnected, connect]);

  return {
    isConnected: connectionState.isConnected,
    error: error || connectionState.error,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    subscribeToMessages,
    subscribeToTyping,
    subscribeToUserStatus,
    connectionState,
  };
}