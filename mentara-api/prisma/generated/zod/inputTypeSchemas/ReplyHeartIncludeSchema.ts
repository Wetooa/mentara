import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyArgsSchema } from "../outputTypeSchemas/ReplyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const ReplyHeartIncludeSchema: z.ZodType<Prisma.ReplyHeartInclude> = z.object({
  reply: z.union([z.boolean(),z.lazy(() => ReplyArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default ReplyHeartIncludeSchema;
