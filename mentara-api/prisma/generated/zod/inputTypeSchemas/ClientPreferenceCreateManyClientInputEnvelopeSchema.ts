import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientPreferenceCreateManyClientInputSchema } from './ClientPreferenceCreateManyClientInputSchema';

export const ClientPreferenceCreateManyClientInputEnvelopeSchema: z.ZodType<Prisma.ClientPreferenceCreateManyClientInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ClientPreferenceCreateManyClientInputSchema),z.lazy(() => ClientPreferenceCreateManyClientInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ClientPreferenceCreateManyClientInputEnvelopeSchema;
