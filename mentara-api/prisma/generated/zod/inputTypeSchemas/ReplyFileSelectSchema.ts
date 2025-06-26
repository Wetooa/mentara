import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyArgsSchema } from "../outputTypeSchemas/ReplyArgsSchema"

export const ReplyFileSelectSchema: z.ZodType<Prisma.ReplyFileSelect> = z.object({
  id: z.boolean().optional(),
  replyId: z.boolean().optional(),
  url: z.boolean().optional(),
  type: z.boolean().optional(),
  reply: z.union([z.boolean(),z.lazy(() => ReplyArgsSchema)]).optional(),
}).strict()

export default ReplyFileSelectSchema;
