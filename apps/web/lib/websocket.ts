/**
 * Enhanced WebSocket client supporting multiple namespaces
 * Replaces the complex socket implementation with a clean, efficient solution
 * Maintains compatibility with existing API while fixing connection issues
 */

import { io, Socket } from 'socket.io-client';
import { TOKEN_STORAGE_KEY } from '@/lib/constants/auth';

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
  transportError: boolean;
  retryCount: number;
}

interface EventListener {
  event: string;
  callback: (...args: any[]) => void;
  wrapper?: (...args: any[]) => void; // Store the wrapper function for proper cleanup
}

// Socket URL configuration
const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiUrl.replace(/\/api$/, '');
  }
  
  return process.env.NODE_ENV === 'production' 
    ? 'https://api.mentara.com' 
    : 'http://localhost:10000';
};

const SOCKET_URL = getSocketUrl();

class SimpleWebSocket {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private eventListeners: EventListener[] = [];
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    lastConnected: null,
    transportError: false,
    retryCount: 0,
  };
  private stateChangeCallbacks: ((state: ConnectionState) => void)[] = [];

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      url: config.url || SOCKET_URL,
      namespace: config.namespace || '/messaging',
      autoConnect: config.autoConnect ?? false,
      reconnectionAttempts: config.reconnectionAttempts ?? 5,
      reconnectionDelay: config.reconnectionDelay ?? 1000,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server with authentication token
   */
  async connect(token?: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    if (this.connectionState.isConnecting) {
      return;
    }

    try {
      this.updateConnectionState({
        isConnecting: true,
        error: null,
      });

      // Connect to base URL with namespace path - Socket.IO handles namespace routing internally
      const namespacePath = this.config.namespace;

      this.socket = io(this.config.url + namespacePath, {
        auth: token ? { token } : {},
        transports: ['websocket', 'polling'],
        timeout: 15000,
        reconnection: true,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        reconnectionDelayMax: 10000,
        randomizationFactor: 0.3,
        withCredentials: true,
        forceNew: false,
        upgrade: true,
        rememberUpgrade: true,
        // Enable modern Socket.IO v4+ features
        tryAllTransports: true,
      });

      this.setupEventHandlers();

      // Wait for connection
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 15000);

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
      transportError: false,
      retryCount: 0,
    });
  }

  /**
   * Manual recovery from connection issues
   */
  async recover(): Promise<boolean> {
    console.log('🔄 Manual connection recovery initiated');
    
    try {
      // Reset connection state
      this.updateConnectionState({
        transportError: false,
        retryCount: 0,
        error: null,
      });

      // Disconnect if connected
      if (this.socket?.connected) {
        this.disconnect();
      }

      // Wait a moment before reconnecting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attempt to reconnect with token
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      await this.connect(token || undefined);
      
      console.log('✅ Manual recovery successful');
      return true;
    } catch (error) {
      console.error('❌ Manual recovery failed:', error);
      this.updateConnectionState({
        error: `Manual recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      return false;
    }
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any): void {
    // #region agent log
    // #endregion
    if (!this.socket?.connected) {
      console.warn('⚠️ [WEBSOCKET DEBUG] Cannot emit event - WebSocket not connected:', event, data);
      console.warn('⚠️ [WEBSOCKET DEBUG] Socket state:', this.socket ? 'exists but not connected' : 'null');
      return;
    }

    console.log('📤 [WEBSOCKET DEBUG] Emitting event:', event, data);
    this.socket.emit(event, data);
    // #region agent log
    // #endregion
  }

  /**
   * Subscribe to WebSocket event
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    // #region agent log
    const existingListenersForEvent = this.eventListeners.filter(l => l.event === event).length;
    // #endregion
      // Create wrapper function that we can properly remove later
      const wrapper = (...args: any[]) => {
        // #region agent log
        const listenersForThisEvent = this.eventListeners.filter(l => l.event === event).length;
        const messageId = event === 'new_message' ? (args[0]?.message?.id || args[0]?.id) : undefined;
        const conversationId = event === 'new_message' ? (args[0]?.message?.conversationId || args[0]?.conversationId) : undefined;
        const hasMessageProperty = event === 'new_message' ? !!args[0]?.message : undefined;
        const arg0Keys = args[0] ? Object.keys(args[0]) : [];
        // #endregion
        console.log('📨 [WEBSOCKET DEBUG] Event received:', event, args);
        if (event === 'new_message') {
          console.log('📨 [WEBSOCKET DEBUG] new_message event payload structure:', {
            hasMessage: !!args[0]?.message,
            hasDirectProperties: !!args[0]?.id,
            keys: Object.keys(args[0] || {}),
            payload: args[0]
          });
        }
        callback(...args);
        // #region agent log
        // #endregion
      };
    
    const listener: EventListener = { event, callback, wrapper };
    this.eventListeners.push(listener);

    // Add debugging for event subscriptions
    console.log('📡 [WEBSOCKET DEBUG] Subscribing to event:', event);

    if (this.socket?.connected) {
      // #region agent log
      // #endregion
      this.socket.on(event, wrapper);
    } else {
      // #region agent log
      // #endregion
    }

    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.findIndex(l => l === listener);
      if (index !== -1) {
        this.eventListeners.splice(index, 1);
      }
      if (this.socket && listener.wrapper) {
        // Remove using the wrapper function, not the original callback
        this.socket.off(event, listener.wrapper);
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
   * Use connection state as source of truth, not just socket.connected
   */
  isConnected(): boolean {
    // Check both the state and the actual socket connection
    // State is more reliable as it's updated in the connect handler
    return this.connectionState.isConnected || this.socket?.connected || false;
  }

  /**
   * Get the underlying socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Handle TransportError with exponential backoff retry
   */
  private async handleTransportError(error: any): Promise<void> {
    console.warn('🚨 TransportError detected:', error);
    
    this.updateConnectionState({
      transportError: true,
      error: `Transport error: ${(error as any).description?.type || (error as any).type || error.message || 'Connection failed'}`,
      retryCount: this.connectionState.retryCount + 1,
    });

    // Implement exponential backoff retry for transport errors
    const maxRetries = 5;
    const currentRetryCount = this.connectionState.retryCount;
    
    if (currentRetryCount < maxRetries) {
      const baseDelay = Math.min(1000 * Math.pow(2, currentRetryCount), 10000);
      const jitter = baseDelay * 0.3 * Math.random();
      const delay = baseDelay + jitter;
      
      console.log(`⏳ Retrying connection in ${Math.round(delay)}ms (attempt ${currentRetryCount}/${maxRetries})`);
      
      setTimeout(async () => {
        try {
          // Disconnect and reconnect to recover from transport error
          if (this.socket) {
            this.socket.disconnect();
          }
          
          // Attempt to reconnect with current token (if available)
          const token = localStorage.getItem(TOKEN_STORAGE_KEY);
          await this.connect(token || undefined);
          
          console.log('✅ Successfully recovered from TransportError');
          
          // Reset error state on successful recovery
          this.updateConnectionState({
            transportError: false,
            error: null,
            retryCount: 0,
          });
        } catch (retryError) {
          console.error('❌ Failed to recover from TransportError:', retryError);
          
          if (currentRetryCount >= maxRetries) {
            this.updateConnectionState({
              error: `Max retry attempts reached. Transport error recovery failed.`,
            });
          }
        }
      }, delay);
    } else {
      console.error('❌ Max retry attempts reached for TransportError recovery');
      this.updateConnectionState({
        error: `Max retry attempts reached. Please refresh the page or check your connection.`,
      });
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      // #region agent log
      const newMessageListeners = this.eventListeners.filter(l => l.event === 'new_message').length;
      // #endregion
      console.log('✅ [WEBSOCKET DEBUG] Connected successfully to:', this.config.url + this.config.namespace);
      console.log('✅ [WEBSOCKET DEBUG] Socket ID:', this.socket?.id);
      
      // Check for connection state recovery
      const recovered = (this.socket as any).recovered;
      if (recovered) {
        console.log('🔄 [WEBSOCKET DEBUG] Connection state recovered - no missed events');
      }
      
      // #region agent log
      // #endregion
      // Re-attach existing event listeners when socket connects
      // Attach listeners that have wrappers but weren't attached yet (registered before connection)
      this.eventListeners.forEach(listener => {
        if (this.socket && listener.wrapper) {
          // Check if listener is already attached by checking socket listeners
          // Socket.IO doesn't provide a direct way to check, so we'll just attach
          // Multiple attachments are safe - Socket.IO will call all listeners
          // #region agent log
          const existingListenersForEvent = this.eventListeners.filter(l => l.event === listener.event).length;
          // #endregion
          this.socket.on(listener.event, listener.wrapper);
          // #region agent log
          if (listener.event === 'new_message') {
            void existingListenersForEvent;
          }
          // #endregion
        }
      });
      
      this.updateConnectionState({
        isConnected: true,
        isConnecting: false,
        error: null,
        lastConnected: new Date(),
        transportError: false,
        retryCount: 0,
      });
      
      // #region agent log
      // Check if this is a reconnection (had listeners before)
      const hadListenersBeforeConnect = this.eventListeners.length > 0;
      // #endregion
    });

    this.socket.on('disconnect', (reason, details) => {
      console.log('🔌 WebSocket disconnected:', reason, details);
      this.updateConnectionState({
        isConnected: false,
        isConnecting: false,
      });

      // Handle specific disconnect reasons that might require reconnection
      if (reason === 'transport close' || reason === 'transport error') {
        this.handleTransportError({ type: 'disconnect', reason, details });
      }
    });

    // Modern Socket.IO v4+ error handling - use 'connect_error' instead of 'error'
    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      
      // Check if this is a transport-related error
      if ((error as any).description?.type === 'TransportError' || (error as any).type === 'TransportError') {
        this.handleTransportError(error);
      } else {
        this.updateConnectionState({
          isConnected: false,
          isConnecting: false,
          error: error.message || 'Connection error',
        });
      }
    });

    this.socket.on('auth_error', (data) => {
      console.error('🚫 WebSocket authentication error:', data);
      this.updateConnectionState({
        isConnected: false,
        isConnecting: false,
        error: `Auth error: ${data.message || 'Authentication failed'}`,
      });
    });

    // Add specific TransportError event handler
    this.socket.on('error', (error) => {
      console.error('🚨 WebSocket error event:', error);
      
      // Check if this is a TransportError
      if ((error as any).description?.type === 'TransportError' || (error as any).type === 'TransportError' || 
          (error as any).description?.isTrusted === true) {
        this.handleTransportError(error);
      } else {
        this.updateConnectionState({
          error: `Socket error: ${error.message || (error as any).type || 'Unknown error'}`,
        });
      }
    });

    // Handle connection limit exceeded from backend
    this.socket.on('connection_limit_exceeded', (data) => {
      console.warn('⚠️ Connection limit exceeded:', data);
      this.updateConnectionState({
        error: `Connection limit exceeded: ${data.message}`,
      });
    });

    // Handle subscription errors from backend
    this.socket.on('subscription_error', (data) => {
      console.error('📨 Subscription error:', data);
      this.updateConnectionState({
        error: `Subscription error: ${data.error}`,
      });
    });

    // Handle connection_replaced event (when backend disconnects old socket)
    this.socket.on('connection_replaced', (data) => {
      console.log('🔄 Connection replaced by new session:', data);
      // The old socket is being disconnected, so we should handle reconnection
      // The new connection should already be established, so we just log this
      this.updateConnectionState({
        error: 'Connection replaced by new session. Reconnecting...',
      });
    });

    // Re-attach existing event listeners (this is now done in connect handler)
    // Removed duplicate code - listeners are re-attached in connect handler
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

// Multi-namespace socket management
const sockets: Record<string, SimpleWebSocket> = {};

// Create or get socket instance for namespace
const getSocketInstance = (namespace?: string): SimpleWebSocket => {
  const ns = namespace || '/messaging';
  
  if (!sockets[ns]) {
    sockets[ns] = new SimpleWebSocket({ namespace: ns });
  }
  
  return sockets[ns];
};

// Main socket (default namespace)
let mainSocket: SimpleWebSocket | null = null;

const getMainSocket = (): SimpleWebSocket => {
  if (!mainSocket) {
    mainSocket = new SimpleWebSocket({ namespace: '' }); // Default namespace
  }
  return mainSocket;
};

// Public API - maintain compatibility with lib/socket.ts interface

/**
 * Get socket instance (with optional namespace and token)
 */
export const getSocket = (namespace?: string, token?: string): Socket => {
  const socketInstance = namespace ? getSocketInstance(namespace) : getMainSocket();
  
  // Auto-connect if token provided and not connected
  if (token && !socketInstance.isConnected()) {
    socketInstance.connect(token).catch(console.error);
  }
  
  return socketInstance.getSocket() as Socket;
};

/**
 * Get namespaced socket instance
 */
export const getNamespacedSocket = (namespace: string, token?: string): Socket => {
  return getSocket(namespace, token);
};

/**
 * Create socket (alias for getNamespacedSocket)
 */
export const createSocket = getNamespacedSocket;

/**
 * Connect socket and return promise
 */
export const connectSocket = (namespace?: string, token?: string): Promise<Socket> => {
  // #region agent log
  // #endregion
  const socketInstance = namespace ? getSocketInstance(namespace) : getMainSocket();
  
  return socketInstance.connect(token).then(() => {
    // #region agent log
    const state = socketInstance.getState();
    // #endregion
    return socketInstance.getSocket() as Socket;
  });
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (namespace?: string): boolean => {
  const socketInstance = namespace ? 
    (sockets[namespace] || null) : 
    mainSocket;
  
  return socketInstance?.isConnected() ?? false;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (namespace?: string): void => {
  if (namespace) {
    if (sockets[namespace]) {
      sockets[namespace].disconnect();
      delete sockets[namespace];
    }
  } else {
    // Disconnect all sockets
    Object.values(sockets).forEach(socket => socket.disconnect());
    Object.keys(sockets).forEach(key => delete sockets[key]);
    
    if (mainSocket) {
      mainSocket.disconnect();
      mainSocket = null;
    }
  }
};

// Specific namespace helpers
export const getMessagingSocket = (token?: string) => getNamespacedSocket('/messaging', token);
export const getMeetingsSocket = (token?: string) => getNamespacedSocket('/meetings', token);

export const connectMessagingSocket = (token?: string) => {
  // #region agent log
  // #endregion
  return connectSocket('/messaging', token);
};
export const connectMeetingsSocket = (token?: string) => connectSocket('/meetings', token);

export const isMessagingConnected = () => isSocketConnected('/messaging');
export const isMeetingsConnected = () => isSocketConnected('/meetings');

// Enhanced reconnection with backoff strategy
export const smartReconnect = async (namespace?: string, maxRetries = 5): Promise<boolean> => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    
    try {
      // Exponential backoff with jitter
      if (attempt > 1) {
        const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        const jitter = baseDelay * 0.3 * Math.random();
        const delay = baseDelay + jitter;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await connectSocket(namespace);
      return true;
      
    } catch (error) {
      if (attempt >= maxRetries) {
        return false;
      }
    }
  }
  
  return false;
};

/**
 * Manual recovery from connection issues (including TransportErrors)
 */
export const recoverConnection = async (namespace?: string): Promise<boolean> => {
  const socketInstance = namespace ? getSocketInstance(namespace) : getMainSocket();
  return await socketInstance.recover();
};

/**
 * Check if socket has transport error
 */
export const hasTransportError = (namespace?: string): boolean => {
  const socketInstance = namespace ? 
    (sockets[namespace] || null) : 
    mainSocket;
  
  return socketInstance?.getState().transportError ?? false;
};

/**
 * Get current retry count for transport error recovery
 */
export const getRetryCount = (namespace?: string): number => {
  const socketInstance = namespace ? 
    (sockets[namespace] || null) : 
    mainSocket;
  
  return socketInstance?.getState().retryCount ?? 0;
};

// Connection quality and stats (simplified)
export const getConnectionQuality = (namespace?: string): 'excellent' | 'good' | 'poor' | 'unknown' => {
  const connected = isSocketConnected(namespace);
  return connected ? 'good' : 'unknown';
};

export const getConnectionStats = (namespace?: string) => {
  const socketInstance = namespace ? 
    (sockets[namespace] || null) : 
    mainSocket;
  
  if (!socketInstance) return null;
  
  const state = socketInstance.getState();
  
  return {
    connected: state.isConnected,
    transport: 'websocket',
    ping: 0,
    readyState: state.isConnected ? 1 : 0,
    quality: getConnectionQuality(namespace),
    error: state.error,
    lastConnected: state.lastConnected,
    transportError: state.transportError,
    retryCount: state.retryCount,
    isRecovering: state.transportError && state.retryCount > 0,
  };
};

export const monitorConnectionHealth = (namespace?: string, callback?: (stats: any) => void) => {
  const intervalId = setInterval(() => {
    const stats = getConnectionStats(namespace);
    if (stats && callback) {
      callback(stats);
    }
  }, 30000); // Check every 30 seconds (reduced from 10s)
  
  return intervalId;
};

// Legacy compatibility exports for existing useMessaging hook
export const connectWebSocket = (token?: string) => {
  // #region agent log
  // #endregion
  return connectMessagingSocket(token);
};
export const disconnectWebSocket = () => disconnectSocket('/messaging');
export const emitEvent = (event: string, data?: any) => {
  // Use the socket instance's emit method instead of getting the raw socket
  const socketInstance = getSocketInstance('/messaging');
  const state = socketInstance.getState();
  // #region agent log
  // #endregion
  // Check both the state and the actual socket connection
  // Use state.isConnected as primary check since it's more reliable
  if (state.isConnected || socketInstance.getSocket()?.connected) {
    socketInstance.emit(event, data);
    // #region agent log
    // #endregion
  } else {
    // #region agent log
    // #endregion
  }
};

// Enhanced version that returns a promise with response
export const emitEventWithResponse = (event: string, data?: any, timeout = 10000): Promise<any> => {
  return new Promise((resolve, reject) => {
    const socket = getMessagingSocket();
    
    if (!socket?.connected) {
      console.error('❌ [WebSocket] Socket not connected for event:', event);
      reject(new Error('WebSocket not connected'));
      return;
    }

    console.log('🚀 [WebSocket] Emitting event:', event, 'with data:', data);

    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout waiting for response to ${event}`));
    }, timeout);

    // Use acknowledgment callback to get response
    socket.emit(event, data, (response: any) => {
      clearTimeout(timeoutId);
      console.log('✅ [WebSocket] Received response for:', event, response);
      resolve(response);
    });
  });
};
export const onEvent = (event: string, callback: (...args: any[]) => void) => {
  // #region agent log
  // #endregion
  const socketInstance = getSocketInstance('/messaging');
  // #region agent log
  const state = socketInstance.getState();
  // #endregion
  return socketInstance.on(event, callback);
};
export const onStateChange = (callback: (state: ConnectionState) => void) => {
  const socketInstance = getSocketInstance('/messaging');
  return socketInstance.onStateChange(callback);
};
export const getConnectionState = () => {
  const socketInstance = getSocketInstance('/messaging');
  return socketInstance.getState();
};
export const isWebSocketConnected = () => isMessagingConnected();

// TransportError recovery methods for messaging namespace
export const recoverMessagingConnection = () => recoverConnection('/messaging');
export const hasMessagingTransportError = () => hasTransportError('/messaging');
export const getMessagingRetryCount = () => getRetryCount('/messaging');

export type { ConnectionState, WebSocketConfig };