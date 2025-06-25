import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentArgsSchema } from "../outputTypeSchemas/CommentArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ReplyHeartFindManyArgsSchema } from "../outputTypeSchemas/ReplyHeartFindManyArgsSchema"
import { ReplyFileFindManyArgsSchema } from "../outputTypeSchemas/ReplyFileFindManyArgsSchema"
import { ReplyCountOutputTypeArgsSchema } from "../outputTypeSchemas/ReplyCountOutputTypeArgsSchema"

export const ReplyIncludeSchema: z.ZodType<Prisma.ReplyInclude> = z.object({
  comment: z.union([z.boolean(),z.lazy(() => CommentArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  hearts: z.union([z.boolean(),z.lazy(() => ReplyHeartFindManyArgsSchema)]).optional(),
  files: z.union([z.boolean(),z.lazy(() => ReplyFileFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ReplyCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default ReplyIncludeSchema;
