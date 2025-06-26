import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TherapistSumOrderByAggregateInputSchema: z.ZodType<Prisma.TherapistSumOrderByAggregateInput> = z.object({
  hourlyRate: z.lazy(() => SortOrderSchema).optional(),
  patientSatisfaction: z.lazy(() => SortOrderSchema).optional(),
  totalPatients: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default TherapistSumOrderByAggregateInputSchema;
