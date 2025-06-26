import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistCreateManyClientInputSchema } from './ClientTherapistCreateManyClientInputSchema';

export const ClientTherapistCreateManyClientInputEnvelopeSchema: z.ZodType<Prisma.ClientTherapistCreateManyClientInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ClientTherapistCreateManyClientInputSchema),z.lazy(() => ClientTherapistCreateManyClientInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ClientTherapistCreateManyClientInputEnvelopeSchema;
