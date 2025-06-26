import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistAvailabilityScalarWhereInputSchema } from './TherapistAvailabilityScalarWhereInputSchema';
import { TherapistAvailabilityUpdateManyMutationInputSchema } from './TherapistAvailabilityUpdateManyMutationInputSchema';
import { TherapistAvailabilityUncheckedUpdateManyWithoutTherapistInputSchema } from './TherapistAvailabilityUncheckedUpdateManyWithoutTherapistInputSchema';

export const TherapistAvailabilityUpdateManyWithWhereWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistAvailabilityUpdateManyWithWhereWithoutTherapistInput> = z.object({
  where: z.lazy(() => TherapistAvailabilityScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TherapistAvailabilityUpdateManyMutationInputSchema),z.lazy(() => TherapistAvailabilityUncheckedUpdateManyWithoutTherapistInputSchema) ]),
}).strict();

export default TherapistAvailabilityUpdateManyWithWhereWithoutTherapistInputSchema;
