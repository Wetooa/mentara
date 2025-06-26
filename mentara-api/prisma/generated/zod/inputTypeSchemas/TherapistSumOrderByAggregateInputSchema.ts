import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TherapistSumOrderByAggregateInputSchema: z.ZodType<Prisma.TherapistSumOrderByAggregateInput> = z.object({
  preferredSessionLength: z.lazy(() => SortOrderSchema).optional(),
  hourlyRate: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default TherapistSumOrderByAggregateInputSchema;
