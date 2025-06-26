import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileIncludeSchema } from '../inputTypeSchemas/CommentFileIncludeSchema'
import { CommentFileCreateInputSchema } from '../inputTypeSchemas/CommentFileCreateInputSchema'
import { CommentFileUncheckedCreateInputSchema } from '../inputTypeSchemas/CommentFileUncheckedCreateInputSchema'
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

export const CommentFileCreateArgsSchema: z.ZodType<Prisma.CommentFileCreateArgs> = z.object({
  select: CommentFileSelectSchema.optional(),
  include: z.lazy(() => CommentFileIncludeSchema).optional(),
  data: z.union([ CommentFileCreateInputSchema,CommentFileUncheckedCreateInputSchema ]),
}).strict() ;

export default CommentFileCreateArgsSchema;
