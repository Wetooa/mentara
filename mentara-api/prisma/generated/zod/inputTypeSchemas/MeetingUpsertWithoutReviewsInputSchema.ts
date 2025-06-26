import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingUpdateWithoutReviewsInputSchema } from './MeetingUpdateWithoutReviewsInputSchema';
import { MeetingUncheckedUpdateWithoutReviewsInputSchema } from './MeetingUncheckedUpdateWithoutReviewsInputSchema';
import { MeetingCreateWithoutReviewsInputSchema } from './MeetingCreateWithoutReviewsInputSchema';
import { MeetingUncheckedCreateWithoutReviewsInputSchema } from './MeetingUncheckedCreateWithoutReviewsInputSchema';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';

export const MeetingUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.MeetingUpsertWithoutReviewsInput> = z.object({
  update: z.union([ z.lazy(() => MeetingUpdateWithoutReviewsInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutReviewsInputSchema) ]),
  create: z.union([ z.lazy(() => MeetingCreateWithoutReviewsInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutReviewsInputSchema) ]),
  where: z.lazy(() => MeetingWhereInputSchema).optional()
}).strict();

export default MeetingUpsertWithoutReviewsInputSchema;
