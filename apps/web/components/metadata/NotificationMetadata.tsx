"use client";

import { useEffect } from "react";
import { useNotificationMetadata, useDashboardNotificationMetadata, useMessagingNotificationMetadata } from "@/hooks/useNotificationMetadata";

interface NotificationMetadataProps {
  /**
   * Type of page for predefined notification behavior
   */
  pageType?: "dashboard" | "messaging" | "custom";
  
  /**
   * User role for dashboard pages
   */
  role?: "client" | "therapist" | "admin" | "moderator";
  
  /**
   * Custom base title for the page
   */
  baseTitle?: string;
  
  /**
   * Whether to update the favicon with notification indicators
   */
  updateFavicon?: boolean;
  
  /**
   * Whether to update the page title with notification counts
   */
  updatePageTitle?: boolean;
  
  /**
   * Custom notification count display format
   */
  formatNotificationCount?: (count: number) => string;
  
  /**
   * Callback when notification data changes
   */
  onNotificationChange?: (data: { unreadCount: number; hasUrgent: boolean }) => void;
  
  /**
   * Whether notifications are enabled for this page
   */
  enabled?: boolean;
}

/**
 * Component that enhances page metadata with real-time notification data
 * Should be placed in layout or page components to automatically update
 * page title and favicon based on notification status
 */
export function NotificationMetadata({
  pageType = "custom",
  role,
  baseTitle,
  updateFavicon = true,
  updatePageTitle = true,
  formatNotificationCount,
  onNotificationChange,
  enabled = true,
}: NotificationMetadataProps) {
  // Choose appropriate hook based on page type
  const dashboardHook = useDashboardNotificationMetadata(role || "client");
  const messagingHook = useMessagingNotificationMetadata();
  const customHook = useNotificationMetadata({
    baseTitle,
    updateFavicon,
    updatePageTitle,
    enabled,
  });

  // Select the appropriate hook result
  const hookResult = pageType === "dashboard" && role 
    ? dashboardHook
    : pageType === "messaging"
    ? messagingHook
    : customHook;

  const { notificationData, updateTitle } = hookResult;

  // Handle custom notification count formatting
  useEffect(() => {
    if (notificationData && formatNotificationCount && updatePageTitle) {
      const customCount = formatNotificationCount(notificationData.unreadCount);
      if (baseTitle) {
        const customTitle = notificationData.unreadCount > 0 
          ? `${customCount} ${baseTitle}`
          : baseTitle;
        updateTitle(customTitle);
      }
    }
  }, [notificationData, formatNotificationCount, baseTitle, updateTitle, updatePageTitle]);

  // Notify parent component of notification changes
  useEffect(() => {
    if (notificationData && onNotificationChange) {
      onNotificationChange({
        unreadCount: notificationData.unreadCount,
        hasUrgent: notificationData.hasUrgent,
      });
    }
  }, [notificationData, onNotificationChange]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Specialized component for dashboard pages
 */
export function DashboardNotificationMetadata({
  role,
  onNotificationChange,
}: {
  role: "client" | "therapist" | "admin" | "moderator";
  onNotificationChange?: (data: { unreadCount: number; hasUrgent: boolean }) => void;
}) {
  return (
    <NotificationMetadata
      pageType="dashboard"
      role={role}
      onNotificationChange={onNotificationChange}
    />
  );
}

/**
 * Specialized component for messaging pages
 */
export function MessagingNotificationMetadata({
  onNotificationChange,
}: {
  onNotificationChange?: (data: { unreadCount: number; hasUrgent: boolean }) => void;
}) {
  return (
    <NotificationMetadata
      pageType="messaging"
      onNotificationChange={onNotificationChange}
    />
  );
}

/**
 * Higher-order component that wraps pages with notification metadata
 */
export function withNotificationMetadata<P extends object>(
  Component: React.ComponentType<P>,
  options: NotificationMetadataProps = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <>
        <NotificationMetadata {...options} />
        <Component {...props} />
      </>
    );
  };
}

/**
 * Hook to get current notification metadata state without side effects
 */
export function useNotificationMetadataState() {
  const { notificationData, isLoading, error } = useNotificationMetadata({
    updateFavicon: false,
    updatePageTitle: false,
  });

  return {
    unreadCount: notificationData?.unreadCount || 0,
    hasUrgentNotifications: notificationData?.hasUrgent || false,
    latestNotificationType: notificationData?.latestType,
    isLoading,
    error,
  };
}