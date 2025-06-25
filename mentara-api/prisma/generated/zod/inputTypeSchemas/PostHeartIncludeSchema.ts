import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostArgsSchema } from "../outputTypeSchemas/PostArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const PostHeartIncludeSchema: z.ZodType<Prisma.PostHeartInclude> = z.object({
  post: z.union([z.boolean(),z.lazy(() => PostArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default PostHeartIncludeSchema;
