"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  Users,
  Settings,
  Circle,
  Reply,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Sad,
  Check,
  CheckCheck,
  Clock,
  Edit,
  Trash2,
  Copy,
  Forward,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeMessaging } from '@/hooks/messaging/useRealtimeMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import type { MessagingMessage, MessagingConversation } from '@/lib/api/services/messaging';

interface MessengerInterfaceProps {
  className?: string;
  onCallInitiate?: (conversationId: string, type: 'audio' | 'video') => void;
  onVideoMeetingJoin?: (conversationId: string) => void;
}

const EMOJI_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '😡'];

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const MessageBubble: React.FC<{
  message: MessagingMessage;
  isOwn: boolean;
  showAvatar: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy: () => void;
  onForward: () => void;
  onReport: () => void;
}> = ({ 
  message, 
  isOwn, 
  showAvatar, 
  onReact, 
  onReply, 
  onEdit, 
  onDelete, 
  onCopy, 
  onForward, 
  onReport 
}) => {
  const [showReactions, setShowReactions] = useState(false);
  
  const getMessageStatus = () => {
    if (!isOwn) return null;
    
    const hasReadReceipts = message.readReceipts && message.readReceipts.length > 0;
    if (hasReadReceipts) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
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
    toast.success('Message copied to clipboard');
    onCopy();
  };

  return (
    <div className={cn("flex gap-3 group", isOwn ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="/avatar-placeholder.png" />
          <AvatarFallback className="text-xs">U</AvatarFallback>
        </Avatar>
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      {/* Message Content */}
      <div className={cn("flex flex-col gap-1 max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        {/* Reply indicator */}
        {message.replyToId && (
          <div className={cn("text-xs text-muted-foreground flex items-center gap-1", isOwn ? "flex-row-reverse" : "flex-row")}>
            <Reply className="h-3 w-3" />
            Replying to message
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "relative px-3 py-2 rounded-2xl text-sm",
            isOwn 
              ? "bg-blue-500 text-white rounded-br-md" 
              : "bg-gray-100 text-gray-900 rounded-bl-md",
            message.isEdited && "opacity-90"
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
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className={cn(
                    "p-2 rounded-lg border flex items-center gap-2",
                    isOwn ? "bg-blue-400/20 border-blue-300" : "bg-white border-gray-200"
                  )}
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="text-xs truncate">{attachment.fileName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Message reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(
                message.reactions.reduce((acc, reaction) => {
                  acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
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
            <div className={cn(
              "absolute -top-8 flex gap-1 bg-white rounded-full shadow-lg border p-1",
              isOwn ? "-left-20" : "-right-20"
            )}>
              {EMOJI_REACTIONS.map(emoji => (
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
        <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", isOwn ? "flex-row-reverse" : "flex-row")}>
          <span>{formatMessageTime(message.createdAt)}</span>
          {getMessageStatus()}
        </div>
      </div>

      {/* Message actions */}
      <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity", isOwn ? "order-first" : "order-last")}>
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

const ConversationItem: React.FC<{
  conversation: MessagingConversation;
  isSelected: boolean;
  onSelect: () => void;
  isOnline?: boolean;
  isTyping?: boolean;
}> = ({ conversation, isSelected, onSelect, isOnline, isTyping }) => {
  const otherParticipant = conversation.participants[0]; // Assuming direct conversation
  const displayName = otherParticipant 
    ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
    : 'Unknown User';

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50"
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
          <p className="text-sm text-muted-foreground truncate">
            {isTyping ? (
              <span className="text-blue-500 italic">typing...</span>
            ) : conversation.lastMessage ? (
              conversation.lastMessage.content
            ) : (
              'Start a conversation'
            )}
          </p>
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs h-5 min-w-5 px-1.5">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC<{ users: string[] }> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>
        {users.length === 1 
          ? `${users[0]} is typing...`
          : `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]} are typing...`
        }
      </span>
    </div>
  );
};

export function MessengerInterface({ 
  className, 
  onCallInitiate, 
  onVideoMeetingJoin 
}: MessengerInterfaceProps) {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<MessagingMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessagingMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get conversations list
  const {
    conversations,
    isLoadingConversations,
    conversationsError,
  } = useRealtimeMessaging({
    enableRealtime: true,
    enableTypingIndicators: true,
    enablePresence: true,
  });

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
    markAsRead,
    addReaction,
    sendTypingIndicator,
    uploadFile,
  } = useRealtimeMessaging({
    conversationId: selectedConversationId || undefined,
    enableRealtime: true,
    enableTypingIndicators: true,
    enablePresence: true,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus message input when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      messageInputRef.current?.focus();
    }
  }, [selectedConversationId]);

  // Mark messages as read when conversation is viewed
  useEffect(() => {
    if (selectedConversationId && messages.length > 0) {
      const unreadMessages = messages.filter(m => !m.isRead && m.senderId !== user?.id);
      unreadMessages.forEach(message => {
        markAsRead(message.id);
      });
    }
  }, [selectedConversationId, messages, markAsRead, user?.id]);

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
    setMessageInput('');
    setReplyToMessage(null);
    setEditingMessage(null);

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }

    try {
      await sendMessage(content, {
        replyToId: replyToMessage?.id,
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
      toast.success('File sent successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const otherParticipant = conv.participants[0];
    const displayName = otherParticipant 
      ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
      : '';
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherParticipant = selectedConversation?.participants[0];
  const displayName = otherParticipant 
    ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
    : '';

  const currentTypingUsers = typingUsers
    .filter(t => t.conversationId === selectedConversationId && t.isTyping)
    .map(t => t.userName);

  return (
    <div className={cn("flex h-full bg-white rounded-lg shadow-lg overflow-hidden", className)}>
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Messages</h2>
            <div className="flex items-center gap-2">
              {/* Connection status */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Circle 
                      className={cn(
                        "h-2 w-2",
                        connectionState.isConnected 
                          ? "fill-green-500 text-green-500" 
                          : "fill-red-500 text-red-500"
                      )} 
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {connectionState.isConnected ? 'Connected' : 'Disconnected'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
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
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map(conversation => {
                const otherParticipant = conversation.participants[0];
                const isOnline = otherParticipant ? onlineUsers.has(otherParticipant.userId) : false;
                const isTypingInConv = typingUsers.some(t => 
                  t.conversationId === conversation.id && t.isTyping
                );

                return (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    onSelect={() => setSelectedConversationId(conversation.id)}
                    isOnline={isOnline}
                    isTyping={isTypingInConv}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherParticipant?.user.avatarUrl} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  {otherParticipant && onlineUsers.has(otherParticipant.userId) && (
                    <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{displayName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {otherParticipant && onlineUsers.has(otherParticipant.userId) 
                      ? 'Online' 
                      : 'Offline'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCallInitiate?.(selectedConversationId, 'audio')}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVideoMeetingJoin?.(selectedConversationId)}
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messagesError ? (
                <div className="text-center text-red-500">
                  Failed to load messages
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  Start your conversation with {displayName}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === user?.id;
                    const prevMessage = messages[index - 1];
                    const showAvatar = !prevMessage || 
                      prevMessage.senderId !== message.senderId ||
                      differenceInMinutes(new Date(message.createdAt), new Date(prevMessage.createdAt)) > 5;

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                        onReact={(emoji) => addReaction(message.id, emoji)}
                        onReply={() => setReplyToMessage(message)}
                        onEdit={isOwn ? () => setEditingMessage(message) : undefined}
                        onDelete={isOwn ? () => {
                          // Handle delete
                          toast.info('Delete functionality coming soon');
                        } : undefined}
                        onCopy={() => {}}
                        onForward={() => toast.info('Forward functionality coming soon')}
                        onReport={() => toast.info('Report functionality coming soon')}
                      />
                    );
                  })}
                  
                  {/* Typing indicator */}
                  <TypingIndicator users={currentTypingUsers} />
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Reply indicator */}
            {replyToMessage && (
              <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Reply className="h-4 w-4" />
                  <span className="text-muted-foreground">Replying to:</span>
                  <span className="truncate max-w-xs">{replyToMessage.content}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyToMessage(null)}
                >
                  ✕
                </Button>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <div className="flex gap-1">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 relative">
                  <Input
                    ref={messageInputRef}
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    disabled={isSendingMessage}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSendingMessage}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}