import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageArgsSchema } from "../outputTypeSchemas/MessageArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const MessageReadReceiptIncludeSchema: z.ZodType<Prisma.MessageReadReceiptInclude> = z.object({
  message: z.union([z.boolean(),z.lazy(() => MessageArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default MessageReadReceiptIncludeSchema;
