import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { JsonNullableWithAggregatesFilterSchema } from './JsonNullableWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const ModeratorScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ModeratorScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ModeratorScalarWhereWithAggregatesInputSchema),z.lazy(() => ModeratorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ModeratorScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ModeratorScalarWhereWithAggregatesInputSchema),z.lazy(() => ModeratorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  permissions: z.lazy(() => StringNullableListFilterSchema).optional(),
  assignedCommunities: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default ModeratorScalarWhereWithAggregatesInputSchema;
