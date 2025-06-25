import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientMedicalHistoryScalarWhereInputSchema } from './ClientMedicalHistoryScalarWhereInputSchema';
import { ClientMedicalHistoryUpdateManyMutationInputSchema } from './ClientMedicalHistoryUpdateManyMutationInputSchema';
import { ClientMedicalHistoryUncheckedUpdateManyWithoutClientInputSchema } from './ClientMedicalHistoryUncheckedUpdateManyWithoutClientInputSchema';

export const ClientMedicalHistoryUpdateManyWithWhereWithoutClientInputSchema: z.ZodType<Prisma.ClientMedicalHistoryUpdateManyWithWhereWithoutClientInput> = z.object({
  where: z.lazy(() => ClientMedicalHistoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ClientMedicalHistoryUpdateManyMutationInputSchema),z.lazy(() => ClientMedicalHistoryUncheckedUpdateManyWithoutClientInputSchema) ]),
}).strict();

export default ClientMedicalHistoryUpdateManyWithWhereWithoutClientInputSchema;
