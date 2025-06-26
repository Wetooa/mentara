import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentFileCreateManyCommentInputSchema: z.ZodType<Prisma.CommentFileCreateManyCommentInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default CommentFileCreateManyCommentInputSchema;
