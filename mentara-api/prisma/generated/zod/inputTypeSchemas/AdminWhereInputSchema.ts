import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { TherapistListRelationFilterSchema } from './TherapistListRelationFilterSchema';

export const AdminWhereInputSchema: z.ZodType<Prisma.AdminWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AdminWhereInputSchema),z.lazy(() => AdminWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AdminWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AdminWhereInputSchema),z.lazy(() => AdminWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  permissions: z.lazy(() => StringNullableListFilterSchema).optional(),
  adminLevel: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  processedTherapists: z.lazy(() => TherapistListRelationFilterSchema).optional()
}).strict();

export default AdminWhereInputSchema;
