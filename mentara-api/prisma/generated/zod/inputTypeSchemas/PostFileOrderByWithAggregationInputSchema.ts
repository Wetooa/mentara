import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { PostFileCountOrderByAggregateInputSchema } from './PostFileCountOrderByAggregateInputSchema';
import { PostFileMaxOrderByAggregateInputSchema } from './PostFileMaxOrderByAggregateInputSchema';
import { PostFileMinOrderByAggregateInputSchema } from './PostFileMinOrderByAggregateInputSchema';

export const PostFileOrderByWithAggregationInputSchema: z.ZodType<Prisma.PostFileOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  postId: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => PostFileCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PostFileMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PostFileMinOrderByAggregateInputSchema).optional()
}).strict();

export default PostFileOrderByWithAggregationInputSchema;
