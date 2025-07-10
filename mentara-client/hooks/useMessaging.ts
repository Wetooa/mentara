"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Contact, Conversation, Message } from '@/components/messages/types';
import { messagingWebSocket } from '@/lib/messaging-websocket';
import { 
  useMessagingContacts, 
  useConversation, 
  useSendMessage, 
  useMarkMessageAsRead, 
  useAddMessageReaction, 
  useRemoveMessageReaction 
} from './useMessagingQueries';

export interface UseMessagingReturn {
  // State
  contacts: Contact[];
  conversations: Map<string, Conversation>;
  selectedContactId: string | null;
  isLoadingContacts: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  
  // Actions
  selectContact: (contactId: string) => void;
  sendMessage: (text: string, attachments?: any[]) => Promise<void>;
  markAsRead: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  sendTyping: (isTyping: boolean) => void;
  searchMessages: (query: string) => Promise<Message[]>;
  
  // Connection status
  isConnected: boolean;
}

export function useMessaging(): UseMessagingReturn {
  // Clerk authentication
  const { getToken, isLoaded } = useAuth();
  
  // Local state for messaging
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());
  
  // Refs for preventing stale closures
  const selectedContactIdRef = useRef(selectedContactId);
  
  // Update refs when state changes
  useEffect(() => {
    selectedContactIdRef.current = selectedContactId;
  }, [selectedContactId]);
  
  // React Query hooks
  const { 
    data: contacts = [], 
    isLoading: isLoadingContacts, 
    error: contactsError 
  } = useMessagingContacts();
  
  const { 
    data: selectedConversation, 
    isLoading: isLoadingMessages, 
    error: conversationError 
  } = useConversation(selectedContactId || '');
  
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessageAsRead();
  const addReactionMutation = useAddMessageReaction();
  const removeReactionMutation = useRemoveMessageReaction();
  
  // Auto-select first contact if none selected
  useEffect(() => {
    if (!selectedContactId && contacts && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);
  
  // Update conversations map when selected conversation changes
  useEffect(() => {
    if (selectedConversation && selectedContactId) {
      setConversations(prev => {
        const newMap = new Map(prev);
        newMap.set(selectedContactId, selectedConversation);
        return newMap;
      });
    }
  }, [selectedConversation, selectedContactId]);
  
  // WebSocket event handlers
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    
    const handleError = (error: string) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    const handleNewMessage = (message: Message) => {
      // Find which conversation this message belongs to
      const conversationId = selectedContactIdRef.current;
      
      if (conversationId) {
        setConversations(prev => {
          const newConversations = new Map(prev);
          const conversation = newConversations.get(conversationId);
          if (conversation) {
            newConversations.set(conversationId, {
              ...conversation,
              messages: [...conversation.messages, message],
            });
          }
          return newConversations;
        });
      }
    };
    
    const handleTypingIndicator = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      // Update contact typing status
      // This would need to be implemented in the contacts query or local state
    };
    
    const handleUserStatus = (data: { userId: string; status: 'online' | 'offline' }) => {
      // Update contact status
      // This would need to be implemented in the contacts query or local state
    };
    
    // Subscribe to WebSocket events
    messagingWebSocket.on('connected', handleConnect);
    messagingWebSocket.on('disconnected', handleDisconnect);
    messagingWebSocket.on('error', handleError);
    messagingWebSocket.on('new_message', handleNewMessage);
    messagingWebSocket.on('typing_indicator', handleTypingIndicator);
    messagingWebSocket.on('user_status_changed', handleUserStatus);
    
    // Cleanup
    return () => {
      messagingWebSocket.off('connected', handleConnect);
      messagingWebSocket.off('disconnected', handleDisconnect);
      messagingWebSocket.off('error', handleError);
      messagingWebSocket.off('new_message', handleNewMessage);
      messagingWebSocket.off('typing_indicator', handleTypingIndicator);
      messagingWebSocket.off('user_status_changed', handleUserStatus);
    };
  }, []);
  
  // Connect to WebSocket with Clerk authentication
  useEffect(() => {
    if (!isLoaded || !getToken) return;
    
    const initializeWebSocket = async () => {
      try {
        messagingWebSocket.connectWithTokenFunction(getToken);
      } catch (error) {
        console.error('Failed to initialize WebSocket connection:', error);
      }
    };
    
    initializeWebSocket();
    
    return () => {
      messagingWebSocket.cleanup();
    };
  }, [isLoaded, getToken]);
  
  // Select contact and load conversation
  const selectContact = useCallback(async (contactId: string) => {
    // Leave previous conversation room
    if (selectedContactIdRef.current) {
      messagingWebSocket.leaveConversation(selectedContactIdRef.current);
    }
    
    setSelectedContactId(contactId);
    
    // Join new conversation room
    messagingWebSocket.joinConversation(contactId);
  }, []);
  
  // Send message
  const sendMessage = useCallback(async (text: string, attachments?: any[]) => {
    const currentContactId = selectedContactIdRef.current;
    
    if (!currentContactId) {
      throw new Error('No conversation selected');
    }
    
    await sendMessageMutation.mutateAsync({
      conversationId: currentContactId,
      content: text,
      attachments,
    });
  }, [sendMessageMutation]);
  
  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    await markAsReadMutation.mutateAsync(messageId);
  }, [markAsReadMutation]);
  
  // Add reaction to message
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    await addReactionMutation.mutateAsync({ messageId, emoji });
  }, [addReactionMutation]);
  
  // Remove reaction from message
  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    await removeReactionMutation.mutateAsync({ messageId, emoji });
  }, [removeReactionMutation]);
  
  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    const currentContactId = selectedContactIdRef.current;
    if (currentContactId) {
      messagingWebSocket.sendTypingIndicator(currentContactId, isTyping);
    }
  }, []);
  
  // Search messages
  const searchMessages = useCallback(async (query: string): Promise<Message[]> => {
    const currentContactId = selectedContactIdRef.current;
    
    // For now, we'll use a simple approach - in a real implementation, 
    // you'd want to use the useSearchMessages hook with proper state management
    try {
      // This is a simplified implementation - in practice, you'd want to manage
      // the search state differently to avoid direct API calls in the hook
      return [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }, []);
  
  // Determine error state
  const error = contactsError?.message || conversationError?.message || null;
  
  return {
    // State
    contacts: contacts || [],
    conversations,
    selectedContactId,
    isLoadingContacts,
    isLoadingMessages,
    error,
    
    // Actions
    selectContact,
    sendMessage,
    markAsRead,
    addReaction,
    removeReaction,
    sendTyping,
    searchMessages,
    
    // Connection status
    isConnected,
  };
}
