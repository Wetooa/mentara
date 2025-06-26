import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateManyTherapistInputSchema } from './ReviewCreateManyTherapistInputSchema';

export const ReviewCreateManyTherapistInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyTherapistInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewCreateManyTherapistInputSchema),z.lazy(() => ReviewCreateManyTherapistInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReviewCreateManyTherapistInputEnvelopeSchema;
