import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistAvailabilityWhereUniqueInputSchema } from './TherapistAvailabilityWhereUniqueInputSchema';
import { TherapistAvailabilityUpdateWithoutTherapistInputSchema } from './TherapistAvailabilityUpdateWithoutTherapistInputSchema';
import { TherapistAvailabilityUncheckedUpdateWithoutTherapistInputSchema } from './TherapistAvailabilityUncheckedUpdateWithoutTherapistInputSchema';
import { TherapistAvailabilityCreateWithoutTherapistInputSchema } from './TherapistAvailabilityCreateWithoutTherapistInputSchema';
import { TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema } from './TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema';

export const TherapistAvailabilityUpsertWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistAvailabilityUpsertWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TherapistAvailabilityUpdateWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityUncheckedUpdateWithoutTherapistInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistAvailabilityCreateWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default TherapistAvailabilityUpsertWithWhereUniqueWithoutTherapistInputSchema;
