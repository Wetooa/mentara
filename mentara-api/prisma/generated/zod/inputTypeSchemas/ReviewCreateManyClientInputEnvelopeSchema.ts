import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateManyClientInputSchema } from './ReviewCreateManyClientInputSchema';

export const ReviewCreateManyClientInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyClientInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewCreateManyClientInputSchema),z.lazy(() => ReviewCreateManyClientInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReviewCreateManyClientInputEnvelopeSchema;
