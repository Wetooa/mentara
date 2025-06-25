import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateWithoutClientInputSchema } from './MeetingUpdateWithoutClientInputSchema';
import { MeetingUncheckedUpdateWithoutClientInputSchema } from './MeetingUncheckedUpdateWithoutClientInputSchema';

export const MeetingUpdateWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.MeetingUpdateWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MeetingUpdateWithoutClientInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutClientInputSchema) ]),
}).strict();

export default MeetingUpdateWithWhereUniqueWithoutClientInputSchema;
