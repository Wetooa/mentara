import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistFilesCreateManyTherapistInputSchema } from './TherapistFilesCreateManyTherapistInputSchema';

export const TherapistFilesCreateManyTherapistInputEnvelopeSchema: z.ZodType<Prisma.TherapistFilesCreateManyTherapistInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TherapistFilesCreateManyTherapistInputSchema),z.lazy(() => TherapistFilesCreateManyTherapistInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default TherapistFilesCreateManyTherapistInputEnvelopeSchema;
