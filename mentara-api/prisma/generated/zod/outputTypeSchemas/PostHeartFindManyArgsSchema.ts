import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostHeartIncludeSchema } from '../inputTypeSchemas/PostHeartIncludeSchema'
import { PostHeartWhereInputSchema } from '../inputTypeSchemas/PostHeartWhereInputSchema'
import { PostHeartOrderByWithRelationInputSchema } from '../inputTypeSchemas/PostHeartOrderByWithRelationInputSchema'
import { PostHeartWhereUniqueInputSchema } from '../inputTypeSchemas/PostHeartWhereUniqueInputSchema'
import { PostHeartScalarFieldEnumSchema } from '../inputTypeSchemas/PostHeartScalarFieldEnumSchema'
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

export const PostHeartFindManyArgsSchema: z.ZodType<Prisma.PostHeartFindManyArgs> = z.object({
  select: PostHeartSelectSchema.optional(),
  include: z.lazy(() => PostHeartIncludeSchema).optional(),
  where: PostHeartWhereInputSchema.optional(),
  orderBy: z.union([ PostHeartOrderByWithRelationInputSchema.array(),PostHeartOrderByWithRelationInputSchema ]).optional(),
  cursor: PostHeartWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PostHeartScalarFieldEnumSchema,PostHeartScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default PostHeartFindManyArgsSchema;
