import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { AdminCountOrderByAggregateInputSchema } from './AdminCountOrderByAggregateInputSchema';
import { AdminMaxOrderByAggregateInputSchema } from './AdminMaxOrderByAggregateInputSchema';
import { AdminMinOrderByAggregateInputSchema } from './AdminMinOrderByAggregateInputSchema';

export const AdminOrderByWithAggregationInputSchema: z.ZodType<Prisma.AdminOrderByWithAggregationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  permissions: z.lazy(() => SortOrderSchema).optional(),
  adminLevel: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AdminCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AdminMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AdminMinOrderByAggregateInputSchema).optional()
}).strict();

export default AdminOrderByWithAggregationInputSchema;
