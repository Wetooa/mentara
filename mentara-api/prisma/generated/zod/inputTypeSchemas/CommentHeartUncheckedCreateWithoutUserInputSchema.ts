import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CommentHeartUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.CommentHeartUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  commentId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default CommentHeartUncheckedCreateWithoutUserInputSchema;
