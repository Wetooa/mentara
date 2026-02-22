/**
 * Community Module DTOs - Data Transfer Objects for community operations
 * These are pure TypeScript interfaces without validation logic
 */

// Community creation DTO
export interface CommunityCreateInputDto {
  name: string;
  description: string;
  slug?: string;
  imageUrl?: string;
  isPrivate?: boolean;
  category?: string;
  tags?: string[];
  rules?: string[];
  moderatorIds?: string[];
  maxMembers?: number;
  requireApproval?: boolean;
}

// Community update DTO
export interface CommunityUpdateInputDto {
  name?: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  isPrivate?: boolean;
  category?: string;
  tags?: string[];
  rules?: string[];
  moderatorIds?: string[];
  maxMembers?: number;
  requireApproval?: boolean;
  isActive?: boolean;
}

// Community Recommendation DTOs
export interface GenerateRecommendationsDto {
  userId: string;
  limit?: number;
  includeReason?: boolean;
  categories?: string[];
  excludeCommunityIds?: string[];
  basedOnActivity?: boolean;
  basedOnProfile?: boolean;
  force?: boolean; // Force regeneration of recommendations
}

export interface RecommendationInteractionDto {
  userId: string;
  communityId: string;
  action: 'view' | 'join' | 'dismiss' | 'report';
  metadata?: {
    viewDuration?: number;
    source?: string;
    reason?: string;
  };
}

export interface RecommendationQueryDto {
  limit?: number;
  offset?: number;
  category?: string;
  includeJoined?: boolean;
  sortBy?: 'relevance' | 'popularity' | 'recent' | 'activity' | 'compatibility' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  status?: 'pending' | 'accepted' | 'rejected';
  filters?: {
    memberCount?: {
      min?: number;
      max?: number;
    };
    isPrivate?: boolean;
    requireApproval?: boolean;
  };
}

// Community response interfaces
export interface CommunityResponse {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  isPrivate?: boolean;
  memberCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: string;
  tags?: string[];
  rules?: string[];
  maxMembers?: number;
  requireApproval?: boolean;
  isActive?: boolean;
}

export interface CommunityStatsResponse {
  memberCount?: number;
  postCount?: number;
  activeMembers?: number;
  totalMembers?: number;
  totalPosts?: number;
  activeCommunities?: number;
  weeklyActivity?: number;
  monthlyGrowth?: number;
  illnessCommunities?: any[];
}

export interface CommunityRecommendationResponse {
  id: string;
  community: CommunityResponse;
  score: number;
  reason: string[];
  matchingFactors: string[];
  similarMembers?: number;
  recentActivity?: number;
}

export interface CommunityRecommendationsResult {
  recommendations: CommunityRecommendationResponse[];
  total: number;
  hasMore: boolean;
  categories: {
    [category: string]: CommunityRecommendationResponse[];
  };
}