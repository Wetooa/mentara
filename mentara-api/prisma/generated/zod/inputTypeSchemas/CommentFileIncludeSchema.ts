import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentArgsSchema } from "../outputTypeSchemas/CommentArgsSchema"

export const CommentFileIncludeSchema: z.ZodType<Prisma.CommentFileInclude> = z.object({
  comment: z.union([z.boolean(),z.lazy(() => CommentArgsSchema)]).optional(),
}).strict()

export default CommentFileIncludeSchema;
