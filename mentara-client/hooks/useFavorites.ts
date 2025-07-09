import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from '@clerk/nextjs';
import { toast } from "sonner";

/**
 * Hook for managing favorite therapists with backend sync
 */
export function useFavorites() {
  const { userId } = useAuth();
  const api = useApi();
  const queryClient = useQueryClient();
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  // Load favorites from localStorage initially
  useEffect(() => {
    if (userId) {
      const storedFavorites = localStorage.getItem(`therapist-favorites-${userId}`);
      if (storedFavorites) {
        try {
          setLocalFavorites(JSON.parse(storedFavorites));
        } catch (error) {
          console.error('Failed to parse stored favorites:', error);
          setLocalFavorites([]);
        }
      }
      setIsLocalLoaded(true);
    }
  }, [userId]);

  // Get favorites from backend
  const {
    data: backendFavorites,
    isLoading: isLoadingBackend,
    error: backendError,
  } = useQuery({
    queryKey: queryKeys.users.favorites(userId || ''),
    queryFn: () => api.users.getFavorites(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => {
      // Sync backend data to localStorage
      if (data && userId) {
        const favoriteIds = data.map((fav: any) => fav.therapistId);
        setLocalFavorites(favoriteIds);
        localStorage.setItem(`therapist-favorites-${userId}`, JSON.stringify(favoriteIds));
      }
    },
  });

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: (therapistId: string) => api.users.addFavorite(therapistId),
    onMutate: async (therapistId) => {
      // Optimistic update
      setLocalFavorites(prev => {
        if (!prev.includes(therapistId)) {
          const newFavorites = [...prev, therapistId];
          if (userId) {
            localStorage.setItem(`therapist-favorites-${userId}`, JSON.stringify(newFavorites));
          }
          return newFavorites;
        }
        return prev;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.favorites(userId || '') });
    },
    onError: (error: any, therapistId) => {
      // Rollback optimistic update
      setLocalFavorites(prev => prev.filter(id => id !== therapistId));
      toast.error("Failed to add favorite");
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (therapistId: string) => api.users.removeFavorite(therapistId),
    onMutate: async (therapistId) => {
      // Optimistic update
      setLocalFavorites(prev => {
        const newFavorites = prev.filter(id => id !== therapistId);
        if (userId) {
          localStorage.setItem(`therapist-favorites-${userId}`, JSON.stringify(newFavorites));
        }
        return newFavorites;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.favorites(userId || '') });
    },
    onError: (error: any, therapistId) => {
      // Rollback optimistic update
      setLocalFavorites(prev => {
        if (!prev.includes(therapistId)) {
          return [...prev, therapistId];
        }
        return prev;
      });
      toast.error("Failed to remove favorite");
    },
  });

  // Use backend data if available, otherwise use local data
  const favorites = backendFavorites?.map((fav: any) => fav.therapistId) || localFavorites;
  const isLoaded = isLocalLoaded && !isLoadingBackend;

  const isFavorite = (therapistId: string): boolean => {
    return favorites.includes(therapistId);
  };

  const addFavorite = (therapistId: string) => {
    if (!isFavorite(therapistId)) {
      addFavoriteMutation.mutate(therapistId);
    }
  };

  const removeFavorite = (therapistId: string) => {
    if (isFavorite(therapistId)) {
      removeFavoriteMutation.mutate(therapistId);
    }
  };

  const toggleFavorite = (therapistId: string) => {
    if (isFavorite(therapistId)) {
      removeFavorite(therapistId);
    } else {
      addFavorite(therapistId);
    }
  };

  const clearFavorites = async () => {
    // Clear all favorites by removing them one by one
    for (const therapistId of favorites) {
      removeFavoriteMutation.mutate(therapistId);
    }
  };

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    isLoaded,
    isLoading: isLoadingBackend || addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
    error: backendError,
  };
}