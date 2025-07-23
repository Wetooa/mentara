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

// Enhanced socket options with optimized retry and performance settings
interface SocketOptions {
  autoConnect: boolean;
  withCredentials: boolean;
  transports: string[];
  timeout: number;
  forceNew: boolean;
  
  // Reconnection optimization
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectionDelayMax: number;
  randomizationFactor: number;
  
  // Performance optimization
  upgrade: boolean;
  rememberUpgrade: boolean;
  
  // Connection quality optimization
  pingTimeout: number;
  pingInterval: number;
  
  // Transport-specific optimization
  transportOptions?: {
    websocket?: {
      compression?: boolean;
      perMessageDeflate?: boolean;
    };
    polling?: {
      extraHeaders?: Record<string, string>;
    };
  };
  
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
    
    // Optimized socket configuration for better performance and reliability
    const socketOptions: SocketOptions = {
      autoConnect: false,
      withCredentials: true,
      
      // Transport optimization - prefer WebSocket but allow polling fallback
      transports: ['websocket', 'polling'],
      
      // Connection timeouts (reduced for faster failure detection)
      timeout: 15000, // Reduced from 20s to 15s for faster detection
      
      // Connection management
      forceNew: false,
      
      // Enhanced reconnection settings
      reconnection: true,
      reconnectionAttempts: 8, // Increased from default 5
      reconnectionDelay: 1000, // Start with 1 second
      reconnectionDelayMax: 10000, // Max 10 seconds (reduced from default 30s)
      randomizationFactor: 0.3, // 30% jitter to prevent thundering herd
      
      // Performance optimization
      upgrade: true, // Allow transport upgrades
      rememberUpgrade: true, // Remember successful upgrades
      
      // Ping/Pong optimization for connection health
      pingTimeout: 15000, // 15 seconds ping timeout
      pingInterval: 25000, // 25 seconds ping interval
      
      // Transport-specific optimizations
      transportOptions: {
        websocket: {
          compression: true, // Enable compression for WebSocket
          perMessageDeflate: true, // Enable per-message deflate
        },
        polling: {
          extraHeaders: {
            'X-Requested-With': 'socket.io-client',
          },
        },
      },
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
    
    // Optimized socket configuration for namespaced connections
    const socketOptions: SocketOptions = {
      autoConnect: false,
      withCredentials: true,
      
      // Transport optimization - prefer WebSocket but allow polling fallback
      transports: ['websocket', 'polling'],
      
      // Connection timeouts (reduced for faster failure detection)
      timeout: 15000, // Reduced from 20s to 15s for faster detection
      
      // Connection management
      forceNew: false,
      
      // Enhanced reconnection settings
      reconnection: true,
      reconnectionAttempts: 8, // Increased from default 5
      reconnectionDelay: 1000, // Start with 1 second
      reconnectionDelayMax: 10000, // Max 10 seconds (reduced from default 30s)
      randomizationFactor: 0.3, // 30% jitter to prevent thundering herd
      
      // Performance optimization
      upgrade: true, // Allow transport upgrades
      rememberUpgrade: true, // Remember successful upgrades
      
      // Ping/Pong optimization for connection health
      pingTimeout: 15000, // 15 seconds ping timeout
      pingInterval: 25000, // 25 seconds ping interval
      
      // Transport-specific optimizations
      transportOptions: {
        websocket: {
          compression: true, // Enable compression for WebSocket
          perMessageDeflate: true, // Enable per-message deflate
        },
        polling: {
          extraHeaders: {
            'X-Requested-With': 'socket.io-client',
          },
        },
      },
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

    // Adaptive timeout based on network conditions and previous connection attempts
    const baseTimeout = 8000; // Reduced base timeout from 10s to 8s
    const networkMultiplier = navigator.onLine ? 1 : 2; // Double timeout when offline detected
    const adaptiveTimeout = baseTimeout * networkMultiplier;
    
    const timeoutId = setTimeout(() => {
      trackConnectionEvent(namespaceLabel, 'CONNECTION_TIMEOUT', {
        timeoutMs: adaptiveTimeout,
        connected: socketInstance.connected,
        disconnected: socketInstance.disconnected,
        transport: socketInstance.io.engine?.transport?.name,
        readyState: socketInstance.io.engine?.readyState,
        networkOnline: navigator.onLine,
        adaptiveTimeout,
        baseTimeout
      });
      
      console.error(`⏰ [SOCKET] Connection timeout [${namespaceLabel}] after ${adaptiveTimeout}ms`);
      console.error(`🔍 [SOCKET] Final connection state [${namespaceLabel}]:`, {
        connected: socketInstance.connected,
        disconnected: socketInstance.disconnected,
        transport: socketInstance.io.engine?.transport?.name,
        networkOnline: navigator.onLine,
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown'
      });
      reject(new Error(`Socket connection timeout after ${adaptiveTimeout}ms`));
    }, adaptiveTimeout);

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

// Advanced connection utilities for performance monitoring
export const getConnectionQuality = (namespace?: string): 'excellent' | 'good' | 'poor' | 'unknown' => {
  const socketInstance = namespace ? sockets[namespace] : socket;
  if (!socketInstance?.connected) return 'unknown';
  
  try {
    const engine = socketInstance.io.engine;
    const transport = engine.transport.name;
    const ping = engine.ping || 0;
    
    // Quality assessment based on transport and ping
    if (transport === 'websocket') {
      if (ping < 50) return 'excellent';
      if (ping < 150) return 'good';
      return 'poor';
    } else if (transport === 'polling') {
      if (ping < 200) return 'good';
      return 'poor';
    }
    
    return 'unknown';
  } catch (error) {
    console.warn('⚠️ [SOCKET] Could not determine connection quality:', error);
    return 'unknown';
  }
};

export const getConnectionStats = (namespace?: string) => {
  const socketInstance = namespace ? sockets[namespace] : socket;
  if (!socketInstance) return null;
  
  try {
    const engine = socketInstance.io.engine;
    const timeline = getConnectionTimeline(namespace || 'main');
    
    return {
      connected: socketInstance.connected,
      transport: engine.transport.name,
      ping: engine.ping || 0,
      readyState: engine.readyState,
      quality: getConnectionQuality(namespace),
      eventCount: timeline.length,
      lastEvent: timeline[timeline.length - 1] || null,
      networkInfo: {
        online: navigator.onLine,
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
        downlink: (navigator as any).connection?.downlink || 0,
        rtt: (navigator as any).connection?.rtt || 0
      }
    };
  } catch (error) {
    console.warn('⚠️ [SOCKET] Could not gather connection stats:', error);
    return null;
  }
};

// Proactive connection health monitoring
export const monitorConnectionHealth = (namespace?: string, callback?: (stats: any) => void) => {
  const intervalId = setInterval(() => {
    const stats = getConnectionStats(namespace);
    if (stats) {
      const quality = stats.quality;
      
      // Log quality changes
      if (quality === 'poor') {
        console.warn(`⚠️ [SOCKET] Poor connection quality detected [${namespace || 'main'}]:`, {
          ping: stats.ping,
          transport: stats.transport,
          networkType: stats.networkInfo.effectiveType
        });
      }
      
      // Callback for custom handling
      if (callback) {
        callback(stats);
      }
      
      // Track quality metrics in timeline
      trackConnectionEvent(namespace || 'main', 'QUALITY_CHECK', {
        quality,
        ping: stats.ping,
        transport: stats.transport,
        networkOnline: stats.networkInfo.online
      });
    }
  }, 10000); // Check every 10 seconds
  
  return intervalId;
};

// Enhanced reconnection with backoff strategy
export const smartReconnect = async (namespace?: string, maxRetries: number = 5): Promise<boolean> => {
  const label = namespace || 'main';
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    
    try {
      trackConnectionEvent(label, 'SMART_RECONNECT_ATTEMPT', {
        attempt,
        maxRetries,
        networkOnline: navigator.onLine
      });
      
      console.log(`🔄 [SOCKET] Smart reconnect attempt ${attempt}/${maxRetries} [${label}]`);
      
      // Check network connectivity first
      if (!navigator.onLine) {
        console.log(`🌐 [SOCKET] Device offline, waiting for network [${label}]`);
        await new Promise(resolve => {
          const onOnline = () => {
            window.removeEventListener('online', onOnline);
            resolve(void 0);
          };
          window.addEventListener('online', onOnline);
        });
      }
      
      // Exponential backoff with jitter
      if (attempt > 1) {
        const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        const jitter = baseDelay * 0.3 * Math.random();
        const delay = baseDelay + jitter;
        
        console.log(`⏳ [SOCKET] Waiting ${Math.round(delay)}ms before reconnect [${label}]`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Attempt connection
      const socketInstance = await connectSocket(namespace);
      
      trackConnectionEvent(label, 'SMART_RECONNECT_SUCCESS', {
        attempt,
        socketId: socketInstance.id,
        transport: socketInstance.io.engine.transport.name
      });
      
      console.log(`✅ [SOCKET] Smart reconnection successful [${label}] after ${attempt} attempts`);
      return true;
      
    } catch (error) {
      trackConnectionEvent(label, 'SMART_RECONNECT_FAILED', {
        attempt,
        error: error instanceof Error ? error.message : 'Unknown error',
        willRetry: attempt < maxRetries
      });
      
      console.warn(`❌ [SOCKET] Smart reconnect attempt ${attempt} failed [${label}]:`, error);
      
      if (attempt >= maxRetries) {
        console.error(`💀 [SOCKET] Smart reconnection failed after ${maxRetries} attempts [${label}]`);
        return false;
      }
    }
  }
  
  return false;
};