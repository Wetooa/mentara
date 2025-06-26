import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostCreateManyRoomInputSchema: z.ZodType<Prisma.PostCreateManyRoomInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable()
}).strict();

export default PostCreateManyRoomInputSchema;
