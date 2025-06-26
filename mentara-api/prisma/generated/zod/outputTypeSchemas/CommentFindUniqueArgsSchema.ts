import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentIncludeSchema } from '../inputTypeSchemas/CommentIncludeSchema'
import { CommentWhereUniqueInputSchema } from '../inputTypeSchemas/CommentWhereUniqueInputSchema'
import { PostArgsSchema } from "../outputTypeSchemas/PostArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { CommentHeartFindManyArgsSchema } from "../outputTypeSchemas/CommentHeartFindManyArgsSchema"
import { CommentFileFindManyArgsSchema } from "../outputTypeSchemas/CommentFileFindManyArgsSchema"
import { ReplyFindManyArgsSchema } from "../outputTypeSchemas/ReplyFindManyArgsSchema"
import { CommentCountOutputTypeArgsSchema } from "../outputTypeSchemas/CommentCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CommentSelectSchema: z.ZodType<Prisma.CommentSelect> = z.object({
  id: z.boolean().optional(),
  postId: z.boolean().optional(),
  userId: z.boolean().optional(),
  content: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  post: z.union([z.boolean(),z.lazy(() => PostArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  hearts: z.union([z.boolean(),z.lazy(() => CommentHeartFindManyArgsSchema)]).optional(),
  files: z.union([z.boolean(),z.lazy(() => CommentFileFindManyArgsSchema)]).optional(),
  replies: z.union([z.boolean(),z.lazy(() => ReplyFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CommentCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const CommentFindUniqueArgsSchema: z.ZodType<Prisma.CommentFindUniqueArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: z.lazy(() => CommentIncludeSchema).optional(),
  where: CommentWhereUniqueInputSchema,
}).strict() ;

export default CommentFindUniqueArgsSchema;
