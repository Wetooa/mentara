import { io, Socket } from 'socket.io-client';
import { Message, Contact } from '@/components/messages/types';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export interface MessagingWebSocketEvents {
  // Connection events
  'connected': () => void;
  'disconnected': () => void;
  'error': (error: string) => void;
  
  // Message events
  'new_message': (message: Message) => void;
  'message_updated': (data: { messageId: string; content?: string; isDeleted?: boolean }) => void;
  'message_read': (data: { messageId: string; userId: string; readAt: string }) => void;
  'message_reaction': (data: { messageId: string; reaction: any }) => void;
  
  // Typing events
  'typing_indicator': (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  
  // User status events
  'user_status_changed': (data: { userId: string; status: 'online' | 'offline'; timestamp: string }) => void;
  'user_joined_conversation': (data: { conversationId: string; userId: string }) => void;
  'user_left_conversation': (data: { conversationId: string; userId: string }) => void;
  
  // Conversation events
  'conversation_joined': (data: { conversationId: string }) => void;
  'conversation_left': (data: { conversationId: string }) => void;
}

export class MessagingWebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private authToken: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners = new Map<keyof MessagingWebSocketEvents, Set<Function>>();
  
  constructor() {
    // Don't auto-retrieve token in constructor - let it be passed in explicitly
  }
  
  // Connect to WebSocket server
  connect(token?: string): void {
    if (token) {
      this.authToken = token;
    }
    
    if (!this.authToken) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }
    
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }
    
    this.socket = io(`${WEBSOCKET_URL}/messaging`, {
      auth: {
        token: this.authToken,
      },
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true,
    });
    
    this.setupEventListeners();
  }
  
  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  // Setup internal event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Connected to messaging WebSocket');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from messaging WebSocket:', reason);
      this.isConnected = false;
      this.emit('disconnected');
      
      // Auto-reconnect on unexpected disconnection
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, don't reconnect automatically
        return;
      }
      
      this.handleReconnection();
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('error', error.message);
      this.handleReconnection();
    });
    
    // Message events
    this.socket.on('new_message', (message) => {
      this.emit('new_message', message);
    });
    
    this.socket.on('message_updated', (data) => {
      this.emit('message_updated', data);
    });
    
    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });
    
    this.socket.on('message_reaction', (data) => {
      this.emit('message_reaction', data);
    });
    
    // Typing events
    this.socket.on('typing_indicator', (data) => {
      this.emit('typing_indicator', data);
    });
    
    // User status events
    this.socket.on('user_status_changed', (data) => {
      this.emit('user_status_changed', data);
    });
    
    this.socket.on('user_joined_conversation', (data) => {
      this.emit('user_joined_conversation', data);
    });
    
    this.socket.on('user_left_conversation', (data) => {
      this.emit('user_left_conversation', data);
    });
    
    // Conversation events
    this.socket.on('conversation_joined', (data) => {
      this.emit('conversation_joined', data);
    });
    
    this.socket.on('conversation_left', (data) => {
      this.emit('conversation_left', data);
    });
    
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error.message);
    });
  }
  
  // Handle reconnection logic
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected && this.authToken) {
        this.connect();
      }
    }, delay);
  }
  
  // Join a conversation room
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, cannot join conversation');
      return;
    }
    
    this.socket.emit('join_conversation', { conversationId });
  }
  
  // Leave a conversation room
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, cannot leave conversation');
      return;
    }
    
    this.socket.emit('leave_conversation', { conversationId });
  }
  
  // Send typing indicator
  sendTypingIndicator(conversationId: string, isTyping: boolean = true): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, cannot send typing indicator');
      return;
    }
    
    this.socket.emit('typing_indicator', { conversationId, isTyping });
  }
  
  // Event listener management
  on<K extends keyof MessagingWebSocketEvents>(
    event: K,
    listener: MessagingWebSocketEvents[K]
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }
  
  off<K extends keyof MessagingWebSocketEvents>(
    event: K,
    listener: MessagingWebSocketEvents[K]
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }
  
  private emit<K extends keyof MessagingWebSocketEvents>(
    event: K,
    ...args: Parameters<MessagingWebSocketEvents[K]>
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          (listener as Function)(...args);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }
  
  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }
  
  setAuthToken(token: string): void {
    this.authToken = token;
    
    // Reconnect with new token if currently connected
    if (this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }
  
  // Cleanup method
  cleanup(): void {
    this.listeners.clear();
    this.disconnect();
  }
}

// Export singleton instance
export const messagingWebSocket = new MessagingWebSocketService();