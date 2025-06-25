import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentArgsSchema } from "../outputTypeSchemas/CommentArgsSchema"

export const CommentFileSelectSchema: z.ZodType<Prisma.CommentFileSelect> = z.object({
  id: z.boolean().optional(),
  commentId: z.boolean().optional(),
  url: z.boolean().optional(),
  type: z.boolean().optional(),
  comment: z.union([z.boolean(),z.lazy(() => CommentArgsSchema)]).optional(),
}).strict()

export default CommentFileSelectSchema;
