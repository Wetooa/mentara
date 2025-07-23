import { io, Socket } from 'socket.io-client';

// Enhanced socket URL configuration with multiple fallbacks and environment detection
const getSocketUrl = (): string => {
  // Primary environment variable
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  // Fallback based on API URL if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Remove /api suffix if present
    const baseUrl = apiUrl.replace(/\/api$/, '');
    console.warn('⚠️ [SOCKET] NEXT_PUBLIC_WS_URL not found, using API URL as fallback:', baseUrl);
    return baseUrl;
  }
  
  // Environment-based fallbacks
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isProduction) {
    // In production, try to use current origin
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      console.warn('⚠️ [SOCKET] Using window.location.origin in production:', origin);
      return origin;
    }
    // Fallback for production without window (SSR)
    console.error('❌ [SOCKET] No WebSocket URL configured for production!');
    return 'https://api.mentara.com'; // Replace with actual production URL
  }
  
  // Development fallback
  console.warn('⚠️ [SOCKET] Using development fallback: http://localhost:3001');
  return 'http://localhost:3001';
};

// Validate socket URL format and warn about potential issues
const validateSocketUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    
    // Check for common issues
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      console.error('❌ [SOCKET] Invalid protocol in WebSocket URL:', parsed.protocol);
      return false;
    }
    
    if (!parsed.hostname) {
      console.error('❌ [SOCKET] Invalid hostname in WebSocket URL');
      return false;
    }
    
    // Warn about potential issues
    if (parsed.protocol === 'http:' && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ [SOCKET] Using HTTP in production may cause security issues');
    }
    
    if (parsed.hostname === 'localhost' && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ [SOCKET] Using localhost in production will not work');
    }
    
    return true;
  } catch (error) {
    console.error('❌ [SOCKET] Invalid WebSocket URL format:', url, error);
    return false;
  }
};

const SOCKET_URL = getSocketUrl();

// Validate the final URL
if (!validateSocketUrl(SOCKET_URL)) {
  console.error('❌ [SOCKET] WebSocket URL validation failed, connection may fail');
}

// Log the final socket URL for debugging
console.log('🔧 [SOCKET] Final WebSocket URL:', SOCKET_URL);
console.log('🔧 [SOCKET] Environment context:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'NOT_SET',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET'
});

// Enhanced connection state tracking for debugging
interface ConnectionTimeline {
  timestamp: number;
  event: string;
  details?: any;
}

const connectionTimelines: Record<string, ConnectionTimeline[]> = {};

// Helper function to track connection events for debugging
const trackConnectionEvent = (namespace: string, event: string, details?: any) => {
  if (!connectionTimelines[namespace]) {
    connectionTimelines[namespace] = [];
  }
  
  const timeline = {
    timestamp: Date.now(),
    event,
    details
  };
  
  connectionTimelines[namespace].push(timeline);
  
  // Log enhanced connection tracking
  console.log(`🕒 [SOCKET TIMELINE] [${namespace}] ${event}:`, {
    timestamp: new Date(timeline.timestamp).toISOString(),
    details,
    timelineLength: connectionTimelines[namespace].length
  });
  
  // Keep only last 50 events to prevent memory leaks
  if (connectionTimelines[namespace].length > 50) {
    connectionTimelines[namespace] = connectionTimelines[namespace].slice(-50);
  }
};

// Export timeline for debugging purposes
export const getConnectionTimeline = (namespace: string) => connectionTimelines[namespace] || [];
export const clearConnectionTimeline = (namespace: string) => {
  connectionTimelines[namespace] = [];
};

// Type for socket options with auth
interface SocketOptions {
  autoConnect: boolean;
  withCredentials: boolean;
  transports: string[];
  timeout: number;
  forceNew: boolean;
  auth?: {
    token?: string;
  };
}

// Main socket instance (for default namespace)
let socket: Socket | null = null;

// Socket instances by namespace
const sockets: Record<string, Socket> = {};

