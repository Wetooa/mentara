import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminCreatepermissionsInputSchema } from './AdminCreatepermissionsInputSchema';
import { TherapistUncheckedCreateNestedManyWithoutProcessedByAdminInputSchema } from './TherapistUncheckedCreateNestedManyWithoutProcessedByAdminInputSchema';

export const AdminUncheckedCreateInputSchema: z.ZodType<Prisma.AdminUncheckedCreateInput> = z.object({
  userId: z.string(),
  permissions: z.union([ z.lazy(() => AdminCreatepermissionsInputSchema),z.string().array() ]).optional(),
  adminLevel: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  processedTherapists: z.lazy(() => TherapistUncheckedCreateNestedManyWithoutProcessedByAdminInputSchema).optional()
}).strict();

export default AdminUncheckedCreateInputSchema;
