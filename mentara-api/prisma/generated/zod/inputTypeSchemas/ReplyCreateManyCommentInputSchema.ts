import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyCreateManyCommentInputSchema: z.ZodType<Prisma.ReplyCreateManyCommentInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default ReplyCreateManyCommentInputSchema;
