import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingScalarWhereInputSchema } from './MeetingScalarWhereInputSchema';
import { MeetingUpdateManyMutationInputSchema } from './MeetingUpdateManyMutationInputSchema';
import { MeetingUncheckedUpdateManyWithoutTherapistInputSchema } from './MeetingUncheckedUpdateManyWithoutTherapistInputSchema';

export const MeetingUpdateManyWithWhereWithoutTherapistInputSchema: z.ZodType<Prisma.MeetingUpdateManyWithWhereWithoutTherapistInput> = z.object({
  where: z.lazy(() => MeetingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MeetingUpdateManyMutationInputSchema),z.lazy(() => MeetingUncheckedUpdateManyWithoutTherapistInputSchema) ]),
}).strict();

export default MeetingUpdateManyWithWhereWithoutTherapistInputSchema;
