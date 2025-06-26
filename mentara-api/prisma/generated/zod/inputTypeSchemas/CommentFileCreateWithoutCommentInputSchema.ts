import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentFileCreateWithoutCommentInputSchema: z.ZodType<Prisma.CommentFileCreateWithoutCommentInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default CommentFileCreateWithoutCommentInputSchema;
