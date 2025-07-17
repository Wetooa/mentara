"use client";

import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket, WebSocketMessage } from "./useWebSocket";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();

  const handleWebSocketMessage = useCallback((wsMessage: WebSocketMessage) => {
    const event = wsMessage.data as NotificationEvent;
    
    // Only process notifications for the current user
    if (event.userId !== userId) return;

    switch (event.type) {
      case "notification_created":
        if (event.notification) {
          // Add notification to cache
          queryClient.setQueryData(
            queryKeys.notifications.list(),
            (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                data: [event.notification, ...(oldData.data || [])],
              };
            }
          );

          // Update unread count
          queryClient.setQueryData(
            queryKeys.notifications.unreadCount(),
            (oldCount: number = 0) => oldCount + 1
          );

          // Show toast notification
          if (enableToasts && (!toastFilter || toastFilter(event.notification))) {
            const notif = event.notification;
            
            switch (notif.priority) {
              case "urgent":
                toast.error(notif.title, {
                  description: notif.message,
                  duration: 10000,
                  action: notif.actionUrl ? {
                    label: notif.actionText || "View",
                    onClick: () => window.open(notif.actionUrl, "_blank"),
                  } : undefined,
                });
                break;
              case "high":
                toast.warning(notif.title, {
                  description: notif.message,
                  duration: 7000,
                  action: notif.actionUrl ? {
                    label: notif.actionText || "View",
                    onClick: () => window.open(notif.actionUrl, "_blank"),
                  } : undefined,
                });
                break;
              default:
                toast.info(notif.title, {
                  description: notif.message,
                  duration: 5000,
                  action: notif.actionUrl ? {
                    label: notif.actionText || "View",
                    onClick: () => window.open(notif.actionUrl, "_blank"),
                  } : undefined,
                });
            }
          }

          // Show browser notification
          if (enableBrowserNotifications && "Notification" in window && Notification.permission === "granted") {
            new Notification(event.notification.title, {
              body: event.notification.message,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              tag: event.notification.id,
              requireInteraction: event.notification.priority === "urgent",
            });
          }
        }
        break;

      case "notification_updated":
        if (event.notification) {
          // Update notification in cache
          queryClient.setQueryData(
            queryKeys.notifications.list(),
            (oldData: any) => {
              if (!oldData?.data) return oldData;
              return {
                ...oldData,
                data: oldData.data.map((notif: Notification) =>
                  notif.id === event.notification!.id ? event.notification : notif
                ),
              };
            }
          );
        }
        break;

      case "notification_deleted":
        if (event.notificationId) {
          // Remove notification from cache
          queryClient.setQueryData(
            queryKeys.notifications.list(),
            (oldData: any) => {
              if (!oldData?.data) return oldData;
              const notification = oldData.data.find((n: Notification) => n.id === event.notificationId);
              const newData = oldData.data.filter((n: Notification) => n.id !== event.notificationId);
              
              // Update unread count if notification was unread
              if (notification && !notification.isRead) {
                queryClient.setQueryData(
                  queryKeys.notifications.unreadCount(),
                  (oldCount: number = 0) => Math.max(0, oldCount - 1)
                );
              }
              
              return {
                ...oldData,
                data: newData,
              };
            }
          );
        }
        break;

      case "notification_read_all":
        // Mark all notifications as read
        queryClient.setQueryData(
          queryKeys.notifications.list(),
          (oldData: any) => {
            if (!oldData?.data) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((notif: Notification) => ({
                ...notif,
                isRead: true,
              })),
            };
          }
        );

        // Reset unread count
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount(),
          0
        );
        break;
    }
  }, [queryClient, userId, enableToasts, enableBrowserNotifications, toastFilter]);

  const webSocket = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
    enableLogging: process.env.NODE_ENV === "development",
    autoReconnect: true,
    heartbeatInterval: 30000,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      // Subscribe to notifications for this user
      webSocket.sendMessage({
        type: "subscribe_notifications",
        data: { userId },
      });
    },
  });

  // Request browser notification permission on mount
  useEffect(() => {
    if (enableBrowserNotifications && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [enableBrowserNotifications]);

  // Subscribe to notifications when connected
  useEffect(() => {
    if (webSocket.isConnected) {
      webSocket.sendMessage({
        type: "subscribe_notifications",
        data: { userId },
      });

      return () => {
        webSocket.sendMessage({
          type: "unsubscribe_notifications",
          data: { userId },
        });
      };
    }
  }, [webSocket.isConnected, userId, webSocket]);

  const markAsRead = useCallback((notificationId: string) => {
    webSocket.sendMessage({
      type: "mark_notification_read",
      data: { notificationId, userId },
    });
  }, [userId, webSocket]);

  const markAllAsRead = useCallback(() => {
    webSocket.sendMessage({
      type: "mark_all_notifications_read",
      data: { userId },
    });
  }, [userId, webSocket]);

  const deleteNotification = useCallback((notificationId: string) => {
    webSocket.sendMessage({
      type: "delete_notification",
      data: { notificationId, userId },
    });
  }, [userId, webSocket]);

  return {
    // Connection state
    isConnected: webSocket.isConnected,
    isConnecting: webSocket.isConnecting,
    connectionState: webSocket.connectionState,
    lastError: webSocket.lastError,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reconnect: webSocket.reconnect,
  };
}