"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Contact } from '@/components/messages/types';
import { createMessagingApiService } from '@/lib/messaging-api';

export function useContacts() {
  const { accessToken, isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagingApi = accessToken ? createMessagingApiService(() => Promise.resolve(accessToken)) : null;

  const loadContacts = useCallback(async () => {
    if (!messagingApi || !isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const contactsData = await messagingApi.getContacts();
      setContacts(contactsData);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [messagingApi, isAuthenticated]);

  const searchContacts = useCallback(async (query: string): Promise<Contact[]> => {
    if (!messagingApi) return [];
    
    try {
      return await messagingApi.searchContacts(query);
    } catch (err) {
      console.error('Failed to search contacts:', err);
      return [];
    }
  }, [messagingApi]);

  const addContact = useCallback(async (userId: string) => {
    if (!messagingApi) return;
    
    try {
      await messagingApi.addContact(userId);
      await loadContacts(); // Refresh contacts list
    } catch (err) {
      console.error('Failed to add contact:', err);
      throw err;
    }
  }, [messagingApi, loadContacts]);

  const removeContact = useCallback(async (contactId: string) => {
    if (!messagingApi) return;
    
    try {
      await messagingApi.removeContact(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
    } catch (err) {
      console.error('Failed to remove contact:', err);
      throw err;
    }
  }, [messagingApi]);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return {
    contacts,
    isLoading,
    error,
    loadContacts,
    searchContacts,
    addContact,
    removeContact,
  };
}