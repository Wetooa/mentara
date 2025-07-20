import { z } from 'zod';

// Review Status Schema (updated from class-validator DTO)
export const ReviewStatusSchema = z.enum([
  'PENDING',
  'APPROVED', 
  'REJECTED',
  'FLAGGED'
]);

// Rating Schema (1-5 stars)
export const RatingSchema = z.number()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating cannot exceed 5')
  .int('Rating must be a whole number');

// Review Participant Schemas
export const ReviewClientSchema = z.object({
  id: z.string().min(1, 'Client ID is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

export const ReviewTherapistSchema = z.object({
  id: z.string().min(1, 'Therapist ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
});

// Core Review Schema
export const ReviewSchema = z.object({
  id: z.string().min(1, 'Review ID is required'),
  rating: RatingSchema,
  title: z.string().max(200, 'Title cannot exceed 200 characters').optional(),
  content: z.string().max(2000, 'Content cannot exceed 2000 characters').optional(),
  therapistId: z.string().min(1, 'Therapist ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  meetingId: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  status: ReviewStatusSchema.default('PENDING'),
  helpfulCount: z.number().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  moderationNote: z.string().max(500, 'Moderation note cannot exceed 500 characters').optional(),
  client: ReviewClientSchema.optional(),
  therapist: ReviewTherapistSchema.optional()
});

// Create Review Request Schema
export const CreateReviewRequestSchema = z.object({
  rating: RatingSchema,
  title: z.string().max(200, 'Title cannot exceed 200 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').max(2000, 'Content cannot exceed 2000 characters').optional(),
  therapistId: z.string().min(1, 'Therapist ID is required'),
  meetingId: z.string().optional(),
  isAnonymous: z.boolean().default(false)
}).refine(
  (data) => data.title || data.content,
  {
    message: 'Either title or content must be provided',
    path: ['content']
  }
);

// Update Review Request Schema
export const UpdateReviewRequestSchema = z.object({
  rating: RatingSchema.optional(),
  title: z.string().max(200, 'Title cannot exceed 200 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').max(2000, 'Content cannot exceed 2000 characters').optional(),
  isAnonymous: z.boolean().optional()
});

// Review List Parameters Schema
export const ReviewListParamsSchema = z.object({
  therapistId: z.string().optional(),
  clientId: z.string().optional(),
  status: ReviewStatusSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'rating', 'helpfulCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minRating: z.number().min(1).max(5).optional(),
  maxRating: z.number().min(1).max(5).optional()
}).refine(
  (data) => !data.minRating || !data.maxRating || data.minRating <= data.maxRating,
  {
    message: 'Minimum rating cannot be greater than maximum rating',
    path: ['maxRating']
  }
);

// Review List Response Schema
export const ReviewListResponseSchema = z.object({
  reviews: z.array(ReviewSchema),
  totalCount: z.number().min(0),
  page: z.number().min(1),
  pageSize: z.number().min(1),
  totalPages: z.number().min(0),
  averageRating: z.number().min(0).max(5).optional(),
  ratingDistribution: z.object({
    '1': z.number().min(0),
    '2': z.number().min(0),
    '3': z.number().min(0),
    '4': z.number().min(0),
    '5': z.number().min(0)
  }).optional()
});

// Review Stats Schema
export const ReviewStatsSchema = z.object({
  totalReviews: z.number().min(0),
  averageRating: z.number().min(0).max(5),
  ratingDistribution: z.object({
    '1': z.number().min(0),
    '2': z.number().min(0),
    '3': z.number().min(0),
    '4': z.number().min(0),
    '5': z.number().min(0)
  }),
  monthlyReviews: z.array(z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)'),
    count: z.number().min(0),
    averageRating: z.number().min(0).max(5)
  })),
  recentReviews: z.array(ReviewSchema)
});

// Therapist Review Parameters Schema
export const TherapistReviewParamsSchema = z.object({
  therapistId: z.string().min(1, 'Therapist ID is required'),
  status: ReviewStatusSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

// Moderate Review Request Schema
export const ModerateReviewRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  moderationNote: z.string().max(500, 'Moderation note cannot exceed 500 characters').optional()
}).refine(
  (data) => data.status !== 'rejected' || data.moderationNote,
  {
    message: 'Moderation note is required when rejecting a review',
    path: ['moderationNote']
  }
);

// Review Helpful Action Schema
export const ReviewHelpfulActionSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  isHelpful: z.boolean()
});

