import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TherapistAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TherapistAvgOrderByAggregateInput> = z.object({
<<<<<<< HEAD
  hourlyRate: z.lazy(() => SortOrderSchema).optional(),
  patientSatisfaction: z.lazy(() => SortOrderSchema).optional(),
  totalPatients: z.lazy(() => SortOrderSchema).optional()
=======
  preferredSessionLength: z.lazy(() => SortOrderSchema).optional(),
  hourlyRate: z.lazy(() => SortOrderSchema).optional()
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
}).strict();

export default TherapistAvgOrderByAggregateInputSchema;
