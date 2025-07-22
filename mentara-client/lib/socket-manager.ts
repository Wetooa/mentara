import { Socket } from 'socket.io-client';
import { getMessagingSocket, connectMessagingSocket, isMessagingConnected, disconnectSocket } from './socket';

// Global socket connection state
interface SocketConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
  connectionCount: number;
  subscribers: Set<string>;
}

// Event listener management
interface EventSubscription {
  event: string;
  callback: (...args: any[]) => void;
  subscriberId: string;
}

class SocketManager {
  private static instance: SocketManager;
  private messagingSocket: Socket | null = null;
  private connectionState: SocketConnectionState = {
    isConnected: false,
    isReconnecting: false,
    error: null,
    lastConnected: null,
    connectionCount: 0,
    subscribers: new Set(),
  };
  private eventSubscriptions: Map<string, EventSubscription[]> = new Map();
  private stateListeners: Set<(state: SocketConnectionState) => void> = new Set();
  private accessToken: string | null = null;
  private reconnectTimeoutRef: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  private constructor() {
    console.log('🔧 [SOCKET-MANAGER] Socket manager initialized');
  }

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // Subscribe to connection state changes
  subscribeToConnectionState(callback: (state: SocketConnectionState) => void): () => void {
    this.stateListeners.add(callback);
    // Immediately call with current state
    callback(this.connectionState);
    
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  // Subscribe to socket events
  subscribeToEvent(
    subscriberId: string,
    event: string,
    callback: (...args: any[]) => void
  ): () => void {
    const subscription: EventSubscription = { event, callback, subscriberId };
    
    if (!this.eventSubscriptions.has(event)) {
      this.eventSubscriptions.set(event, []);
    }
    
    this.eventSubscriptions.get(event)!.push(subscription);
    
    // If socket is already connected, add the listener immediately
    if (this.messagingSocket) {
      this.messagingSocket.on(event, callback);
    }

    console.log(`📡 [SOCKET-MANAGER] Subscriber ${subscriberId} subscribed to ${event}`);

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromEvent(subscriberId, event, callback);
    };
  }

