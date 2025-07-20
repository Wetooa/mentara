"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  enableHeartbeat?: boolean;
  enableLogging?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  autoReconnect?: boolean;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: "connecting" | "connected" | "disconnected" | "error";
  lastError: string | null;
  reconnectAttempts: number;
  lastHeartbeat: number | null;
}

export function useWebSocket(config: WebSocketConfig) {
  const {
    url,
    protocols,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
    enableHeartbeat = true,
    enableLogging = false,
    onConnect,
    onDisconnect,
    onError,
    onMessage,
    autoReconnect = true,
  } = config;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    connectionState: "disconnected",
    lastError: null,
    reconnectAttempts: 0,
    lastHeartbeat: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const log = useCallback((message: string, ...args: any[]) => {
    if (enableLogging) {
      console.log(`[WebSocket] ${message}`, ...args);
    }
  }, [enableLogging]);

  const startHeartbeat = useCallback(() => {
    if (!enableHeartbeat || !wsRef.current) return;

    const sendHeartbeat = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const heartbeatMessage: WebSocketMessage = {
          type: "heartbeat",
          data: { timestamp: Date.now() },
          timestamp: new Date().toISOString(),
        };
        
        wsRef.current.send(JSON.stringify(heartbeatMessage));
        
        setState(prev => ({ ...prev, lastHeartbeat: Date.now() }));
        
        heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, heartbeatInterval);
      }
    };

    heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, heartbeatInterval);
  }, [enableHeartbeat, heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log("Already connected");
      return;
    }

    log("Connecting to", url);
    
    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      connectionState: "connecting",
      lastError: null,
    }));

    try {
      wsRef.current = new WebSocket(url, protocols);

      wsRef.current.onopen = () => {
        log("Connected successfully");
        
        reconnectAttemptsRef.current = 0;
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          connectionState: "connected",
          reconnectAttempts: 0,
          lastError: null,
        }));

        startHeartbeat();
        onConnect?.();
      };

      wsRef.current.onclose = (event) => {
        log("Connection closed", event.code, event.reason);
        
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionState: "disconnected",
        }));

        stopHeartbeat();
        onDisconnect?.();

        // Auto-reconnect if enabled and not a normal closure
        if (autoReconnect && event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          
          log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          setState(prev => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current,
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          log("Max reconnection attempts reached");
          toast.error("Connection lost. Please refresh the page.");
        }
      };

      wsRef.current.onerror = (error) => {
        log("Connection error", error);
        
        setState(prev => ({
          ...prev,
          connectionState: "error",
          lastError: "Connection error occurred",
        }));

        onError?.(error);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          log("Received message", message.type, message);

          // Handle heartbeat response
          if (message.type === "heartbeat") {
            setState(prev => ({ ...prev, lastHeartbeat: Date.now() }));
            return;
          }

          onMessage?.(message);
        } catch (error) {
          log("Failed to parse message", error);
        }
      };
    } catch (error) {
      log("Failed to create WebSocket connection", error);
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionState: "error",
        lastError: "Failed to establish connection",
      }));
    }
  }, [url, protocols, onConnect, onDisconnect, onError, onMessage, autoReconnect, maxReconnectAttempts, reconnectInterval, startHeartbeat, stopHeartbeat, log]);

  const disconnect = useCallback(() => {
    log("Disconnecting");
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionState: "disconnected",
      reconnectAttempts: 0,
    }));

    reconnectAttemptsRef.current = 0;
  }, [stopHeartbeat, log]);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, "timestamp">) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
      };
      
      wsRef.current.send(JSON.stringify(fullMessage));
      log("Sent message", message.type, fullMessage);
      return true;
    } else {
      log("Cannot send message - not connected");
      toast.error("Not connected to server");
      return false;
    }
  }, [log]);

  const reconnect = useCallback(() => {
    log("Manual reconnect requested");
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect, log]);

  // Initial connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopHeartbeat();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [stopHeartbeat]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    sendMessage,
  };
}