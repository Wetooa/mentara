import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingCreateWithoutDurationConfigInputSchema } from './MeetingCreateWithoutDurationConfigInputSchema';
import { MeetingUncheckedCreateWithoutDurationConfigInputSchema } from './MeetingUncheckedCreateWithoutDurationConfigInputSchema';

export const MeetingCreateOrConnectWithoutDurationConfigInputSchema: z.ZodType<Prisma.MeetingCreateOrConnectWithoutDurationConfigInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MeetingCreateWithoutDurationConfigInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutDurationConfigInputSchema) ]),
}).strict();

export default MeetingCreateOrConnectWithoutDurationConfigInputSchema;
