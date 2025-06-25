import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistAvailabilityWhereUniqueInputSchema } from './TherapistAvailabilityWhereUniqueInputSchema';
import { TherapistAvailabilityUpdateWithoutTherapistInputSchema } from './TherapistAvailabilityUpdateWithoutTherapistInputSchema';
import { TherapistAvailabilityUncheckedUpdateWithoutTherapistInputSchema } from './TherapistAvailabilityUncheckedUpdateWithoutTherapistInputSchema';

export const TherapistAvailabilityUpdateWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistAvailabilityUpdateWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TherapistAvailabilityUpdateWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityUncheckedUpdateWithoutTherapistInputSchema) ]),
}).strict();

export default TherapistAvailabilityUpdateWithWhereUniqueWithoutTherapistInputSchema;
