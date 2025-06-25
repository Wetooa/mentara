import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ReplyFileCountOrderByAggregateInputSchema } from './ReplyFileCountOrderByAggregateInputSchema';
import { ReplyFileMaxOrderByAggregateInputSchema } from './ReplyFileMaxOrderByAggregateInputSchema';
import { ReplyFileMinOrderByAggregateInputSchema } from './ReplyFileMinOrderByAggregateInputSchema';

export const ReplyFileOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReplyFileOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  replyId: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ReplyFileCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReplyFileMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReplyFileMinOrderByAggregateInputSchema).optional()
}).strict();

export default ReplyFileOrderByWithAggregationInputSchema;
