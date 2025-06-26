import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingCreateWithoutMeetingNotesInputSchema } from './MeetingCreateWithoutMeetingNotesInputSchema';
import { MeetingUncheckedCreateWithoutMeetingNotesInputSchema } from './MeetingUncheckedCreateWithoutMeetingNotesInputSchema';

export const MeetingCreateOrConnectWithoutMeetingNotesInputSchema: z.ZodType<Prisma.MeetingCreateOrConnectWithoutMeetingNotesInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MeetingCreateWithoutMeetingNotesInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutMeetingNotesInputSchema) ]),
}).strict();

export default MeetingCreateOrConnectWithoutMeetingNotesInputSchema;
