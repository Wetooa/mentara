import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostHeartSelectSchema } from '../inputTypeSchemas/PostHeartSelectSchema';
import { PostHeartIncludeSchema } from '../inputTypeSchemas/PostHeartIncludeSchema';

export const PostHeartArgsSchema: z.ZodType<Prisma.PostHeartDefaultArgs> = z.object({
  select: z.lazy(() => PostHeartSelectSchema).optional(),
  include: z.lazy(() => PostHeartIncludeSchema).optional(),
}).strict();

export default PostHeartArgsSchema;
