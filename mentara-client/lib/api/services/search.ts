import { AxiosInstance } from 'axios';
import {
  SearchRequestDto,
  SearchResponseDto,
  SearchResultItem,
  TherapistSearchDto,
  AdvancedSearchDto,
  SearchAutocompleteDto,
  SearchAnalyticsDto,
  SearchTherapistsQueryDto,
  SearchPostsQueryDto,
  SearchCommunitiesQueryDto,
  SearchUsersQueryDto,
  GlobalSearchQueryDto,
  SearchTherapistsQueryDtoSchema,
  SearchPostsQueryDtoSchema,
  SearchCommunitiesQueryDtoSchema,
  SearchUsersQueryDtoSchema,
  GlobalSearchQueryDtoSchema,
  // Legacy interfaces for backward compatibility
  TherapistSearchParams,
  PostSearchParams,
  UserSearchParams,
  CommunitySearchParams,
  GlobalSearchParams,
  SearchResult,
  TherapistSearchResult,
  PostSearchResult,
  UserSearchResult,
  CommunitySearchResult,
  GlobalSearchResult,
} from 'mentara-commons';

// All search types are now imported from mentara-commons

// Re-export commons types for backward compatibility
export type {
  TherapistSearchParams,
  PostSearchParams,
  UserSearchParams,
  CommunitySearchParams,
  GlobalSearchParams,
  SearchResult,
  TherapistSearchResult,
  PostSearchResult,
  UserSearchResult,
  CommunitySearchResult,
  GlobalSearchResult,
};

export interface SearchService {
  // Primary search methods using mentara-commons DTOs
  searchTherapists(params: SearchTherapistsQueryDto): Promise<SearchResponseDto>;
  searchPosts(params: SearchPostsQueryDto): Promise<SearchResponseDto>;
  searchCommunities(params: SearchCommunitiesQueryDto): Promise<SearchResponseDto>;
  searchUsers(params: SearchUsersQueryDto): Promise<SearchResponseDto>;
  globalSearch(params: GlobalSearchQueryDto): Promise<SearchResponseDto>;
  autocomplete(params: SearchAutocompleteDto): Promise<string[]>;
  
  // Legacy aliases for backward compatibility
  therapists(params: SearchTherapistsQueryDto): Promise<SearchResponseDto>;
  posts(params: SearchPostsQueryDto): Promise<SearchResponseDto>;
  communities(params: SearchCommunitiesQueryDto): Promise<SearchResponseDto>;
  users(params: SearchUsersQueryDto): Promise<SearchResponseDto>;
  global(params: GlobalSearchQueryDto): Promise<SearchResponseDto>;
}

export const createSearchService = (client: AxiosInstance): SearchService => ({
  // Primary search methods using mentara-commons DTOs
  searchTherapists: async (params: SearchTherapistsQueryDto): Promise<SearchResponseDto> => {
    const validatedParams = SearchTherapistsQueryDtoSchema.parse(params);
    return client.post('/search/therapists', validatedParams);
  },

  searchPosts: async (params: SearchPostsQueryDto): Promise<SearchResponseDto> => {
    const validatedParams = SearchPostsQueryDtoSchema.parse(params);
    return client.post('/search/posts', validatedParams);
  },

  searchCommunities: async (params: SearchCommunitiesQueryDto): Promise<SearchResponseDto> => {
    const validatedParams = SearchCommunitiesQueryDtoSchema.parse(params);
    return client.post('/search/communities', validatedParams);
  },

  searchUsers: async (params: SearchUsersQueryDto): Promise<SearchResponseDto> => {
    const validatedParams = SearchUsersQueryDtoSchema.parse(params);
    return client.post('/search/users', validatedParams);
  },

  globalSearch: async (params: GlobalSearchQueryDto): Promise<SearchResponseDto> => {
    const validatedParams = GlobalSearchQueryDtoSchema.parse(params);
    return client.post('/search/global', validatedParams);
  },

  autocomplete: async (params: SearchAutocompleteDto): Promise<string[]> => {
    return client.post('/search/autocomplete', params);
  },

  // Legacy aliases for backward compatibility - point to primary methods
  therapists: function(params: SearchTherapistsQueryDto): Promise<SearchResponseDto> {
    return this.searchTherapists(params);
  },

  posts: function(params: SearchPostsQueryDto): Promise<SearchResponseDto> {
    return this.searchPosts(params);
  },

  communities: function(params: SearchCommunitiesQueryDto): Promise<SearchResponseDto> {
    return this.searchCommunities(params);
  },

  users: function(params: SearchUsersQueryDto): Promise<SearchResponseDto> {
    return this.searchUsers(params);
  },

  global: function(params: GlobalSearchQueryDto): Promise<SearchResponseDto> {
    return this.globalSearch(params);
  },
});