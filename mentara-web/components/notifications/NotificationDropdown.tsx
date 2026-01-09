"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  X,
  Calendar,
  MessageCircle,
  FileText,
  User,
  CreditCard,
  AlertCircle,
  Settings,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

interface NotificationDropdownProps {
  variant?: "default" | "minimal";
  maxNotifications?: number;
  showConnectionStatus?: boolean;
  className?: string;
}

const getNotificationIcon = (type: string) => {
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
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-500";
    case "HIGH":
      return "bg-orange-500";
    case "NORMAL":
      return "bg-blue-500";
    case "LOW":
      return "bg-gray-500";
    default:
      return "bg-blue-500";
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

export function NotificationDropdown({ 
  variant = "default",
  maxNotifications = 10,
  showConnectionStatus = true,
  className = "",
}: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting,
    refetch,
  } = useNotifications({ 
    limit: maxNotifications,
    enableToasts: false, // We'll handle toasts manually to avoid duplicates
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate if action URL exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const handleRefresh = () => {
    // Refresh notifications via HTTP polling
    refetch();
    toast.info("Refreshing notifications...");
  };

  const displayNotifications = notifications.slice(0, maxNotifications);
  const hasUnread = unreadCount > 0;
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/755596a4-5d31-43d8-9b12-1f1909f7098b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationDropdown.tsx:169',message:'NotificationDropdown render state',data:{unreadCount,hasUnread,notificationsCount:notifications.length,unreadInList:notifications.filter(n=>!n.isRead).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
  }, [unreadCount, hasUnread, notifications]);
  // #endregion

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          {hasUnread ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-x-hidden overflow-y-auto">
        <div className="px-3 py-3 pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {/* Connection status removed - notifications use HTTP polling */}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="text-xs h-6 px-1.5"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Mark all</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/notifications")}
                className="text-xs h-6 px-1.5"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-x-hidden overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="px-3 py-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="px-3 py-3">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load notifications.
                  {/* Connection status removed - notifications use reliable HTTP polling */}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && displayNotifications.length === 0 && (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll receive updates about appointments, messages, and more
              </p>
            </div>
          )}

          {/* Notifications List */}
          {!isLoading && !error && displayNotifications.length > 0 && (
            <div className="divide-y">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors relative group ${
                    !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon with priority indicator */}
                    <div className="relative">
                      <div className="p-2 rounded-full bg-gray-100">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div
                        className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${getPriorityColor(
                          notification.priority
                        )}`}
                        title={`${notification.priority} priority`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-1 break-words">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 break-words">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.actionUrl && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                <ExternalLink className="h-2.5 w-2.5 mr-1" />
                                Action available
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              disabled={isMarkingAsRead}
                              className="h-6 w-6 p-0"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            disabled={isDeleting}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            title="Delete notification"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {displayNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push("/notifications");
                  setIsOpen(false);
                }}
                className="w-full min-w-0 truncate"
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}