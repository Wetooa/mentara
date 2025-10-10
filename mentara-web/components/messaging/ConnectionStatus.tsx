"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
  onReconnect?: () => void;
  className?: string;
  showDetails?: boolean;
}

interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export function ConnectionStatus({
  isConnected,
  isReconnecting,
  error,
  lastConnected,
  onReconnect,
  className,
  showDetails = false,
}: ConnectionStatusProps) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({ online: true });
  const [showDetails_internal, setShowDetails] = useState(false);

  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      });

      if (navigator.onLine) {
        logger.network.online();
      } else {
        logger.network.offline();
      }
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  const getStatusInfo = () => {
    if (!networkStatus.online) {
      return {
        icon: WifiOff,
        label: "Offline",
        variant: "destructive" as const,
        description: "No internet connection",
        color: "text-red-500",
        bgColor: "bg-red-50 border-red-200",
      };
    }

    if (error) {
      return {
        icon: AlertTriangle,
        label: "Error",
        variant: "destructive" as const,
        description: error,
        color: "text-red-500",
        bgColor: "bg-red-50 border-red-200",
      };
    }

    if (isReconnecting) {
      return {
        icon: RefreshCw,
        label: "Reconnecting",
        variant: "secondary" as const,
        description: "Attempting to reconnect...",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50 border-yellow-200",
      };
    }

    if (isConnected) {
      return {
        icon: CheckCircle2,
        label: "Connected",
        variant: "default" as const,
        description: "Real-time connection active",
        color: "text-green-500",
        bgColor: "bg-green-50 border-green-200",
      };
    }

    return {
      icon: Clock,
      label: "Connecting",
      variant: "secondary" as const,
      description: "Establishing connection...",
      color: "text-gray-500",
      bgColor: "bg-gray-50 border-gray-200",
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  const formatLastConnected = (date: Date | null) => {
    if (!date) return "Never";
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleString();
  };

  const getNetworkQuality = () => {
    if (!networkStatus.online) return "Offline";
    if (networkStatus.effectiveType === "4g") return "Excellent";
    if (networkStatus.effectiveType === "3g") return "Good";
    if (networkStatus.effectiveType === "2g") return "Poor";
    return "Unknown";
  };

  const ConnectionIndicator = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={status.variant} 
            className={cn(
              "flex items-center gap-1 text-xs font-medium cursor-pointer",
              "transition-all duration-200 hover:scale-105",
              className
            )}
            onClick={() => setShowDetails(!showDetails_internal)}
          >
            <StatusIcon 
              className={cn(
                "w-3 h-3",
                isReconnecting && "animate-spin",
                status.color
              )} 
            />
            {showDetails && (
              <span className="hidden sm:inline">{status.label}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status.description}</p>
          {lastConnected && (
            <p className="text-xs opacity-75">
              Last connected: {formatLastConnected(lastConnected)}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const DetailedStatus = () => (
    <div className={cn("p-4 rounded-lg border", status.bgColor)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("w-4 h-4", status.color)} />
            <h4 className="font-medium">{status.label}</h4>
          </div>
          <p className="text-sm text-gray-600">{status.description}</p>
          
          {lastConnected && (
            <p className="text-xs text-gray-500">
              Last connected: {formatLastConnected(lastConnected)}
            </p>
          )}

          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span>Network: {getNetworkQuality()}</span>
              {networkStatus.effectiveType && (
                <span>({networkStatus.effectiveType.toUpperCase()})</span>
              )}
            </div>
            
            {networkStatus.downlink && (
              <div className="ml-5">
                Speed: ~{networkStatus.downlink} Mbps
              </div>
            )}
            
            {networkStatus.rtt && (
              <div className="ml-5">
                Latency: ~{networkStatus.rtt}ms
              </div>
            )}
          </div>
        </div>

        {(error || !isConnected) && onReconnect && (
          <Button
            size="sm"
            variant="outline"
            onClick={onReconnect}
            disabled={isReconnecting}
            className="flex items-center gap-1"
          >
            <RefreshCw 
              className={cn(
                "w-3 h-3",
                isReconnecting && "animate-spin"
              )} 
            />
            Retry
          </Button>
        )}
      </div>
    </div>
  );

  if (showDetails) {
    return <DetailedStatus />;
  }

  return (
    <Popover open={showDetails_internal} onOpenChange={setShowDetails}>
      <PopoverTrigger asChild>
        <div>
          <ConnectionIndicator />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <DetailedStatus />
      </PopoverContent>
    </Popover>
  );
}

// Simplified status indicator for minimal UI contexts
export function ConnectionStatusIndicator({
  isConnected,
  isReconnecting,
  error,
  className,
}: Pick<ConnectionStatusProps, 'isConnected' | 'isReconnecting' | 'error' | 'className'>) {
  const getColor = () => {
    if (error) return "text-red-500";
    if (isReconnecting) return "text-yellow-500";
    if (isConnected) return "text-green-500";
    return "text-gray-400";
  };

  const getIcon = () => {
    if (error) return AlertTriangle;
    if (isReconnecting) return RefreshCw;
    if (isConnected) return Wifi;
    return WifiOff;
  };

  const Icon = getIcon();

  return (
    <Icon 
      className={cn(
        "w-4 h-4",
        getColor(),
        isReconnecting && "animate-spin",
        className
      )} 
    />
  );
}

export default ConnectionStatus;