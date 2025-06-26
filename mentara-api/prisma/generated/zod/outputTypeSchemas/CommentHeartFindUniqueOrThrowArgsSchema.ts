import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentHeartIncludeSchema } from '../inputTypeSchemas/CommentHeartIncludeSchema'
import { CommentHeartWhereUniqueInputSchema } from '../inputTypeSchemas/CommentHeartWhereUniqueInputSchema'
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

export const CommentHeartFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CommentHeartFindUniqueOrThrowArgs> = z.object({
  select: CommentHeartSelectSchema.optional(),
  include: z.lazy(() => CommentHeartIncludeSchema).optional(),
  where: CommentHeartWhereUniqueInputSchema,
}).strict() ;

export default CommentHeartFindUniqueOrThrowArgsSchema;
