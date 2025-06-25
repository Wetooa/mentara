import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateWithoutClientInputSchema } from './MeetingUpdateWithoutClientInputSchema';
import { MeetingUncheckedUpdateWithoutClientInputSchema } from './MeetingUncheckedUpdateWithoutClientInputSchema';
import { MeetingCreateWithoutClientInputSchema } from './MeetingCreateWithoutClientInputSchema';
import { MeetingUncheckedCreateWithoutClientInputSchema } from './MeetingUncheckedCreateWithoutClientInputSchema';

export const MeetingUpsertWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.MeetingUpsertWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MeetingUpdateWithoutClientInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutClientInputSchema) ]),
  create: z.union([ z.lazy(() => MeetingCreateWithoutClientInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default MeetingUpsertWithWhereUniqueWithoutClientInputSchema;
