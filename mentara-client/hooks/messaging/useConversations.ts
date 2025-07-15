"use client";

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message } from '@/components/messages/types';
import { createMessagingApiService } from '@/lib/messaging-api';
import type { MessageAttachment } from '@/types/api/messaging';

export function useConversations() {
  const { accessToken } = useAuth();
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const messagingApi = accessToken ? createMessagingApiService(() => Promise.resolve(accessToken)) : null;

  const selectContact = useCallback(async (contactId: string) => {
    setSelectedContactId(contactId);
    
    if (!messagingApi || conversationsRef.current.has(contactId)) return;

    try {
      setIsLoadingMessages(true);
      setError(null);
      const messages = await messagingApi.getMessages(contactId);
      
      const conversation: Conversation = {
        contactId,
        messages,
        lastMessage: messages[messages.length - 1] || null,
        unreadCount: messages.filter(m => !m.isRead && m.senderId !== 'current-user').length,
        isTyping: false,
      };

      setConversations(prev => new Map(prev).set(contactId, conversation));
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [messagingApi]);

  const sendMessage = useCallback(async (text: string, attachments?: MessageAttachment[]) => {
    if (!selectedContactId || !messagingApi) return;

    try {
      const message = await messagingApi.sendMessage(selectedContactId, text, attachments);
      
      setConversations(prev => {
        const newConversations = new Map(prev);
        const conversation = newConversations.get(selectedContactId);
        
        if (conversation) {
          const updatedConversation = {
            ...conversation,
            messages: [...conversation.messages, message],
            lastMessage: message,
          };
          newConversations.set(selectedContactId, updatedConversation);
        }
        
        return newConversations;
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [selectedContactId, messagingApi]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!messagingApi) return;

    try {
      await messagingApi.markAsRead(messageId);
      
      setConversations(prev => {
        const newConversations = new Map(prev);
        
        for (const [contactId, conversation] of newConversations) {
          const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
          if (messageIndex !== -1) {
            const updatedMessages = [...conversation.messages];
            updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], isRead: true };
            
            const updatedConversation = {
              ...conversation,
              messages: updatedMessages,
              unreadCount: updatedMessages.filter(m => !m.isRead && m.senderId !== 'current-user').length,
            };
            
            newConversations.set(contactId, updatedConversation);
            break;
          }
        }
        
        return newConversations;
      });
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  }, [messagingApi]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!messagingApi) return;

    try {
      await messagingApi.addReaction(messageId, emoji);
      
      setConversations(prev => {
        const newConversations = new Map(prev);
        
        for (const [contactId, conversation] of newConversations) {
          const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
          if (messageIndex !== -1) {
            const updatedMessages = [...conversation.messages];
            const message = updatedMessages[messageIndex];
            const reactions = message.reactions || [];
            
            updatedMessages[messageIndex] = {
              ...message,
              reactions: [...reactions, { emoji, userId: 'current-user' }],
            };
            
            newConversations.set(contactId, { ...conversation, messages: updatedMessages });
            break;
          }
        }
        
        return newConversations;
      });
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  }, [messagingApi]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!messagingApi) return;

    try {
      await messagingApi.removeReaction(messageId, emoji);
      
      setConversations(prev => {
        const newConversations = new Map(prev);
        
        for (const [contactId, conversation] of newConversations) {
          const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
          if (messageIndex !== -1) {
            const updatedMessages = [...conversation.messages];
            const message = updatedMessages[messageIndex];
            
            updatedMessages[messageIndex] = {
              ...message,
              reactions: (message.reactions || []).filter(r => !(r.emoji === emoji && r.userId === 'current-user')),
            };
            
            newConversations.set(contactId, { ...conversation, messages: updatedMessages });
            break;
          }
        }
        
        return newConversations;
      });
    } catch (err) {
      console.error('Failed to remove reaction:', err);
    }
  }, [messagingApi]);

  const searchMessages = useCallback(async (query: string): Promise<Message[]> => {
    if (!messagingApi) return [];
    
    try {
      return await messagingApi.searchMessages(query);
    } catch (err) {
      console.error('Failed to search messages:', err);
      return [];
    }
  }, [messagingApi]);

  return {
    conversations,
    selectedContactId,
    isLoadingMessages,
    error,
    selectContact,
    sendMessage,
    markAsRead,
    addReaction,
    removeReaction,
    searchMessages,
  };
}