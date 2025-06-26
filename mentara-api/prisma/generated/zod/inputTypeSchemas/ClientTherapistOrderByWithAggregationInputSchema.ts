import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ClientTherapistCountOrderByAggregateInputSchema } from './ClientTherapistCountOrderByAggregateInputSchema';
import { ClientTherapistAvgOrderByAggregateInputSchema } from './ClientTherapistAvgOrderByAggregateInputSchema';
import { ClientTherapistMaxOrderByAggregateInputSchema } from './ClientTherapistMaxOrderByAggregateInputSchema';
import { ClientTherapistMinOrderByAggregateInputSchema } from './ClientTherapistMinOrderByAggregateInputSchema';
import { ClientTherapistSumOrderByAggregateInputSchema } from './ClientTherapistSumOrderByAggregateInputSchema';

export const ClientTherapistOrderByWithAggregationInputSchema: z.ZodType<Prisma.ClientTherapistOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.lazy(() => SortOrderSchema).optional(),
  assignedAt: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  score: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ClientTherapistCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ClientTherapistAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ClientTherapistMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ClientTherapistMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ClientTherapistSumOrderByAggregateInputSchema).optional()
}).strict();

export default ClientTherapistOrderByWithAggregationInputSchema;
