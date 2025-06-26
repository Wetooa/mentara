import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TherapistAvailabilityAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TherapistAvailabilityAvgOrderByAggregateInput> = z.object({
  dayOfWeek: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default TherapistAvailabilityAvgOrderByAggregateInputSchema;
