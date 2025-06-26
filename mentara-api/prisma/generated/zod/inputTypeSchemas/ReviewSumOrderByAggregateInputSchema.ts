import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ReviewSumOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewSumOrderByAggregateInput> = z.object({
  rating: z.lazy(() => SortOrderSchema).optional(),
  helpfulCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ReviewSumOrderByAggregateInputSchema;
