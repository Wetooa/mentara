import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistScalarWhereInputSchema } from './ClientTherapistScalarWhereInputSchema';
import { ClientTherapistUpdateManyMutationInputSchema } from './ClientTherapistUpdateManyMutationInputSchema';
import { ClientTherapistUncheckedUpdateManyWithoutClientInputSchema } from './ClientTherapistUncheckedUpdateManyWithoutClientInputSchema';

export const ClientTherapistUpdateManyWithWhereWithoutClientInputSchema: z.ZodType<Prisma.ClientTherapistUpdateManyWithWhereWithoutClientInput> = z.object({
  where: z.lazy(() => ClientTherapistScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ClientTherapistUpdateManyMutationInputSchema),z.lazy(() => ClientTherapistUncheckedUpdateManyWithoutClientInputSchema) ]),
}).strict();

export default ClientTherapistUpdateManyWithWhereWithoutClientInputSchema;
