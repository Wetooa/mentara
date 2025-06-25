import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { CommentHeartCountOrderByAggregateInputSchema } from './CommentHeartCountOrderByAggregateInputSchema';
import { CommentHeartMaxOrderByAggregateInputSchema } from './CommentHeartMaxOrderByAggregateInputSchema';
import { CommentHeartMinOrderByAggregateInputSchema } from './CommentHeartMinOrderByAggregateInputSchema';

export const CommentHeartOrderByWithAggregationInputSchema: z.ZodType<Prisma.CommentHeartOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  commentId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => CommentHeartCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CommentHeartMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CommentHeartMinOrderByAggregateInputSchema).optional()
}).strict();

export default CommentHeartOrderByWithAggregationInputSchema;
