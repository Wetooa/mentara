import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ClientTherapistSumOrderByAggregateInputSchema: z.ZodType<Prisma.ClientTherapistSumOrderByAggregateInput> = z.object({
  score: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ClientTherapistSumOrderByAggregateInputSchema;
