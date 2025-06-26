import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingNotesWhereUniqueInputSchema } from './MeetingNotesWhereUniqueInputSchema';
import { MeetingNotesUpdateWithoutMeetingInputSchema } from './MeetingNotesUpdateWithoutMeetingInputSchema';
import { MeetingNotesUncheckedUpdateWithoutMeetingInputSchema } from './MeetingNotesUncheckedUpdateWithoutMeetingInputSchema';

export const MeetingNotesUpdateWithWhereUniqueWithoutMeetingInputSchema: z.ZodType<Prisma.MeetingNotesUpdateWithWhereUniqueWithoutMeetingInput> = z.object({
  where: z.lazy(() => MeetingNotesWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MeetingNotesUpdateWithoutMeetingInputSchema),z.lazy(() => MeetingNotesUncheckedUpdateWithoutMeetingInputSchema) ]),
}).strict();

export default MeetingNotesUpdateWithWhereUniqueWithoutMeetingInputSchema;
