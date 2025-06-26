import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostFileUncheckedCreateInputSchema: z.ZodType<Prisma.PostFileUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default PostFileUncheckedCreateInputSchema;
