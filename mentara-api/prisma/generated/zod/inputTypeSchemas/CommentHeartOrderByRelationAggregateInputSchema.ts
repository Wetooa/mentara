import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CommentHeartOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CommentHeartOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default CommentHeartOrderByRelationAggregateInputSchema;
