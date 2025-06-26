import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientMedicalHistoryCreateManyClientInputSchema } from './ClientMedicalHistoryCreateManyClientInputSchema';

export const ClientMedicalHistoryCreateManyClientInputEnvelopeSchema: z.ZodType<Prisma.ClientMedicalHistoryCreateManyClientInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ClientMedicalHistoryCreateManyClientInputSchema),z.lazy(() => ClientMedicalHistoryCreateManyClientInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ClientMedicalHistoryCreateManyClientInputEnvelopeSchema;
