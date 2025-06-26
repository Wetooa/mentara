import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateWithoutTherapistInputSchema } from './MeetingUpdateWithoutTherapistInputSchema';
import { MeetingUncheckedUpdateWithoutTherapistInputSchema } from './MeetingUncheckedUpdateWithoutTherapistInputSchema';
import { MeetingCreateWithoutTherapistInputSchema } from './MeetingCreateWithoutTherapistInputSchema';
import { MeetingUncheckedCreateWithoutTherapistInputSchema } from './MeetingUncheckedCreateWithoutTherapistInputSchema';

export const MeetingUpsertWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.MeetingUpsertWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MeetingUpdateWithoutTherapistInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutTherapistInputSchema) ]),
  create: z.union([ z.lazy(() => MeetingCreateWithoutTherapistInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default MeetingUpsertWithWhereUniqueWithoutTherapistInputSchema;
