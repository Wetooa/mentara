"use client";

import { useCallback } from "react";
import { useRealTimeEvents } from "../useRealTimeEvents";

interface Notification {
  id: string;
  title: string;
  message: string;
  category?: "message" | "community" | "billing" | "therapy" | "system";
  priority?: "urgent" | "high" | "medium" | "low";
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  userId: string;
}

interface NotificationEvent {
  type: "notification_created" | "notification_updated" | "notification_deleted" | "notification_read_all";
  notification?: Notification;
  notificationId?: string;
  userId: string;
}

interface UseRealTimeNotificationsConfig {
  userId: string;
  enableToasts?: boolean;
  enableBrowserNotifications?: boolean;
  toastFilter?: (notification: Notification) => boolean;
}

export function useRealTimeNotifications({
  userId,
  enableToasts = true,
  enableBrowserNotifications = true,
  toastFilter,
}: UseRealTimeNotificationsConfig) {
  // Use the new standardized real-time events system
  const realTimeEvents = useRealTimeEvents({
    namespace: "/messaging",
    enableToasts,
    enableBrowserNotifications,
    subscriptions: [`notifications:${userId}`],
    toastFilter: toastFilter ? (event) => {
      if (event.type.startsWith("notification_") && event.data) {
        return toastFilter(event.data as Notification);
      }
      return true;
    } : undefined,
  });

  // All notification event handling is now done by the RealTimeEventManager
  // This provides a much cleaner and more maintainable approach

  const markAsRead = useCallback((notificationId: string) => {
    realTimeEvents.sendMessage("mark_notification_read", {
      notificationId,
      userId,
    });
  }, [userId, realTimeEvents]);

  const markAllAsRead = useCallback(() => {
    realTimeEvents.sendMessage("mark_all_notifications_read", {
      userId,
    });
  }, [userId, realTimeEvents]);

  const deleteNotification = useCallback((notificationId: string) => {
    realTimeEvents.sendMessage("delete_notification", {
      notificationId,
      userId,
    });
  }, [userId, realTimeEvents]);

  return {
    // Connection state (using standardized real-time events)
    isConnected: realTimeEvents.isConnected,
    isConnecting: !realTimeEvents.isConnected,
    connectionState: realTimeEvents.isConnected ? 'connected' : 'disconnected',
    lastError: null, // TODO: Get error from standardized system
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reconnect: realTimeEvents.connect,
    
    // Standardized real-time events access
    realTimeEvents,
  };
}