// Review Report Schema
export const ReviewReportSchema = z.object({
  id: z.string().min(1),
  reviewId: z.string().min(1),
  reporterId: z.string().min(1),
  reason: z.enum([
    'inappropriate_content',
    'spam',
    'fake_review', 
    'harassment',
    'other'
  ]),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  status: z.enum(['pending', 'reviewed', 'dismissed']).default('pending'),
  createdAt: z.string().datetime(),
  reviewedAt: z.string().datetime().optional(),
  reviewedBy: z.string().optional()
});

// Review Analytics Schema
export const ReviewAnalyticsSchema = z.object({
  therapistId: z.string().min(1),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']),
  metrics: z.object({
    totalReviews: z.number().min(0),
    averageRating: z.number().min(0).max(5),
    ratingTrend: z.number(), // Positive or negative trend
    responseRate: z.number().min(0).max(100), // Percentage of meetings that received reviews
    improvementAreas: z.array(z.string())
  }),
  comparisons: z.object({
    previousPeriod: z.object({
      averageRating: z.number().min(0).max(5),
      totalReviews: z.number().min(0)
    }),
    platformAverage: z.number().min(0).max(5)
  })
});

// Review Response Schema (when therapist responds to reviews)
export const ReviewResponseSchema = z.object({
  id: z.string().min(1),
  reviewId: z.string().min(1),
  therapistId: z.string().min(1),
  content: z.string().min(10, 'Response must be at least 10 characters').max(1000, 'Response cannot exceed 1000 characters'),
  isPublic: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const CreateReviewResponseSchema = z.object({
  content: z.string().min(10, 'Response must be at least 10 characters').max(1000, 'Response cannot exceed 1000 characters'),
  isPublic: z.boolean().default(true)
});

// DTOs from class-validator conversion
export const CreateReviewDtoSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().optional(),
  content: z.string().optional(),
  therapistId: z.string().uuid('Invalid therapist ID format'),
  meetingId: z.string().uuid('Invalid meeting ID format').optional(),
  isAnonymous: z.boolean().default(false)
});

export const UpdateReviewDtoSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  isAnonymous: z.boolean().optional()
});

export const ModerateReviewDtoSchema = z.object({
  status: ReviewStatusSchema,
  moderationNote: z.string().optional()
});

export const GetReviewsDtoSchema = z.object({
  therapistId: z.string().uuid('Invalid therapist ID format').optional(),
  clientId: z.string().uuid('Invalid client ID format').optional(),
  status: ReviewStatusSchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  rating: z.number().int().min(1).max(5).optional()
});

export const ReviewStatsDtoSchema = z.object({
  therapistId: z.string().uuid('Invalid therapist ID format')
});

// Parameter Schemas
export const ReviewIdParamSchema = z.object({
  id: z.string().uuid('Invalid review ID format')
});

// Type inference exports
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type ReviewClient = z.infer<typeof ReviewClientSchema>;
export type ReviewTherapist = z.infer<typeof ReviewTherapistSchema>;
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewRequestSchema>;
export type ReviewListParams = z.infer<typeof ReviewListParamsSchema>;
export type ReviewListResponse = z.infer<typeof ReviewListResponseSchema>;
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;
export type TherapistReviewParams = z.infer<typeof TherapistReviewParamsSchema>;
export type ModerateReviewRequest = z.infer<typeof ModerateReviewRequestSchema>;
export type ReviewHelpfulAction = z.infer<typeof ReviewHelpfulActionSchema>;
export type ReviewReport = z.infer<typeof ReviewReportSchema>;
export type ReviewAnalytics = z.infer<typeof ReviewAnalyticsSchema>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>;

// New type exports from converted DTOs
export type CreateReviewDto = z.infer<typeof CreateReviewDtoSchema>;
export type UpdateReviewDto = z.infer<typeof UpdateReviewDtoSchema>;
export type ModerateReviewDto = z.infer<typeof ModerateReviewDtoSchema>;
export type GetReviewsDto = z.infer<typeof GetReviewsDtoSchema>;
export type ReviewStatsDto = z.infer<typeof ReviewStatsDtoSchema>;
export type ReviewIdParam = z.infer<typeof ReviewIdParamSchema>;