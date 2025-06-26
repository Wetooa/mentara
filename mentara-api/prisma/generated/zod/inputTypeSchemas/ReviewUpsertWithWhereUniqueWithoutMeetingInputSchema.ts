import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutMeetingInputSchema } from './ReviewUpdateWithoutMeetingInputSchema';
import { ReviewUncheckedUpdateWithoutMeetingInputSchema } from './ReviewUncheckedUpdateWithoutMeetingInputSchema';
import { ReviewCreateWithoutMeetingInputSchema } from './ReviewCreateWithoutMeetingInputSchema';
import { ReviewUncheckedCreateWithoutMeetingInputSchema } from './ReviewUncheckedCreateWithoutMeetingInputSchema';

export const ReviewUpsertWithWhereUniqueWithoutMeetingInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutMeetingInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutMeetingInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutMeetingInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutMeetingInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutMeetingInputSchema) ]),
}).strict();

export default ReviewUpsertWithWhereUniqueWithoutMeetingInputSchema;
