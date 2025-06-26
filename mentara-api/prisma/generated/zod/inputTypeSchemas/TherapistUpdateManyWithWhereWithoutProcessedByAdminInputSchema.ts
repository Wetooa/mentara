import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistScalarWhereInputSchema } from './TherapistScalarWhereInputSchema';
import { TherapistUpdateManyMutationInputSchema } from './TherapistUpdateManyMutationInputSchema';
import { TherapistUncheckedUpdateManyWithoutProcessedByAdminInputSchema } from './TherapistUncheckedUpdateManyWithoutProcessedByAdminInputSchema';

export const TherapistUpdateManyWithWhereWithoutProcessedByAdminInputSchema: z.ZodType<Prisma.TherapistUpdateManyWithWhereWithoutProcessedByAdminInput> = z.object({
  where: z.lazy(() => TherapistScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TherapistUpdateManyMutationInputSchema),z.lazy(() => TherapistUncheckedUpdateManyWithoutProcessedByAdminInputSchema) ]),
}).strict();

export default TherapistUpdateManyWithWhereWithoutProcessedByAdminInputSchema;
