import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileIncludeSchema } from '../inputTypeSchemas/CommentFileIncludeSchema'
import { CommentFileWhereInputSchema } from '../inputTypeSchemas/CommentFileWhereInputSchema'
import { CommentFileOrderByWithRelationInputSchema } from '../inputTypeSchemas/CommentFileOrderByWithRelationInputSchema'
import { CommentFileWhereUniqueInputSchema } from '../inputTypeSchemas/CommentFileWhereUniqueInputSchema'
import { CommentFileScalarFieldEnumSchema } from '../inputTypeSchemas/CommentFileScalarFieldEnumSchema'
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

export const CommentFileFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CommentFileFindFirstOrThrowArgs> = z.object({
  select: CommentFileSelectSchema.optional(),
  include: z.lazy(() => CommentFileIncludeSchema).optional(),
  where: CommentFileWhereInputSchema.optional(),
  orderBy: z.union([ CommentFileOrderByWithRelationInputSchema.array(),CommentFileOrderByWithRelationInputSchema ]).optional(),
  cursor: CommentFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CommentFileScalarFieldEnumSchema,CommentFileScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default CommentFileFindFirstOrThrowArgsSchema;
