import { Card, CardContent } from "@/components/ui/card";
import type { UserDashboardData } from "@/lib/api/types/dashboard";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Calendar,
  FileText,
  Bell,
  ArrowRight,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";

interface NotificationsCenterProps {
  notifications: UserDashboardData["notifications"];
}

export default function NotificationsCenter({
  notifications,
}: NotificationsCenterProps) {
  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
  });

  // Function to get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "session":
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case "worksheet":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "system":
        return <Bell className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Function to get notification background based on read status
  const getNotificationBg = (read: boolean) => {
    return read ? "bg-card" : "bg-blue-50";
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Notifications</h2>
          <Button variant="ghost" size="sm" className="text-primary gap-1">
            View All <ArrowRight size={16} />
          </Button>
        </div>

        {sortedNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="space-y-3">
            {sortedNotifications.map((notification) => {
              // Calculate time ago
              const timeAgo = formatDistanceToNow(
                parseISO(notification.dateTime),
                {
                  addSuffix: true,
                }
              );

              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${getNotificationBg(notification.read)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-full">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {timeAgo}
                      </div>
                    </div>

                    {notification.actionUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                      >
                        Action
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
