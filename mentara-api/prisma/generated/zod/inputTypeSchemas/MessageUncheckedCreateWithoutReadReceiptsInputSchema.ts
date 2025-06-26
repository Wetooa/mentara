import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageTypeSchema } from './MessageTypeSchema';
import { MessageUncheckedCreateNestedManyWithoutReplyToInputSchema } from './MessageUncheckedCreateNestedManyWithoutReplyToInputSchema';
import { MessageReactionUncheckedCreateNestedManyWithoutMessageInputSchema } from './MessageReactionUncheckedCreateNestedManyWithoutMessageInputSchema';

export const MessageUncheckedCreateWithoutReadReceiptsInputSchema: z.ZodType<Prisma.MessageUncheckedCreateWithoutReadReceiptsInput> = z.object({
  id: z.string().uuid().optional(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  messageType: z.lazy(() => MessageTypeSchema).optional(),
  attachmentUrl: z.string().optional().nullable(),
  attachmentName: z.string().optional().nullable(),
  attachmentSize: z.number().int().optional().nullable(),
  replyToId: z.string().optional().nullable(),
  isEdited: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  editedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  replies: z.lazy(() => MessageUncheckedCreateNestedManyWithoutReplyToInputSchema).optional(),
  reactions: z.lazy(() => MessageReactionUncheckedCreateNestedManyWithoutMessageInputSchema).optional()
}).strict();

export default MessageUncheckedCreateWithoutReadReceiptsInputSchema;
