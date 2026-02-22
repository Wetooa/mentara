// Search DTOs matching backend exactly

export interface SearchParams {
  q: string; // query string
  limit?: number;
  offset?: number;
}

export interface TherapistSearchParams extends SearchParams {
  specialties?: string[];
  languages?: string[];
  minExperience?: number;
  maxExperience?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  insurance?: string[];
  availableFrom?: string;
  availableTo?: string;
}

export interface PostSearchParams extends SearchParams {
  communityId?: string;
  roomId?: string;
  authorId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface UserSearchParams extends SearchParams {
  role?: 'client' | 'therapist' | 'moderator' | 'admin';
  isActive?: boolean;
}

export interface CommunitySearchParams extends SearchParams {
  category?: string;
  isPublic?: boolean;
}

export interface GlobalSearchParams extends SearchParams {
  type?: 'therapists' | 'posts' | 'communities' | 'users';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  query: string;
  suggestions?: string[];
}

export interface TherapistSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  bio: string;
  specialties: string[];
  languages: string[];
  experienceYears: number;
  pricePerSession: number;
  rating: number;
  reviewCount: number;
  location: string;
  isAvailable: boolean;
}

export interface PostSearchResult {
  id: string;
  title: string;
  content: string;
  authorName: string;
  communityName: string;
  roomName: string;
  tags: string[];
  heartCount: number;
  commentCount: number;
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CommunitySearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  isPublic: boolean;
  createdAt: string;
}

export interface GlobalSearchResult {
  id: string;
  type: 'therapist' | 'post' | 'community' | 'user';
  title: string;
  description: string;
  url: string;
  relevanceScore: number;
  metadata: Record<string, unknown>;
}