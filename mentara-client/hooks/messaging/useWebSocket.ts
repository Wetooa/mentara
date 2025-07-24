"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSocketConnection } from '@/hooks/useSocketConnection';
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

export function useMessagingWebSocket() {
  // Use centralized socket connection
  const {
    connectionState,
    isConnected,
    error: connectionError,
    subscribeToEvent,
    emit,
    reconnect
  } = useSocketConnection({
    subscriberId: 'messaging-websocket',
    enableRealtime: true,
  });

  const [error, setError] = useState<string | null>(connectionError);

  const connect = useCallback(async () => {
    if (isConnected) return;

    try {
      setError(null);
      await reconnect();
    } catch (err) {
      setError('Failed to connect to messaging service');
    }
  }, [isConnected, reconnect]);

  const disconnect = useCallback(() => {
    // Socket manager handles disconnection automatically
    // when no more subscribers are active
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    emit('join_conversation', { conversationId });
  }, [emit]);

  const leaveConversation = useCallback((conversationId: string) => {
    emit('leave_conversation', { conversationId });
  }, [emit]);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean = true) => {
    emit('typing_indicator', { conversationId, isTyping });
  }, [emit]);

  const subscribeToMessages = useCallback((callback: (message: Message) => void) => {
    return subscribeToEvent('new_message', callback);
  }, [subscribeToEvent]);

  const subscribeToTyping = useCallback((callback: (data: TypingData) => void) => {
    return subscribeToEvent('typing_indicator', callback);
  }, [subscribeToEvent]);

  const subscribeToUserStatus = useCallback((callback: (data: UserStatusData) => void) => {
    return subscribeToEvent('user_status_changed', callback);
  }, [subscribeToEvent]);

  // Sync error state with connection error
  useEffect(() => {
    setError(connectionError);
  }, [connectionError]);

  return {
    isConnected,
    error,
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