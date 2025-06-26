import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateManyMeetingInputSchema } from './ReviewCreateManyMeetingInputSchema';

export const ReviewCreateManyMeetingInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyMeetingInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewCreateManyMeetingInputSchema),z.lazy(() => ReviewCreateManyMeetingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReviewCreateManyMeetingInputEnvelopeSchema;
