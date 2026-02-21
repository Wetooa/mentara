"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import {
  Calendar,
  MessageCircle,
  FileText,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Bell,
  ExternalLink,
} from "lucide-react";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

interface NotificationToastsProps {
  enableBookingNotifications?: boolean;
  enableMessageNotifications?: boolean;
  enableSystemNotifications?: boolean;
  enableWorksheetNotifications?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  duration?: number;
  maxToasts?: number;
}

const getToastIcon = (type: string) => {
  switch (type) {
    case "APPOINTMENT_REMINDER":
    case "APPOINTMENT_CONFIRMED":
    case "APPOINTMENT_CANCELLED":
    case "APPOINTMENT_RESCHEDULED":
      return <Calendar className="h-4 w-4" />;
    case "MESSAGE_RECEIVED":
    case "MESSAGE_REACTION":
      return <MessageCircle className="h-4 w-4" />;
    case "WORKSHEET_ASSIGNED":
    case "WORKSHEET_DUE":
    case "WORKSHEET_FEEDBACK":
      return <FileText className="h-4 w-4" />;
    case "THERAPIST_APPROVED":
    case "THERAPIST_REJECTED":
    case "CLIENT_REQUEST_RECEIVED":
      return <User className="h-4 w-4" />;
    case "PAYMENT_SUCCESS":
    case "PAYMENT_FAILED":
    case "SUBSCRIPTION_EXPIRING":
      return <CreditCard className="h-4 w-4" />;
    case "SYSTEM_UPDATE":
    case "SYSTEM_MAINTENANCE":
      return <Info className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getToastVariant = (type: string, priority: string) => {
  // Determine toast style based on type and priority
  if (priority === "URGENT") return "destructive";
  
  switch (type) {
    case "PAYMENT_FAILED":
    case "APPOINTMENT_CANCELLED":
    case "THERAPIST_REJECTED":
    case "SYSTEM_MAINTENANCE":
      return "destructive";
    case "PAYMENT_SUCCESS":
    case "APPOINTMENT_CONFIRMED":
    case "THERAPIST_APPROVED":
    case "WORKSHEET_FEEDBACK":
      return "success";
    case "APPOINTMENT_REMINDER":
    case "SUBSCRIPTION_EXPIRING":
    case "WORKSHEET_DUE":
      return "warning";
    default:
      return "default";
  }
};

const shouldShowToast = (
  notification: Notification,
  filters: {
    enableBookingNotifications: boolean;
    enableMessageNotifications: boolean;
    enableSystemNotifications: boolean;
    enableWorksheetNotifications: boolean;
  }
) => {
  const { type } = notification;
  
  // Booking notifications
  if (type.includes("APPOINTMENT_") && !filters.enableBookingNotifications) {
    return false;
  }
  
  // Message notifications
  if (type.includes("MESSAGE_") && !filters.enableMessageNotifications) {
    return false;
  }
  
  // System notifications
  if (type.includes("SYSTEM_") && !filters.enableSystemNotifications) {
    return false;
  }
  
  // Worksheet notifications
  if (type.includes("WORKSHEET_") && !filters.enableWorksheetNotifications) {
    return false;
  }
  
  return true;
};

export function NotificationToasts({
  enableBookingNotifications = true,
  enableMessageNotifications = true,
  enableSystemNotifications = true,
  enableWorksheetNotifications = true,
  duration = 5000,
  maxToasts = 3,
}: NotificationToastsProps) {
  const router = useRouter();
  const { notifications } = useNotifications({
    enableToasts: false, // We handle toasts manually here
  });

  const filters = {
    enableBookingNotifications,
    enableMessageNotifications,
    enableSystemNotifications,
    enableWorksheetNotifications,
  };

  useEffect(() => {
    // Track shown notifications to avoid duplicates
    const shownNotifications = new Set<string>();
    let activeToasts = 0;

    const showNotificationToast = (notification: Notification) => {
      // Skip if already shown or filters disabled
      if (
        shownNotifications.has(notification.id) ||
        !shouldShowToast(notification, filters) ||
        activeToasts >= maxToasts
      ) {
        return;
      }

      shownNotifications.add(notification.id);
      activeToasts++;

      const icon = getToastIcon(notification.type);
      const variant = getToastVariant(notification.type, notification.priority);
      
      // Determine duration based on priority
      const toastDuration = notification.priority === "URGENT" ? duration * 2 : duration;

      const toastOptions = {
        duration: toastDuration,
        icon,
        action: notification.actionUrl ? {
          label: (
            <div className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              View
            </div>
          ),
          onClick: () => {
            router.push(notification.actionUrl!);
          },
        } : undefined,
        onDismiss: () => {
          activeToasts = Math.max(0, activeToasts - 1);
        },
        onAutoClose: () => {
          activeToasts = Math.max(0, activeToasts - 1);
        },
      };

      // Show toast based on variant
      switch (variant) {
        case "success":
          toast.success(notification.message, {
            ...toastOptions,
            description: notification.title,
          });
          break;
        case "destructive":
          toast.error(notification.message, {
            ...toastOptions,
            description: notification.title,
          });
          break;
        case "warning":
          toast.warning(notification.message, {
            ...toastOptions,
            description: notification.title,
          });
          break;
        default:
          toast(notification.message, {
            ...toastOptions,
            description: notification.title,
          });
      }
    };

    // Check for new unread notifications
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    // Show toasts for recent unread notifications (last 5 minutes)
    const recentThreshold = new Date(Date.now() - 5 * 60 * 1000);
    const recentNotifications = unreadNotifications.filter(
      n => new Date(n.createdAt) > recentThreshold
    );

    // Sort by priority and show limited number
    const sortedNotifications = recentNotifications
      .sort((a, b) => {
        const priorityOrder = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 2) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 2);
      })
      .slice(0, maxToasts);

    sortedNotifications.forEach(showNotificationToast);

  }, [notifications, filters, duration, maxToasts, router]);

  // This component doesn't render anything visible
  return null;
}

