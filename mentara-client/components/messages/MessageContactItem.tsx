import React from "react";
import Image from "next/image";
import { Contact } from "./types";

interface MessageContactItemProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}

export default function MessageContactItem({
  contact,
  isSelected,
  onClick,
}: MessageContactItemProps) {
  return (
    <div
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
        isSelected ? "bg-green-50" : ""
      }`}
      onClick={onClick}
    >
      {/* Avatar with Status */}
      <div className="relative mr-3 flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
          <Image
            src="/avatar-placeholder.png"
            alt={contact.name}
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
            contact.status === "online"
              ? "bg-green-500"
              : contact.status === "away"
                ? "bg-yellow-400"
                : "bg-gray-300"
          }`}
        />
      </div>

      {/* Contact Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex justify-between items-center w-full">
          <h4 className="text-sm font-medium text-gray-800 truncate max-w-[100px] md:max-w-[120px] lg:max-w-[150px]">
            {contact.name}
          </h4>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
            {contact.time}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p>
      </div>

      {/* Unread Badge */}
      {contact.unread > 0 && (
        <div className="ml-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
          {contact.unread}
        </div>
      )}
    </div>
  );
}
