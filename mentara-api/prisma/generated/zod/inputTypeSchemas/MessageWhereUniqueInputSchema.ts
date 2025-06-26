import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumMessageTypeFilterSchema } from './EnumMessageTypeFilterSchema';
import { MessageTypeSchema } from './MessageTypeSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ConversationScalarRelationFilterSchema } from './ConversationScalarRelationFilterSchema';
import { ConversationWhereInputSchema } from './ConversationWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { MessageNullableScalarRelationFilterSchema } from './MessageNullableScalarRelationFilterSchema';
import { MessageListRelationFilterSchema } from './MessageListRelationFilterSchema';
import { MessageReadReceiptListRelationFilterSchema } from './MessageReadReceiptListRelationFilterSchema';
import { MessageReactionListRelationFilterSchema } from './MessageReactionListRelationFilterSchema';

export const MessageWhereUniqueInputSchema: z.ZodType<Prisma.MessageWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => MessageWhereInputSchema),z.lazy(() => MessageWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageWhereInputSchema),z.lazy(() => MessageWhereInputSchema).array() ]).optional(),
  conversationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  senderId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  messageType: z.union([ z.lazy(() => EnumMessageTypeFilterSchema),z.lazy(() => MessageTypeSchema) ]).optional(),
  attachmentUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  attachmentName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  attachmentSize: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  replyToId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isEdited: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  isDeleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  editedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  conversation: z.union([ z.lazy(() => ConversationScalarRelationFilterSchema),z.lazy(() => ConversationWhereInputSchema) ]).optional(),
  sender: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  replyTo: z.union([ z.lazy(() => MessageNullableScalarRelationFilterSchema),z.lazy(() => MessageWhereInputSchema) ]).optional().nullable(),
  replies: z.lazy(() => MessageListRelationFilterSchema).optional(),
  readReceipts: z.lazy(() => MessageReadReceiptListRelationFilterSchema).optional(),
  reactions: z.lazy(() => MessageReactionListRelationFilterSchema).optional()
}).strict());

export default MessageWhereUniqueInputSchema;
