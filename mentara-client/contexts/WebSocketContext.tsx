'use client';

/**
 * WebSocket Context for centralized connection management
 * Following React + Socket.IO best practices for 2024
 * Provides single source of truth for websocket state
 */

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from '@/lib/constants/auth';
import { toast } from 'sonner';

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
  retryCount: number;
}

interface WebSocketContextType {
  socket: Socket | null;
  connectionState: ConnectionState;
  isConnected: boolean;
  
  // Connection management
  connect: () => Promise<boolean>;
  disconnect: () => void;
  reconnect: () => Promise<boolean>;
  
  // Event management
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => () => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  
  // Room management
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  namespace?: string;
  autoConnect?: boolean;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:3001';

export function WebSocketProvider({ 
  children, 
  namespace = '/messaging',
  autoConnect = true 
}: WebSocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastConnected: null,
    retryCount: 0,
  });
  
  // Refs to prevent stale closures
  const socketRef = useRef<Socket | null>(null);
  const eventListeners = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateConnectionState = (updates: Partial<ConnectionState>) => {
    setConnectionState(prev => ({ ...prev, ...updates }));
  };

  const connect = async (): Promise<boolean> => {
    if (socketRef.current?.connected) {
      return true;
    }

    if (connectionState.isConnecting) {
      return false;
    }

    const accessToken = getAuthToken();
    if (!accessToken) {
      console.warn('Cannot connect WebSocket: No access token available');
      return false;
    }

    try {
      updateConnectionState({ isConnecting: true, error: null });

      console.log('🚀 Connecting to WebSocket:', SOCKET_URL + namespace);

      const newSocket = io(SOCKET_URL + namespace, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        timeout: 15000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        withCredentials: true,
        forceNew: false,
        
        // Use Socket.IO v4.6+ connection state recovery
        autoConnect: false, // We'll connect manually for better control
      });

      // Set up event handlers before connecting
      setupSocketEventHandlers(newSocket);

      // Connect manually
      newSocket.connect();

      // Wait for connection
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.error('WebSocket connection timeout');
          updateConnectionState({ 
            isConnecting: false, 
            error: 'Connection timeout' 
          });
          resolve(false);
        }, 15000);

        newSocket.once('connect', () => {
          clearTimeout(timeout);
          socketRef.current = newSocket;
          setSocket(newSocket);
          
          updateConnectionState({
            isConnected: true,
            isConnecting: false,
            error: null,
            lastConnected: new Date(),
            retryCount: 0,
          });

          console.log('✅ WebSocket connected successfully');
          
          // Re-attach existing event listeners
          reattachEventListeners(newSocket);
          
          resolve(true);
        });

        newSocket.once('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ WebSocket connection error:', error);
          updateConnectionState({ 
            isConnecting: false, 
            error: error.message || 'Connection failed' 
          });
          resolve(false);
        });
      });
    } catch (error) {
      console.error('💥 WebSocket connection error:', error);
      updateConnectionState({ 
        isConnecting: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      });
      return false;
    }
  };

  const setupSocketEventHandlers = (socket: Socket) => {
    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
      
      // Check for connection state recovery
      if ((socket as any).recovered) {
        console.log('🔄 Connection state recovered - no missed events');
        toast.success('Connection restored with full state recovery');
      } else {
        toast.success('Connected to real-time messaging');
      }
    });

    socket.on('disconnect', (reason, details) => {
      console.log('🔴 Socket disconnected:', reason, details);
      updateConnectionState({
        isConnected: false,
        error: reason === 'io client disconnect' ? null : `Disconnected: ${reason}`,
      });
      
      if (reason !== 'io client disconnect') {
        toast.error('Connection lost. Attempting to reconnect...');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      updateConnectionState({
        isConnected: false,
        error: error.message || 'Connection error',
      });
    });

    socket.on('connection_replaced', (data) => {
      console.log('🔄 Connection replaced:', data);
      toast.info('Connection replaced by new session');
    });

    // Handle auth errors specifically
    socket.on('auth_error', (data) => {
      console.error('🚫 Authentication error:', data);
      updateConnectionState({
        isConnected: false,
        error: `Auth error: ${data.message}`,
      });
      toast.error('Authentication failed. Please refresh the page.');
    });
  };

  const reattachEventListeners = (socket: Socket) => {
    eventListeners.current.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        socket.on(event, callback);
      });
    });
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      console.log('🔌 Disconnecting WebSocket');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    updateConnectionState({
      isConnected: false,
      isConnecting: false,
      error: null,
      retryCount: 0,
    });
  };

  const reconnect = async (): Promise<boolean> => {
    console.log('🔄 Manual reconnection initiated');
    disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
    return connect();
  };

  const emit = (event: string, data?: any) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Cannot emit event - WebSocket not connected:', event, data);
      return;
    }
    
    console.log('📤 Emitting event:', event, data);
    socketRef.current.emit(event, data);
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    // Store the callback for reattachment after reconnections
    if (!eventListeners.current.has(event)) {
      eventListeners.current.set(event, new Set());
    }
    eventListeners.current.get(event)!.add(callback);

    // Attach to current socket if available
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }

    // Return unsubscribe function
    return () => {
      eventListeners.current.get(event)?.delete(callback);
      if (eventListeners.current.get(event)?.size === 0) {
        eventListeners.current.delete(event);
      }
      
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  };

  const off = (event: string, callback: (...args: any[]) => void) => {
    eventListeners.current.get(event)?.delete(callback);
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const joinRoom = (room: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Cannot join room - WebSocket not connected:', room);
      return;
    }
    
    console.log('🚪 Joining room:', room);
    socketRef.current.emit('join_room', { room });
  };

  const leaveRoom = (room: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Cannot leave room - WebSocket not connected:', room);
      return;
    }
    
    console.log('🚪 Leaving room:', room);
    socketRef.current.emit('leave_room', { room });
  };

  // Auto-connect when auth is available
  useEffect(() => {
    if (autoConnect && isAuthenticated && user && !socketRef.current) {
      console.log('🔐 Auth available, auto-connecting WebSocket');
      connect();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user, autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const contextValue: WebSocketContextType = {
    socket,
    connectionState,
    isConnected: connectionState.isConnected,
    
    connect,
    disconnect,
    reconnect,
    
    emit,
    on,
    off,
    
    joinRoom,
    leaveRoom,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Convenience hook specifically for messaging namespace
export const useMessagingWebSocket = () => useWebSocket();