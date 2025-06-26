import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TherapistAvailabilitySumOrderByAggregateInputSchema: z.ZodType<Prisma.TherapistAvailabilitySumOrderByAggregateInput> = z.object({
  dayOfWeek: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default TherapistAvailabilitySumOrderByAggregateInputSchema;
