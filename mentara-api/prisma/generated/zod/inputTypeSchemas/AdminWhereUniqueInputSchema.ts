import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminWhereInputSchema } from './AdminWhereInputSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { TherapistListRelationFilterSchema } from './TherapistListRelationFilterSchema';

export const AdminWhereUniqueInputSchema: z.ZodType<Prisma.AdminWhereUniqueInput> = z.object({
  userId: z.string()
})
.and(z.object({
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => AdminWhereInputSchema),z.lazy(() => AdminWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AdminWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AdminWhereInputSchema),z.lazy(() => AdminWhereInputSchema).array() ]).optional(),
  permissions: z.lazy(() => StringNullableListFilterSchema).optional(),
  adminLevel: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  processedTherapists: z.lazy(() => TherapistListRelationFilterSchema).optional()
}).strict());

export default AdminWhereUniqueInputSchema;
