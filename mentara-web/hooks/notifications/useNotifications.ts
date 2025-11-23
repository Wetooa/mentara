import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationsWebSocket } from "./useNotificationsWebSocket";

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

/**
 * Enhanced hook for managing user notifications
 * Combines HTTP API with real-time WebSocket notifications
 */
export function useNotifications(
  params: {
    limit?: number;
    offset?: number;
    isRead?: boolean;
    enableToasts?: boolean;
    enableRealTime?: boolean;
  } = {}
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Configuration with defaults
  const config = {
    enableToasts: true,
    enableRealTime: true,
    ...params,
  };

  // Real-time WebSocket integration
  const webSocketState = useNotificationsWebSocket({
    onNewNotification: useCallback((notification) => {
      console.log('🔔 [useNotifications] Received real-time notification:', notification);

      // Add new notification to the cache optimistically
      queryClient.setQueryData(
        queryKeys.notifications.list(params),
        (oldData: Notification[] | undefined) => {
          if (!oldData) return [notification];
          // Add to beginning of array (most recent first)
          return [notification, ...oldData];
        }
      );

      // Update unread count optimistically
      queryClient.setQueryData(
        queryKeys.notifications.unreadCount(),
        (oldData: { count: number } | undefined) => ({
          count: (oldData?.count || 0) + 1,
        })
      );

      // Show toast notification if enabled
      if (config.enableToasts && config.enableRealTime) {
        const toastConfig = {
          description: notification.message,
          action: notification.actionUrl ? {
            label: "View",
            onClick: () => window.location.href = notification.actionUrl!,
          } : undefined,
        };

        // Show different toast types based on notification priority
        switch (notification.priority) {
          case 'urgent':
          case 'high':
            toast.error(notification.title, toastConfig);
            break;
          case 'medium':
            toast.warning(notification.title, toastConfig);
            break;
          default:
            toast.info(notification.title, toastConfig);
        }
      }
    }, [queryClient, params, config.enableToasts, config.enableRealTime]),

    onUnreadCountUpdate: useCallback((data) => {
      console.log('🔢 [useNotifications] Real-time unread count update:', data.count);

      // Update unread count in cache
      queryClient.setQueryData(
        ["notifications", "unreadCount"],
        { count: data.count }
      );
    }, [queryClient]),

    onError: useCallback((error) => {
      console.error('❌ [useNotifications] WebSocket error:', error);

      if (config.enableToasts) {
        // More user-friendly error messages based on error type
        const isTransportError = typeof error === 'string' && error.includes('Transport error');
        const isConnectionError = typeof error === 'string' && error.includes('Failed to connect');
        
        if (isTransportError) {
          toast.error("Connection Issue", {
            description: "Network connectivity problem. Retrying automatically...",
            action: {
              label: "Retry Now",
              onClick: () => {
                console.log('🔄 Manual retry requested by user');
                window.location.reload();
              },
            },
          });
        } else if (isConnectionError) {
          toast.error("Service Unavailable", {
            description: "Notification service is temporarily unavailable.",
            action: {
              label: "Refresh",
              onClick: () => window.location.reload(),
            },
          });
        } else {
          toast.error("Notification connection issue", {
            description: "Using fallback mode. Some notifications may be delayed.",
          });
        }
      }
    }, [config.enableToasts]),
  });

  // Get notifications
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => api.notifications.getMy(params),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: true, // Refetch on focus for notifications
  });

  // Get unread count
  const { data: unreadCount } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => api.notifications.getUnreadCount(),
    staleTime: STALE_TIME.VERY_SHORT, // 30 seconds
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus for unread count
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.notifications.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to mark notification as read");
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success("Notification deleted");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to delete notification");
    },
  });

  // Simple mark as read with optimistic updates
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
        queryKeys.notifications.unreadCount(),
        (oldData: { count: number } | undefined) => ({
          count: Math.max((oldData?.count || 1) - 1, 0),
        })
      );

      // Make API call
      markAsReadMutation.mutate(id);
    },
    [queryClient, params, markAsReadMutation]
  );

  return {
    // Core API
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

    // Connection state (expected by NotificationCenter)
    connectionState: {
      isConnected: webSocketState.isConnected,
      isConnecting: webSocketState.isConnecting,
      error: webSocketState.error || null,
    },
    reconnectWebSocket: webSocketState.connect,

    // Real-time WebSocket state (backward compatibility)
    realTime: {
      isConnected: webSocketState.isConnected,
      isConnecting: webSocketState.isConnecting,
      error: webSocketState.error,
      canReceiveNotifications: webSocketState.canReceiveNotifications,
      lastNotification: webSocketState.lastNotification,
      connect: webSocketState.connect,
      disconnect: webSocketState.disconnect,
    },

    // Configuration
    enableToasts: config.enableToasts,
    enableRealTime: config.enableRealTime,

    // Utility functions
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
