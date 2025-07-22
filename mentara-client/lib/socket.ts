import { io, Socket } from 'socket.io-client';

// Use consistent socket URL configuration - WebSocket should connect directly to server, not through /api
const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

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

export const getSocket = (namespace?: string): Socket => {
  if (namespace) {
    return getNamespacedSocket(namespace);
  }
  
  if (!socket) {
    console.log('🔌 [SOCKET] Creating main socket connection to:', SOCKET_URL);
    console.log('🔧 [SOCKET] Environment variables:', {
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
    
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
    });

    // Add comprehensive connection logging
    socket.on('connect', () => {
      console.log('✅ [SOCKET] Main socket connected successfully');
      console.log('🆔 [SOCKET] Socket ID:', socket?.id);
      console.log('🌐 [SOCKET] Transport:', socket?.io.engine.transport.name);
      console.log('📡 [SOCKET] Connected to:', socket?.io.uri);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ [SOCKET] Main socket disconnected:', reason);
      console.log('🕒 [SOCKET] Disconnect timestamp:', new Date().toISOString());
    });

    socket.on('connect_error', (error) => {
      console.error('🚫 [SOCKET] Main socket connection error:', error);
      console.error('🔍 [SOCKET] Error details:', {
        message: error.message,
        description: error.description,
        type: error.type,
        transport: error.transport,
      });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 [SOCKET] Main socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('⏳ [SOCKET] Main socket reconnection attempt', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔴 [SOCKET] Main socket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('💀 [SOCKET] Main socket reconnection failed - max attempts reached');
    });
  }
  return socket;
};

export const getNamespacedSocket = (namespace: string): Socket => {
  if (!sockets[namespace]) {
    console.log(`🔌 [SOCKET] Creating namespaced socket connection to: ${SOCKET_URL}${namespace}`);
    console.log(`🔧 [SOCKET] Namespace [${namespace}] configuration:`, {
      url: `${SOCKET_URL}${namespace}`,
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    
    sockets[namespace] = io(`${SOCKET_URL}${namespace}`, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
    });

    // Add comprehensive namespace-specific logging
    sockets[namespace].on('connect', () => {
      console.log(`✅ [SOCKET] Namespaced socket connected [${namespace}] successfully`);
      console.log(`🆔 [SOCKET] Socket ID [${namespace}]:`, sockets[namespace]?.id);
      console.log(`🌐 [SOCKET] Transport [${namespace}]:`, sockets[namespace]?.io.engine.transport.name);
      console.log(`📡 [SOCKET] Connected to [${namespace}]:`, sockets[namespace]?.io.uri);
    });

    sockets[namespace].on('disconnect', (reason) => {
      console.log(`❌ [SOCKET] Namespaced socket disconnected [${namespace}]:`, reason);
      console.log(`🕒 [SOCKET] Disconnect timestamp [${namespace}]:`, new Date().toISOString());
    });

    sockets[namespace].on('connect_error', (error) => {
      console.error(`🚫 [SOCKET] Namespaced socket connection error [${namespace}]:`, error);
      console.error(`🔍 [SOCKET] Error details [${namespace}]:`, {
        message: error.message,
        description: error.description,
        type: error.type,
        transport: error.transport,
      });
    });

    sockets[namespace].on('reconnect', (attemptNumber) => {
      console.log(`🔄 [SOCKET] Namespaced socket reconnected [${namespace}] after`, attemptNumber, 'attempts');
    });

    sockets[namespace].on('reconnect_attempt', (attemptNumber) => {
      console.log(`⏳ [SOCKET] Namespaced socket reconnection attempt [${namespace}]`, attemptNumber);
    });

    sockets[namespace].on('reconnect_error', (error) => {
      console.error(`🔴 [SOCKET] Namespaced socket reconnection error [${namespace}]:`, error);
    });

    sockets[namespace].on('reconnect_failed', () => {
      console.error(`💀 [SOCKET] Namespaced socket reconnection failed [${namespace}] - max attempts reached`);
    });
  }
  return sockets[namespace];
};

// Named export for convenience
export const createSocket = getNamespacedSocket;

export const connectSocket = (namespace?: string): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    const socketInstance = getSocket(namespace);
    const namespaceLabel = namespace || 'default';
    
    console.log(`🔄 [SOCKET] Attempting to connect socket [${namespaceLabel}]...`);
    console.log(`📋 [SOCKET] Connection details [${namespaceLabel}]:`, {
      url: socketInstance.io.uri,
      connected: socketInstance.connected,
      disconnected: socketInstance.disconnected,
      id: socketInstance.id || 'not-connected',
    });
    
    if (socketInstance.connected) {
      console.log(`🔗 [SOCKET] Socket already connected [${namespaceLabel}]:`, socketInstance.id);
      resolve(socketInstance);
      return;
    }

    const timeoutId = setTimeout(() => {
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

    console.log(`⚡ [SOCKET] Initiating connection [${namespaceLabel}]...`);
    socketInstance.connect();
  });
};

export const disconnectSocket = (namespace?: string) => {
  const timestamp = new Date().toISOString();
  
  if (namespace) {
    // Disconnect specific namespace
    if (sockets[namespace]) {
      console.log(`🔌 [SOCKET] Disconnecting namespaced socket [${namespace}] at ${timestamp}`);
      console.log(`📋 [SOCKET] Pre-disconnect state [${namespace}]:`, {
        connected: sockets[namespace].connected,
        id: sockets[namespace].id,
      });
      sockets[namespace].disconnect();
      delete sockets[namespace];
      console.log(`✅ [SOCKET] Namespaced socket [${namespace}] disconnected and cleaned up`);
    } else {
      console.log(`⚠️ [SOCKET] No socket found to disconnect for namespace [${namespace}]`);
    }
  } else {
    // Disconnect main socket
    if (socket) {
      console.log(`🔌 [SOCKET] Disconnecting main socket at ${timestamp}`);
      console.log(`📋 [SOCKET] Pre-disconnect state [main]:`, {
        connected: socket.connected,
        id: socket.id,
      });
      socket.disconnect();
      socket = null;
      console.log(`✅ [SOCKET] Main socket disconnected and cleaned up`);
    }
    
    // Disconnect all namespaced sockets
    const namespaceKeys = Object.keys(sockets);
    if (namespaceKeys.length > 0) {
      console.log(`🔌 [SOCKET] Disconnecting ${namespaceKeys.length} namespaced sockets`);
      namespaceKeys.forEach(ns => {
        console.log(`🔌 [SOCKET] Disconnecting namespaced socket [${ns}]`);
        if (sockets[ns]) {
          sockets[ns].disconnect();
          delete sockets[ns];
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
export const getMessagingSocket = () => getNamespacedSocket('/messaging');
export const getMeetingsSocket = () => getNamespacedSocket('/meetings');

export const connectMessagingSocket = () => connectSocket('/messaging');
export const connectMeetingsSocket = () => connectSocket('/meetings');

export const isMessagingConnected = () => isSocketConnected('/messaging');
export const isMeetingsConnected = () => isSocketConnected('/meetings');