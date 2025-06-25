import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { TherapistUpdateWithoutAssignedClientsInputSchema } from './TherapistUpdateWithoutAssignedClientsInputSchema';
import { TherapistUncheckedUpdateWithoutAssignedClientsInputSchema } from './TherapistUncheckedUpdateWithoutAssignedClientsInputSchema';

export const TherapistUpdateToOneWithWhereWithoutAssignedClientsInputSchema: z.ZodType<Prisma.TherapistUpdateToOneWithWhereWithoutAssignedClientsInput> = z.object({
  where: z.lazy(() => TherapistWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TherapistUpdateWithoutAssignedClientsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutAssignedClientsInputSchema) ]),
}).strict();

export default TherapistUpdateToOneWithWhereWithoutAssignedClientsInputSchema;
