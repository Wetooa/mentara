import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingDurationWhereUniqueInputSchema } from './MeetingDurationWhereUniqueInputSchema';
import { MeetingDurationCreateWithoutMeetingsInputSchema } from './MeetingDurationCreateWithoutMeetingsInputSchema';
import { MeetingDurationUncheckedCreateWithoutMeetingsInputSchema } from './MeetingDurationUncheckedCreateWithoutMeetingsInputSchema';

export const MeetingDurationCreateOrConnectWithoutMeetingsInputSchema: z.ZodType<Prisma.MeetingDurationCreateOrConnectWithoutMeetingsInput> = z.object({
  where: z.lazy(() => MeetingDurationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MeetingDurationCreateWithoutMeetingsInputSchema),z.lazy(() => MeetingDurationUncheckedCreateWithoutMeetingsInputSchema) ]),
}).strict();

export default MeetingDurationCreateOrConnectWithoutMeetingsInputSchema;
