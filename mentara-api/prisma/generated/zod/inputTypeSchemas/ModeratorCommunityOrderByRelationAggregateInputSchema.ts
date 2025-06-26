import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ModeratorCommunityOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ModeratorCommunityOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ModeratorCommunityOrderByRelationAggregateInputSchema;
