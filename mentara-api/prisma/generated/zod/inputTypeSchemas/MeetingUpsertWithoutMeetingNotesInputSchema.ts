import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingUpdateWithoutMeetingNotesInputSchema } from './MeetingUpdateWithoutMeetingNotesInputSchema';
import { MeetingUncheckedUpdateWithoutMeetingNotesInputSchema } from './MeetingUncheckedUpdateWithoutMeetingNotesInputSchema';
import { MeetingCreateWithoutMeetingNotesInputSchema } from './MeetingCreateWithoutMeetingNotesInputSchema';
import { MeetingUncheckedCreateWithoutMeetingNotesInputSchema } from './MeetingUncheckedCreateWithoutMeetingNotesInputSchema';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';

export const MeetingUpsertWithoutMeetingNotesInputSchema: z.ZodType<Prisma.MeetingUpsertWithoutMeetingNotesInput> = z.object({
  update: z.union([ z.lazy(() => MeetingUpdateWithoutMeetingNotesInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutMeetingNotesInputSchema) ]),
  create: z.union([ z.lazy(() => MeetingCreateWithoutMeetingNotesInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutMeetingNotesInputSchema) ]),
  where: z.lazy(() => MeetingWhereInputSchema).optional()
}).strict();

export default MeetingUpsertWithoutMeetingNotesInputSchema;
