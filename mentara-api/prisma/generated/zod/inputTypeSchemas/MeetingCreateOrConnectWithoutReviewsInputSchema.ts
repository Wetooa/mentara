import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingCreateWithoutReviewsInputSchema } from './MeetingCreateWithoutReviewsInputSchema';
import { MeetingUncheckedCreateWithoutReviewsInputSchema } from './MeetingUncheckedCreateWithoutReviewsInputSchema';

export const MeetingCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.MeetingCreateOrConnectWithoutReviewsInput> = z.object({
  where: z.lazy(() => MeetingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MeetingCreateWithoutReviewsInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutReviewsInputSchema) ]),
}).strict();

export default MeetingCreateOrConnectWithoutReviewsInputSchema;
