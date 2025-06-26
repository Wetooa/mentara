import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const PostCountOutputTypeSelectSchema: z.ZodType<Prisma.PostCountOutputTypeSelect> = z.object({
  files: z.boolean().optional(),
  comments: z.boolean().optional(),
  hearts: z.boolean().optional(),
}).strict();

export default PostCountOutputTypeSelectSchema;
