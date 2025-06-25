import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileFindManyArgsSchema } from "../outputTypeSchemas/PostFileFindManyArgsSchema"
import { CommentFindManyArgsSchema } from "../outputTypeSchemas/CommentFindManyArgsSchema"
import { PostHeartFindManyArgsSchema } from "../outputTypeSchemas/PostHeartFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { RoomArgsSchema } from "../outputTypeSchemas/RoomArgsSchema"
import { PostCountOutputTypeArgsSchema } from "../outputTypeSchemas/PostCountOutputTypeArgsSchema"

export const PostIncludeSchema: z.ZodType<Prisma.PostInclude> = z.object({
  files: z.union([z.boolean(),z.lazy(() => PostFileFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => CommentFindManyArgsSchema)]).optional(),
  hearts: z.union([z.boolean(),z.lazy(() => PostHeartFindManyArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  room: z.union([z.boolean(),z.lazy(() => RoomArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => PostCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default PostIncludeSchema;
