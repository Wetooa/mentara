import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingNotesWhereUniqueInputSchema } from './MeetingNotesWhereUniqueInputSchema';
import { MeetingNotesUpdateWithoutMeetingInputSchema } from './MeetingNotesUpdateWithoutMeetingInputSchema';
import { MeetingNotesUncheckedUpdateWithoutMeetingInputSchema } from './MeetingNotesUncheckedUpdateWithoutMeetingInputSchema';
import { MeetingNotesCreateWithoutMeetingInputSchema } from './MeetingNotesCreateWithoutMeetingInputSchema';
import { MeetingNotesUncheckedCreateWithoutMeetingInputSchema } from './MeetingNotesUncheckedCreateWithoutMeetingInputSchema';

export const MeetingNotesUpsertWithWhereUniqueWithoutMeetingInputSchema: z.ZodType<Prisma.MeetingNotesUpsertWithWhereUniqueWithoutMeetingInput> = z.object({
  where: z.lazy(() => MeetingNotesWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MeetingNotesUpdateWithoutMeetingInputSchema),z.lazy(() => MeetingNotesUncheckedUpdateWithoutMeetingInputSchema) ]),
  create: z.union([ z.lazy(() => MeetingNotesCreateWithoutMeetingInputSchema),z.lazy(() => MeetingNotesUncheckedCreateWithoutMeetingInputSchema) ]),
}).strict();

export default MeetingNotesUpsertWithWhereUniqueWithoutMeetingInputSchema;
