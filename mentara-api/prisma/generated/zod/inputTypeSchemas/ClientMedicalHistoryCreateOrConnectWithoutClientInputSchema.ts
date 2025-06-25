import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientMedicalHistoryWhereUniqueInputSchema } from './ClientMedicalHistoryWhereUniqueInputSchema';
import { ClientMedicalHistoryCreateWithoutClientInputSchema } from './ClientMedicalHistoryCreateWithoutClientInputSchema';
import { ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema } from './ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema';

export const ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema: z.ZodType<Prisma.ClientMedicalHistoryCreateOrConnectWithoutClientInput> = z.object({
  where: z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientMedicalHistoryCreateWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema;
