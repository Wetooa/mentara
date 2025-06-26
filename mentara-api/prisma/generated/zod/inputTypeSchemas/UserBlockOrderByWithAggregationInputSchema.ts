import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserBlockCountOrderByAggregateInputSchema } from './UserBlockCountOrderByAggregateInputSchema';
import { UserBlockMaxOrderByAggregateInputSchema } from './UserBlockMaxOrderByAggregateInputSchema';
import { UserBlockMinOrderByAggregateInputSchema } from './UserBlockMinOrderByAggregateInputSchema';

export const UserBlockOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserBlockOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  blockerId: z.lazy(() => SortOrderSchema).optional(),
  blockedId: z.lazy(() => SortOrderSchema).optional(),
  reason: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserBlockCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserBlockMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserBlockMinOrderByAggregateInputSchema).optional()
}).strict();

export default UserBlockOrderByWithAggregationInputSchema;
