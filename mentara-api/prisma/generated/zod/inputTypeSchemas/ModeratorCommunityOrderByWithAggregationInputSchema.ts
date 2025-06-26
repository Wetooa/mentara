import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ModeratorCommunityCountOrderByAggregateInputSchema } from './ModeratorCommunityCountOrderByAggregateInputSchema';
import { ModeratorCommunityMaxOrderByAggregateInputSchema } from './ModeratorCommunityMaxOrderByAggregateInputSchema';
import { ModeratorCommunityMinOrderByAggregateInputSchema } from './ModeratorCommunityMinOrderByAggregateInputSchema';

export const ModeratorCommunityOrderByWithAggregationInputSchema: z.ZodType<Prisma.ModeratorCommunityOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  moderatorId: z.lazy(() => SortOrderSchema).optional(),
  communityId: z.lazy(() => SortOrderSchema).optional(),
  assignedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ModeratorCommunityCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ModeratorCommunityMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ModeratorCommunityMinOrderByAggregateInputSchema).optional()
}).strict();

export default ModeratorCommunityOrderByWithAggregationInputSchema;
