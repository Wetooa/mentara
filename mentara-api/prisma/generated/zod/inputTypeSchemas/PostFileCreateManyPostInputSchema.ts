import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostFileCreateManyPostInputSchema: z.ZodType<Prisma.PostFileCreateManyPostInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default PostFileCreateManyPostInputSchema;
