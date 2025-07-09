import { AxiosInstance } from 'axios';
import {
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
} from '../../types/api/search';

export interface SearchService {
  therapists(params: TherapistSearchParams): Promise<SearchResult<TherapistSearchResult>>;
  posts(params: PostSearchParams): Promise<SearchResult<PostSearchResult>>;
  communities(params: CommunitySearchParams): Promise<SearchResult<CommunitySearchResult>>;
  users(params: UserSearchParams): Promise<SearchResult<UserSearchResult>>;
  global(params: GlobalSearchParams): Promise<SearchResult<GlobalSearchResult>>;
}

export const createSearchService = (client: AxiosInstance): SearchService => ({
  therapists: (params: TherapistSearchParams): Promise<SearchResult<TherapistSearchResult>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.q);
    
    // Add filter parameters
    if (params.specialties?.length) {
      params.specialties.forEach(specialty => searchParams.append('specialties', specialty));
    }
    if (params.languages?.length) {
      params.languages.forEach(language => searchParams.append('languages', language));
    }
    if (params.minExperience !== undefined) searchParams.append('minExperience', params.minExperience.toString());
    if (params.maxExperience !== undefined) searchParams.append('maxExperience', params.maxExperience.toString());
    if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.location) searchParams.append('location', params.location);
    if (params.insurance?.length) {
      params.insurance.forEach(insurance => searchParams.append('insurance', insurance));
    }
    if (params.availableFrom) searchParams.append('availableFrom', params.availableFrom);
    if (params.availableTo) searchParams.append('availableTo', params.availableTo);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    return client.get(`/search/therapists?${searchParams.toString()}`);
  },

  posts: (params: PostSearchParams): Promise<SearchResult<PostSearchResult>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.q);
    
    if (params.communityId) searchParams.append('communityId', params.communityId);
    if (params.roomId) searchParams.append('roomId', params.roomId);
    if (params.authorId) searchParams.append('authorId', params.authorId);
    if (params.tags?.length) {
      params.tags.forEach(tag => searchParams.append('tags', tag));
    }
    if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.append('dateTo', params.dateTo);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    return client.get(`/search/posts?${searchParams.toString()}`);
  },

  communities: (params: CommunitySearchParams): Promise<SearchResult<CommunitySearchResult>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.q);
    
    if (params.category) searchParams.append('category', params.category);
    if (params.isPublic !== undefined) searchParams.append('isPublic', params.isPublic.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    return client.get(`/search/communities?${searchParams.toString()}`);
  },

  users: (params: UserSearchParams): Promise<SearchResult<UserSearchResult>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.q);
    
    if (params.role) searchParams.append('role', params.role);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    return client.get(`/search/users?${searchParams.toString()}`);
  },

  global: (params: GlobalSearchParams): Promise<SearchResult<GlobalSearchResult>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.q);
    
    if (params.type) searchParams.append('type', params.type);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    return client.get(`/search/global?${searchParams.toString()}`);
  },
});