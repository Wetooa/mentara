import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ConversationOrderByWithRelationInputSchema } from './ConversationOrderByWithRelationInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { MessageOrderByRelationAggregateInputSchema } from './MessageOrderByRelationAggregateInputSchema';
import { MessageReadReceiptOrderByRelationAggregateInputSchema } from './MessageReadReceiptOrderByRelationAggregateInputSchema';
import { MessageReactionOrderByRelationAggregateInputSchema } from './MessageReactionOrderByRelationAggregateInputSchema';

export const MessageOrderByWithRelationInputSchema: z.ZodType<Prisma.MessageOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  conversationId: z.lazy(() => SortOrderSchema).optional(),
  senderId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  messageType: z.lazy(() => SortOrderSchema).optional(),
  attachmentUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  attachmentName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  attachmentSize: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  replyToId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isEdited: z.lazy(() => SortOrderSchema).optional(),
  isDeleted: z.lazy(() => SortOrderSchema).optional(),
  editedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  conversation: z.lazy(() => ConversationOrderByWithRelationInputSchema).optional(),
  sender: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  replyTo: z.lazy(() => MessageOrderByWithRelationInputSchema).optional(),
  replies: z.lazy(() => MessageOrderByRelationAggregateInputSchema).optional(),
  readReceipts: z.lazy(() => MessageReadReceiptOrderByRelationAggregateInputSchema).optional(),
  reactions: z.lazy(() => MessageReactionOrderByRelationAggregateInputSchema).optional()
}).strict();

export default MessageOrderByWithRelationInputSchema;
