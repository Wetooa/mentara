import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostHeartUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.PostHeartUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default PostHeartUncheckedCreateWithoutUserInputSchema;
