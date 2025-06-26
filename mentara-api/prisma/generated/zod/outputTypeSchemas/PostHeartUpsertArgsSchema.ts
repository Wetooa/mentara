import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostHeartIncludeSchema } from '../inputTypeSchemas/PostHeartIncludeSchema'
import { PostHeartWhereUniqueInputSchema } from '../inputTypeSchemas/PostHeartWhereUniqueInputSchema'
import { PostHeartCreateInputSchema } from '../inputTypeSchemas/PostHeartCreateInputSchema'
import { PostHeartUncheckedCreateInputSchema } from '../inputTypeSchemas/PostHeartUncheckedCreateInputSchema'
import { PostHeartUpdateInputSchema } from '../inputTypeSchemas/PostHeartUpdateInputSchema'
import { PostHeartUncheckedUpdateInputSchema } from '../inputTypeSchemas/PostHeartUncheckedUpdateInputSchema'
import { PostArgsSchema } from "../outputTypeSchemas/PostArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const PostHeartSelectSchema: z.ZodType<Prisma.PostHeartSelect> = z.object({
  id: z.boolean().optional(),
  postId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  post: z.union([z.boolean(),z.lazy(() => PostArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const PostHeartUpsertArgsSchema: z.ZodType<Prisma.PostHeartUpsertArgs> = z.object({
  select: PostHeartSelectSchema.optional(),
  include: z.lazy(() => PostHeartIncludeSchema).optional(),
  where: PostHeartWhereUniqueInputSchema,
  create: z.union([ PostHeartCreateInputSchema,PostHeartUncheckedCreateInputSchema ]),
  update: z.union([ PostHeartUpdateInputSchema,PostHeartUncheckedUpdateInputSchema ]),
}).strict() ;

export default PostHeartUpsertArgsSchema;
