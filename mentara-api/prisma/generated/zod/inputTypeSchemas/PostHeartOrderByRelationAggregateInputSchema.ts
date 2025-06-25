import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const PostHeartOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PostHeartOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default PostHeartOrderByRelationAggregateInputSchema;
