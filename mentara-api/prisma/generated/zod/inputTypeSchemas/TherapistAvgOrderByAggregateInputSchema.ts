import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TherapistAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TherapistAvgOrderByAggregateInput> = z.object({
  hourlyRate: z.lazy(() => SortOrderSchema).optional(),
  patientSatisfaction: z.lazy(() => SortOrderSchema).optional(),
  totalPatients: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default TherapistAvgOrderByAggregateInputSchema;
