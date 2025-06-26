import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostArgsSchema } from "../outputTypeSchemas/PostArgsSchema"

export const PostFileSelectSchema: z.ZodType<Prisma.PostFileSelect> = z.object({
  id: z.boolean().optional(),
  postId: z.boolean().optional(),
  url: z.boolean().optional(),
  type: z.boolean().optional(),
  post: z.union([z.boolean(),z.lazy(() => PostArgsSchema)]).optional(),
}).strict()

export default PostFileSelectSchema;
