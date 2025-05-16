"use client";

import React, { useState } from "react";
import MessageSidebar from "./MessageSidebar";
import MessageChatArea from "./MessageChatArea";

export default function MessageLayout() {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Messages Sidebar */}
      <div className="h-full w-full md:w-72 lg:w-80 flex-shrink-0">
        <MessageSidebar
          onSelectContact={(contactId) => setSelectedContact(contactId)}
          selectedContactId={selectedContact}
        />
      </div>

      {/* Message Chat Area */}
      {selectedContact ? (
        <div className="h-full flex-grow overflow-hidden">
          <MessageChatArea contactId={selectedContact} />
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
