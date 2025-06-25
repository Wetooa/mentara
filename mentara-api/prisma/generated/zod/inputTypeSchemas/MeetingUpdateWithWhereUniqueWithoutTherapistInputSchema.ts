import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateWithoutTherapistInputSchema } from './MeetingUpdateWithoutTherapistInputSchema';
import { MeetingUncheckedUpdateWithoutTherapistInputSchema } from './MeetingUncheckedUpdateWithoutTherapistInputSchema';

export const MeetingUpdateWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.MeetingUpdateWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MeetingUpdateWithoutTherapistInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutTherapistInputSchema) ]),
}).strict();

export default MeetingUpdateWithWhereUniqueWithoutTherapistInputSchema;
