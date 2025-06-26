import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutMeetingInputSchema } from './ReviewCreateWithoutMeetingInputSchema';
import { ReviewUncheckedCreateWithoutMeetingInputSchema } from './ReviewUncheckedCreateWithoutMeetingInputSchema';

export const ReviewCreateOrConnectWithoutMeetingInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutMeetingInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutMeetingInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutMeetingInputSchema) ]),
}).strict();

export default ReviewCreateOrConnectWithoutMeetingInputSchema;
