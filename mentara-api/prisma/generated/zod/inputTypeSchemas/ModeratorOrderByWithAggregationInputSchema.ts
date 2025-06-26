import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ModeratorCountOrderByAggregateInputSchema } from './ModeratorCountOrderByAggregateInputSchema';
import { ModeratorMaxOrderByAggregateInputSchema } from './ModeratorMaxOrderByAggregateInputSchema';
import { ModeratorMinOrderByAggregateInputSchema } from './ModeratorMinOrderByAggregateInputSchema';

export const ModeratorOrderByWithAggregationInputSchema: z.ZodType<Prisma.ModeratorOrderByWithAggregationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  permissions: z.lazy(() => SortOrderSchema).optional(),
  assignedCommunities: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ModeratorCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ModeratorMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ModeratorMinOrderByAggregateInputSchema).optional()
}).strict();

export default ModeratorOrderByWithAggregationInputSchema;
