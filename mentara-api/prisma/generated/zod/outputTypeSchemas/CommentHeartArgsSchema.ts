import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentHeartSelectSchema } from '../inputTypeSchemas/CommentHeartSelectSchema';
import { CommentHeartIncludeSchema } from '../inputTypeSchemas/CommentHeartIncludeSchema';

export const CommentHeartArgsSchema: z.ZodType<Prisma.CommentHeartDefaultArgs> = z.object({
  select: z.lazy(() => CommentHeartSelectSchema).optional(),
  include: z.lazy(() => CommentHeartIncludeSchema).optional(),
}).strict();

export default CommentHeartArgsSchema;
