import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

// Event Types
export type EventType = 
  | "message_sent"
  | "message_updated" 
  | "message_deleted"
  | "message_read"
  | "typing_start"
  | "typing_stop"
  | "user_status_changed"
  | "notification_created"
  | "notification_updated"
  | "notification_deleted"
  | "notification_read_all"
  | "meeting_started"
  | "meeting_ended"
  | "meeting_participant_joined"
  | "meeting_participant_left"
  | "worksheet_assigned"
  | "worksheet_completed"
  | "worksheet_updated";

// Base Event Interface
export interface BaseEvent {
  type: EventType;
  timestamp: string;
  userId?: string;
  conversationId?: string;
  meetingId?: string;
  data?: unknown;
}

// Event Handlers
export interface EventHandlerConfig {
  userId: string;
  queryClient: QueryClient;
  enableToasts?: boolean;
  enableBrowserNotifications?: boolean;
  toastFilter?: (event: BaseEvent) => boolean;
}

export class RealTimeEventManager {
  private queryClient: QueryClient;
  private userId: string;
  private enableToasts: boolean;
  private enableBrowserNotifications: boolean;
  private toastFilter?: (event: BaseEvent) => boolean;
  private eventHandlers: Map<EventType, (event: BaseEvent) => void> = new Map();

  constructor(config: EventHandlerConfig) {
    this.queryClient = config.queryClient;
    this.userId = config.userId;
    this.enableToasts = config.enableToasts ?? true;
    this.enableBrowserNotifications = config.enableBrowserNotifications ?? true;
    this.toastFilter = config.toastFilter;

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Message Events
    this.eventHandlers.set("message_sent", this.handleMessageSent.bind(this));
    this.eventHandlers.set("message_updated", this.handleMessageUpdated.bind(this));
    this.eventHandlers.set("message_deleted", this.handleMessageDeleted.bind(this));
    this.eventHandlers.set("message_read", this.handleMessageRead.bind(this));
    this.eventHandlers.set("typing_start", this.handleTypingStart.bind(this));
    this.eventHandlers.set("typing_stop", this.handleTypingStop.bind(this));
    this.eventHandlers.set("user_status_changed", this.handleUserStatusChanged.bind(this));

    // Notification Events
    this.eventHandlers.set("notification_created", this.handleNotificationCreated.bind(this));
    this.eventHandlers.set("notification_updated", this.handleNotificationUpdated.bind(this));
    this.eventHandlers.set("notification_deleted", this.handleNotificationDeleted.bind(this));
    this.eventHandlers.set("notification_read_all", this.handleNotificationReadAll.bind(this));

    // Meeting Events
    this.eventHandlers.set("meeting_started", this.handleMeetingStarted.bind(this));
    this.eventHandlers.set("meeting_ended", this.handleMeetingEnded.bind(this));
    this.eventHandlers.set("meeting_participant_joined", this.handleMeetingParticipantJoined.bind(this));
    this.eventHandlers.set("meeting_participant_left", this.handleMeetingParticipantLeft.bind(this));

    // Worksheet Events
    this.eventHandlers.set("worksheet_assigned", this.handleWorksheetAssigned.bind(this));
    this.eventHandlers.set("worksheet_completed", this.handleWorksheetCompleted.bind(this));
    this.eventHandlers.set("worksheet_updated", this.handleWorksheetUpdated.bind(this));
  }

