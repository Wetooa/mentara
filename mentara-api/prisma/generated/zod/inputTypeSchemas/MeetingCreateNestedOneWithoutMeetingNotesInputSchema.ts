import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutMeetingNotesInputSchema } from './MeetingCreateWithoutMeetingNotesInputSchema';
import { MeetingUncheckedCreateWithoutMeetingNotesInputSchema } from './MeetingUncheckedCreateWithoutMeetingNotesInputSchema';
import { MeetingCreateOrConnectWithoutMeetingNotesInputSchema } from './MeetingCreateOrConnectWithoutMeetingNotesInputSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';

export const MeetingCreateNestedOneWithoutMeetingNotesInputSchema: z.ZodType<Prisma.MeetingCreateNestedOneWithoutMeetingNotesInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutMeetingNotesInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutMeetingNotesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MeetingCreateOrConnectWithoutMeetingNotesInputSchema).optional(),
  connect: z.lazy(() => MeetingWhereUniqueInputSchema).optional()
}).strict();

export default MeetingCreateNestedOneWithoutMeetingNotesInputSchema;
