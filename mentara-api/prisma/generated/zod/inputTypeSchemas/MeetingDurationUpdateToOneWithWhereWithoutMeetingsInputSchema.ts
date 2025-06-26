import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingDurationWhereInputSchema } from './MeetingDurationWhereInputSchema';
import { MeetingDurationUpdateWithoutMeetingsInputSchema } from './MeetingDurationUpdateWithoutMeetingsInputSchema';
import { MeetingDurationUncheckedUpdateWithoutMeetingsInputSchema } from './MeetingDurationUncheckedUpdateWithoutMeetingsInputSchema';

export const MeetingDurationUpdateToOneWithWhereWithoutMeetingsInputSchema: z.ZodType<Prisma.MeetingDurationUpdateToOneWithWhereWithoutMeetingsInput> = z.object({
  where: z.lazy(() => MeetingDurationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => MeetingDurationUpdateWithoutMeetingsInputSchema),z.lazy(() => MeetingDurationUncheckedUpdateWithoutMeetingsInputSchema) ]),
}).strict();

export default MeetingDurationUpdateToOneWithWhereWithoutMeetingsInputSchema;
