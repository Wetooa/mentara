"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Search,
  Users,
  Settings,
  Circle,
  Reply,
  Check,
  CheckCheck,
  Edit,
  Trash2,
  Copy,
  Forward,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessaging } from "@/hooks/messaging/useMessaging";
import { useStartConversation } from "@/hooks/messaging/useStartConversation";
import { logger } from "@/lib/logger";
import { ConnectionStatus } from "@/components/messaging/ConnectionStatus";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils/common";
import { toast } from "sonner";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type {
  MessagingMessage,
  MessagingConversation,
} from "@/lib/api/services/messaging";
import { User } from "../search";

interface MessengerInterfaceProps {
  className?: string;
  onCallInitiate?: (conversationId: string, type: "audio" | "video") => void;
  targetUserId?: string;
}

function getOtherParticipant(
  conversation: MessagingConversation,
  userId?: string
) {
  if (!userId) return null;
  if (!conversation) return null;
  return conversation.participants.find((p) => p.userId !== userId) || null;
}

const EMOJI_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "😡"];

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
};

interface MessageBubbleProps {
  message: MessagingMessage;
  isOwn: boolean;
  showAvatar: boolean;
  showTime?: boolean;
  messagePosition?: "single" | "first" | "middle" | "last";
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy: () => void;
  onForward: () => void;
  onReport: () => void;
}

