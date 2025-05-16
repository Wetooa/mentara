import React, { useState } from "react";
import { Search } from "lucide-react";
import MessageContactItem from "./MessageContactItem";
import { Contact } from "./types";

interface MessageSidebarProps {
  onSelectContact: (contactId: string) => void;
  selectedContactId: string | null;
}

// Mock data for demonstration
const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Julia Laine Segundo",
    status: "online",
    lastMessage: "Sure, I'll be there!",
    time: "21:45",
    unread: 0,
  },
  {
    id: "2",
    name: "Julia Laine Segundo",
    status: "offline",
    lastMessage: "Let me check my schedule",
    time: "17:30",
    unread: 2,
  },
  {
    id: "3",
    name: "Julia Laine Segundo",
    status: "online",
    lastMessage: "Thanks for your help!",
    time: "15:12",
    unread: 0,
  },
  {
    id: "4",
    name: "Julia Laine Segundo",
    status: "away",
    lastMessage: "Can we discuss this later?",
    time: "14:55",
    unread: 0,
  },
  {
    id: "5",
    name: "Julia Laine Segundo",
    status: "online",
    lastMessage: "I'll send you the files soon",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "6",
    name: "Julia Laine Segundo",
    status: "offline",
    lastMessage: "See you tomorrow!",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "7",
    name: "Julia Laine Segundo",
    status: "offline",
    lastMessage: "That sounds great!",
    time: "Monday",
    unread: 0,
  },
  {
    id: "8",
    name: "Julia Laine Segundo",
    status: "online",
    lastMessage: "Perfect, looking forward to it",
    time: "Monday",
    unread: 0,
  },
  {
    id: "9",
    name: "Julia Laine Segundo",
    status: "away",
    lastMessage: "I'll let you know",
    time: "Sunday",
    unread: 0,
  },
  {
    id: "10",
    name: "Julia Laine Segundo",
    status: "offline",
    lastMessage: "How's everything going?",
    time: "Saturday",
    unread: 0,
  },
  {
    id: "11",
    name: "Julia Laine Segundo",
    status: "online",
    lastMessage: "Did you receive my email?",
    time: "14/04",
    unread: 0,
  },
  {
    id: "12",
    name: "Julia Laine Segundo",
    status: "offline",
    lastMessage: "Have a great weekend!",
    time: "12/04",
    unread: 0,
  },
];

export default function MessageSidebar({
  onSelectContact,
  selectedContactId,
}: MessageSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = searchQuery
    ? mockContacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockContacts;

  return (
    <div className="w-full bg-white flex flex-col h-full">
      {/* Search Area - Fixed at top */}
      <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search person"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none bg-gray-50"
          />
        </div>
      </div>

      {/* Contacts List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <MessageContactItem
            key={contact.id}
            contact={contact}
            isSelected={selectedContactId === contact.id}
            onClick={() => onSelectContact(contact.id)}
          />
        ))}
      </div>
    </div>
  );
}
