import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { 
  Review, 
  ReviewsResponse, 
  ReviewStats, 
  CreateReviewRequest, 
  UpdateReviewRequest,
  GetReviewsParams,
  ReviewHelpfulResponse
} from '@/types/review';
import { toast } from 'sonner';

// Hook for fetching reviews with filters
export function useReviews(params: GetReviewsParams = {}) {
  const api = useApi();

  return useQuery({
    queryKey: ['reviews', params],
    queryFn: async (): Promise<ReviewsResponse> => {
      return api.reviews.getAll(params);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Hook for fetching therapist-specific reviews
export function useTherapistReviews(therapistId: string, params: Omit<GetReviewsParams, 'therapistId'> = {}) {
  const api = useApi();

  return useQuery({
    queryKey: ['therapist-reviews', therapistId, params],
    queryFn: async (): Promise<ReviewsResponse> => {
      return api.reviews.getTherapistReviews(therapistId, params);
    },
    enabled: !!therapistId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Hook for fetching therapist review statistics
export function useTherapistReviewStats(therapistId: string) {
  const api = useApi();

  return useQuery({
    queryKey: ['therapist-review-stats', therapistId],
    queryFn: async (): Promise<ReviewStats> => {
      return api.reviews.getTherapistStats(therapistId);
    },
    enabled: !!therapistId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for creating a review
export function useCreateReview() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewRequest): Promise<Review> => {
      return api.reviews.create(data);
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['therapist-reviews', data.therapistId] });
      queryClient.invalidateQueries({ queryKey: ['therapist-review-stats', data.therapistId] });
      
      toast.success('Review submitted successfully!', {
        description: 'Your review will be visible after moderation.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to submit review', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}

// Hook for updating a review
export function useUpdateReview() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: string; data: UpdateReviewRequest }): Promise<Review> => {
      return api.reviews.update(reviewId, data);
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['therapist-reviews', data.therapistId] });
      queryClient.invalidateQueries({ queryKey: ['therapist-review-stats', data.therapistId] });
      
      toast.success('Review updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update review', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}

// Hook for deleting a review
export function useDeleteReview() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string): Promise<void> => {
      return api.reviews.delete(reviewId);
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['therapist-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['therapist-review-stats'] });
      
      toast.success('Review deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete review', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}

// Hook for marking a review as helpful
export function useMarkReviewHelpful() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string): Promise<ReviewHelpfulResponse> => {
      return api.reviews.markHelpful(reviewId);
    },
    onSuccess: (data, reviewId) => {
      // Update the specific review in the cache
      queryClient.setQueryData(['reviews'], (oldData: any) => {
        if (!oldData?.reviews) return oldData;
        
        return {
          ...oldData,
          reviews: oldData.reviews.map((review: Review) =>
            review.id === reviewId
              ? { ...review, helpfulCount: data.helpfulCount }
              : review
          ),
        };
      });

      // Also update therapist-specific reviews
      queryClient.invalidateQueries({ queryKey: ['therapist-reviews'] });
      
      toast.success(data.helpful ? 'Marked as helpful!' : 'Removed helpful mark');
    },
    onError: (error: any) => {
      toast.error('Failed to update helpful status', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}

// Hook for moderating reviews (admin/moderator only)
export function useModerateReview() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      reviewId, 
      status, 
      moderationNote 
    }: { 
      reviewId: string; 
      status: string; 
      moderationNote?: string; 
    }): Promise<Review> => {
      return api.reviews.moderate(reviewId, { status, moderationNote });
    },
    onSuccess: () => {
      // Invalidate and refetch all review queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['therapist-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['therapist-review-stats'] });
      
      toast.success('Review moderated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to moderate review', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}

// Hook for fetching pending reviews (admin/moderator only)
export function usePendingReviews(params: { page?: number; limit?: number } = {}) {
  const api = useApi();

  return useQuery({
    queryKey: ['pending-reviews', params],
    queryFn: async (): Promise<ReviewsResponse> => {
      return api.reviews.getPending(params);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}