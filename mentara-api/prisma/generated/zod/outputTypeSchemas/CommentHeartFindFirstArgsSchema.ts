import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentHeartIncludeSchema } from '../inputTypeSchemas/CommentHeartIncludeSchema'
import { CommentHeartWhereInputSchema } from '../inputTypeSchemas/CommentHeartWhereInputSchema'
import { CommentHeartOrderByWithRelationInputSchema } from '../inputTypeSchemas/CommentHeartOrderByWithRelationInputSchema'
import { CommentHeartWhereUniqueInputSchema } from '../inputTypeSchemas/CommentHeartWhereUniqueInputSchema'
import { CommentHeartScalarFieldEnumSchema } from '../inputTypeSchemas/CommentHeartScalarFieldEnumSchema'
import { CommentArgsSchema } from "../outputTypeSchemas/CommentArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CommentHeartSelectSchema: z.ZodType<Prisma.CommentHeartSelect> = z.object({
  id: z.boolean().optional(),
  commentId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  comment: z.union([z.boolean(),z.lazy(() => CommentArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const CommentHeartFindFirstArgsSchema: z.ZodType<Prisma.CommentHeartFindFirstArgs> = z.object({
  select: CommentHeartSelectSchema.optional(),
  include: z.lazy(() => CommentHeartIncludeSchema).optional(),
  where: CommentHeartWhereInputSchema.optional(),
  orderBy: z.union([ CommentHeartOrderByWithRelationInputSchema.array(),CommentHeartOrderByWithRelationInputSchema ]).optional(),
  cursor: CommentHeartWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CommentHeartScalarFieldEnumSchema,CommentHeartScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default CommentHeartFindFirstArgsSchema;
