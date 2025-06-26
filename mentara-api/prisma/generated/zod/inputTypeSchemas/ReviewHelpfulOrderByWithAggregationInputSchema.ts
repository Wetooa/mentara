import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ReviewHelpfulCountOrderByAggregateInputSchema } from './ReviewHelpfulCountOrderByAggregateInputSchema';
import { ReviewHelpfulMaxOrderByAggregateInputSchema } from './ReviewHelpfulMaxOrderByAggregateInputSchema';
import { ReviewHelpfulMinOrderByAggregateInputSchema } from './ReviewHelpfulMinOrderByAggregateInputSchema';

export const ReviewHelpfulOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReviewHelpfulOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  reviewId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ReviewHelpfulCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReviewHelpfulMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReviewHelpfulMinOrderByAggregateInputSchema).optional()
}).strict();

export default ReviewHelpfulOrderByWithAggregationInputSchema;
