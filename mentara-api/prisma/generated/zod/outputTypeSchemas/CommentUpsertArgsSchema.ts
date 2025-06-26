import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentIncludeSchema } from '../inputTypeSchemas/CommentIncludeSchema'
import { CommentWhereUniqueInputSchema } from '../inputTypeSchemas/CommentWhereUniqueInputSchema'
import { CommentCreateInputSchema } from '../inputTypeSchemas/CommentCreateInputSchema'
import { CommentUncheckedCreateInputSchema } from '../inputTypeSchemas/CommentUncheckedCreateInputSchema'
import { CommentUpdateInputSchema } from '../inputTypeSchemas/CommentUpdateInputSchema'
import { CommentUncheckedUpdateInputSchema } from '../inputTypeSchemas/CommentUncheckedUpdateInputSchema'
import { PostArgsSchema } from "../outputTypeSchemas/PostArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { CommentArgsSchema } from "../outputTypeSchemas/CommentArgsSchema"
import { CommentFindManyArgsSchema } from "../outputTypeSchemas/CommentFindManyArgsSchema"
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
  heartCount: z.boolean().optional(),
  parentId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  post: z.union([z.boolean(),z.lazy(() => PostArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  parent: z.union([z.boolean(),z.lazy(() => CommentArgsSchema)]).optional(),
  children: z.union([z.boolean(),z.lazy(() => CommentFindManyArgsSchema)]).optional(),
  hearts: z.union([z.boolean(),z.lazy(() => CommentHeartFindManyArgsSchema)]).optional(),
  files: z.union([z.boolean(),z.lazy(() => CommentFileFindManyArgsSchema)]).optional(),
  replies: z.union([z.boolean(),z.lazy(() => ReplyFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CommentCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const CommentUpsertArgsSchema: z.ZodType<Prisma.CommentUpsertArgs> = z.object({
  select: CommentSelectSchema.optional(),
  include: z.lazy(() => CommentIncludeSchema).optional(),
  where: CommentWhereUniqueInputSchema,
  create: z.union([ CommentCreateInputSchema,CommentUncheckedCreateInputSchema ]),
  update: z.union([ CommentUpdateInputSchema,CommentUncheckedUpdateInputSchema ]),
}).strict() ;

export default CommentUpsertArgsSchema;
