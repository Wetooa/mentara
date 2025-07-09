import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import MessageContactItem from "./MessageContactItem";
import { Contact } from "./types";

interface MessageSidebarProps {
  onSelectContact: (contactId: string) => void;
  selectedContactId: string | null;
  contacts?: Contact[]; // Make it optional to support both passing data and loading from API
  isLoading?: boolean;
  error?: string | null;
}

export default function MessageSidebar({
  onSelectContact,
  selectedContactId,
  contacts: propContacts,
  isLoading: propIsLoading,
  error: propError,
}: MessageSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load contacts if they weren't passed as props
  useEffect(() => {
    if (propContacts) {
      setContacts(propContacts);
      setIsLoading(propIsLoading || false);
      setError(propError || null);
    } else {
      // If no contacts are passed, show empty state
      setContacts([]);
      setIsLoading(false);
      setError(null);
    }
  }, [propContacts, propIsLoading, propError]);

  const filteredContacts = searchQuery
    ? contacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contacts;

  return (
    <div className="w-full bg-white flex flex-col h-full">
      {/* Search Area - Fixed at top */}
      <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0">
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
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center p-4 text-gray-500">No contacts found</div>
        ) : (
          filteredContacts.map((contact) => (
            <MessageContactItem
              key={contact.id}
              contact={contact}
              isSelected={selectedContactId === contact.id}
              onClick={() => onSelectContact(contact.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
