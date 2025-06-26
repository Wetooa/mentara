import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageTypeSchema } from './MessageTypeSchema';
import { ConversationCreateNestedOneWithoutMessagesInputSchema } from './ConversationCreateNestedOneWithoutMessagesInputSchema';
import { UserCreateNestedOneWithoutSentMessagesInputSchema } from './UserCreateNestedOneWithoutSentMessagesInputSchema';
import { MessageCreateNestedManyWithoutReplyToInputSchema } from './MessageCreateNestedManyWithoutReplyToInputSchema';
import { MessageReadReceiptCreateNestedManyWithoutMessageInputSchema } from './MessageReadReceiptCreateNestedManyWithoutMessageInputSchema';
import { MessageReactionCreateNestedManyWithoutMessageInputSchema } from './MessageReactionCreateNestedManyWithoutMessageInputSchema';

export const MessageCreateWithoutReplyToInputSchema: z.ZodType<Prisma.MessageCreateWithoutReplyToInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  messageType: z.lazy(() => MessageTypeSchema).optional(),
  attachmentUrl: z.string().optional().nullable(),
  attachmentName: z.string().optional().nullable(),
  attachmentSize: z.number().int().optional().nullable(),
  isEdited: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  editedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  conversation: z.lazy(() => ConversationCreateNestedOneWithoutMessagesInputSchema),
  sender: z.lazy(() => UserCreateNestedOneWithoutSentMessagesInputSchema),
  replies: z.lazy(() => MessageCreateNestedManyWithoutReplyToInputSchema).optional(),
  readReceipts: z.lazy(() => MessageReadReceiptCreateNestedManyWithoutMessageInputSchema).optional(),
  reactions: z.lazy(() => MessageReactionCreateNestedManyWithoutMessageInputSchema).optional()
}).strict();

export default MessageCreateWithoutReplyToInputSchema;
