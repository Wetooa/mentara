import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostHeartCreateManyUserInputSchema: z.ZodType<Prisma.PostHeartCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default PostHeartCreateManyUserInputSchema;
