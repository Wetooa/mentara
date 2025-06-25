import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostArgsSchema } from "../outputTypeSchemas/PostArgsSchema"

export const PostFileIncludeSchema: z.ZodType<Prisma.PostFileInclude> = z.object({
  post: z.union([z.boolean(),z.lazy(() => PostArgsSchema)]).optional(),
}).strict()

export default PostFileIncludeSchema;