  // Main event processing method
  public processEvent(event: BaseEvent): void {
    // Skip events not for this user (unless it's a broadcast event)
    if (event.userId && event.userId !== this.userId) {
      return;
    }

    const handler = this.eventHandlers.get(event.type);
    if (handler) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error processing event ${event.type}:`, error);
      }
    } else {
      console.warn(`No handler found for event type: ${event.type}`);
    }
  }

  // Message Event Handlers
  private handleMessageSent(event: BaseEvent): void {
    if (!event.conversationId || !event.data) return;

    // Update messages cache
    this.queryClient.setQueryData(
      queryKeys.messages.conversation(event.conversationId),
      (oldData: unknown) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [...(oldData.data || []), event.data],
        };
      }
    );

    // Update conversations list
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.conversations.list() 
    });

    // Show toast for new messages (not from current user)
    if (this.enableToasts && event.data.senderId !== this.userId) {
      this.showToast("info", `New message from ${event.data.senderName || 'Someone'}`, {
        description: event.data.content?.substring(0, 100) || "New message received",
        duration: 5000,
      });
    }
  }

  private handleMessageUpdated(event: BaseEvent): void {
    if (!event.conversationId || !event.data) return;

    this.queryClient.setQueryData(
      queryKeys.messages.conversation(event.conversationId),
      (oldData: unknown) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((msg: unknown) =>
            msg.id === event.data.id ? event.data : msg
          ),
        };
      }
    );
  }

  private handleMessageDeleted(event: BaseEvent): void {
    if (!event.conversationId || !event.data?.messageId) return;

    this.queryClient.setQueryData(
      queryKeys.messages.conversation(event.conversationId),
      (oldData: unknown) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((msg: unknown) => msg.id !== event.data.messageId),
        };
      }
    );
  }

  private handleMessageRead(event: BaseEvent): void {
    if (!event.conversationId || !event.data?.messageId) return;

    this.queryClient.setQueryData(
      queryKeys.messages.conversation(event.conversationId),
      (oldData: unknown) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((msg: unknown) =>
            msg.id === event.data.messageId ? { ...msg, isRead: true } : msg
          ),
        };
      }
    );
  }

  private handleTypingStart(event: BaseEvent): void {
    // Typing indicators are handled by individual components
    // This is a placeholder for future typing state management
    console.log("Typing started:", event.data);
  }

  private handleTypingStop(event: BaseEvent): void {
    // Typing indicators are handled by individual components
    console.log("Typing stopped:", event.data);
  }

  private handleUserStatusChanged(event: BaseEvent): void {
    // User status changes are handled by individual components
    console.log("User status changed:", event.data);
  }

  // Notification Event Handlers
  private handleNotificationCreated(event: BaseEvent): void {
    if (!event.data) return;

    // Update notifications cache
    this.queryClient.setQueryData(
      queryKeys.notifications.list(),
      (oldData: unknown) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [event.data, ...(oldData.data || [])],
        };
      }
    );

    // Update unread count
    this.queryClient.setQueryData(
      queryKeys.notifications.unreadCount(),
      (oldCount: number = 0) => oldCount + 1
    );

    // Show toast notification
    if (this.enableToasts && (!this.toastFilter || this.toastFilter(event))) {
      const notif = event.data;
      const toastType = notif.priority === "urgent" ? "error" 
                      : notif.priority === "high" ? "warning" 
                      : "info";
      
      this.showToast(toastType, notif.title, {
        description: notif.message,
        duration: notif.priority === "urgent" ? 10000 : 5000,
        action: notif.actionUrl ? {
          label: notif.actionText || "View",
          onClick: () => window.open(notif.actionUrl, "_blank"),
        } : undefined,
      });
    }

    // Show browser notification
    if (this.enableBrowserNotifications && "Notification" in window && Notification.permission === "granted") {
      new Notification(event.data.title, {
        body: event.data.message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: event.data.id,
        requireInteraction: event.data.priority === "urgent",
      });
    }
  }

  private handleNotificationUpdated(event: BaseEvent): void {
    if (!event.data) return;

    this.queryClient.setQueryData(
      queryKeys.notifications.list(),
      (oldData: unknown) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((notif: unknown) =>
            notif.id === event.data.id ? event.data : notif
          ),
        };
      }
    );
  }

  private handleNotificationDeleted(event: BaseEvent): void {
    if (!event.data?.notificationId) return;

    this.queryClient.setQueryData(
      queryKeys.notifications.list(),
      (oldData: unknown) => {
        if (!oldData?.data) return oldData;
        const notification = oldData.data.find((n: unknown) => n.id === event.data.notificationId);
        const newData = oldData.data.filter((n: unknown) => n.id !== event.data.notificationId);
        
        // Update unread count if notification was unread
        if (notification && !notification.isRead) {
          this.queryClient.setQueryData(
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

  private handleNotificationReadAll(): void {
    // Mark all notifications as read
    this.queryClient.setQueryData(
      queryKeys.notifications.list(),
      (oldData: unknown) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((notif: unknown) => ({
            ...notif,
            isRead: true,
          })),
        };
      }
    );

    // Reset unread count
    this.queryClient.setQueryData(
      queryKeys.notifications.unreadCount(),
      0
    );
  }

  // Meeting Event Handlers
  private handleMeetingStarted(event: BaseEvent): void {
    if (!event.meetingId) return;

    // Update meeting cache
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.meetings.list() 
    });

    if (this.enableToasts) {
      this.showToast("info", "Meeting Started", {
        description: "A scheduled meeting has started",
        duration: 5000,
      });
    }
  }

  private handleMeetingEnded(event: BaseEvent): void {
    if (!event.meetingId) return;

    // Update meeting cache
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.meetings.list() 
    });

    if (this.enableToasts) {
      this.showToast("info", "Meeting Ended", {
        description: "A meeting has ended",
        duration: 5000,
      });
    }
  }

  private handleMeetingParticipantJoined(event: BaseEvent): void {
    if (!event.meetingId || !event.data?.participantName) return;

    if (this.enableToasts) {
      this.showToast("info", "Participant Joined", {
        description: `${event.data.participantName} joined the meeting`,
        duration: 3000,
      });
    }
  }

  private handleMeetingParticipantLeft(event: BaseEvent): void {
    if (!event.meetingId || !event.data?.participantName) return;

    if (this.enableToasts) {
      this.showToast("info", "Participant Left", {
        description: `${event.data.participantName} left the meeting`,
        duration: 3000,
      });
    }
  }

  // Worksheet Event Handlers
  private handleWorksheetAssigned(event: BaseEvent): void {
    if (!event.data) return;

    // Update worksheets cache
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.worksheets.list() 
    });

    if (this.enableToasts) {
      this.showToast("info", "New Worksheet Assigned", {
        description: `You have been assigned: ${event.data.title}`,
        duration: 5000,
      });
    }
  }

  private handleWorksheetCompleted(event: BaseEvent): void {
    if (!event.data) return;

    // Update worksheets cache
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.worksheets.list() 
    });

    if (this.enableToasts) {
      this.showToast("success", "Worksheet Completed", {
        description: `${event.data.title} has been completed`,
        duration: 5000,
      });
    }
  }

  private handleWorksheetUpdated(event: BaseEvent): void {
    if (!event.data) return;

    // Update worksheets cache
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.worksheets.list() 
    });
  }

  // Helper Methods
  private showToast(
    type: "info" | "success" | "warning" | "error", 
    title: string, 
    options?: {
      description?: string;
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ): void {
    const toastOptions = {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action,
    };

    switch (type) {
      case "error":
        toast.error(title, toastOptions);
        break;
      case "warning":
        toast.warning(title, toastOptions);
        break;
      case "success":
        toast.success(title, toastOptions);
        break;
      default:
        toast.info(title, toastOptions);
    }
  }

  // Public Methods
  public updateConfig(config: Partial<EventHandlerConfig>): void {
    if (config.enableToasts !== undefined) {
      this.enableToasts = config.enableToasts;
    }
    if (config.enableBrowserNotifications !== undefined) {
      this.enableBrowserNotifications = config.enableBrowserNotifications;
    }
    if (config.toastFilter !== undefined) {
      this.toastFilter = config.toastFilter;
    }
  }

  public getEventTypes(): EventType[] {
    return Array.from(this.eventHandlers.keys());
  }

  public hasHandler(eventType: EventType): boolean {
    return this.eventHandlers.has(eventType);
  }
}