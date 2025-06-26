import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingNotesCreateManyMeetingInputSchema } from './MeetingNotesCreateManyMeetingInputSchema';

export const MeetingNotesCreateManyMeetingInputEnvelopeSchema: z.ZodType<Prisma.MeetingNotesCreateManyMeetingInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MeetingNotesCreateManyMeetingInputSchema),z.lazy(() => MeetingNotesCreateManyMeetingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MeetingNotesCreateManyMeetingInputEnvelopeSchema;
