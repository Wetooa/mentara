/**
 * Community Module Validation Schemas - Zod schemas for community operations
 * Separated from types for clean architecture
 */

import { z } from 'zod';

// Community creation validation
export const CommunityCreateInputDtoSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Community name is required')
      .max(100, 'Community name must be less than 100 characters'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(1000, 'Description must be less than 1000 characters'),
    slug: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      )
      .optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    isPrivate: z.boolean().optional(),
    category: z
      .string()
      .max(50, 'Category must be less than 50 characters')
      .optional(),
    tags: z
      .array(z.string().max(50, 'Tag must be less than 50 characters'))
      .max(10, 'Maximum 10 tags allowed')
      .optional(),
    rules: z
      .array(z.string().max(200, 'Rule must be less than 200 characters'))
      .max(20, 'Maximum 20 rules allowed')
      .optional(),
    moderatorIds: z.array(z.string().uuid('Invalid moderator ID')).optional(),
    maxMembers: z
      .number()
      .int()
      .min(1, 'Must allow at least 1 member')
      .max(10000, 'Maximum 10000 members allowed')
      .optional(),
    requireApproval: z.boolean().optional(),
  })
  .strict();

// Community update validation
export const CommunityUpdateInputDtoSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Community name cannot be empty')
      .max(100, 'Community name must be less than 100 characters')
      .optional(),
    description: z
      .string()
      .min(1, 'Description cannot be empty')
      .max(1000, 'Description must be less than 1000 characters')
      .optional(),
    slug: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      )
      .optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    isPrivate: z.boolean().optional(),
    category: z
      .string()
      .max(50, 'Category must be less than 50 characters')
      .optional(),
    tags: z
      .array(z.string().max(50, 'Tag must be less than 50 characters'))
      .max(10, 'Maximum 10 tags allowed')
      .optional(),
    rules: z
      .array(z.string().max(200, 'Rule must be less than 200 characters'))
      .max(20, 'Maximum 20 rules allowed')
      .optional(),
    moderatorIds: z.array(z.string().uuid('Invalid moderator ID')).optional(),
    maxMembers: z
      .number()
      .int()
      .min(1, 'Must allow at least 1 member')
      .max(10000, 'Maximum 10000 members allowed')
      .optional(),
    requireApproval: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

// Community recommendation validation schemas
export const GenerateRecommendationsDtoSchema = z
  .object({
    userId: z.string().uuid('Invalid user ID'),
    limit: z
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(50, 'Limit cannot exceed 50')
      .optional(),
    includeReason: z.boolean().optional(),
    categories: z
      .array(z.string().max(50, 'Category must be less than 50 characters'))
      .optional(),
    excludeCommunityIds: z
      .array(z.string().uuid('Invalid community ID'))
      .optional(),
    basedOnActivity: z.boolean().optional(),
    basedOnProfile: z.boolean().optional(),
  })
  .strict();

export const RecommendationInteractionDtoSchema = z
  .object({
    userId: z.string().uuid('Invalid user ID'),
    communityId: z.string().uuid('Invalid community ID'),
    action: z.enum(['view', 'join', 'dismiss', 'report'] as const, {
      message: 'Invalid action',
    }),
    metadata: z
      .object({
        viewDuration: z
          .number()
          .int()
          .min(0, 'View duration cannot be negative')
          .optional(),
        source: z
          .string()
          .max(50, 'Source must be less than 50 characters')
          .optional(),
        reason: z
          .string()
          .max(200, 'Reason must be less than 200 characters')
          .optional(),
      })
      .optional(),
  })
  .strict();

export const RecommendationQueryDtoSchema = z
  .object({
    limit: z
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .optional(),
    offset: z.number().int().min(0, 'Offset cannot be negative').optional(),
    category: z
      .string()
      .max(50, 'Category must be less than 50 characters')
      .optional(),
    includeJoined: z.boolean().optional(),
    sortBy: z
      .enum(['relevance', 'popularity', 'recent', 'activity'] as const, {
        message: 'Invalid sort option',
      })
      .optional(),
    filters: z
      .object({
        memberCount: z
          .object({
            min: z
              .number()
              .int()
              .min(0, 'Minimum member count cannot be negative')
              .optional(),
            max: z
              .number()
              .int()
              .min(1, 'Maximum member count must be at least 1')
              .optional(),
          })
          .optional(),
        isPrivate: z.boolean().optional(),
        requireApproval: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();
