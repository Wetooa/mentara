"use client";

import React, { useState, useEffect } from "react";
import MessageSidebar from "./MessageSidebar";
import MessageChatArea from "./MessageChatArea";
import { initialMessagesState } from "@/data/mockMessagesData";
import { MessagesState } from "./types";

interface MessageLayoutProps {
  // Optional initial data to override the defaults
  initialData?: MessagesState;
}

export default function MessageLayout({ initialData }: MessageLayoutProps) {
  const [messagesState, setMessagesState] = useState<MessagesState>(
    initialData || initialMessagesState
  );

  const handleSelectContact = (contactId: string) => {
    setMessagesState((prevState) => ({
      ...prevState,
      selectedContactId: contactId,
    }));
  };

  return (
    <div className="flex h-[calc(100vh-50px)] w-full overflow-hidden">
      {/* Messages Sidebar */}
      <div className="w-full md:w-[300px] lg:w-[320px] md:min-w-[300px] lg:min-w-[320px] h-full border-r border-gray-200 overflow-hidden">
        <MessageSidebar
          onSelectContact={handleSelectContact}
          selectedContactId={messagesState.selectedContactId}
          contacts={messagesState.contacts}
        />
      </div>

      {/* Message Chat Area */}
      {messagesState.selectedContactId ? (
        <div className="h-full flex-grow overflow-hidden">
          <MessageChatArea
            contactId={messagesState.selectedContactId}
            conversation={messagesState.conversations.find(
              (conv) => conv.contactId === messagesState.selectedContactId
            )}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
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
  );
}
