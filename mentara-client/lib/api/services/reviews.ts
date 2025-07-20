import { AxiosInstance } from 'axios';
import {
  Review,
  ReviewStats,
  CreateReviewDto,
  UpdateReviewDto,
} from 'mentara-commons';

// Reviews service factory
export const createReviewsService = (client: AxiosInstance) => ({
  // ===== BACKEND ENDPOINT ISSUES =====
  // 
  // Create review - FIXED: Backend route now matches expected parameters
  create: (meetingId: string, therapistId: string, data: CreateReviewDto): Promise<Review> =>
    client.post(`/reviews/${meetingId}/${therapistId}`, data),

  // Update review
  update: (id: string, data: UpdateReviewDto): Promise<Review> =>
    client.put(`/reviews/${id}`, data),

  // Delete review
  delete: (id: string): Promise<void> =>
    client.delete(`/reviews/${id}`),

  // ===== MISSING BACKEND ENDPOINTS =====
  // The following endpoints are commented out in backend ReviewsController
  // Backend service methods exist but controller endpoints are not implemented
  //
  // MISSING: GET /reviews - Get all reviews with filters
  // Purpose: Retrieve reviews with filtering, pagination, and sorting
  // Expected query params: therapistId, clientId, status, page, limit, sortBy, sortOrder, rating
  // Backend service: getReviews() - EXISTS but commented out
  // Priority: HIGH - needed for admin/moderator review management
  //
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

  // Get therapist review statistics - FIXED: Backend endpoint now available
  getTherapistStats: (therapistId: string): Promise<ReviewStats> =>
    client.get(`/reviews/therapist/${therapistId}/stats`),

  // Mark review as helpful (BACKEND ENDPOINT COMMENTED OUT - needs implementation)
  // markHelpful: (reviewId: string): Promise<void> =>
  //   client.post(`/reviews/${reviewId}/helpful`),

  // Moderate review (BACKEND ENDPOINT COMMENTED OUT - needs implementation)
  // moderate: (reviewId: string, data: ModerateReviewDto): Promise<Review> =>
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