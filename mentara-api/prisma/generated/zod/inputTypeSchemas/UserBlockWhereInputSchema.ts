import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserBlockWhereInputSchema: z.ZodType<Prisma.UserBlockWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserBlockWhereInputSchema),z.lazy(() => UserBlockWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserBlockWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserBlockWhereInputSchema),z.lazy(() => UserBlockWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  blockerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  blockedId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reason: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  blocker: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  blocked: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export default UserBlockWhereInputSchema;
