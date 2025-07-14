"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewResponseSchema = exports.ReviewResponseSchema = exports.ReviewAnalyticsSchema = exports.ReviewReportSchema = exports.ReviewHelpfulActionSchema = exports.ModerateReviewRequestSchema = exports.TherapistReviewParamsSchema = exports.ReviewStatsSchema = exports.ReviewListResponseSchema = exports.ReviewListParamsSchema = exports.UpdateReviewRequestSchema = exports.CreateReviewRequestSchema = exports.ReviewSchema = exports.ReviewTherapistSchema = exports.ReviewClientSchema = exports.RatingSchema = exports.ReviewStatusSchema = void 0;
const zod_1 = require("zod");
// Review Status Schema
exports.ReviewStatusSchema = zod_1.z.enum([
    'pending',
    'approved',
    'rejected'
]);
// Rating Schema (1-5 stars)
exports.RatingSchema = zod_1.z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .int('Rating must be a whole number');
// Review Participant Schemas
exports.ReviewClientSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Client ID is required'),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional()
});
exports.ReviewTherapistSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Therapist ID is required'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required')
});
// Core Review Schema
exports.ReviewSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Review ID is required'),
    rating: exports.RatingSchema,
    title: zod_1.z.string().max(200, 'Title cannot exceed 200 characters').optional(),
    content: zod_1.z.string().max(2000, 'Content cannot exceed 2000 characters').optional(),
    therapistId: zod_1.z.string().min(1, 'Therapist ID is required'),
    clientId: zod_1.z.string().min(1, 'Client ID is required'),
    meetingId: zod_1.z.string().optional(),
    isAnonymous: zod_1.z.boolean().default(false),
    status: exports.ReviewStatusSchema.default('pending'),
    helpfulCount: zod_1.z.number().min(0).default(0),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    moderationNote: zod_1.z.string().max(500, 'Moderation note cannot exceed 500 characters').optional(),
    client: exports.ReviewClientSchema.optional(),
    therapist: exports.ReviewTherapistSchema.optional()
});
// Create Review Request Schema
exports.CreateReviewRequestSchema = zod_1.z.object({
    rating: exports.RatingSchema,
    title: zod_1.z.string().max(200, 'Title cannot exceed 200 characters').optional(),
    content: zod_1.z.string().min(10, 'Content must be at least 10 characters').max(2000, 'Content cannot exceed 2000 characters').optional(),
    therapistId: zod_1.z.string().min(1, 'Therapist ID is required'),
    meetingId: zod_1.z.string().optional(),
    isAnonymous: zod_1.z.boolean().default(false)
}).refine((data) => data.title || data.content, {
    message: 'Either title or content must be provided',
    path: ['content']
});
// Update Review Request Schema
exports.UpdateReviewRequestSchema = zod_1.z.object({
    rating: exports.RatingSchema.optional(),
    title: zod_1.z.string().max(200, 'Title cannot exceed 200 characters').optional(),
    content: zod_1.z.string().min(10, 'Content must be at least 10 characters').max(2000, 'Content cannot exceed 2000 characters').optional(),
    isAnonymous: zod_1.z.boolean().optional()
});
// Review List Parameters Schema
exports.ReviewListParamsSchema = zod_1.z.object({
    therapistId: zod_1.z.string().optional(),
    clientId: zod_1.z.string().optional(),
    status: exports.ReviewStatusSchema.optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(10),
    sortBy: zod_1.z.enum(['createdAt', 'rating', 'helpfulCount']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    minRating: zod_1.z.number().min(1).max(5).optional(),
    maxRating: zod_1.z.number().min(1).max(5).optional()
}).refine((data) => !data.minRating || !data.maxRating || data.minRating <= data.maxRating, {
    message: 'Minimum rating cannot be greater than maximum rating',
    path: ['maxRating']
});
// Review List Response Schema
exports.ReviewListResponseSchema = zod_1.z.object({
    reviews: zod_1.z.array(exports.ReviewSchema),
    totalCount: zod_1.z.number().min(0),
    page: zod_1.z.number().min(1),
    pageSize: zod_1.z.number().min(1),
    totalPages: zod_1.z.number().min(0),
    averageRating: zod_1.z.number().min(0).max(5).optional(),
    ratingDistribution: zod_1.z.object({
        '1': zod_1.z.number().min(0),
        '2': zod_1.z.number().min(0),
        '3': zod_1.z.number().min(0),
        '4': zod_1.z.number().min(0),
        '5': zod_1.z.number().min(0)
    }).optional()
});
// Review Stats Schema
exports.ReviewStatsSchema = zod_1.z.object({
    totalReviews: zod_1.z.number().min(0),
    averageRating: zod_1.z.number().min(0).max(5),
    ratingDistribution: zod_1.z.object({
        '1': zod_1.z.number().min(0),
        '2': zod_1.z.number().min(0),
        '3': zod_1.z.number().min(0),
        '4': zod_1.z.number().min(0),
        '5': zod_1.z.number().min(0)
    }),
    monthlyReviews: zod_1.z.array(zod_1.z.object({
        month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)'),
        count: zod_1.z.number().min(0),
        averageRating: zod_1.z.number().min(0).max(5)
    })),
    recentReviews: zod_1.z.array(exports.ReviewSchema)
});
// Therapist Review Parameters Schema
exports.TherapistReviewParamsSchema = zod_1.z.object({
    therapistId: zod_1.z.string().min(1, 'Therapist ID is required'),
    status: exports.ReviewStatusSchema.optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(10)
});
// Moderate Review Request Schema
exports.ModerateReviewRequestSchema = zod_1.z.object({
    status: zod_1.z.enum(['approved', 'rejected']),
    moderationNote: zod_1.z.string().max(500, 'Moderation note cannot exceed 500 characters').optional()
}).refine((data) => data.status !== 'rejected' || data.moderationNote, {
    message: 'Moderation note is required when rejecting a review',
    path: ['moderationNote']
});
// Review Helpful Action Schema
exports.ReviewHelpfulActionSchema = zod_1.z.object({
    reviewId: zod_1.z.string().min(1, 'Review ID is required'),
    isHelpful: zod_1.z.boolean()
});
// Review Report Schema
exports.ReviewReportSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    reviewId: zod_1.z.string().min(1),
    reporterId: zod_1.z.string().min(1),
    reason: zod_1.z.enum([
        'inappropriate_content',
        'spam',
        'fake_review',
        'harassment',
        'other'
    ]),
    description: zod_1.z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
    status: zod_1.z.enum(['pending', 'reviewed', 'dismissed']).default('pending'),
    createdAt: zod_1.z.string().datetime(),
    reviewedAt: zod_1.z.string().datetime().optional(),
    reviewedBy: zod_1.z.string().optional()
});
// Review Analytics Schema
exports.ReviewAnalyticsSchema = zod_1.z.object({
    therapistId: zod_1.z.string().min(1),
    timeframe: zod_1.z.enum(['week', 'month', 'quarter', 'year']),
    metrics: zod_1.z.object({
        totalReviews: zod_1.z.number().min(0),
        averageRating: zod_1.z.number().min(0).max(5),
        ratingTrend: zod_1.z.number(), // Positive or negative trend
        responseRate: zod_1.z.number().min(0).max(100), // Percentage of meetings that received reviews
        improvementAreas: zod_1.z.array(zod_1.z.string())
    }),
    comparisons: zod_1.z.object({
        previousPeriod: zod_1.z.object({
            averageRating: zod_1.z.number().min(0).max(5),
            totalReviews: zod_1.z.number().min(0)
        }),
        platformAverage: zod_1.z.number().min(0).max(5)
    })
});
// Review Response Schema (when therapist responds to reviews)
exports.ReviewResponseSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    reviewId: zod_1.z.string().min(1),
    therapistId: zod_1.z.string().min(1),
    content: zod_1.z.string().min(10, 'Response must be at least 10 characters').max(1000, 'Response cannot exceed 1000 characters'),
    isPublic: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.CreateReviewResponseSchema = zod_1.z.object({
    content: zod_1.z.string().min(10, 'Response must be at least 10 characters').max(1000, 'Response cannot exceed 1000 characters'),
    isPublic: zod_1.z.boolean().default(true)
});
//# sourceMappingURL=review.js.map