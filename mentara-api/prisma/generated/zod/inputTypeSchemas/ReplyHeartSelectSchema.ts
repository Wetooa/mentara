import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyArgsSchema } from "../outputTypeSchemas/ReplyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const ReplyHeartSelectSchema: z.ZodType<Prisma.ReplyHeartSelect> = z.object({
  id: z.boolean().optional(),
  replyId: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  reply: z.union([z.boolean(),z.lazy(() => ReplyArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default ReplyHeartSelectSchema;
