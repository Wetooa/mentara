import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ClientTherapistAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ClientTherapistAvgOrderByAggregateInput> = z.object({
  score: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ClientTherapistAvgOrderByAggregateInputSchema;
