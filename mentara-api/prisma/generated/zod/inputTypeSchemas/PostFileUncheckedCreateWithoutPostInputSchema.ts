import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostFileUncheckedCreateWithoutPostInputSchema: z.ZodType<Prisma.PostFileUncheckedCreateWithoutPostInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default PostFileUncheckedCreateWithoutPostInputSchema;
