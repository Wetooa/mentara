"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Contact } from "@/components/messages/types";
import { motion } from "framer-motion";

interface RecentCommunicationsProps {
  recentContacts: Contact[];
  onViewAllMessages?: () => void;
  onContactSelect?: (contactId: string) => void;
}

export default function RecentCommunications({
  recentContacts,
  onViewAllMessages,
  onContactSelect,
}: RecentCommunicationsProps) {
  const getDisplayTime = (time: string): string => {
    if (!time) {
      return "Unknown";
    }

    const messageTime = new Date(time);
    if (isNaN(messageTime.getTime())) {
      return "Invalid Date";
    }

    const now = new Date();
    const diffInHours =
      (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="h-full"
    >
      <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden p-0 h-full flex flex-col">
        <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 px-5 py-4">
          <div className="flex flex-row items-center justify-between">
            <div className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Recent Chats
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAllMessages}
                className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="space-y-2 overflow-y-auto p-3 flex-1 min-h-0">
          {recentContacts.length > 0 ? (
            <>
              {recentContacts.slice(0, 4).map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 cursor-pointer transition-all border border-transparent hover:border-blue-100"
                  onClick={() => onContactSelect?.(contact.id)}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 text-sm font-semibold">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${getStatusColor(
                        contact.status
                      )}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {contact.name}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {getDisplayTime(contact.time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-600 truncate flex-1">
                        {contact.lastMessage}
                      </p>
                      {contact.unread > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 min-w-5 text-xs px-1.5 flex-shrink-0"
                        >
                          {contact.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {recentContacts.length > 4 && (
                <motion.div
                  className="pt-2 border-t"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={onViewAllMessages}
                  >
                    View {recentContacts.length - 4} more conversations
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                No recent chats
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Start a conversation with your therapist
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={onViewAllMessages}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                Start chatting
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
