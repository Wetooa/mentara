import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateManyProcessedByAdminInputSchema } from './TherapistCreateManyProcessedByAdminInputSchema';

export const TherapistCreateManyProcessedByAdminInputEnvelopeSchema: z.ZodType<Prisma.TherapistCreateManyProcessedByAdminInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TherapistCreateManyProcessedByAdminInputSchema),z.lazy(() => TherapistCreateManyProcessedByAdminInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default TherapistCreateManyProcessedByAdminInputEnvelopeSchema;
