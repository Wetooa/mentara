import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ModeratorCommunityMinOrderByAggregateInputSchema: z.ZodType<Prisma.ModeratorCommunityMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  moderatorId: z.lazy(() => SortOrderSchema).optional(),
  communityId: z.lazy(() => SortOrderSchema).optional(),
  assignedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ModeratorCommunityMinOrderByAggregateInputSchema;
