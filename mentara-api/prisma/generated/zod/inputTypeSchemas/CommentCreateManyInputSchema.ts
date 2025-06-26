import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentCreateManyInputSchema: z.ZodType<Prisma.CommentCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  userId: z.string(),
  content: z.string(),
  heartCount: z.number().int().optional(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default CommentCreateManyInputSchema;
