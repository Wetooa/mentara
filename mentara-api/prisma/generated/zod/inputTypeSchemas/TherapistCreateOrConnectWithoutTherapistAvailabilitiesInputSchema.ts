import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistCreateWithoutTherapistAvailabilitiesInputSchema } from './TherapistCreateWithoutTherapistAvailabilitiesInputSchema';
import { TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema } from './TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema';

export const TherapistCreateOrConnectWithoutTherapistAvailabilitiesInputSchema: z.ZodType<Prisma.TherapistCreateOrConnectWithoutTherapistAvailabilitiesInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistCreateWithoutTherapistAvailabilitiesInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutTherapistAvailabilitiesInputSchema) ]),
}).strict();

export default TherapistCreateOrConnectWithoutTherapistAvailabilitiesInputSchema;
