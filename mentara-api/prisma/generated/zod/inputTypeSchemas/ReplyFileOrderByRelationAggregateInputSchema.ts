import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ReplyFileOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ReplyFileOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ReplyFileOrderByRelationAggregateInputSchema;
