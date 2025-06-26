import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';
import { MeetingUpdateWithoutMeetingNotesInputSchema } from './MeetingUpdateWithoutMeetingNotesInputSchema';
import { MeetingUncheckedUpdateWithoutMeetingNotesInputSchema } from './MeetingUncheckedUpdateWithoutMeetingNotesInputSchema';

export const MeetingUpdateToOneWithWhereWithoutMeetingNotesInputSchema: z.ZodType<Prisma.MeetingUpdateToOneWithWhereWithoutMeetingNotesInput> = z.object({
  where: z.lazy(() => MeetingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => MeetingUpdateWithoutMeetingNotesInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutMeetingNotesInputSchema) ]),
}).strict();

export default MeetingUpdateToOneWithWhereWithoutMeetingNotesInputSchema;
