import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';
import { ReviewUpdateManyMutationInputSchema } from './ReviewUpdateManyMutationInputSchema';
import { ReviewUncheckedUpdateManyWithoutMeetingInputSchema } from './ReviewUncheckedUpdateManyWithoutMeetingInputSchema';

export const ReviewUpdateManyWithWhereWithoutMeetingInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutMeetingInput> = z.object({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema),z.lazy(() => ReviewUncheckedUpdateManyWithoutMeetingInputSchema) ]),
}).strict();

export default ReviewUpdateManyWithWhereWithoutMeetingInputSchema;
