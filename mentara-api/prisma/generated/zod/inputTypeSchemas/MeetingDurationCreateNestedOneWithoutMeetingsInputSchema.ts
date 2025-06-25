import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingDurationCreateWithoutMeetingsInputSchema } from './MeetingDurationCreateWithoutMeetingsInputSchema';
import { MeetingDurationUncheckedCreateWithoutMeetingsInputSchema } from './MeetingDurationUncheckedCreateWithoutMeetingsInputSchema';
import { MeetingDurationCreateOrConnectWithoutMeetingsInputSchema } from './MeetingDurationCreateOrConnectWithoutMeetingsInputSchema';
import { MeetingDurationWhereUniqueInputSchema } from './MeetingDurationWhereUniqueInputSchema';

export const MeetingDurationCreateNestedOneWithoutMeetingsInputSchema: z.ZodType<Prisma.MeetingDurationCreateNestedOneWithoutMeetingsInput> = z.object({
  create: z.union([ z.lazy(() => MeetingDurationCreateWithoutMeetingsInputSchema),z.lazy(() => MeetingDurationUncheckedCreateWithoutMeetingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MeetingDurationCreateOrConnectWithoutMeetingsInputSchema).optional(),
  connect: z.lazy(() => MeetingDurationWhereUniqueInputSchema).optional()
}).strict();

export default MeetingDurationCreateNestedOneWithoutMeetingsInputSchema;
