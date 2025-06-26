import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';
import { MeetingUpdateWithoutReviewsInputSchema } from './MeetingUpdateWithoutReviewsInputSchema';
import { MeetingUncheckedUpdateWithoutReviewsInputSchema } from './MeetingUncheckedUpdateWithoutReviewsInputSchema';

export const MeetingUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.MeetingUpdateToOneWithWhereWithoutReviewsInput> = z.object({
  where: z.lazy(() => MeetingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => MeetingUpdateWithoutReviewsInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutReviewsInputSchema) ]),
}).strict();

export default MeetingUpdateToOneWithWhereWithoutReviewsInputSchema;
