import { z } from 'zod';

export const CommunityIdParamSchema = z.object({
  id: z.string().uuid('Invalid community ID format'),
});

export const CreateCommunitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().url('Invalid image URL'),
  category: z.string().optional().default('mental-health'),
  tags: z.array(z.string()).optional(),
}).strict();

export const UpdateCommunitySchema = CreateCommunitySchema.partial().strict();

export const JoinCommunitySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
}).strict();
