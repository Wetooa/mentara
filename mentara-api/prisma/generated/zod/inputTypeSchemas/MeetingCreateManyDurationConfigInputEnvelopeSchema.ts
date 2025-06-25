import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateManyDurationConfigInputSchema } from './MeetingCreateManyDurationConfigInputSchema';

export const MeetingCreateManyDurationConfigInputEnvelopeSchema: z.ZodType<Prisma.MeetingCreateManyDurationConfigInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MeetingCreateManyDurationConfigInputSchema),z.lazy(() => MeetingCreateManyDurationConfigInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MeetingCreateManyDurationConfigInputEnvelopeSchema;
