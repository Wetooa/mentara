import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const UserBlockMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserBlockMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  blockerId: z.lazy(() => SortOrderSchema).optional(),
  blockedId: z.lazy(() => SortOrderSchema).optional(),
  reason: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default UserBlockMinOrderByAggregateInputSchema;
