import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingCreateWithoutClientInputSchema } from './MeetingCreateWithoutClientInputSchema';
import { MeetingUncheckedCreateWithoutClientInputSchema } from './MeetingUncheckedCreateWithoutClientInputSchema';

export const MeetingCreateOrConnectWithoutClientInputSchema: z.ZodType<Prisma.MeetingCreateOrConnectWithoutClientInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MeetingCreateWithoutClientInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default MeetingCreateOrConnectWithoutClientInputSchema;
