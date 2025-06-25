import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentArgsSchema } from "../outputTypeSchemas/CommentArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const CommentHeartIncludeSchema: z.ZodType<Prisma.CommentHeartInclude> = z.object({
  comment: z.union([z.boolean(),z.lazy(() => CommentArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default CommentHeartIncludeSchema;
