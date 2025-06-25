import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyArgsSchema } from "../outputTypeSchemas/ReplyArgsSchema"

export const ReplyFileIncludeSchema: z.ZodType<Prisma.ReplyFileInclude> = z.object({
  reply: z.union([z.boolean(),z.lazy(() => ReplyArgsSchema)]).optional(),
}).strict()

export default ReplyFileIncludeSchema;
