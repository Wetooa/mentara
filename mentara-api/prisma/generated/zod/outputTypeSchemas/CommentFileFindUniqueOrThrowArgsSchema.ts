import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileIncludeSchema } from '../inputTypeSchemas/CommentFileIncludeSchema'
import { CommentFileWhereUniqueInputSchema } from '../inputTypeSchemas/CommentFileWhereUniqueInputSchema'
import { CommentArgsSchema } from "../outputTypeSchemas/CommentArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CommentFileSelectSchema: z.ZodType<Prisma.CommentFileSelect> = z.object({
  id: z.boolean().optional(),
  commentId: z.boolean().optional(),
  url: z.boolean().optional(),
  type: z.boolean().optional(),
  comment: z.union([z.boolean(),z.lazy(() => CommentArgsSchema)]).optional(),
}).strict()

export const CommentFileFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CommentFileFindUniqueOrThrowArgs> = z.object({
  select: CommentFileSelectSchema.optional(),
  include: z.lazy(() => CommentFileIncludeSchema).optional(),
  where: CommentFileWhereUniqueInputSchema,
}).strict() ;

export default CommentFileFindUniqueOrThrowArgsSchema;
