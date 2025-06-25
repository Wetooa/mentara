import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutAssignedClientsInputSchema } from './TherapistCreateWithoutAssignedClientsInputSchema';
import { TherapistUncheckedCreateWithoutAssignedClientsInputSchema } from './TherapistUncheckedCreateWithoutAssignedClientsInputSchema';
import { TherapistCreateOrConnectWithoutAssignedClientsInputSchema } from './TherapistCreateOrConnectWithoutAssignedClientsInputSchema';
import { TherapistUpsertWithoutAssignedClientsInputSchema } from './TherapistUpsertWithoutAssignedClientsInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateToOneWithWhereWithoutAssignedClientsInputSchema } from './TherapistUpdateToOneWithWhereWithoutAssignedClientsInputSchema';
import { TherapistUpdateWithoutAssignedClientsInputSchema } from './TherapistUpdateWithoutAssignedClientsInputSchema';
import { TherapistUncheckedUpdateWithoutAssignedClientsInputSchema } from './TherapistUncheckedUpdateWithoutAssignedClientsInputSchema';

export const TherapistUpdateOneRequiredWithoutAssignedClientsNestedInputSchema: z.ZodType<Prisma.TherapistUpdateOneRequiredWithoutAssignedClientsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutAssignedClientsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutAssignedClientsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutAssignedClientsInputSchema).optional(),
  upsert: z.lazy(() => TherapistUpsertWithoutAssignedClientsInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TherapistUpdateToOneWithWhereWithoutAssignedClientsInputSchema),z.lazy(() => TherapistUpdateWithoutAssignedClientsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutAssignedClientsInputSchema) ]).optional(),
}).strict();

export default TherapistUpdateOneRequiredWithoutAssignedClientsNestedInputSchema;
