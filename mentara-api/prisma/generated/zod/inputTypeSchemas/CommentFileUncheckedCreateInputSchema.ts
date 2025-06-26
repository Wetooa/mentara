import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentFileUncheckedCreateInputSchema: z.ZodType<Prisma.CommentFileUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  commentId: z.string(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default CommentFileUncheckedCreateInputSchema;
