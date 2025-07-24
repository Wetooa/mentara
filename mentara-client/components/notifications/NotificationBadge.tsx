"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, Wifi, WifiOff } from "lucide-react";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  variant?: "icon" | "counter" | "both";
  size?: "sm" | "md" | "lg";
  showConnectionStatus?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function NotificationBadge({
  variant = "both",
  size = "md",
  showConnectionStatus = false,
  className = "",
  onClick,
  disabled = false,
}: NotificationBadgeProps) {
  return <></>

  const { unreadCount, connectionState } = useNotifications({
    enableRealtime: true,
    enableToasts: false,
  });

  const hasUnread = unreadCount > 0;
  const isConnected = connectionState.isConnected;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const badgeSizeClasses = {
    sm: "h-4 w-4 text-xs",
    md: "h-5 w-5 text-xs",
    lg: "h-6 w-6 text-sm",
  };

  const Component = onClick ? Button : "div";
  const componentProps = onClick
    ? {
      variant: "ghost" as const,
      size: "sm" as const,
      onClick,
      disabled,
      "aria-label": `Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`,
    }
    : {};

  if (variant === "counter") {
    return (
      <Badge
        variant={hasUnread ? "destructive" : "secondary"}
        className={cn(
          "transition-all duration-200",
          hasUnread && "animate-pulse",
          className
        )}
      >
        {unreadCount}
      </Badge>
    );
  }

  return (
    <Component
      {...componentProps}
      className={cn(
        "relative inline-flex items-center justify-center",
        onClick && "hover:bg-gray-100 rounded-md p-2",
        className
      )}
    >
      {/* Bell Icon */}
      {(variant === "icon" || variant === "both") && (
        <>
          {hasUnread ? (
            <BellRing className={cn(sizeClasses[size], "text-blue-600")} />
          ) : (
            <Bell className={cn(sizeClasses[size], "text-gray-600")} />
          )}
        </>
      )}

      {/* Unread Count Badge */}
      {variant === "both" && hasUnread && (
        <Badge
          variant="destructive"
          className={cn(
            "absolute -top-1 -right-1 p-0 flex items-center justify-center min-w-0",
            badgeSizeClasses[size],
            "animate-pulse"
          )}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}

      {/* Connection Status Indicator */}
      {showConnectionStatus && (
        <div className="absolute -bottom-1 -right-1">
          {isConnected ? (
            <Wifi className="h-3 w-3 text-green-500" title="Connected" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-500" title="Disconnected" />
          )}
        </div>
      )}

      {/* Connection Status Indicator (Alternative - Dot) */}
      {showConnectionStatus && (
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white",
            isConnected ? "bg-green-500" : "bg-red-500"
          )}
          title={isConnected ? "Real-time notifications active" : "Notifications offline"}
        />
      )}
    </Component>
  );
}

interface SmartNotificationBadgeProps {
  threshold?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Smart notification badge that adapts its display based on unread count
 */
export function SmartNotificationBadge({
  threshold = 10,
  className = "",
  onClick,
}: SmartNotificationBadgeProps) {
  const { unreadCount, connectionState } = useNotifications({
    enableRealtime: true,
    enableToasts: false,
  });

  // Don't show anything if no unread notifications
  if (unreadCount === 0) {
    return (
      <NotificationBadge
        variant="icon"
        showConnectionStatus={false}
        className={className}
        onClick={onClick}
      />
    );
  }

  // Show counter for low counts
  if (unreadCount <= threshold) {
    return (
      <NotificationBadge
        variant="both"
        showConnectionStatus={!connectionState.isConnected}
        className={className}
        onClick={onClick}
      />
    );
  }

  // Show counter only for high counts
  return (
    <NotificationBadge
      variant="both"
      showConnectionStatus={!connectionState.isConnected}
      className={cn("relative", className)}
      onClick={onClick}
    />
  );
}

interface NotificationStatusIndicatorProps {
  className?: string;
  showText?: boolean;
}

/**
 * Simple connection status indicator for notifications
 */
export function NotificationStatusIndicator({
  className = "",
  showText = false,
}: NotificationStatusIndicatorProps) {
  const { connectionState } = useNotifications({
    enableRealtime: true,
    enableToasts: false,
  });

  const { isConnected, isReconnecting, error } = connectionState;

  if (showText) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-green-500" : isReconnecting ? "bg-yellow-500" : "bg-red-500"
          )}
        />
        <span className="text-muted-foreground">
          {isConnected ? "Live" : isReconnecting ? "Connecting..." : "Offline"}
        </span>
        {error && (
          <span className="text-red-500 text-xs">({error})</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-2 w-2 rounded-full",
        isConnected ? "bg-green-500" : isReconnecting ? "bg-yellow-500 animate-pulse" : "bg-red-500",
        className
      )}
      title={
        isConnected
          ? "Real-time notifications active"
          : isReconnecting
            ? "Connecting to notifications..."
            : `Notifications offline${error ? `: ${error}` : ""}`
      }
    />
  );
}
