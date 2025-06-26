import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ReplyCountOrderByAggregateInputSchema } from './ReplyCountOrderByAggregateInputSchema';
import { ReplyMaxOrderByAggregateInputSchema } from './ReplyMaxOrderByAggregateInputSchema';
import { ReplyMinOrderByAggregateInputSchema } from './ReplyMinOrderByAggregateInputSchema';

export const ReplyOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReplyOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  commentId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ReplyCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReplyMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReplyMinOrderByAggregateInputSchema).optional()
}).strict();

export default ReplyOrderByWithAggregationInputSchema;
