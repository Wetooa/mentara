import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentCreateManyPostInputSchema: z.ZodType<Prisma.CommentCreateManyPostInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default CommentCreateManyPostInputSchema;
