import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { AdminUpdatepermissionsInputSchema } from './AdminUpdatepermissionsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { TherapistUncheckedUpdateManyWithoutProcessedByAdminNestedInputSchema } from './TherapistUncheckedUpdateManyWithoutProcessedByAdminNestedInputSchema';

export const AdminUncheckedUpdateInputSchema: z.ZodType<Prisma.AdminUncheckedUpdateInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  permissions: z.union([ z.lazy(() => AdminUpdatepermissionsInputSchema),z.string().array() ]).optional(),
  adminLevel: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  processedTherapists: z.lazy(() => TherapistUncheckedUpdateManyWithoutProcessedByAdminNestedInputSchema).optional()
}).strict();

export default AdminUncheckedUpdateInputSchema;
