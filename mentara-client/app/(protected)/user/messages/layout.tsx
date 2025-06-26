"use client";

import React from "react";
import MessageSidebar from "@/components/messages/MessageSidebar";
import MessageChatArea from "@/components/messages/MessageChatArea";
import { useMessaging } from "@/hooks/useMessaging";

export default function MessagesLayout() {
  const {
    contacts,
    conversations,
    selectedContactId,
    isLoadingContacts,
    isLoadingMessages,
    error,
    selectContact,
    sendMessage,
    markAsRead,
    addReaction,
    removeReaction,
    sendTyping,
    searchMessages,
    isConnected,
  } = useMessaging();

  const selectedConversation = selectedContactId 
    ? conversations.get(selectedContactId)
    : undefined;

  return (
    <div className="flex h-full w-full">
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm">
          Disconnected - Messages may not update in real-time
        </div>
      )}

      {/* Messages Sidebar - Responsive width */}
      <div className="w-full md:w-[250px] lg:w-[300px] md:min-w-[250px] lg:min-w-[300px] h-full border-r border-gray-200 overflow-hidden">
        <MessageSidebar
          onSelectContact={selectContact}
          selectedContactId={selectedContactId}
          contacts={contacts}
          isLoading={isLoadingContacts}
          error={error}
        />
      </div>

      {/* Message Content Area */}
      <div className="flex-1 h-full">
        {selectedContactId ? (
          <MessageChatAreaWrapper
            contactId={selectedContactId}
            conversation={selectedConversation}
            onSendMessage={sendMessage}
            onMarkAsRead={markAsRead}
            onAddReaction={addReaction}
            onRemoveReaction={removeReaction}
            onSendTyping={sendTyping}
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
  conversation?: { id: string; contactId: string; messages: any[]; lastReadMessageId?: string };
  onSendMessage: (text: string, attachments?: any[]) => Promise<void>;
  onMarkAsRead: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  onSendTyping: (isTyping: boolean) => void;
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
  onSendTyping,
  isLoadingMessages,
  error,
}: MessageChatAreaWrapperProps) {
  return (
    <MessageChatArea
      contactId={contactId}
      conversation={conversation}
      onSendMessage={onSendMessage}
      onMarkAsRead={onMarkAsRead}
      onAddReaction={onAddReaction}
      onRemoveReaction={onRemoveReaction}
      onSendTyping={onSendTyping}
      isLoadingMessages={isLoadingMessages}
      error={error}
    />
  );
}
