import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSocketConnection } from "../useSocketConnection";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
  category?: "message" | "community" | "billing" | "therapy" | "system";
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  actionText?: string;
}

interface NotificationWebSocketEvent {
  type:
    | "notification"
    | "notification_read"
    | "notification_deleted"
    | "unread_count_updated";
  data: any;
}

// Using centralized socket connection via useSocketConnection

/**
 * Enhanced hook for managing user notifications with real-time WebSocket support
 */
export function useNotifications(
  params: {
    limit?: number;
    offset?: number;
    isRead?: boolean;
    enableRealtime?: boolean;
    enableToasts?: boolean;
  } = {}
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Configuration with defaults
  const config = {
    enableRealtime: true,
    enableToasts: true,
    ...params,
  };

  // Use centralized socket connection
  const {
    connectionState,
    isConnected,
    isHealthy,
    subscribeToEvent,
    reconnect: reconnectWebSocket,
  } = useSocketConnection({
    subscriberId: 'notifications',
    enableRealtime: config.enableRealtime,
    enableHeartbeat: true,
    enableTabVisibilityHandling: true,
  });

  // Get notifications
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", "list", params],
    queryFn: () => api.notifications.getMy(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get unread count
  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: () => api.notifications.getUnreadCount(),
    staleTime: 1000 * 30, // 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.notifications.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to mark notification as read");
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.notifications.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to delete notification");
    },
  });

  // WebSocket event subscriptions using centralized socket connection
  useEffect(() => {
    if (!config.enableRealtime || !user) return;

    console.log("🔔 Setting up notification event subscriptions");

    // Subscribe to notification events
    const unsubscribeNotification = subscribeToEvent("notification", (data) => {
      handleWebSocketEvent({ type: "notification", data });
    });

    const unsubscribeUnreadCount = subscribeToEvent("unreadCount", (data) => {
      handleWebSocketEvent({ type: "unread_count_updated", data });
    });

    // Join user room for notifications when connected
    if (isConnected && user?.id) {
      console.log("🏠 Joining user room for notifications:", user.id);
      // Note: emit will be handled by centralized socket manager
    }

    return () => {
      console.log("🔔 Cleaning up notification event subscriptions");
      unsubscribeNotification();
      unsubscribeUnreadCount();
    };
  }, [config.enableRealtime, user, isConnected, subscribeToEvent]);

  // Handle WebSocket events
  const handleWebSocketEvent = useCallback(
    (event: NotificationWebSocketEvent) => {
      switch (event.type) {
        case "notification":
          // New notification received
          const newNotification = event.data as Notification;

          // Add to cache
          queryClient.setQueryData(
            ["notifications", "list", params],
            (oldData: Notification[] | undefined) => {
              if (!oldData) return [newNotification];
              return [newNotification, ...oldData];
            }
          );

          // Update unread count
          queryClient.setQueryData(
            ["notifications", "unreadCount"],
            (oldData: { count: number } | undefined) => ({
              count: (oldData?.count || 0) + 1,
            })
          );

          // Show toast notification if enabled
          if (config.enableToasts && !newNotification.isRead) {
            showNotificationToast(newNotification);
          }
          break;

        case "notification_read":
          // Notification marked as read
          const readNotificationId = event.data.id;

          // Update cache
          queryClient.setQueryData(
            ["notifications", "list", params],
            (oldData: Notification[] | undefined) => {
              if (!oldData) return oldData;
              return oldData.map((notification) =>
                notification.id === readNotificationId
                  ? { ...notification, isRead: true }
                  : notification
              );
            }
          );

          // Update unread count
          queryClient.setQueryData(
            ["notifications", "unreadCount"],
            (oldData: { count: number } | undefined) => ({
              count: Math.max((oldData?.count || 1) - 1, 0),
            })
          );
          break;

        case "notification_deleted":
          // Notification deleted
          const deletedNotificationId = event.data.id;

          // Remove from cache
          queryClient.setQueryData(
            ["notifications", "list", params],
            (oldData: Notification[] | undefined) => {
              if (!oldData) return oldData;
              return oldData.filter(
                (notification) => notification.id !== deletedNotificationId
              );
            }
          );
          break;

        case "unread_count_updated":
          // Unread count updated (e.g., from another client)
          queryClient.setQueryData(["notifications", "unreadCount"], {
            count: event.data.count,
          });
          break;

        default:
          console.warn("Unknown notification event type:", event.type);
      }
    },
    [queryClient, params, config.enableToasts]
  );

  // Show toast notification
  const showNotificationToast = useCallback((notification: Notification) => {
    const toastOptions = {
      duration: notification.priority === "urgent" ? 10000 : 5000,
      action: notification.actionUrl
        ? {
            label: notification.actionText || "View",
            onClick: () => (window.location.href = notification.actionUrl!),
          }
        : undefined,
    };

    switch (notification.type) {
      case "success":
        toast.success(notification.message, toastOptions);
        break;
      case "warning":
        toast.warning(notification.message, toastOptions);
        break;
      case "error":
        toast.error(notification.message, toastOptions);
        break;
      default:
        toast(notification.message, toastOptions);
    }
  }, []);

  // WebSocket lifecycle is now managed by useSocketConnection hook

  // Enhanced mark as read with real-time sync
  const markAsReadEnhanced = useCallback(
    (id: string) => {
      // Optimistically update local cache
      queryClient.setQueryData(
        ["notifications", "list", params],
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          );
        }
      );

      // Update unread count optimistically
      queryClient.setQueryData(
        ["notifications", "unreadCount"],
        (oldData: { count: number } | undefined) => ({
          count: Math.max((oldData?.count || 1) - 1, 0),
        })
      );

      // Make API call
      // markAsReadMutation.mutate(id);
    },
    [queryClient, params]
  );

  return {
    // Original API (backward compatible)
    notifications: notifications || [],
    unreadCount: unreadCount?.count || 0,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadEnhanced,
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (id: string) => deleteNotificationMutation.mutate(id),
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,

    // Enhanced real-time features with centralized connection
    connectionState,
    isConnected,
    isHealthy,
    reconnectWebSocket,
    enableRealtime: config.enableRealtime,
    enableToasts: config.enableToasts,

    // Advanced notification management
    getNotificationsByCategory: (category: string) =>
      (notifications || []).filter((n) => n.category === category),
    getUnreadNotifications: () =>
      (notifications || []).filter((n) => !n.isRead),
    getHighPriorityNotifications: () =>
      (notifications || []).filter(
        (n) => n.priority === "high" || n.priority === "urgent"
      ),
  };
}
