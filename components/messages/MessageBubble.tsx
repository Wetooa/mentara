import React from "react";
import { Check } from "lucide-react";
import { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-green-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none shadow-sm"
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <div
          className={`flex items-center justify-end text-xs mt-1 ${
            isOwn ? "text-green-200" : "text-gray-400"
          }`}
        >
          <span>{message.time}</span>

          {/* Message status for own messages */}
          {isOwn && message.status && (
            <span className="ml-1">
              {message.status === "read" && (
                <Check className="h-3 w-3 inline text-green-200" />
              )}
              {message.status === "delivered" && (
                <Check className="h-3 w-3 inline text-green-200" />
              )}
              {message.status === "sent" && (
                <Check className="h-3 w-3 inline text-green-200" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
