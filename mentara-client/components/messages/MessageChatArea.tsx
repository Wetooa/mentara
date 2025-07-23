import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Smile, Send, X } from "lucide-react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import { Message, Attachment, Contact } from "./types";
import { useSimpleMessaging } from "@/hooks/messaging/useSimpleMessaging";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

// Import a simple emoji picker or use a library like emoji-mart
import dynamic from "next/dynamic";
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface MessageChatAreaProps {
  contactId: string;
  enableRealtime?: boolean;
}

export function MessageChatArea({
  contactId,
  enableRealtime = true,
}: MessageChatAreaProps) {
  const { accessToken } = useAuth();
  const api = useApi();
  
  // Use the modern messaging hook
  const {
    messageGroups,
    isLoadingMessages,
    error,
    sendMessage: sendMsg,
    sendTypingIndicator,
    isConnected,
    formatDateLabel,
  } = useSimpleMessaging({
    conversationId: contactId,
    enableRealtime,
  });

  // Fetch contact data using proper React Query + useApi() pattern
  const {
    data: contacts = [],
    isLoading: isLoadingContact,
    error: contactError,
  } = useQuery({
    queryKey: queryKeys.messaging.contacts(),
    queryFn: () => api.messaging.getContacts(),
    enabled: !!accessToken && !!contactId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Derive contact from contacts list
  const contact = contacts.find((c) => c.id === contactId) || {
    id: contactId,
    name: "Unknown Contact",
    status: "offline" as const,
    lastMessage: "",
    time: "",
    unread: 0,
    avatar: "/avatar-placeholder.png",
  };

  // Local UI state
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom of messages when component mounts or messages change
  useEffect(() => {
    scrollToBottom();
  }, [messageGroups]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (message.trim() || selectedFiles.length > 0) {
      try {
        // Send the message using the modern hook
        await sendMsg(message, selectedFiles);

        // Clear input
        setMessage("");
        setSelectedFiles([]);

        // Stop typing indicator
        sendTypingIndicator(false);

        // Scroll to bottom after sending a message
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Error sending message:", err);
        alert("Failed to send message. Please try again.");
      }
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
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  // Handle typing indicators
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Send typing indicator using modern hook
    if (sendTypingIndicator && newMessage.trim()) {
      sendTypingIndicator(true);

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        sendTypingIndicator(false);
      }, 2000);
      setTypingTimeout(timeout);
    } else if (sendTypingIndicator && !newMessage.trim()) {
      // Stop typing indicator if message is empty
      sendTypingIndicator(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* Chat Header - Fixed at top with z-index to ensure it stays above content */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        {isLoadingContact ? (
          <div className="flex items-center px-4 py-2 border-b border-gray-200">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="ml-3">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mt-1 animate-pulse"></div>
            </div>
          </div>
        ) : contactError ? (
          <div className="flex items-center px-4 py-2 border-b border-gray-200">
            <div className="text-red-500 text-sm">Failed to load contact information</div>
          </div>
        ) : (
          <ChatHeader contact={contact} />
        )}
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-2">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>
        ) : !isConnected ? (
          <div className="text-center p-4 text-yellow-600">
            Connecting to messaging service...
          </div>
        ) : messageGroups.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.date} className="mb-6">
              {/* Date Divider */}
              <div className="text-center my-4">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  {formatDateLabel(group.date)}
                </span>
              </div>

              {/* Messages for this date */}
              {group.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender === "me"}
                />
              ))}
            </div>
          ))
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200">
        {/* Selected Files Display */}
        {selectedFiles.length > 0 && (
          <div className="bg-white p-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between mb-1 last:mb-0">
                <div className="flex items-center">
                  <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Message Input Area */}
        <div className="bg-white p-3">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              multiple
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
              onChange={handleMessageChange}
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
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-10 right-0 z-20"
                >
                  <Picker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              className={`ml-2 ${
                message.trim() || selectedFiles.length > 0
                  ? "text-green-600 hover:text-green-700"
                  : "text-gray-400"
              }`}
              onClick={handleSend}
              disabled={!message.trim() && selectedFiles.length === 0}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
