import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientMedicalHistoryWhereUniqueInputSchema } from './ClientMedicalHistoryWhereUniqueInputSchema';
import { ClientMedicalHistoryUpdateWithoutClientInputSchema } from './ClientMedicalHistoryUpdateWithoutClientInputSchema';
import { ClientMedicalHistoryUncheckedUpdateWithoutClientInputSchema } from './ClientMedicalHistoryUncheckedUpdateWithoutClientInputSchema';
import { ClientMedicalHistoryCreateWithoutClientInputSchema } from './ClientMedicalHistoryCreateWithoutClientInputSchema';
import { ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema } from './ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema';

export const ClientMedicalHistoryUpsertWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.ClientMedicalHistoryUpsertWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ClientMedicalHistoryUpdateWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryUncheckedUpdateWithoutClientInputSchema) ]),
  create: z.union([ z.lazy(() => ClientMedicalHistoryCreateWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default ClientMedicalHistoryUpsertWithWhereUniqueWithoutClientInputSchema;
