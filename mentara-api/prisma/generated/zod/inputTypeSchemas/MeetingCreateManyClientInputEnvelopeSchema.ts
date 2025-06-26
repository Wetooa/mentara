import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateManyClientInputSchema } from './MeetingCreateManyClientInputSchema';

export const MeetingCreateManyClientInputEnvelopeSchema: z.ZodType<Prisma.MeetingCreateManyClientInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MeetingCreateManyClientInputSchema),z.lazy(() => MeetingCreateManyClientInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MeetingCreateManyClientInputEnvelopeSchema;
