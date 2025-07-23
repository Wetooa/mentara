"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: "connecting" | "connected" | "disconnected" | "error";
  lastError?: string | null;
  reconnectAttempts?: number;
  maxReconnectAttempts?: number;
  lastHeartbeat?: number | null;
  onReconnect?: () => void;
  onDismissError?: () => void;
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
  position?: "fixed" | "relative";
}

export function ConnectionStatus({
  isConnected,
  isConnecting,
  connectionState,
  lastError,
  reconnectAttempts = 0,
  maxReconnectAttempts = 5,
  lastHeartbeat,
  onReconnect,
  onDismissError,
  className,
  showDetails = false,
  compact = false,
  position = "relative",
}: ConnectionStatusProps) {
  const getSignalStrength = () => {
    if (!isConnected || !lastHeartbeat) return 0;
    
    const timeSinceHeartbeat = Date.now() - lastHeartbeat;
    
    // Signal strength based on heartbeat freshness
    if (timeSinceHeartbeat < 30000) return 3; // Excellent (< 30s)
    if (timeSinceHeartbeat < 60000) return 2; // Good (30s-60s)
    if (timeSinceHeartbeat < 120000) return 1; // Poor (60s-120s)
    return 0; // Very poor (> 120s)
  };

  const getStatusIcon = () => {
    if (isConnecting) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    switch (connectionState) {
      case "connected":
        const signalStrength = getSignalStrength();
        if (signalStrength >= 3) {
          return <Wifi className="h-4 w-4 text-green-500" />; // Excellent signal
        } else if (signalStrength === 2) {
          return <Wifi className="h-4 w-4 text-yellow-500" />; // Good signal  
        } else if (signalStrength === 1) {
          return <Wifi className="h-4 w-4 text-orange-500" />; // Poor signal
        } else {
          return <Wifi className="h-4 w-4 text-red-400" />; // Very poor signal
        }
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "disconnected":
        return <WifiOff className="h-4 w-4 text-gray-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (isConnecting) {
      return reconnectAttempts > 0 
        ? `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`
        : "Connecting...";
    }
    
    switch (connectionState) {
      case "connected":
        const signalStrength = getSignalStrength();
        const signalLabels = ["Very Poor", "Poor", "Good", "Excellent"];
        return `Connected (${signalLabels[signalStrength]} Signal)`;
      case "error":
        return lastError || "Connection error";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = () => {
    if (isConnecting) return "text-blue-600";
    
    switch (connectionState) {
      case "connected":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "disconnected":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getBadgeVariant = () => {
    switch (connectionState) {
      case "connected":
        return "default";
      case "error":
        return "destructive";
      case "disconnected":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const shouldShowReconnectButton = () => {
    return (connectionState === "error" || connectionState === "disconnected") && 
           !isConnecting && 
           onReconnect;
  };

  const getHeartbeatStatus = () => {
    if (!lastHeartbeat || !isConnected) return null;
    
    const timeSinceHeartbeat = Date.now() - lastHeartbeat;
    const isStale = timeSinceHeartbeat > 60000; // 1 minute
    
    return {
      isStale,
      timeAgo: Math.floor(timeSinceHeartbeat / 1000),
    };
  };

  const heartbeatStatus = getHeartbeatStatus();

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              {getStatusIcon()}
              {showDetails && (
                <span className={cn("text-xs", getStatusColor())}>
                  {getStatusText()}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{getStatusText()}</p>
              {heartbeatStatus && (
                <p className="text-xs">
                  Last heartbeat: {heartbeatStatus.timeAgo}s ago
                  {heartbeatStatus.isStale && " (stale)"}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn(
      className,
      position === "fixed" && "fixed bottom-4 right-4 z-50"
    )}>
      <AnimatePresence>
        {/* Connection Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full max-w-sm"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Real-time Connection</span>
                      <Badge variant={getBadgeVariant()}>
                        {getStatusText()}
                      </Badge>
                    </div>
                    {showDetails && heartbeatStatus && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last heartbeat: {heartbeatStatus.timeAgo}s ago
                        {heartbeatStatus.isStale && (
                          <span className="text-yellow-600 ml-1">(stale)</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {shouldShowReconnectButton() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onReconnect}
                      className="h-8"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                  
                  {onDismissError && connectionState === "error" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDismissError}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Alert */}
        {connectionState === "error" && lastError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {lastError}
                {reconnectAttempts >= maxReconnectAttempts && (
                  <span className="block mt-1 text-xs">
                    Max retry attempts reached. Please refresh the page or check your connection.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Reconnection Progress */}
        {isConnecting && reconnectAttempts > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Attempting to reconnect ({reconnectAttempts}/{maxReconnectAttempts})...
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Global connection status hook for easy usage
export function useGlobalConnectionStatus() {
  const [connectionState, setConnectionState] = React.useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [lastError, setLastError] = React.useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = React.useState(0);
  const [lastHeartbeat, setLastHeartbeat] = React.useState<number | null>(null);
  const socketRef = React.useRef<any>(null);
  const heartbeatIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Helper function to get token from localStorage (client-side only)
  const getAuthToken = React.useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.warn('Failed to retrieve auth token from localStorage:', error);
      return null;
    }
  }, []);

  // Import socket functions dynamically to avoid SSR issues
  const initializeSocket = React.useCallback(async () => {
    try {
      const { getSocket, connectSocket, isSocketConnected } = await import('@/lib/websocket');
      
      // Check if already connected
      if (isSocketConnected()) {
        setConnectionState("connected");
        setLastHeartbeat(Date.now());
        return;
      }

      // Get authentication token
      const token = getAuthToken();
      if (!token) {
        setConnectionState("error");
        setLastError('Authentication token not found. Please sign in again.');
        return;
      }

      setIsConnecting(true);
      setConnectionState("connecting");
      
      const socket = getSocket();
      socketRef.current = socket;

      // Set up connection event listeners
      socket.on('connect', () => {
        console.log('✅ WebSocket connected successfully');
        setConnectionState("connected");
        setIsConnecting(false);
        setLastError(null);
        setReconnectAttempts(0);
        setLastHeartbeat(Date.now());
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
        setConnectionState("disconnected");
        setIsConnecting(false);
        if (reason === 'io server disconnect') {
          setLastError('Server disconnected');
        } else if (reason === 'io client disconnect') {
          // Client-initiated disconnect, not an error
          setLastError(null);
        } else {
          setLastError(`Disconnected: ${reason}`);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        setConnectionState("error");
        setIsConnecting(false);
        
        // Provide more specific error messages
        let errorMessage = 'Connection failed';
        if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = 'Connection timeout. Please check your network.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setLastError(errorMessage);
        setReconnectAttempts(prev => prev + 1);
      });

      socket.on('auth_error', (data) => {
        console.error('🔒 WebSocket authentication error:', data);
        setConnectionState("error");
        setIsConnecting(false);
        setLastError(data.message || 'Authentication failed');
      });

      // Set up heartbeat monitoring
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      heartbeatIntervalRef.current = setInterval(() => {
        if (socket.connected) {
          setLastHeartbeat(Date.now());
        }
      }, 30000); // Update heartbeat every 30 seconds

      // Connect the socket with authentication token
      console.log('🔄 Initiating WebSocket connection with authentication...');
      await connectSocket(undefined, token);
      
    } catch (error) {
      console.error('💥 Failed to initialize WebSocket connection:', error);
      setConnectionState("error");
      setIsConnecting(false);
      setLastError('Failed to initialize socket connection');
    }
  }, [getAuthToken]);

  const reconnect = React.useCallback(async () => {
    if (isConnecting) return;
    
    console.log('🔄 Attempting to reconnect WebSocket...');
    setIsConnecting(true);
    setLastError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setConnectionState("error");
        setIsConnecting(false);
        setLastError('Authentication token not found. Please sign in again.');
        return;
      }

      const { connectSocket } = await import('@/lib/websocket');
      await connectSocket(undefined, token);
    } catch (error) {
      console.error('❌ WebSocket reconnection failed:', error);
      setConnectionState("error");
      setIsConnecting(false);
      
      let errorMessage = 'Reconnection failed';
      if (error instanceof Error) {
        if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setLastError(errorMessage);
      setReconnectAttempts(prev => prev + 1);
    }
  }, [isConnecting, getAuthToken]);

  // Initialize socket connection on mount
  React.useEffect(() => {
    // Only initialize on client-side
    if (typeof window !== 'undefined') {
      // Small delay to ensure auth context is ready  
      const timer = setTimeout(() => {
        initializeSocket();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      };
    }
  }, [initializeSocket]);

  return {
    isConnected: connectionState === "connected",
    isConnecting,
    connectionState,
    lastError,
    reconnectAttempts,
    maxReconnectAttempts: 5,
    lastHeartbeat,
    reconnect,
  };
}