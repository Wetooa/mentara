import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutAssignedClientsInputSchema } from './TherapistCreateWithoutAssignedClientsInputSchema';
import { TherapistUncheckedCreateWithoutAssignedClientsInputSchema } from './TherapistUncheckedCreateWithoutAssignedClientsInputSchema';
import { TherapistCreateOrConnectWithoutAssignedClientsInputSchema } from './TherapistCreateOrConnectWithoutAssignedClientsInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';

export const TherapistCreateNestedOneWithoutAssignedClientsInputSchema: z.ZodType<Prisma.TherapistCreateNestedOneWithoutAssignedClientsInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutAssignedClientsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutAssignedClientsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutAssignedClientsInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional()
}).strict();

export default TherapistCreateNestedOneWithoutAssignedClientsInputSchema;
