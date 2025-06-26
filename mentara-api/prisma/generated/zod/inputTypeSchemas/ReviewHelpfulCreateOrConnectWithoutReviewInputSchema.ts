import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';
import { ReviewHelpfulCreateWithoutReviewInputSchema } from './ReviewHelpfulCreateWithoutReviewInputSchema';
import { ReviewHelpfulUncheckedCreateWithoutReviewInputSchema } from './ReviewHelpfulUncheckedCreateWithoutReviewInputSchema';

export const ReviewHelpfulCreateOrConnectWithoutReviewInputSchema: z.ZodType<Prisma.ReviewHelpfulCreateOrConnectWithoutReviewInput> = z.object({
  where: z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewHelpfulCreateWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutReviewInputSchema) ]),
}).strict();

export default ReviewHelpfulCreateOrConnectWithoutReviewInputSchema;
