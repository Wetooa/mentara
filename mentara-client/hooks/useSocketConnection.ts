import { useEffect, useCallback, useState, useRef } from 'react';
import { socketManager } from '@/lib/socket-manager';
import { useAuth } from '@/contexts/AuthContext';

interface SocketConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
  connectionCount: number;
  subscribers: Set<string>;
}

interface UseSocketConnectionOptions {
  subscriberId: string;
  enableRealtime?: boolean;
  autoConnect?: boolean;
}

interface EventSubscription {
  event: string;
  callback: (...args: any[]) => void;
}

/**
 * Hook for managing centralized socket connections
 * Multiple components can use this hook safely without connection conflicts
 */
export function useSocketConnection({ 
  subscriberId, 
  enableRealtime = true,
  autoConnect = true 
}: UseSocketConnectionOptions) {
  const { accessToken, user } = useAuth();
  const [connectionState, setConnectionState] = useState<SocketConnectionState>({
    isConnected: false,
    isReconnecting: false,
    error: null,
    lastConnected: null,
    connectionCount: 0,
    subscribers: new Set(),
  });
  
  const eventSubscriptionsRef = useRef<EventSubscription[]>([]);
  const isSubscribedRef = useRef(false);

  // Subscribe to connection state changes
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribe = socketManager.subscribeToConnectionState(setConnectionState);
    return unsubscribe;
  }, [enableRealtime]);

  // Subscribe to socket manager
  useEffect(() => {
    if (!enableRealtime || !accessToken || !user || !autoConnect) return;

    const subscribe = async () => {
      try {
        console.log(`🔌 [USE-SOCKET] Subscribing ${subscriberId} to socket manager`);
        await socketManager.subscribe(subscriberId, accessToken);
        isSubscribedRef.current = true;
      } catch (error) {
        console.error(`❌ [USE-SOCKET] Failed to subscribe ${subscriberId}:`, error);
      }
    };

    subscribe();

    // Cleanup on unmount or dependency change
    return () => {
      if (isSubscribedRef.current) {
        console.log(`🔌 [USE-SOCKET] Unsubscribing ${subscriberId} from socket manager`);
        socketManager.unsubscribe(subscriberId);
        isSubscribedRef.current = false;
      }
    };
  }, [subscriberId, enableRealtime, accessToken, user, autoConnect]);

  // Cleanup event subscriptions on unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining event subscriptions
      eventSubscriptionsRef.current = [];
    };
  }, []);

  // Subscribe to a socket event
  const subscribeToEvent = useCallback((
    event: string, 
    callback: (...args: any[]) => void
  ): (() => void) => {
    if (!enableRealtime) {
      console.warn(`⚠️ [USE-SOCKET] Cannot subscribe to ${event} - realtime disabled`);
      return () => {};
    }

    console.log(`📡 [USE-SOCKET] ${subscriberId} subscribing to event: ${event}`);
    
    const subscription = { event, callback };
    eventSubscriptionsRef.current.push(subscription);

    const unsubscribe = socketManager.subscribeToEvent(subscriberId, event, callback);

    return () => {
      // Remove from local tracking
      const index = eventSubscriptionsRef.current.findIndex(
        sub => sub.event === event && sub.callback === callback
      );
      if (index !== -1) {
        eventSubscriptionsRef.current.splice(index, 1);
      }
      
      // Unsubscribe from socket manager
      unsubscribe();
    };
  }, [subscriberId, enableRealtime]);

  // Emit event to socket
  const emit = useCallback((event: string, data: any) => {
    if (!enableRealtime) {
      console.warn(`⚠️ [USE-SOCKET] Cannot emit ${event} - realtime disabled`);
      return;
    }

    console.log(`📤 [USE-SOCKET] ${subscriberId} emitting event: ${event}`, data);
    socketManager.emit(event, data);
  }, [subscriberId, enableRealtime]);

  // Manual reconnection
  const reconnect = useCallback(async () => {
    if (!enableRealtime) {
      console.warn(`⚠️ [USE-SOCKET] Cannot reconnect - realtime disabled`);
      return;
    }

    console.log(`🔄 [USE-SOCKET] ${subscriberId} requesting reconnection`);
    await socketManager.reconnect();
  }, [subscriberId, enableRealtime]);

  // Manual connection
  const connect = useCallback(async () => {
    if (!enableRealtime || !accessToken || !user) {
      console.warn(`⚠️ [USE-SOCKET] Cannot connect - missing requirements`);
      return;
    }

    if (!isSubscribedRef.current) {
      console.log(`🔌 [USE-SOCKET] ${subscriberId} manually connecting`);
      await socketManager.subscribe(subscriberId, accessToken);
      isSubscribedRef.current = true;
    }
  }, [subscriberId, enableRealtime, accessToken, user]);

  // Manual disconnection
  const disconnect = useCallback(() => {
    if (isSubscribedRef.current) {
      console.log(`🔌 [USE-SOCKET] ${subscriberId} manually disconnecting`);
      socketManager.unsubscribe(subscriberId);
      isSubscribedRef.current = false;
    }
  }, [subscriberId]);

  return {
    // Connection state
    connectionState,
    isConnected: connectionState.isConnected,
    isReconnecting: connectionState.isReconnecting,
    error: connectionState.error,
    lastConnected: connectionState.lastConnected,
    
    // Event management
    subscribeToEvent,
    emit,
    
    // Connection management
    connect,
    disconnect,
    reconnect,
    
    // Utilities
    isSubscribed: isSubscribedRef.current,
    enableRealtime,
  };
}