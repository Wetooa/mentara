export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED'
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  isAnonymous: boolean;
  
  // Relations
  clientId: string;
  therapistId: string;
  meetingId?: string;
  
  client: {
    user: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  };
  
  therapist: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  
  meeting?: {
    startTime: string;
    duration: number;
  };
  
  // Moderation
  status: ReviewStatus;
  moderatedBy?: string;
  moderatedAt?: string;
  moderationNote?: string;
  
  // Metadata
  isVerified: boolean;
  helpfulCount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  content?: string;
  therapistId: string;
  meetingId?: string;
  isAnonymous?: boolean;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  content?: string;
  isAnonymous?: boolean;
}

export interface ModerateReviewRequest {
  status: ReviewStatus;
  moderationNote?: string;
}

export interface GetReviewsParams {
  therapistId?: string;
  clientId?: string;
  status?: ReviewStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  rating?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewHelpfulResponse {
  helpful: boolean;
  helpfulCount: number;
}

// Form validation schemas
export interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  isAnonymous: boolean;
}