import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingNotesWhereUniqueInputSchema } from './MeetingNotesWhereUniqueInputSchema';
import { MeetingNotesCreateWithoutMeetingInputSchema } from './MeetingNotesCreateWithoutMeetingInputSchema';
import { MeetingNotesUncheckedCreateWithoutMeetingInputSchema } from './MeetingNotesUncheckedCreateWithoutMeetingInputSchema';

export const MeetingNotesCreateOrConnectWithoutMeetingInputSchema: z.ZodType<Prisma.MeetingNotesCreateOrConnectWithoutMeetingInput> = z.object({
  where: z.lazy(() => MeetingNotesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MeetingNotesCreateWithoutMeetingInputSchema),z.lazy(() => MeetingNotesUncheckedCreateWithoutMeetingInputSchema) ]),
}).strict();

export default MeetingNotesCreateOrConnectWithoutMeetingInputSchema;
