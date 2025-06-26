import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileIncludeSchema } from '../inputTypeSchemas/PostFileIncludeSchema'
import { PostFileWhereUniqueInputSchema } from '../inputTypeSchemas/PostFileWhereUniqueInputSchema'
import { PostFileCreateInputSchema } from '../inputTypeSchemas/PostFileCreateInputSchema'
import { PostFileUncheckedCreateInputSchema } from '../inputTypeSchemas/PostFileUncheckedCreateInputSchema'
import { PostFileUpdateInputSchema } from '../inputTypeSchemas/PostFileUpdateInputSchema'
import { PostFileUncheckedUpdateInputSchema } from '../inputTypeSchemas/PostFileUncheckedUpdateInputSchema'
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

export const PostFileUpsertArgsSchema: z.ZodType<Prisma.PostFileUpsertArgs> = z.object({
  select: PostFileSelectSchema.optional(),
  include: z.lazy(() => PostFileIncludeSchema).optional(),
  where: PostFileWhereUniqueInputSchema,
  create: z.union([ PostFileCreateInputSchema,PostFileUncheckedCreateInputSchema ]),
  update: z.union([ PostFileUpdateInputSchema,PostFileUncheckedUpdateInputSchema ]),
}).strict() ;

export default PostFileUpsertArgsSchema;
