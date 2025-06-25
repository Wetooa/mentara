import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileIncludeSchema } from '../inputTypeSchemas/PostFileIncludeSchema'
import { PostFileWhereUniqueInputSchema } from '../inputTypeSchemas/PostFileWhereUniqueInputSchema'
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

export const PostFileFindUniqueArgsSchema: z.ZodType<Prisma.PostFileFindUniqueArgs> = z.object({
  select: PostFileSelectSchema.optional(),
  include: z.lazy(() => PostFileIncludeSchema).optional(),
  where: PostFileWhereUniqueInputSchema,
}).strict() ;

export default PostFileFindUniqueArgsSchema;
