import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentHeartUncheckedCreateInputSchema: z.ZodType<Prisma.CommentHeartUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  commentId: z.string(),
  createdAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable()
}).strict();

export default CommentHeartUncheckedCreateInputSchema;
