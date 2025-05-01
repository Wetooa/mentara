import React, { useState } from "react";
import Image from "next/image";
import { Settings, MoreVertical, UserX, Trash2, X } from "lucide-react";

interface ChatHeaderProps {
  contactId: string;
}

// Mock data
const mockContact = {
  id: "1",
  name: "Julia Laine Segundo",
  status: "online",
  avatar: "/avatar-placeholder.png",
};

export default function ChatHeader({ contactId }: ChatHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-white">
      {/* Contact Info */}
      <div className="flex items-center">
        <div className="relative mr-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            <Image
              src={mockContact.avatar}
              alt={mockContact.name}
              width={40}
              height={40}
            />
          </div>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{mockContact.name}</h3>
          <p className="text-xs text-green-600">Online</p>
        </div>
      </div>

      {/* Settings Button */}
      <div className="relative">
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-5 w-5 text-gray-500" />
        </button>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  console.log("Block person");
                  setShowSettings(false);
                }}
              >
                <UserX className="h-4 w-4 mr-2" />
                Block Person
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  console.log("Delete conversation");
                  setShowSettings(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Conversation
              </button>
            </div>
            <div className="border-t border-gray-100 py-1">
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
