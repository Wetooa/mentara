import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';
import { ClientTherapistUpdateWithoutTherapistInputSchema } from './ClientTherapistUpdateWithoutTherapistInputSchema';
import { ClientTherapistUncheckedUpdateWithoutTherapistInputSchema } from './ClientTherapistUncheckedUpdateWithoutTherapistInputSchema';

export const ClientTherapistUpdateWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.ClientTherapistUpdateWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => ClientTherapistWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ClientTherapistUpdateWithoutTherapistInputSchema),z.lazy(() => ClientTherapistUncheckedUpdateWithoutTherapistInputSchema) ]),
}).strict();

export default ClientTherapistUpdateWithWhereUniqueWithoutTherapistInputSchema;
