import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminUpdatepermissionsInputSchema } from './AdminUpdatepermissionsInputSchema';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutAdminNestedInputSchema } from './UserUpdateOneRequiredWithoutAdminNestedInputSchema';

export const AdminUpdateWithoutProcessedTherapistsInputSchema: z.ZodType<Prisma.AdminUpdateWithoutProcessedTherapistsInput> = z.object({
  permissions: z.union([ z.lazy(() => AdminUpdatepermissionsInputSchema),z.string().array() ]).optional(),
  adminLevel: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutAdminNestedInputSchema).optional()
}).strict();

export default AdminUpdateWithoutProcessedTherapistsInputSchema;
