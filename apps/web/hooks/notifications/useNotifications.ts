import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME, REFETCH_INTERVAL } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
 * Uses HTTP polling every 10 seconds for updates
 */
export function useNotifications(
  params: {
    limit?: number;
    offset?: number;
    isRead?: boolean;
    enableToasts?: boolean;
  } = {}
) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Configuration with defaults
  const config = {
    enableToasts: true,
    ...params,
  };

  // Track previous notification IDs to detect new ones
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);

  // Get notifications with polling
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => {
      return api.notifications.getMy(params);
    },
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: true, // Refetch on focus for notifications
    refetchInterval: REFETCH_INTERVAL.NOTIFICATIONS, // Poll every 10 seconds
    refetchIntervalInBackground: true, // Continue polling in background
  });
  
  // Get unread count with polling
  const { data: unreadCount, isLoading: isLoadingUnreadCount } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => {
      return api.notifications.getUnreadCount();
    },
    staleTime: STALE_TIME.VERY_SHORT, // 30 seconds
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus for unread count
    refetchInterval: REFETCH_INTERVAL.NOTIFICATIONS, // Poll every 10 seconds
    refetchIntervalInBackground: true, // Continue polling in background
  });

  // Detect new notifications when polling data changes and show toasts
  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      // Initialize previous IDs on first load
      if (notifications) {
        previousNotificationIdsRef.current = new Set(notifications.map(n => n.id));
      }
      return;
    }

    const currentIds = new Set(notifications.map(n => n.id));
    const previousIds = previousNotificationIdsRef.current;
    
    // Find new notifications (in current but not in previous)
    const newNotifications = notifications.filter(n => {
      const isNew = !previousIds.has(n.id);
      // Also check if notification was created within the last 10 seconds
      // This prevents showing old notifications on initial load
      if (isNew) {
        const createdAt = new Date(n.createdAt).getTime();
        const now = Date.now();
        const timeDiff = now - createdAt;
        return timeDiff < 10000; // Within 10 seconds
      }
      return false;
    });

    // Show toasts for new notifications
    if (newNotifications.length > 0 && config.enableToasts) {
      newNotifications.forEach(notification => {
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
      });
    }

    // Update previous IDs
    previousNotificationIdsRef.current = currentIds;
    setLastPollTime(new Date());
  }, [notifications, config.enableToasts]);

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

  // Calculate next poll time
  const nextPollTime = lastPollTime 
    ? new Date(lastPollTime.getTime() + REFETCH_INTERVAL.NOTIFICATIONS)
    : null;

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

    // Polling status (replaces connectionState)
    pollingStatus: {
      isPolling: isFetching,
      lastPollTime,
      nextPollTime,
    },

    // Backward compatibility: connectionState (for components that still expect it)
    connectionState: {
      isConnected: true, // Always "connected" with polling
      isConnecting: isFetching,
      error: null,
    },
    reconnectWebSocket: refetch, // Map reconnect to refetch for backward compatibility

    // Configuration
    enableToasts: config.enableToasts,

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
