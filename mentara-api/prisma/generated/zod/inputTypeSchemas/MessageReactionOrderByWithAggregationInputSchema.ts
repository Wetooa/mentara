import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { MessageReactionCountOrderByAggregateInputSchema } from './MessageReactionCountOrderByAggregateInputSchema';
import { MessageReactionMaxOrderByAggregateInputSchema } from './MessageReactionMaxOrderByAggregateInputSchema';
import { MessageReactionMinOrderByAggregateInputSchema } from './MessageReactionMinOrderByAggregateInputSchema';

export const MessageReactionOrderByWithAggregationInputSchema: z.ZodType<Prisma.MessageReactionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  messageId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  emoji: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => MessageReactionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => MessageReactionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => MessageReactionMinOrderByAggregateInputSchema).optional()
}).strict();

export default MessageReactionOrderByWithAggregationInputSchema;
