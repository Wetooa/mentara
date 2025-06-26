import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';
import { ReviewHelpfulUpdateWithoutReviewInputSchema } from './ReviewHelpfulUpdateWithoutReviewInputSchema';
import { ReviewHelpfulUncheckedUpdateWithoutReviewInputSchema } from './ReviewHelpfulUncheckedUpdateWithoutReviewInputSchema';

export const ReviewHelpfulUpdateWithWhereUniqueWithoutReviewInputSchema: z.ZodType<Prisma.ReviewHelpfulUpdateWithWhereUniqueWithoutReviewInput> = z.object({
  where: z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewHelpfulUpdateWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulUncheckedUpdateWithoutReviewInputSchema) ]),
}).strict();

export default ReviewHelpfulUpdateWithWhereUniqueWithoutReviewInputSchema;
