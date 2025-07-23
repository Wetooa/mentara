import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { useCallback } from "react";
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
 * Simplified hook for managing user notifications
 * Uses HTTP polling instead of complex WebSocket integration
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
        ["notifications", "unreadCount"],
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
