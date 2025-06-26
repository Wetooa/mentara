import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockBlockerIdBlockedIdCompoundUniqueInputSchema } from './UserBlockBlockerIdBlockedIdCompoundUniqueInputSchema';
import { UserBlockWhereInputSchema } from './UserBlockWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserBlockWhereUniqueInputSchema: z.ZodType<Prisma.UserBlockWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    blockerId_blockedId: z.lazy(() => UserBlockBlockerIdBlockedIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    blockerId_blockedId: z.lazy(() => UserBlockBlockerIdBlockedIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  blockerId_blockedId: z.lazy(() => UserBlockBlockerIdBlockedIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserBlockWhereInputSchema),z.lazy(() => UserBlockWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserBlockWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserBlockWhereInputSchema),z.lazy(() => UserBlockWhereInputSchema).array() ]).optional(),
  blockerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  blockedId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reason: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  blocker: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  blocked: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export default UserBlockWhereUniqueInputSchema;
