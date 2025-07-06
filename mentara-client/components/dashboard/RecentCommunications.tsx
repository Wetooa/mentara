"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, MoreVertical } from "lucide-react";
import { Contact } from "@/components/messages/types";

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
    const messageTime = new Date(time);
    const now = new Date();
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

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
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Recent Communications
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAllMessages}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentContacts.length > 0 ? (
          <>
            {recentContacts.slice(0, 4).map((contact) => (
              <div
                key={contact.id}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onContactSelect?.(contact.id)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                      contact.status
                    )}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {contact.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      {contact.unread > 0 && (
                        <Badge variant="destructive" className="h-5 text-xs">
                          {contact.unread}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {getDisplayTime(contact.time)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">
                    {contact.lastMessage}
                  </p>
                </div>
              </div>
            ))}
            {recentContacts.length > 4 && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600 hover:text-blue-700"
                  onClick={onViewAllMessages}
                >
                  View {recentContacts.length - 4} more conversations
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No recent communications</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={onViewAllMessages}
            >
              Start a conversation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}