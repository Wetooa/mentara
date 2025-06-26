import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { CommentFileCountOrderByAggregateInputSchema } from './CommentFileCountOrderByAggregateInputSchema';
import { CommentFileMaxOrderByAggregateInputSchema } from './CommentFileMaxOrderByAggregateInputSchema';
import { CommentFileMinOrderByAggregateInputSchema } from './CommentFileMinOrderByAggregateInputSchema';

export const CommentFileOrderByWithAggregationInputSchema: z.ZodType<Prisma.CommentFileOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  commentId: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => CommentFileCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CommentFileMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CommentFileMinOrderByAggregateInputSchema).optional()
}).strict();

export default CommentFileOrderByWithAggregationInputSchema;
