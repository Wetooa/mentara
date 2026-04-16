import { UserRole } from '../../types/enums';

export interface SearchTherapistsQueryDto {
  query?: string;
  location?: string;
  specialties?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  experienceYears?: number;
  rating?: number;
  gender?: 'male' | 'female' | 'non-binary';
  languages?: string[];
  availability?: 'immediate' | 'within_week' | 'within_month';
  verifiedOnly?: boolean;
}

export interface SearchPostsQueryDto {
  query: string;
  communityId?: string;
}

export interface SearchCommunitiesQueryDto {
  query: string;
}

export interface SearchUsersQueryDto {
  query: string;
  role?: UserRole;
}

export interface GlobalSearchQueryDto {
  query: string;
  types?: ('users' | 'therapists' | 'posts' | 'communities' | 'worksheets' | 'messages')[];
}