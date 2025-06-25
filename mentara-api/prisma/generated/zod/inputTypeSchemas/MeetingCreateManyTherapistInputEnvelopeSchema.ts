import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateManyTherapistInputSchema } from './MeetingCreateManyTherapistInputSchema';

export const MeetingCreateManyTherapistInputEnvelopeSchema: z.ZodType<Prisma.MeetingCreateManyTherapistInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MeetingCreateManyTherapistInputSchema),z.lazy(() => MeetingCreateManyTherapistInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MeetingCreateManyTherapistInputEnvelopeSchema;
