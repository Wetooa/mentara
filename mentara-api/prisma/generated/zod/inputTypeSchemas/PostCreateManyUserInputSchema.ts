import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostCreateManyUserInputSchema: z.ZodType<Prisma.PostCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  roomId: z.string().optional().nullable()
}).strict();

export default PostCreateManyUserInputSchema;
