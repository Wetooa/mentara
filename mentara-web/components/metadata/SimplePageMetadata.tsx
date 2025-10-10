"use client";

import React from "react";
import { useSimplePageMetadata } from "@/hooks/useSimplePageMetadata";

interface SimplePageMetadataProps {
  /**
   * The page name to display in the title format: "Mentara | [pageName]"
   */
  pageName: string;
  
  /**
   * Whether to enable the metadata functionality
   */
  enabled?: boolean;
  
  /**
   * Callback when notification status changes
   */
  onNotificationChange?: (data: { hasNotifications: boolean; unreadCount: number }) => void;
}

/**
 * Simplified component for managing page metadata
 * - Sets page title to "Mentara | [pageName]" format
 * - Shows original favicon with green dot overlay when notifications exist
 * - Replaces the complex NotificationMetadata system
 */
export function SimplePageMetadata({
  pageName,
  enabled = true,
  onNotificationChange,
}: SimplePageMetadataProps) {
  const { hasNotifications, unreadCount } = useSimplePageMetadata({
    pageName,
    enabled,
  });

  // Notify parent component of notification changes
  React.useEffect(() => {
    if (onNotificationChange && enabled) {
      onNotificationChange({
        hasNotifications,
        unreadCount,
      });
    }
  }, [hasNotifications, unreadCount, onNotificationChange, enabled]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Specialized component for dashboard pages with role-specific naming
 */
export function DashboardPageMetadata({
  role,
  onNotificationChange,
}: {
  role: "client" | "therapist" | "admin" | "moderator";
  onNotificationChange?: (data: { hasNotifications: boolean; unreadCount: number }) => void;
}) {
  const pageNames = {
    client: "Dashboard",
    therapist: "Portal",
    admin: "Admin",
    moderator: "Moderator",
  };

  return (
    <SimplePageMetadata
      pageName={pageNames[role]}
      onNotificationChange={onNotificationChange}
    />
  );
}

/**
 * Hook to get current notification state without side effects
 * Replaces the complex useNotificationMetadataState
 */
export function useSimpleNotificationState() {
  const { hasNotifications, unreadCount, isLoading, error } = useSimplePageMetadata({
    pageName: "temp", // Not used since we're not updating title
    enabled: true,
  });

  return {
    hasNotifications,
    unreadCount,
    isLoading,
    error,
  };
}