import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MeetingOrderByRelationAggregateInputSchema: z.ZodType<Prisma.MeetingOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MeetingOrderByRelationAggregateInputSchema;
