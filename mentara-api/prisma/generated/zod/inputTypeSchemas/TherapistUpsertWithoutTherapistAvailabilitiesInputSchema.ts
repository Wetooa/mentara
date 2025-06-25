import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistUpdateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUpdateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistUncheckedUpdateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUncheckedUpdateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistCreateWithoutTherapistAvailabilitiesInputSchema } from './TherapistCreateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistUpsertWithoutTherapistAvailabilitiesInputSchema: z.ZodType<Prisma.TherapistUpsertWithoutTherapistAvailabilitiesInput> = z.object({
  update: z.union([ z.lazy(() => TherapistUpdateWithoutTherapistAvailabilitiesInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutTherapistAvailabilitiesInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistCreateWithoutTherapistAvailabilitiesInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema) ]),
  where: z.lazy(() => TherapistWhereInputSchema).optional()
}).strict();

export default TherapistUpsertWithoutTherapistAvailabilitiesInputSchema;
