import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateWithoutDurationConfigInputSchema } from './MeetingUpdateWithoutDurationConfigInputSchema';
import { MeetingUncheckedUpdateWithoutDurationConfigInputSchema } from './MeetingUncheckedUpdateWithoutDurationConfigInputSchema';
import { MeetingCreateWithoutDurationConfigInputSchema } from './MeetingCreateWithoutDurationConfigInputSchema';
import { MeetingUncheckedCreateWithoutDurationConfigInputSchema } from './MeetingUncheckedCreateWithoutDurationConfigInputSchema';

export const MeetingUpsertWithWhereUniqueWithoutDurationConfigInputSchema: z.ZodType<Prisma.MeetingUpsertWithWhereUniqueWithoutDurationConfigInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MeetingUpdateWithoutDurationConfigInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutDurationConfigInputSchema) ]),
  create: z.union([ z.lazy(() => MeetingCreateWithoutDurationConfigInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutDurationConfigInputSchema) ]),
}).strict();

export default MeetingUpsertWithWhereUniqueWithoutDurationConfigInputSchema;
