import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ClientMedicalHistoryCountOrderByAggregateInputSchema } from './ClientMedicalHistoryCountOrderByAggregateInputSchema';
import { ClientMedicalHistoryMaxOrderByAggregateInputSchema } from './ClientMedicalHistoryMaxOrderByAggregateInputSchema';
import { ClientMedicalHistoryMinOrderByAggregateInputSchema } from './ClientMedicalHistoryMinOrderByAggregateInputSchema';

export const ClientMedicalHistoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.ClientMedicalHistoryOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  condition: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ClientMedicalHistoryCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ClientMedicalHistoryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ClientMedicalHistoryMinOrderByAggregateInputSchema).optional()
}).strict();

export default ClientMedicalHistoryOrderByWithAggregationInputSchema;
