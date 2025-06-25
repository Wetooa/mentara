import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientUpdateWithoutClientMedicalHistoryInputSchema } from './ClientUpdateWithoutClientMedicalHistoryInputSchema';
import { ClientUncheckedUpdateWithoutClientMedicalHistoryInputSchema } from './ClientUncheckedUpdateWithoutClientMedicalHistoryInputSchema';

export const ClientUpdateToOneWithWhereWithoutClientMedicalHistoryInputSchema: z.ZodType<Prisma.ClientUpdateToOneWithWhereWithoutClientMedicalHistoryInput> = z.object({
  where: z.lazy(() => ClientWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ClientUpdateWithoutClientMedicalHistoryInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutClientMedicalHistoryInputSchema) ]),
}).strict();

export default ClientUpdateToOneWithWhereWithoutClientMedicalHistoryInputSchema;
