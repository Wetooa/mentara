import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ClientPreferenceCountOrderByAggregateInputSchema } from './ClientPreferenceCountOrderByAggregateInputSchema';
import { ClientPreferenceMaxOrderByAggregateInputSchema } from './ClientPreferenceMaxOrderByAggregateInputSchema';
import { ClientPreferenceMinOrderByAggregateInputSchema } from './ClientPreferenceMinOrderByAggregateInputSchema';

export const ClientPreferenceOrderByWithAggregationInputSchema: z.ZodType<Prisma.ClientPreferenceOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ClientPreferenceCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ClientPreferenceMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ClientPreferenceMinOrderByAggregateInputSchema).optional()
}).strict();

export default ClientPreferenceOrderByWithAggregationInputSchema;
