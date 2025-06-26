import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateWithoutDurationConfigInputSchema } from './MeetingUpdateWithoutDurationConfigInputSchema';
import { MeetingUncheckedUpdateWithoutDurationConfigInputSchema } from './MeetingUncheckedUpdateWithoutDurationConfigInputSchema';

export const MeetingUpdateWithWhereUniqueWithoutDurationConfigInputSchema: z.ZodType<Prisma.MeetingUpdateWithWhereUniqueWithoutDurationConfigInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MeetingUpdateWithoutDurationConfigInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutDurationConfigInputSchema) ]),
}).strict();

export default MeetingUpdateWithWhereUniqueWithoutDurationConfigInputSchema;
