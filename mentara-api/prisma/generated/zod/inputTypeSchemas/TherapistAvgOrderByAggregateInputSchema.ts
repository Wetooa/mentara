import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TherapistAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TherapistAvgOrderByAggregateInput> = z.object({
  preferredSessionLength: z.lazy(() => SortOrderSchema).optional(),
  hourlyRate: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default TherapistAvgOrderByAggregateInputSchema;
