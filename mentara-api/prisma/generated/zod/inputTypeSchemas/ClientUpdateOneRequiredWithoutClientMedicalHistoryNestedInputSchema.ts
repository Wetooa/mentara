import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutClientMedicalHistoryInputSchema } from './ClientCreateWithoutClientMedicalHistoryInputSchema';
import { ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema } from './ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema';
import { ClientCreateOrConnectWithoutClientMedicalHistoryInputSchema } from './ClientCreateOrConnectWithoutClientMedicalHistoryInputSchema';
import { ClientUpsertWithoutClientMedicalHistoryInputSchema } from './ClientUpsertWithoutClientMedicalHistoryInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientUpdateToOneWithWhereWithoutClientMedicalHistoryInputSchema } from './ClientUpdateToOneWithWhereWithoutClientMedicalHistoryInputSchema';
import { ClientUpdateWithoutClientMedicalHistoryInputSchema } from './ClientUpdateWithoutClientMedicalHistoryInputSchema';
import { ClientUncheckedUpdateWithoutClientMedicalHistoryInputSchema } from './ClientUncheckedUpdateWithoutClientMedicalHistoryInputSchema';

export const ClientUpdateOneRequiredWithoutClientMedicalHistoryNestedInputSchema: z.ZodType<Prisma.ClientUpdateOneRequiredWithoutClientMedicalHistoryNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutClientMedicalHistoryInputSchema),z.lazy(() => ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutClientMedicalHistoryInputSchema).optional(),
  upsert: z.lazy(() => ClientUpsertWithoutClientMedicalHistoryInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ClientUpdateToOneWithWhereWithoutClientMedicalHistoryInputSchema),z.lazy(() => ClientUpdateWithoutClientMedicalHistoryInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutClientMedicalHistoryInputSchema) ]).optional(),
}).strict();

export default ClientUpdateOneRequiredWithoutClientMedicalHistoryNestedInputSchema;
