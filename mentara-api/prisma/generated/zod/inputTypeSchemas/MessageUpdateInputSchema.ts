import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { MessageTypeSchema } from './MessageTypeSchema';
import { EnumMessageTypeFieldUpdateOperationsInputSchema } from './EnumMessageTypeFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableIntFieldUpdateOperationsInputSchema } from './NullableIntFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ConversationUpdateOneRequiredWithoutMessagesNestedInputSchema } from './ConversationUpdateOneRequiredWithoutMessagesNestedInputSchema';
import { UserUpdateOneRequiredWithoutSentMessagesNestedInputSchema } from './UserUpdateOneRequiredWithoutSentMessagesNestedInputSchema';
import { MessageUpdateOneWithoutRepliesNestedInputSchema } from './MessageUpdateOneWithoutRepliesNestedInputSchema';
import { MessageUpdateManyWithoutReplyToNestedInputSchema } from './MessageUpdateManyWithoutReplyToNestedInputSchema';
import { MessageReadReceiptUpdateManyWithoutMessageNestedInputSchema } from './MessageReadReceiptUpdateManyWithoutMessageNestedInputSchema';
import { MessageReactionUpdateManyWithoutMessageNestedInputSchema } from './MessageReactionUpdateManyWithoutMessageNestedInputSchema';

export const MessageUpdateInputSchema: z.ZodType<Prisma.MessageUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  messageType: z.union([ z.lazy(() => MessageTypeSchema),z.lazy(() => EnumMessageTypeFieldUpdateOperationsInputSchema) ]).optional(),
  attachmentUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  attachmentName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  attachmentSize: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isEdited: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  isDeleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  editedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  conversation: z.lazy(() => ConversationUpdateOneRequiredWithoutMessagesNestedInputSchema).optional(),
  sender: z.lazy(() => UserUpdateOneRequiredWithoutSentMessagesNestedInputSchema).optional(),
  replyTo: z.lazy(() => MessageUpdateOneWithoutRepliesNestedInputSchema).optional(),
  replies: z.lazy(() => MessageUpdateManyWithoutReplyToNestedInputSchema).optional(),
  readReceipts: z.lazy(() => MessageReadReceiptUpdateManyWithoutMessageNestedInputSchema).optional(),
  reactions: z.lazy(() => MessageReactionUpdateManyWithoutMessageNestedInputSchema).optional()
}).strict();

export default MessageUpdateInputSchema;
