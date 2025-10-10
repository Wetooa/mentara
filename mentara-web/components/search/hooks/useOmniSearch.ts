import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useApi } from '@/lib/api';
import { type EntityType } from '../OmniSearchBar';
import { type GlobalSearchResponse, type GlobalSearchParams } from '@/lib/api/services/search';

export interface UseOmniSearchOptions {
  enabled?: boolean;
  staleTime?: number;
  debounceMs?: number;
  minQueryLength?: number;
}

export interface OmniSearchHookResult {
  search: (query: string, types?: EntityType[]) => void;
  results: GlobalSearchResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  clear: () => void;
  refetch: () => void;
}

/**
 * Hook for omnisearch functionality with React Query integration
 */
export function useOmniSearch(
  query: string,
  types?: EntityType[],
  options: UseOmniSearchOptions = {}
): OmniSearchHookResult {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    minQueryLength = 2,
  } = options;

  const api = useApi();
  const queryClient = useQueryClient();

  // Prepare search parameters
  const searchParams = useMemo((): GlobalSearchParams => ({
    query: query.trim(),
    types: types && types.length > 0 ? types : undefined,
  }), [query, types]);

  // Query key for caching
  const queryKey = useMemo(() => [
    'search',
    'global',
    searchParams.query,
    searchParams.types,
  ], [searchParams]);

  // React Query for search
  const {
    data: results,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => api.search.global(searchParams),
    enabled: enabled && searchParams.query.length >= minQueryLength,
    staleTime,
    // Cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry on error (but not on 400-499 errors)
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    // Don't refetch on window focus for search results
    refetchOnWindowFocus: false,
  });

  // Search function that can be called manually
  const search = useCallback((newQuery: string, newTypes?: EntityType[]) => {
    const newParams: GlobalSearchParams = {
      query: newQuery.trim(),
      types: newTypes && newTypes.length > 0 ? newTypes : undefined,
    };

    queryClient.fetchQuery({
      queryKey: ['search', 'global', newParams.query, newParams.types],
      queryFn: () => api.search.global(newParams),
      staleTime,
    });
  }, [api, queryClient, staleTime]);

  // Clear function
  const clear = useCallback(() => {
    // Remove all search queries from cache
    queryClient.removeQueries({ 
      queryKey: ['search', 'global'],
      exact: false 
    });
  }, [queryClient]);

  return {
    search,
    results,
    isLoading,
    isError,
    error: error as Error | null,
    clear,
    refetch,
  };
}

/**
 * Hook for search suggestions/autocomplete
 */
export function useSearchSuggestions(query: string, enabled = true) {
  const api = useApi();

  return useQuery({
    queryKey: ['search', 'suggestions', query],
    queryFn: () => api.search.suggestions(query),
    enabled: enabled && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for trending searches
 */
export function useTrendingSearches() {
  const api = useApi();

  return useQuery({
    queryKey: ['search', 'trending'],
    queryFn: () => api.search.trending(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for managing search history with mutations
 */
export function useSearchHistory() {
  const api = useApi();
  const queryClient = useQueryClient();

  const { data: recentSearches, isLoading } = useQuery({
    queryKey: ['search', 'recent'],
    queryFn: () => api.search.recent(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      // This would require a backend endpoint to clear user's search history
      // For now, just clear local cache
      queryClient.removeQueries({ queryKey: ['search', 'recent'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'recent'] });
    },
  });

  return {
    recentSearches: recentSearches || [],
    isLoading,
    clearHistory: clearHistory.mutate,
    isClearing: clearHistory.isPending,
  };
}

/**
 * Advanced search hook with pagination and filters
 */
export function useAdvancedSearch(params: {
  query: string;
  types?: EntityType[];
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}, enabled = true) {
  const api = useApi();

  return useQuery({
    queryKey: ['search', 'advanced', params],
    queryFn: () => api.search.advanced(params),
    enabled: enabled && params.query.length >= 2,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true, // Keep previous data while loading new page
  });
}

/**
 * Hook for prefetching search results (useful for search suggestions)
 */
export function usePrefetchSearch() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useCallback((query: string, types?: EntityType[]) => {
    if (query.length < 2) return;

    const searchParams: GlobalSearchParams = {
      query: query.trim(),
      types: types && types.length > 0 ? types : undefined,
    };

    queryClient.prefetchQuery({
      queryKey: ['search', 'global', searchParams.query, searchParams.types],
      queryFn: () => api.search.global(searchParams),
      staleTime: 5 * 60 * 1000,
    });
  }, [api, queryClient]);
}