interface CustomNotificationToastProps {
  notification: Notification;
  onDismiss?: () => void;
  onAction?: () => void;
}

/**
 * Custom notification toast component for more control
 */
export function CustomNotificationToast({
  notification,
  onDismiss,
  onAction,
}: CustomNotificationToastProps) {
  const icon = getToastIcon(notification.type);
  const variant = getToastVariant(notification.type, notification.priority);

  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-sm
      ${variant === "destructive" ? "bg-red-50 border-red-200" : ""}
      ${variant === "success" ? "bg-green-50 border-green-200" : ""}
      ${variant === "warning" ? "bg-yellow-50 border-yellow-200" : ""}
      ${variant === "default" ? "bg-white border-gray-200" : ""}
    `}>
      {/* Icon */}
      <div className={`
        p-2 rounded-full flex-shrink-0
        ${variant === "destructive" ? "bg-red-100 text-red-600" : ""}
        ${variant === "success" ? "bg-green-100 text-green-600" : ""}
        ${variant === "warning" ? "bg-yellow-100 text-yellow-600" : ""}
        ${variant === "default" ? "bg-gray-100 text-gray-600" : ""}
      `}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
          {notification.title}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {notification.message}
        </p>
        
        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {notification.actionUrl && onAction && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAction}
              className="text-xs h-6"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-xs h-6 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for programmatically showing notification toasts
 */
export function useNotificationToasts() {
  const router = useRouter();

  const showBookingToast = (type: "confirmed" | "cancelled" | "rescheduled", details: {
    therapistName?: string;
    clientName?: string;
    date?: string;
    time?: string;
    actionUrl?: string;
  }) => {
    const messages = {
      confirmed: `Session confirmed with ${details.therapistName || details.clientName}`,
      cancelled: `Session cancelled for ${details.date} at ${details.time}`,
      rescheduled: `Session rescheduled with ${details.therapistName || details.clientName}`,
    };

    toast.success(messages[type], {
      icon: <Calendar className="h-4 w-4" />,
      action: details.actionUrl ? {
        label: "View Details",
        onClick: () => router.push(details.actionUrl!),
      } : undefined,
    });
  };

  const showMessageToast = (senderName: string, preview: string, conversationUrl?: string) => {
    toast(`New message from ${senderName}`, {
      description: preview.length > 50 ? preview.substring(0, 50) + "..." : preview,
      icon: <MessageCircle className="h-4 w-4" />,
      action: conversationUrl ? {
        label: "Reply",
        onClick: () => router.push(conversationUrl),
      } : undefined,
    });
  };

  const showSystemToast = (type: "success" | "error" | "warning" | "info", message: string) => {
    const icons = {
      success: <CheckCircle className="h-4 w-4" />,
      error: <AlertTriangle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
    };

    toast[type](message, {
      icon: icons[type],
    });
  };

  return {
    showBookingToast,
    showMessageToast,
    showSystemToast,
  };
}