import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationArgsSchema } from "../outputTypeSchemas/ConversationArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { MessageArgsSchema } from "../outputTypeSchemas/MessageArgsSchema"
import { MessageFindManyArgsSchema } from "../outputTypeSchemas/MessageFindManyArgsSchema"
import { MessageReadReceiptFindManyArgsSchema } from "../outputTypeSchemas/MessageReadReceiptFindManyArgsSchema"
import { MessageReactionFindManyArgsSchema } from "../outputTypeSchemas/MessageReactionFindManyArgsSchema"
import { MessageCountOutputTypeArgsSchema } from "../outputTypeSchemas/MessageCountOutputTypeArgsSchema"

export const MessageIncludeSchema: z.ZodType<Prisma.MessageInclude> = z.object({
  conversation: z.union([z.boolean(),z.lazy(() => ConversationArgsSchema)]).optional(),
  sender: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  replyTo: z.union([z.boolean(),z.lazy(() => MessageArgsSchema)]).optional(),
  replies: z.union([z.boolean(),z.lazy(() => MessageFindManyArgsSchema)]).optional(),
  readReceipts: z.union([z.boolean(),z.lazy(() => MessageReadReceiptFindManyArgsSchema)]).optional(),
  reactions: z.union([z.boolean(),z.lazy(() => MessageReactionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => MessageCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default MessageIncludeSchema;
