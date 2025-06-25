import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingScalarWhereInputSchema } from './MeetingScalarWhereInputSchema';
import { MeetingUpdateManyMutationInputSchema } from './MeetingUpdateManyMutationInputSchema';
import { MeetingUncheckedUpdateManyWithoutClientInputSchema } from './MeetingUncheckedUpdateManyWithoutClientInputSchema';

export const MeetingUpdateManyWithWhereWithoutClientInputSchema: z.ZodType<Prisma.MeetingUpdateManyWithWhereWithoutClientInput> = z.object({
  where: z.lazy(() => MeetingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MeetingUpdateManyMutationInputSchema),z.lazy(() => MeetingUncheckedUpdateManyWithoutClientInputSchema) ]),
}).strict();

export default MeetingUpdateManyWithWhereWithoutClientInputSchema;
