"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { Socket } from "socket.io-client";
import { RealTimeEventManager, BaseEvent, EventHandlerConfig } from "@/lib/realtime/realtime-event-manager";
import { getNamespacedSocket } from "@/lib/socket";
import type {
  MessageSentEvent,
  MessageUpdatedEvent,
  MessageDeletedEvent,
  NotificationCreatedEvent,
  NotificationUpdatedEvent,
  NotificationDeletedEvent,
  MeetingStartedEvent,
  MeetingEndedEvent,
  WorksheetAssignedEvent,
  WorksheetCompletedEvent
} from "@mentara-commons";

interface UseRealTimeEventsConfig extends Partial<EventHandlerConfig> {
  namespace?: string;
  enableAutoConnect?: boolean;
  subscriptions?: string[];
}

export function useRealTimeEvents(config: UseRealTimeEventsConfig = {}) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const eventManagerRef = useRef<RealTimeEventManager | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const {
    namespace = "/messaging",
    enableAutoConnect = true,
    subscriptions = [],
    enableToasts = true,
    enableBrowserNotifications = true,
    toastFilter,
  } = config;

  // Initialize event manager
  useEffect(() => {
    if (!user?.id) return;

    eventManagerRef.current = new RealTimeEventManager({
      userId: user.id,
      queryClient,
      enableToasts,
      enableBrowserNotifications,
      toastFilter,
    });

    return () => {
      eventManagerRef.current = null;
    };
  }, [user?.id, queryClient, enableToasts, enableBrowserNotifications, toastFilter]);

  // Handle socket connection and event processing
  useEffect(() => {
    if (!user?.id || !eventManagerRef.current || !enableAutoConnect) return;

    const socket = getNamespacedSocket(namespace);
    socketRef.current = socket;

    // Connect socket
    socket.connect();

    // Set up event listeners
    const handleRealTimeEvent = (eventData: BaseEvent) => {
      if (eventManagerRef.current) {
        eventManagerRef.current.processEvent(eventData);
      }
    };

    // Listen for standardized real-time events
    socket.on("real_time_event", handleRealTimeEvent);

    // Legacy event listeners for backward compatibility
    socket.on("message_sent", (data: MessageSentEvent) => {
      handleRealTimeEvent({
        type: "message_sent",
        timestamp: new Date().toISOString(),
        conversationId: data.conversationId,
        data: data.message,
      });
    });

    socket.on("message_updated", (data: MessageUpdatedEvent) => {
      handleRealTimeEvent({
        type: "message_updated",
        timestamp: new Date().toISOString(),
        conversationId: data.conversationId,
        data: data.message,
      });
    });

    socket.on("message_deleted", (data: MessageDeletedEvent) => {
      handleRealTimeEvent({
        type: "message_deleted",
        timestamp: new Date().toISOString(),
        conversationId: data.conversationId,
        data: { messageId: data.messageId },
      });
    });

    socket.on("notification_created", (data: NotificationCreatedEvent) => {
      handleRealTimeEvent({
        type: "notification_created",
        timestamp: new Date().toISOString(),
        userId: data.userId,
        data: data.notification,
      });
    });

    socket.on("notification_updated", (data: NotificationUpdatedEvent) => {
      handleRealTimeEvent({
        type: "notification_updated",
        timestamp: new Date().toISOString(),
        userId: data.userId,
        data: data.notification,
      });
    });

    socket.on("notification_deleted", (data: NotificationDeletedEvent) => {
      handleRealTimeEvent({
        type: "notification_deleted",
        timestamp: new Date().toISOString(),
        userId: data.userId,
        data: { notificationId: data.notificationId },
      });
    });

    socket.on("meeting_started", (data: MeetingStartedEvent) => {
      handleRealTimeEvent({
        type: "meeting_started",
        timestamp: new Date().toISOString(),
        meetingId: data.meetingId,
        data: data.meeting,
      });
    });

    socket.on("meeting_ended", (data: MeetingEndedEvent) => {
      handleRealTimeEvent({
        type: "meeting_ended",
        timestamp: new Date().toISOString(),
        meetingId: data.meetingId,
        data: data.meeting,
      });
    });

    socket.on("worksheet_assigned", (data: WorksheetAssignedEvent) => {
      handleRealTimeEvent({
        type: "worksheet_assigned",
        timestamp: new Date().toISOString(),
        userId: data.userId,
        data: data.worksheet,
      });
    });

    socket.on("worksheet_completed", (data: WorksheetCompletedEvent) => {
      handleRealTimeEvent({
        type: "worksheet_completed",
        timestamp: new Date().toISOString(),
        userId: data.userId,
        data: data.worksheet,
      });
    });

    // Subscribe to specific channels
    subscriptions.forEach((subscription) => {
      socket.emit("subscribe", { channel: subscription, userId: user.id });
    });

    // Handle connection events
    socket.on("connect", () => {
      console.log(`Connected to ${namespace} namespace`);
    });

    socket.on("disconnect", () => {
      console.log(`Disconnected from ${namespace} namespace`);
    });

    socket.on("connect_error", (error: Error) => {
      console.error(`Connection error for ${namespace}:`, error);
    });

    return () => {
      // Clean up event listeners
      socket.off("real_time_event");
      socket.off("message_sent");
      socket.off("message_updated");
      socket.off("message_deleted");
      socket.off("notification_created");
      socket.off("notification_updated");
      socket.off("notification_deleted");
      socket.off("meeting_started");
      socket.off("meeting_ended");
      socket.off("worksheet_assigned");
      socket.off("worksheet_completed");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");

      // Unsubscribe from channels
      subscriptions.forEach((subscription) => {
        socket.emit("unsubscribe", { channel: subscription, userId: user.id });
      });

      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, namespace, enableAutoConnect, subscriptions]);

  // Update event manager config
  const updateConfig = useCallback((newConfig: Partial<EventHandlerConfig>) => {
    if (eventManagerRef.current) {
      eventManagerRef.current.updateConfig(newConfig);
    }
  }, []);

  // Send message through socket
  const sendMessage = useCallback((type: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, data);
    }
  }, []);

  // Subscribe to additional channels
  const subscribe = useCallback((channel: string) => {
    if (socketRef.current?.connected && user?.id) {
      socketRef.current.emit("subscribe", { channel, userId: user.id });
    }
  }, [user?.id]);

  // Unsubscribe from channels
  const unsubscribe = useCallback((channel: string) => {
    if (socketRef.current?.connected && user?.id) {
      socketRef.current.emit("unsubscribe", { channel, userId: user.id });
    }
  }, [user?.id]);

  // Manual connection control
  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  return {
    // Connection state
    isConnected: socketRef.current?.connected ?? false,
    socket: socketRef.current,
    
    // Event manager
    eventManager: eventManagerRef.current,
    
    // Actions
    sendMessage,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
    updateConfig,
    
    // Helper to get supported event types
    getSupportedEvents: () => eventManagerRef.current?.getEventTypes() ?? [],
    
    // Helper to check if event type is supported
    hasEventHandler: (eventType: string) => 
      eventManagerRef.current?.hasHandler(eventType) ?? false,
  };
}