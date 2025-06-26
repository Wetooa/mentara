import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostArgsSchema } from "../outputTypeSchemas/PostArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { CommentArgsSchema } from "../outputTypeSchemas/CommentArgsSchema"
import { CommentFindManyArgsSchema } from "../outputTypeSchemas/CommentFindManyArgsSchema"
import { CommentHeartFindManyArgsSchema } from "../outputTypeSchemas/CommentHeartFindManyArgsSchema"
import { CommentFileFindManyArgsSchema } from "../outputTypeSchemas/CommentFileFindManyArgsSchema"
import { ReplyFindManyArgsSchema } from "../outputTypeSchemas/ReplyFindManyArgsSchema"
import { CommentCountOutputTypeArgsSchema } from "../outputTypeSchemas/CommentCountOutputTypeArgsSchema"

export const CommentIncludeSchema: z.ZodType<Prisma.CommentInclude> = z.object({
  post: z.union([z.boolean(),z.lazy(() => PostArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  parent: z.union([z.boolean(),z.lazy(() => CommentArgsSchema)]).optional(),
  children: z.union([z.boolean(),z.lazy(() => CommentFindManyArgsSchema)]).optional(),
  hearts: z.union([z.boolean(),z.lazy(() => CommentHeartFindManyArgsSchema)]).optional(),
  files: z.union([z.boolean(),z.lazy(() => CommentFileFindManyArgsSchema)]).optional(),
  replies: z.union([z.boolean(),z.lazy(() => ReplyFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CommentCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default CommentIncludeSchema;
