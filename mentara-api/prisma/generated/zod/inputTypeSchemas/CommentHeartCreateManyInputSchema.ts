import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentHeartCreateManyInputSchema: z.ZodType<Prisma.CommentHeartCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  commentId: z.string(),
  createdAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable()
}).strict();

export default CommentHeartCreateManyInputSchema;
