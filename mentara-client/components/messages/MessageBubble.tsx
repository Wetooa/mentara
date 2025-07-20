import React, { useState } from "react";
import Image from "next/image";
import {
  Check,
  CheckCheck,
  File,
  Download,
  Music,
  Video as VideoIcon,
  Smile,
} from "lucide-react";
import { Message, Attachment } from "./types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Function to render appropriate attachment preview
  const renderAttachment = (attachment: Attachment) => {
    switch (attachment.type) {
      case "image":
        return (
          <div className="relative w-full max-w-[240px] h-[180px] mb-2 rounded-lg overflow-hidden">
            <Image
              src={attachment.url}
              alt={attachment.name}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
              {attachment.name}
            </div>
          </div>
        );
      case "document":
        return (
          <div className="flex items-center bg-gray-100 p-2 rounded-lg mb-2 max-w-[240px]">
            <File className="h-8 w-8 text-blue-500 mr-2 flex-shrink-0" />
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-medium text-gray-800 truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(attachment.size || 0)}
              </p>
            </div>
            <button className="ml-2 text-gray-500 hover:text-gray-700">
              <Download className="h-4 w-4" />
            </button>
          </div>
        );
      case "audio":
        return (
          <div className="flex items-center bg-gray-100 p-2 rounded-lg mb-2 max-w-[240px]">
            <Music className="h-8 w-8 text-purple-500 mr-2 flex-shrink-0" />
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-medium text-gray-800 truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(attachment.size || 0)}
              </p>
            </div>
            <button className="ml-2 text-gray-500 hover:text-gray-700">
              <Download className="h-4 w-4" />
            </button>
          </div>
        );
      case "video":
        return (
          <div className="relative w-full max-w-[240px] h-[180px] mb-2 rounded-lg overflow-hidden bg-gray-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoIcon className="h-12 w-12 text-white opacity-70" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
              {attachment.name}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Function to render message status
  const renderMessageStatus = () => {
    if (!isOwn || !message.status) return null;

    return (
      <span className="ml-1">
        {message.status === "read" ? (
          <CheckCheck className="h-3 w-3 inline text-green-200" />
        ) : message.status === "delivered" ? (
          <CheckCheck className="h-3 w-3 inline text-green-200" />
        ) : message.status === "sent" ? (
          <Check className="h-3 w-3 inline text-green-200" />
        ) : null}
      </span>
    );
  };

  // Show deleted message
  if (message.isDeleted) {
    return (
      <div className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className="bg-gray-100 text-gray-500 italic rounded-lg px-4 py-2 text-xs max-w-[75%]">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex mb-3 group ${isOwn ? "justify-end" : "justify-start"}`}
      onDoubleClick={() => setShowReactionPicker(!showReactionPicker)}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-green-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none shadow-sm"
        }`}
      >
        {/* Render attachments if any */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-1">
            {message.attachments.map((attachment) => (
              <div key={attachment.id}>{renderAttachment(attachment)}</div>
            ))}
          </div>
        )}

        {/* Message text */}
        <p className="text-sm">{message.text}</p>

        {/* Message time and status */}
        <div
          className={`flex items-center justify-end text-xs mt-1 ${
            isOwn ? "text-green-200" : "text-gray-400"
          }`}
        >
          <span>{message.time}</span>
          {renderMessageStatus()}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`flex mt-1 -mb-1 ${isOwn ? "justify-start" : "justify-end"}`}
          >
            <div className="bg-white rounded-full px-2 py-0.5 shadow-sm flex items-center gap-1 text-xs">
              {message.reactions.map((reaction, index) => (
                <span
                  key={index}
                  title={`${reaction.count} reactions`}
                  className="flex items-center"
                >
                  <span>{reaction.emoji}</span>
                  <span className="ml-0.5 text-gray-500">{reaction.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reaction button (appears on hover) */}
      <button
        className={`opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "mr-2" : "ml-2"} self-end mb-1`}
        onClick={() => setShowReactionPicker(!showReactionPicker)}
      >
        <Smile className="h-4 w-4 text-gray-400 hover:text-gray-600" />
      </button>

      {/* Reaction picker (simplified) */}
      {showReactionPicker && (
        <div
          className={`absolute ${isOwn ? "right-16" : "left-16"} bg-white p-2 rounded-full shadow-md flex gap-1`}
        >
          <button className="text-lg hover:scale-125 transition-transform">
            👍
          </button>
          <button className="text-lg hover:scale-125 transition-transform">
            ❤️
          </button>
          <button className="text-lg hover:scale-125 transition-transform">
            😊
          </button>
          <button className="text-lg hover:scale-125 transition-transform">
            😮
          </button>
          <button className="text-lg hover:scale-125 transition-transform">
            😢
          </button>
        </div>
      )}
    </div>
  );
}
