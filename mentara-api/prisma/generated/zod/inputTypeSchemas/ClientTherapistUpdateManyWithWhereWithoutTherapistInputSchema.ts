import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistScalarWhereInputSchema } from './ClientTherapistScalarWhereInputSchema';
import { ClientTherapistUpdateManyMutationInputSchema } from './ClientTherapistUpdateManyMutationInputSchema';
import { ClientTherapistUncheckedUpdateManyWithoutTherapistInputSchema } from './ClientTherapistUncheckedUpdateManyWithoutTherapistInputSchema';

export const ClientTherapistUpdateManyWithWhereWithoutTherapistInputSchema: z.ZodType<Prisma.ClientTherapistUpdateManyWithWhereWithoutTherapistInput> = z.object({
  where: z.lazy(() => ClientTherapistScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ClientTherapistUpdateManyMutationInputSchema),z.lazy(() => ClientTherapistUncheckedUpdateManyWithoutTherapistInputSchema) ]),
}).strict();

export default ClientTherapistUpdateManyWithWhereWithoutTherapistInputSchema;
