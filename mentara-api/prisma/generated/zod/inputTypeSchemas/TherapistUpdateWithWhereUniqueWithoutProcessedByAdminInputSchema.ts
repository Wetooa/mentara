import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateWithoutProcessedByAdminInputSchema } from './TherapistUpdateWithoutProcessedByAdminInputSchema';
import { TherapistUncheckedUpdateWithoutProcessedByAdminInputSchema } from './TherapistUncheckedUpdateWithoutProcessedByAdminInputSchema';

export const TherapistUpdateWithWhereUniqueWithoutProcessedByAdminInputSchema: z.ZodType<Prisma.TherapistUpdateWithWhereUniqueWithoutProcessedByAdminInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TherapistUpdateWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutProcessedByAdminInputSchema) ]),
}).strict();

export default TherapistUpdateWithWhereUniqueWithoutProcessedByAdminInputSchema;
