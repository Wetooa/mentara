import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';
import { ClientTherapistUpdateWithoutClientInputSchema } from './ClientTherapistUpdateWithoutClientInputSchema';
import { ClientTherapistUncheckedUpdateWithoutClientInputSchema } from './ClientTherapistUncheckedUpdateWithoutClientInputSchema';

export const ClientTherapistUpdateWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.ClientTherapistUpdateWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => ClientTherapistWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ClientTherapistUpdateWithoutClientInputSchema),z.lazy(() => ClientTherapistUncheckedUpdateWithoutClientInputSchema) ]),
}).strict();

export default ClientTherapistUpdateWithWhereUniqueWithoutClientInputSchema;
