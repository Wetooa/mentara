import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

// Hook for managing favorite therapists
export function useFavorites() {
  const { userId } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (userId) {
      const storedFavorites = localStorage.getItem(`therapist-favorites-${userId}`);
      if (storedFavorites) {
        try {
          setFavorites(JSON.parse(storedFavorites));
        } catch (error) {
          console.error('Failed to parse stored favorites:', error);
          setFavorites([]);
        }
      }
      setIsLoaded(true);
    }
  }, [userId]);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    if (userId && isLoaded) {
      localStorage.setItem(`therapist-favorites-${userId}`, JSON.stringify(favorites));
    }
  }, [favorites, userId, isLoaded]);

  const isFavorite = (therapistId: string): boolean => {
    return favorites.includes(therapistId);
  };

  const addFavorite = (therapistId: string) => {
    setFavorites(prev => {
      if (!prev.includes(therapistId)) {
        return [...prev, therapistId];
      }
      return prev;
    });
  };

  const removeFavorite = (therapistId: string) => {
    setFavorites(prev => prev.filter(id => id !== therapistId));
  };

  const toggleFavorite = (therapistId: string) => {
    if (isFavorite(therapistId)) {
      removeFavorite(therapistId);
    } else {
      addFavorite(therapistId);
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    isLoaded,
  };
}