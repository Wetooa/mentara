import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistUpdateWithoutAssignedClientsInputSchema } from './TherapistUpdateWithoutAssignedClientsInputSchema';
import { TherapistUncheckedUpdateWithoutAssignedClientsInputSchema } from './TherapistUncheckedUpdateWithoutAssignedClientsInputSchema';
import { TherapistCreateWithoutAssignedClientsInputSchema } from './TherapistCreateWithoutAssignedClientsInputSchema';
import { TherapistUncheckedCreateWithoutAssignedClientsInputSchema } from './TherapistUncheckedCreateWithoutAssignedClientsInputSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistUpsertWithoutAssignedClientsInputSchema: z.ZodType<Prisma.TherapistUpsertWithoutAssignedClientsInput> = z.object({
  update: z.union([ z.lazy(() => TherapistUpdateWithoutAssignedClientsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutAssignedClientsInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistCreateWithoutAssignedClientsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutAssignedClientsInputSchema) ]),
  where: z.lazy(() => TherapistWhereInputSchema).optional()
}).strict();

export default TherapistUpsertWithoutAssignedClientsInputSchema;
