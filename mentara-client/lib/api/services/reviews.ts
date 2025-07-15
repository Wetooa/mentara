import { AxiosInstance } from 'axios';

// Types
export interface Review {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  therapistId: string;
  clientId: string;
  meetingId?: string;
  isAnonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  moderationNote?: string;
  client?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  therapist?: {
    id: string;
    firstName: string;
    lastName: string;
  };
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

export interface ReviewListParams {
  therapistId?: string;
  clientId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  rating?: number;
}

export interface TherapistReviewParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  rating?: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: Review[];
}

export interface ModerateReviewRequest {
  status: 'approved' | 'rejected';
  moderationNote?: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

// Reviews service factory
export const createReviewsService = (client: AxiosInstance) => ({
  // Create new review (BACKEND ENDPOINT PARAMETER MISMATCH - needs fixing)
  // Backend expects meetingId and therapistId as path parameters
  // create: (data: CreateReviewRequest): Promise<Review> =>
  //   client.post('/reviews', data),

  // Update review
  update: (id: string, data: UpdateReviewRequest): Promise<Review> =>
    client.put(`/reviews/${id}`, data),

  // Delete review
  delete: (id: string): Promise<void> =>
    client.delete(`/reviews/${id}`),

  // Get all reviews with filters (BACKEND ENDPOINT COMMENTED OUT - needs implementation)
  // getAll: (params: ReviewListParams = {}): Promise<ReviewListResponse> => {
  //   const searchParams = new URLSearchParams();
  //   
  //   if (params.therapistId) searchParams.append('therapistId', params.therapistId);
  //   if (params.clientId) searchParams.append('clientId', params.clientId);
  //   if (params.status) searchParams.append('status', params.status);
  //   if (params.page) searchParams.append('page', params.page.toString());
  //   if (params.limit) searchParams.append('limit', params.limit.toString());
  //   if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  //   if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  //   if (params.rating) searchParams.append('rating', params.rating.toString());

  //   const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  //   return client.get(`/reviews${queryString}`);
  // },

  // Get reviews for a specific therapist (BACKEND ENDPOINT COMMENTED OUT - needs implementation)
  // getTherapistReviews: (therapistId: string, params: TherapistReviewParams = {}): Promise<ReviewListResponse> => {
  //   const searchParams = new URLSearchParams();
  //   
  //   if (params.page) searchParams.append('page', params.page.toString());
  //   if (params.limit) searchParams.append('limit', params.limit.toString());
  //   if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  //   if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  //   if (params.rating) searchParams.append('rating', params.rating.toString());

  //   const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  //   return client.get(`/reviews/therapist/${therapistId}${queryString}`);
  // },

  // Get therapist review statistics (BACKEND ENDPOINT COMMENTED OUT - needs implementation)
  // getTherapistStats: (therapistId: string): Promise<ReviewStats> =>
  //   client.get(`/reviews/therapist/${therapistId}/stats`),

  // Mark review as helpful (BACKEND ENDPOINT COMMENTED OUT - needs implementation)
  // markHelpful: (reviewId: string): Promise<void> =>
  //   client.post(`/reviews/${reviewId}/helpful`),

  // Moderate review (BACKEND ENDPOINT COMMENTED OUT - needs implementation)
  // moderate: (reviewId: string, data: ModerateReviewRequest): Promise<Review> =>
  //   client.post(`/reviews/${reviewId}/moderate`, data),

  // Get pending reviews for moderation (BACKEND ENDPOINT COMMENTED OUT - needs implementation)
  // getPending: (params: { page?: number; limit?: number } = {}): Promise<ReviewListResponse> => {
  //   const searchParams = new URLSearchParams();
  //   
  //   if (params.page) searchParams.append('page', params.page.toString());
  //   if (params.limit) searchParams.append('limit', params.limit.toString());

  //   const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  //   return client.get(`/reviews/pending${queryString}`);
  // },

  // Get review by ID (BACKEND ENDPOINT MISSING - needs implementation)
  // getById: (id: string): Promise<Review> =>
  //   client.get(`/reviews/${id}`),
});

export type ReviewsService = ReturnType<typeof createReviewsService>;