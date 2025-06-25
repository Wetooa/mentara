import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingScalarWhereInputSchema } from './MeetingScalarWhereInputSchema';
import { MeetingUpdateManyMutationInputSchema } from './MeetingUpdateManyMutationInputSchema';
import { MeetingUncheckedUpdateManyWithoutDurationConfigInputSchema } from './MeetingUncheckedUpdateManyWithoutDurationConfigInputSchema';

export const MeetingUpdateManyWithWhereWithoutDurationConfigInputSchema: z.ZodType<Prisma.MeetingUpdateManyWithWhereWithoutDurationConfigInput> = z.object({
  where: z.lazy(() => MeetingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MeetingUpdateManyMutationInputSchema),z.lazy(() => MeetingUncheckedUpdateManyWithoutDurationConfigInputSchema) ]),
}).strict();

export default MeetingUpdateManyWithWhereWithoutDurationConfigInputSchema;
