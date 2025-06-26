import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingDurationUpdateWithoutMeetingsInputSchema } from './MeetingDurationUpdateWithoutMeetingsInputSchema';
import { MeetingDurationUncheckedUpdateWithoutMeetingsInputSchema } from './MeetingDurationUncheckedUpdateWithoutMeetingsInputSchema';
import { MeetingDurationCreateWithoutMeetingsInputSchema } from './MeetingDurationCreateWithoutMeetingsInputSchema';
import { MeetingDurationUncheckedCreateWithoutMeetingsInputSchema } from './MeetingDurationUncheckedCreateWithoutMeetingsInputSchema';
import { MeetingDurationWhereInputSchema } from './MeetingDurationWhereInputSchema';

export const MeetingDurationUpsertWithoutMeetingsInputSchema: z.ZodType<Prisma.MeetingDurationUpsertWithoutMeetingsInput> = z.object({
  update: z.union([ z.lazy(() => MeetingDurationUpdateWithoutMeetingsInputSchema),z.lazy(() => MeetingDurationUncheckedUpdateWithoutMeetingsInputSchema) ]),
  create: z.union([ z.lazy(() => MeetingDurationCreateWithoutMeetingsInputSchema),z.lazy(() => MeetingDurationUncheckedCreateWithoutMeetingsInputSchema) ]),
  where: z.lazy(() => MeetingDurationWhereInputSchema).optional()
}).strict();

export default MeetingDurationUpsertWithoutMeetingsInputSchema;
