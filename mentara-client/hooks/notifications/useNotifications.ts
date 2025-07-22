import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { getMessagingSocket, connectMessagingSocket, isMessagingConnected, disconnectSocket } from "@/lib/socket";

import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { useEffect, useCallback, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Socket } from "socket.io-client";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
  category?: 'message' | 'community' | 'billing' | 'therapy' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
}

interface NotificationWebSocketEvent {
  type: 'notification' | 'notification_read' | 'notification_deleted' | 'unread_count_updated';
  data: any;
}

interface NotificationConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
}

/**
 * Enhanced hook for managing user notifications with real-time WebSocket support
 */
export function useNotifications(params: { 
  limit?: number; 
  offset?: number; 
  isRead?: boolean;
  enableRealtime?: boolean;
  enableToasts?: boolean;
} = {}) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuth();
  
  // Configuration with defaults
  const config = {
    enableRealtime: true,
    enableToasts: true,
    ...params
  };
  
  // WebSocket connection state
  const [connectionState, setConnectionState] = useState<NotificationConnectionState>({
    isConnected: false,
    isReconnecting: false,
    error: null,
    lastConnected: null,
  });
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // Get notifications
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', 'list', params],
    queryFn: () => api.notifications.getMy(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get unread count
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => api.notifications.getUnreadCount(),
    staleTime: 1000 * 30, // 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => api.notifications.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to mark notification as read");
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("All notifications marked as read");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => api.notifications.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Notification deleted");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to delete notification");
    },
  });

  // Socket.io connection management using centralized configuration
  const connectWebSocket = useCallback(async () => {
    if (!accessToken || !user || !config.enableRealtime) return;
    if (socketRef.current?.connected) return;

    try {
      setConnectionState(prev => ({ ...prev, isReconnecting: true, error: null }));
      
      console.log('🔔 Connecting notifications to messaging socket...');
      
      // Use centralized messaging socket
      const socket = getMessagingSocket();
      
      // Set up notification-specific event listeners
      socket.on('connect', () => {
        console.log('✅ Notifications connected via messaging socket');
        setConnectionState({
          isConnected: true,
          isReconnecting: false,
          error: null,
          lastConnected: new Date(),
        });
        reconnectAttemptsRef.current = 0;
        
        // Join user room for notifications
        socket.emit('join_user_room', { userId: user.id });
      });

      // Listen for notification events
      socket.on('notification', (data) => {
        handleWebSocketEvent({ type: 'notification', data });
      });

      socket.on('unreadCount', (data) => {
        handleWebSocketEvent({ type: 'unread_count_updated', data });
      });

      socket.on('disconnect', (reason) => {
        console.log('Notifications Socket.io disconnected:', reason);
        setConnectionState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isReconnecting: false 
        }));

        // Auto-reconnect on unexpected disconnection
        if (reason === 'io server disconnect' || reason === 'transport error') {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            scheduleReconnect();
          }
        }
      });

      socket.on('connect_error', (error) => {
        console.error('🚫 Notifications socket connection error:', error);
        setConnectionState(prev => ({ 
          ...prev, 
          error: 'Connection error',
          isReconnecting: false 
        }));
        scheduleReconnect();
      });

      socketRef.current = socket;

      // Connect the messaging socket
      await connectMessagingSocket();

    } catch (error) {
      console.error('❌ Failed to connect notifications socket:', error);
      setConnectionState(prev => ({ 
        ...prev, 
        error: 'Failed to connect',
        isReconnecting: false 
      }));
      scheduleReconnect();
    }
  }, [accessToken, user, config.enableRealtime]);

  const disconnectWebSocket = useCallback(() => {
    console.log('🔔 Disconnecting notifications socket...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Remove notification-specific listeners before disconnecting
    if (socketRef.current) {
      socketRef.current.off('notification');
      socketRef.current.off('unreadCount');
      socketRef.current = null;
    }
    
    setConnectionState({
      isConnected: false,
      isReconnecting: false,
      error: null,
      lastConnected: null,
    });
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setConnectionState(prev => ({ 
        ...prev, 
        error: 'Max reconnection attempts reached' 
      }));
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1); // Exponential backoff
    
    console.log(`🔄 Scheduling notification socket reconnection attempt ${reconnectAttemptsRef.current} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
    }, delay);
  }, [connectWebSocket]);

  // Sync connection state with centralized socket
  const updateConnectionState = useCallback(() => {
    const isConnected = isMessagingConnected();
    setConnectionState(prev => ({
      ...prev,
      isConnected,
      isReconnecting: prev.isReconnecting && !isConnected,
    }));
  }, []);

  // Handle WebSocket events
  const handleWebSocketEvent = useCallback((event: NotificationWebSocketEvent) => {
    switch (event.type) {
      case 'notification':
        // New notification received
        const newNotification = event.data as Notification;
        
        // Add to cache
        queryClient.setQueryData(
          ['notifications', 'list', params],
          (oldData: Notification[] | undefined) => {
            if (!oldData) return [newNotification];
            return [newNotification, ...oldData];
          }
        );

        // Update unread count
        queryClient.setQueryData(
          ['notifications', 'unreadCount'],
          (oldData: { count: number } | undefined) => ({
            count: (oldData?.count || 0) + 1
          })
        );

        // Show toast notification if enabled
        if (config.enableToasts && !newNotification.isRead) {
          showNotificationToast(newNotification);
        }
        break;

      case 'notification_read':
        // Notification marked as read
        const readNotificationId = event.data.id;
        
        // Update cache
        queryClient.setQueryData(
          ['notifications', 'list', params],
          (oldData: Notification[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(notification =>
              notification.id === readNotificationId
                ? { ...notification, isRead: true }
                : notification
            );
          }
        );

        // Update unread count
        queryClient.setQueryData(
          ['notifications', 'unreadCount'],
          (oldData: { count: number } | undefined) => ({
            count: Math.max((oldData?.count || 1) - 1, 0)
          })
        );
        break;

      case 'notification_deleted':
        // Notification deleted
        const deletedNotificationId = event.data.id;
        
        // Remove from cache
        queryClient.setQueryData(
          ['notifications', 'list', params],
          (oldData: Notification[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.filter(notification => notification.id !== deletedNotificationId);
          }
        );
        break;

      case 'unread_count_updated':
        // Unread count updated (e.g., from another client)
        queryClient.setQueryData(
          ['notifications', 'unreadCount'],
          { count: event.data.count }
        );
        break;

      default:
        console.warn('Unknown notification event type:', event.type);
    }
  }, [queryClient, params, config.enableToasts]);

  // Show toast notification
  const showNotificationToast = useCallback((notification: Notification) => {
    const toastOptions = {
      duration: notification.priority === 'urgent' ? 10000 : 5000,
      action: notification.actionUrl ? {
        label: notification.actionText || 'View',
        onClick: () => window.location.href = notification.actionUrl!,
      } : undefined,
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions);
        break;
      case 'warning':
        toast.warning(notification.message, toastOptions);
        break;
      case 'error':
        toast.error(notification.message, toastOptions);
        break;
      default:
        toast(notification.message, toastOptions);
    }
  }, []);

  // Sync connection state with centralized socket
  useEffect(() => {
    const interval = setInterval(updateConnectionState, 1000);
    return () => clearInterval(interval);
  }, [updateConnectionState]);

  // WebSocket lifecycle management
  useEffect(() => {
    if (config.enableRealtime && accessToken && user) {
      connectWebSocket();
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket, config.enableRealtime, accessToken, user]);

  // Manual reconnection
  const reconnectWebSocket = useCallback(() => {
    disconnectWebSocket();
    reconnectAttemptsRef.current = 0;
    setTimeout(connectWebSocket, 1000);
  }, [connectWebSocket, disconnectWebSocket]);

  // Enhanced mark as read with real-time sync
  const markAsReadEnhanced = useCallback((id: string) => {
    // Optimistically update local cache
    queryClient.setQueryData(
      ['notifications', 'list', params],
      (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        );
      }
    );

    // Update unread count optimistically
    queryClient.setQueryData(
      ['notifications', 'unreadCount'],
      (oldData: { count: number } | undefined) => ({
        count: Math.max((oldData?.count || 1) - 1, 0)
      })
    );

    // Make API call
    markAsReadMutation.mutate(id);
  }, [queryClient, params, markAsReadMutation]);

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
    
    // Enhanced real-time features
    connectionState,
    reconnectWebSocket,
    enableRealtime: config.enableRealtime,
    enableToasts: config.enableToasts,
    
    // Advanced notification management
    getNotificationsByCategory: (category: string) => 
      (notifications || []).filter(n => n.category === category),
    getUnreadNotifications: () => 
      (notifications || []).filter(n => !n.isRead),
    getHighPriorityNotifications: () => 
      (notifications || []).filter(n => n.priority === 'high' || n.priority === 'urgent'),
  };
}