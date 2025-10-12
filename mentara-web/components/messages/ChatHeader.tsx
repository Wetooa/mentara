import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Settings, UserX, Trash2, X, Phone, Video } from "lucide-react";
import { Contact } from "./types";

interface ChatHeaderProps {
  contact: Contact;
  onCallInitiate?: (contactId: string, type: 'audio' | 'video') => void;
}

export default function ChatHeader({
  contact,
  onCallInitiate,
}: ChatHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Handle outside clicks to close settings dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSettings &&
        !(event.target as Element).closest(".settings-dropdown")
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings]);

  return (
    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-white">
      {/* Contact Info */}
      <div className="flex items-center">
        <div className="relative mr-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            <Image
              src={contact.avatar || "/avatar-placeholder.png"}
              alt={contact.name}
              width={40}
              height={40}
            />
          </div>
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white shadow-sm ${
              contact.status === "online"
                ? "bg-primary"
                : contact.status === "away"
                  ? "bg-yellow-400"
                  : "bg-gray-400"
            }`}
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
          <p className="text-xs text-primary font-medium capitalize">
            {contact.isTyping ? "Typing..." : contact.status}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        {/* Call Button */}
        <button
          className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Voice call"
          onClick={() => onCallInitiate?.(contact.id, 'audio')}
          disabled={!onCallInitiate}
        >
          <Phone className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
        </button>

        {/* Video Call Button */}
        <button
          className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Video call"
          onClick={() => onCallInitiate?.(contact.id, 'video')}
          disabled={!onCallInitiate}
        >
          <Video className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
        </button>

        {/* Settings Button */}
        <div className="relative settings-dropdown">
          <button
            className="p-2 rounded-full hover:bg-primary/10 group transition-colors"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
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
    </div>
  );
}