const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
  showTime = true,
  messagePosition = "single",
  onReact,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onForward,
  onReport,
}: MessageBubbleProps) => {
  const [showReactions, setShowReactions] = useState(false);

  const getMessageStatus = () => {
    if (!isOwn) return null;

    const hasReadReceipts =
      message.readReceipts && message.readReceipts.length > 0;
    if (hasReadReceipts) {
      return <CheckCheck className="h-3 w-3 text-primary" />;
    }

    // Simple delivered vs sent logic (could be enhanced with real delivery status)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    if (messageAge > 1000) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    }

    return <Check className="h-3 w-3 text-gray-400" />;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied to clipboard");
    onCopy();
  };

  // Modern messenger-style layout
  return (
    <div
      className={cn(
        "flex w-full group mb-1",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for other person's messages - only show on first message of group */}
      {!isOwn && (
        <div className="flex-shrink-0 w-8 mr-2">
          {showAvatar ? (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={message.sender?.avatar || "/avatar-placeholder.png"}
              />
              <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                {getInitials(
                  message.sender?.firstName || "User",
                  message.sender?.lastName || ""
                )}
              </AvatarFallback>
            </Avatar>
          ) : (
            // Empty space to maintain alignment for grouped messages
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={cn(
          "flex flex-col max-w-[75%] sm:max-w-[60%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {/* Reply indicator */}
        {message.replyToId && (
          <div
            className={cn(
              "text-xs text-muted-foreground flex items-center gap-1",
              isOwn ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Reply className="h-3 w-3" />
            Replying to message
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "relative px-4 py-2.5 text-sm shadow-sm",
            // Modern messenger colors with brand primary
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-white text-gray-900 border border-gray-200",
            // Improved bubble shapes for better visual hierarchy
            messagePosition === "single" &&
              (isOwn
                ? "rounded-[18px] rounded-br-[6px]"
                : "rounded-[18px] rounded-bl-[6px]"),
            messagePosition === "first" &&
              (isOwn
                ? "rounded-[18px] rounded-br-[6px]"
                : "rounded-[18px] rounded-bl-[6px]"),
            messagePosition === "middle" &&
              (isOwn
                ? "rounded-l-[18px] rounded-r-[6px]"
                : "rounded-r-[18px] rounded-l-[6px]"),
            messagePosition === "last" &&
              (isOwn
                ? "rounded-[18px] rounded-tr-[6px] rounded-br-[6px]"
                : "rounded-[18px] rounded-tl-[6px] rounded-bl-[6px]"),
            // Subtle visual feedback
            message.isEdited && "opacity-95",
            "transition-all duration-150 hover:shadow-md"
          )}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {/* Message content */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {message.isEdited && (
              <span className="text-xs opacity-60 ml-2">(edited)</span>
            )}
          </div>

          {/* Attachments */}
          {message.attachmentUrls && message.attachmentUrls.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachmentUrls.map((url, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 rounded-lg border flex items-center gap-2",
                    isOwn
                      ? "bg-primary-foreground/20 border-primary-foreground/30"
                      : "bg-white border-gray-200"
                  )}
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="text-xs truncate">
                    {message.attachmentNames?.[index] || "File"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Message reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(
                message.reactions.reduce(
                  (acc, reaction) => {
                    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                    return acc;
                  },
                  {} as Record<string, number>
                )
              ).map(([emoji, count]) => (
                <Badge
                  key={emoji}
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5 h-auto cursor-pointer hover:bg-gray-200"
                  onClick={() => onReact(emoji)}
                >
                  {emoji} {count}
                </Badge>
              ))}
            </div>
          )}

          {/* Quick reactions (on hover) */}
          {showReactions && (
            <div
              className={cn(
                "absolute -top-8 flex gap-1 bg-white rounded-full shadow-lg border p-1",
                isOwn ? "-left-20" : "-right-20"
              )}
            >
              {EMOJI_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className="hover:scale-110 transition-transform text-sm p-1 rounded-full hover:bg-gray-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message metadata */}
        {showTime && (
          <div
            className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground mt-1",
              isOwn ? "flex-row-reverse" : "flex-row"
            )}
          >
            <span>{formatMessageTime(message.createdAt)}</span>
            {getMessageStatus()}
          </div>
        )}
      </div>

      {/* Message actions */}
      <div
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity",
          isOwn ? "order-first" : "order-last"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwn ? "end" : "start"}>
            <DropdownMenuItem onClick={onReply}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onForward}>
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </DropdownMenuItem>
            {isOwn && onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {isOwn && onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
            {!isOwn && (
              <DropdownMenuItem onClick={onReport} className="text-destructive">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

interface ConversationItemProps {
  conversation: MessagingConversation;
  isSelected: boolean;
  onSelect: () => void;
  isOnline?: boolean;
  isTyping?: boolean;
  user: User;
}

const ConversationItem = ({
  conversation,
  isSelected,
  onSelect,
  isOnline,
  isTyping,
  user,
}: ConversationItemProps) => {
  const otherParticipant = getOtherParticipant(conversation, user.id); // Assuming direct conversation
  const displayName = otherParticipant
    ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
    : "Unknown User";

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isSelected
          ? "bg-primary/10 border-l-4 border-l-primary"
          : "hover:bg-gray-50"
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={otherParticipant?.user.avatarUrl} />
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        {/* Online indicator */}
        {isOnline && (
          <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm truncate">{displayName}</h4>
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground truncate flex-1 min-w-0">
            {isTyping ? (
              <span className="text-primary italic">typing...</span>
            ) : conversation.lastMessage ? (
              <>
                <span className="font-medium">
                  {conversation.lastMessage.senderId === user.id
                    ? "You"
                    : otherParticipant?.user.firstName || ""}
                </span>
                {": "}
                <span className="truncate">
                  {conversation.lastMessage.content}
                </span>
              </>
            ) : (
              "No messages yet"
            )}
          </p>
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="text-xs h-5 min-w-5 px-1.5 flex-shrink-0 ml-2"
            >
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

interface TypingIndicatorProps {
  users: string[];
}

const TypingIndicator = ({ users }: TypingIndicatorProps) => {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span>
        {users.length === 1
          ? `${users[0]} is typing...`
          : `${users.slice(0, -1).join(", ")} and ${users[users.length - 1]} are typing...`}
      </span>
    </div>
  );
};

export function MessengerInterface({
  className,
  onCallInitiate,
  targetUserId,
}: MessengerInterfaceProps) {
  const { user } = useAuth();

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<MessagingMessage | null>(
    null
  );
  const [editingMessage, setEditingMessage] = useState<MessagingMessage | null>(
    null
  );
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get conversations list
  const { conversations, isLoadingConversations, conversationsError } =
    useMessaging({
      enableRealtime: true,
      enableTypingIndicators: true,
      enablePresence: true,
    });

  // Hook for starting conversations (deep linking)
  const { startConversation, isStarting } = useStartConversation();

  // Handle targetUserId prop for deep linking
  useEffect(() => {
    if (
      targetUserId &&
      conversations.length > 0 &&
      !selectedConversationId &&
      !isStarting
    ) {
      console.log(
        "🔗 [DEEP LINK] Starting conversation with targetUserId:",
        targetUserId
      );

      // Check if conversation already exists
      const existingConversation = conversations.find(
        (conv) =>
          conv.type === "direct" && // Fixed: lowercase to match backend
          conv.participants.some((p) => p.userId === targetUserId)
      );

      if (existingConversation) {
        console.log(
          "🔗 [DEEP LINK] Found existing conversation:",
          existingConversation.id
        );
        setSelectedConversationId(existingConversation.id);
      } else {
        console.log(
          "🔗 [DEEP LINK] Creating new conversation with user:",
          targetUserId
        );
        startConversation(targetUserId, {
          onSuccess: (conversation) => {
            console.log(
              "🔗 [DEEP LINK] Conversation created/found:",
              conversation.id
            );
            setSelectedConversationId(conversation.id);
          },
          onError: (error) => {
            console.error(
              "🔗 [DEEP LINK] Failed to start conversation:",
              error
            );
            toast.error("Failed to start conversation");
          },
        });
      }
    }
  }, [
    targetUserId,
    conversations,
    selectedConversationId,
    isStarting,
    startConversation,
  ]);

  // Enhanced logging for conversations data
  useEffect(() => {
    logger.debug(
      "MessengerInterface",
      "Conversations state updated",
      {
        isLoadingConversations,
        conversationsError: conversationsError?.message,
        conversationCount: conversations?.length || 0,
      },
      { userId: user?.id }
    );

    if (conversationsError) {
      logger.error(
        "MessengerInterface",
        "Conversations loading error",
        conversationsError,
        { userId: user?.id }
      );
    }
  }, [conversations, isLoadingConversations, conversationsError, user]);

  // Get selected conversation messages
  const {
    messages,
    isLoadingMessages,
    messagesError,
    isSendingMessage,
    typingUsers,
    onlineUsers,
    connectionState,
    sendMessage,
    addReaction,
    sendTypingIndicator,
    uploadFile,
    reconnectWebSocket,
  } = useMessaging({
    conversationId: selectedConversationId || undefined,
    enableRealtime: true,
    enableTypingIndicators: true,
    enablePresence: true,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (selectedConversationId && messagesEndRef.current) {
      // Small delay to ensure messages are rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, [selectedConversationId]);

  // Auto-focus message input when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      messageInputRef.current?.focus();
    }
  }, [selectedConversationId]);

  // Mark messages as read when conversation is viewed
  // useEffect(() => {
  //   if (selectedConversationId && messages.length > 0) {
  //     const unreadMessages = messages.filter(
  //       (m) => !m.isRead && m.authorId !== user?.id
  //     ); // Fixed: use authorId
  //     unreadMessages.forEach((message) => {
  //       markAsRead(message.id);
  //     });
  //   }
  // }, [selectedConversationId, messages, markAsRead, user?.id]);

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  }, [isTyping, sendTypingIndicator]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    const content = messageInput.trim();
    logger.messaging.messageSent("pending", selectedConversationId, content);

    setMessageInput("");
    setReplyToMessage(null);
    setEditingMessage(null);

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }

    try {
      await sendMessage(content, {
        replyToMessageId: replyToMessage?.id, // Fixed: use replyToMessageId
      });
      logger.messaging.messageSent("success", selectedConversationId, content);
    } catch (error) {
      logger.error("MessengerInterface", "Failed to send message", error, {
        conversationId: selectedConversationId,
        userId: user?.id,
      });
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversationId) return;

    try {
      const uploadedFile = await uploadFile(file);
      await sendMessage(`Shared a file: ${file.name}`, {
        attachments: [uploadedFile],
      });
      toast.success("File sent successfully");
    } catch {
      toast.error("Failed to upload file");
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const otherParticipant = getOtherParticipant(conv, user.id);
    const displayName = otherParticipant
      ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
      : "";
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  const otherParticipant = getOtherParticipant(selectedConversation!, user.id);
  const displayName = otherParticipant
    ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
    : "";

  const currentTypingUsers = typingUsers
    .filter((t) => t.conversationId === selectedConversationId && t.isTyping)
    .map((t) => t.userName);

  return (
    <div
      className={cn(
        "h-full bg-white rounded-lg shadow-lg overflow-hidden",
        className
      )}
    >
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full overflow-hidden"
      >
        <ResizablePanel
          defaultSize={25}
          minSize={20}
          maxSize={40}
          className="min-w-[280px] overflow-hidden"
        >
          {/* Sidebar - Conversations List */}
          <div className="w-full h-full border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Messages</h2>
                <div className="flex items-center gap-2">
                  {/* Enhanced connection status */}
                  <ConnectionStatus
                    isConnected={connectionState.isConnected}
                    isReconnecting={connectionState.isReconnecting}
                    error={connectionState.error}
                    lastConnected={connectionState.lastConnected}
                    onReconnect={reconnectWebSocket}
                    showDetails={false}
                    className="scale-75"
                  />

                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              {isLoadingConversations ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversationsError ? (
                <div className="p-4 text-center text-red-500">
                  Failed to load conversations
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm
                    ? "No conversations found"
                    : "No conversations yet"}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(
                      conversation,
                      user.id
                    );
                    const isOnline = otherParticipant
                      ? onlineUsers.has(otherParticipant.userId)
                      : false;
                    const isTypingInConv = typingUsers.some(
                      (t) => t.conversationId === conversation.id && t.isTyping
                    );

                    return (
                      <ConversationItem
                        key={conversation.id}
                        user={user}
                        conversation={conversation}
                        isSelected={selectedConversationId === conversation.id}
                        onSelect={() => {
                          logger.messaging.conversationJoined(
                            conversation.id,
                            user?.id
                          );
                          setSelectedConversationId(conversation.id);
                        }}
                        isOnline={isOnline}
                        isTyping={isTypingInConv}
                      />
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="w-1.5 bg-gray-200/60 hover:bg-primary/40 transition-colors duration-200"
        />
        <ResizablePanel defaultSize={75} className="h-full overflow-hidden">
          <div className="h-full flex flex-col overflow-hidden">
            {selectedConversationId ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant?.user.avatarUrl} />
                      <AvatarFallback>
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{displayName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {onlineUsers.has(otherParticipant?.userId || "") ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Circle className="h-2 w-2 fill-current" />
                            Online
                          </span>
                        ) : (
                          "Offline"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Search className="h-4 w-4 mr-2" />
                          Search conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Conversation info
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <ScrollArea className="flex-1 h-0 p-4">
                    <div className="min-h-full flex flex-col">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center flex-1 min-h-[200px]">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : messagesError ? (
                        <div className="flex items-center justify-center flex-1 min-h-[200px] text-red-500">
                          Failed to load messages
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center flex-1 min-h-[200px] text-muted-foreground">
                          <div className="text-center">
                            <h4 className="font-medium mb-1">
                              No messages yet
                            </h4>
                            <p className="text-sm">
                              Start the conversation with {displayName}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 flex-1">
                          {messages.map((message, index) => {
                            const isOwn = message.senderId === user?.id;
                            const prevMessage = messages[index - 1];
                            const nextMessage = messages[index + 1];

                            // Determine message grouping position
                            const isConsecutiveFromPrev =
                              prevMessage &&
                              prevMessage.senderId === message.senderId;
                            const isConsecutiveToNext =
                              nextMessage &&
                              nextMessage.senderId === message.senderId;

                            const showAvatar = !isConsecutiveFromPrev;
                            const showTime =
                              !isConsecutiveToNext ||
                              (isConsecutiveToNext &&
                                differenceInMinutes(
                                  new Date(nextMessage.createdAt),
                                  new Date(message.createdAt)
                                ) > 5);

                            // Determine message position in group for border radius
                            let messagePosition:
                              | "single"
                              | "first"
                              | "middle"
                              | "last" = "single";
                            if (isConsecutiveFromPrev && isConsecutiveToNext) {
                              messagePosition = "middle";
                            } else if (isConsecutiveFromPrev) {
                              messagePosition = "last";
                            } else if (isConsecutiveToNext) {
                              messagePosition = "first";
                            }

                            return (
                              <div
                                key={message.id}
                                className={cn(
                                  "transition-all duration-200",
                                  !isConsecutiveFromPrev ? "mt-4" : "mt-1"
                                )}
                              >
                                <MessageBubble
                                  message={message}
                                  isOwn={isOwn}
                                  showAvatar={showAvatar}
                                  showTime={showTime}
                                  messagePosition={messagePosition}
                                  onReact={(emoji) =>
                                    addReaction(message.id, emoji)
                                  }
                                  onReply={() => setReplyToMessage(message)}
                                  onEdit={
                                    isOwn
                                      ? () => setEditingMessage(message)
                                      : undefined
                                  }
                                  onDelete={
                                    isOwn
                                      ? () => {
                                          /* TODO: implement delete */
                                        }
                                      : undefined
                                  }
                                  onCopy={() => {
                                    /* Already handled in MessageBubble */
                                  }}
                                  onForward={() => {
                                    /* TODO: implement forward */
                                  }}
                                  onReport={() => {
                                    /* TODO: implement report */
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Typing Indicators */}
                      {currentTypingUsers.length > 0 && (
                        <TypingIndicator users={currentTypingUsers} />
                      )}

                      {/* Auto-scroll anchor */}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Reply indicator */}
                  {replyToMessage && (
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Reply className="h-4 w-4" />
                        <span>
                          Replying to: {replyToMessage.content.substring(0, 50)}
                          ...
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyToMessage(null)}
                      >
                        ×
                      </Button>
                    </div>
                  )}

                  {/* Message Input Area */}
                  <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="flex items-end gap-2">
                      {/* File Upload */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-shrink-0"
                            >
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer"
                              >
                                <Paperclip className="h-4 w-4" />
                              </label>
                              <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Attach file</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Message Input */}
                      <div className="flex-1 min-w-0">
                        <Input
                          ref={messageInputRef}
                          placeholder={`Message ${displayName}...`}
                          value={messageInput}
                          onChange={(e) => {
                            setMessageInput(e.target.value);
                            handleTyping();
                          }}
                          onKeyPress={handleKeyPress}
                          disabled={isSendingMessage}
                          className="resize-none"
                        />
                      </div>

                      {/* Send Button */}
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || isSendingMessage}
                        className="flex-shrink-0 bg-primary hover:bg-primary/90"
                      >
                        {isSendingMessage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
