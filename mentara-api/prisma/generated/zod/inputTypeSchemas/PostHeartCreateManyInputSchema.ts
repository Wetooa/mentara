import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostHeartCreateManyInputSchema: z.ZodType<Prisma.PostHeartCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  createdAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable()
}).strict();

export default PostHeartCreateManyInputSchema;
