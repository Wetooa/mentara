import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistFilesScalarWhereInputSchema } from './TherapistFilesScalarWhereInputSchema';
import { TherapistFilesUpdateManyMutationInputSchema } from './TherapistFilesUpdateManyMutationInputSchema';
import { TherapistFilesUncheckedUpdateManyWithoutTherapistInputSchema } from './TherapistFilesUncheckedUpdateManyWithoutTherapistInputSchema';

export const TherapistFilesUpdateManyWithWhereWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistFilesUpdateManyWithWhereWithoutTherapistInput> = z.object({
  where: z.lazy(() => TherapistFilesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TherapistFilesUpdateManyMutationInputSchema),z.lazy(() => TherapistFilesUncheckedUpdateManyWithoutTherapistInputSchema) ]),
}).strict();

export default TherapistFilesUpdateManyWithWhereWithoutTherapistInputSchema;
