import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentCreateManyParentInputSchema: z.ZodType<Prisma.CommentCreateManyParentInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  userId: z.string(),
  content: z.string(),
  heartCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default CommentCreateManyParentInputSchema;
