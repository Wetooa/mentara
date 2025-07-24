"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from '@/lib/constants/auth';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  onEvent, 
  onStateChange, 
  getConnectionState,
  type ConnectionState 
} from '@/lib/websocket';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: string;
  isRead: boolean;
}

interface UnreadCountData {
  count: number;
}

interface NotificationCallbacks {
  onNewNotification?: (notification: NotificationData) => void;
  onUnreadCountUpdate?: (data: UnreadCountData) => void;
  onError?: (error: string) => void;
}

/**
 * WebSocket hook for real-time notifications
 * Integrates with the existing messaging WebSocket infrastructure
 */
export function useNotificationsWebSocket(callbacks: NotificationCallbacks = {}) {
  const { isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>(getConnectionState());
  const [error, setError] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<NotificationData | null>(null);

  const connect = useCallback(async () => {
    const token = getAuthToken();
    if (connectionState.isConnected || !token) return;

    try {
      setError(null);
      await connectWebSocket(token);
    } catch (err) {
      const errorMessage = 'Failed to connect to notification service';
      setError(errorMessage);
      callbacks.onError?.(errorMessage);
    }
  }, [connectionState.isConnected, callbacks]);

  const disconnect = useCallback(() => {
    disconnectWebSocket();
  }, []);

  // Handle incoming notifications
  const handleNotification = useCallback((notification: NotificationData) => {
    console.log('🔔 [NOTIFICATIONS] Received real-time notification:', notification);
    
    setLastNotification(notification);
    callbacks.onNewNotification?.(notification);
  }, [callbacks]);

  // Handle unread count updates
  const handleUnreadCountUpdate = useCallback((data: UnreadCountData) => {
    console.log('🔢 [NOTIFICATIONS] Unread count updated:', data.count);
    
    callbacks.onUnreadCountUpdate?.(data);
  }, [callbacks]);

  // Handle WebSocket errors
  const handleWebSocketError = useCallback((error: any) => {
    console.error('❌ [NOTIFICATIONS] WebSocket error:', error);
    
    const errorMessage = error?.message || 'WebSocket connection error';
    setError(errorMessage);
    callbacks.onError?.(errorMessage);
  }, [callbacks]);

  // Subscribe to notification events
  useEffect(() => {
    if (!connectionState.isConnected) return;

    console.log('🔔 [NOTIFICATIONS] Setting up real-time notification listeners');

    // Subscribe to notification events
    const unsubscribeNotification = onEvent('notification', handleNotification);
    const unsubscribeUnreadCount = onEvent('unreadCount', handleUnreadCountUpdate);
    const unsubscribeError = onEvent('notification_error', handleWebSocketError);

    return () => {
      console.log('🔕 [NOTIFICATIONS] Cleaning up notification listeners');
      unsubscribeNotification();
      unsubscribeUnreadCount();
      unsubscribeError();
    };
  }, [connectionState.isConnected, handleNotification, handleUnreadCountUpdate, handleWebSocketError]);

  // Monitor connection state changes
  useEffect(() => {
    const unsubscribe = onStateChange((state) => {
      setConnectionState(state);
      
      if (state.error) {
        setError(state.error);
        callbacks.onError?.(state.error);
      }
    });
    
    return unsubscribe;
  }, [callbacks]);

  // Auto-connect when authenticated and not connected
  useEffect(() => {
    if (isAuthenticated && !connectionState.isConnected && !connectionState.isConnecting) {
      console.log('🔔 [NOTIFICATIONS] Auto-connecting for notifications');
      connect();
    }
  }, [isAuthenticated, connectionState.isConnected, connectionState.isConnecting, connect]);

  // Reset error state when connection is established
  useEffect(() => {
    if (connectionState.isConnected && error) {
      setError(null);
    }
  }, [connectionState.isConnected, error]);

  return {
    // Connection state
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    error: error || connectionState.error,
    connectionState,
    
    // Connection controls
    connect,
    disconnect,
    
    // Last received notification (for debugging/testing)
    lastNotification,
    
    // Utilities
    canReceiveNotifications: isAuthenticated && connectionState.isConnected,
  };
}

/**
 * Simplified hook for components that just need to know if notifications are connected
 */
export function useNotificationsConnection() {
  const { isConnected, isConnecting, error } = useNotificationsWebSocket();
  
  return {
    isConnected,
    isConnecting,
    hasError: !!error,
    error,
  };
}