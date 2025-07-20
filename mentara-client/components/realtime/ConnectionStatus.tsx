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
  const getStatusIcon = () => {
    if (isConnecting) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    switch (connectionState) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />;
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
        return "Connected";
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
  // This would typically connect to a global WebSocket context
  // For now, return mock data
  return {
    isConnected: true,
    isConnecting: false,
    connectionState: "connected" as const,
    lastError: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    lastHeartbeat: Date.now(),
    reconnect: () => console.log("Reconnecting..."),
  };
}