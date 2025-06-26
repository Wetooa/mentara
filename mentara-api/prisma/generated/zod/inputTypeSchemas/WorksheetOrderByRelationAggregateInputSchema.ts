import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorksheetOrderByRelationAggregateInputSchema: z.ZodType<Prisma.WorksheetOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorksheetOrderByRelationAggregateInputSchema;
