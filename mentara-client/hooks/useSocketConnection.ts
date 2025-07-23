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
  lastHeartbeat: Date | null;
  isStale: boolean;
  readyState: number;
}

interface UseSocketConnectionOptions {
  subscriberId: string;
  enableRealtime?: boolean;
  autoConnect?: boolean;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  enableTabVisibilityHandling?: boolean;
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
  autoConnect = true,
  enableHeartbeat = true,
  heartbeatInterval = 30000, // 30 seconds
  heartbeatTimeout = 10000,  // 10 seconds
  enableTabVisibilityHandling = true
}: UseSocketConnectionOptions) {
  const { accessToken, user } = useAuth();
  const [connectionState, setConnectionState] = useState<SocketConnectionState>({
    isConnected: false,
    isReconnecting: false,
    error: null,
    lastConnected: null,
    connectionCount: 0,
    subscribers: new Set(),
    lastHeartbeat: null,
    isStale: false,
    readyState: 0,
  });
  
  const eventSubscriptionsRef = useRef<EventSubscription[]>([]);
  const isSubscribedRef = useRef(false);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingTimeRef = useRef<Date | null>(null);
  const isTabVisibleRef = useRef(true);

  // Heartbeat functions
  const startHeartbeat = useCallback(() => {
    if (!enableHeartbeat || !enableRealtime) return;
    
    console.log(`💓 [USE-SOCKET] Starting heartbeat for ${subscriberId}`);
    
    const pingSocket = () => {
      if (!connectionState.isConnected) return;
      
      lastPingTimeRef.current = new Date();
      
      // Set timeout to detect if pong doesn't come back
      heartbeatTimeoutRef.current = setTimeout(() => {
        console.warn(`💔 [USE-SOCKET] Heartbeat timeout for ${subscriberId} - connection may be stale`);
        setConnectionState(prev => ({ 
          ...prev, 
          isStale: true,
          error: 'Connection appears stale - no heartbeat response'
        }));
      }, heartbeatTimeout);
      
      // Emit ping
      socketManager.emit('ping', { subscriberId, timestamp: lastPingTimeRef.current });
    };
    
    // Start interval
    heartbeatIntervalRef.current = setInterval(pingSocket, heartbeatInterval);
    
    // Send first ping immediately
    pingSocket();
  }, [subscriberId, enableHeartbeat, enableRealtime, heartbeatInterval, heartbeatTimeout, connectionState.isConnected]);

  const stopHeartbeat = useCallback(() => {
    console.log(`💔 [USE-SOCKET] Stopping heartbeat for ${subscriberId}`);
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
    
    lastPingTimeRef.current = null;
  }, [subscriberId]);

  const handlePong = useCallback((data: any) => {
    if (data?.subscriberId === subscriberId) {
      console.log(`💚 [USE-SOCKET] Received pong for ${subscriberId}`);
      
      // Clear timeout
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      
      // Update state
      setConnectionState(prev => ({ 
        ...prev, 
        lastHeartbeat: new Date(),
        isStale: false,
        error: prev.error === 'Connection appears stale - no heartbeat response' ? null : prev.error
      }));
    }
  }, [subscriberId]);

  // Tab visibility handling
  const handleVisibilityChange = useCallback(() => {
    if (!enableTabVisibilityHandling) return;
    
    const isVisible = document.visibilityState === 'visible';
    isTabVisibleRef.current = isVisible;
    
    console.log(`👁️ [USE-SOCKET] Tab visibility changed for ${subscriberId}: ${isVisible ? 'visible' : 'hidden'}`);
    
    if (isVisible && connectionState.isConnected) {
      // Tab became visible - restart heartbeat to check connection health
      stopHeartbeat();
      startHeartbeat();
    } else if (!isVisible) {
      // Tab became hidden - stop heartbeat to save resources
      stopHeartbeat();
    }
  }, [subscriberId, enableTabVisibilityHandling, connectionState.isConnected, stopHeartbeat, startHeartbeat]);

  // Subscribe to connection state changes
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribe = socketManager.subscribeToConnectionState((state) => {
      setConnectionState(prev => ({
        ...prev,
        ...state,
        // Preserve heartbeat-specific fields
        lastHeartbeat: prev.lastHeartbeat,
        isStale: prev.isStale,
        readyState: state.isConnected ? 1 : 0,
      }));
    });
    return unsubscribe;
  }, [enableRealtime]);

  // Setup heartbeat when connected
  useEffect(() => {
    if (connectionState.isConnected && enableHeartbeat && isTabVisibleRef.current) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }

    return () => {
      stopHeartbeat();
    };
  }, [connectionState.isConnected, enableHeartbeat, startHeartbeat, stopHeartbeat]);

  // Subscribe to a socket event (moved up to fix TDZ issue)
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

  // Setup pong event listener
  useEffect(() => {
    if (!enableHeartbeat || !enableRealtime) return;

    const unsubscribePong = subscribeToEvent('pong', handlePong);
    return unsubscribePong;
  }, [enableHeartbeat, enableRealtime, handlePong, subscribeToEvent]);

  // Setup tab visibility handling
  useEffect(() => {
    if (!enableTabVisibilityHandling) return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableTabVisibilityHandling, handleVisibilityChange]);

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
    isConnected: connectionState.isConnected && !connectionState.isStale,
    isReconnecting: connectionState.isReconnecting,
    error: connectionState.error,
    lastConnected: connectionState.lastConnected,
    
    // Enhanced connection health
    isStale: connectionState.isStale,
    lastHeartbeat: connectionState.lastHeartbeat,
    readyState: connectionState.readyState,
    isHealthy: connectionState.isConnected && !connectionState.isStale,
    
    // Event management
    subscribeToEvent,
    emit,
    
    // Connection management
    connect,
    disconnect,
    reconnect,
    
    // Heartbeat management
    startHeartbeat,
    stopHeartbeat,
    
    // Utilities
    isSubscribed: isSubscribedRef.current,
    enableRealtime,
    enableHeartbeat,
    isTabVisible: isTabVisibleRef.current,
  };
}