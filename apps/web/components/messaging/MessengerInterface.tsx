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
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessaging } from "@/hooks/messaging/useMessaging";
import { useStartConversation } from "@/hooks/messaging/useStartConversation";
import { logger } from "@/lib/logger";
import { useMessagingStore } from "@/store/messaging";
import { ConnectionStatus } from "@/components/messaging/ConnectionStatus";
import { useAuth } from "@/contexts/AuthContext";
import { CrisisSupportButton } from "@/components/messaging/CrisisSupportButton";
import { MoodSelector, getMoodEmoji, type Mood } from "@/components/messaging/MoodSelector";
import { useMoodTracking } from "@/hooks/messaging/useMoodTracking";
import { useApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { QuickResponses } from "@/components/messaging/QuickResponses";
import { SessionWorksheetActions } from "@/components/messaging/SessionWorksheetActions";
import { WellnessQuickAccess } from "@/components/messaging/WellnessQuickAccess";
import { useFileUpload } from "@/hooks/messaging/useFileUpload";
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
import { EmptyState } from "@/components/common/EmptyState";

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

const MessageBubble = React.memo(({
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
      role="article"
      aria-label={`Message from ${isOwn ? 'you' : message.sender?.firstName || 'user'}`}
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
                  aria-label={`React with ${emoji}`}
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              aria-label="Message options"
            >
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
});

MessageBubble.displayName = "MessageBubble";

interface ConversationItemProps {
  conversation: MessagingConversation;
  isSelected: boolean;
  onSelect: () => void;
  isOnline?: boolean;
  isTyping?: boolean;
  user: User;
}

const ConversationItem = React.memo(({
  conversation,
  isSelected,
  onSelect,
  isOnline,
  isTyping,
  user,
}: ConversationItemProps) => {
  if (!user) return null;
  
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
      role="button"
      tabIndex={0}
      aria-label={`Conversation with ${displayName}${(conversation.unreadCount ?? 0) > 0 ? `, ${conversation.unreadCount} unread message${conversation.unreadCount! > 1 ? 's' : ''}` : ''}`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
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
        <div className="flex items-center gap-2 min-w-0">
          <h4 className="font-medium text-sm truncate min-w-0" style={{ maxWidth: 'calc(100% - 80px)' }}>
            {displayName}
          </h4>
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap ml-auto">
              {formatMessageTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate min-w-0" style={{ maxWidth: (conversation.unreadCount ?? 0) > 0 ? 'calc(100% - 50px)' : '100%' }}>
            {isTyping ? (
              <span className="text-primary italic">typing...</span>
            ) : conversation.lastMessage ? (
              <>
                <span className="font-medium">
                  {user && conversation.lastMessage.senderId === user.id
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
          {(conversation.unreadCount ?? 0) > 0 && (
            <Badge
              variant="destructive"
              className="text-xs h-5 min-w-5 px-1.5 flex-shrink-0 whitespace-nowrap ml-auto"
            >
              {conversation.unreadCount! > 99 ? "99+" : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
});

ConversationItem.displayName = "ConversationItem";

interface TypingIndicatorProps {
  users: string[];
}

const TypingIndicator = React.memo(({ users }: TypingIndicatorProps) => {
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
});

TypingIndicator.displayName = "TypingIndicator";

export function MessengerInterface({
  className,
  onCallInitiate,
  targetUserId,
}: MessengerInterfaceProps) {
  const { user } = useAuth();
  const api = useApi();
  const queryClient = useQueryClient();
  
  // Use messaging store for selected conversation
  const { 
    selectedConversationId, 
    setSelectedConversation 
  } = useMessagingStore();
  
  // Mood tracking
  const { currentMood, setMood, getMoodForConversation } = useMoodTracking();
  const conversationMood = selectedConversationId 
    ? getMoodForConversation(selectedConversationId)
    : currentMood;
  
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
  // Track conversations being created to prevent validation from clearing them
  const pendingConversationIdRef = useRef<string | null>(null);

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
      !isStarting
    ) {
      // Check if conversation already exists
      const existingConversation = conversations.find(
        (conv) =>
          conv.type === "direct" && // Fixed: lowercase to match backend
          conv.participants.some((p) => p.userId === targetUserId)
      );

      // Check if the currently selected conversation matches the targetUserId
      const selectedConversationMatches = selectedConversationId
        ? existingConversation?.id === selectedConversationId
        : false;

      // Only proceed if we don't have a selected conversation that matches targetUserId
      if (!selectedConversationMatches) {
        console.log(
          "🔗 [DEEP LINK] Starting conversation with targetUserId:",
          targetUserId
        );

        // Clear any existing invalid selection first to prevent sending to wrong conversation
        if (selectedConversationId && !conversations.some(conv => conv.id === selectedConversationId)) {
          console.warn(
            "⚠️ [DEEP LINK] Clearing invalid selected conversation before starting new one:",
            selectedConversationId
          );
          setSelectedConversation(null);
        }

        if (existingConversation) {
          console.log(
            "🔗 [DEEP LINK] Found existing conversation:",
            existingConversation.id
          );
          setSelectedConversation(existingConversation.id);
        } else {
          console.log(
            "🔗 [DEEP LINK] Creating new conversation with user:",
            targetUserId
          );
          // Create conversation directly via API and handle result
          // Store the targetUserId in a local variable to check against in the promise handlers
          const currentTargetUserId = targetUserId;
          api.messaging.startDirectConversation(currentTargetUserId)
            .then(async (conversation) => {
              // Only set the conversation if we're still targeting the same user
              // This prevents race conditions if targetUserId changes before the promise resolves
              console.log(
                "🔗 [DEEP LINK] Conversation created/found:",
                conversation.id
              );
              
              // Validate that the user is actually a participant before proceeding
              const isParticipant = conversation.participants.some(
                (p) => p.userId === user?.id
              );
              
              if (!isParticipant) {
                console.error(
                  "🔗 [DEEP LINK] User is not a participant in the created conversation"
                );
                toast.error("Failed to join conversation. Please try again.");
                pendingConversationIdRef.current = null;
                return;
              }
              
              // Update the conversations cache with the new conversation (optimistic update)
              // Don't invalidate immediately - this causes the conversation to disappear
              // because a refetch might happen before the backend transaction is fully committed.
              // The cache update is sufficient, and React Query will naturally refetch when appropriate
              // (e.g., on window focus, after staleTime expires, etc.)
              if (!user?.id) return;
              queryClient.setQueryData<MessagingConversation[]>(
                queryKeys.messaging.conversations(user.id),
                (old) => {
                  if (!old) return [conversation];
                  
                  // Check if conversation already exists in cache
                  const existingIndex = old.findIndex(
                    (conv) => conv.id === conversation.id
                  );
                  
                  if (existingIndex >= 0) {
                    // Update existing conversation
                    const updated = [...old];
                    updated[existingIndex] = conversation;
                    return updated;
                  } else {
                    // Add new conversation to the beginning
                    return [conversation, ...old];
                  }
                }
              );
              
              // Track this conversation as pending to prevent validation from clearing it
              // This prevents race conditions where validation runs before the conversations array updates
              pendingConversationIdRef.current = conversation.id;
              
              // Wait for the conversation to appear in the conversations list before selecting
              // This ensures the backend transaction is fully committed
              const maxWaitTime = 3000; // 3 seconds max wait
              const checkInterval = 100; // Check every 100ms
              let waited = 0;
              
              const waitForConversation = () => {
                return new Promise<void>((resolve) => {
                  const checkConversation = () => {
                    // Check if conversation exists in the query cache
                    if (!user?.id) return;
                    const cachedConversations = queryClient.getQueryData<MessagingConversation[]>(
                      queryKeys.messaging.conversations(user.id)
                    );
                    const conversationExists = cachedConversations?.some(
                      (conv) => conv.id === conversation.id
                    );
                    
                    if (conversationExists || waited >= maxWaitTime) {
                      if (conversationExists) {
                        console.log(
                          "🔗 [DEEP LINK] Conversation confirmed in cache:",
                          conversation.id
                        );
                      } else {
                        console.warn(
                          "🔗 [DEEP LINK] Timeout waiting for conversation in cache, proceeding anyway:",
                          conversation.id
                        );
                      }
                      resolve();
                    } else {
                      waited += checkInterval;
                      setTimeout(checkConversation, checkInterval);
                    }
                  };
                  checkConversation();
                });
              };
              
              // Wait for conversation to appear, then select it
              await waitForConversation();
              
              // Add a small delay to ensure backend transaction is fully committed
              // This helps prevent "not a participant" errors when fetching messages
              await new Promise((resolve) => setTimeout(resolve, 500));
              
              // IMPORTANT: Set the selected conversation after waiting
              // This ensures the backend transaction is committed before fetching messages
              console.log(
                "🔗 [DEEP LINK] Setting selected conversation after validation:",
                conversation.id
              );
              setSelectedConversation(conversation.id);
              
              // Clear the pending flag after a short delay to allow the conversations array to update
              // The validation effect will see the conversation in the array by then
              setTimeout(() => {
                if (pendingConversationIdRef.current === conversation.id) {
                  pendingConversationIdRef.current = null;
                }
              }, 1000);
            })
            .catch((error) => {
              console.error(
                "🔗 [DEEP LINK] Failed to start conversation:",
                error
              );
              // Clear pending flag on error
              pendingConversationIdRef.current = null;
              toast.error("Failed to start conversation");
            });
        }
      }
    }
  }, [
    targetUserId,
    conversations,
    selectedConversationId,
    isStarting,
    api.messaging,
    setSelectedConversation,
    queryClient,
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

  // Validate selected conversation ID and auto-select first conversation if needed
  // This runs whenever conversations load to ensure the selected ID is always valid
  useEffect(() => {
    if (conversations.length > 0 && !isLoadingConversations) {
      // Always validate the selected conversation ID when conversations are loaded
      // This ensures stale/invalid IDs are cleared immediately to prevent 403 errors
      if (selectedConversationId) {
        // Skip validation if this is a pending conversation being created
        // This prevents race conditions where validation runs before the conversations array updates
        if (pendingConversationIdRef.current === selectedConversationId) {
          console.log(
            "⏳ [MESSAGING] Skipping validation for pending conversation:",
            selectedConversationId
          );
          return;
        }
        
        // Skip validation if we're currently processing a targetUserId
        // This prevents clearing the selection during conversation creation
        if (targetUserId) {
          console.log(
            "⏳ [MESSAGING] Skipping validation while processing targetUserId:",
            targetUserId
          );
          return;
        }
        
        const isValidConversation = conversations.some(
          (conv) => conv.id === selectedConversationId
        );
        if (!isValidConversation) {
          // Selected conversation is no longer valid (user not a participant, deleted, etc.)
          // Clear the invalid selection immediately to prevent sending messages to wrong conversation
          console.warn(
            "⚠️ [MESSAGING] Selected conversation ID is invalid, clearing selection:",
            selectedConversationId,
            "Available conversations:",
            conversations.map(c => c.id)
          );
          setSelectedConversation(null);
          // Don't auto-select here - let the logic below handle it if needed
        }
      }
      
      // Auto-select first conversation if none is selected (but not if we're waiting for targetUserId)
      // Only auto-select if we're not currently processing a targetUserId (which will set its own selection)
      const currentSelectedId = selectedConversationId;
      if (!currentSelectedId && !targetUserId && conversations.length > 0) {
        const firstConversation = conversations[0];
        if (firstConversation) {
          console.log(
            "🔄 [MESSAGING] Auto-selecting first conversation:",
            firstConversation.id
          );
          setSelectedConversation(firstConversation.id);
        }
      }
    }
  }, [
    selectedConversationId,
    conversations,
    isLoadingConversations,
    targetUserId,
    setSelectedConversation,
  ]);

  // Clear pending conversation ref when the conversation appears in the conversations array
  useEffect(() => {
    if (pendingConversationIdRef.current && conversations.length > 0) {
      const pendingId = pendingConversationIdRef.current;
      const conversationExists = conversations.some(
        (conv) => conv.id === pendingId
      );
      if (conversationExists) {
        console.log(
          "✅ [MESSAGING] Pending conversation now in list, clearing pending flag:",
          pendingId
        );
        pendingConversationIdRef.current = null;
      }
    }
  }, [conversations]);

  // File upload hook
  const { upload: uploadFileToStorage, isUploading: isUploadingFile, uploadProgress } = useFileUpload("message-attachments");
  
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

    // Validate that the selected conversation is still valid before sending
    const isValidConversation = conversations.some(
      (conv) => conv.id === selectedConversationId
    );
    if (!isValidConversation) {
      console.error(
        "❌ [MESSAGING] Cannot send message - selected conversation is invalid:",
        selectedConversationId
      );
      toast.error("Cannot send message - conversation no longer available");
      // Clear the invalid selection
      setSelectedConversation(null);
      return;
    }

    const content = messageInput.trim();
    logger.debug('Message sending (pending):', selectedConversationId, content);

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
      logger.debug('Message sent (success):', selectedConversationId, content);
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
      const uploadedFile = await uploadFileToStorage(file, {
        path: `messages/${selectedConversationId}/${Date.now()}-${file.name}`,
      });
      
      await sendMessage(`Shared a file: ${file.name}`, {
        attachments: [uploadedFile],
      });
      
      // Reset file input
      if (e.target) {
        e.target.value = "";
      }
    } catch (error) {
      logger.error("MessengerInterface", "File upload failed", error);
      toast.error("Failed to upload file. Please try again.");
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    if (!user) return false;
    const otherParticipant = getOtherParticipant(conv, user.id);
    const displayName = otherParticipant
      ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
      : "";
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  const otherParticipant = selectedConversation && user 
    ? getOtherParticipant(selectedConversation, user.id)
    : null;
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
          <div 
            className="w-full h-full border-r border-gray-200 flex flex-col overflow-hidden"
            role="complementary"
            aria-label="Conversations list"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold" id="conversations-heading">Messages</h2>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  aria-label="Search conversations"
                  aria-describedby="conversations-heading"
                />
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea 
              className="flex-1"
              role="list"
              aria-label="Conversations"
              aria-labelledby="conversations-heading"
            >
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
                <div className="p-4">
                  <EmptyState
                    icon={MessageSquare}
                    title={searchTerm ? "No conversations found" : "No conversations yet"}
                    description={
                      searchTerm
                        ? "Try adjusting your search terms"
                        : "Start a conversation to get started"
                    }
                  />
                </div>
              ) : (
                <div className="p-2 space-y-1" role="list">
                  {filteredConversations.map((conversation) => {
                    if (!user) return null;
                    
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
                          logger.debug('Conversation selected:', conversation.id, user?.id);
                          setSelectedConversation(conversation.id);
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
                <div 
                  className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0"
                  role="banner"
                  aria-label={`Chat with ${displayName}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10" aria-hidden="true">
                      <AvatarImage src={otherParticipant?.user.avatarUrl} alt={`${displayName}'s avatar`} />
                      <AvatarFallback>
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm" id="chat-participant-name">{displayName}</h3>
                        {conversationMood && (
                          <span className="text-lg" title={`Feeling: ${conversationMood}`}>
                            {getMoodEmoji(conversationMood)}
                          </span>
                        )}
                      </div>
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
                <div 
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                  role="log"
                  aria-label={`Messages with ${displayName}`}
                  aria-live="polite"
                  aria-atomic="false"
                >
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
                        <div className="flex items-center justify-center flex-1 min-h-[200px]">
                          <EmptyState
                            icon={MessageSquare}
                            title="No messages yet"
                            description={`Start the conversation with ${displayName}`}
                          />
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
                        aria-label="Cancel reply"
                      >
                        ×
                      </Button>
                    </div>
                  )}

                  {/* Message Input Area */}
                  <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="flex items-end gap-2">
                      {/* Mood Selector */}
                      <MoodSelector
                        currentMood={conversationMood}
                        onMoodSelect={(mood) => {
                          setMood(mood, selectedConversationId || undefined);
                          // Optionally send mood as message
                          if (mood) {
                            const moodEmoji = getMoodEmoji(mood);
                            setMessageInput(`${moodEmoji} Feeling ${mood} today`);
                          }
                        }}
                        size="sm"
                      />

                      {/* Wellness Quick Access */}
                      <WellnessQuickAccess
                        onToolSelect={(toolId) => {
                          // This could trigger the wellness tools popup
                          // For now, just add a message about using the tool
                          setMessageInput(`I'm using the ${toolId} tool to help me feel better.`);
                        }}
                      />

                      {/* Quick Responses (for therapists) */}
                      {user?.role === "therapist" && (
                        <QuickResponses
                          onSelectResponse={(response, useTagalog) => {
                            const text = useTagalog ? response.tagalog : response.english;
                            setMessageInput(text);
                          }}
                        />
                      )}

                      {/* Crisis Support Button */}
                      <CrisisSupportButton
                        onSendCrisisMessage={(message, priority) => {
                          setMessageInput(message);
                          // Send with priority metadata
                          handleSendMessage();
                        }}
                      />

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
                                disabled={isUploadingFile}
                                aria-label="Upload file attachment"
                              />
                              {isUploadingFile && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {uploadProgress}%
                                </span>
                              )}
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
                          aria-label={`Message input for ${displayName}`}
                          aria-describedby="message-input-help"
                        />
                      </div>

                      {/* Send Button */}
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || isSendingMessage}
                        className="flex-shrink-0 bg-primary hover:bg-primary/90"
                        aria-label={isSendingMessage ? "Sending message" : "Send message"}
                        aria-describedby="message-input-help"
                      >
                        {isSendingMessage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" aria-hidden="true"></div>
                        ) : (
                          <Send className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                    {/* Screen reader help text */}
                    <div id="message-input-help" className="sr-only">
                      Type your message and press Enter to send, or click the send button. Press Shift+Enter for a new line.
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
