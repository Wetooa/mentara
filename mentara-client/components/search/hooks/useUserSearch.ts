'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { User } from '../UserSearchItem';

export interface SearchUsersResponse {
  users: User[];
  total: number;
  hasMore: boolean;
}

export interface SearchUsersParams {
  query: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const useUserSearch = () => {
  const api = useApi();

  const searchUsers = async (query: string, role?: string, page = 1, limit = 20): Promise<User[]> => {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      // Use the existing search service
      const response = await api.search.users(query.trim(), role);
      
      // Handle the response data - it might be wrapped in a data property
      const users = response.data || response || [];
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  };

  const useSearchUsersQuery = (params: SearchUsersParams) => {
    const { query, role, page = 1, limit = 20 } = params;
    
    return useQuery({
      queryKey: ['search', 'users', query, role, page, limit],
      queryFn: () => searchUsers(query, role, page, limit),
      enabled: query.trim().length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'response' in error) {
          const response = error.response as any;
          if (response?.status >= 400 && response?.status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    });
  };

  const searchUsersWithDebounce = async (query: string, role?: string): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const results = await searchUsers(query, role);
          resolve(results);
        } catch (error) {
          console.error('Debounced search error:', error);
          resolve([]);
        }
      }, 300);
    });
  };

  return {
    searchUsers,
    useSearchUsersQuery,
    searchUsersWithDebounce,
  };
};

export default useUserSearch;