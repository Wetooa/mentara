import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminCreatepermissionsInputSchema } from './AdminCreatepermissionsInputSchema';
import { UserCreateNestedOneWithoutAdminInputSchema } from './UserCreateNestedOneWithoutAdminInputSchema';

export const AdminCreateWithoutProcessedTherapistsInputSchema: z.ZodType<Prisma.AdminCreateWithoutProcessedTherapistsInput> = z.object({
  permissions: z.union([ z.lazy(() => AdminCreatepermissionsInputSchema),z.string().array() ]).optional(),
  adminLevel: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutAdminInputSchema)
}).strict();

export default AdminCreateWithoutProcessedTherapistsInputSchema;
