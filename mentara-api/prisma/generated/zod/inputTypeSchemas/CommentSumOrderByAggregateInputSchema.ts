import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CommentSumOrderByAggregateInputSchema: z.ZodType<Prisma.CommentSumOrderByAggregateInput> = z.object({
  heartCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default CommentSumOrderByAggregateInputSchema;
