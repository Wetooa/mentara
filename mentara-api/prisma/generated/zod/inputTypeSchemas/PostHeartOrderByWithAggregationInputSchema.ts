import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { PostHeartCountOrderByAggregateInputSchema } from './PostHeartCountOrderByAggregateInputSchema';
import { PostHeartMaxOrderByAggregateInputSchema } from './PostHeartMaxOrderByAggregateInputSchema';
import { PostHeartMinOrderByAggregateInputSchema } from './PostHeartMinOrderByAggregateInputSchema';

export const PostHeartOrderByWithAggregationInputSchema: z.ZodType<Prisma.PostHeartOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  postId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => PostHeartCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PostHeartMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PostHeartMinOrderByAggregateInputSchema).optional()
}).strict();

export default PostHeartOrderByWithAggregationInputSchema;
