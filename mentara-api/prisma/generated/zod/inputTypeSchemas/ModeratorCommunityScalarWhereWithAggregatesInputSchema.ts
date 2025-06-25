import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const ModeratorCommunityScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ModeratorCommunityScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ModeratorCommunityScalarWhereWithAggregatesInputSchema),z.lazy(() => ModeratorCommunityScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ModeratorCommunityScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ModeratorCommunityScalarWhereWithAggregatesInputSchema),z.lazy(() => ModeratorCommunityScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  moderatorId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  communityId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default ModeratorCommunityScalarWhereWithAggregatesInputSchema;
