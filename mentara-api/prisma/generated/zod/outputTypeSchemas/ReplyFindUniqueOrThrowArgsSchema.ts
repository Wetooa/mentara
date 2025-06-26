import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyIncludeSchema } from '../inputTypeSchemas/ReplyIncludeSchema'
import { ReplyWhereUniqueInputSchema } from '../inputTypeSchemas/ReplyWhereUniqueInputSchema'
import { CommentArgsSchema } from "../outputTypeSchemas/CommentArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ReplyHeartFindManyArgsSchema } from "../outputTypeSchemas/ReplyHeartFindManyArgsSchema"
import { ReplyFileFindManyArgsSchema } from "../outputTypeSchemas/ReplyFileFindManyArgsSchema"
import { ReplyCountOutputTypeArgsSchema } from "../outputTypeSchemas/ReplyCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ReplySelectSchema: z.ZodType<Prisma.ReplySelect> = z.object({
  id: z.boolean().optional(),
  commentId: z.boolean().optional(),
  userId: z.boolean().optional(),
  content: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  comment: z.union([z.boolean(),z.lazy(() => CommentArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  hearts: z.union([z.boolean(),z.lazy(() => ReplyHeartFindManyArgsSchema)]).optional(),
  files: z.union([z.boolean(),z.lazy(() => ReplyFileFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ReplyCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ReplyFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ReplyFindUniqueOrThrowArgs> = z.object({
  select: ReplySelectSchema.optional(),
  include: z.lazy(() => ReplyIncludeSchema).optional(),
  where: ReplyWhereUniqueInputSchema,
}).strict() ;

export default ReplyFindUniqueOrThrowArgsSchema;
