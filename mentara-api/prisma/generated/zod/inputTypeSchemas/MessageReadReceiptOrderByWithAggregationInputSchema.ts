import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { MessageReadReceiptCountOrderByAggregateInputSchema } from './MessageReadReceiptCountOrderByAggregateInputSchema';
import { MessageReadReceiptMaxOrderByAggregateInputSchema } from './MessageReadReceiptMaxOrderByAggregateInputSchema';
import { MessageReadReceiptMinOrderByAggregateInputSchema } from './MessageReadReceiptMinOrderByAggregateInputSchema';

export const MessageReadReceiptOrderByWithAggregationInputSchema: z.ZodType<Prisma.MessageReadReceiptOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  messageId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  readAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => MessageReadReceiptCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => MessageReadReceiptMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => MessageReadReceiptMinOrderByAggregateInputSchema).optional()
}).strict();

export default MessageReadReceiptOrderByWithAggregationInputSchema;
