import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingDurationCreateWithoutMeetingsInputSchema } from './MeetingDurationCreateWithoutMeetingsInputSchema';
import { MeetingDurationUncheckedCreateWithoutMeetingsInputSchema } from './MeetingDurationUncheckedCreateWithoutMeetingsInputSchema';
import { MeetingDurationCreateOrConnectWithoutMeetingsInputSchema } from './MeetingDurationCreateOrConnectWithoutMeetingsInputSchema';
import { MeetingDurationUpsertWithoutMeetingsInputSchema } from './MeetingDurationUpsertWithoutMeetingsInputSchema';
import { MeetingDurationWhereInputSchema } from './MeetingDurationWhereInputSchema';
import { MeetingDurationWhereUniqueInputSchema } from './MeetingDurationWhereUniqueInputSchema';
import { MeetingDurationUpdateToOneWithWhereWithoutMeetingsInputSchema } from './MeetingDurationUpdateToOneWithWhereWithoutMeetingsInputSchema';
import { MeetingDurationUpdateWithoutMeetingsInputSchema } from './MeetingDurationUpdateWithoutMeetingsInputSchema';
import { MeetingDurationUncheckedUpdateWithoutMeetingsInputSchema } from './MeetingDurationUncheckedUpdateWithoutMeetingsInputSchema';

export const MeetingDurationUpdateOneWithoutMeetingsNestedInputSchema: z.ZodType<Prisma.MeetingDurationUpdateOneWithoutMeetingsNestedInput> = z.object({
  create: z.union([ z.lazy(() => MeetingDurationCreateWithoutMeetingsInputSchema),z.lazy(() => MeetingDurationUncheckedCreateWithoutMeetingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MeetingDurationCreateOrConnectWithoutMeetingsInputSchema).optional(),
  upsert: z.lazy(() => MeetingDurationUpsertWithoutMeetingsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => MeetingDurationWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => MeetingDurationWhereInputSchema) ]).optional(),
  connect: z.lazy(() => MeetingDurationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => MeetingDurationUpdateToOneWithWhereWithoutMeetingsInputSchema),z.lazy(() => MeetingDurationUpdateWithoutMeetingsInputSchema),z.lazy(() => MeetingDurationUncheckedUpdateWithoutMeetingsInputSchema) ]).optional(),
}).strict();

export default MeetingDurationUpdateOneWithoutMeetingsNestedInputSchema;
