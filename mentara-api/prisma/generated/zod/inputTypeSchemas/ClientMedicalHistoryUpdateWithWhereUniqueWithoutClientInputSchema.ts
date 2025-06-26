import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientMedicalHistoryWhereUniqueInputSchema } from './ClientMedicalHistoryWhereUniqueInputSchema';
import { ClientMedicalHistoryUpdateWithoutClientInputSchema } from './ClientMedicalHistoryUpdateWithoutClientInputSchema';
import { ClientMedicalHistoryUncheckedUpdateWithoutClientInputSchema } from './ClientMedicalHistoryUncheckedUpdateWithoutClientInputSchema';

export const ClientMedicalHistoryUpdateWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.ClientMedicalHistoryUpdateWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ClientMedicalHistoryUpdateWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryUncheckedUpdateWithoutClientInputSchema) ]),
}).strict();

export default ClientMedicalHistoryUpdateWithWhereUniqueWithoutClientInputSchema;
