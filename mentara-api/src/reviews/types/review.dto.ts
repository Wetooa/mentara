/**
 * Reviews Module DTOs - Data Transfer Objects for review operations
 * These are pure TypeScript interfaces without validation logic
 */

// Review creation DTO
export interface CreateReviewDto {
  rating: number;
  title?: string; // Review title
  comment?: string;
  content?: string; // Alternative to comment
  isAnonymous?: boolean;
  categories?: {
    communication?: number;
    professionalism?: number;
    helpfulness?: number;
    availability?: number;
    overall?: number;
  };
  tags?: string[];
  wouldRecommend?: boolean;
}

// Review update DTO
export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
  isAnonymous?: boolean;
  categories?: {
    communication?: number;
    professionalism?: number;
    helpfulness?: number;
    availability?: number;
    overall?: number;
  };
  tags?: string[];
  wouldRecommend?: boolean;
}

// Review moderation DTO
export interface ModerateReviewDto {
  action: 'approve' | 'reject' | 'flag' | 'hide';
  status?: string; // Status to set for the review
  reason?: string;
  moderatorNotes?: string;
}

// Review query parameters DTO
export interface GetReviewsDto {
  therapistId?: string;
  clientId?: string;
  rating?: number;
  minRating?: number;
  maxRating?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'flagged' | 'hidden';
  isAnonymous?: boolean;
  sortBy?: 'rating' | 'date' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  page?: number; // Page number for pagination
  includeModerated?: boolean;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

// Path parameter types
export interface ReviewIdParam {
  id: string;
}

export interface TherapistIdParam {
  therapistId: string;
}

export interface MeetingIdParam {
  meetingId: string;
}

// Review response DTOs
export interface ReviewResponseDto {
  id: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'hidden';
  categories: {
    communication?: number;
    professionalism?: number;
    helpfulness?: number;
    availability?: number;
    overall?: number;
  };
  tags: string[];
  wouldRecommend?: boolean;
  helpfulCount: number;
  isHelpfulByUser?: boolean;
  clientId: string;
  client?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    isAnonymous?: boolean;
  };
  therapistId: string;
  therapist: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  };
  meetingId?: string;
  moderatorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStatsDto {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  categoryAverages: {
    communication?: number;
    professionalism?: number;
    helpfulness?: number;
    availability?: number;
    overall?: number;
  };
  recommendationRate: number;
  totalHelpfulVotes: number;
  recentReviews?: any[]; // Support for recent reviews in stats
}

export interface ReviewListResponse {
  reviews: ReviewResponseDto[];
  stats: ReviewStatsDto;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Review interaction DTOs
export interface ReviewHelpfulDto {
  action: 'helpful' | 'unhelpful' | 'remove';
}

export interface ReviewReportDto {
  reason: 'inappropriate' | 'spam' | 'fake' | 'harassment' | 'other';
  description?: string;
}