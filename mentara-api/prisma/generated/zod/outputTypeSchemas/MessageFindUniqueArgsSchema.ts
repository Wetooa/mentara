import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageIncludeSchema } from '../inputTypeSchemas/MessageIncludeSchema'
import { MessageWhereUniqueInputSchema } from '../inputTypeSchemas/MessageWhereUniqueInputSchema'
import { ConversationArgsSchema } from "../outputTypeSchemas/ConversationArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { MessageArgsSchema } from "../outputTypeSchemas/MessageArgsSchema"
import { MessageFindManyArgsSchema } from "../outputTypeSchemas/MessageFindManyArgsSchema"
import { MessageReadReceiptFindManyArgsSchema } from "../outputTypeSchemas/MessageReadReceiptFindManyArgsSchema"
import { MessageReactionFindManyArgsSchema } from "../outputTypeSchemas/MessageReactionFindManyArgsSchema"
import { MessageCountOutputTypeArgsSchema } from "../outputTypeSchemas/MessageCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MessageSelectSchema: z.ZodType<Prisma.MessageSelect> = z.object({
  id: z.boolean().optional(),
  conversationId: z.boolean().optional(),
  senderId: z.boolean().optional(),
  content: z.boolean().optional(),
  messageType: z.boolean().optional(),
  attachmentUrl: z.boolean().optional(),
  attachmentName: z.boolean().optional(),
  attachmentSize: z.boolean().optional(),
  replyToId: z.boolean().optional(),
  isEdited: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  editedAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  conversation: z.union([z.boolean(),z.lazy(() => ConversationArgsSchema)]).optional(),
  sender: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  replyTo: z.union([z.boolean(),z.lazy(() => MessageArgsSchema)]).optional(),
  replies: z.union([z.boolean(),z.lazy(() => MessageFindManyArgsSchema)]).optional(),
  readReceipts: z.union([z.boolean(),z.lazy(() => MessageReadReceiptFindManyArgsSchema)]).optional(),
  reactions: z.union([z.boolean(),z.lazy(() => MessageReactionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => MessageCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const MessageFindUniqueArgsSchema: z.ZodType<Prisma.MessageFindUniqueArgs> = z.object({
  select: MessageSelectSchema.optional(),
  include: z.lazy(() => MessageIncludeSchema).optional(),
  where: MessageWhereUniqueInputSchema,
}).strict() ;

export default MessageFindUniqueArgsSchema;
