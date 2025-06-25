import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyCreateManyInputSchema: z.ZodType<Prisma.ReplyCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  commentId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default ReplyCreateManyInputSchema;
