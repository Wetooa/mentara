import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentCreateManyUserInputSchema: z.ZodType<Prisma.CommentCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  content: z.string(),
  heartCount: z.number().int().optional(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default CommentCreateManyUserInputSchema;
