import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const CommentCountOutputTypeSelectSchema: z.ZodType<Prisma.CommentCountOutputTypeSelect> = z.object({
  hearts: z.boolean().optional(),
  files: z.boolean().optional(),
  replies: z.boolean().optional(),
}).strict();

export default CommentCountOutputTypeSelectSchema;
