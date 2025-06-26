import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileIncludeSchema } from '../inputTypeSchemas/CommentFileIncludeSchema'
import { CommentFileWhereUniqueInputSchema } from '../inputTypeSchemas/CommentFileWhereUniqueInputSchema'
import { CommentFileCreateInputSchema } from '../inputTypeSchemas/CommentFileCreateInputSchema'
import { CommentFileUncheckedCreateInputSchema } from '../inputTypeSchemas/CommentFileUncheckedCreateInputSchema'
import { CommentFileUpdateInputSchema } from '../inputTypeSchemas/CommentFileUpdateInputSchema'
import { CommentFileUncheckedUpdateInputSchema } from '../inputTypeSchemas/CommentFileUncheckedUpdateInputSchema'
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

export const CommentFileUpsertArgsSchema: z.ZodType<Prisma.CommentFileUpsertArgs> = z.object({
  select: CommentFileSelectSchema.optional(),
  include: z.lazy(() => CommentFileIncludeSchema).optional(),
  where: CommentFileWhereUniqueInputSchema,
  create: z.union([ CommentFileCreateInputSchema,CommentFileUncheckedCreateInputSchema ]),
  update: z.union([ CommentFileUpdateInputSchema,CommentFileUncheckedUpdateInputSchema ]),
}).strict() ;

export default CommentFileUpsertArgsSchema;
