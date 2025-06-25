import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistCreateWithoutAssignedClientsInputSchema } from './TherapistCreateWithoutAssignedClientsInputSchema';
import { TherapistUncheckedCreateWithoutAssignedClientsInputSchema } from './TherapistUncheckedCreateWithoutAssignedClientsInputSchema';

export const TherapistCreateOrConnectWithoutAssignedClientsInputSchema: z.ZodType<Prisma.TherapistCreateOrConnectWithoutAssignedClientsInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistCreateWithoutAssignedClientsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutAssignedClientsInputSchema) ]),
}).strict();

export default TherapistCreateOrConnectWithoutAssignedClientsInputSchema;
