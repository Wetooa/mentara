import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulCreateManyReviewInputSchema } from './ReviewHelpfulCreateManyReviewInputSchema';

export const ReviewHelpfulCreateManyReviewInputEnvelopeSchema: z.ZodType<Prisma.ReviewHelpfulCreateManyReviewInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewHelpfulCreateManyReviewInputSchema),z.lazy(() => ReviewHelpfulCreateManyReviewInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReviewHelpfulCreateManyReviewInputEnvelopeSchema;
