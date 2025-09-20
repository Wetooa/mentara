'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/components/search/UserSearchItem';

const RECENT_SEARCHES_KEY = 'mentara_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
  user?: User;
}

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save recent searches to localStorage
  const saveToStorage = useCallback((searches: RecentSearch[]) => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }, []);

  // Add a new search to recent searches
  const addRecentSearch = useCallback((query: string, user?: User) => {
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
      user,
    };

    setRecentSearches(prev => {
      // Remove existing search with same query (to avoid duplicates)
      const filtered = prev.filter(search => 
        search.query.toLowerCase() !== query.toLowerCase()
      );
      
      // Add new search at the beginning
      const updated = [newSearch, ...filtered];
      
      // Keep only the most recent searches
      const trimmed = updated.slice(0, MAX_RECENT_SEARCHES);
      
      // Save to localStorage
      saveToStorage(trimmed);
      
      return trimmed;
    });
  }, [saveToStorage]);

  // Remove a specific recent search
  const removeRecentSearch = useCallback((id: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(search => search.id !== id);
      saveToStorage(filtered);
      return filtered;
    });
  }, [saveToStorage]);

  // Clear all recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }, []);

  // Get recent search queries only
  const getRecentQueries = useCallback(() => {
    return recentSearches.map(search => search.query);
  }, [recentSearches]);

  // Get recent searches for a specific user
  const getRecentSearchesForUser = useCallback((userId: string) => {
    return recentSearches.filter(search => search.user?.id === userId);
  }, [recentSearches]);

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    getRecentQueries,
    getRecentSearchesForUser,
  };
};

export default useRecentSearches;