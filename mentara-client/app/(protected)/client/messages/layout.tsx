"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import MessageSidebar from "@/components/messages/MessageSidebar";
import { MessageChatArea } from "@/components/messages/MessageChatArea";
import { useMessaging } from "@/hooks/sessions/useMessaging";
import { MessageAttachment } from "@/types/api/messaging";
import { Conversation } from "@/components/messages/types";

export default function MessagesLayout() {
  const {
    conversations,
    selectedContactId,
    isLoadingMessages,
    error,
    selectContact,
    sendMessage,
    markAsRead,
    addReaction,
    removeReaction,
  } = useMessaging();

  const selectedConversation = selectedContactId 
    ? conversations.get(selectedContactId)
    : undefined;

  return (
    <div className="flex h-full w-full">
      {/* Messages Sidebar - Responsive width */}
      <div className="w-full md:w-[250px] lg:w-[300px] md:min-w-[250px] lg:min-w-[300px] h-full border-r border-gray-200 overflow-hidden">
        <MessageSidebar
          onSelectContact={selectContact}
          selectedContactId={selectedContactId}
          contacts={Array.from(conversations.values()).map(conv => ({
            id: conv.id,
            name: conv.contactId || 'Unknown',
            status: 'offline' as const,
            lastMessage: (conv.messages[conv.messages.length - 1] as unknown as {content?: string})?.content || '',
            time: new Date().toISOString(),
            unread: 0,
          }))}
          isLoading={isLoadingMessages}
          error={error}
        />
      </div>

      {/* Message Content Area */}
      <div className="flex-1 h-full">
        {selectedContactId ? (
          <MessageChatAreaWrapper
            contactId={selectedContactId}
            conversation={selectedConversation as unknown as Conversation}
            onSendMessage={sendMessage}
            onMarkAsRead={markAsRead}
            onAddReaction={addReaction}
            onRemoveReaction={removeReaction}
            isLoadingMessages={isLoadingMessages}
            error={error}
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

// Wrapper component to integrate messaging actions with MessageChatArea
interface MessageChatAreaWrapperProps {
  contactId: string;
  conversation?: Conversation;
  onSendMessage: (text: string, attachments?: MessageAttachment[]) => Promise<void>;
  onMarkAsRead: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  isLoadingMessages: boolean;
  error: string | null;
}

function MessageChatAreaWrapper({
  contactId,
  conversation,
  onSendMessage,
  onMarkAsRead,
  onAddReaction,
  onRemoveReaction,
  isLoadingMessages,
  error,
}: MessageChatAreaWrapperProps) {
  return (
    <MessageChatArea
      contactId={contactId}
      conversation={conversation}
      onSendMessage={onSendMessage as any}
      onMarkAsRead={onMarkAsRead}
      onAddReaction={onAddReaction}
      onRemoveReaction={onRemoveReaction}
      isLoadingMessages={isLoadingMessages}
      error={error}
    />
  );
}
