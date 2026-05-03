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
    // #region agent log
    // #endregion
    console.log('🚪 [WEBSOCKET DEBUG] Joining conversation room:', conversationId);
    console.log('🚪 [WEBSOCKET DEBUG] Connection state:', connectionState);
    emitEvent('join_conversation', { conversationId });
    
    // Listen for join confirmation
    const unsubscribe = onEvent('conversation_joined', (data) => {
      // #region agent log
      // #endregion
      console.log('✅ [WEBSOCKET DEBUG] Successfully joined conversation room:', data);
      unsubscribe();
    });
  }, [connectionState]);

  const leaveConversation = useCallback((conversationId: string) => {
    emitEvent('leave_conversation', { conversationId });
  }, []);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping = true) => {
    emitEvent('typing_indicator', { conversationId, isTyping });
  }, []);

  const subscribeToMessages = useCallback((callback: (message: Message) => void) => {
    // #region agent log
    // #endregion
    return onEvent('new_message', (data: { message: Message }) => {
      // #region agent log
      const dataKeys = data ? Object.keys(data) : [];
      const hasMessage = !!data?.message;
      const messageId = data?.message?.id;
      const conversationId = data?.message?.conversationId;
      const rawDataString = JSON.stringify(data)?.substring(0, 300);
      // #endregion
      console.log('🔍 [WEBSOCKET DEBUG] Raw new_message event received:', data);
      console.log('🔍 [WEBSOCKET DEBUG] Message data:', data.message);
      console.log('🔍 [WEBSOCKET DEBUG] Data structure:', { hasMessage: !!data?.message, keys: Object.keys(data || {}) });
      
      if (!data?.message) {
        // #region agent log
        // #endregion
        console.error('❌ [WEBSOCKET DEBUG] new_message event missing message property!', data);
        return;
      }
      
      // #region agent log
      // #endregion
      callback(data.message);
      // #region agent log
      // #endregion
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
    console.log('🔐 [WEBSOCKET DEBUG] Auth state changed:', { 
      isAuthenticated, 
      isConnected: connectionState.isConnected,
      isConnecting: connectionState.isConnecting 
    });
    
    if (isAuthenticated && !connectionState.isConnected && !connectionState.isConnecting) {
      console.log('🚀 [WEBSOCKET DEBUG] Attempting to connect...');
      connect();
    }
  }, [isAuthenticated, connectionState.isConnected, connectionState.isConnecting, connect]);

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