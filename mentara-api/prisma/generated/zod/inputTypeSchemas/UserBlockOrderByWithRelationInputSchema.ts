import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';

export const UserBlockOrderByWithRelationInputSchema: z.ZodType<Prisma.UserBlockOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  blockerId: z.lazy(() => SortOrderSchema).optional(),
  blockedId: z.lazy(() => SortOrderSchema).optional(),
  reason: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  blocker: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  blocked: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export default UserBlockOrderByWithRelationInputSchema;
