import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostFileCreateWithoutPostInputSchema: z.ZodType<Prisma.PostFileCreateWithoutPostInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default PostFileCreateWithoutPostInputSchema;
