import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { ModeratorCommunityOrderByRelationAggregateInputSchema } from './ModeratorCommunityOrderByRelationAggregateInputSchema';

export const ModeratorOrderByWithRelationInputSchema: z.ZodType<Prisma.ModeratorOrderByWithRelationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  permissions: z.lazy(() => SortOrderSchema).optional(),
  assignedCommunities: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityOrderByRelationAggregateInputSchema).optional()
}).strict();

export default ModeratorOrderByWithRelationInputSchema;
