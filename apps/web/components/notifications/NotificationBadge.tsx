"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";
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
  const { unreadCount } = useNotifications({
    enableToasts: false,
  });

  const hasUnread = unreadCount > 0;

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

      {/* Connection Status Indicator - Always shows active for polling */}
      {showConnectionStatus && (
        <div className="absolute -bottom-1 -right-1">
          <div
            className="h-2 w-2 rounded-full border border-white bg-green-500"
            title="Polling active (updates every 10s)"
          />
        </div>
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
  const { unreadCount } = useNotifications({
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
        showConnectionStatus={false}
        className={className}
        onClick={onClick}
      />
    );
  }

  // Show counter only for high counts
  return (
    <NotificationBadge
      variant="both"
      showConnectionStatus={false}
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
 * Simple polling status indicator for notifications
 */
export function NotificationStatusIndicator({
  className = "",
  showText = false,
}: NotificationStatusIndicatorProps) {
  const { pollingStatus } = useNotifications({
    enableToasts: false,
  });

  const isPolling = pollingStatus?.isPolling ?? false;

  if (showText) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            isPolling ? "bg-blue-500 animate-pulse" : "bg-green-500"
          )}
        />
        <span className="text-muted-foreground">
          {isPolling ? "Polling..." : "Polling every 10s"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-2 w-2 rounded-full",
        isPolling ? "bg-blue-500 animate-pulse" : "bg-green-500",
        className
      )}
      title="Polling active (updates every 10s)"
    />
  );
}
