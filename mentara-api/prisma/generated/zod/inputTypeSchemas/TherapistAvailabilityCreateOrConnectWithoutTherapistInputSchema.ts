import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistAvailabilityWhereUniqueInputSchema } from './TherapistAvailabilityWhereUniqueInputSchema';
import { TherapistAvailabilityCreateWithoutTherapistInputSchema } from './TherapistAvailabilityCreateWithoutTherapistInputSchema';
import { TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema } from './TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema';

export const TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistAvailabilityCreateOrConnectWithoutTherapistInput> = z.object({
  where: z.lazy(() => TherapistAvailabilityWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistAvailabilityCreateWithoutTherapistInputSchema),z.lazy(() => TherapistAvailabilityUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default TherapistAvailabilityCreateOrConnectWithoutTherapistInputSchema;
