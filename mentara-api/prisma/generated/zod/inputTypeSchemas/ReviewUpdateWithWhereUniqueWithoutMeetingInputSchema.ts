import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutMeetingInputSchema } from './ReviewUpdateWithoutMeetingInputSchema';
import { ReviewUncheckedUpdateWithoutMeetingInputSchema } from './ReviewUncheckedUpdateWithoutMeetingInputSchema';

export const ReviewUpdateWithWhereUniqueWithoutMeetingInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutMeetingInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutMeetingInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutMeetingInputSchema) ]),
}).strict();

export default ReviewUpdateWithWhereUniqueWithoutMeetingInputSchema;
