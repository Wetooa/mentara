"use client";

import React, { useState } from "react";
import MessageSidebar from "@/components/messages/MessageSidebar";
import { MessageChatArea } from "@/components/messages/MessageChatArea";
import { useRealtimeMessaging } from "@/hooks/messaging/useRealtimeMessaging";

export default function MessagesLayout() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // Get conversations for the sidebar
  const {
    conversations,
    isLoadingConversations,
    conversationsError,
  } = useRealtimeMessaging({
    enableRealtime: true,
  });

  // Convert conversations to contacts format for sidebar
  const contacts = conversations?.map(conv => ({
    id: conv.id,
    name: conv.title || `Conversation ${conv.id.slice(0, 8)}`,
    status: 'online' as const,
    lastMessage: conv.lastMessage?.content || 'No messages yet',
    time: conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString() : '',
    unread: 0, // TODO: Calculate unread count from read receipts
  })) || [];

  return (
    <div className="flex h-full w-full">
      {/* Messages Sidebar - Responsive width */}
      <div className="w-full md:w-[250px] lg:w-[300px] md:min-w-[250px] lg:min-w-[300px] h-full border-r border-gray-200 overflow-hidden">
        <MessageSidebar
          onSelectContact={(contactId: string) => setSelectedContactId(contactId)}
          selectedContactId={selectedContactId}
          contacts={contacts}
          isLoading={isLoadingConversations}
          error={conversationsError?.message || null}
        />
      </div>

      {/* Message Content Area */}
      <div className="flex-1 h-full">
        {selectedContactId ? (
          <MessageChatArea
            contactId={selectedContactId}
            enableRealtime={true}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50 h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-500">
                Select a conversation
              </h3>
              <p className="text-gray-400">
                Choose someone to message from the sidebar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
