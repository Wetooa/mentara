"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Contact, Conversation, Message, MessagesState } from '@/components/messages/types';
import { messagingApi } from '@/lib/messaging-api';
import { messagingWebSocket } from '@/lib/messaging-websocket';

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
  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs for preventing stale closures
  const contactsRef = useRef(contacts);
  const conversationsRef = useRef(conversations);
  const selectedContactIdRef = useRef(selectedContactId);
  
  // Update refs when state changes
  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);
  
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  
  useEffect(() => {
    selectedContactIdRef.current = selectedContactId;
  }, [selectedContactId]);
  
  // Load initial contacts
  const loadContacts = useCallback(async () => {
    setIsLoadingContacts(true);
    setError(null);
    
    try {
      const fetchedContacts = await messagingApi.fetchContacts();
      setContacts(fetchedContacts);
      
      // Auto-select first contact if none selected
      if (!selectedContactId && fetchedContacts.length > 0) {
        setSelectedContactId(fetchedContacts[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
      console.error('Error loading contacts:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [selectedContactId]);
  
  // Load conversation messages
  const loadConversation = useCallback(async (contactId: string) => {
    if (conversations.has(contactId)) {
      return; // Already loaded
    }
    
    setIsLoadingMessages(true);
    setError(null);
    
    try {
      const conversation = await messagingApi.fetchConversation(contactId);
      if (conversation) {
        setConversations(prev => new Map(prev.set(contactId, conversation)));
        
        // Join WebSocket room for this conversation
        messagingWebSocket.joinConversation(contactId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
      console.error('Error loading conversation:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversations]);
  
  // Select contact and load conversation
  const selectContact = useCallback(async (contactId: string) => {
    // Leave previous conversation room
    if (selectedContactId) {
      messagingWebSocket.leaveConversation(selectedContactId);
    }
    
    setSelectedContactId(contactId);
    await loadConversation(contactId);
  }, [selectedContactId, loadConversation]);
  
  // Send message
  const sendMessage = useCallback(async (text: string, attachments?: any[]) => {
    if (!selectedContactId) {
      throw new Error('No conversation selected');
    }
    
    try {
      const message = await messagingApi.sendMessage(selectedContactId, text, attachments);
      
      // Update local conversation
      setConversations(prev => {
        const newConversations = new Map(prev);
        const conversation = newConversations.get(selectedContactId);
        if (conversation) {
          newConversations.set(selectedContactId, {
            ...conversation,
            messages: [...conversation.messages, message],
          });
        }
        return newConversations;
      });
      
      // Update contact's last message
      setContacts(prev => prev.map(contact => 
        contact.id === selectedContactId
          ? { ...contact, lastMessage: text, time: message.time }
          : contact
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [selectedContactId]);
  
  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await messagingApi.markMessageAsRead(messageId);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, []);
  
  // Add reaction to message
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await messagingApi.addMessageReaction(messageId, emoji);
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  }, []);
  
  // Remove reaction from message
  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await messagingApi.removeMessageReaction(messageId, emoji);
    } catch (err) {
      console.error('Error removing reaction:', err);
    }
  }, []);
  
  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    if (selectedContactId) {
      messagingWebSocket.sendTypingIndicator(selectedContactId, isTyping);
    }
  }, [selectedContactId]);
  
  // Search messages
  const searchMessages = useCallback(async (query: string): Promise<Message[]> => {
    try {
      return await messagingApi.searchMessages(query, selectedContactId || undefined);
    } catch (err) {
      console.error('Error searching messages:', err);
      return [];
    }
  }, [selectedContactId]);
  
  // WebSocket event handlers
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    
    const handleError = (error: string) => {
      setError(error);
      setIsConnected(false);
    };
    
    const handleNewMessage = (message: Message) => {
      // Find which conversation this message belongs to
      // (You'll need to enhance this based on your message structure)
      const conversationId = selectedContactIdRef.current; // Simplified for now
      
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
        
        // Update contact's last message if it's not from current user
        if (message.sender === 'them') {
          setContacts(prev => prev.map(contact => 
            contact.id === conversationId
              ? { ...contact, lastMessage: message.text, time: message.time, unread: contact.unread + 1 }
              : contact
          ));
        }
      }
    };
    
    const handleTypingIndicator = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      setContacts(prev => prev.map(contact => 
        contact.id === data.conversationId
          ? { ...contact, isTyping: data.isTyping }
          : contact
      ));
    };
    
    const handleUserStatus = (data: { userId: string; status: 'online' | 'offline' }) => {
      setContacts(prev => prev.map(contact => {
        // You'll need to map userId to contactId based on your data structure
        return { ...contact, status: data.status };
      }));
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
  
  // Initialize data on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);
  
  // Connect to WebSocket
  useEffect(() => {
    // TODO: Get auth token from your auth context/store
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (authToken) {
      messagingWebSocket.connect(authToken);
    }
    
    return () => {
      messagingWebSocket.cleanup();
    };
  }, []);
  
  return {
    // State
    contacts,
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