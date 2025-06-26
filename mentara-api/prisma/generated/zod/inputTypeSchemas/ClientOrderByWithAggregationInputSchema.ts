import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ClientCountOrderByAggregateInputSchema } from './ClientCountOrderByAggregateInputSchema';
import { ClientMaxOrderByAggregateInputSchema } from './ClientMaxOrderByAggregateInputSchema';
import { ClientMinOrderByAggregateInputSchema } from './ClientMinOrderByAggregateInputSchema';

export const ClientOrderByWithAggregationInputSchema: z.ZodType<Prisma.ClientOrderByWithAggregationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  hasSeenTherapistRecommendations: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ClientCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ClientMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ClientMinOrderByAggregateInputSchema).optional()
}).strict();

export default ClientOrderByWithAggregationInputSchema;
