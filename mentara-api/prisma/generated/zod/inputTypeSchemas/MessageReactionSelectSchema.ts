import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageArgsSchema } from "../outputTypeSchemas/MessageArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const MessageReactionSelectSchema: z.ZodType<Prisma.MessageReactionSelect> = z.object({
  id: z.boolean().optional(),
  messageId: z.boolean().optional(),
  userId: z.boolean().optional(),
  emoji: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  message: z.union([z.boolean(),z.lazy(() => MessageArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default MessageReactionSelectSchema;
