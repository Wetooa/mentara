import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const UserBlockScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserBlockScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserBlockScalarWhereWithAggregatesInputSchema),z.lazy(() => UserBlockScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserBlockScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserBlockScalarWhereWithAggregatesInputSchema),z.lazy(() => UserBlockScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  blockerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  blockedId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  reason: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default UserBlockScalarWhereWithAggregatesInputSchema;
