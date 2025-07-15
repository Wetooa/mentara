import React, { useState, useRef, useEffect } from "react";
// import Image from "next/image";
import { Paperclip, Smile, Send, X } from "lucide-react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import { Conversation, Message } from "./types";
import {
  fetchConversation,
  sendMessage,
  groupMessagesByDate,
} from "@/data/mockMessagesData";

// Import a simple emoji picker or use a library like emoji-mart
import dynamic from "next/dynamic";
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface MessageChatAreaProps {
  contactId: string;
  conversation?: Conversation;
  onSendMessage?: (text: string, attachments?: unknown[]) => Promise<void>;
  onMarkAsRead?: (messageId: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onSendTyping?: (isTyping: boolean) => void;
  isLoadingMessages?: boolean;
  error?: string | null;
}

export default function MessageChatArea({
  contactId,
  conversation: propConversation,
  onSendMessage,
  // onMarkAsRead,
  // onAddReaction,
  // onRemoveReaction,
  onSendTyping,
  isLoadingMessages: propIsLoadingMessages,
  error: propError,
}: MessageChatAreaProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageGroups, setMessageGroups] = useState<
    { date: string; messages: Message[] }[]
  >([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation from props or fallback to mock data
  useEffect(() => {
    if (propConversation) {
      setMessages(propConversation.messages);
      setIsLoading(propIsLoadingMessages || false);
      setError(propError || null);
    } else {
      const loadConversation = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedConversation = await fetchConversation(contactId);
          if (fetchedConversation) {
            setMessages(fetchedConversation.messages);
          } else {
            // Create an empty conversation if none exists yet
            setMessages([]);
          }
        } catch (err) {
          console.error("Error fetching conversation:", err);
          setError("Failed to load messages. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };

      loadConversation();
    }
  }, [contactId, propConversation, propIsLoadingMessages, propError]);

  // Group messages by date whenever messages change
  useEffect(() => {
    setMessageGroups(groupMessagesByDate(messages));
  }, [messages]);

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
    if (message.trim() || selectedFile) {
      try {
        const fileAttachments: { name: string; url: string; type: string }[] = [];
        if (selectedFile) {
          // In a real app, you'd upload the file first and get a URL
          // For now, simulate file upload by creating a dummy URL
          const fakeUrl = `/files/${selectedFile.name}`;
          fileAttachments.push({
            name: selectedFile.name,
            url: fakeUrl,
            type: selectedFile.type.startsWith("image/") ? "image" : "document",
          });
        }

        // Use provided callback or fallback to mock function
        if (onSendMessage) {
          await onSendMessage(message, fileAttachments);
        } else {
          // Fallback to mock behavior
          const newMessage = await sendMessage(contactId, message, fileAttachments);
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        // Clear input
        setMessage("");
        setSelectedFile(null);

        // Stop typing indicator
        if (onSendTyping) {
          onSendTyping(false);
        }

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
      setSelectedFile(e.target.files[0]);
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

    // Send typing indicator
    if (onSendTyping && newMessage.trim()) {
      onSendTyping(true);

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        onSendTyping(false);
      }, 2000);
      setTypingTimeout(timeout);
    } else if (onSendTyping && !newMessage.trim()) {
      // Stop typing indicator if message is empty
      onSendTyping(false);
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

  // Format date string for display
  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    // Compare year, month, day
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    }

    // Default to date format
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* Chat Header - Fixed at top with z-index to ensure it stays above content */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <ChatHeader contactId={contactId} />
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>
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
        {/* Selected File Display */}
        {selectedFile && (
          <div className="bg-white p-2">
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
        <div className="bg-white p-3">
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
    </div>
  );
}
