import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutReviewsInputSchema } from './MeetingCreateWithoutReviewsInputSchema';
import { MeetingUncheckedCreateWithoutReviewsInputSchema } from './MeetingUncheckedCreateWithoutReviewsInputSchema';
import { MeetingCreateOrConnectWithoutReviewsInputSchema } from './MeetingCreateOrConnectWithoutReviewsInputSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';

export const MeetingCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.MeetingCreateNestedOneWithoutReviewsInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutReviewsInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MeetingCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => MeetingWhereUniqueInputSchema).optional()
}).strict();

export default MeetingCreateNestedOneWithoutReviewsInputSchema;
