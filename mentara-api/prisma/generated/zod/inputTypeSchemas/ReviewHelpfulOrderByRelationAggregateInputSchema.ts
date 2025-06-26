import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ReviewHelpfulOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ReviewHelpfulOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ReviewHelpfulOrderByRelationAggregateInputSchema;
