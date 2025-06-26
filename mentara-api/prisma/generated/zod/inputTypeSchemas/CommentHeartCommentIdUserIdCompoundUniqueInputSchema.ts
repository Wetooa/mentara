import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentHeartCommentIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.CommentHeartCommentIdUserIdCompoundUniqueInput> = z.object({
  commentId: z.string(),
  userId: z.string()
}).strict();

export default CommentHeartCommentIdUserIdCompoundUniqueInputSchema;
