import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminUpdatepermissionsInputSchema } from './AdminUpdatepermissionsInputSchema';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';

export const AdminUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.AdminUncheckedUpdateWithoutUserInput> =
  z
    .object({
      permissions: z
        .union([
          z.lazy(() => AdminUpdatepermissionsInputSchema),
          z.string().array(),
        ])
        .optional(),
      adminLevel: z
        .union([
          z.string(),
          z.lazy(() => StringFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      createdAt: z
        .union([
          z.coerce.date(),
          z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      updatedAt: z
        .union([
          z.coerce.date(),
          z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default AdminUncheckedUpdateWithoutUserInputSchema;
