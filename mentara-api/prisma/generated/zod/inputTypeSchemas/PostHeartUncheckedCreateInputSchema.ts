import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostHeartUncheckedCreateInputSchema: z.ZodType<Prisma.PostHeartUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  createdAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable()
}).strict();

export default PostHeartUncheckedCreateInputSchema;
