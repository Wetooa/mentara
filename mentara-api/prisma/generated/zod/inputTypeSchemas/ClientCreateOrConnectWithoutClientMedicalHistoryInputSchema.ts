import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientCreateWithoutClientMedicalHistoryInputSchema } from './ClientCreateWithoutClientMedicalHistoryInputSchema';
import { ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema } from './ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema';

export const ClientCreateOrConnectWithoutClientMedicalHistoryInputSchema: z.ZodType<Prisma.ClientCreateOrConnectWithoutClientMedicalHistoryInput> = z.object({
  where: z.lazy(() => ClientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientCreateWithoutClientMedicalHistoryInputSchema),z.lazy(() => ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema) ]),
}).strict();

export default ClientCreateOrConnectWithoutClientMedicalHistoryInputSchema;
