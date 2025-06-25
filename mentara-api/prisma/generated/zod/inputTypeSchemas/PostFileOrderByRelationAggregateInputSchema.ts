import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const PostFileOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PostFileOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default PostFileOrderByRelationAggregateInputSchema;
