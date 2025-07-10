import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Main socket instance
let socket: Socket | null = null;

// Socket instances by namespace
const sockets: Record<string, Socket> = {};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};

export const getNamespacedSocket = (namespace: string): Socket => {
  if (!sockets[namespace]) {
    sockets[namespace] = io(`${SOCKET_URL}${namespace}`, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return sockets[namespace];
};

// Named export for convenience
export const socket = getNamespacedSocket;

export const connectSocket = (): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    const socketInstance = getSocket();
    
    if (socketInstance.connected) {
      resolve(socketInstance);
      return;
    }

    socketInstance.connect();

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      resolve(socketInstance);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      reject(error);
    });
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  // Disconnect all namespaced sockets
  Object.values(sockets).forEach(s => s.disconnect());
  Object.keys(sockets).forEach(key => delete sockets[key]);
};

export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};