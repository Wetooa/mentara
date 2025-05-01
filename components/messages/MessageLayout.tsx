"use client";

import React, { useState } from "react";
import MessageSidebar from "./MessageSidebar";
import MessageChatArea from "./MessageChatArea";

export default function MessageLayout() {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Messages Sidebar */}
      <MessageSidebar
        onSelectContact={(contactId) => setSelectedContact(contactId)}
        selectedContactId={selectedContact}
      />

      {/* Message Chat Area */}
      {selectedContact ? (
        <MessageChatArea contactId={selectedContact} />
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
