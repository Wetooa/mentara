import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ClientTherapistOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ClientTherapistOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ClientTherapistOrderByRelationAggregateInputSchema;
