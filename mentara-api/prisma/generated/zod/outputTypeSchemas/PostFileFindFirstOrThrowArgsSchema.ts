import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileIncludeSchema } from '../inputTypeSchemas/PostFileIncludeSchema'
import { PostFileWhereInputSchema } from '../inputTypeSchemas/PostFileWhereInputSchema'
import { PostFileOrderByWithRelationInputSchema } from '../inputTypeSchemas/PostFileOrderByWithRelationInputSchema'
import { PostFileWhereUniqueInputSchema } from '../inputTypeSchemas/PostFileWhereUniqueInputSchema'
import { PostFileScalarFieldEnumSchema } from '../inputTypeSchemas/PostFileScalarFieldEnumSchema'
import { PostArgsSchema } from "../outputTypeSchemas/PostArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const PostFileSelectSchema: z.ZodType<Prisma.PostFileSelect> = z.object({
  id: z.boolean().optional(),
  postId: z.boolean().optional(),
  url: z.boolean().optional(),
  type: z.boolean().optional(),
  post: z.union([z.boolean(),z.lazy(() => PostArgsSchema)]).optional(),
}).strict()

export const PostFileFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PostFileFindFirstOrThrowArgs> = z.object({
  select: PostFileSelectSchema.optional(),
  include: z.lazy(() => PostFileIncludeSchema).optional(),
  where: PostFileWhereInputSchema.optional(),
  orderBy: z.union([ PostFileOrderByWithRelationInputSchema.array(),PostFileOrderByWithRelationInputSchema ]).optional(),
  cursor: PostFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PostFileScalarFieldEnumSchema,PostFileScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default PostFileFindFirstOrThrowArgsSchema;
