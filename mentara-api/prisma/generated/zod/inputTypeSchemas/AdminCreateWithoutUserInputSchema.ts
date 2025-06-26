import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminCreatepermissionsInputSchema } from './AdminCreatepermissionsInputSchema';
import { TherapistCreateNestedManyWithoutProcessedByAdminInputSchema } from './TherapistCreateNestedManyWithoutProcessedByAdminInputSchema';

export const AdminCreateWithoutUserInputSchema: z.ZodType<Prisma.AdminCreateWithoutUserInput> = z.object({
  permissions: z.union([ z.lazy(() => AdminCreatepermissionsInputSchema),z.string().array() ]).optional(),
  adminLevel: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  processedTherapists: z.lazy(() => TherapistCreateNestedManyWithoutProcessedByAdminInputSchema).optional()
}).strict();

export default AdminCreateWithoutUserInputSchema;
