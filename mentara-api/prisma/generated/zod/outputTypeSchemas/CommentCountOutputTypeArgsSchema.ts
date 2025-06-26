import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentCountOutputTypeSelectSchema } from './CommentCountOutputTypeSelectSchema';

export const CommentCountOutputTypeArgsSchema: z.ZodType<Prisma.CommentCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CommentCountOutputTypeSelectSchema).nullish(),
}).strict();

export default CommentCountOutputTypeSelectSchema;
