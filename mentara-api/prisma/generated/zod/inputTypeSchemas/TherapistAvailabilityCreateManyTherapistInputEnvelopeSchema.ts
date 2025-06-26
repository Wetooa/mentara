import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistAvailabilityCreateManyTherapistInputSchema } from './TherapistAvailabilityCreateManyTherapistInputSchema';

export const TherapistAvailabilityCreateManyTherapistInputEnvelopeSchema: z.ZodType<Prisma.TherapistAvailabilityCreateManyTherapistInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TherapistAvailabilityCreateManyTherapistInputSchema),z.lazy(() => TherapistAvailabilityCreateManyTherapistInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default TherapistAvailabilityCreateManyTherapistInputEnvelopeSchema;
