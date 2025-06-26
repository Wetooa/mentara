import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MeetingDurationSumOrderByAggregateInputSchema: z.ZodType<Prisma.MeetingDurationSumOrderByAggregateInput> = z.object({
  duration: z.lazy(() => SortOrderSchema).optional(),
  sortOrder: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MeetingDurationSumOrderByAggregateInputSchema;
