import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostIncludeSchema } from '../inputTypeSchemas/PostIncludeSchema'
import { PostWhereUniqueInputSchema } from '../inputTypeSchemas/PostWhereUniqueInputSchema'
import { PostFileFindManyArgsSchema } from "../outputTypeSchemas/PostFileFindManyArgsSchema"
import { CommentFindManyArgsSchema } from "../outputTypeSchemas/CommentFindManyArgsSchema"
import { PostHeartFindManyArgsSchema } from "../outputTypeSchemas/PostHeartFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { RoomArgsSchema } from "../outputTypeSchemas/RoomArgsSchema"
import { PostCountOutputTypeArgsSchema } from "../outputTypeSchemas/PostCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const PostSelectSchema: z.ZodType<Prisma.PostSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  content: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  roomId: z.boolean().optional(),
  files: z.union([z.boolean(),z.lazy(() => PostFileFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => CommentFindManyArgsSchema)]).optional(),
  hearts: z.union([z.boolean(),z.lazy(() => PostHeartFindManyArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  room: z.union([z.boolean(),z.lazy(() => RoomArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => PostCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const PostFindUniqueArgsSchema: z.ZodType<Prisma.PostFindUniqueArgs> = z.object({
  select: PostSelectSchema.optional(),
  include: z.lazy(() => PostIncludeSchema).optional(),
  where: PostWhereUniqueInputSchema,
}).strict() ;

export default PostFindUniqueArgsSchema;
