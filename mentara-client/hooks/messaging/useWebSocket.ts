"use client";

import { useState, useEffect, useCallback } from 'react';
import { messagingWebSocket } from '@/lib/messaging-websocket';
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
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (messagingWebSocket.isSocketConnected()) return;

    try {
      setError(null);
      await messagingWebSocket.connect();
    } catch (err) {
      setError('Failed to connect to messaging service');
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    messagingWebSocket.disconnect();
    setIsConnected(false);
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    messagingWebSocket.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    messagingWebSocket.leaveConversation(conversationId);
  }, []);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean = true) => {
    messagingWebSocket.sendTypingIndicator(conversationId, isTyping);
  }, []);

  const subscribeToMessages = useCallback((callback: (message: Message) => void) => {
    messagingWebSocket.on('new_message', callback);
    return () => messagingWebSocket.off('new_message', callback);
  }, []);

  const subscribeToTyping = useCallback((callback: (data: TypingData) => void) => {
    messagingWebSocket.on('typing_indicator', callback);
    return () => messagingWebSocket.off('typing_indicator', callback);
  }, []);

  const subscribeToUserStatus = useCallback((callback: (data: UserStatusData) => void) => {
    messagingWebSocket.on('user_status_changed', callback);
    return () => messagingWebSocket.off('user_status_changed', callback);
  }, []);

  // Setup connection event listeners
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleError = (errorMessage: string) => {
      setError(errorMessage);
      setIsConnected(false);
    };

    messagingWebSocket.on('connected', handleConnected);
    messagingWebSocket.on('disconnected', handleDisconnected);
    messagingWebSocket.on('error', handleError);

    // Auto-connect on mount
    connect();

    return () => {
      messagingWebSocket.off('connected', handleConnected);
      messagingWebSocket.off('disconnected', handleDisconnected);
      messagingWebSocket.off('error', handleError);
      disconnect();
    };
  }, [connect, disconnect]);

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
  };
}