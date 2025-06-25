import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientUpdateWithoutClientMedicalHistoryInputSchema } from './ClientUpdateWithoutClientMedicalHistoryInputSchema';
import { ClientUncheckedUpdateWithoutClientMedicalHistoryInputSchema } from './ClientUncheckedUpdateWithoutClientMedicalHistoryInputSchema';
import { ClientCreateWithoutClientMedicalHistoryInputSchema } from './ClientCreateWithoutClientMedicalHistoryInputSchema';
import { ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema } from './ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientUpsertWithoutClientMedicalHistoryInputSchema: z.ZodType<Prisma.ClientUpsertWithoutClientMedicalHistoryInput> = z.object({
  update: z.union([ z.lazy(() => ClientUpdateWithoutClientMedicalHistoryInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutClientMedicalHistoryInputSchema) ]),
  create: z.union([ z.lazy(() => ClientCreateWithoutClientMedicalHistoryInputSchema),z.lazy(() => ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema) ]),
  where: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientUpsertWithoutClientMedicalHistoryInputSchema;
