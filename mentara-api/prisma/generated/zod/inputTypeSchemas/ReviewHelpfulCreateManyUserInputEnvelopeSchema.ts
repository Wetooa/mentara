import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulCreateManyUserInputSchema } from './ReviewHelpfulCreateManyUserInputSchema';

export const ReviewHelpfulCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ReviewHelpfulCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewHelpfulCreateManyUserInputSchema),z.lazy(() => ReviewHelpfulCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReviewHelpfulCreateManyUserInputEnvelopeSchema;
