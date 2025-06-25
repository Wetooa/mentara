import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MeetingSumOrderByAggregateInputSchema: z.ZodType<Prisma.MeetingSumOrderByAggregateInput> = z.object({
  duration: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MeetingSumOrderByAggregateInputSchema;
