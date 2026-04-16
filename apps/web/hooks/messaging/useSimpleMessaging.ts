"use client";

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from './useMessaging';
import { groupMessagesByDate, formatDateLabel } from '@/lib/utils/messageUtils';
import type { Message, Conversation } from '@/components/messages/types';

/**
 * Simplified messaging hook that wraps useMessaging 
 * for easy use in message components like MessageChatArea
 * Now uses the new simplified useMessaging hook
 */
export function useSimpleMessaging(params: {
  conversationId?: string;
  enableRealtime?: boolean;
} = {}) {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    conversationsError,
    messagesError,
    sendMessage: sendRealtimeMessage,
    markAsRead,
    addReaction,
    removeReaction,
    sendTypingIndicator,
    uploadFile,
    refetchConversations,
    refetchMessages,
    connectionState,
    typingUsers,
    onlineUsers,
    isSendingMessage,
    isMarkingAsRead,
    isAddingReaction,
  } = useMessaging(params);

  // Convert backend messages to frontend Message format
  const convertedMessages: Message[] = useMemo(() => {
    if (!messages) return [];
    
    // Ensure user context is current before comparing
    const currentUserId = user?.id;
    if (!currentUserId) {
      console.warn('User context not available for message sender detection');
    }
    
    return messages.map(msg => {
      // Validate senderId is present
      if (!msg.senderId) {
        console.warn('Message missing senderId:', msg.id);
      }
      
      // Compare senderId from message with current user ID
      // Always use message.senderId as the source of truth
      const isOwnMessage = currentUserId && msg.senderId === currentUserId;
      
      return {
        id: msg.id,
        sender: isOwnMessage ? 'me' : 'them',
      text: msg.content,
      time: new Date(msg.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: msg.isRead ? 'read' : 'delivered',
      attachments: msg.attachments?.map(att => ({
        id: att.id || crypto.randomUUID(),
        type: att.mimeType?.startsWith('image/') ? 'image' as const : 'document' as const,
        url: att.url,
        name: att.fileName,
        size: att.fileSize,
      })) || [],
      reactions: msg.reactions?.map(r => ({
        emoji: r.emoji,
        count: 1, // TODO: Group reactions properly
        users: [r.userId],
      })) || [],
      replyTo: msg.replyToId,
      isDeleted: msg.isDeleted,
      };
    });
  }, [messages, user?.id]);

  // Group messages by date for display
  const messageGroups = useMemo(() => {
    return groupMessagesByDate(convertedMessages);
  }, [convertedMessages]);

  // Create a conversation object for compatibility
  const currentConversation: Conversation | undefined = useMemo(() => {
    if (!params.conversationId || !convertedMessages.length) return undefined;
    
    return {
      id: params.conversationId,
      contactId: params.conversationId,
      messages: convertedMessages,
      lastReadMessageId: convertedMessages
        .filter(m => m.status === 'read')
        .pop()?.id,
    };
  }, [params.conversationId, convertedMessages]);

  // Simplified send message function
  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!params.conversationId) return;

    let attachmentData: { url: string; fileName: string; fileSize: number; mimeType: string }[] = [];
    
    // Upload files if provided
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        try {
          const uploadResult = await uploadFile(file);
          attachmentData.push({
            url: uploadResult.url,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          });
        } catch (error) {
          console.error('Failed to upload file:', error);
          throw error;
        }
      }
    }

    // Send the message
    sendRealtimeMessage(content, {
      messageType: 'TEXT',
      attachments: attachmentData,
    });
  };

  // Get contact by ID (simplified - in real app this would come from contacts API)
  const getContactById = (contactId: string) => {
    // This would normally fetch contact info from the API
    return {
      id: contactId,
      name: 'Contact Name', // Placeholder
      status: 'online' as const,
      lastMessage: convertedMessages[convertedMessages.length - 1]?.text || '',
      time: convertedMessages[convertedMessages.length - 1]?.time || '',
      unread: 0,
    };
  };

  // Check if user is typing
  const getTypingStatus = () => {
    return typingUsers.filter(t => t.conversationId === params.conversationId);
  };

  return {
    // Data
    conversation: currentConversation,
    messages: convertedMessages,
    messageGroups,
    conversations, // Raw backend conversations
    
    // Contact helpers
    getContactById,
    
    // Loading states
    isLoadingMessages,
    isLoadingConversations,
    isSendingMessage,
    isMarkingAsRead,
    isAddingReaction,
    
    // Error states
    error: messagesError || conversationsError,
    conversationsError,
    messagesError,
    
    // Connection state
    connectionState,
    isConnected: connectionState.isConnected,
    
    // Real-time features
    typingUsers: getTypingStatus(),
    onlineUsers,
    
    // Actions
    sendMessage,
    markAsRead,
    addReaction,
    removeReaction,
    sendTypingIndicator,
    uploadFile,
    
    // Utilities
    refetchMessages,
    refetchConversations,
    formatDateLabel,
    groupMessagesByDate: (msgs: Message[]) => groupMessagesByDate(msgs),
  };
}