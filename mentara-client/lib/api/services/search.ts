import { AxiosInstance } from 'axios';
import { type EntityType } from '@/components/search/OmniSearchBar';

export interface GlobalSearchParams {
  query: string;
  types?: EntityType[];
}

export interface GlobalSearchResponse {
  users?: any[];
  therapists?: any[];
  posts?: any[];
  communities?: any[];
  worksheets?: any[];
  messages?: any[];
}

export interface UserSearchParams {
  query: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface TherapistSearchParams {
  query: string;
  location?: string;
  specialties?: string[];
  priceRange?: { min?: number; max?: number };
  experienceYears?: number;
  rating?: number;
  gender?: string;
  languages?: string[];
  availability?: any;
  verifiedOnly?: boolean;
}

export interface PostSearchParams {
  query: string;
  communityId?: string;
}

export interface CommunitySearchParams {
  query: string;
}

export function createSearchService(axiosInstance: AxiosInstance) {
  return {
    // Global omnisearch
    async global(params: GlobalSearchParams): Promise<GlobalSearchResponse> {
      const { data } = await axiosInstance.get('/search/global', {
        params: {
          query: params.query,
          types: params.types,
        },
      });
      return data;
    },

    // Individual entity searches (existing functionality)
    async users(query: string, role?: string): Promise<any[]> {
      const { data } = await axiosInstance.get('/search/users', {
        params: { query, role },
      });
      return data;
    },

    async therapists(params: TherapistSearchParams): Promise<any[]> {
      const { data } = await axiosInstance.get('/search/therapists', {
        params,
      });
      return data;
    },

    async posts(params: PostSearchParams): Promise<any[]> {
      const { data } = await axiosInstance.get('/search/posts', {
        params,
      });
      return data;
    },

    async communities(params: CommunitySearchParams): Promise<any[]> {
      const { data } = await axiosInstance.get('/search/communities', {
        params,
      });
      return data;
    },

    // Advanced search with pagination and filters
    async advanced(params: {
      query: string;
      types?: EntityType[];
      filters?: Record<string, any>;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }): Promise<{
      results: GlobalSearchResponse;
      pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
      };
    }> {
      const { data } = await axiosInstance.get('/search/advanced', {
        params,
      });
      return data;
    },

    // Search suggestions/autocomplete
    async suggestions(query: string): Promise<string[]> {
      if (query.length < 2) return [];
      
      const { data } = await axiosInstance.get('/search/suggestions', {
        params: { query },
      });
      return data.suggestions || [];
    },

    // Search analytics (for trending searches, etc.)
    async trending(): Promise<string[]> {
      const { data } = await axiosInstance.get('/search/trending');
      return data.queries || [];
    },

    // Get recent searches for current user
    async recent(): Promise<{ query: string; timestamp: string }[]> {
      const { data } = await axiosInstance.get('/search/recent');
      return data.searches || [];
    },
  };
}

export type SearchService = ReturnType<typeof createSearchService>;