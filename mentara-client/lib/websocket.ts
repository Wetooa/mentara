/**
 * Simple WebSocket client for messaging functionality
 * Replaces the complex socket-manager and useSocketConnection system
 * with a straightforward Socket.io wrapper
 */

import { io, Socket } from 'socket.io-client';

interface WebSocketConfig {
  url?: string;
  namespace?: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
}

interface EventListener {
  event: string;
  callback: (...args: any[]) => void;
}

class SimpleWebSocket {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private eventListeners: EventListener[] = [];
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    lastConnected: null,
  };
  private stateChangeCallbacks: ((state: ConnectionState) => void)[] = [];

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      url: config.url || (process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:3001'),
      namespace: config.namespace || '/messaging',
      autoConnect: config.autoConnect ?? false,
      reconnectionAttempts: config.reconnectionAttempts ?? 3,
      reconnectionDelay: config.reconnectionDelay ?? 2000,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server with authentication token
   */
  async connect(token: string): Promise<void> {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    if (this.connectionState.isConnecting) {
      console.log('🔌 WebSocket connection already in progress');
      return;
    }

    try {
      this.updateConnectionState({
        isConnecting: true,
        error: null,
      });

      console.log('🔌 Connecting to WebSocket:', this.config.url + this.config.namespace);

      this.socket = io(this.config.url + this.config.namespace, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
      });

      this.setupEventHandlers();

      // Wait for connection
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.once('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.updateConnectionState({
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.updateConnectionState({
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot emit event - WebSocket not connected:', event);
      return;
    }

    console.log('📤 Emitting event:', event, data);
    this.socket.emit(event, data);
  }

  /**
   * Subscribe to WebSocket event
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    const listener = { event, callback };
    this.eventListeners.push(listener);

    if (this.socket) {
      this.socket.on(event, callback);
    }

    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.findIndex(l => l === listener);
      if (index !== -1) {
        this.eventListeners.splice(index, 1);
      }
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(callback: (state: ConnectionState) => void): () => void {
    this.stateChangeCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index !== -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket!.id);
      this.updateConnectionState({
        isConnected: true,
        isConnecting: false,
        error: null,
        lastConnected: new Date(),
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.updateConnectionState({
        isConnected: false,
        isConnecting: false,
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.updateConnectionState({
        isConnected: false,
        isConnecting: false,
        error: error.message || 'Connection error',
      });
    });

    this.socket.on('auth_error', (data) => {
      console.error('🔐 WebSocket auth error:', data);
      this.updateConnectionState({
        isConnected: false,
        isConnecting: false,
        error: `Auth error: ${data.message || 'Authentication failed'}`,
      });
    });

    // Re-attach existing event listeners
    this.eventListeners.forEach(listener => {
      this.socket!.on(listener.event, listener.callback);
    });
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(this.connectionState);
      } catch (error) {
        console.error('Error in state change callback:', error);
      }
    });
  }
}

// Create singleton instance
export const messagingSocket = new SimpleWebSocket({
  namespace: '/messaging',
});

// Convenience functions for common operations
export const connectWebSocket = (token: string) => messagingSocket.connect(token);
export const disconnectWebSocket = () => messagingSocket.disconnect();
export const emitEvent = (event: string, data?: any) => messagingSocket.emit(event, data);
export const onEvent = (event: string, callback: (...args: any[]) => void) => messagingSocket.on(event, callback);
export const onStateChange = (callback: (state: ConnectionState) => void) => messagingSocket.onStateChange(callback);
export const getConnectionState = () => messagingSocket.getState();
export const isWebSocketConnected = () => messagingSocket.isConnected();

export type { ConnectionState, WebSocketConfig };