  // Unsubscribe from socket events
  private unsubscribeFromEvent(
    subscriberId: string,
    event: string,
    callback: (...args: any[]) => void
  ) {
    const subscriptions = this.eventSubscriptions.get(event);
    if (subscriptions) {
      const index = subscriptions.findIndex(
        sub => sub.subscriberId === subscriberId && sub.callback === callback
      );
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (this.messagingSocket) {
          this.messagingSocket.off(event, callback);
        }
        console.log(`📡 [SOCKET-MANAGER] Subscriber ${subscriberId} unsubscribed from ${event}`);
      }
    }
  }

  // Register a subscriber (hook instance)
  async subscribe(subscriberId: string, accessToken?: string): Promise<void> {
    console.log(`🔌 [SOCKET-MANAGER] New subscriber: ${subscriberId}`);
    
    this.connectionState.subscribers.add(subscriberId);
    this.connectionState.connectionCount = this.connectionState.subscribers.size;
    
    // Store or update access token
    if (accessToken && accessToken !== this.accessToken) {
      console.log('🔑 [SOCKET-MANAGER] Updating access token');
      this.accessToken = accessToken;
    }

    // Connect if this is the first subscriber or if not connected
    if (!this.connectionState.isConnected && !this.connectionState.isReconnecting) {
      await this.connect();
    }
    
    this.notifyStateListeners();
  }

  // Unregister a subscriber
  unsubscribe(subscriberId: string): void {
    console.log(`🔌 [SOCKET-MANAGER] Removing subscriber: ${subscriberId}`);
    
    this.connectionState.subscribers.delete(subscriberId);
    this.connectionState.connectionCount = this.connectionState.subscribers.size;

    // Remove all event subscriptions for this subscriber
    this.eventSubscriptions.forEach((subscriptions, event) => {
      const filtered = subscriptions.filter(sub => sub.subscriberId !== subscriberId);
      if (filtered.length !== subscriptions.length) {
        this.eventSubscriptions.set(event, filtered);
      }
    });

    // Disconnect if no more subscribers
    if (this.connectionState.subscribers.size === 0) {
      console.log('🔌 [SOCKET-MANAGER] No more subscribers, disconnecting');
      this.disconnect();
    }
    
    this.notifyStateListeners();
  }

  // Connect to messaging socket
  private async connect(): Promise<void> {
    if (this.connectionState.isReconnecting || this.connectionState.isConnected) {
      return;
    }

    try {
      console.log('🔄 [SOCKET-MANAGER] Initiating socket connection...');
      this.updateConnectionState({ isReconnecting: true, error: null });

      // Get or create messaging socket with auth token
      this.messagingSocket = getMessagingSocket(this.accessToken || undefined);
      
      // Set up core event listeners
      this.setupCoreEventListeners();
      
      // Re-add all existing event subscriptions
      this.reattachEventSubscriptions();

      // Connect the socket
      await connectMessagingSocket(this.accessToken || undefined);

    } catch (error) {
      console.error('❌ [SOCKET-MANAGER] Connection failed:', error);
      this.updateConnectionState({ 
        error: 'Connection failed',
        isReconnecting: false 
      });
      this.scheduleReconnect();
    }
  }

  // Disconnect from messaging socket
  private disconnect(): void {
    if (this.reconnectTimeoutRef) {
      clearTimeout(this.reconnectTimeoutRef);
      this.reconnectTimeoutRef = null;
    }

    if (this.messagingSocket) {
      disconnectSocket('/messaging');
      this.messagingSocket = null;
    }

    this.updateConnectionState({
      isConnected: false,
      isReconnecting: false,
      error: null,
      lastConnected: null,
    });
  }

  // Setup core socket event listeners
  private setupCoreEventListeners(): void {
    if (!this.messagingSocket) return;

    this.messagingSocket.on('connect', () => {
      console.log('✅ [SOCKET-MANAGER] Connected to messaging socket');
      this.reconnectAttempts = 0;
      this.updateConnectionState({
        isConnected: true,
        isReconnecting: false,
        error: null,
        lastConnected: new Date(),
      });
    });

    this.messagingSocket.on('disconnect', (reason) => {
      console.log('❌ [SOCKET-MANAGER] Disconnected from messaging socket:', reason);
      this.updateConnectionState({ 
        isConnected: false, 
        isReconnecting: false 
      });

      // Auto-reconnect on unexpected disconnection if we have subscribers
      if (this.connectionState.subscribers.size > 0 && 
          (reason === 'io server disconnect' || reason === 'transport error')) {
        this.scheduleReconnect();
      }
    });

    this.messagingSocket.on('connect_error', (error) => {
      console.error('🚫 [SOCKET-MANAGER] Connection error:', error);
      this.updateConnectionState({ 
        error: 'Connection error',
        isReconnecting: false 
      });
      if (this.connectionState.subscribers.size > 0) {
        this.scheduleReconnect();
      }
    });
  }

  // Re-attach all event subscriptions to the socket
  private reattachEventSubscriptions(): void {
    if (!this.messagingSocket) return;

    this.eventSubscriptions.forEach((subscriptions, event) => {
      subscriptions.forEach(subscription => {
        this.messagingSocket!.on(event, subscription.callback);
      });
    });
    
    console.log(`🔗 [SOCKET-MANAGER] Re-attached ${this.eventSubscriptions.size} event types`);
  }

  // Schedule reconnection with exponential backoff
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateConnectionState({ 
        error: 'Max reconnection attempts reached' 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 [SOCKET-MANAGER] Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeoutRef = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Update connection state and notify listeners
  private updateConnectionState(updates: Partial<SocketConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    this.notifyStateListeners();
  }

  // Notify all state listeners
  private notifyStateListeners(): void {
    this.stateListeners.forEach(listener => {
      try {
        listener(this.connectionState);
      } catch (error) {
        console.error('Error notifying socket state listener:', error);
      }
    });
  }

  // Get current connection state
  getConnectionState(): SocketConnectionState {
    return { ...this.connectionState };
  }

  // Emit event to socket
  emit(event: string, data: any): void {
    if (this.messagingSocket && this.connectionState.isConnected) {
      this.messagingSocket.emit(event, data);
    } else {
      console.warn(`🚫 [SOCKET-MANAGER] Cannot emit ${event} - socket not connected`);
    }
  }

  // Manual reconnection
  async reconnect(): Promise<void> {
    console.log('🔄 [SOCKET-MANAGER] Manual reconnection requested');
    this.disconnect();
    this.reconnectAttempts = 0;
    if (this.connectionState.subscribers.size > 0) {
      await this.connect();
    }
  }
}

// Export singleton instance
export const socketManager = SocketManager.getInstance();