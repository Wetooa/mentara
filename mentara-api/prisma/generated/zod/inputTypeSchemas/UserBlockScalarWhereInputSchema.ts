import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const UserBlockScalarWhereInputSchema: z.ZodType<Prisma.UserBlockScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserBlockScalarWhereInputSchema),z.lazy(() => UserBlockScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserBlockScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserBlockScalarWhereInputSchema),z.lazy(() => UserBlockScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  blockerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  blockedId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reason: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default UserBlockScalarWhereInputSchema;
