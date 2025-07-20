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
import { parseISO, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface NotificationsCenterProps {
  notifications: UserDashboardData["notifications"];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const notificationVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  }
};

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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <motion.div 
            className="flex items-center justify-between mb-6"
            variants={headerVariants}
          >
            <h2 className="text-xl font-bold">Notifications</h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                View All <ArrowRight size={16} />
              </Button>
            </motion.div>
          </motion.div>

          {sortedNotifications.length === 0 ? (
            <motion.div 
              className="text-center py-8 text-muted-foreground"
              variants={headerVariants}
            >
              No notifications
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
            >
              {sortedNotifications.map((notification, index) => {
                // Calculate time ago
                const timeAgo = formatDistanceToNow(
                  parseISO(notification.dateTime),
                  {
                    addSuffix: true,
                  }
                );

                return (
                  <motion.div
                    key={notification.id}
                    variants={notificationVariants}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      transition: { duration: 0.2 }
                    }}
                    className={`p-3 rounded-lg border ${getNotificationBg(notification.read)}`}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className="p-2 bg-white rounded-full"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: 0.1 + index * 0.05, 
                          type: "spring", 
                          stiffness: 300 
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </motion.div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <motion.span 
                              className="w-2 h-2 rounded-full bg-blue-500"
                              variants={pulseVariants}
                              animate="pulse"
                            />
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
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                          >
                            Action
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
