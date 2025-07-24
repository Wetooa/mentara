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
import { useMessagingWebSocket } from "@/hooks/messaging/useWebSocket";

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
  onDismissError?: () => void;
}

/**
 * Simplified ConnectionStatus component using WebSocket Context
 * Shows current websocket connection state and provides reconnection controls
 */
export default function ConnectionStatus({ 
  className,
  showDetails = false,
  onDismissError 
}: ConnectionStatusProps) {
  const { 
    isConnected, 
    connectionState,
    error,
    connect 
  } = useMessagingWebSocket();

  const [isReconnecting, setIsReconnecting] = React.useState(false);
  const [showError, setShowError] = React.useState(true);

  const handleReconnect = async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Manual reconnect failed:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleDismissError = () => {
    setShowError(false);
    onDismissError?.();
  };

  const getConnectionColor = () => {
    if (connectionState.isConnecting || isReconnecting) return "text-yellow-500";
    if (connectionState.isConnected) return "text-green-500";
    return "text-red-500";
  };

  const getConnectionIcon = () => {
    if (connectionState.isConnecting || isReconnecting) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (connectionState.isConnected) {
      return <Wifi className="h-4 w-4" />;
    }
    return <WifiOff className="h-4 w-4" />;
  };

  const getConnectionText = () => {
    if (isReconnecting) return "Reconnecting...";
    if (connectionState.isConnecting) return "Connecting...";
    if (connectionState.isConnected) return "Connected";
    return "Disconnected";
  };

  const getConnectionStatus = () => {
    if (connectionState.isConnecting || isReconnecting) return "connecting";
    if (connectionState.isConnected) return "connected";
    return "disconnected";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Connection Indicator */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  scale: connectionState.isConnected ? [1, 1.1, 1] : 1,
                  opacity: connectionState.isConnected ? 1 : 0.7
                }}
                transition={{ 
                  duration: connectionState.isConnected ? 2 : 0.3,
                  repeat: connectionState.isConnected ? Infinity : 0,
                  repeatType: "reverse"
                }}
                className={cn("flex items-center", getConnectionColor())}
              >
                {getConnectionIcon()}
              </motion.div>
              
              {showDetails && (
                <Badge 
                  variant={connectionState.isConnected ? "default" : "destructive"}
                  className="text-xs"
                >
                  {getConnectionText()}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div>Status: {getConnectionText()}</div>
              {connectionState.lastConnected && (
                <div className="text-xs text-muted-foreground">
                  Last connected: {connectionState.lastConnected.toLocaleTimeString()}
                </div>
              )}
              {error && (
                <div className="text-xs text-red-400 mt-1">
                  Error: {error}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Reconnect Button */}
      {!connectionState.isConnected && !connectionState.isConnecting && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReconnect}
          disabled={isReconnecting}
          className="h-8 px-2"
        >
          <RefreshCw className={cn("h-3 w-3", isReconnecting && "animate-spin")} />
          {showDetails && <span className="ml-1">Reconnect</span>}
        </Button>
      )}

      {/* Error Alert */}
      <AnimatePresence>
        {error && showError && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="flex-1">
                  Connection error: {error}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissError}
                  className="h-auto p-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}