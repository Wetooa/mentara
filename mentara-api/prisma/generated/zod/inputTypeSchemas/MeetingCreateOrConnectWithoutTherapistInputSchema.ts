import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingCreateWithoutTherapistInputSchema } from './MeetingCreateWithoutTherapistInputSchema';
import { MeetingUncheckedCreateWithoutTherapistInputSchema } from './MeetingUncheckedCreateWithoutTherapistInputSchema';

export const MeetingCreateOrConnectWithoutTherapistInputSchema: z.ZodType<Prisma.MeetingCreateOrConnectWithoutTherapistInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MeetingCreateWithoutTherapistInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default MeetingCreateOrConnectWithoutTherapistInputSchema;
