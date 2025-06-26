import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MeetingDurationAvgOrderByAggregateInputSchema: z.ZodType<Prisma.MeetingDurationAvgOrderByAggregateInput> = z.object({
  duration: z.lazy(() => SortOrderSchema).optional(),
  sortOrder: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MeetingDurationAvgOrderByAggregateInputSchema;
