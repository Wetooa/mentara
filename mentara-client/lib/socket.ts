import { io, Socket } from 'socket.io-client';

// Use consistent socket URL configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Main socket instance (for default namespace)
let socket: Socket | null = null;

// Socket instances by namespace
const sockets: Record<string, Socket> = {};

export const getSocket = (namespace?: string): Socket => {
  if (namespace) {
    return getNamespacedSocket(namespace);
  }
  
  if (!socket) {
    console.log('🔌 Creating main socket connection to:', SOCKET_URL);
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
    });

    // Add connection logging
    socket.on('connect', () => {
      console.log('✅ Main socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Main socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🚫 Main socket connection error:', error);
    });
  }
  return socket;
};

export const getNamespacedSocket = (namespace: string): Socket => {
  if (!sockets[namespace]) {
    console.log(`🔌 Creating namespaced socket connection to: ${SOCKET_URL}${namespace}`);
    sockets[namespace] = io(`${SOCKET_URL}${namespace}`, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
    });

    // Add namespace-specific logging
    sockets[namespace].on('connect', () => {
      console.log(`✅ Namespaced socket connected [${namespace}]:`, sockets[namespace]?.id);
    });

    sockets[namespace].on('disconnect', (reason) => {
      console.log(`❌ Namespaced socket disconnected [${namespace}]:`, reason);
    });

    sockets[namespace].on('connect_error', (error) => {
      console.error(`🚫 Namespaced socket connection error [${namespace}]:`, error);
    });
  }
  return sockets[namespace];
};

// Named export for convenience
export const createSocket = getNamespacedSocket;

export const connectSocket = (namespace?: string): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    const socketInstance = getSocket(namespace);
    
    if (socketInstance.connected) {
      console.log(`🔗 Socket already connected [${namespace || 'default'}]:`, socketInstance.id);
      resolve(socketInstance);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.error(`⏰ Socket connection timeout [${namespace || 'default'}]`);
      reject(new Error('Socket connection timeout'));
    }, 10000); // 10 second timeout

    const onConnect = () => {
      clearTimeout(timeoutId);
      socketInstance.off('connect', onConnect);
      socketInstance.off('connect_error', onError);
      console.log(`✅ Socket connected successfully [${namespace || 'default'}]:`, socketInstance.id);
      resolve(socketInstance);
    };

    const onError = (error: any) => {
      clearTimeout(timeoutId);
      socketInstance.off('connect', onConnect);
      socketInstance.off('connect_error', onError);
      console.error(`🚫 Socket connection error [${namespace || 'default'}]:`, error);
      reject(error);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('connect_error', onError);

    console.log(`🔄 Attempting to connect socket [${namespace || 'default'}]...`);
    socketInstance.connect();
  });
};

export const disconnectSocket = (namespace?: string) => {
  if (namespace) {
    // Disconnect specific namespace
    if (sockets[namespace]) {
      console.log(`🔌 Disconnecting namespaced socket [${namespace}]`);
      sockets[namespace].disconnect();
      delete sockets[namespace];
    }
  } else {
    // Disconnect main socket
    if (socket) {
      console.log('🔌 Disconnecting main socket');
      socket.disconnect();
      socket = null;
    }
    
    // Disconnect all namespaced sockets
    Object.keys(sockets).forEach(ns => {
      console.log(`🔌 Disconnecting namespaced socket [${ns}]`);
      sockets[ns].disconnect();
      delete sockets[ns];
    });
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