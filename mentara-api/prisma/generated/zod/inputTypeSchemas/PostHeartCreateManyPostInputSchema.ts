import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostHeartCreateManyPostInputSchema: z.ZodType<Prisma.PostHeartCreateManyPostInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable()
}).strict();

export default PostHeartCreateManyPostInputSchema;
