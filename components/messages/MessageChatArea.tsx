import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Paperclip, Smile, Send, X } from "lucide-react";
// Make sure to import ChatHeader from the correct path
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import { Message } from "./types";

// Import a simple emoji picker or use a library like emoji-mart
import dynamic from "next/dynamic";
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface MessageChatAreaProps {
  contactId: string;
}

// Mock conversation data
const mockConversation: Message[] = [
  {
    id: "1",
    sender: "them",
    text: "Hi there! How are you?",
    time: "20:30",
    status: "read",
  },
  {
    id: "2",
    sender: "me",
    text: "I'm good, thanks for asking! How about you?",
    time: "20:45",
    status: "read",
  },
  {
    id: "3",
    sender: "them",
    text: "I've been doing well. Working on some projects, keeping busy.",
    time: "20:47",
    status: "read",
  },
  {
    id: "4",
    sender: "me",
    text: "That's great to hear. Anything exciting?",
    time: "20:50",
    status: "read",
  },
  {
    id: "5",
    sender: "them",
    text: "Just started a new health initiative for young adults. It's challenging but very rewarding.",
    time: "20:55",
    status: "read",
  },
  {
    id: "6",
    sender: "me",
    text: "That sounds amazing! I'd love to hear more about it.",
    time: "21:00",
    status: "delivered",
  },
];

export default function MessageChatArea({ contactId }: MessageChatAreaProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (message.trim() || selectedFile) {
      console.log("Sending message:", message);
      console.log("With file:", selectedFile?.name || "none");
      setMessage("");
      setSelectedFile(null);
      // In a real app, you'd add the message to the conversation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      // For a real app, you would upload this file to your server
      console.log("File selected:", e.target.files[0].name);
    }
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleEmojiClick = (emojiData: any, event: MouseEvent) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Chat Header */}
      <ChatHeader contactId={contactId} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {/* Time Divider */}
        <div className="text-center my-4">
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
            Today
          </span>
        </div>

        {/* Messages */}
        {mockConversation.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender === "me"}
          />
        ))}
      </div>

      {/* Selected File Display - Fixed positioning relative to the message input */}
      {selectedFile && (
        <div className="border-t border-gray-200 bg-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700 truncate">
                {selectedFile.name}
              </span>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input Area */}
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />

          {/* Attachment Button */}
          <button
            className="text-gray-500 hover:text-gray-700 mr-2"
            onClick={handleAttachmentClick}
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 py-1"
            placeholder="Your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Emoji Button */}
          <div className="relative">
            <button
              className="text-gray-500 hover:text-gray-700 ml-2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-10 right-0">
                <Picker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            className={`ml-2 ${
              message.trim() || selectedFile
                ? "text-green-600 hover:text-green-700"
                : "text-gray-400"
            }`}
            onClick={handleSend}
            disabled={!message.trim() && !selectedFile}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
