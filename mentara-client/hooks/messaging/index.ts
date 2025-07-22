"use client";

import { useContacts } from './useContacts';
import { useConversations } from './useConversations';
import { useMessagingWebSocket } from './useWebSocket';
import { useEffect } from 'react';

/**
 * Combined messaging hook that maintains backward compatibility
 */
export function useMessaging() {
  const contacts = useContacts();
  const conversations = useConversations();
  const webSocket = useMessagingWebSocket();

  // Set up WebSocket event handlers
  useEffect(() => {
    const unsubscribeMessage = webSocket.subscribeToMessages((message) => {
      // Handle new messages received via WebSocket
      // This would update the conversations state
    });

    const unsubscribeTyping = webSocket.subscribeToTyping((data) => {
      // Handle typing indicators
    });

    const unsubscribeStatus = webSocket.subscribeToUserStatus((data) => {
      // Handle user online/offline status
    });

    return () => {
      unsubscribeMessage?.();
      unsubscribeTyping?.();
      unsubscribeStatus?.();
    };
  }, [webSocket]);

  return {
    // Contacts
    contacts: contacts.contacts,
    isLoadingContacts: contacts.isLoading,
    
    // Conversations
    conversations: conversations.conversations,
    selectedContactId: conversations.selectedContactId,
    isLoadingMessages: conversations.isLoadingMessages,
    
    // Combined error state
    error: contacts.error || conversations.error || webSocket.error,
    
    // Actions
    selectContact: conversations.selectContact,
    sendMessage: conversations.sendMessage,
    markAsRead: conversations.markAsRead,
    addReaction: conversations.addReaction,
    removeReaction: conversations.removeReaction,
    searchMessages: conversations.searchMessages,
    sendTypingIndicator: webSocket.sendTypingIndicator,
    joinConversation: webSocket.joinConversation,
    leaveConversation: webSocket.leaveConversation,
    
    // Connection status
    isConnected: webSocket.isConnected,
  };
}

// Export individual hooks for specific use cases
export { useContacts } from './useContacts';
export { useConversations } from './useConversations';
export { useMessagingWebSocket } from './useWebSocket';