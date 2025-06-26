import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileSelectSchema } from '../inputTypeSchemas/PostFileSelectSchema';
import { PostFileIncludeSchema } from '../inputTypeSchemas/PostFileIncludeSchema';

export const PostFileArgsSchema: z.ZodType<Prisma.PostFileDefaultArgs> = z.object({
  select: z.lazy(() => PostFileSelectSchema).optional(),
  include: z.lazy(() => PostFileIncludeSchema).optional(),
}).strict();

export default PostFileArgsSchema;
