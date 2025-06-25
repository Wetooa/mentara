import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ClientPreferenceOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ClientPreferenceOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ClientPreferenceOrderByRelationAggregateInputSchema;
