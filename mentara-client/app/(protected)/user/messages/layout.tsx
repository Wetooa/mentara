"use client";

import React, { useState } from "react";
import MessageSidebar from "@/components/messages/MessageSidebar";
import MessageChatArea from "@/components/messages/MessageChatArea";

export default function MessagesLayout() {
  // Setting a default selected contact (ID: "1") so a conversation appears immediately
  const [selectedContact, setSelectedContact] = useState<string | null>("1");

  const handleSelectContact = (contactId: string) => {
    setSelectedContact(contactId);
  };

  return (
    <div className="flex h-full w-full">
      {/* Messages Sidebar - Responsive width */}
      <div className="w-full md:w-[250px] lg:w-[300px] md:min-w-[250px] lg:min-w-[300px] h-full border-r border-gray-200 overflow-hidden">
        <MessageSidebar
          onSelectContact={handleSelectContact}
          selectedContactId={selectedContact}
        />
      </div>

      {/* Message Content Area */}
      <div className="flex-1 h-full">
        {selectedContact ? (
          <MessageChatArea contactId={selectedContact} />
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
