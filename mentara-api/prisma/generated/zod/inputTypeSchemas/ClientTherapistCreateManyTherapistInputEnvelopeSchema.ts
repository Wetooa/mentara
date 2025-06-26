import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistCreateManyTherapistInputSchema } from './ClientTherapistCreateManyTherapistInputSchema';

export const ClientTherapistCreateManyTherapistInputEnvelopeSchema: z.ZodType<Prisma.ClientTherapistCreateManyTherapistInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ClientTherapistCreateManyTherapistInputSchema),z.lazy(() => ClientTherapistCreateManyTherapistInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ClientTherapistCreateManyTherapistInputEnvelopeSchema;
