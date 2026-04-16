/**
 * Reviews Module Validation Schemas - Zod schemas for review operations
 * Separated from types for clean architecture
 */

import { z } from 'zod';

// Rating validation helper
const ratingSchema = z
  .number()
  .int()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

// Category ratings schema
const categoriesSchema = z
  .object({
    communication: ratingSchema.optional(),
    professionalism: ratingSchema.optional(),
    helpfulness: ratingSchema.optional(),
    availability: ratingSchema.optional(),
    overall: ratingSchema.optional(),
  })
  .optional();

// Review creation validation
export const CreateReviewDtoSchema = z
  .object({
    rating: ratingSchema,
    comment: z
      .string()
      .max(2000, 'Comment must be less than 2000 characters')
      .optional(),
    isAnonymous: z.boolean().optional(),
    categories: categoriesSchema,
    tags: z
      .array(z.string().max(50, 'Tag must be less than 50 characters'))
      .max(10, 'Maximum 10 tags allowed')
      .optional(),
    wouldRecommend: z.boolean().optional(),
  })
  .strict();

// Review update validation
export const UpdateReviewDtoSchema = z
  .object({
    rating: ratingSchema.optional(),
    comment: z
      .string()
      .max(2000, 'Comment must be less than 2000 characters')
      .optional(),
    isAnonymous: z.boolean().optional(),
    categories: categoriesSchema,
    tags: z
      .array(z.string().max(50, 'Tag must be less than 50 characters'))
      .max(10, 'Maximum 10 tags allowed')
      .optional(),
    wouldRecommend: z.boolean().optional(),
  })
  .strict();

// Review moderation validation
export const ModerateReviewDtoSchema = z
  .object({
    action: z.enum(['approve', 'reject', 'flag', 'hide'] as const, {
      message: 'Invalid moderation action',
    }),
    reason: z
      .string()
      .max(500, 'Reason must be less than 500 characters')
      .optional(),
    moderatorNotes: z
      .string()
      .max(1000, 'Moderator notes must be less than 1000 characters')
      .optional(),
  })
  .strict();

// Review query validation
export const GetReviewsDtoSchema = z
  .object({
    therapistId: z.string().uuid('Invalid therapist ID').optional(),
    clientId: z.string().uuid('Invalid client ID').optional(),
    rating: ratingSchema.optional(),
    minRating: ratingSchema.optional(),
    maxRating: ratingSchema.optional(),
    status: z
      .enum(['pending', 'approved', 'rejected', 'flagged', 'hidden'] as const, {
        message: 'Invalid status',
      })
      .optional(),
    isAnonymous: z.boolean().optional(),
    sortBy: z
      .enum(['rating', 'date', 'helpful'] as const, {
        message: 'Invalid sort field',
      })
      .optional(),
    sortOrder: z
      .enum(['asc', 'desc'] as const, {
        message: 'Invalid sort order',
      })
      .optional(),
    limit: z
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .optional(),
    offset: z.number().int().min(0, 'Offset cannot be negative').optional(),
    includeModerated: z.boolean().optional(),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    tags: z
      .array(z.string().max(50, 'Tag must be less than 50 characters'))
      .optional(),
  })
  .strict();

// Path parameter validation
export const ReviewIdParamSchema = z.object({
  id: z.string().uuid('Invalid review ID format'),
});

export const TherapistIdParamSchema = z.object({
  therapistId: z.string().uuid('Invalid therapist ID format'),
});

export const MeetingIdParamSchema = z.object({
  meetingId: z.string().uuid('Invalid meeting ID format'),
});

// Review interaction validation
export const ReviewHelpfulDtoSchema = z
  .object({
    action: z.enum(['helpful', 'unhelpful', 'remove'] as const, {
      message: 'Invalid action',
    }),
  })
  .strict();

export const ReviewReportDtoSchema = z
  .object({
    reason: z.enum(
      ['inappropriate', 'spam', 'fake', 'harassment', 'other'] as const,
      {
        message: 'Invalid report reason',
      },
    ),
    description: z
      .string()
      .max(1000, 'Description must be less than 1000 characters')
      .optional(),
  })
  .strict();
