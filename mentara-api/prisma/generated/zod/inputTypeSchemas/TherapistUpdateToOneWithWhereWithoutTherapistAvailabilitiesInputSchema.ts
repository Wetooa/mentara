import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { TherapistUpdateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUpdateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistUncheckedUpdateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUncheckedUpdateWithoutTherapistAvailabilitiesInputSchema';

export const TherapistUpdateToOneWithWhereWithoutTherapistAvailabilitiesInputSchema: z.ZodType<Prisma.TherapistUpdateToOneWithWhereWithoutTherapistAvailabilitiesInput> = z.object({
  where: z.lazy(() => TherapistWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TherapistUpdateWithoutTherapistAvailabilitiesInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutTherapistAvailabilitiesInputSchema) ]),
}).strict();

export default TherapistUpdateToOneWithWhereWithoutTherapistAvailabilitiesInputSchema;
