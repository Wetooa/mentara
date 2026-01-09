"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
  // #region agent log
  const initialState = getConnectionState();
  fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:42',message:'useNotificationsWebSocket initialized',data:{isAuthenticated,initialState:{isConnected:initialState.isConnected,isConnecting:initialState.isConnecting,error:initialState.error}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  const [connectionState, setConnectionState] = useState<ConnectionState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<NotificationData | null>(null);
  const connectAttemptRef = useRef<boolean>(false); // Prevent multiple connection attempts
  
  // Handle incoming notifications with useRef to avoid recreating handlers
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const connect = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:52',message:'connect() called',data:{isConnected:connectionState.isConnected,hasToken:!!getAuthToken(),connectAttemptInProgress:connectAttemptRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const token = getAuthToken();
    if (connectionState.isConnected || !token || connectAttemptRef.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:55',message:'connect() early return',data:{reason:connectionState.isConnected?'alreadyConnected':!token?'noToken':'attemptInProgress'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    try {
      connectAttemptRef.current = true;
      setError(null);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:61',message:'Calling connectWebSocket()',data:{hasToken:!!token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      await connectWebSocket(token);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:64',message:'connectWebSocket() resolved',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:67',message:'connectWebSocket() failed',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const errorMessage = 'Failed to connect to notification service';
      setError(errorMessage);
      callbacksRef.current.onError?.(errorMessage);
    } finally {
      connectAttemptRef.current = false;
    }
  }, [connectionState.isConnected]); // Removed callbacks from dependency array

  const disconnect = useCallback(() => {
    disconnectWebSocket();
  }, []);

  const handleNotification = useCallback((notification: NotificationData) => {
    console.log('🔔 [NOTIFICATIONS] Received real-time notification:', notification);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:94',message:'handleNotification called',data:{notificationId:notification.id,notificationTitle:notification.title,hasCallback:!!callbacksRef.current.onNewNotification},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    setLastNotification(notification);
    callbacksRef.current.onNewNotification?.(notification);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:99',message:'handleNotification callback executed',data:{notificationId:notification.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
  }, []); // No dependencies - callbacks accessed via ref

  // Handle unread count updates
  const handleUnreadCountUpdate = useCallback((data: UnreadCountData) => {
    console.log('🔢 [NOTIFICATIONS] Unread count updated:', data.count);
    
    callbacksRef.current.onUnreadCountUpdate?.(data);
  }, []); // No dependencies - callbacks accessed via ref

  // Handle WebSocket errors
  const handleWebSocketError = useCallback((error: any) => {
    console.error('❌ [NOTIFICATIONS] WebSocket error:', error);
    
    const errorMessage = error?.message || 'WebSocket connection error';
    setError(errorMessage);
    callbacksRef.current.onError?.(errorMessage);
  }, []); // No dependencies - callbacks accessed via ref

  // Subscribe to notification events - register listeners immediately
  // The websocket library will attach them when connection is established
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:117',message:'Event subscription effect running',data:{isConnected:connectionState.isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // Always set up listeners - the websocket library handles attaching them when connection is ready
    // This ensures listeners are registered before connection completes
    console.log('🔔 [NOTIFICATIONS] Setting up real-time notification listeners');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:123',message:'Setting up event listeners (will attach on connect)',data:{isConnected:connectionState.isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Subscribe to notification events
    // These will be automatically attached when the socket connects (see websocket.ts setupEventHandlers)
    const unsubscribeNotification = onEvent('notification', handleNotification);
    const unsubscribeUnreadCount = onEvent('unreadCount', handleUnreadCountUpdate);
    const unsubscribeError = onEvent('notification_error', handleWebSocketError);

    return () => {
      console.log('🔕 [NOTIFICATIONS] Cleaning up notification listeners');
      unsubscribeNotification();
      unsubscribeUnreadCount();
      unsubscribeError();
    };
  }, [handleNotification, handleUnreadCountUpdate, handleWebSocketError]);

  // Monitor connection state changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:116',message:'Setting up state change listener',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const unsubscribe = onStateChange((state) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:119',message:'Connection state changed',data:{isConnected:state.isConnected,isConnecting:state.isConnecting,error:state.error,lastConnected:state.lastConnected?.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setConnectionState(state);
      
      if (state.error) {
        setError(state.error);
        callbacksRef.current.onError?.(state.error);
      }
    });
    
    return unsubscribe;
  }, []); // No dependencies - callbacks accessed via ref

  // Auto-connect when authenticated and not connected
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:167',message:'Auto-connect effect running',data:{isAuthenticated,isConnected:connectionState.isConnected,isConnecting:connectionState.isConnecting,connectAttemptInProgress:connectAttemptRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (isAuthenticated && !connectionState.isConnected && !connectionState.isConnecting && !connectAttemptRef.current) {
      console.log('🔔 [NOTIFICATIONS] Auto-connecting for notifications');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotificationsWebSocket.ts:171',message:'Auto-connect conditions met - calling connect immediately',data:{isAuthenticated,isConnected:connectionState.isConnected,isConnecting:connectionState.isConnecting},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Connect immediately - no delay needed as we check for existing attempts
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