import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MeetingAvgOrderByAggregateInputSchema: z.ZodType<Prisma.MeetingAvgOrderByAggregateInput> = z.object({
  duration: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MeetingAvgOrderByAggregateInputSchema;
