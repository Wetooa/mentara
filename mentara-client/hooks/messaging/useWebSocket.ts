"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { messagingWebSocket } from '@/lib/messaging-websocket';
import type { Message, TypingData, UserStatusData } from '@/types/api/messaging';

export function useWebSocket() {
  const { accessToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<WebSocket | null>(null);

  const connect = useCallback(async () => {
    if (!accessToken || connectionRef.current?.readyState === WebSocket.OPEN) return;

    try {
      setError(null);
      if (!accessToken) throw new Error('No authentication token available');

      const ws = messagingWebSocket.connect(accessToken);
      connectionRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        setIsConnected(false);
        connectionRef.current = null;
      };

      ws.onerror = () => {
        setError('Connection error');
        setIsConnected(false);
      };

    } catch (err) {
      setError('Failed to connect');
      setIsConnected(false);
    }
  }, [accessToken]);

  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (connectionRef.current?.readyState === WebSocket.OPEN) {
      messagingWebSocket.sendTyping(isTyping);
    }
  }, []);

  const subscribeToMessages = useCallback((callback: (message: Message) => void) => {
    return messagingWebSocket.onMessage(callback);
  }, []);

  const subscribeToTyping = useCallback((callback: (data: TypingData) => void) => {
    return messagingWebSocket.onTyping(callback);
  }, []);

  const subscribeToUserStatus = useCallback((callback: (data: UserStatusData) => void) => {
    return messagingWebSocket.onUserStatus(callback);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendTyping,
    subscribeToMessages,
    subscribeToTyping,
    subscribeToUserStatus,
  };
}