import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ReplyHeartCountOrderByAggregateInputSchema } from './ReplyHeartCountOrderByAggregateInputSchema';
import { ReplyHeartMaxOrderByAggregateInputSchema } from './ReplyHeartMaxOrderByAggregateInputSchema';
import { ReplyHeartMinOrderByAggregateInputSchema } from './ReplyHeartMinOrderByAggregateInputSchema';

export const ReplyHeartOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReplyHeartOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  replyId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ReplyHeartCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReplyHeartMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReplyHeartMinOrderByAggregateInputSchema).optional()
}).strict();

export default ReplyHeartOrderByWithAggregationInputSchema;
