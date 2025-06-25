import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostCreateManyInputSchema: z.ZodType<Prisma.PostCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable()
}).strict();

export default PostCreateManyInputSchema;