export const getSocket = (namespace?: string, token?: string): Socket => {
  const nsLabel = namespace || 'main';
  
  if (namespace) {
    return getNamespacedSocket(namespace, token);
  }
  
  if (!socket) {
    trackConnectionEvent(nsLabel, 'SOCKET_CREATION_START', {
      url: SOCKET_URL,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    });
    
    console.log('🔌 [SOCKET] Creating main socket connection to:', SOCKET_URL);
    console.log('🔧 [SOCKET] Environment variables:', {
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
    console.log('🔑 [SOCKET] Authentication token provided:', !!token);
    
    // Token validation logging
    if (token) {
      try {
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        trackConnectionEvent(nsLabel, 'TOKEN_VALIDATION', {
          hasValidStructure: tokenParts.length === 3,
          isExpired,
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          userId: payload.sub || payload.id
        });
        
        if (isExpired) {
          console.warn('⚠️ [SOCKET] Token appears to be expired!');
        }
      } catch (error) {
        trackConnectionEvent(nsLabel, 'TOKEN_VALIDATION_ERROR', { error: error.message });
        console.warn('⚠️ [SOCKET] Could not validate token structure:', error);
      }
    }
    
    const socketOptions: SocketOptions = {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
    };

    // Add authentication token if provided
    if (token) {
      socketOptions.auth = { token };
      console.log('🔐 [SOCKET] Adding authentication token to socket options');
      console.log('🔑 [SOCKET] Token preview:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ [SOCKET] No authentication token provided!');
      trackConnectionEvent(nsLabel, 'NO_TOKEN_PROVIDED');
    }
    
    trackConnectionEvent(nsLabel, 'SOCKET_OPTIONS_CONFIGURED', socketOptions);
    socket = io(SOCKET_URL, socketOptions);
    trackConnectionEvent(nsLabel, 'SOCKET_INSTANCE_CREATED', { id: socket.id || 'not-connected' });

    // Add comprehensive connection logging with timeline tracking
    socket.on('connect', () => {
      trackConnectionEvent(nsLabel, 'CONNECTED', {
        socketId: socket?.id,
        transport: socket?.io.engine.transport.name,
        uri: socket?.io.uri,
        readyState: socket?.io.engine.readyState
      });
      
      console.log('✅ [SOCKET] Main socket connected successfully');
      console.log('🆔 [SOCKET] Socket ID:', socket?.id);
      console.log('🌐 [SOCKET] Transport:', socket?.io.engine.transport.name);
      console.log('📡 [SOCKET] Connected to:', socket?.io.uri);
    });

    socket.on('disconnect', (reason) => {
      trackConnectionEvent(nsLabel, 'DISCONNECTED', {
        reason,
        socketId: socket?.id,
        timestamp: new Date().toISOString()
      });
      
      console.log('❌ [SOCKET] Main socket disconnected:', reason);
      console.log('🕒 [SOCKET] Disconnect timestamp:', new Date().toISOString());
    });

    socket.on('connect_error', (error) => {
      trackConnectionEvent(nsLabel, 'CONNECTION_ERROR', {
        message: error.message || 'No message',
        description: error.description || 'No description',
        type: error.type || 'No type',
        transport: error.transport || 'No transport',
        code: error.code || 'No code',
        context: error.context || 'No context'
      });
      
      console.error('🚫 [SOCKET] Main socket connection error:', error);
      console.error('🔍 [SOCKET] Error details:', {
        message: error.message || 'No message',
        description: error.description || 'No description',
        type: error.type || 'No type',
        transport: error.transport || 'No transport',
        stack: error.stack || 'No stack',
        code: error.code || 'No code',
        context: error.context || 'No context',
        data: error.data || 'No data',
      });
      console.error('🔍 [SOCKET] Full error object:', JSON.stringify(error, null, 2));
    });

    socket.on('reconnect', (attemptNumber) => {
      trackConnectionEvent(nsLabel, 'RECONNECTED', {
        attemptNumber,
        socketId: socket?.id,
        transport: socket?.io.engine.transport.name
      });
      console.log('🔄 [SOCKET] Main socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      trackConnectionEvent(nsLabel, 'RECONNECT_ATTEMPT', { attemptNumber });
      console.log('⏳ [SOCKET] Main socket reconnection attempt', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      trackConnectionEvent(nsLabel, 'RECONNECT_ERROR', {
        error: error.message || error.toString(),
        attemptNumber: socket?.io.engine?.upgrading ? 'upgrading' : 'unknown'
      });
      console.error('🔴 [SOCKET] Main socket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      trackConnectionEvent(nsLabel, 'RECONNECT_FAILED', {
        maxAttemptsReached: true,
        socketId: socket?.id
      });
      console.error('💀 [SOCKET] Main socket reconnection failed - max attempts reached');
    });
  }
  return socket;
};

export const getNamespacedSocket = (namespace: string, token?: string): Socket => {
  if (!sockets[namespace]) {
    trackConnectionEvent(namespace, 'NAMESPACE_SOCKET_CREATION_START', {
      namespace,
      url: `${SOCKET_URL}${namespace}`,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    });
    
    console.log(`🔌 [SOCKET] Creating namespaced socket connection to: ${SOCKET_URL}${namespace}`);
    console.log(`🔧 [SOCKET] Namespace [${namespace}] configuration:`, {
      url: `${SOCKET_URL}${namespace}`,
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    console.log(`🔑 [SOCKET] Authentication token provided for [${namespace}]:`, !!token);
    
    // Token validation logging for namespace
    if (token) {
      try {
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        trackConnectionEvent(namespace, 'TOKEN_VALIDATION', {
          hasValidStructure: tokenParts.length === 3,
          isExpired,
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          userId: payload.sub || payload.id
        });
        
        if (isExpired) {
          console.warn(`⚠️ [SOCKET] Token appears to be expired for namespace [${namespace}]!`);
        }
      } catch (error) {
        trackConnectionEvent(namespace, 'TOKEN_VALIDATION_ERROR', { error: error.message });
        console.warn(`⚠️ [SOCKET] Could not validate token structure for [${namespace}]:`, error);
      }
    }
    
    const socketOptions: SocketOptions = {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
    };

    // Add authentication token if provided
    if (token) {
      socketOptions.auth = { token };
      console.log(`🔐 [SOCKET] Adding authentication token to namespace [${namespace}] options`);
      console.log(`🔑 [SOCKET] Token preview [${namespace}]:`, token.substring(0, 20) + '...');
    } else {
      console.warn(`⚠️ [SOCKET] No authentication token provided for namespace [${namespace}]!`);
      trackConnectionEvent(namespace, 'NO_TOKEN_PROVIDED');
    }
    
    trackConnectionEvent(namespace, 'SOCKET_OPTIONS_CONFIGURED', socketOptions);
    sockets[namespace] = io(`${SOCKET_URL}${namespace}`, socketOptions);
    trackConnectionEvent(namespace, 'SOCKET_INSTANCE_CREATED', { id: sockets[namespace].id || 'not-connected' });

    // Add comprehensive namespace-specific logging with timeline tracking
    sockets[namespace].on('connect', () => {
      trackConnectionEvent(namespace, 'CONNECTED', {
        socketId: sockets[namespace]?.id,
        transport: sockets[namespace]?.io.engine.transport.name,
        uri: sockets[namespace]?.io.uri,
        readyState: sockets[namespace]?.io.engine.readyState
      });
      
      console.log(`✅ [SOCKET] Namespaced socket connected [${namespace}] successfully`);
      console.log(`🆔 [SOCKET] Socket ID [${namespace}]:`, sockets[namespace]?.id);
      console.log(`🌐 [SOCKET] Transport [${namespace}]:`, sockets[namespace]?.io.engine.transport.name);
      console.log(`📡 [SOCKET] Connected to [${namespace}]:`, sockets[namespace]?.io.uri);
    });

    sockets[namespace].on('disconnect', (reason) => {
      trackConnectionEvent(namespace, 'DISCONNECTED', {
        reason,
        socketId: sockets[namespace]?.id,
        timestamp: new Date().toISOString()
      });
      
      console.log(`❌ [SOCKET] Namespaced socket disconnected [${namespace}]:`, reason);
      console.log(`🕒 [SOCKET] Disconnect timestamp [${namespace}]:`, new Date().toISOString());
    });

    sockets[namespace].on('connect_error', (error) => {
      trackConnectionEvent(namespace, 'CONNECTION_ERROR', {
        message: error.message || 'No message',
        description: error.description || 'No description',
        type: error.type || 'No type',
        transport: error.transport || 'No transport',
        code: error.code || 'No code',
        context: error.context || 'No context'
      });
      
      console.error(`🚫 [SOCKET] Namespaced socket connection error [${namespace}]:`, error);
      console.error(`🔍 [SOCKET] Error details [${namespace}]:`, {
        message: error.message || 'No message',
        description: error.description || 'No description',
        type: error.type || 'No type',
        transport: error.transport || 'No transport',
        stack: error.stack || 'No stack',
        code: error.code || 'No code',
        context: error.context || 'No context',
        data: error.data || 'No data',
      });
      console.error(`🔍 [SOCKET] Full error object [${namespace}]:`, JSON.stringify(error, null, 2));
    });

    sockets[namespace].on('reconnect', (attemptNumber) => {
      trackConnectionEvent(namespace, 'RECONNECTED', {
        attemptNumber,
        socketId: sockets[namespace]?.id,
        transport: sockets[namespace]?.io.engine.transport.name
      });
      console.log(`🔄 [SOCKET] Namespaced socket reconnected [${namespace}] after`, attemptNumber, 'attempts');
    });

    sockets[namespace].on('reconnect_attempt', (attemptNumber) => {
      trackConnectionEvent(namespace, 'RECONNECT_ATTEMPT', { attemptNumber });
      console.log(`⏳ [SOCKET] Namespaced socket reconnection attempt [${namespace}]`, attemptNumber);
    });

    sockets[namespace].on('reconnect_error', (error) => {
      trackConnectionEvent(namespace, 'RECONNECT_ERROR', {
        error: error.message || error.toString(),
        attemptNumber: sockets[namespace]?.io.engine?.upgrading ? 'upgrading' : 'unknown'
      });
      console.error(`🔴 [SOCKET] Namespaced socket reconnection error [${namespace}]:`, error);
    });

    sockets[namespace].on('reconnect_failed', () => {
      trackConnectionEvent(namespace, 'RECONNECT_FAILED', {
        maxAttemptsReached: true,
        socketId: sockets[namespace]?.id
      });
      console.error(`💀 [SOCKET] Namespaced socket reconnection failed [${namespace}] - max attempts reached`);
    });
  }
  return sockets[namespace];
};

// Named export for convenience
export const createSocket = getNamespacedSocket;

export const connectSocket = (namespace?: string, token?: string): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    const socketInstance = getSocket(namespace, token);
    const namespaceLabel = namespace || 'default';
    
    trackConnectionEvent(namespaceLabel, 'CONNECTION_ATTEMPT_START', {
      namespace: namespaceLabel,
      url: socketInstance.io.uri,
      connected: socketInstance.connected,
      disconnected: socketInstance.disconnected,
      id: socketInstance.id || 'not-connected',
      hasToken: !!token
    });
    
    console.log(`🔄 [SOCKET] Attempting to connect socket [${namespaceLabel}]...`);
    console.log(`📋 [SOCKET] Connection details [${namespaceLabel}]:`, {
      url: socketInstance.io.uri,
      connected: socketInstance.connected,
      disconnected: socketInstance.disconnected,
      id: socketInstance.id || 'not-connected',
    });
    
    if (socketInstance.connected) {
      trackConnectionEvent(namespaceLabel, 'ALREADY_CONNECTED', { socketId: socketInstance.id });
      console.log(`🔗 [SOCKET] Socket already connected [${namespaceLabel}]:`, socketInstance.id);
      resolve(socketInstance);
      return;
    }

    const timeoutId = setTimeout(() => {
      trackConnectionEvent(namespaceLabel, 'CONNECTION_TIMEOUT', {
        timeoutMs: 10000,
        connected: socketInstance.connected,
        disconnected: socketInstance.disconnected,
        transport: socketInstance.io.engine?.transport?.name,
        readyState: socketInstance.io.engine?.readyState
      });
      
      console.error(`⏰ [SOCKET] Connection timeout [${namespaceLabel}] after 10 seconds`);
      console.error(`🔍 [SOCKET] Final connection state [${namespaceLabel}]:`, {
        connected: socketInstance.connected,
        disconnected: socketInstance.disconnected,
        transport: socketInstance.io.engine?.transport?.name,
      });
      reject(new Error('Socket connection timeout after 10 seconds'));
    }, 10000); // 10 second timeout

    const onConnect = () => {
      clearTimeout(timeoutId);
      socketInstance.off('connect', onConnect);
      socketInstance.off('connect_error', onError);
      
      trackConnectionEvent(namespaceLabel, 'CONNECTION_SUCCESS', {
        socketId: socketInstance.id,
        transport: socketInstance.io.engine.transport.name,
        readyState: socketInstance.io.engine.readyState,
        connected: socketInstance.connected
      });
      
      console.log(`✅ [SOCKET] Socket connected successfully [${namespaceLabel}]:`, socketInstance.id);
      console.log(`📊 [SOCKET] Connection stats [${namespaceLabel}]:`, {
        transport: socketInstance.io.engine.transport.name,
        readyState: socketInstance.io.engine.readyState,
        connected: socketInstance.connected,
      });
      resolve(socketInstance);
    };

    const onError = (error: any) => {
      clearTimeout(timeoutId);
      socketInstance.off('connect', onConnect);
      socketInstance.off('connect_error', onError);
      
      trackConnectionEvent(namespaceLabel, 'CONNECTION_FAILED', {
        error: error.message || error.toString(),
        connected: socketInstance.connected,
        transport: socketInstance.io.engine?.transport?.name,
        readyState: socketInstance.io.engine?.readyState
      });
      
      console.error(`🚫 [SOCKET] Connection error [${namespaceLabel}]:`, error);
      console.error(`🔍 [SOCKET] Error context [${namespaceLabel}]:`, {
        message: error.message,
        stack: error.stack,
        connected: socketInstance.connected,
        transport: socketInstance.io.engine?.transport?.name,
      });
      reject(error);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('connect_error', onError);

    trackConnectionEvent(namespaceLabel, 'CONNECTION_INITIATED', {
      socketId: socketInstance.id || 'not-connected',
      connected: socketInstance.connected
    });
    
    console.log(`⚡ [SOCKET] Initiating connection [${namespaceLabel}]...`);
    socketInstance.connect();
  });
};

export const disconnectSocket = (namespace?: string) => {
  const timestamp = new Date().toISOString();
  
  if (namespace) {
    // Disconnect specific namespace
    if (sockets[namespace]) {
      trackConnectionEvent(namespace, 'DISCONNECT_INITIATED', {
        connected: sockets[namespace].connected,
        id: sockets[namespace].id,
        timestamp
      });
      
      console.log(`🔌 [SOCKET] Disconnecting namespaced socket [${namespace}] at ${timestamp}`);
      console.log(`📋 [SOCKET] Pre-disconnect state [${namespace}]:`, {
        connected: sockets[namespace].connected,
        id: sockets[namespace].id,
      });
      
      sockets[namespace].disconnect();
      delete sockets[namespace];
      
      trackConnectionEvent(namespace, 'DISCONNECT_COMPLETED', { timestamp });
      console.log(`✅ [SOCKET] Namespaced socket [${namespace}] disconnected and cleaned up`);
    } else {
      trackConnectionEvent(namespace, 'DISCONNECT_NO_SOCKET', { timestamp });
      console.log(`⚠️ [SOCKET] No socket found to disconnect for namespace [${namespace}]`);
    }
  } else {
    // Disconnect main socket
    const mainLabel = 'main';
    if (socket) {
      trackConnectionEvent(mainLabel, 'DISCONNECT_INITIATED', {
        connected: socket.connected,
        id: socket.id,
        timestamp
      });
      
      console.log(`🔌 [SOCKET] Disconnecting main socket at ${timestamp}`);
      console.log(`📋 [SOCKET] Pre-disconnect state [main]:`, {
        connected: socket.connected,
        id: socket.id,
      });
      
      socket.disconnect();
      socket = null;
      
      trackConnectionEvent(mainLabel, 'DISCONNECT_COMPLETED', { timestamp });
      console.log(`✅ [SOCKET] Main socket disconnected and cleaned up`);
    }
    
    // Disconnect all namespaced sockets
    const namespaceKeys = Object.keys(sockets);
    if (namespaceKeys.length > 0) {
      console.log(`🔌 [SOCKET] Disconnecting ${namespaceKeys.length} namespaced sockets`);
      namespaceKeys.forEach(ns => {
        trackConnectionEvent(ns, 'BULK_DISCONNECT_INITIATED', { timestamp });
        console.log(`🔌 [SOCKET] Disconnecting namespaced socket [${ns}]`);
        if (sockets[ns]) {
          sockets[ns].disconnect();
          delete sockets[ns];
          trackConnectionEvent(ns, 'BULK_DISCONNECT_COMPLETED', { timestamp });
        }
      });
      console.log(`✅ [SOCKET] All namespaced sockets disconnected and cleaned up`);
    } else {
      console.log(`ℹ️ [SOCKET] No namespaced sockets to disconnect`);
    }
  }
};

export const isSocketConnected = (namespace?: string): boolean => {
  if (namespace) {
    return sockets[namespace]?.connected ?? false;
  }
  return socket?.connected ?? false;
};

// Helper functions for specific namespaces
export const getMessagingSocket = (token?: string) => getNamespacedSocket('/messaging', token);
export const getMeetingsSocket = (token?: string) => getNamespacedSocket('/meetings', token);

export const connectMessagingSocket = (token?: string) => connectSocket('/messaging', token);
export const connectMeetingsSocket = (token?: string) => connectSocket('/meetings', token);

export const isMessagingConnected = () => isSocketConnected('/messaging');
export const isMeetingsConnected = () => isSocketConnected('/meetings');