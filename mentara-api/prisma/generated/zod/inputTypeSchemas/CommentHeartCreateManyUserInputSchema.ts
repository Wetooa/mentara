import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentHeartCreateManyUserInputSchema: z.ZodType<Prisma.CommentHeartCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  commentId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default CommentHeartCreateManyUserInputSchema;
