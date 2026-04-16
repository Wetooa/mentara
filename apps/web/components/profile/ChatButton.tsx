"use client";

import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useStartConversationSimple } from '@/hooks/messaging';
import { useAuth } from '@/contexts/AuthContext';

interface ChatButtonProps {
  targetUserId: string;
  targetUserName?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
}

/**
 * Chat button component for starting conversations with other users
 * Handles validation, loading states, and navigation to messages
 */
export function ChatButton({ 
  targetUserId, 
  targetUserName = 'this person', // eslint-disable-line @typescript-eslint/no-unused-vars
  variant = 'default',
  size = 'default',
  className,
  disabled = false
}: ChatButtonProps) {
  const { user: currentUser } = useAuth();
  const { startConversation, isStarting } = useStartConversationSimple();

  // Don't show chat button for own profile
  if (currentUser?.id === targetUserId) {
    return null;
  }

  // Don't show chat button if user is not authenticated
  if (!currentUser?.id) {
    return null;
  }

  // Don't show chat button if user's role cannot initiate conversations
  if (currentUser.role && !['client', 'therapist', 'moderator', 'admin'].includes(currentUser.role)) {
    return null;
  }

  const handleChatClick = () => {
    if (isStarting || disabled) return;
    
    startConversation(targetUserId);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleChatClick}
      disabled={disabled || isStarting}
    >
      {isStarting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4 mr-2" />
      )}
      {isStarting ? 'Starting...' : 'Chat'}
    </Button>
  );
}

/**
 * Compact chat button variant for smaller spaces
 */
export function ChatButtonCompact({ 
  targetUserId,
  className,
  disabled = false
}: Pick<ChatButtonProps, 'targetUserId' | 'className' | 'disabled'>) {
  return (
    <ChatButton
      targetUserId={targetUserId}
      variant="outline"
      size="sm"
      className={className}
      disabled={disabled}
    />
  );
}

/**
 * Chat icon button (icon only, no text)
 */
export function ChatIconButton({ 
  targetUserId,
  className,
  disabled = false
}: Pick<ChatButtonProps, 'targetUserId' | 'className' | 'disabled'>) {
  const { user: currentUser } = useAuth();
  const { startConversation, isStarting } = useStartConversationSimple();

  // Don't show chat button for own profile
  if (currentUser?.id === targetUserId) {
    return null;
  }

  // Don't show chat button if user is not authenticated
  if (!currentUser?.id) {
    return null;
  }

  // Don't show chat button if user's role cannot initiate conversations
  if (currentUser.role && !['client', 'therapist', 'moderator', 'admin'].includes(currentUser.role)) {
    return null;
  }

  const handleChatClick = () => {
    if (isStarting || disabled) return;
    startConversation(targetUserId);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleChatClick}
      disabled={disabled || isStarting}
    >
      {isStarting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
    </Button>
  );
}

export default ChatButton;